/**
 * @file 增强型监控告警系统
 * @description 实现智能监控告警系统，包含多维度指标监控、智能告警、自动恢复等功能
 * @author YYC³ Team
 * @version 2.0.0
 * @created 2026-01-25
 * @updated 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { EventEmitter } from 'eventemitter3';

export enum MetricType {
  CPU = 'cpu',
  MEMORY = 'memory',
  DISK_IO = 'disk_io',
  NETWORK_IO = 'network_io',
  DATABASE_LATENCY = 'database_latency',
  API_RESPONSE_TIME = 'api_response_time',
  ERROR_RATE = 'error_rate',
  THROUGHPUT = 'throughput',
  CONCURRENCY = 'concurrency',
  CACHE_HIT_RATE = 'cache_hit_rate',
  QUEUE_LENGTH = 'queue_length'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum AlertStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed'
}

export interface MetricThreshold {
  type: MetricType;
  warningThreshold: number;
  criticalThreshold: number;
  comparison: 'greater_than' | 'less_than' | 'equals';
  duration: number;
  aggregation: 'avg' | 'max' | 'min' | 'sum';
}

export interface MetricData {
  type: MetricType;
  value: number;
  timestamp: number;
  source: string;
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  type: MetricType;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  description: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  acknowledgedBy?: string;
  resolvedBy?: string;
  affectedServices: string[];
  suggestedActions: string[];
  relatedAlerts: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  thresholds: MetricThreshold[];
  conditions: {
    requireAll: boolean;
    customConditions?: Array<(metrics: MetricData[]) => boolean>;
  };
  actions: {
    notifications: string[];
    autoRemediation?: {
      enabled: boolean;
      script?: string;
      maxAttempts: number;
    };
  };
  suppression: {
    enabled: boolean;
    duration: number;
    cooldown: number;
  };
}

export interface MonitoringConfig {
  metricsCollectionInterval: number;
  alertEvaluationInterval: number;
  dataRetentionPeriod: number;
  alertHistoryLimit: number;
  enableAutoRemediation: boolean;
  enableSmartAlerting: boolean;
  enablePredictiveAlerting: boolean;
  notificationChannels: string[];
}

export class EnhancedMonitoringAlertSystem extends EventEmitter {
  private config: Required<MonitoringConfig>;
  private metricsHistory: Map<MetricType, MetricData[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private alertSuppression: Map<string, { suppressedUntil: number; reason: string }> = new Map();
  private metricsCollectionInterval: NodeJS.Timeout | null = null;
  private alertEvaluationInterval: NodeJS.Timeout | null = null;
  private predictiveModels: Map<MetricType, any> = new Map();

  constructor(config: Partial<MonitoringConfig> = {}) {
    super();
    this.config = {
      metricsCollectionInterval: config.metricsCollectionInterval ?? 5000,
      alertEvaluationInterval: config.alertEvaluationInterval ?? 10000,
      dataRetentionPeriod: config.dataRetentionPeriod ?? 24 * 60 * 60 * 1000,
      alertHistoryLimit: config.alertHistoryLimit ?? 1000,
      enableAutoRemediation: config.enableAutoRemediation ?? true,
      enableSmartAlerting: config.enableSmartAlerting ?? true,
      enablePredictiveAlerting: config.enablePredictiveAlerting ?? true,
      notificationChannels: config.notificationChannels ?? ['console', 'email']
    };

    this.initializeDefaultRules();
    this.initializePredictiveModels();
  }

  startMonitoring(): void {
    this.startMetricsCollection();
    this.startAlertEvaluation();
    this.emit('monitoring-started');
  }

  stopMonitoring(): void {
    this.stopMetricsCollection();
    this.stopAlertEvaluation();
    this.emit('monitoring-stopped');
  }

  recordMetric(metric: MetricData): void {
    const type = metric.type;
    if (!this.metricsHistory.has(type)) {
      this.metricsHistory.set(type, []);
    }

    const history = this.metricsHistory.get(type)!;
    history.push(metric);

    this.cleanupOldMetrics(type);
    this.emit('metric-recorded', metric);

    if (this.config.enablePredictiveAlerting) {
      this.updatePredictiveModel(type);
    }
  }

  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.emit('rule-added', rule);
  }

  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
    this.emit('rule-removed', ruleId);
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === AlertStatus.OPEN) {
      alert.status = AlertStatus.ACKNOWLEDGED;
      alert.acknowledgedAt = Date.now();
      alert.acknowledgedBy = acknowledgedBy;
      this.emit('alert-acknowledged', alert);
    }
  }

  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status !== AlertStatus.RESOLVED) {
      alert.status = AlertStatus.RESOLVED;
      alert.resolvedAt = Date.now();
      alert.resolvedBy = resolvedBy;
      this.emit('alert-resolved', alert);
    }
  }

  suppressAlert(alertId: string, duration: number, reason: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = AlertStatus.SUPPRESSED;
      this.alertSuppression.set(alertId, {
        suppressedUntil: Date.now() + duration,
        reason
      });
      this.emit('alert-suppressed', { alertId, duration, reason });
    }
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(
      alert => alert.status === AlertStatus.OPEN || alert.status === AlertStatus.ACKNOWLEDGED
    );
  }

  getAlertHistory(limit?: number): Alert[] {
    const allAlerts = Array.from(this.alerts.values());
    const sortedAlerts = allAlerts.sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sortedAlerts.slice(0, limit) : sortedAlerts;
  }

  getMetricsHistory(type: MetricType, timeWindow?: number): MetricData[] {
    const history = this.metricsHistory.get(type) || [];
    if (!timeWindow) {
      return history;
    }

    const cutoffTime = Date.now() - timeWindow;
    return history.filter(metric => metric.timestamp >= cutoffTime);
  }

  private startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsCollectionInterval);
  }

  private stopMetricsCollection(): void {
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = null;
    }
  }

  private startAlertEvaluation(): void {
    this.alertEvaluationInterval = setInterval(() => {
      this.evaluateAlerts();
    }, this.config.alertEvaluationInterval);
  }

  private stopAlertEvaluation(): void {
    if (this.alertEvaluationInterval) {
      clearInterval(this.alertEvaluationInterval);
      this.alertEvaluationInterval = null;
    }
  }

  private collectMetrics(): void {
    for (const type of Object.values(MetricType)) {
      const metric = this.simulateMetricCollection(type);
      this.recordMetric(metric);
    }
  }

  private simulateMetricCollection(type: MetricType): MetricData {
    const baseValues: Record<MetricType, { min: number; max: number }> = {
      [MetricType.CPU]: { min: 20, max: 80 },
      [MetricType.MEMORY]: { min: 30, max: 70 },
      [MetricType.DISK_IO]: { min: 10, max: 60 },
      [MetricType.NETWORK_IO]: { min: 15, max: 55 },
      [MetricType.DATABASE_LATENCY]: { min: 50, max: 300 },
      [MetricType.API_RESPONSE_TIME]: { min: 100, max: 500 },
      [MetricType.ERROR_RATE]: { min: 0, max: 5 },
      [MetricType.THROUGHPUT]: { min: 500, max: 2000 },
      [MetricType.CONCURRENCY]: { min: 100, max: 800 },
      [MetricType.CACHE_HIT_RATE]: { min: 70, max: 95 },
      [MetricType.QUEUE_LENGTH]: { min: 0, max: 100 }
    };

    const range = baseValues[type];
    const value = range.min + Math.random() * (range.max - range.min);

    return {
      type,
      value,
      timestamp: Date.now(),
      source: 'system',
      metadata: {}
    };
  }

  private evaluateAlerts(): void {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      const alerts = this.evaluateRule(rule);
      for (const alert of alerts) {
        this.processAlert(alert, rule);
      }
    }
  }

  private evaluateRule(rule: AlertRule): Alert[] {
    const alerts: Alert[] = [];

    for (const threshold of rule.thresholds) {
      const metrics = this.getMetricsHistory(threshold.type, threshold.duration);
      if (metrics.length === 0) continue;

      const aggregatedValue = this.aggregateMetrics(metrics, threshold.aggregation);

      if (this.checkThreshold(aggregatedValue, threshold)) {
        const severity = this.determineSeverity(aggregatedValue, threshold);
        const existingAlert = this.findExistingAlert(threshold.type, severity);

        if (!existingAlert) {
          const alert = this.createAlert(threshold, aggregatedValue, severity);
          alerts.push(alert);
        }
      }
    }

    return alerts;
  }

  private aggregateMetrics(metrics: MetricData[], aggregation: string): number {
    const values = metrics.map(m => m.value);

    switch (aggregation) {
      case 'avg':
        return values.reduce((sum, v) => sum + v, 0) / values.length;
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      case 'sum':
        return values.reduce((sum, v) => sum + v, 0);
      default:
        return values[0];
    }
  }

  private checkThreshold(value: number, threshold: MetricThreshold): boolean {
    switch (threshold.comparison) {
      case 'greater_than':
        return value > threshold.warningThreshold;
      case 'less_than':
        return value < threshold.warningThreshold;
      case 'equals':
        return value === threshold.warningThreshold;
      default:
        return false;
    }
  }

  private determineSeverity(value: number, threshold: MetricThreshold): AlertSeverity {
    switch (threshold.comparison) {
      case 'greater_than':
        if (value >= threshold.criticalThreshold) return AlertSeverity.CRITICAL;
        if (value >= threshold.warningThreshold) return AlertSeverity.ERROR;
        return AlertSeverity.WARNING;
      case 'less_than':
        if (value <= threshold.criticalThreshold) return AlertSeverity.CRITICAL;
        if (value <= threshold.warningThreshold) return AlertSeverity.ERROR;
        return AlertSeverity.WARNING;
      case 'equals':
        return AlertSeverity.WARNING;
      default:
        return AlertSeverity.INFO;
    }
  }

  private findExistingAlert(type: MetricType, severity: AlertSeverity): Alert | undefined {
    const now = Date.now();
    const cooldownPeriod = 5 * 60 * 1000;

    return Array.from(this.alerts.values()).find(alert => {
      const isSameType = alert.type === type;
      const isSameSeverity = alert.severity === severity;
      const isRecent = (now - alert.timestamp) < cooldownPeriod;
      const isActive = alert.status === AlertStatus.OPEN || alert.status === AlertStatus.ACKNOWLEDGED;
      const isNotSuppressed = !this.alertSuppression.has(alert.id);

      return isSameType && isSameSeverity && isRecent && isActive && isNotSuppressed;
    });
  }

  private createAlert(threshold: MetricThreshold, value: number, severity: AlertSeverity): Alert {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message = this.generateAlertMessage(threshold, value, severity);
    const description = this.generateAlertDescription(threshold, value, severity);
    const suggestedActions = this.generateSuggestedActions(threshold, severity);
    const affectedServices = this.identifyAffectedServices(threshold.type);

    const alert: Alert = {
      id: alertId,
      type: threshold.type,
      severity,
      status: AlertStatus.OPEN,
      message,
      description,
      value,
      threshold: threshold.warningThreshold,
      timestamp: Date.now(),
      affectedServices,
      suggestedActions,
      relatedAlerts: this.findRelatedAlerts(threshold.type)
    };

    this.alerts.set(alertId, alert);
    this.cleanupOldAlerts();

    return alert;
  }

  private generateAlertMessage(threshold: MetricThreshold, value: number, severity: AlertSeverity): string {
    const typeName = this.getMetricTypeName(threshold.type);
    const severityName = severity.toUpperCase();
    return `${severityName}: ${typeName} exceeded threshold (current: ${value.toFixed(2)}, threshold: ${threshold.warningThreshold})`;
  }

  private generateAlertDescription(threshold: MetricThreshold, value: number, severity: AlertSeverity): string {
    const typeName = this.getMetricTypeName(threshold.type);
    const deviation = ((value - threshold.warningThreshold) / threshold.warningThreshold * 100).toFixed(2);

    return `${typeName} is ${deviation}% ${threshold.comparison === 'greater_than' ? 'above' : 'below'} threshold. Current value: ${value.toFixed(2)}, Threshold: ${threshold.warningThreshold}. Severity: ${severity}`;
  }

  private generateSuggestedActions(threshold: MetricThreshold, severity: AlertSeverity): string[] {
    const actions: string[] = [];

    if (severity === AlertSeverity.CRITICAL) {
      actions.push('Immediate investigation required');
      actions.push('Consider scaling up resources');
      actions.push('Check for system failures');
    } else if (severity === AlertSeverity.ERROR) {
      actions.push('Investigate the issue');
      actions.push('Review system logs');
      actions.push('Monitor related metrics');
    } else if (severity === AlertSeverity.WARNING) {
      actions.push('Monitor the situation');
      actions.push('Review trends');
      actions.push('Prepare contingency plans');
    }

    const typeSpecificActions = this.getTypeSpecificActions(threshold.type);
    actions.push(...typeSpecificActions);

    return actions;
  }

  private getTypeSpecificActions(type: MetricType): string[] {
    const actions: Record<MetricType, string[]> = {
      [MetricType.CPU]: ['Check for CPU-intensive processes', 'Review application performance', 'Consider horizontal scaling'],
      [MetricType.MEMORY]: ['Check for memory leaks', 'Review memory usage patterns', 'Consider increasing memory allocation'],
      [MetricType.DISK_IO]: ['Check disk health', 'Review I/O patterns', 'Optimize database queries'],
      [MetricType.NETWORK_IO]: ['Check network connectivity', 'Review bandwidth usage', 'Optimize data transfer'],
      [MetricType.DATABASE_LATENCY]: ['Check database performance', 'Review query execution plans', 'Consider database scaling'],
      [MetricType.API_RESPONSE_TIME]: ['Review API endpoints', 'Check backend performance', 'Optimize database queries'],
      [MetricType.ERROR_RATE]: ['Review error logs', 'Check for application errors', 'Investigate failure patterns'],
      [MetricType.THROUGHPUT]: ['Review system capacity', 'Check for bottlenecks', 'Consider load balancing'],
      [MetricType.CONCURRENCY]: ['Review concurrent connections', 'Check connection pool settings', 'Consider connection limits'],
      [MetricType.CACHE_HIT_RATE]: ['Review cache configuration', 'Check cache key distribution', 'Optimize cache strategy'],
      [MetricType.QUEUE_LENGTH]: ['Review queue processing', 'Check worker performance', 'Consider scaling workers']
    };

    return actions[type] || [];
  }

  private identifyAffectedServices(type: MetricType): string[] {
    const serviceMap: Record<MetricType, string[]> = {
      [MetricType.CPU]: ['api-gateway', 'auth', 'workflow'],
      [MetricType.MEMORY]: ['cache', 'message-queue', 'database'],
      [MetricType.DISK_IO]: ['database', 'content', 'analytics'],
      [MetricType.NETWORK_IO]: ['api-gateway', 'external-integrations'],
      [MetricType.DATABASE_LATENCY]: ['database', 'workflow', 'analytics'],
      [MetricType.API_RESPONSE_TIME]: ['api-gateway', 'auth', 'customer-management'],
      [MetricType.ERROR_RATE]: ['all-services'],
      [MetricType.THROUGHPUT]: ['api-gateway', 'load-balancer'],
      [MetricType.CONCURRENCY]: ['api-gateway', 'database'],
      [MetricType.CACHE_HIT_RATE]: ['cache', 'database'],
      [MetricType.QUEUE_LENGTH]: ['message-queue', 'workflow']
    };

    return serviceMap[type] || [];
  }

  private findRelatedAlerts(type: MetricType): string[] {
    const relatedTypes = this.getRelatedMetricTypes(type);
    const relatedAlerts = Array.from(this.alerts.values()).filter(alert => {
      const isRelated = relatedTypes.includes(alert.type);
      const isRecent = (Date.now() - alert.timestamp) < 30 * 60 * 1000;
      const isActive = alert.status === AlertStatus.OPEN || alert.status === AlertStatus.ACKNOWLEDGED;
      return isRelated && isRecent && isActive;
    });

    return relatedAlerts.map(alert => alert.id);
  }

  private getRelatedMetricTypes(type: MetricType): MetricType[] {
    const relationships: Record<MetricType, MetricType[]> = {
      [MetricType.CPU]: [MetricType.MEMORY, MetricType.API_RESPONSE_TIME],
      [MetricType.MEMORY]: [MetricType.CPU, MetricType.DATABASE_LATENCY],
      [MetricType.DATABASE_LATENCY]: [MetricType.MEMORY, MetricType.API_RESPONSE_TIME],
      [MetricType.API_RESPONSE_TIME]: [MetricType.CPU, MetricType.DATABASE_LATENCY],
      [MetricType.ERROR_RATE]: [MetricType.API_RESPONSE_TIME, MetricType.THROUGHPUT],
      [MetricType.THROUGHPUT]: [MetricType.CPU, MetricType.MEMORY],
      [MetricType.CONCURRENCY]: [MetricType.CPU, MetricType.MEMORY],
      [MetricType.CACHE_HIT_RATE]: [MetricType.DATABASE_LATENCY, MetricType.API_RESPONSE_TIME],
      [MetricType.QUEUE_LENGTH]: [MetricType.THROUGHPUT, MetricType.API_RESPONSE_TIME],
      [MetricType.DISK_IO]: [MetricType.DATABASE_LATENCY],
      [MetricType.NETWORK_IO]: [MetricType.API_RESPONSE_TIME]
    };

    return relationships[type] || [];
  }

  private getMetricTypeName(type: MetricType): string {
    const names: Record<MetricType, string> = {
      [MetricType.CPU]: 'CPU Usage',
      [MetricType.MEMORY]: 'Memory Usage',
      [MetricType.DISK_IO]: 'Disk I/O',
      [MetricType.NETWORK_IO]: 'Network I/O',
      [MetricType.DATABASE_LATENCY]: 'Database Latency',
      [MetricType.API_RESPONSE_TIME]: 'API Response Time',
      [MetricType.ERROR_RATE]: 'Error Rate',
      [MetricType.THROUGHPUT]: 'Throughput',
      [MetricType.CONCURRENCY]: 'Concurrency',
      [MetricType.CACHE_HIT_RATE]: 'Cache Hit Rate',
      [MetricType.QUEUE_LENGTH]: 'Queue Length'
    };

    return names[type] || type;
  }

  private processAlert(alert: Alert, rule: AlertRule): void {
    this.emit('alert-created', alert);

    for (const channel of rule.actions.notifications) {
      this.sendNotification(channel, alert);
    }

    if (rule.actions.autoRemediation?.enabled && this.config.enableAutoRemediation) {
      this.executeAutoRemediation(alert, rule.actions.autoRemediation);
    }
  }

  private sendNotification(channel: string, alert: Alert): void {
    switch (channel) {
      case 'console':
        console.log(`[ALERT] ${alert.message}`);
        break;
      case 'email':
        this.sendEmailNotification(alert);
        break;
      case 'slack':
        this.sendSlackNotification(alert);
        break;
      case 'webhook':
        this.sendWebhookNotification(alert);
        break;
      default:
        console.log(`Unknown notification channel: ${channel}`);
    }
  }

  private sendEmailNotification(alert: Alert): void {
    console.log(`[EMAIL] Sending alert notification: ${alert.message}`);
  }

  private sendSlackNotification(alert: Alert): void {
    console.log(`[SLACK] Sending alert notification: ${alert.message}`);
  }

  private sendWebhookNotification(alert: Alert): void {
    console.log(`[WEBHOOK] Sending alert notification: ${alert.message}`);
  }

  private executeAutoRemediation(alert: Alert, remediation: { enabled: boolean; script?: string; maxAttempts: number }): void {
    console.log(`[AUTO-REMEDIATION] Executing for alert: ${alert.id}`);

    if (remediation.script) {
      console.log(`[AUTO-REMEDIATION] Running script: ${remediation.script}`);
    }

    this.emit('auto-remediation-executed', { alert, remediation });
  }

  private cleanupOldMetrics(type: MetricType): void {
    const history = this.metricsHistory.get(type);
    if (!history) return;

    const cutoffTime = Date.now() - this.config.dataRetentionPeriod;
    const recentMetrics = history.filter(metric => metric.timestamp >= cutoffTime);
    this.metricsHistory.set(type, recentMetrics);
  }

  private cleanupOldAlerts(): void {
    const allAlerts = Array.from(this.alerts.entries());
    const sortedAlerts = allAlerts.sort((a, b) => b[1].timestamp - a[1].timestamp);

    if (sortedAlerts.length > this.config.alertHistoryLimit) {
      const alertsToRemove = sortedAlerts.slice(this.config.alertHistoryLimit);
      for (const [alertId] of alertsToRemove) {
        this.alerts.delete(alertId);
      }
    }
  }

  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'cpu-high-usage',
        name: 'High CPU Usage',
        description: 'Alert when CPU usage exceeds threshold',
        enabled: true,
        thresholds: [{
          type: MetricType.CPU,
          warningThreshold: 70,
          criticalThreshold: 90,
          comparison: 'greater_than',
          duration: 5 * 60 * 1000,
          aggregation: 'avg'
        }],
        conditions: {
          requireAll: false
        },
        actions: {
          notifications: ['console', 'email'],
          autoRemediation: {
            enabled: true,
            maxAttempts: 3
          }
        },
        suppression: {
          enabled: true,
          duration: 30 * 60 * 1000,
          cooldown: 10 * 60 * 1000
        }
      },
      {
        id: 'memory-high-usage',
        name: 'High Memory Usage',
        description: 'Alert when memory usage exceeds threshold',
        enabled: true,
        thresholds: [{
          type: MetricType.MEMORY,
          warningThreshold: 75,
          criticalThreshold: 90,
          comparison: 'greater_than',
          duration: 5 * 60 * 1000,
          aggregation: 'avg'
        }],
        conditions: {
          requireAll: false
        },
        actions: {
          notifications: ['console', 'email'],
          autoRemediation: {
            enabled: true,
            maxAttempts: 3
          }
        },
        suppression: {
          enabled: true,
          duration: 30 * 60 * 1000,
          cooldown: 10 * 60 * 1000
        }
      },
      {
        id: 'api-slow-response',
        name: 'Slow API Response',
        description: 'Alert when API response time exceeds threshold',
        enabled: true,
        thresholds: [{
          type: MetricType.API_RESPONSE_TIME,
          warningThreshold: 300,
          criticalThreshold: 500,
          comparison: 'greater_than',
          duration: 3 * 60 * 1000,
          aggregation: 'avg'
        }],
        conditions: {
          requireAll: false
        },
        actions: {
          notifications: ['console', 'email'],
          autoRemediation: {
            enabled: false,
            maxAttempts: 0
          }
        },
        suppression: {
          enabled: true,
          duration: 15 * 60 * 1000,
          cooldown: 5 * 60 * 1000
        }
      }
    ];

    for (const rule of defaultRules) {
      this.addAlertRule(rule);
    }
  }

  private initializePredictiveModels(): void {
    for (const type of Object.values(MetricType)) {
      this.predictiveModels.set(type, {
        history: [],
        trend: 0,
        volatility: 0,
        lastUpdated: Date.now()
      });
    }
  }

  private updatePredictiveModel(type: MetricType): void {
    const metrics = this.getMetricsHistory(type, 60 * 60 * 1000);
    if (metrics.length < 10) return;

    const model = this.predictiveModels.get(type);
    if (!model) return;

    const values = metrics.map(m => m.value);
    const trend = this.calculateTrend(values);
    const volatility = this.calculateVolatility(values);

    model.history = values;
    model.trend = trend;
    model.volatility = volatility;
    model.lastUpdated = Date.now();

    this.checkPredictiveAlert(type, model);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
    return Math.sqrt(variance);
  }

  private checkPredictiveAlert(type: MetricType, model: any): void {
    const currentMetrics = this.getMetricsHistory(type, 5 * 60 * 1000);
    if (currentMetrics.length === 0) return;

    const currentValue = currentMetrics[currentMetrics.length - 1].value;
    const predictedValue = currentValue + model.trend * 10;
    const threshold = currentValue * (1 + model.volatility * 2);

    if (predictedValue > threshold) {
      const alertId = `predictive_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const alert: Alert = {
        id: alertId,
        type,
        severity: AlertSeverity.WARNING,
        status: AlertStatus.OPEN,
        message: `PREDICTIVE ALERT: ${this.getMetricTypeName(type)} is predicted to exceed threshold`,
        description: `Based on trend analysis, ${this.getMetricTypeName(type)} is predicted to reach ${predictedValue.toFixed(2)} in the next 10 minutes. Current value: ${currentValue.toFixed(2)}`,
        value: predictedValue,
        threshold: currentValue,
        timestamp: Date.now(),
        affectedServices: this.identifyAffectedServices(type),
        suggestedActions: this.generateSuggestedActions({
          type,
          warningThreshold: currentValue,
          criticalThreshold: predictedValue,
          comparison: 'greater_than',
          duration: 10 * 60 * 1000,
          aggregation: 'avg'
        }, AlertSeverity.WARNING),
        relatedAlerts: this.findRelatedAlerts(type)
      };

      this.alerts.set(alertId, alert);
      this.emit('predictive-alert', alert);
    }
  }
}
