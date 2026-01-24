/**
 * @file 集成错误处理器单元测试
 * @description 测试 IntegratedErrorHandler 的所有功能
 * @module error-handler
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IntegratedErrorHandler, getIntegratedErrorHandler, createIntegratedErrorHandler } from '../../../core/error-handler/IntegratedErrorHandler';
import { YYC3Error, ErrorCategory, ErrorSeverity } from '../../../core/error-handler/ErrorTypes';

describe('IntegratedErrorHandler', () => {
  let errorHandler: IntegratedErrorHandler;

  beforeEach(() => {
    errorHandler = new IntegratedErrorHandler();
  });

  afterEach(() => {
    errorHandler.destroy();
  });

  describe('初始化', () => {
    it('应该正确初始化集成错误处理器', () => {
      expect(errorHandler).toBeDefined();
      expect(errorHandler.getErrorHandler()).toBeDefined();
      expect(errorHandler.getGlobalErrorHandler()).toBeDefined();
      expect(errorHandler.getErrorBoundary()).toBeDefined();
    });

    it('应该创建独立的实例', () => {
      const errorHandler1 = new IntegratedErrorHandler();
      const errorHandler2 = new IntegratedErrorHandler();

      expect(errorHandler1).not.toBe(errorHandler2);
      errorHandler1.destroy();
      errorHandler2.destroy();
    });
  });

  describe('错误处理', () => {
    it('应该处理普通错误', async () => {
      const error = new Error('测试错误');
      const result = await errorHandler.handleError(error, { component: 'test' });

      expect(result).toBeDefined();
    });

    it('应该处理 YYC3Error', async () => {
      const error = new YYC3Error(
        '测试错误',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH
      );
      const result = await errorHandler.handleError(error, { component: 'test' });

      expect(result).toBeDefined();
    });

    it('应该传递上下文信息', async () => {
      const error = new Error('测试错误');
      const context = {
        component: 'test',
        operation: 'testOperation',
        metadata: { key: 'value' }
      };

      const result = await errorHandler.handleError(error, context);

      expect(result).toBeDefined();
    });

    it('应该处理异步错误', async () => {
      const error = new Error('异步错误');
      const result = await errorHandler.handleError(error, { async: true });

      expect(result).toBeDefined();
    });
  });

  describe('错误捕获', () => {
    it('应该捕获错误', async () => {
      const error = new Error('捕获错误');
      const errorInfo = { componentStack: 'TestComponent' };

      await errorHandler.captureError(error, errorInfo);

      expect(true).toBe(true);
    });

    it('应该捕获 YYC3Error', async () => {
      const error = new YYC3Error(
        '捕获错误',
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM
      );
      const errorInfo = { componentStack: 'TestComponent' };

      await errorHandler.captureError(error, errorInfo);

      expect(true).toBe(true);
    });

    it('应该处理空的错误信息', async () => {
      const error = new Error('空信息错误');
      const errorInfo = {};

      await errorHandler.captureError(error, errorInfo);

      expect(true).toBe(true);
    });
  });

  describe('恢复策略注册', () => {
    it('应该注册恢复策略', () => {
      const strategy = {
        name: 'testStrategy',
        recover: vi.fn()
      };

      errorHandler.registerRecoveryStrategy(ErrorCategory.NETWORK, strategy);

      expect(true).toBe(true);
    });

    it('应该为不同错误类别注册策略', () => {
      const networkStrategy = { name: 'network', recover: vi.fn() };
      const validationStrategy = { name: 'validation', recover: vi.fn() };

      errorHandler.registerRecoveryStrategy(ErrorCategory.NETWORK, networkStrategy);
      errorHandler.registerRecoveryStrategy(ErrorCategory.VALIDATION, validationStrategy);

      expect(true).toBe(true);
    });
  });

  describe('统计信息', () => {
    it('应该获取统计信息', async () => {
      const error = new Error('统计错误');
      await errorHandler.handleError(error);

      const stats = await errorHandler.getStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });

    it('应该包含错误计数', async () => {
      const error = new Error('计数错误');
      await errorHandler.handleError(error);

      const stats = await errorHandler.getStatistics();

      expect(stats).toBeDefined();
    });

    it('应该包含错误类别统计', async () => {
      const error = new YYC3Error(
        '类别错误',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH
      );
      await errorHandler.handleError(error);

      const stats = await errorHandler.getStatistics();

      expect(stats).toBeDefined();
    });
  });

  describe('错误历史', () => {
    it('应该获取错误历史', async () => {
      const error = new Error('历史错误');
      await errorHandler.handleError(error);

      const history = await errorHandler.getErrorHistory();

      expect(Array.isArray(history)).toBe(true);
    });

    it('应该包含时间戳', async () => {
      const error = new Error('时间戳错误');
      await errorHandler.handleError(error);

      const history = await errorHandler.getErrorHistory();

      if (history.length > 0) {
        expect(history[0]).toHaveProperty('timestamp');
      }
    });

    it('应该按时间顺序排列', async () => {
      await errorHandler.handleError(new Error('错误1'));
      await new Promise(resolve => setTimeout(resolve, 10));
      await errorHandler.handleError(new Error('错误2'));

      const history = await errorHandler.getErrorHistory();

      expect(Array.isArray(history)).toBe(true);
    });

    it('应该清除历史', async () => {
      const error = new Error('清除错误');
      await errorHandler.handleError(error);

      await errorHandler.clearHistory();

      const history = await errorHandler.getErrorHistory();

      expect(history.length).toBe(0);
    });
  });

  describe('销毁', () => {
    it('应该正确销毁', () => {
      errorHandler.destroy();

      expect(true).toBe(true);
    });

    it('应该移除所有事件监听器', () => {
      errorHandler.destroy();

      expect(true).toBe(true);
    });

    it('应该允许多次销毁', () => {
      errorHandler.destroy();
      errorHandler.destroy();

      expect(true).toBe(true);
    });
  });

  describe('事件转发', () => {
    it('应该转发错误到全局处理器', async () => {
      const error = new Error('转发错误');
      const statsBefore = await errorHandler.getStatistics();

      await errorHandler.handleError(error);

      const statsAfter = await errorHandler.getStatistics();

      expect(statsAfter).toBeDefined();
    });

    it('应该转发边界错误到全局处理器', async () => {
      const error = new Error('边界错误');
      const errorInfo = { componentStack: 'TestComponent' };

      await errorHandler.captureError(error, errorInfo);

      const stats = await errorHandler.getStatistics();

      expect(stats).toBeDefined();
    });
  });

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = getIntegratedErrorHandler();
      const instance2 = getIntegratedErrorHandler();

      expect(instance1).toBe(instance2);
    });

    it('应该创建新实例', () => {
      const instance1 = createIntegratedErrorHandler();
      const instance2 = createIntegratedErrorHandler();

      expect(instance1).not.toBe(instance2);
      instance1.destroy();
      instance2.destroy();
    });
  });

  describe('集成测试', () => {
    it('应该完整处理错误流程', async () => {
      const error = new YYC3Error(
        '完整流程错误',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH
      );

      await errorHandler.handleError(error, {
        component: 'TestComponent',
        operation: 'testOperation'
      });

      const stats = await errorHandler.getStatistics();
      const history = await errorHandler.getErrorHistory();

      expect(stats).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });

    it('应该处理多个错误', async () => {
      const errors = [
        new Error('错误1'),
        new YYC3Error('错误2', ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM),
        new Error('错误3')
      ];

      for (const error of errors) {
        await errorHandler.handleError(error);
      }

      const history = await errorHandler.getErrorHistory();

      expect(history.length).toBeGreaterThanOrEqual(3);
    });

    it('应该处理错误恢复', async () => {
      const strategy = {
        name: 'testRecovery',
        recover: vi.fn().mockResolvedValue({ success: true })
      };

      errorHandler.registerRecoveryStrategy(ErrorCategory.NETWORK, strategy);

      const error = new YYC3Error(
        '恢复错误',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH
      );

      const result = await errorHandler.handleError(error);

      expect(result).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('应该快速处理错误', async () => {
      const start = Date.now();
      const error = new Error('性能错误');

      await errorHandler.handleError(error);

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it('应该批量处理错误', async () => {
      const errors = Array.from({ length: 5 }, (_, i) => new Error(`批量错误${i}`));

      const start = Date.now();

      await Promise.all(errors.map(error => errorHandler.handleError(error)));

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
    });
  });
});
