/**
 * @file 增强型自动扩缩容管理器测试
 * @description 测试增强型自动扩缩容管理器的各项功能
 * @module __tests__/unit/architecture/scaling/EnhancedAutoScalingManager.test
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  EnhancedAutoScalingManager,
  AutoScalingConfig,
  ServiceMetrics,
  ScalingAction,
  ScalingPrediction
} from '../../../../core/architecture/scaling/EnhancedAutoScalingManager';
import { ServiceRegistry } from '../../../../core/architecture/service-registry/ServiceRegistry';

describe('EnhancedAutoScalingManager', () => {
  let scalingManager: EnhancedAutoScalingManager;
  let serviceRegistry: ServiceRegistry;

  beforeEach(() => {
    serviceRegistry = new ServiceRegistry();
    scalingManager = new EnhancedAutoScalingManager(serviceRegistry);

    vi.useFakeTimers();
  });

  afterEach(() => {
    scalingManager.shutdown();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('configureAutoScaling', () => {
    it('应该成功配置自动扩缩容', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80,
          memoryThreshold: 85,
          requestRateThreshold: 1000,
          responseTimeThreshold: 200,
          errorRateThreshold: 5
        },
        predictiveScaling: {
          enabled: true,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {
          resourceLimits: {
            cpu: 2,
            memory: 4096
          },
          resourceRequests: {
            cpu: 1,
            memory: 2048
          },
          environmentVariables: {
            ENV: 'production'
          },
          tags: ['auto-scaled']
        },
        costOptimization: {
          enabled: true,
          spotInstancePercentage: 0.3,
          preemptibleInstancePercentage: 0.2
        }
      };

      scalingManager.configureAutoScaling(config);

      const status = scalingManager.getScalingStatus('test-service');
      expect(status.configured).toBe(true);
      expect(status.config).toEqual(config);
    });

    it('应该启动监控间隔', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      const eventSpy = vi.fn();
      scalingManager.on('autoScalingConfigured', eventSpy);

      scalingManager.configureAutoScaling(config);

      expect(eventSpy).toHaveBeenCalledWith(config);
    });
  });

  describe('removeAutoScalingConfig', () => {
    it('应该成功移除自动扩缩容配置', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);
      scalingManager.removeAutoScalingConfig('test-service');

      const status = scalingManager.getScalingStatus('test-service');
      expect(status.configured).toBe(false);
    });

    it('应该停止监控间隔', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      const eventSpy = vi.fn();
      scalingManager.on('autoScalingConfigRemoved', eventSpy);

      scalingManager.configureAutoScaling(config);
      scalingManager.removeAutoScalingConfig('test-service');

      expect(eventSpy).toHaveBeenCalledWith({ serviceType: 'test-service' });
    });
  });

  describe('recordServiceMetrics', () => {
    it('应该成功记录服务指标', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);

      const metrics: ServiceMetrics = {
        serviceId: 'test-service-instance-1',
        cpuUsage: 75,
        memoryUsage: 70,
        requestRate: 800,
        responseTime: 150,
        errorRate: 2,
        diskIO: 30,
        networkIO: 40,
        queueLength: 10,
        throughput: 750,
        activeConnections: 50,
        cacheHitRate: 85,
        timestamp: Date.now()
      };

      const eventSpy = vi.fn();
      scalingManager.on('serviceMetricsRecorded', eventSpy);

      scalingManager.recordServiceMetrics(metrics);

      expect(eventSpy).toHaveBeenCalledWith(metrics);
    });

    it('应该保留最近的指标记录', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);

      const oldMetrics: ServiceMetrics = {
        serviceId: 'test-service-instance-1',
        cpuUsage: 75,
        memoryUsage: 70,
        requestRate: 800,
        responseTime: 150,
        errorRate: 2,
        diskIO: 30,
        networkIO: 40,
        queueLength: 10,
        throughput: 750,
        activeConnections: 50,
        cacheHitRate: 85,
        timestamp: Date.now() - 40 * 60 * 1000
      };

      const newMetrics: ServiceMetrics = {
        serviceId: 'test-service-instance-1',
        cpuUsage: 85,
        memoryUsage: 80,
        requestRate: 900,
        responseTime: 180,
        errorRate: 3,
        diskIO: 40,
        networkIO: 50,
        queueLength: 15,
        throughput: 850,
        activeConnections: 60,
        cacheHitRate: 80,
        timestamp: Date.now()
      };

      scalingManager.recordServiceMetrics(oldMetrics);
      scalingManager.recordServiceMetrics(newMetrics);

      const status = scalingManager.getScalingStatus('test-service');
      expect(status.metrics).toBeDefined();
      expect(status.metrics!.length).toBe(1);
    });
  });

  describe('triggerScaling', () => {
    it('应该成功触发扩缩容评估', async () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 0,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);

      const metrics: ServiceMetrics = {
        serviceId: 'test-service-instance-1',
        cpuUsage: 90,
        memoryUsage: 85,
        requestRate: 1200,
        responseTime: 250,
        errorRate: 6,
        diskIO: 50,
        networkIO: 60,
        queueLength: 20,
        throughput: 1100,
        activeConnections: 80,
        cacheHitRate: 75,
        timestamp: Date.now()
      };

      scalingManager.recordServiceMetrics(metrics);

      const action = await scalingManager.triggerScaling('test-service');

      expect(action).toBeDefined();
      expect(action.serviceType).toBe('test-service');
    });
  });

  describe('generatePrediction', () => {
    it('应该成功生成预测性扩缩容建议', async () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: true,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);

      for (let i = 0; i < 15; i++) {
        const metrics: ServiceMetrics = {
          serviceId: 'test-service-instance-1',
          cpuUsage: 70 + i * 2,
          memoryUsage: 65 + i * 1.5,
          requestRate: 750 + i * 50,
          responseTime: 140 + i * 10,
          errorRate: 1.5 + i * 0.2,
          diskIO: 25 + i * 2,
          networkIO: 35 + i * 2,
          queueLength: 8 + i,
          throughput: 700 + i * 40,
          activeConnections: 45 + i * 3,
          cacheHitRate: 88 - i * 0.5,
          timestamp: Date.now() - (15 - i) * 60000
        };

        scalingManager.recordServiceMetrics(metrics);
      }

      const prediction = await scalingManager.generatePrediction('test-service');

      expect(prediction).toBeDefined();
      expect(prediction.serviceType).toBe('test-service');
      expect(prediction.predictedMetrics).toBeDefined();
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.recommendedInstances).toBeGreaterThanOrEqual(0);
      expect(['scale_up', 'scale_down', 'no_action']).toContain(prediction.recommendedAction);
    });

    it('应该在没有足够数据时抛出错误', async () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: true,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);

      await expect(scalingManager.generatePrediction('test-service')).rejects.toThrow(
        'Insufficient metrics data for prediction'
      );
    });

    it('应该在预测性扩缩容未启用时抛出错误', async () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);

      await expect(scalingManager.generatePrediction('test-service')).rejects.toThrow(
        'Predictive scaling not enabled for service test-service'
      );
    });
  });

  describe('getScalingStatus', () => {
    it('应该返回扩缩容状态', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);

      const status = scalingManager.getScalingStatus('test-service');

      expect(status).toBeDefined();
      expect(status.configured).toBe(true);
      expect(status.config).toEqual(config);
      expect(status.currentInstances).toBeGreaterThanOrEqual(0);
    });

    it('应该返回未配置状态', () => {
      const status = scalingManager.getScalingStatus('non-existent-service');

      expect(status).toBeDefined();
      expect(status.configured).toBe(false);
    });
  });

  describe('getAutoScalingStatus', () => {
    it('应该返回所有服务的扩缩容状态', () => {
      const config1: AutoScalingConfig = {
        serviceType: 'service-1',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      const config2: AutoScalingConfig = {
        serviceType: 'service-2',
        minInstances: 1,
        maxInstances: 5,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 70
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config1);
      scalingManager.configureAutoScaling(config2);

      const status = scalingManager.getAutoScalingStatus();

      expect(status).toBeDefined();
      expect(status.configuredServices).toContain('service-1');
      expect(status.configuredServices).toContain('service-2');
      expect(status.serviceStatuses.size).toBe(2);
    });
  });

  describe('事件发射', () => {
    it('应该在扩缩容评估完成时发射事件', async () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 0,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: false,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);

      const eventSpy = vi.fn();
      scalingManager.on('scalingEvaluated', eventSpy);

      const metrics: ServiceMetrics = {
        serviceId: 'test-service-instance-1',
        cpuUsage: 90,
        memoryUsage: 85,
        requestRate: 1200,
        responseTime: 250,
        errorRate: 6,
        diskIO: 50,
        networkIO: 60,
        queueLength: 20,
        throughput: 1100,
        activeConnections: 80,
        cacheHitRate: 75,
        timestamp: Date.now()
      };

      scalingManager.recordServiceMetrics(metrics);
      await scalingManager.triggerScaling('test-service');

      expect(eventSpy).toHaveBeenCalled();
    });

    it('应该在预测生成时发射事件', async () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 2,
        maxInstances: 10,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 80
        },
        predictiveScaling: {
          enabled: true,
          predictionHorizon: 300000,
          confidenceThreshold: 0.8,
          modelType: 'linear'
        },
        instanceConfig: {},
        costOptimization: {
          enabled: false,
          spotInstancePercentage: 0,
          preemptibleInstancePercentage: 0
        }
      };

      scalingManager.configureAutoScaling(config);

      const eventSpy = vi.fn();
      scalingManager.on('predictionGenerated', eventSpy);

      for (let i = 0; i < 15; i++) {
        const metrics: ServiceMetrics = {
          serviceId: 'test-service-instance-1',
          cpuUsage: 70 + i * 2,
          memoryUsage: 65 + i * 1.5,
          requestRate: 750 + i * 50,
          responseTime: 140 + i * 10,
          errorRate: 1.5 + i * 0.2,
          diskIO: 25 + i * 2,
          networkIO: 35 + i * 2,
          queueLength: 8 + i,
          throughput: 700 + i * 40,
          activeConnections: 45 + i * 3,
          cacheHitRate: 88 - i * 0.5,
          timestamp: Date.now() - (15 - i) * 60000
        };

        scalingManager.recordServiceMetrics(metrics);
      }

      await scalingManager.generatePrediction('test-service');

      expect(eventSpy).toHaveBeenCalled();
    });
  });
});
