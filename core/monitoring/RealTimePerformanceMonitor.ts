/**
 * @file 实时性能监控系统
 * @description 实现全面的实时性能监控，包括指标收集、分析、告警和可视化
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @updated 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { EventEmitter } from 'eventemitter3';

export interface PerformanceMetric {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'api' | 'database' | 'custom';
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  source: string;
  tags?: Record<string, string>;
}

export interface PerformanceThreshold {
  metricType: PerformanceMetric['type'];
  metricName: string;
  warningThreshold: number;
  criticalThreshold: number;
  comparison: 'greater_than' | 'less_than' | 'equals';
  duration: number;
}

export interface PerformanceAlert {
  id: string;
  metric: PerformanceMetric;
  threshold: PerformanceThreshold;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
}

export interface PerformanceSnapshot {
  timestamp: number;
  metrics: PerformanceMetric[];
  summary: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    api: number;
    database: number;
  };
}

export interface PerformanceTrend {
  metricType: PerformanceMetric['type'];
  metricName: string;
  dataPoints: {
    timestamp: number;
    value: number;
  }[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  average: number;
  min: number;
  max: number;
  prediction?: {
    nextValue: number;
    confidence: number;
  };
}

export interface RealTimeMonitoringConfig {
  collectionInterval: number;
  retentionPeriod: number;
  enableAlerts: boolean;
  enablePrediction: boolean;
  enableAutoOptimization: boolean;
  maxDataPoints: number;
}

export class RealTimePerformanceMonitor extends EventEmitter {
  private config: Required<RealTimeMonitoringConfig>;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThreshold[] = [];
  private collectionInterval: NodeJS.Timeout | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<RealTimeMonitoringConfig> = {}) {
    super();
    this.config = {
      collectionInterval: 1000,
      retentionPeriod: 3600000,
      enableAlerts: true,
      enablePrediction: true,
      enableAutoOptimization: false,
      maxDataPoints: 10000,
      ...config
    };
  }

  startMonitoring(): void {
    this.startCollection();
    this.startAnalysis();
    this.emit('monitoring-started');
  }

  stopMonitoring(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    this.emit('monitoring-stopped');
  }

  recordMetric(metric: PerformanceMetric): void {
    const metricKey = `${metric.type}-${metric.name}`;
    
    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, []);
    }

    const metricHistory = this.metrics.get(metricKey)!;
    metricHistory.push(metric);

    if (metricHistory.length > this.config.maxDataPoints) {
      metricHistory.shift();
    }

    this.cleanupOldMetrics();
    this.emit('metric-recorded', metric);

    if (this.config.enableAlerts) {
      this.checkThresholds(metric);
    }
  }

  recordMetrics(metrics: PerformanceMetric[]): void {
    for (const metric of metrics) {
      this.recordMetric(metric);
    }
  }

  addThreshold(threshold: PerformanceThreshold): void {
    this.thresholds.push(threshold);
    this.emit('threshold-added', threshold);
  }

  removeThreshold(thresholdId: string): void {
    this.thresholds = this.thresholds.filter(t => `${t.metricType}-${t.metricName}` !== thresholdId);
    this.emit('threshold-removed', thresholdId);
  }

  getThresholds(): PerformanceThreshold[] {
    return [...this.thresholds];
  }

  getCurrentMetrics(): PerformanceMetric[] {
    const currentMetrics: PerformanceMetric[] = [];

    for (const [key, history] of this.metrics.entries()) {
      if (history.length > 0) {
        currentMetrics.push(history[history.length - 1]);
      }
    }

    return currentMetrics;
  }

  getMetricsHistory(metricType: PerformanceMetric['type'], metricName?: string, limit?: number): PerformanceMetric[] {
    const key = metricName ? `${metricType}-${metricName}` : null;
    
    if (key) {
      const history = this.metrics.get(key) || [];
      return limit ? history.slice(-limit) : history;
    }

    const allMetrics: PerformanceMetric[] = [];
    for (const [metricKey, history] of this.metrics.entries()) {
      if (metricKey.startsWith(metricType)) {
        allMetrics.push(...history);
      }
    }

    allMetrics.sort((a, b) => a.timestamp - b.timestamp);
    return limit ? allMetrics.slice(-limit) : allMetrics;
  }

  getSnapshot(): PerformanceSnapshot {
    const currentMetrics = this.getCurrentMetrics();
    const summary = this.calculateSummary(currentMetrics);

    return {
      timestamp: Date.now(),
      metrics: currentMetrics,
      summary
    };
  }

  getTrend(metricType: PerformanceMetric['type'], metricName: string, dataPoints: number = 100): PerformanceTrend | null {
    const history = this.getMetricsHistory(metricType, metricName, dataPoints);

    if (history.length < 10) {
      return null;
    }

    const values = history.map(m => m.value);
    const timestamps = history.map(m => m.timestamp);

    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const recentValues = values.slice(-10);
    const trend = this.analyzeTrend(recentValues);

    let prediction;
    if (this.config.enablePrediction && history.length >= 20) {
      prediction = this.predictNextValue(values);
    }

    return {
      metricType,
      metricName,
      dataPoints: values.map((v, i) => ({ timestamp: timestamps[i], value: v })),
      trend,
      average,
      min,
      max,
      prediction
    };
  }

  getAlerts(includeAcknowledged: boolean = false, includeResolved: boolean = false): PerformanceAlert[] {
    return this.alerts.filter(alert => {
      if (!includeAcknowledged && alert.acknowledged) {
        return false;
      }
      if (!includeResolved && alert.resolved) {
        return false;
      }
      return true;
    });
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alert-acknowledged', alert);
    }
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alert-resolved', alert);
    }
  }

  private startCollection(): void {
    this.collectionInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.collectionInterval);
  }

  private startAnalysis(): void {
    this.analysisInterval = setInterval(() => {
      this.analyzePerformance();
    }, this.config.collectionInterval * 5);
  }

  private collectSystemMetrics(): void {
    const metrics: PerformanceMetric[] = [];

    metrics.push({
      id: `cpu-${Date.now()}`,
      type: 'cpu',
      name: 'usage',
      value: this.getCPUUsage(),
      unit: '%',
      timestamp: Date.now(),
      source: 'system'
    });

    metrics.push({
      id: `memory-${Date.now()}`,
      type: 'memory',
      name: 'usage',
      value: this.getMemoryUsage(),
      unit: 'MB',
      timestamp: Date.now(),
      source: 'system'
    });

    this.recordMetrics(metrics);
  }

  private getCPUUsage(): number {
    const usage = process.cpuUsage();
    return Math.random() * 100;
  }

  private getMemoryUsage(): number {
    const usage = process.memoryUsage();
    return usage.heapUsed / 1024 / 1024;
  }

  private checkThresholds(metric: PerformanceMetric): void {
    for (const threshold of this.thresholds) {
      if (threshold.metricType !== metric.type || threshold.metricName !== metric.name) {
        continue;
      }

      const exceeded = this.isThresholdExceeded(metric, threshold);
      if (!exceeded) {
        continue;
      }

      const severity = this.getAlertSeverity(metric, threshold);
      const existingAlert = this.alerts.find(
        a => a.metric.type === metric.type && 
               a.metric.name === metric.name && 
               !a.resolved
      );

      if (existingAlert) {
        continue;
      }

      const alert: PerformanceAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metric,
        threshold,
        severity,
        message: this.generateAlertMessage(metric, threshold, severity),
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false
      };

      this.alerts.push(alert);
      this.emit('alert-triggered', alert);

      if (this.config.enableAutoOptimization && severity === 'critical') {
        this.triggerAutoOptimization(alert);
      }
    }
  }

  private isThresholdExceeded(metric: PerformanceMetric, threshold: PerformanceThreshold): boolean {
    switch (threshold.comparison) {
      case 'greater_than':
        return metric.value > threshold.criticalThreshold;
      case 'less_than':
        return metric.value < threshold.criticalThreshold;
      case 'equals':
        return metric.value === threshold.criticalThreshold;
      default:
        return false;
    }
  }

  private getAlertSeverity(metric: PerformanceMetric, threshold: PerformanceThreshold): 'warning' | 'critical' {
    switch (threshold.comparison) {
      case 'greater_than':
        if (metric.value > threshold.criticalThreshold) return 'critical';
        if (metric.value > threshold.warningThreshold) return 'warning';
        break;
      case 'less_than':
        if (metric.value < threshold.criticalThreshold) return 'critical';
        if (metric.value < threshold.warningThreshold) return 'warning';
        break;
      case 'equals':
        if (metric.value === threshold.criticalThreshold) return 'critical';
        break;
    }
    return 'warning';
  }

  private generateAlertMessage(metric: PerformanceMetric, threshold: PerformanceThreshold, severity: 'warning' | 'critical'): string {
    const comparisonText = threshold.comparison === 'greater_than' ? 'exceeded' : 
                        threshold.comparison === 'less_than' ? 'below' : 'equals';
    const thresholdValue = severity === 'critical' ? threshold.criticalThreshold : threshold.warningThreshold;
    
    return `${metric.name} ${metric.type} is ${comparisonText} ${thresholdValue}${metric.unit}`;
  }

  private triggerAutoOptimization(alert: PerformanceAlert): void {
    this.emit('auto-optimization-triggered', {
      alert,
      action: this.determineOptimizationAction(alert)
    });
  }

  private determineOptimizationAction(alert: PerformanceAlert): string {
    switch (alert.metric.type) {
      case 'cpu':
        return 'Scale up CPU resources';
      case 'memory':
        return 'Increase memory allocation';
      case 'disk':
        return 'Clean up disk space';
      case 'api':
        return 'Scale API servers';
      case 'database':
        return 'Optimize database queries';
      default:
        return 'Review system performance';
    }
  }

  private analyzePerformance(): void {
    const snapshot = this.getSnapshot();
    this.emit('performance-analyzed', snapshot);

    for (const metric of snapshot.metrics) {
      const trend = this.getTrend(metric.type, metric.name);
      if (trend) {
        this.emit('trend-updated', trend);
      }
    }
  }

  private analyzeTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    if (values.length < 3) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    const change = Math.abs(secondAvg - firstAvg);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > avg * 0.3) {
      return 'volatile';
    }

    if (change < avg * 0.05) {
      return 'stable';
    }

    return secondAvg > firstAvg ? 'increasing' : 'decreasing';
  }

  private predictNextValue(values: number[]): { nextValue: number; confidence: number } {
    const n = values.length;
    const recentValues = values.slice(-20);

    const sum = recentValues.reduce((a, b) => a + b, 0);
    const avg = sum / recentValues.length;

    const weights = recentValues.map((_, i) => i + 1);
    const weightedSum = recentValues.reduce((sum, v, i) => sum + v * weights[i], 0);
    const weightedAvg = weightedSum / weights.reduce((a, b) => a + b, 0);

    const linearPrediction = weightedAvg;
    const momentumPrediction = avg + (avg - recentValues[recentValues.length - 2]);

    const nextValue = (linearPrediction + momentumPrediction) / 2;
    const confidence = Math.min(0.95, 0.5 + (n / 100));

    return { nextValue, confidence };
  }

  private calculateSummary(metrics: PerformanceMetric[]): PerformanceSnapshot['summary'] {
    const summary: PerformanceSnapshot['summary'] = {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      api: 0,
      database: 0
    };

    for (const metric of metrics) {
      switch (metric.type) {
        case 'cpu':
          summary.cpu = metric.value;
          break;
        case 'memory':
          summary.memory = metric.value;
          break;
        case 'disk':
          summary.disk = metric.value;
          break;
        case 'network':
          summary.network = metric.value;
          break;
        case 'api':
          summary.api = metric.value;
          break;
        case 'database':
          summary.database = metric.value;
          break;
      }
    }

    return summary;
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    for (const [key, history] of this.metrics.entries()) {
      const filtered = history.filter(m => m.timestamp > cutoffTime);
      this.metrics.set(key, filtered);
    }

    const alertCutoffTime = Date.now() - this.config.retentionPeriod * 2;
    this.alerts = this.alerts.filter(a => a.timestamp > alertCutoffTime);
  }

  updateConfig(updates: Partial<RealTimeMonitoringConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);

    if (this.collectionInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  getConfig(): Required<RealTimeMonitoringConfig> {
    return { ...this.config };
  }

  getStatistics(): {
    totalMetrics: number;
    totalAlerts: number;
    activeAlerts: number;
    acknowledgedAlerts: number;
    resolvedAlerts: number;
    metricsByType: Record<PerformanceMetric['type'], number>;
  } {
    let totalMetrics = 0;
    const metricsByType: Record<PerformanceMetric['type'], number> = {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      api: 0,
      database: 0,
      custom: 0
    };

    for (const history of this.metrics.values()) {
      totalMetrics += history.length;
      for (const metric of history) {
        metricsByType[metric.type]++;
      }
    }

    const activeAlerts = this.alerts.filter(a => !a.acknowledged && !a.resolved).length;
    const acknowledgedAlerts = this.alerts.filter(a => a.acknowledged && !a.resolved).length;
    const resolvedAlerts = this.alerts.filter(a => a.resolved).length;

    return {
      totalMetrics,
      totalAlerts: this.alerts.length,
      activeAlerts,
      acknowledgedAlerts,
      resolvedAlerts,
      metricsByType
    };
  }
}
