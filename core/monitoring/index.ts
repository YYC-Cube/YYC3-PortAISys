import { EventEmitter } from 'events';
import { Logger } from '../../utils/logger';
import { MonitoringSystemImpl } from './monitoring';
import { AlertSystemImpl } from './alert';
import { NotificationSystemImpl } from './notification';
import { AnalysisSystemImpl } from './analysis';
import {
  MonitoringSystem,
  AlertSystem,
  NotificationSystem,
  AnalysisSystem,
  MonitoringConfig,
  AlertRule,
  Alert,
  NotificationChannel,
  NotificationTemplate,
  MetricsQuery,
  AnalysisResult,
  Anomaly,
  Trend,
  CorrelationResult,
  RootCauseResult
} from './types';

export class MonitoringPlatform extends EventEmitter {
  private monitoring: MonitoringSystemImpl;
  private alert: AlertSystemImpl;
  private notification: NotificationSystemImpl;
  private analysis: AnalysisSystemImpl;
  private logger: Logger;
  private dataDirectory: string;
  private isRunning: boolean = false;

  constructor(logger: Logger, dataDirectory: string = './data/monitoring') {
    super();
    this.logger = logger;
    this.dataDirectory = dataDirectory;
    
    this.monitoring = new MonitoringSystemImpl(logger, dataDirectory);
    this.alert = new AlertSystemImpl(logger, dataDirectory);
    this.notification = new NotificationSystemImpl(logger, dataDirectory);
    this.analysis = new AnalysisSystemImpl(logger, dataDirectory);
    
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.monitoring.on('metrics:collected', async (metrics) => {
      await this.processMetrics(metrics);
    });

    this.alert.on('alert:triggered', async (alert: Alert) => {
      await this.handleAlert(alert);
    });

    this.alert.on('alert:acknowledged', (alert: Alert) => {
      this.logger.info('告警已确认', { alertId: alert.id });
    });

    this.alert.on('alert:closed', (alert: Alert) => {
      this.logger.info('告警已关闭', { alertId: alert.id });
    });

    this.notification.on('notification:sent', (notification) => {
      this.logger.info('通知已发送', { notificationId: notification.id });
    });

    this.notification.on('notification:failed', (notification) => {
      this.logger.error('通知发送失败', { notificationId: notification.id, error: notification.error });
    });

    this.analysis.on('anomalies:detected', (anomalies: Anomaly[]) => {
      this.logger.info('检测到异常', { count: anomalies.length });
    });

    this.analysis.on('rootcause:analyzed', (result: RootCauseResult) => {
      this.logger.info('根因分析完成', { alertId: result.alertId, rootCause: result.rootCause });
    });
  }

  async start(config: MonitoringConfig): Promise<void> {
    this.logger.info('启动监控平台', { config });
    
    if (this.isRunning) {
      this.logger.warn('监控平台已经在运行中');
      return;
    }

    try {
      await this.monitoring.startMonitoring(config);
      this.isRunning = true;
      
      this.emit('platform:started');
      this.logger.info('监控平台启动成功');
    } catch (error) {
      this.logger.error('监控平台启动失败', error as Error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.logger.info('停止监控平台');
    
    if (!this.isRunning) {
      this.logger.warn('监控平台未运行');
      return;
    }

    try {
      await this.monitoring.stopMonitoring();
      await this.notification.shutdown();
      this.isRunning = false;
      
      this.emit('platform:stopped');
      this.logger.info('监控平台停止成功');
    } catch (error) {
      this.logger.error('监控平台停止失败', error as Error);
      throw error;
    }
  }

  private async processMetrics(metrics: any[]): Promise<void> {
    try {
      await this.analysis.updateMetricsCache(metrics);
      this.alert.evaluateMetrics(metrics);
    } catch (error) {
      this.logger.error('处理指标失败', error as Error);
    }
  }

  private async handleAlert(alert: Alert): Promise<void> {
    try {
      const rootCause = await this.analysis.analyzeRootCause(alert);
      
      const rule = await this.alert.getAlertRules({ metricName: alert.metricName });
      const channels = rule.length > 0 ? rule[0].notificationChannels : [];
      
      if (channels.length > 0) {
        await this.notification.sendAlertNotification(alert, channels);
      }
      
      this.emit('alert:processed', { alert, rootCause });
    } catch (error) {
      this.logger.error('处理告警失败', error as Error, { alertId: alert.id });
    }
  }

  getMonitoringSystem(): MonitoringSystem {
    return this.monitoring;
  }

  getAlertSystem(): AlertSystem {
    return this.alert;
  }

  getNotificationSystem(): NotificationSystem {
    return this.notification;
  }

  getAnalysisSystem(): AnalysisSystem {
    return this.analysis;
  }

  async createAlertRule(rule: AlertRule): Promise<AlertRule> {
    return await this.alert.createAlertRule(rule);
  }

  async createNotificationChannel(channel: NotificationChannel): Promise<NotificationChannel> {
    return await this.notification.addChannel(channel);
  }

  async createNotificationTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    return await this.notification.addTemplate(template);
  }

  async analyzeMetrics(query: MetricsQuery): Promise<AnalysisResult> {
    return await this.analysis.analyzeMetrics(query);
  }

  async detectAnomalies(query: MetricsQuery): Promise<Anomaly[]> {
    return await this.analysis.detectAnomalies(query);
  }

  async analyzeTrends(query: MetricsQuery): Promise<Trend[]> {
    return await this.analysis.analyzeTrends(query);
  }

  async correlateMetrics(metrics: string[]): Promise<CorrelationResult[]> {
    return await this.analysis.correlateMetrics(metrics);
  }

  async analyzeRootCause(alert: Alert): Promise<RootCauseResult> {
    return await this.analysis.analyzeRootCause(alert);
  }

  async getPlatformStatus(): Promise<any> {
    const monitoringStatus = await this.monitoring.getMonitoringStatus();
    const alertStatistics = await this.alert.getAlertStatistics();
    
    return {
      isRunning: this.isRunning,
      monitoring: monitoringStatus,
      alerts: alertStatistics,
      channels: this.notification.getChannels().length,
      templates: this.notification.getTemplates().length
    };
  }

  async getDashboardData(): Promise<any> {
    const realTimeMetrics = await this.monitoring.getRealTimeMetrics();
    const openAlerts = await this.alert.getAlerts({ status: 'open' });
    const recentAnomalies = this.analysis.getAnomalyHistory?.(10) || [];
    
    return {
      metrics: realTimeMetrics.slice(0, 20),
      alerts: openAlerts.slice(0, 10),
      anomalies: recentAnomalies,
      timestamp: new Date()
    };
  }

  isPlatformRunning(): boolean {
    return this.isRunning;
  }
}
