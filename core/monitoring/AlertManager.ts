import EventEmitter from 'eventemitter3';
import { logger } from '../utils/logger';

export interface Alert {
  id: string;
  type: 'performance' | 'security' | 'availability' | 'capacity';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  type: Alert['type'];
  condition: (data: any) => boolean;
  severity: Alert['severity'];
  enabled: boolean;
  cooldown: number;
  lastTriggered?: number;
}

export interface AlertChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AlertNotification {
  alert: Alert;
  channel: AlertChannel;
  sent: boolean;
  sentAt?: number;
  error?: string;
}

export class AlertManager extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private channels: Map<string, AlertChannel> = new Map();
  private notifications: AlertNotification[] = [];
  private escalationRules: Map<string, string[]> = new Map();

  constructor() {
    super();
    this.initializeDefaultRules();
    this.initializeDefaultChannels();
    this.startEscalationCheck();
  }

  private initializeDefaultRules(): void {
    this.addRule({
      id: 'cpu-high',
      name: 'High CPU Usage',
      type: 'performance',
      condition: (data) => data.metric === 'cpu' && data.value > 80,
      severity: 'warning',
      enabled: true,
      cooldown: 300000,
    });

    this.addRule({
      id: 'cpu-critical',
      name: 'Critical CPU Usage',
      type: 'performance',
      condition: (data) => data.metric === 'cpu' && data.value > 95,
      severity: 'critical',
      enabled: true,
      cooldown: 60000,
    });

    this.addRule({
      id: 'memory-high',
      name: 'High Memory Usage',
      type: 'performance',
      condition: (data) => data.metric === 'memory' && data.value > 80,
      severity: 'warning',
      enabled: true,
      cooldown: 300000,
    });

    this.addRule({
      id: 'memory-critical',
      name: 'Critical Memory Usage',
      type: 'performance',
      condition: (data) => data.metric === 'memory' && data.value > 95,
      severity: 'critical',
      enabled: true,
      cooldown: 60000,
    });

    this.addRule({
      id: 'api-slow',
      name: 'Slow API Response',
      type: 'performance',
      condition: (data) => data.metric === 'api' && data.value > 500,
      severity: 'warning',
      enabled: true,
      cooldown: 300000,
    });

    this.addRule({
      id: 'api-critical',
      name: 'Critical API Response',
      type: 'performance',
      condition: (data) => data.metric === 'api' && data.value > 2000,
      severity: 'critical',
      enabled: true,
      cooldown: 60000,
    });

    this.addRule({
      id: 'database-slow',
      name: 'Slow Database Query',
      type: 'performance',
      condition: (data) => data.metric === 'database' && data.value > 100,
      severity: 'warning',
      enabled: true,
      cooldown: 300000,
    });

    this.addRule({
      id: 'database-critical',
      name: 'Critical Database Query',
      type: 'performance',
      condition: (data) => data.metric === 'database' && data.value > 500,
      severity: 'critical',
      enabled: true,
      cooldown: 60000,
    });
  }

  private initializeDefaultChannels(): void {
    this.addChannel({
      id: 'console',
      type: 'webhook',
      config: { url: 'console://output' },
      enabled: true,
    });
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    this.emit('rule-added', rule);
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.emit('rule-removed', ruleId);
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates });
      this.emit('rule-updated', { id: ruleId, rule: this.rules.get(ruleId) });
    }
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId);
  }

  addChannel(channel: AlertChannel): void {
    this.channels.set(channel.id, channel);
    this.emit('channel-added', channel);
  }

  removeChannel(channelId: string): void {
    this.channels.delete(channelId);
    this.emit('channel-removed', channelId);
  }

  updateChannel(channelId: string, updates: Partial<AlertChannel>): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      this.channels.set(channelId, { ...channel, ...updates });
      this.emit('channel-updated', { id: channelId, channel: this.channels.get(channelId) });
    }
  }

  getChannels(): AlertChannel[] {
    return Array.from(this.channels.values());
  }

  getChannel(channelId: string): AlertChannel | undefined {
    return this.channels.get(channelId);
  }

  addEscalationRule(alertId: string, escalationPath: string[]): void {
    this.escalationRules.set(alertId, escalationPath);
  }

  removeEscalationRule(alertId: string): void {
    this.escalationRules.delete(alertId);
  }

  checkRules(data: any): Alert[] {
    const triggeredAlerts: Alert[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) {
        continue;
      }

      if (rule.lastTriggered && Date.now() - rule.lastTriggered < rule.cooldown) {
        continue;
      }

      if (rule.condition(data)) {
        const alert = this.createAlert(rule, data);
        this.alerts.set(alert.id, alert);
        rule.lastTriggered = Date.now();
        triggeredAlerts.push(alert);

        this.emit('alert-triggered', alert);
        this.sendNotifications(alert);
      }
    }

    return triggeredAlerts;
  }

  private createAlert(rule: AlertRule, data: any): Alert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message: this.generateAlertMessage(rule, data),
      source: data.source || 'system',
      timestamp: Date.now(),
      acknowledged: false,
      tags: data.tags,
      metadata: data,
    };
  }

  private generateAlertMessage(rule: AlertRule, data: any): string {
    switch (rule.type) {
      case 'performance':
        return `${rule.name}: ${data.metric} is ${data.value}${data.unit || ''}`;
      case 'security':
        return `${rule.name}: ${data.message}`;
      case 'availability':
        return `${rule.name}: Service is ${data.status}`;
      case 'capacity':
        return `${rule.name}: ${data.resource} usage is ${data.value}%`;
      default:
        return rule.name;
    }
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = Date.now();
      this.emit('alert-acknowledged', alert);
    }
  }

  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = Date.now();
      this.emit('alert-resolved', alert);
    }
  }

  getAlerts(filters?: {
    type?: Alert['type'];
    severity?: Alert['severity'];
    acknowledged?: boolean;
    resolved?: boolean;
    limit?: number;
  }): Alert[] {
    let alerts = Array.from(this.alerts.values());

    if (filters) {
      if (filters.type) {
        alerts = alerts.filter(a => a.type === filters.type);
      }
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity);
      }
      if (filters.acknowledged !== undefined) {
        alerts = alerts.filter(a => a.acknowledged === filters.acknowledged);
      }
      if (filters.resolved !== undefined) {
        alerts = alerts.filter(a => a.resolved === filters.resolved);
      }
      if (filters.limit) {
        alerts = alerts.slice(0, filters.limit);
      }
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  getActiveAlerts(): Alert[] {
    return this.getAlerts({
      acknowledged: false,
      resolved: false,
    });
  }

  getCriticalAlerts(): Alert[] {
    return this.getAlerts({
      severity: 'critical',
      resolved: false,
    });
  }

  getStatistics(): {
    total: number;
    byType: Record<Alert['type'], number>;
    bySeverity: Record<Alert['severity'], number>;
    active: number;
    acknowledged: number;
    resolved: number;
  } {
    const alerts = Array.from(this.alerts.values());

    const byType: Record<Alert['type'], number> = {
      performance: 0,
      security: 0,
      availability: 0,
      capacity: 0,
    };

    const bySeverity: Record<Alert['severity'], number> = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
    };

    for (const alert of alerts) {
      byType[alert.type]++;
      bySeverity[alert.severity]++;
    }

    return {
      total: alerts.length,
      byType,
      bySeverity,
      active: alerts.filter(a => !a.acknowledged && !a.resolved).length,
      acknowledged: alerts.filter(a => a.acknowledged && !a.resolved).length,
      resolved: alerts.filter(a => a.resolved).length,
    };
  }

  private sendNotifications(alert: Alert): void {
    const enabledChannels = this.getChannels().filter(c => c.enabled);

    for (const channel of enabledChannels) {
      this.sendNotification(alert, channel);
    }
  }

  private sendNotification(alert: Alert, channel: AlertChannel): void {
    const notification: AlertNotification = {
      alert,
      channel,
      sent: false,
    };

    try {
      switch (channel.type) {
        case 'console':
          logger.info(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.title} - ${alert.message}`, 'AlertManager');
          break;
        case 'webhook':
          this.sendWebhookNotification(alert, channel);
          break;
        case 'email':
          this.sendEmailNotification(alert, channel);
          break;
        case 'slack':
          this.sendSlackNotification(alert, channel);
          break;
        default:
          logger.warn(`Unsupported channel type: ${channel.type}`, 'AlertManager');
      }

      notification.sent = true;
      notification.sentAt = Date.now();
    } catch (error) {
      notification.error = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to send notification: ${notification.error}`, 'AlertManager', { error }, error as Error);
    }

    this.notifications.push(notification);
    this.emit('notification-sent', notification);
  }

  private sendWebhookNotification(alert: Alert, channel: AlertChannel): void {
    const url = channel.config.url;
    if (url === 'console://output') {
      return;
    }

    logger.info(`Sending webhook notification to ${url}`, 'AlertManager', { alert });
  }

  private sendEmailNotification(alert: Alert, channel: AlertChannel): void {
    const to = channel.config.to;
    logger.info(`Sending email notification to ${to}`, 'AlertManager', { alert });
  }

  private sendSlackNotification(alert: Alert, channel: AlertChannel): void {
    const webhookUrl = channel.config.webhookUrl;
    logger.info(`Sending Slack notification to ${webhookUrl}`, 'AlertManager', { alert });
  }

  private startEscalationCheck(): void {
    setInterval(() => {
      this.checkEscalations();
    }, 300000);
  }

  private checkEscalations(): void {
    const activeAlerts = this.getActiveAlerts();

    for (const alert of activeAlerts) {
      const escalationPath = this.escalationRules.get(alert.id);
      if (!escalationPath) {
        continue;
      }

      const timeSinceAlert = Date.now() - alert.timestamp;
      const escalationIndex = Math.floor(timeSinceAlert / 3600000);

      if (escalationIndex < escalationPath.length) {
        const escalationTarget = escalationPath[escalationIndex];
        this.escalateAlert(alert, escalationTarget);
      }
    }
  }

  private escalateAlert(alert: Alert, target: string): void {
    logger.info(`Escalating alert ${alert.id} to ${target}`, 'AlertManager', { alert });
    this.emit('alert-escalated', { alert, target });
  }

  getNotifications(): AlertNotification[] {
    return [...this.notifications];
  }

  getNotificationsForAlert(alertId: string): AlertNotification[] {
    return this.notifications.filter(n => n.alert.id === alertId);
  }

  clearOldAlerts(maxAge: number = 86400000): void {
    const cutoffTime = Date.now() - maxAge;

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.resolved && alert.resolvedAt && alert.resolvedAt < cutoffTime) {
        this.alerts.delete(id);
      }
    }

    this.emit('alerts-cleared', { cutoffTime });
  }

  reset(): void {
    this.alerts.clear();
    this.notifications = [];
    for (const rule of this.rules.values()) {
      rule.lastTriggered = undefined;
    }
    this.emit('manager-reset');
  }
}
