import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../../utils/logger';
import {
  NotificationSystem,
  NotificationChannel,
  Notification,
  NotificationStatus,
  NotificationTemplate,
  Alert,
  AlertSeverity
} from './types';

export class NotificationSystemImpl extends EventEmitter implements NotificationSystem {
  private channels: Map<string, NotificationChannel> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private notificationHistory: Notification[] = [];
  private logger: Logger;
  private dataDirectory: string;
  private retryQueue: Notification[] = [];
  private maxRetries: number = 3;
  private retryInterval: number = 5 * 60 * 1000;
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(logger: Logger, dataDirectory: string = './data/monitoring') {
    super();
    this.logger = logger;
    this.dataDirectory = dataDirectory;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.ensureDataDirectory();
      await this.loadChannels();
      await this.loadTemplates();
      await this.loadNotifications();
      this.startRetryTimer();
      this.logger.info('通知系统初始化完成', { 
        channelsCount: this.channels.size,
        templatesCount: this.templates.size,
        notificationsCount: this.notifications.size 
      });
    } catch (error) {
      this.logger.error('通知系统初始化失败', error as Error);
      throw error;
    }
  }

  private async ensureDataDirectory(): Promise<void> {
    const dirs = [
      this.dataDirectory,
      path.join(this.dataDirectory, 'notifications'),
      path.join(this.dataDirectory, 'channels'),
      path.join(this.dataDirectory, 'templates')
    ];
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  private async loadChannels(): Promise<void> {
    try {
      const channelsDir = path.join(this.dataDirectory, 'channels');
      const files = await fs.readdir(channelsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(channelsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const channel = JSON.parse(content) as NotificationChannel;
          this.channels.set(channel.id, channel);
        }
      }
      
      this.logger.info('加载通知渠道', { count: this.channels.size });
    } catch (error) {
      this.logger.warn('加载通知渠道失败', error as Error);
    }
  }

  private async loadTemplates(): Promise<void> {
    try {
      const templatesDir = path.join(this.dataDirectory, 'templates');
      const files = await fs.readdir(templatesDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(templatesDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const template = JSON.parse(content) as NotificationTemplate;
          this.templates.set(template.id, template);
        }
      }
      
      this.logger.info('加载通知模板', { count: this.templates.size });
    } catch (error) {
      this.logger.warn('加载通知模板失败', error as Error);
    }
  }

  private async loadNotifications(): Promise<void> {
    try {
      const notificationsDir = path.join(this.dataDirectory, 'notifications');
      const files = await fs.readdir(notificationsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(notificationsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const notification = JSON.parse(content) as Notification;
          this.notifications.set(notification.id, notification);
          this.notificationHistory.push(notification);
        }
      }
      
      this.notificationHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.logger.info('加载历史通知', { count: this.notifications.size });
    } catch (error) {
      this.logger.warn('加载历史通知失败', error as Error);
    }
  }

  async addChannel(channel: NotificationChannel): Promise<NotificationChannel> {
    this.logger.info('添加通知渠道', { channelId: channel.id, type: channel.type });
    
    if (this.channels.has(channel.id)) {
      throw new Error(`通知渠道 ${channel.id} 已存在`);
    }

    channel.createdAt = new Date();
    channel.updatedAt = new Date();
    channel.enabled = channel.enabled ?? true;
    
    this.channels.set(channel.id, channel);
    await this.saveChannel(channel);
    
    this.emit('channel:added', channel);
    this.logger.info('通知渠道添加成功', { channelId: channel.id });
    
    return channel;
  }

  async updateChannel(channelId: string, channel: Partial<NotificationChannel>): Promise<NotificationChannel> {
    this.logger.info('更新通知渠道', { channelId });
    
    const existingChannel = this.channels.get(channelId);
    if (!existingChannel) {
      throw new Error(`通知渠道 ${channelId} 不存在`);
    }

    const updatedChannel = {
      ...existingChannel,
      ...channel,
      id: channelId,
      updatedAt: new Date()
    };
    
    this.channels.set(channelId, updatedChannel);
    await this.saveChannel(updatedChannel);
    
    this.emit('channel:updated', updatedChannel);
    this.logger.info('通知渠道更新成功', { channelId });
    
    return updatedChannel;
  }

  async removeChannel(channelId: string): Promise<void> {
    this.logger.info('移除通知渠道', { channelId });
    
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`通知渠道 ${channelId} 不存在`);
    }

    this.channels.delete(channelId);
    
    try {
      const filePath = path.join(this.dataDirectory, 'channels', `${channelId}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn('删除通知渠道文件失败', error as Error);
    }
    
    this.emit('channel:removed', channel);
    this.logger.info('通知渠道移除成功', { channelId });
  }

  async addTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    this.logger.info('添加通知模板', { templateId: template.id, name: template.name });
    
    if (this.templates.has(template.id)) {
      throw new Error(`通知模板 ${template.id} 已存在`);
    }

    template.createdAt = new Date();
    template.updatedAt = new Date();
    
    this.templates.set(template.id, template);
    await this.saveTemplate(template);
    
    this.emit('template:added', template);
    this.logger.info('通知模板添加成功', { templateId: template.id });
    
    return template;
  }

  async updateTemplate(templateId: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    this.logger.info('更新通知模板', { templateId });
    
    const existingTemplate = this.templates.get(templateId);
    if (!existingTemplate) {
      throw new Error(`通知模板 ${templateId} 不存在`);
    }

    const updatedTemplate = {
      ...existingTemplate,
      ...template,
      id: templateId,
      updatedAt: new Date()
    };
    
    this.templates.set(templateId, updatedTemplate);
    await this.saveTemplate(updatedTemplate);
    
    this.emit('template:updated', updatedTemplate);
    this.logger.info('通知模板更新成功', { templateId });
    
    return updatedTemplate;
  }

  async removeTemplate(templateId: string): Promise<void> {
    this.logger.info('移除通知模板', { templateId });
    
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`通知模板 ${templateId} 不存在`);
    }

    this.templates.delete(templateId);
    
    try {
      const filePath = path.join(this.dataDirectory, 'templates', `${templateId}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn('删除通知模板文件失败', error as Error);
    }
    
    this.emit('template:removed', template);
    this.logger.info('通知模板移除成功', { templateId });
  }

  async sendNotification(notification: Notification): Promise<Notification> {
    this.logger.info('发送通知', { notificationId: notification.id, channelId: notification.channelId });
    
    const channel = this.channels.get(notification.channelId);
    if (!channel) {
      throw new Error(`通知渠道 ${notification.channelId} 不存在`);
    }

    if (!channel.enabled) {
      throw new Error(`通知渠道 ${notification.channelId} 未启用`);
    }

    notification.status = NotificationStatus.SENDING;
    notification.sentAt = new Date();
    notification.updatedAt = new Date();
    
    try {
      await this.sendToChannel(channel, notification);
      
      notification.status = NotificationStatus.SENT;
      notification.deliveredAt = new Date();
      
      this.notifications.set(notification.id, notification);
      this.notificationHistory.push(notification);
      await this.saveNotification(notification);
      
      this.emit('notification:sent', notification);
      this.logger.info('通知发送成功', { notificationId: notification.id });
      
      return notification;
    } catch (error) {
      notification.status = NotificationStatus.FAILED;
      notification.error = (error as Error).message;
      notification.retryCount = (notification.retryCount || 0) + 1;
      notification.updatedAt = new Date();
      
      this.notifications.set(notification.id, notification);
      this.notificationHistory.push(notification);
      await this.saveNotification(notification);
      
      if (notification.retryCount < this.maxRetries) {
        this.retryQueue.push(notification);
        this.logger.warn('通知发送失败，加入重试队列', { 
          notificationId: notification.id, 
          retryCount: notification.retryCount,
          error: notification.error 
        });
      } else {
        this.logger.error('通知发送失败，超过最大重试次数', error as Error, { 
          notificationId: notification.id,
          retryCount: notification.retryCount 
        });
      }
      
      this.emit('notification:failed', notification);
      throw error;
    }
  }

  async sendAlertNotification(alert: Alert, channelIds: string[]): Promise<Notification[]> {
    this.logger.info('发送告警通知', { alertId: alert.id, channelIds });
    
    const notifications: Notification[] = [];
    
    for (const channelId of channelIds) {
      const channel = this.channels.get(channelId);
      if (!channel || !channel.enabled) {
        this.logger.warn('通知渠道不可用', { channelId });
        continue;
      }

      const template = this.templates.get(alert.severity);
      const notification: Notification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        channelId: channelId,
        templateId: alert.severity,
        type: 'alert',
        title: template?.title || `告警: ${alert.ruleName}`,
        content: this.renderTemplate(template, alert),
        status: NotificationStatus.PENDING,
        recipients: channel.recipients,
        metadata: {
          alertId: alert.id,
          ruleId: alert.ruleId,
          severity: alert.severity,
          metricName: alert.metricName,
          metricValue: alert.metricValue
        },
        timestamp: new Date(),
        createdAt: new Date()
      };

      try {
        const sentNotification = await this.sendNotification(notification);
        notifications.push(sentNotification);
      } catch (error) {
        this.logger.error('发送告警通知失败', error as Error, { 
          notificationId: notification.id,
          channelId 
        });
      }
    }
    
    return notifications;
  }

  private renderTemplate(template: NotificationTemplate | undefined, alert: Alert): string {
    if (!template) {
      return `告警规则 ${alert.ruleName} 触发\n严重程度: ${alert.severity}\n指标: ${alert.metricName}\n值: ${alert.metricValue}\n时间: ${alert.timestamp.toLocaleString('zh-CN')}`;
    }

    let content = template.content;
    
    content = content.replace(/\{\{ruleName\}\}/g, alert.ruleName);
    content = content.replace(/\{\{severity\}\}/g, alert.severity);
    content = content.replace(/\{\{metricName\}\}/g, alert.metricName);
    content = content.replace(/\{\{metricValue\}\}/g, String(alert.metricValue));
    content = content.replace(/\{\{timestamp\}\}/g, alert.timestamp.toLocaleString('zh-CN'));
    content = content.replace(/\{\{message\}\}/g, alert.message);
    
    if (alert.labels) {
      for (const [key, value] of Object.entries(alert.labels)) {
        content = content.replace(new RegExp(`\\{\\{label:${key}\\}\\}`, 'g'), String(value));
      }
    }
    
    return content;
  }

  private async sendToChannel(channel: NotificationChannel, notification: Notification): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmail(channel, notification);
        break;
      case 'sms':
        await this.sendSMS(channel, notification);
        break;
      case 'webhook':
        await this.sendWebhook(channel, notification);
        break;
      case 'slack':
        await this.sendSlack(channel, notification);
        break;
      default:
        throw new Error(`不支持的通知渠道类型: ${channel.type}`);
    }
  }

  private async sendEmail(channel: NotificationChannel, notification: Notification): Promise<void> {
    this.logger.info('发送邮件通知', { 
      notificationId: notification.id,
      recipients: notification.recipients 
    });
    
    const config = channel.config as any;
    
    if (!config.smtp || !config.smtp.host) {
      throw new Error('邮件配置不完整');
    }

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport(config.smtp);
    
    const mailOptions = {
      from: config.from,
      to: notification.recipients.join(','),
      subject: notification.title,
      text: notification.content,
      html: notification.content.replace(/\n/g, '<br>')
    };
    
    await transporter.sendMail(mailOptions);
  }

  private async sendSMS(channel: NotificationChannel, notification: Notification): Promise<void> {
    this.logger.info('发送短信通知', { 
      notificationId: notification.id,
      recipients: notification.recipients 
    });
    
    const config = channel.config as any;
    
    if (!config.apiKey || !config.apiUrl) {
      throw new Error('短信配置不完整');
    }

    const axios = require('axios');
    
    for (const recipient of notification.recipients) {
      await axios.post(config.apiUrl, {
        apiKey: config.apiKey,
        phone: recipient,
        message: notification.content
      });
    }
  }

  private async sendWebhook(channel: NotificationChannel, notification: Notification): Promise<void> {
    this.logger.info('发送Webhook通知', { 
      notificationId: notification.id,
      url: channel.config.url 
    });
    
    const config = channel.config as any;
    
    if (!config.url) {
      throw new Error('Webhook配置不完整');
    }

    const axios = require('axios');
    
    await axios.post(config.url, {
      notification: notification,
      headers: config.headers || {}
    });
  }

  private async sendSlack(channel: NotificationChannel, notification: Notification): Promise<void> {
    this.logger.info('发送Slack通知', { 
      notificationId: notification.id,
      webhookUrl: channel.config.webhookUrl 
    });
    
    const config = channel.config as any;
    
    if (!config.webhookUrl) {
      throw new Error('Slack配置不完整');
    }

    const axios = require('axios');
    
    const color = this.getSlackColor(notification.metadata?.severity);
    
    await axios.post(config.webhookUrl, {
      attachments: [
        {
          color: color,
          title: notification.title,
          text: notification.content,
          footer: 'YYC³ 监控系统',
          ts: Math.floor(notification.timestamp.getTime() / 1000)
        }
      ]
    });
  }

  private getSlackColor(severity?: string): string {
    switch (severity) {
      case AlertSeverity.INFO:
        return '#36a64f';
      case AlertSeverity.WARNING:
        return '#ff9900';
      case AlertSeverity.ERROR:
        return '#ff0000';
      case AlertSeverity.CRITICAL:
        return '#990000';
      default:
        return '#cccccc';
    }
  }

  private startRetryTimer(): void {
    this.retryTimer = setInterval(() => {
      this.processRetryQueue();
    }, this.retryInterval);
  }

  private async processRetryQueue(): Promise<void> {
    if (this.retryQueue.length === 0) {
      return;
    }

    this.logger.info('处理重试队列', { count: this.retryQueue.length });
    
    const queue = [...this.retryQueue];
    this.retryQueue = [];
    
    for (const notification of queue) {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        this.logger.error('重试发送通知失败', error as Error, { 
          notificationId: notification.id 
        });
      }
    }
  }

  getNotificationHistory(limit: number = 100): Notification[] {
    return this.notificationHistory.slice(0, limit);
  }

  getChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  async shutdown(): Promise<void> {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
    
    await this.processRetryQueue();
    this.logger.info('通知系统已关闭');
  }
}
