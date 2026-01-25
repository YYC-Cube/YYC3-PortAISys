/**
 * @file 实时性能监控系统测试
 * @description 测试实时性能监控系统的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  RealTimePerformanceMonitor,
  PerformanceMetric,
  PerformanceThreshold,
  PerformanceAlert,
  RealTimeMonitoringConfig
} from '../../../core/monitoring/RealTimePerformanceMonitor';

describe('RealTimePerformanceMonitor', () => {
  let monitor: RealTimePerformanceMonitor;

  beforeEach(() => {
    monitor = new RealTimePerformanceMonitor({
      collectionInterval: 100,
      retentionPeriod: 60000,
      enableAlerts: true,
      enablePrediction: true,
      enableAutoOptimization: false,
      maxDataPoints: 1000
    });
  });

  afterEach(() => {
    monitor.stopMonitoring();
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化监控系统', () => {
      expect(monitor).toBeDefined();
      const config = monitor.getConfig();
      expect(config.collectionInterval).toBe(100);
      expect(config.enableAlerts).toBe(true);
    });

    it('应该使用默认配置', () => {
      const defaultMonitor = new RealTimePerformanceMonitor();
      const config = defaultMonitor.getConfig();

      expect(config.collectionInterval).toBe(1000);
      expect(config.retentionPeriod).toBe(3600000);
      expect(config.enableAlerts).toBe(true);
    });
  });

  describe('指标记录', () => {
    it('应该成功记录指标', () => {
      const metric: PerformanceMetric = {
        id: 'cpu-1',
        type: 'cpu',
        name: 'usage',
        value: 75.5,
        unit: '%',
        timestamp: Date.now(),
        source: 'system'
      };

      monitor.recordMetric(metric);

      const currentMetrics = monitor.getCurrentMetrics();
      expect(currentMetrics).toHaveLength(1);
      expect(currentMetrics[0]).toEqual(metric);
    });

    it('应该记录多个指标', () => {
      const metrics: PerformanceMetric[] = [
        {
          id: 'cpu-1',
          type: 'cpu',
          name: 'usage',
          value: 75.5,
          unit: '%',
          timestamp: Date.now(),
          source: 'system'
        },
        {
          id: 'memory-1',
          type: 'memory',
          name: 'usage',
          value: 1024,
          unit: 'MB',
          timestamp: Date.now(),
          source: 'system'
        }
      ];

      monitor.recordMetrics(metrics);

      const currentMetrics = monitor.getCurrentMetrics();
      expect(currentMetrics).toHaveLength(2);
    });

    it('应该限制历史数据点数量', () => {
      const monitorWithLimit = new RealTimePerformanceMonitor({
        maxDataPoints: 5
      });

      for (let i = 0; i < 10; i++) {
        const metric: PerformanceMetric = {
          id: `cpu-${i}`,
          type: 'cpu',
          name: 'usage',
          value: 50 + i,
          unit: '%',
          timestamp: Date.now() + i * 1000,
          source: 'system'
        };

        monitorWithLimit.recordMetric(metric);
      }

      const history = monitorWithLimit.getMetricsHistory('cpu', 'usage');
      expect(history.length).toBeLessThanOrEqual(5);

      monitorWithLimit.stopMonitoring();
    });
  });

  describe('阈值管理', () => {
    it('应该成功添加阈值', () => {
      const threshold: PerformanceThreshold = {
        metricType: 'cpu',
        metricName: 'usage',
        warningThreshold: 70,
        criticalThreshold: 90,
        comparison: 'greater_than',
        duration: 5000
      };

      monitor.addThreshold(threshold);

      const thresholds = monitor.getThresholds();
      expect(thresholds).toHaveLength(1);
      expect(thresholds[0]).toEqual(threshold);
    });

    it('应该成功删除阈值', () => {
      const threshold: PerformanceThreshold = {
        metricType: 'cpu',
        metricName: 'usage',
        warningThreshold: 70,
        criticalThreshold: 90,
        comparison: 'greater_than',
        duration: 5000
      };

      monitor.addThreshold(threshold);
      expect(monitor.getThresholds()).toHaveLength(1);

      monitor.removeThreshold('cpu-usage');
      expect(monitor.getThresholds()).toHaveLength(0);
    });

    it('应该在超过阈值时触发告警', () => {
      const threshold: PerformanceThreshold = {
        metricType: 'cpu',
        metricName: 'usage',
        warningThreshold: 70,
        criticalThreshold: 90,
        comparison: 'greater_than',
        duration: 5000
      };

      monitor.addThreshold(threshold);

      const metric: PerformanceMetric = {
        id: 'cpu-1',
        type: 'cpu',
        name: 'usage',
        value: 95,
        unit: '%',
        timestamp: Date.now(),
        source: 'system'
      };

      monitor.recordMetric(metric);

      const alerts = monitor.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe('critical');
    });
  });

  describe('告警管理', () => {
    it('应该成功确认告警', () => {
      const alert: PerformanceAlert = {
        id: 'alert-1',
        metric: {
          id: 'cpu-1',
          type: 'cpu',
          name: 'usage',
          value: 95,
          unit: '%',
          timestamp: Date.now(),
          source: 'system'
        },
        threshold: {
          metricType: 'cpu',
          metricName: 'usage',
          warningThreshold: 70,
          criticalThreshold: 90,
          comparison: 'greater_than',
          duration: 5000
        },
        severity: 'critical',
        message: 'CPU usage exceeded 90%',
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false
      };

      monitor['alerts'].push(alert);

      monitor.acknowledgeAlert('alert-1');

      const alerts = monitor.getAlerts(true, false);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].acknowledged).toBe(true);
    });

    it('应该成功解决告警', () => {
      const alert: PerformanceAlert = {
        id: 'alert-1',
        metric: {
          id: 'cpu-1',
          type: 'cpu',
          name: 'usage',
          value: 95,
          unit: '%',
          timestamp: Date.now(),
          source: 'system'
        },
        threshold: {
          metricType: 'cpu',
          metricName: 'usage',
          warningThreshold: 70,
          criticalThreshold: 90,
          comparison: 'greater_than',
          duration: 5000
        },
        severity: 'critical',
        message: 'CPU usage exceeded 90%',
        timestamp: Date.now(),
        acknowledged: true,
        resolved: false
      };

      monitor['alerts'].push(alert);

      monitor.resolveAlert('alert-1');

      const alerts = monitor.getAlerts(true, true);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].resolved).toBe(true);
    });

    it('应该过滤告警列表', () => {
      const alerts: PerformanceAlert[] = [
        {
          id: 'alert-1',
          metric: {
            id: 'cpu-1',
            type: 'cpu',
            name: 'usage',
            value: 95,
            unit: '%',
            timestamp: Date.now(),
            source: 'system'
          },
          threshold: {
            metricType: 'cpu',
            metricName: 'usage',
            warningThreshold: 70,
            criticalThreshold: 90,
            comparison: 'greater_than',
            duration: 5000
          },
          severity: 'critical',
          message: 'CPU usage exceeded 90%',
          timestamp: Date.now(),
          acknowledged: true,
          resolved: true
        },
        {
          id: 'alert-2',
          metric: {
            id: 'cpu-2',
            type: 'cpu',
            name: 'usage',
            value: 85,
            unit: '%',
            timestamp: Date.now(),
            source: 'system'
          },
          threshold: {
            metricType: 'cpu',
            metricName: 'usage',
            warningThreshold: 70,
            criticalThreshold: 90,
            comparison: 'greater_than',
            duration: 5000
          },
          severity: 'warning',
          message: 'CPU usage exceeded 70%',
          timestamp: Date.now(),
          acknowledged: false,
          resolved: false
        }
      ];

      monitor['alerts'].push(...alerts);

      const unacknowledgedAlerts = monitor.getAlerts(false, false);
      expect(unacknowledgedAlerts).toHaveLength(1);

      const activeAlerts = monitor.getAlerts(false, false);
      expect(activeAlerts).toHaveLength(1);
    });
  });

  describe('趋势分析', () => {
    it('应该正确分析上升趋势', () => {
      const values = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

      for (let i = 0; i < values.length; i++) {
        const metric: PerformanceMetric = {
          id: `cpu-${i}`,
          type: 'cpu',
          name: 'usage',
          value: values[i],
          unit: '%',
          timestamp: Date.now() + i * 1000,
          source: 'system'
        };

        monitor.recordMetric(metric);
      }

      const trend = monitor.getTrend('cpu', 'usage', 100);
      expect(trend).toBeDefined();
      expect(trend?.trend).toBe('increasing');
    });

    it('应该正确分析下降趋势', () => {
      const values = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

      for (let i = 0; i < values.length; i++) {
        const metric: PerformanceMetric = {
          id: `cpu-${i}`,
          type: 'cpu',
          name: 'usage',
          value: values[i],
          unit: '%',
          timestamp: Date.now() + i * 1000,
          source: 'system'
        };

        monitor.recordMetric(metric);
      }

      const trend = monitor.getTrend('cpu', 'usage', 100);
      expect(trend).toBeDefined();
      expect(trend?.trend).toBe('decreasing');
    });

    it('应该正确分析稳定趋势', () => {
      const values = [70, 71, 70, 72, 70, 71, 70, 72, 70, 71, 70];

      for (let i = 0; i < values.length; i++) {
        const metric: PerformanceMetric = {
          id: `cpu-${i}`,
          type: 'cpu',
          name: 'usage',
          value: values[i],
          unit: '%',
          timestamp: Date.now() + i * 1000,
          source: 'system'
        };

        monitor.recordMetric(metric);
      }

      const trend = monitor.getTrend('cpu', 'usage', 100);
      expect(trend).toBeDefined();
      expect(trend?.trend).toBe('stable');
    });

    it('应该正确计算平均值', () => {
      const values = [50, 60, 70, 80, 90, 70, 70, 70, 70, 70, 70, 70];

      for (let i = 0; i < values.length; i++) {
        const metric: PerformanceMetric = {
          id: `cpu-${i}`,
          type: 'cpu',
          name: 'usage',
          value: values[i],
          unit: '%',
          timestamp: Date.now() + i * 1000,
          source: 'system'
        };

        monitor.recordMetric(metric);
      }

      const trend = monitor.getTrend('cpu', 'usage', 100);
      expect(trend).toBeDefined();
      expect(trend?.average).toBeCloseTo(70, 0);
    });

    it('应该正确计算最小值和最大值', () => {
      const values = [50, 60, 70, 80, 90, 70, 70, 70, 70, 70, 70, 70];

      for (let i = 0; i < values.length; i++) {
        const metric: PerformanceMetric = {
          id: `cpu-${i}`,
          type: 'cpu',
          name: 'usage',
          value: values[i],
          unit: '%',
          timestamp: Date.now() + i * 1000,
          source: 'system'
        };

        monitor.recordMetric(metric);
      }

      const trend = monitor.getTrend('cpu', 'usage', 100);
      expect(trend).toBeDefined();
      expect(trend?.min).toBe(50);
      expect(trend?.max).toBe(90);
    });
  });

  describe('快照生成', () => {
    it('应该生成性能快照', () => {
      const metrics: PerformanceMetric[] = [
        {
          id: 'cpu-1',
          type: 'cpu',
          name: 'usage',
          value: 75.5,
          unit: '%',
          timestamp: Date.now(),
          source: 'system'
        },
        {
          id: 'memory-1',
          type: 'memory',
          name: 'usage',
          value: 1024,
          unit: 'MB',
          timestamp: Date.now(),
          source: 'system'
        }
      ];

      monitor.recordMetrics(metrics);

      const snapshot = monitor.getSnapshot();

      expect(snapshot).toBeDefined();
      expect(snapshot.metrics).toHaveLength(2);
      expect(snapshot.summary.cpu).toBe(75.5);
      expect(snapshot.summary.memory).toBe(1024);
    });
  });

  describe('统计信息', () => {
    it('应该正确计算统计信息', () => {
      const metrics: PerformanceMetric[] = [
        {
          id: 'cpu-1',
          type: 'cpu',
          name: 'usage',
          value: 75,
          unit: '%',
          timestamp: Date.now(),
          source: 'system'
        },
        {
          id: 'memory-1',
          type: 'memory',
          name: 'usage',
          value: 1024,
          unit: 'MB',
          timestamp: Date.now(),
          source: 'system'
        }
      ];

      monitor.recordMetrics(metrics);

      const alert: PerformanceAlert = {
        id: 'alert-1',
        metric: metrics[0],
        threshold: {
          metricType: 'cpu',
          metricName: 'usage',
          warningThreshold: 70,
          criticalThreshold: 90,
          comparison: 'greater_than',
          duration: 5000
        },
        severity: 'warning',
        message: 'CPU usage exceeded 70%',
        timestamp: Date.now(),
        acknowledged: false,
        resolved: false
      };

      monitor['alerts'].push(alert);

      const stats = monitor.getStatistics();

      expect(stats.totalMetrics).toBe(2);
      expect(stats.totalAlerts).toBe(1);
      expect(stats.activeAlerts).toBe(1);
      expect(stats.metricsByType.cpu).toBe(1);
      expect(stats.metricsByType.memory).toBe(1);
    });
  });

  describe('配置管理', () => {
    it('应该成功更新配置', () => {
      monitor.updateConfig({
        collectionInterval: 200,
        enableAutoOptimization: true
      });

      const config = monitor.getConfig();
      expect(config.collectionInterval).toBe(200);
      expect(config.enableAutoOptimization).toBe(true);
    });

    it('应该保持其他配置不变', () => {
      const originalRetention = monitor.getConfig().retentionPeriod;

      monitor.updateConfig({
        collectionInterval: 200
      });

      const config = monitor.getConfig();
      expect(config.retentionPeriod).toBe(originalRetention);
    });
  });

  describe('监控启动和停止', () => {
    it('应该成功启动监控', () => {
      monitor.startMonitoring();

      const config = monitor.getConfig();
      expect(config).toBeDefined();
    });

    it('应该成功停止监控', () => {
      monitor.startMonitoring();
      monitor.stopMonitoring();

      expect(monitor).toBeDefined();
    });
  });

  describe('事件发射', () => {
    it('应该在记录指标时发射事件', () => {
      const metricHandler = vi.fn();
      monitor.on('metric-recorded', metricHandler);

      const metric: PerformanceMetric = {
        id: 'cpu-1',
        type: 'cpu',
        name: 'usage',
        value: 75,
        unit: '%',
        timestamp: Date.now(),
        source: 'system'
      };

      monitor.recordMetric(metric);

      expect(metricHandler).toHaveBeenCalledWith(metric);
    });

    it('应该在添加阈值时发射事件', () => {
      const thresholdHandler = vi.fn();
      monitor.on('threshold-added', thresholdHandler);

      const threshold: PerformanceThreshold = {
        metricType: 'cpu',
        metricName: 'usage',
        warningThreshold: 70,
        criticalThreshold: 90,
        comparison: 'greater_than',
        duration: 5000
      };

      monitor.addThreshold(threshold);

      expect(thresholdHandler).toHaveBeenCalledWith(threshold);
    });

    it('应该在触发告警时发射事件', () => {
      const alertHandler = vi.fn();
      monitor.on('alert-triggered', alertHandler);

      const threshold: PerformanceThreshold = {
        metricType: 'cpu',
        metricName: 'usage',
        warningThreshold: 70,
        criticalThreshold: 90,
        comparison: 'greater_than',
        duration: 5000
      };

      monitor.addThreshold(threshold);

      const metric: PerformanceMetric = {
        id: 'cpu-1',
        type: 'cpu',
        name: 'usage',
        value: 95,
        unit: '%',
        timestamp: Date.now(),
        source: 'system'
      };

      monitor.recordMetric(metric);

      expect(alertHandler).toHaveBeenCalled();
    });
  });

  describe('历史数据清理', () => {
    it('应该清理过期的指标数据', () => {
      const monitorWithShortRetention = new RealTimePerformanceMonitor({
        retentionPeriod: 1000,
        maxDataPoints: 1000
      });

      const oldMetric: PerformanceMetric = {
        id: 'cpu-1',
        type: 'cpu',
        name: 'usage',
        value: 75,
        unit: '%',
        timestamp: Date.now() - 2000,
        source: 'system'
      };

      const newMetric: PerformanceMetric = {
        id: 'cpu-2',
        type: 'cpu',
        name: 'usage',
        value: 80,
        unit: '%',
        timestamp: Date.now(),
        source: 'system'
      };

      monitorWithShortRetention.recordMetric(oldMetric);
      monitorWithShortRetention.recordMetric(newMetric);

      const history = monitorWithShortRetention.getMetricsHistory('cpu', 'usage');
      expect(history.length).toBe(1);
      expect(history[0].value).toBe(80);

      monitorWithShortRetention.stopMonitoring();
    });
  });
});
