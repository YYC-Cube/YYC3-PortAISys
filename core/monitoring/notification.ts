import EventEmitter from 'eventemitter3';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../utils/logger';
import {
  NotificationSystem,
  NotificationChannel,
  NotificationChannelConfig,
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
  NotificationTemplate,
  Alert,
  AlertSeverity,
  NotificationStatistics,
  NotificationStatisticsQuery,
  NotificationQuery
} from './types';

export class NotificationSystemImpl extends EventEmitter implements NotificationSystem {
  private channels: Map<string, NotificationChannelConfig> = new Map();
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
      this.logger.info('通知系统初始化完成', 'NotificationSystem', {
        channelsCount: this.channels.size,
        templatesCount: this.templates.size,
        notificationsCount: this.notifications.size
      });
    } catch (error) {
      this.logger.error('通知系统初始化失败', 'NotificationSystem', undefined, error as Error);
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
          const channel = JSON.parse(content) as NotificationChannelConfig;
          this.channels.set(channel.id, channel);
        }
      }

      this.logger.info('加载通知渠道', 'NotificationSystem', { count: this.channels.size });
    } catch (error) {
      this.logger.warn('加载通知渠道失败', 'NotificationSystem', undefined, error as Error);
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

      this.logger.info('加载通知模板', 'NotificationSystem', { count: this.templates.size });
    } catch (error) {
      this.logger.warn('加载通知模板失败', 'NotificationSystem', undefined, error as Error);
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

      this.notificationHistory.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
      this.logger.info('加载历史通知', 'NotificationSystem', { count: this.notifications.size });
    } catch (error) {
      this.logger.warn('加载历史通知失败', 'NotificationSystem', undefined, error as Error);
    }
  }

  async addChannel(channel: NotificationChannelConfig): Promise<NotificationChannelConfig> {
    this.logger.info('添加通知渠道', 'NotificationSystem', { channelId: channel.id, type: channel.type });

    if (this.channels.has(channel.id)) {
      throw new Error(`通知渠道 ${channel.id} 已存在`);
    }

    channel.createdAt = new Date();
    channel.updatedAt = new Date();
    channel.enabled = channel.enabled ?? true;

    this.channels.set(channel.id, channel);
    await this.saveChannel(channel);

    this.emit('channel:added', channel);
    this.logger.info('通知渠道添加成功', 'NotificationSystem', { channelId: channel.id });

    return channel;
  }

  async updateChannel(channelId: string, channel: Partial<NotificationChannelConfig>): Promise<NotificationChannelConfig> {
    this.logger.info('更新通知渠道', 'NotificationSystem', { channelId });

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
    this.logger.info('通知渠道更新成功', 'NotificationSystem', { channelId });

    return updatedChannel;
  }

  async removeChannel(channelId: string): Promise<void> {
    this.logger.info('移除通知渠道', 'NotificationSystem', { channelId });

    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`通知渠道 ${channelId} 不存在`);
    }

    this.channels.delete(channelId);

    try {
      const filePath = path.join(this.dataDirectory, 'channels', `${channelId}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn('删除通知渠道文件失败', 'NotificationSystem', undefined, error as Error);
    }

    this.emit('channel:removed', channel);
    this.logger.info('通知渠道移除成功', 'NotificationSystem', { channelId });
  }

  async addTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    this.logger.info('添加通知模板', 'NotificationSystem', { templateId: template.id, name: template.name });

    if (this.templates.has(template.id)) {
      throw new Error(`通知模板 ${template.id} 已存在`);
    }

    template.createdAt = new Date();
    template.updatedAt = new Date();

    this.templates.set(template.id, template);
    await this.saveTemplate(template);

    this.emit('template:added', template);
    this.logger.info('通知模板添加成功', 'NotificationSystem', { templateId: template.id });

    return template;
  }

  async updateTemplate(templateId: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    this.logger.info('更新通知模板', 'NotificationSystem', { templateId });

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
    this.logger.info('通知模板更新成功', 'NotificationSystem', { templateId });

    return updatedTemplate;
  }

  async removeTemplate(templateId: string): Promise<void> {
    this.logger.info('移除通知模板', 'NotificationSystem', { templateId });

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`通知模板 ${templateId} 不存在`);
    }

    this.templates.delete(templateId);

    try {
      const filePath = path.join(this.dataDirectory, 'templates', `${templateId}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn('删除通知模板文件失败', 'NotificationSystem', undefined, error as Error);
    }

    this.emit('template:removed', template);
    this.logger.info('通知模板移除成功', 'NotificationSystem', { templateId });
  }

  async sendNotification(notification: Notification): Promise<void> {
    this.logger.info('发送通知', 'NotificationSystem', { notificationId: notification.id, channel: notification.channel });

    const channel = this.channels.get(notification.channel);
    if (!channel) {
      throw new Error(`通知渠道 ${notification.channel} 不存在`);
    }

    if (!channel.enabled) {
      throw new Error(`通知渠道 ${notification.channel} 未启用`);
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
      this.logger.info('通知发送成功', 'NotificationSystem', { notificationId: notification.id });
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
        this.logger.warn('通知发送失败，加入重试队列', 'NotificationSystem', {
          notificationId: notification.id,
          retryCount: notification.retryCount,
          error: notification.error
        });
      } else {
        this.logger.error('通知发送失败，超过最大重试次数', 'NotificationSystem', {
          notificationId: notification.id,
          retryCount: notification.retryCount
        }, error as Error);
      }

      this.emit('notification:failed', notification);
      throw error;
    }
  }

  async sendAlertNotification(alert: Alert, channelIds: string[]): Promise<Notification[]> {
    this.logger.info('发送告警通知', 'NotificationSystem', { alertId: alert.id, channelIds });

    const notifications: Notification[] = [];

    for (const channelId of channelIds) {
      const channel = this.channels.get(channelId);
      if (!channel || !channel.enabled) {
        this.logger.warn('通知渠道不可用', 'NotificationSystem', { channelId });
        continue;
      }

      const template = this.templates.get(alert.severity);
      const notification: Notification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        channel: channel.type,
        type: NotificationType.ALERT,
        title: template?.title || `告警: ${alert.ruleName}`,
        content: this.renderTemplate(template, alert),
        status: NotificationStatus.PENDING,
        recipients: channel.recipients || [],
        priority: NotificationPriority.HIGH,
        retryCount: 0,
        maxRetries: this.maxRetries,
        metadata: {
          alertId: alert.id,
          ruleId: alert.ruleId,
          severity: alert.severity,
          metricName: alert.metricName,
          metricValue: alert.metricValue
        },
        timestamp: new Date(),
        updatedAt: new Date()
      };

      try {
        await this.sendNotification(notification);
        notifications.push(notification);
      } catch (error) {
        this.logger.error('发送告警通知失败', 'NotificationSystem', {
          notificationId: notification.id,
          channelId
        }, error as Error);
      }
    }

    return notifications;
  }

  private renderTemplate(template: NotificationTemplate | undefined, alert: Alert): string {
    if (!template) {
      return `告警规则 ${alert.ruleName} 触发\n严重程度: ${alert.severity}\n指标: ${alert.metricName}\n值: ${alert.metricValue}\n时间: ${alert.timestamp.toLocaleString('zh-CN')}`;
    }

    let content = template?.content || '';

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

  private async sendToChannel(channel: NotificationChannelConfig, notification: Notification): Promise<void> {
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

  private async sendEmail(channel: NotificationChannelConfig, notification: Notification): Promise<void> {
    this.logger.info('发送邮件通知', 'NotificationSystem', {
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

  private async sendSMS(channel: NotificationChannelConfig, notification: Notification): Promise<void> {
    this.logger.info('发送短信通知', 'NotificationSystem', {
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

  private async sendWebhook(channel: NotificationChannelConfig, notification: Notification): Promise<void> {
    this.logger.info('发送Webhook通知', 'NotificationSystem', {
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

  private async sendSlack(channel: NotificationChannelConfig, notification: Notification): Promise<void> {
    this.logger.info('发送Slack通知', 'NotificationSystem', {
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
          ts: Math.floor((notification.timestamp?.getTime() || 0) / 1000)
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

    this.logger.info('处理重试队列', 'NotificationSystem', { count: this.retryQueue.length });

    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const notification of queue) {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        this.logger.error('重试发送通知失败', 'NotificationSystem', {
          notificationId: notification.id
        }, error as Error);
      }
    }
  }

  async getNotificationHistory(query: NotificationQuery): Promise<Notification[]> {
    let filtered = this.notificationHistory;

    if (query.type) {
      filtered = filtered.filter(n => n.type === query.type);
    }
    if (query.channel) {
      filtered = filtered.filter(n => n.channel === query.channel);
    }
    if (query.status) {
      filtered = filtered.filter(n => n.status === query.status);
    }
    if (query.startTime) {
      filtered = filtered.filter(n => {
        const notificationTime = n.timestamp || n.sentAt || new Date();
        return notificationTime >= query.startTime!;
      });
    }
    if (query.endTime) {
      filtered = filtered.filter(n => {
        const notificationTime = n.timestamp || n.sentAt || new Date();
        return notificationTime <= query.endTime!;
      });
    }

    if (query.pagination) {
      const { page = 1, pageSize = 100 } = query.pagination;
      const start = (page - 1) * pageSize;
      return filtered.slice(start, start + pageSize);
    }

    return filtered;
  }

  getChannels(): NotificationChannelConfig[] {
    return Array.from(this.channels.values());
  }

  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  private async saveChannel(channel: NotificationChannelConfig): Promise<void> {
    try {
      const channelsDir = path.join(this.dataDirectory, 'channels');
      await fs.mkdir(channelsDir, { recursive: true });
      const filePath = path.join(channelsDir, `${channel.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(channel, null, 2));
    } catch (error) {
      this.logger.warn('保存通知渠道失败', 'NotificationSystem', undefined, error as Error);
    }
  }

  private async saveTemplate(template: NotificationTemplate): Promise<void> {
    try {
      const templatesDir = path.join(this.dataDirectory, 'templates');
      await fs.mkdir(templatesDir, { recursive: true });
      const filePath = path.join(templatesDir, `${template.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(template, null, 2));
    } catch (error) {
      this.logger.warn('保存通知模板失败', 'NotificationSystem', undefined, error as Error);
    }
  }

  private async saveNotification(notification: Notification): Promise<void> {
    try {
      const notificationsDir = path.join(this.dataDirectory, 'notifications');
      await fs.mkdir(notificationsDir, { recursive: true });
      const filePath = path.join(notificationsDir, `${notification.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(notification, null, 2));
    } catch (error) {
      this.logger.warn('保存通知失败', 'NotificationSystem', undefined, error as Error);
    }
  }

  async sendNotifications(notifications: Notification[]): Promise<void> {
    this.logger.info('批量发送通知', 'NotificationSystem', { count: notifications.length });

    const promises = notifications.map(notification => this.sendNotification(notification));
    await Promise.all(promises);

    this.logger.info('批量通知发送完成', 'NotificationSystem', { count: notifications.length });
  }

  async getNotificationStatistics(query: NotificationStatisticsQuery): Promise<NotificationStatistics> {
    const history = this.notificationHistory.filter(n => {
      const notificationTime = n.timestamp || n.sentAt || new Date();
      return notificationTime >= query.startTime && notificationTime <= query.endTime;
    });

    const total = history.length;
    const success = history.filter(n => n.status === NotificationStatus.SENT).length;
    const failed = history.filter(n => n.status === NotificationStatus.FAILED).length;
    const successRate = total > 0 ? (success / total) * 100 : 0;

    const byChannel: Record<NotificationChannel, number> = {
      [NotificationChannel.EMAIL]: 0,
      [NotificationChannel.SMS]: 0,
      [NotificationChannel.WEBHOOK]: 0,
      [NotificationChannel.SLACK]: 0,
      [NotificationChannel.DINGTALK]: 0,
      [NotificationChannel.WEWORK]: 0
    };

    const byType: Record<NotificationType, number> = {
      [NotificationType.ALERT]: 0,
      [NotificationType.REPORT]: 0,
      [NotificationType.SYSTEM]: 0,
      [NotificationType.CUSTOM]: 0
    };

    for (const notification of history) {
      const channel = notification.channel as NotificationChannel;
      const type = notification.type as NotificationType;
      if (byChannel[channel] !== undefined) {
        byChannel[channel]++;
      }
      if (byType[type] !== undefined) {
        byType[type]++;
      }
    }

    return {
      total,
      success,
      failed,
      successRate,
      byChannel,
      byType
    };
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
