import { EventEmitter } from 'eventemitter3';
import { SyncStatus, Notification, SyncResult } from './types';
import { MappingRuleParser } from './mapping-parser';

export interface MonitorConfig {
  checkInterval?: number;
  alertThreshold?: number;
  enableLogging?: boolean;
  logPath?: string;
}

export class SyncMonitor extends EventEmitter {
  private parser: MappingRuleParser;
  private config: Required<MonitorConfig>;
  private status: SyncStatus;
  private checkTimer: NodeJS.Timeout | null = null;
  private syncHistory: SyncResult[] = [];
  private maxHistorySize: number = 100;

  constructor(
    configPath: string = '.doc-code-mapping.json',
    config: MonitorConfig = {}
  ) {
    super();
    this.parser = new MappingRuleParser(configPath);
    this.config = {
      checkInterval: config.checkInterval || 60000,
      alertThreshold: config.alertThreshold || 5,
      enableLogging: config.enableLogging !== false,
      logPath: config.logPath || './sync-monitor.log'
    };
    this.status = this.initializeStatus();
  }

  startMonitoring(): void {
    this.log('监控服务已启动');
    this.checkTimer = setInterval(() => {
      this.checkSyncStatus();
    }, this.config.checkInterval);
    this.emit('monitor-started');
  }

  stopMonitoring(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    this.log('监控服务已停止');
    this.emit('monitor-stopped');
  }

  private initializeStatus(): SyncStatus {
    const mappings = this.parser.getAllMappings();
    return {
      isRunning: false,
      totalMappings: mappings.length,
      syncedMappings: mappings.filter(m => m.syncStatus === 'success').length,
      failedMappings: mappings.filter(m => m.syncStatus === 'failed').length
    };
  }

  private checkSyncStatus(): void {
    const mappings = this.parser.getAllMappings();
    const failedCount = mappings.filter(m => m.syncStatus === 'failed').length;

    this.status = {
      isRunning: true,
      lastSyncTime: new Date().toISOString(),
      totalMappings: mappings.length,
      syncedMappings: mappings.filter(m => m.syncStatus === 'success').length,
      failedMappings: failedCount
    };

    this.emit('status-updated', this.status);

    if (failedCount >= this.config.alertThreshold) {
      this.sendAlert({
        type: 'error',
        title: '同步失败告警',
        message: `检测到 ${failedCount} 个映射同步失败，请及时处理`,
        timestamp: new Date().toISOString()
      });
    }
  }

  recordSyncResult(result: SyncResult): void {
    this.syncHistory.push(result);

    if (this.syncHistory.length > this.maxHistorySize) {
      this.syncHistory.shift();
    }

    if (!result.success) {
      this.sendAlert({
        type: 'warning',
        title: '同步失败',
        message: result.message,
        timestamp: result.timestamp
      });
    }

    this.log(`同步结果: ${result.success ? '成功' : '失败'} - ${result.message}`);
  }

  getStatus(): SyncStatus {
    return { ...this.status };
  }

  getSyncHistory(limit?: number): SyncResult[] {
    if (limit) {
      return this.syncHistory.slice(-limit);
    }
    return [...this.syncHistory];
  }

  getFailedMappings(): string[] {
    const mappings = this.parser.getAllMappings();
    return mappings
      .filter(m => m.syncStatus === 'failed')
      .map(m => m.id);
  }

  getPendingMappings(): string[] {
    const mappings = this.parser.getAllMappings();
    return mappings
      .filter(m => m.syncStatus === 'pending')
      .map(m => m.id);
  }

  private sendAlert(notification: Notification): void {
    this.emit('alert', notification);
    this.log(`告警: [${notification.type}] ${notification.title} - ${notification.message}`);
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}\n`;
      
      try {
        require('fs').appendFileSync(this.config.logPath, logMessage);
      } catch (error) {
        console.error('写入日志失败:', error);
      }
    }
  }

  clearHistory(): void {
    this.syncHistory = [];
    this.log('同步历史已清空');
  }

  exportHistory(): string {
    return JSON.stringify(this.syncHistory, null, 2);
  }

  exportStatus(): string {
    return JSON.stringify(this.status, null, 2);
  }
}

export class NotificationManager extends EventEmitter {
  private notifications: Notification[] = [];
  private maxNotifications: number = 50;

  send(notification: Notification): void {
    this.notifications.push(notification);

    if (this.notifications.length > this.maxNotifications) {
      this.notifications.shift();
    }

    this.emit('notification', notification);
    this.logNotification(notification);
  }

  private logNotification(notification: Notification): void {
    const timestamp = new Date(notification.timestamp).toLocaleString('zh-CN');
    const icon = this.getNotificationIcon(notification.type);
    console.log(`${icon} [${timestamp}] ${notification.title}: ${notification.message}`);
  }

  private getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📢';
    }
  }

  getNotifications(limit?: number): Notification[] {
    if (limit) {
      return this.notifications.slice(-limit);
    }
    return [...this.notifications];
  }

  clearNotifications(): void {
    this.notifications = [];
    this.emit('notifications-cleared');
  }

  getUnreadCount(): number {
    return this.notifications.length;
  }

  markAsRead(): void {
    this.notifications = [];
    this.emit('notifications-read');
  }
}
