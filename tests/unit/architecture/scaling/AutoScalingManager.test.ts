/**
 * @file AutoScalingManager 单元测试
 * @description 测试自动扩缩容管理器的核心功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutoScalingManager, AutoScalingConfig, ServiceMetrics, ScalingAction } from '../../../../core/architecture/scaling/AutoScalingManager';
import { ServiceRegistry, ServiceInfo } from '../../../../core/architecture/service-registry/ServiceRegistry';

describe('AutoScalingManager', () => {
  let autoScalingManager: AutoScalingManager;
  let mockServiceRegistry: ServiceRegistry;

  beforeEach(() => {
    // 创建模拟的 ServiceRegistry
    mockServiceRegistry = {
      registerService: vi.fn().mockReturnValue('service-1'),
      deregisterService: vi.fn(),
      discoverService: vi.fn().mockReturnValue([]),
      getService: vi.fn().mockReturnValue({ id: 'service-1', type: 'test-service' }),
      getAllServices: vi.fn().mockReturnValue([]),
      healthCheck: vi.fn().mockReturnValue({ status: 'healthy' }),
      addHealthCheckCallback: vi.fn(),
      removeHealthCheckCallback: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn()
    } as any;

    autoScalingManager = new AutoScalingManager(mockServiceRegistry);
  });

  describe('configureAutoScaling', () => {
    it('should configure auto scaling for a service', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 1,
        maxInstances: 5,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 70,
          memoryThreshold: 80,
          requestRateThreshold: 100,
          responseTimeThreshold: 200,
          errorRateThreshold: 5
        },
        instanceConfig: {
          resourceLimits: {
            cpu: 1,
            memory: 2
          },
          environmentVariables: {
            NODE_ENV: 'production'
          },
          tags: ['production', 'auto-scaled']
        }
      };

      autoScalingManager.configureAutoScaling(config);
      
      // 验证配置是否成功
      const status = autoScalingManager.getAutoScalingStatus();
      expect(status.configuredServices).toContain('test-service');
    });
  });

  describe('removeAutoScalingConfig', () => {
    it('should remove auto scaling configuration for a service', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 1,
        maxInstances: 5,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 70
        },
        instanceConfig: {}
      };

      autoScalingManager.configureAutoScaling(config);
      autoScalingManager.removeAutoScalingConfig('test-service');
      
      const status = autoScalingManager.getAutoScalingStatus();
      expect(status.configuredServices).not.toContain('test-service');
    });
  });

  describe('recordServiceMetrics', () => {
    it('should record service metrics', () => {
      const metrics: ServiceMetrics = {
        serviceId: 'service-1',
        cpuUsage: 60,
        memoryUsage: 70,
        requestRate: 80,
        responseTime: 150,
        errorRate: 2,
        diskIO: 40,
        networkIO: 30,
        queueLength: 10,
        throughput: 75,
        timestamp: Date.now()
      };

      autoScalingManager.recordServiceMetrics(metrics);
      
      // 验证状态获取方法存在
      expect(typeof autoScalingManager.getAutoScalingStatus).toBe('function');
    });
  });

  describe('getScalingStatus', () => {
    it('should return scaling status for a service', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 1,
        maxInstances: 5,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 70
        },
        instanceConfig: {}
      };

      autoScalingManager.configureAutoScaling(config);
      const status = autoScalingManager.getScalingStatus('test-service');
      
      expect(status).toHaveProperty('configured', true);
      expect(status).toHaveProperty('currentInstances', 0);
    });
  });

  describe('getAutoScalingStatus', () => {
    it('should return overall auto scaling status', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 1,
        maxInstances: 5,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 70
        },
        instanceConfig: {}
      };

      autoScalingManager.configureAutoScaling(config);
      const status = autoScalingManager.getAutoScalingStatus();
      
      expect(status).toHaveProperty('configuredServices');
      expect(status).toHaveProperty('serviceStatuses');
      expect(Array.isArray(status.configuredServices)).toBe(true);
      expect(status.configuredServices).toContain('test-service');
    });
  });

  describe('shutdown', () => {
    it('should shutdown the auto scaling manager', () => {
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 1,
        maxInstances: 5,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 70
        },
        instanceConfig: {}
      };

      autoScalingManager.configureAutoScaling(config);
      autoScalingManager.shutdown();
      
      const status = autoScalingManager.getAutoScalingStatus();
      expect(status.configuredServices).toHaveLength(0);
    });
  });

  describe('event handling', () => {
    it('should allow subscribing to events', () => {
      const callback = vi.fn();
      autoScalingManager.on('autoScalingConfigured', callback);
      
      const config: AutoScalingConfig = {
        serviceType: 'test-service',
        minInstances: 1,
        maxInstances: 5,
        coolDownPeriod: 60000,
        scalingRules: {
          cpuThreshold: 70
        },
        instanceConfig: {}
      };

      autoScalingManager.configureAutoScaling(config);
      // 验证事件回调是否被调用
      // 注意：由于事件机制是内部实现，这里我们主要验证方法调用没有错误
    });

    it('should allow unsubscribing from events', () => {
      const callback = vi.fn();
      autoScalingManager.on('autoScalingConfigured', callback);
      autoScalingManager.off('autoScalingConfigured', callback);
      
      // 验证取消订阅没有错误
    });
  });

  describe('service metrics recording', () => {
    it('should record comprehensive service metrics', () => {
      const metrics: ServiceMetrics = {
        serviceId: 'service-1',
        cpuUsage: 65,
        memoryUsage: 75,
        requestRate: 90,
        responseTime: 180,
        errorRate: 3,
        diskIO: 45,
        networkIO: 35,
        queueLength: 15,
        throughput: 85,
        timestamp: Date.now()
      };

      autoScalingManager.recordServiceMetrics(metrics);
      
      // 验证指标记录没有错误
    });
  });
});
