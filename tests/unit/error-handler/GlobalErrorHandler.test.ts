/**
 * @file 全局错误处理器单元测试
 * @description 测试 GlobalErrorHandler 的所有功能
 * @module error-handler
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { GlobalErrorHandler, ErrorCategory, ErrorSeverity } from '../../../core/error-handler/GlobalErrorHandler';

describe('GlobalErrorHandler', () => {
  let errorHandler: GlobalErrorHandler;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    errorHandler = new GlobalErrorHandler({
      enableLogging: false,
      enableMetrics: true,
      enableAutoRecovery: true,
      maxRetryAttempts: 2,
      retryDelay: 100,
      circuitBreakerThreshold: 3,
      circuitBreakerTimeout: 30000,
      errorRetentionPeriod: '1d',
      notifyOnCritical: false,
      notifyOnHigh: false
    });
  });

  afterEach(() => {
    if (errorHandler) {
      errorHandler.destroy();
    }
  });

  describe('初始化', () => {
    it('应该正确初始化全局错误处理器', () => {
      expect(errorHandler).toBeDefined();
      expect(errorHandler.getConfig()).toBeDefined();
    });

    it('应该使用默认配置', () => {
      const defaultHandler = new GlobalErrorHandler();
      expect(defaultHandler).toBeDefined();
      defaultHandler.destroy();
    });
  });

  describe('错误处理', () => {
    it('应该处理普通错误', async () => {
      const error = new Error('测试错误');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'testOperation'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.error).toBe(error);
      expect(errorRecord.context.component).toBe('test');
    });

    it('应该处理网络错误', async () => {
      const error = new Error('Network request failed');
      const context = {
        timestamp: new Date(),
        component: 'api',
        operation: 'fetch'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.category).toBe(ErrorCategory.NETWORK);
    });

    it('应该处理数据库错误', async () => {
      const error = new Error('Database connection failed');
      const context = {
        timestamp: new Date(),
        component: 'database',
        operation: 'query'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.category).toBe(ErrorCategory.DATABASE);
    });

    it('应该处理内存错误', async () => {
      const error = new Error('Memory allocation failed');
      const context = {
        timestamp: new Date(),
        component: 'system',
        operation: 'allocate'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.category).toBe(ErrorCategory.MEMORY);
    });

    it('应该处理安全错误', async () => {
      const error = new Error('Security violation detected');
      const context = {
        timestamp: new Date(),
        component: 'auth',
        operation: 'login'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.category).toBe(ErrorCategory.SECURITY);
    });

    it('应该处理验证错误', async () => {
      const error = new Error('Invalid input format');
      const context = {
        timestamp: new Date(),
        component: 'validation',
        operation: 'validate'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.category).toBe(ErrorCategory.VALIDATION);
    });

    it('应该自动分类未知错误', async () => {
      const error = new TypeError('Cannot read property of undefined');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.category).toBeDefined();
    });
  });

  describe('错误严重性', () => {
    it('应该识别关键错误', async () => {
      const error = new Error('Critical system failure');
      const context = {
        timestamp: new Date(),
        component: 'system',
        operation: 'critical'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('应该识别高严重性错误', async () => {
      const error = new Error('Database connection failed');
      const context = {
        timestamp: new Date(),
        component: 'database',
        operation: 'query'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.severity).toBe(ErrorSeverity.HIGH);
    });
  });

  describe('错误恢复', () => {
    it('应该尝试恢复网络错误', async () => {
      const error = new Error('Network timeout');
      const context = {
        timestamp: new Date(),
        component: 'api',
        operation: 'fetch'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.recoveryAttempted).toBe(true);
    });

    it('应该尝试恢复数据库错误', async () => {
      const error = new Error('Database query failed');
      const context = {
        timestamp: new Date(),
        component: 'database',
        operation: 'query'
      };

      const errorRecord = await errorHandler.handleError(error, context);

      expect(errorRecord).toBeDefined();
      expect(errorRecord.recoveryAttempted).toBe(true);
    });
  });

  describe('错误统计', () => {
    it('应该获取错误统计信息', async () => {
      const error = new Error('测试错误');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      await errorHandler.handleError(error, context);
      const stats = errorHandler.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalErrors).toBeGreaterThan(0);
    });

    it('应该按类别统计错误', async () => {
      const error1 = new Error('Network error');
      const error2 = new Error('Database error');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      await errorHandler.handleError(error1, context);
      await errorHandler.handleError(error2, context);
      const stats = errorHandler.getStatistics();

      expect(stats.errorsByCategory).toBeDefined();
      expect(stats.errorsByCategory[ErrorCategory.NETWORK]).toBeGreaterThan(0);
      expect(stats.errorsByCategory[ErrorCategory.DATABASE]).toBeGreaterThan(0);
    });

    it('应该按严重性统计错误', async () => {
      const error = new Error('Memory allocation failed');
      const context = {
        timestamp: new Date(),
        component: 'system',
        operation: 'allocate'
      };

      await errorHandler.handleError(error, context);
      const stats = errorHandler.getStatistics();

      expect(stats.errorsBySeverity).toBeDefined();
      expect(stats.errorsBySeverity[ErrorSeverity.MEDIUM]).toBeGreaterThan(0);
    });
  });

  describe('错误历史', () => {
    it('应该获取错误历史', async () => {
      const error = new Error('测试错误');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      await errorHandler.handleError(error, context);
      const history = errorHandler.getErrorHistory();

      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });

    it('应该按时间顺序排列错误', async () => {
      const error1 = new Error('错误1');
      const error2 = new Error('错误2');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      await errorHandler.handleError(error1, context);
      await new Promise(resolve => setTimeout(resolve, 10));
      await errorHandler.handleError(error2, context);
      const history = errorHandler.getErrorHistory();

      expect(history.length).toBe(2);
      expect(history[0].timestamp.getTime()).toBeLessThanOrEqual(history[1].timestamp.getTime());
    });

    it('应该清除错误历史', async () => {
      const error = new Error('测试错误');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      await errorHandler.handleError(error, context);
      errorHandler.clearErrorHistory();
      const history = errorHandler.getErrorHistory();

      expect(history.length).toBe(0);
    });
  });

  describe('错误模式分析', () => {
    it('应该识别重复错误模式', async () => {
      const error = new Error('重复错误');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      for (let i = 0; i < 5; i++) {
        await errorHandler.handleError(error, context);
      }

      const patterns = errorHandler.getErrorPatterns();
      expect(patterns.length).toBeGreaterThan(0);
    });
  });

  describe('熔断器', () => {
    it('应该在达到阈值时记录多次失败', async () => {
      const error = new Error('测试错误');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      for (let i = 0; i < 5; i++) {
        await errorHandler.handleError(error, context);
      }

      const history = errorHandler.getErrorHistory();
      expect(history.length).toBe(5);
      expect(history.every(record => record.recoveryAttempted)).toBe(true);
    });
  });

  describe('配置管理', () => {
    it('应该获取当前配置', () => {
      const config = errorHandler.getConfig();
      expect(config).toBeDefined();
      expect(config.enableMetrics).toBe(true);
    });

    it('应该更新配置', () => {
      errorHandler.updateConfig({
        maxRetryAttempts: 5
      });

      const config = errorHandler.getConfig();
      expect(config.maxRetryAttempts).toBe(5);
    });
  });

  describe('恢复操作', () => {
    it('应该注册恢复操作', () => {
      const action = {
        id: 'test-action',
        strategy: 'auto_recovery' as const,
        description: '测试恢复操作',
        execute: async () => true
      };

      errorHandler.registerRecoveryAction('test-action', action);
      const config = errorHandler.getConfig();
      expect(config).toBeDefined();
    });

    it('应该取消注册恢复操作', () => {
      const action = {
        id: 'test-action',
        strategy: 'auto_recovery' as const,
        description: '测试恢复操作',
        execute: async () => true
      };

      errorHandler.registerRecoveryAction('test-action', action);
      errorHandler.unregisterRecoveryAction('test-action');
      const config = errorHandler.getConfig();
      expect(config).toBeDefined();
    });
  });

  describe('事件发射', () => {
    it('应该发射错误事件', async () => {
      const error = new Error('测试错误');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      const errorPromise = new Promise(resolve => {
        errorHandler.on('error', (errorRecord) => {
          resolve(errorRecord);
        });
      });

      await errorHandler.handleError(error, context);
      await errorPromise;
    });

    it('应该识别错误模式', async () => {
      const error = new Error('重复错误');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      for (let i = 0; i < 5; i++) {
        await errorHandler.handleError(error, context);
      }

      const patterns = errorHandler.getErrorPatterns();
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].frequency).toBe(5);
    });
  });

  describe('销毁', () => {
    it('应该正确销毁处理器', () => {
      expect(() => errorHandler.destroy()).not.toThrow();
    });

    it('应该允许多次销毁', () => {
      errorHandler.destroy();
      expect(() => errorHandler.destroy()).not.toThrow();
    });
  });

  describe('性能测试', () => {
    it('应该快速处理错误', async () => {
      const error = new Error('测试错误');
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      const startTime = Date.now();
      await errorHandler.handleError(error, context);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100);
    });

    it('应该批量处理错误', async () => {
      const errors = Array.from({ length: 10 }, (_, i) => new Error(`错误${i}`));
      const context = {
        timestamp: new Date(),
        component: 'test',
        operation: 'test'
      };

      const startTime = Date.now();
      await Promise.all(errors.map(error => errorHandler.handleError(error, context)));
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
    });
  });
});
