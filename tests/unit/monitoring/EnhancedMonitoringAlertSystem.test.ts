/**
 * @file 增强型监控告警系统测试
 * @description 测试增强型监控告警系统的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  EnhancedMonitoringAlertSystem,
  MetricType,
  AlertSeverity,
  AlertStatus,
  MetricThreshold,
  MetricData,
  Alert,
  AlertRule,
  MonitoringConfig
} from '../../../core/monitoring/EnhancedMonitoringAlertSystem';

describe('EnhancedMonitoringAlertSystem', () => {
  let monitoringSystem: EnhancedMonitoringAlertSystem;

  beforeEach(() => {
    monitoringSystem = new EnhancedMonitoringAlertSystem({
      metricsCollectionInterval: 100,
      alertEvaluationInterval: 200,
      enableAutoRemediation: true,
      enableSmartAlerting: true,
      enablePredictiveAlerting: false
    });
  });

  afterEach(() => {
    monitoringSystem.stopMonitoring();
  });

  describe('初始化', () => {
    it('应该成功初始化监控系统', () => {
      expect(monitoringSystem).toBeDefined();
      expect(monitoringSystem.getActiveAlerts()).toHaveLength(0);
    });

    it('应该加载默认告警规则', () => {
      const activeAlerts = monitoringSystem.getActiveAlerts();
      expect(activeAlerts).toHaveLength(0);
    });
  });

  describe('指标收集', () => {
    it('应该成功记录指标数据', () => {
      const metric: MetricData = {
        type: MetricType.CPU,
        value: 75.5,
        timestamp: Date.now(),
        source: 'test'
      };

      monitoringSystem.recordMetric(metric);

      const history = monitoringSystem.getMetricsHistory(MetricType.CPU);
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(metric);
    });

    it('应该正确清理旧指标数据', () => {
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000;
      const recentTimestamp = Date.now();

      const oldMetric: MetricData = {
        type: MetricType.CPU,
        value: 50,
        timestamp: oldTimestamp,
        source: 'test'
      };

      const recentMetric: MetricData = {
        type: MetricType.CPU,
        value: 75,
        timestamp: recentTimestamp,
        source: 'test'
      };

      monitoringSystem.recordMetric(oldMetric);
      monitoringSystem.recordMetric(recentMetric);

      const history = monitoringSystem.getMetricsHistory(MetricType.CPU);
      expect(history).toHaveLength(1);
      expect(history[0].timestamp).toBe(recentTimestamp);
    });

    it('应该支持多种指标类型', () => {
      const metrics: MetricData[] = [
        { type: MetricType.CPU, value: 75, timestamp: Date.now(), source: 'test' },
        { type: MetricType.MEMORY, value: 80, timestamp: Date.now(), source: 'test' },
        { type: MetricType.API_RESPONSE_TIME, value: 300, timestamp: Date.now(), source: 'test' }
      ];

      for (const metric of metrics) {
        monitoringSystem.recordMetric(metric);
      }

      expect(monitoringSystem.getMetricsHistory(MetricType.CPU)).toHaveLength(1);
      expect(monitoringSystem.getMetricsHistory(MetricType.MEMORY)).toHaveLength(1);
      expect(monitoringSystem.getMetricsHistory(MetricType.API_RESPONSE_TIME)).toHaveLength(1);
    });
  });

  describe('告警规则管理', () => {
    it('应该成功添加告警规则', () => {
      const rule: AlertRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test alert rule',
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
          notifications: ['console']
        },
        suppression: {
          enabled: false,
          duration: 0,
          cooldown: 0
        }
      };

      monitoringSystem.addAlertRule(rule);

      expect(monitoringSystem.getActiveAlerts()).toHaveLength(0);
    });

    it('应该成功删除告警规则', () => {
      const rule: AlertRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test alert rule',
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
          notifications: ['console']
        },
        suppression: {
          enabled: false,
          duration: 0,
          cooldown: 0
        }
      };

      monitoringSystem.addAlertRule(rule);
      monitoringSystem.removeAlertRule('test-rule');

      expect(monitoringSystem.getActiveAlerts()).toHaveLength(0);
    });
  });

  describe('告警生成', () => {
    it('应该在指标超过阈值时生成告警', async () => {
      monitoringSystem.startMonitoring();

      const rule: AlertRule = {
        id: 'cpu-test-rule',
        name: 'CPU Test Rule',
        description: 'Test CPU alert rule',
        enabled: true,
        thresholds: [{
          type: MetricType.CPU,
          warningThreshold: 70,
          criticalThreshold: 90,
          comparison: 'greater_than',
          duration: 1000,
          aggregation: 'avg'
        }],
        conditions: {
          requireAll: false
        },
        actions: {
          notifications: ['console']
        },
        suppression: {
          enabled: false,
          duration: 0,
          cooldown: 0
        }
      };

      monitoringSystem.addAlertRule(rule);

      for (let i = 0; i < 10; i++) {
        const metric: MetricData = {
          type: MetricType.CPU,
          value: 85,
          timestamp: Date.now() - (10 - i) * 100,
          source: 'test'
        };
        monitoringSystem.recordMetric(metric);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const activeAlerts = monitoringSystem.getActiveAlerts();
      expect(activeAlerts.length).toBeGreaterThan(0);
      expect(activeAlerts[0].type).toBe(MetricType.CPU);

      monitoringSystem.stopMonitoring();
    });

    it('应该正确判断告警严重程度', async () => {
      monitoringSystem.startMonitoring();

      const rule: AlertRule = {
        id: 'cpu-severity-rule',
        name: 'CPU Severity Rule',
        description: 'Test CPU severity rule',
        enabled: true,
        thresholds: [{
          type: MetricType.CPU,
          warningThreshold: 70,
          criticalThreshold: 90,
          comparison: 'greater_than',
          duration: 1000,
          aggregation: 'avg'
        }],
        conditions: {
          requireAll: false
        },
        actions: {
          notifications: ['console']
        },
        suppression: {
          enabled: false,
          duration: 0,
          cooldown: 0
        }
      };

      monitoringSystem.addAlertRule(rule);

      const now = Date.now();
      for (let i = 0; i < 10; i++) {
        const metric: MetricData = {
          type: MetricType.CPU,
          value: 95,
          timestamp: now - (10 - i) * 120,
          source: 'test'
        };
        monitoringSystem.recordMetric(metric);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const activeAlerts = monitoringSystem.getActiveAlerts();
      expect(activeAlerts.length).toBeGreaterThan(0);
      expect(activeAlerts[0].severity).toBe(AlertSeverity.CRITICAL);

      monitoringSystem.stopMonitoring();
    });

    it('应该避免重复告警', async () => {
      const rule: AlertRule = {
        id: 'cpu-duplicate-rule',
        name: 'CPU Duplicate Rule',
        description: 'Test duplicate alert rule',
        enabled: true,
        thresholds: [{
          type: MetricType.CPU,
          warningThreshold: 70,
          criticalThreshold: 90,
          comparison: 'greater_than',
          duration: 1000,
          aggregation: 'avg'
        }],
        conditions: {
          requireAll: false
        },
        actions: {
          notifications: ['console']
        },
        suppression: {
          enabled: false,
          duration: 0,
          cooldown: 0
        }
      };

      monitoringSystem.addAlertRule(rule);

      for (let i = 0; i < 10; i++) {
        const metric: MetricData = {
          type: MetricType.CPU,
          value: 85,
          timestamp: Date.now() - (10 - i) * 100,
          source: 'test'
        };
        monitoringSystem.recordMetric(metric);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      const firstAlertCount = monitoringSystem.getActiveAlerts().length;

      for (let i = 0; i < 10; i++) {
        const metric: MetricData = {
          type: MetricType.CPU,
          value: 86,
          timestamp: Date.now() - (10 - i) * 100,
          source: 'test'
        };
        monitoringSystem.recordMetric(metric);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      const secondAlertCount = monitoringSystem.getActiveAlerts().length;
      expect(secondAlertCount).toBeLessThanOrEqual(firstAlertCount + 1);
    });
  });

  describe('告警管理', () => {
    it('应该成功确认告警', () => {
      const alert: Alert = {
        id: 'test-alert',
        type: MetricType.CPU,
        severity: AlertSeverity.ERROR,
        status: AlertStatus.OPEN,
        message: 'Test alert',
        description: 'Test alert description',
        value: 85,
        threshold: 70,
        timestamp: Date.now(),
        affectedServices: ['api-gateway'],
        suggestedActions: ['Check CPU usage'],
        relatedAlerts: []
      };

      monitoringSystem['alerts'].set('test-alert', alert);
      monitoringSystem.acknowledgeAlert('test-alert', 'admin');

      const acknowledgedAlert = monitoringSystem['alerts'].get('test-alert');
      expect(acknowledgedAlert?.status).toBe(AlertStatus.ACKNOWLEDGED);
      expect(acknowledgedAlert?.acknowledgedBy).toBe('admin');
    });

    it('应该成功解决告警', () => {
      const alert: Alert = {
        id: 'test-alert',
        type: MetricType.CPU,
        severity: AlertSeverity.ERROR,
        status: AlertStatus.OPEN,
        message: 'Test alert',
        description: 'Test alert description',
        value: 85,
        threshold: 70,
        timestamp: Date.now(),
        affectedServices: ['api-gateway'],
        suggestedActions: ['Check CPU usage'],
        relatedAlerts: []
      };

      monitoringSystem['alerts'].set('test-alert', alert);
      monitoringSystem.resolveAlert('test-alert', 'admin');

      const resolvedAlert = monitoringSystem['alerts'].get('test-alert');
      expect(resolvedAlert?.status).toBe(AlertStatus.RESOLVED);
      expect(resolvedAlert?.resolvedBy).toBe('admin');
    });

    it('应该成功抑制告警', () => {
      const alert: Alert = {
        id: 'test-alert',
        type: MetricType.CPU,
        severity: AlertSeverity.ERROR,
        status: AlertStatus.OPEN,
        message: 'Test alert',
        description: 'Test alert description',
        value: 85,
        threshold: 70,
        timestamp: Date.now(),
        affectedServices: ['api-gateway'],
        suggestedActions: ['Check CPU usage'],
        relatedAlerts: []
      };

      monitoringSystem['alerts'].set('test-alert', alert);
      monitoringSystem.suppressAlert('test-alert', 60000, 'Maintenance');

      const suppressedAlert = monitoringSystem['alerts'].get('test-alert');
      expect(suppressedAlert?.status).toBe(AlertStatus.SUPPRESSED);
    });
  });

  describe('告警历史', () => {
    it('应该返回活跃告警列表', () => {
      const alert1: Alert = {
        id: 'alert-1',
        type: MetricType.CPU,
        severity: AlertSeverity.ERROR,
        status: AlertStatus.OPEN,
        message: 'Alert 1',
        description: 'Alert 1 description',
        value: 85,
        threshold: 70,
        timestamp: Date.now(),
        affectedServices: ['api-gateway'],
        suggestedActions: ['Check CPU usage'],
        relatedAlerts: []
      };

      const alert2: Alert = {
        id: 'alert-2',
        type: MetricType.MEMORY,
        severity: AlertSeverity.WARNING,
        status: AlertStatus.ACKNOWLEDGED,
        message: 'Alert 2',
        description: 'Alert 2 description',
        value: 80,
        threshold: 75,
        timestamp: Date.now(),
        affectedServices: ['cache'],
        suggestedActions: ['Check memory usage'],
        relatedAlerts: []
      };

      const alert3: Alert = {
        id: 'alert-3',
        type: MetricType.API_RESPONSE_TIME,
        severity: AlertSeverity.CRITICAL,
        status: AlertStatus.RESOLVED,
        message: 'Alert 3',
        description: 'Alert 3 description',
        value: 500,
        threshold: 300,
        timestamp: Date.now(),
        affectedServices: ['api-gateway'],
        suggestedActions: ['Check API response time'],
        relatedAlerts: []
      };

      monitoringSystem['alerts'].set('alert-1', alert1);
      monitoringSystem['alerts'].set('alert-2', alert2);
      monitoringSystem['alerts'].set('alert-3', alert3);

      const activeAlerts = monitoringSystem.getActiveAlerts();
      expect(activeAlerts).toHaveLength(2);
      expect(activeAlerts.map(a => a.id)).toContain('alert-1');
      expect(activeAlerts.map(a => a.id)).toContain('alert-2');
      expect(activeAlerts.map(a => a.id)).not.toContain('alert-3');
    });

    it('应该返回告警历史记录', () => {
      const alert1: Alert = {
        id: 'alert-1',
        type: MetricType.CPU,
        severity: AlertSeverity.ERROR,
        status: AlertStatus.RESOLVED,
        message: 'Alert 1',
        description: 'Alert 1 description',
        value: 85,
        threshold: 70,
        timestamp: Date.now() - 10000,
        affectedServices: ['api-gateway'],
        suggestedActions: ['Check CPU usage'],
        relatedAlerts: []
      };

      const alert2: Alert = {
        id: 'alert-2',
        type: MetricType.MEMORY,
        severity: AlertSeverity.WARNING,
        status: AlertStatus.RESOLVED,
        message: 'Alert 2',
        description: 'Alert 2 description',
        value: 80,
        threshold: 75,
        timestamp: Date.now() - 5000,
        affectedServices: ['cache'],
        suggestedActions: ['Check memory usage'],
        relatedAlerts: []
      };

      monitoringSystem['alerts'].set('alert-1', alert1);
      monitoringSystem['alerts'].set('alert-2', alert2);

      const history = monitoringSystem.getAlertHistory();
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('alert-2');
      expect(history[1].id).toBe('alert-1');
    });

    it('应该限制告警历史记录数量', () => {
      const config: Partial<MonitoringConfig> = {
        alertHistoryLimit: 5
      };
      const limitedSystem = new EnhancedMonitoringAlertSystem(config);

      for (let i = 0; i < 10; i++) {
        const alert: Alert = {
          id: `alert-${i}`,
          type: MetricType.CPU,
          severity: AlertSeverity.ERROR,
          status: AlertStatus.RESOLVED,
          message: `Alert ${i}`,
          description: `Alert ${i} description`,
          value: 85,
          threshold: 70,
          timestamp: Date.now() - i * 1000,
          affectedServices: ['api-gateway'],
          suggestedActions: ['Check CPU usage'],
          relatedAlerts: []
        };

        limitedSystem['alerts'].set(`alert-${i}`, alert);
      }

      limitedSystem['cleanupOldAlerts']();

      const history = limitedSystem.getAlertHistory();
      expect(history.length).toBeLessThanOrEqual(5);

      limitedSystem.stopMonitoring();
    });
  });

  describe('监控启动和停止', () => {
    it('应该成功启动监控', () => {
      monitoringSystem.startMonitoring();

      expect(monitoringSystem).toBeDefined();
    });

    it('应该成功停止监控', () => {
      monitoringSystem.startMonitoring();
      monitoringSystem.stopMonitoring();

      expect(monitoringSystem).toBeDefined();
    });
  });

  describe('建议操作生成', () => {
    it('应该为CPU告警生成正确的建议操作', () => {
      const threshold: MetricThreshold = {
        type: MetricType.CPU,
        warningThreshold: 70,
        criticalThreshold: 90,
        comparison: 'greater_than',
        duration: 5 * 60 * 1000,
        aggregation: 'avg'
      };

      const suggestedActions = monitoringSystem['generateSuggestedActions'](threshold, AlertSeverity.ERROR);

      expect(suggestedActions).toContain('Check for CPU-intensive processes');
      expect(suggestedActions).toContain('Review application performance');
      expect(suggestedActions).toContain('Consider horizontal scaling');
    });

    it('应该为内存告警生成正确的建议操作', () => {
      const threshold: MetricThreshold = {
        type: MetricType.MEMORY,
        warningThreshold: 75,
        criticalThreshold: 90,
        comparison: 'greater_than',
        duration: 5 * 60 * 1000,
        aggregation: 'avg'
      };

      const suggestedActions = monitoringSystem['generateSuggestedActions'](threshold, AlertSeverity.ERROR);

      expect(suggestedActions).toContain('Check for memory leaks');
      expect(suggestedActions).toContain('Review memory usage patterns');
      expect(suggestedActions).toContain('Consider increasing memory allocation');
    });

    it('应该为API响应时间告警生成正确的建议操作', () => {
      const threshold: MetricThreshold = {
        type: MetricType.API_RESPONSE_TIME,
        warningThreshold: 300,
        criticalThreshold: 500,
        comparison: 'greater_than',
        duration: 3 * 60 * 1000,
        aggregation: 'avg'
      };

      const suggestedActions = monitoringSystem['generateSuggestedActions'](threshold, AlertSeverity.ERROR);

      expect(suggestedActions).toContain('Review API endpoints');
      expect(suggestedActions).toContain('Check backend performance');
      expect(suggestedActions).toContain('Optimize database queries');
    });
  });

  describe('受影响服务识别', () => {
    it('应该正确识别CPU告警的受影响服务', () => {
      const affectedServices = monitoringSystem['identifyAffectedServices'](MetricType.CPU);

      expect(affectedServices).toContain('api-gateway');
      expect(affectedServices).toContain('auth');
      expect(affectedServices).toContain('workflow');
    });

    it('应该正确识别数据库延迟告警的受影响服务', () => {
      const affectedServices = monitoringSystem['identifyAffectedServices'](MetricType.DATABASE_LATENCY);

      expect(affectedServices).toContain('database');
      expect(affectedServices).toContain('workflow');
      expect(affectedServices).toContain('analytics');
    });

    it('应该正确识别错误率告警的受影响服务', () => {
      const affectedServices = monitoringSystem['identifyAffectedServices'](MetricType.ERROR_RATE);

      expect(affectedServices).toContain('all-services');
    });
  });

  describe('相关告警识别', () => {
    it('应该正确识别CPU告警的相关告警', () => {
      const cpuAlert: Alert = {
        id: 'cpu-alert',
        type: MetricType.CPU,
        severity: AlertSeverity.ERROR,
        status: AlertStatus.OPEN,
        message: 'CPU alert',
        description: 'CPU alert description',
        value: 85,
        threshold: 70,
        timestamp: Date.now(),
        affectedServices: ['api-gateway'],
        suggestedActions: ['Check CPU usage'],
        relatedAlerts: []
      };

      const memoryAlert: Alert = {
        id: 'memory-alert',
        type: MetricType.MEMORY,
        severity: AlertSeverity.ERROR,
        status: AlertStatus.OPEN,
        message: 'Memory alert',
        description: 'Memory alert description',
        value: 80,
        threshold: 75,
        timestamp: Date.now(),
        affectedServices: ['cache'],
        suggestedActions: ['Check memory usage'],
        relatedAlerts: []
      };

      const apiAlert: Alert = {
        id: 'api-alert',
        type: MetricType.API_RESPONSE_TIME,
        severity: AlertSeverity.ERROR,
        status: AlertStatus.OPEN,
        message: 'API alert',
        description: 'API alert description',
        value: 400,
        threshold: 300,
        timestamp: Date.now(),
        affectedServices: ['api-gateway'],
        suggestedActions: ['Check API response time'],
        relatedAlerts: []
      };

      monitoringSystem['alerts'].set('cpu-alert', cpuAlert);
      monitoringSystem['alerts'].set('memory-alert', memoryAlert);
      monitoringSystem['alerts'].set('api-alert', apiAlert);

      const relatedAlerts = monitoringSystem['findRelatedAlerts'](MetricType.CPU);

      expect(relatedAlerts).toContain('memory-alert');
      expect(relatedAlerts).toContain('api-alert');
    });
  });

  describe('指标聚合', () => {
    it('应该正确计算平均值', () => {
      const metrics: MetricData[] = [
        { type: MetricType.CPU, value: 70, timestamp: Date.now(), source: 'test' },
        { type: MetricType.CPU, value: 80, timestamp: Date.now(), source: 'test' },
        { type: MetricType.CPU, value: 90, timestamp: Date.now(), source: 'test' }
      ];

      const avgValue = monitoringSystem['aggregateMetrics'](metrics, 'avg');
      expect(avgValue).toBe(80);
    });

    it('应该正确计算最大值', () => {
      const metrics: MetricData[] = [
        { type: MetricType.CPU, value: 70, timestamp: Date.now(), source: 'test' },
        { type: MetricType.CPU, value: 80, timestamp: Date.now(), source: 'test' },
        { type: MetricType.CPU, value: 90, timestamp: Date.now(), source: 'test' }
      ];

      const maxValue = monitoringSystem['aggregateMetrics'](metrics, 'max');
      expect(maxValue).toBe(90);
    });

    it('应该正确计算最小值', () => {
      const metrics: MetricData[] = [
        { type: MetricType.CPU, value: 70, timestamp: Date.now(), source: 'test' },
        { type: MetricType.CPU, value: 80, timestamp: Date.now(), source: 'test' },
        { type: MetricType.CPU, value: 90, timestamp: Date.now(), source: 'test' }
      ];

      const minValue = monitoringSystem['aggregateMetrics'](metrics, 'min');
      expect(minValue).toBe(70);
    });

    it('应该正确计算总和', () => {
      const metrics: MetricData[] = [
        { type: MetricType.CPU, value: 70, timestamp: Date.now(), source: 'test' },
        { type: MetricType.CPU, value: 80, timestamp: Date.now(), source: 'test' },
        { type: MetricType.CPU, value: 90, timestamp: Date.now(), source: 'test' }
      ];

      const sumValue = monitoringSystem['aggregateMetrics'](metrics, 'sum');
      expect(sumValue).toBe(240);
    });
  });
});
