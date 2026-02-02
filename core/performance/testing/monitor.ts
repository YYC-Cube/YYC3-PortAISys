/**
 * @file 性能监控器实现
 * @description 实现性能监控器，用于收集和监控性能指标
 * @module performance-testing
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-07
 */

import EventEmitter from 'eventemitter3';
import {
  PerformanceMetric,
  PerformanceThreshold,
  ThresholdViolation,
  PerformanceMonitor,
  MetricType,
  Logger
} from './types';

export class PerformanceMonitorImpl extends EventEmitter implements PerformanceMonitor {
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map();
  private metricsHistory: Map<string, PerformanceMetric[]> = new Map();
  private logger: Logger;
  private collectionInterval: number = 1000;

  constructor(logger: Logger, collectionInterval: number = 1000) {
    super();
    this.logger = logger;
    this.collectionInterval = collectionInterval;
  }

  async startMonitoring(testId: string): Promise<void> {
    this.logger.info(`开始监控测试: ${testId}`);

    if (this.activeMonitors.has(testId)) {
      this.logger.warn(`测试 ${testId} 的监控已经在运行中`);
      return;
    }

    this.metricsHistory.set(testId, []);

    const interval = setInterval(async () => {
      try {
        const metrics = await this.collectSystemMetrics(testId);
        this.metricsHistory.get(testId)?.push(...metrics);
        this.emit('metricsCollected', { testId, metrics });
      } catch (error) {
        this.logger.error(`收集指标失败: ${testId}`, error as Error);
      }
    }, this.collectionInterval);

    this.activeMonitors.set(testId, interval);
    this.emit('monitoringStarted', { testId });
  }

  async stopMonitoring(testId: string): Promise<void> {
    this.logger.info(`停止监控测试: ${testId}`);

    const interval = this.activeMonitors.get(testId);
    if (!interval) {
      this.logger.warn(`测试 ${testId} 的监控未在运行`);
      return;
    }

    clearInterval(interval);
    this.activeMonitors.delete(testId);
    this.emit('monitoringStopped', { testId });
  }

  async collectMetrics(testId: string): Promise<PerformanceMetric[]> {
    const metrics = this.metricsHistory.get(testId) || [];
    this.logger.debug(`收集测试 ${testId} 的指标`, { count: metrics.length });
    return metrics;
  }

  checkThresholds(
    metrics: PerformanceMetric[],
    thresholds: PerformanceThreshold[]
  ): ThresholdViolation[] {
    const violations: ThresholdViolation[] = [];

    for (const threshold of thresholds) {
      if (!threshold.enabled) {
        continue;
      }

      const metric = metrics.find(m => m.name === threshold.metricName);
      if (!metric) {
        this.logger.warn(`未找到指标: ${threshold.metricName}`);
        continue;
      }

      const violation = this.checkThreshold(metric, threshold);
      if (violation) {
        violations.push(violation);
      }
    }

    if (violations.length > 0) {
      this.emit('thresholdViolations', violations);
    }

    return violations;
  }

  private checkThreshold(
    metric: PerformanceMetric,
    threshold: PerformanceThreshold
  ): ThresholdViolation | null {
    const { value } = metric;
    const { warningThreshold, criticalThreshold, comparison } = threshold;

    let severity: 'warning' | 'critical' | null = null;

    switch (comparison) {
      case 'less_than':
        if (value > criticalThreshold) {
          severity = 'critical';
        } else if (value > warningThreshold) {
          severity = 'warning';
        }
        break;
      case 'greater_than':
        if (value < criticalThreshold) {
          severity = 'critical';
        } else if (value < warningThreshold) {
          severity = 'warning';
        }
        break;
      case 'equals':
        if (Math.abs(value - criticalThreshold) < 0.001) {
          severity = 'critical';
        } else if (Math.abs(value - warningThreshold) < 0.001) {
          severity = 'warning';
        }
        break;
    }

    if (!severity) {
      return null;
    }

    return {
      metricName: metric.name,
      threshold,
      actualValue: value,
      severity,
      timestamp: new Date()
    };
  }

  private async collectSystemMetrics(_testId: string): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [];
    const timestamp = new Date();

    try {
      const cpuUsage = await this.getCPUUsage();
      metrics.push({
        name: 'cpu_usage',
        type: MetricType.RESOURCE_UTILIZATION,
        value: cpuUsage,
        unit: '%',
        timestamp
      });
    } catch (error) {
      this.logger.error('收集CPU使用率失败', error as Error);
    }

    try {
      const memoryUsage = await this.getMemoryUsage();
      metrics.push({
        name: 'memory_usage',
        type: MetricType.RESOURCE_UTILIZATION,
        value: memoryUsage,
        unit: '%',
        timestamp
      });
    } catch (error) {
      this.logger.error('收集内存使用率失败', error as Error);
    }

    try {
      const networkIO = await this.getNetworkIO();
      metrics.push({
        name: 'network_io',
        type: MetricType.RESOURCE_UTILIZATION,
        value: networkIO,
        unit: 'MB/s',
        timestamp
      });
    } catch (error) {
      this.logger.error('收集网络IO失败', error as Error);
    }

    return metrics;
  }

  private async getCPUUsage(): Promise<number> {
    const cpus = require('os').cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu: any) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle / total);

    return usage;
  }

  private async getMemoryUsage(): Promise<number> {
    const totalmem = require('os').totalmem();
    const freemem = require('os').freemem();
    const used = totalmem - freemem;
    const usage = (used / totalmem) * 100;

    return usage;
  }

  private async getNetworkIO(): Promise<number> {
    return 0;
  }

  getMetricsHistory(testId: string): PerformanceMetric[] {
    return this.metricsHistory.get(testId) || [];
  }

  clearMetricsHistory(testId: string): void {
    this.metricsHistory.delete(testId);
    this.logger.debug(`清除测试 ${testId} 的指标历史`);
  }

  setCollectionInterval(interval: number): void {
    this.collectionInterval = interval;
    this.logger.debug(`设置指标收集间隔: ${interval}ms`);
  }
}
