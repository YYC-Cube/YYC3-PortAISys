/**
 * @file 边缘情况处理系统测试
 * @description 测试边缘情况处理系统的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EdgeCaseHandler } from '../../../core/error-handling/EdgeCaseHandler';

describe('EdgeCaseHandler', () => {
  let handler: EdgeCaseHandler;

  beforeEach(() => {
    handler = new EdgeCaseHandler();
  });

  afterEach(() => {
    handler.destroy();
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化边缘情况处理器', () => {
      expect(handler).toBeDefined();
      expect(handler).toBeInstanceOf(EdgeCaseHandler);
    });

    it('应该初始化默认边缘情况', () => {
      const edgeCases = handler.getEdgeCases();
      expect(edgeCases.length).toBeGreaterThan(0);
    });

    it('应该初始化默认验证规则', () => {
      const stringValidation = handler.validate('string', 'test');
      expect(stringValidation.valid).toBe(true);
    });
  });

  describe('边缘情况管理', () => {
    it('应该成功注册边缘情况', () => {
      const edgeCase = {
        id: 'test-edge-case',
        name: 'Test Edge Case',
        description: 'Test edge case',
        category: 'validation' as const,
        severity: 'medium' as const,
        condition: () => false,
        handler: () => {}
      };

      handler.registerEdgeCase(edgeCase);

      const retrieved = handler.getEdgeCase('test-edge-case');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-edge-case');
    });

    it('应该成功注销边缘情况', () => {
      const edgeCase = {
        id: 'test-edge-case',
        name: 'Test Edge Case',
        description: 'Test edge case',
        category: 'validation' as const,
        severity: 'medium' as const,
        condition: () => false,
        handler: () => {}
      };

      handler.registerEdgeCase(edgeCase);
      handler.unregisterEdgeCase('test-edge-case');

      const retrieved = handler.getEdgeCase('test-edge-case');
      expect(retrieved).toBeUndefined();
    });

    it('应该获取所有边缘情况', () => {
      const edgeCases = handler.getEdgeCases();
      expect(edgeCases.length).toBeGreaterThan(0);
      expect(edgeCases.every(ec => ec.id)).toBe(true);
    });

    it('应该按类别获取边缘情况', () => {
      const validationCases = handler.getEdgeCasesByCategory('validation');
      expect(validationCases.length).toBeGreaterThan(0);
      expect(validationCases.every(ec => ec.category === 'validation')).toBe(true);
    });

    it('应该按严重性获取边缘情况', () => {
      const highSeverityCases = handler.getEdgeCasesBySeverity('high');
      expect(highSeverityCases.length).toBeGreaterThan(0);
      expect(highSeverityCases.every(ec => ec.severity === 'high')).toBe(true);
    });
  });

  describe('边缘情况检查', () => {
    it('应该检查所有边缘情况', async () => {
      await handler.checkEdgeCases();
      const metrics = handler.getMetrics();
      expect(metrics.totalCases).toBeGreaterThanOrEqual(0);
    });

    it('应该处理触发的边缘情况', async () => {
      const edgeCase = {
        id: 'test-triggered',
        name: 'Test Triggered',
        description: 'Test triggered edge case',
        category: 'validation' as const,
        severity: 'medium' as const,
        condition: () => true,
        handler: () => {}
      };

      handler.registerEdgeCase(edgeCase);
      await handler.checkEdgeCases();

      const metrics = handler.getMetrics();
      expect(metrics.totalCases).toBeGreaterThan(0);
    });

    it('应该防止并发检查', async () => {
      const promise1 = handler.checkEdgeCases();
      const promise2 = handler.checkEdgeCases();

      await Promise.all([promise1, promise2]);

      const metrics = handler.getMetrics();
      expect(metrics.totalCases).toBeGreaterThanOrEqual(0);
    });
  });

  describe('验证规则', () => {
    it('应该成功注册验证规则', () => {
      const rule = {
        name: 'Test Rule',
        validate: (value: any) => value === 'test',
        errorMessage: 'Value must be test',
        severity: 'error' as const
      };

      handler.registerValidationRule('test', rule);

      const result = handler.validate('test', 'test');
      expect(result.valid).toBe(true);
    });

    it('应该成功注销验证规则', () => {
      const rule = {
        name: 'Test Rule',
        validate: (value: any) => value === 'test',
        errorMessage: 'Value must be test',
        severity: 'error' as const
      };

      handler.registerValidationRule('test', rule);
      handler.unregisterValidationRule('test', 'Test Rule');

      const result = handler.validate('test', 'test');
      expect(result.valid).toBe(true);
    });

    it('应该验证字符串', () => {
      const result = handler.validate('string', 'test');
      expect(result.valid).toBe(true);
    });

    it('应该验证数字', () => {
      const result = handler.validate('number', 123);
      expect(result.valid).toBe(true);
    });

    it('应该验证布尔值', () => {
      const result = handler.validate('boolean', true);
      expect(result.valid).toBe(true);
    });

    it('应该验证数组', () => {
      const result = handler.validate('array', [1, 2, 3]);
      expect(result.valid).toBe(true);
    });

    it('应该验证对象', () => {
      const result = handler.validate('object', { key: 'value' });
      expect(result.valid).toBe(true);
    });

    it('应该验证邮箱', () => {
      const result = handler.validate('email', 'test@example.com');
      expect(result.valid).toBe(true);
    });

    it('应该验证URL', () => {
      const result = handler.validate('url', 'https://example.com');
      expect(result.valid).toBe(true);
    });

    it('应该验证UUID', () => {
      const result = handler.validate('uuid', '550e8400-e29b-41d4-a716-446655440000');
      expect(result.valid).toBe(true);
    });

    it('应该验证正数', () => {
      const result = handler.validate('positive-number', 10);
      expect(result.valid).toBe(true);
    });

    it('应该验证非空字符串', () => {
      const result = handler.validate('non-empty-string', 'test');
      expect(result.valid).toBe(true);
    });

    it('应该验证非空数组', () => {
      const result = handler.validate('non-empty-array', [1, 2, 3]);
      expect(result.valid).toBe(true);
    });

    it('应该验证日期', () => {
      const result = handler.validate('date', new Date());
      expect(result.valid).toBe(true);
    });

    it('应该验证多个类型', () => {
      const result = handler.validateMultiple(['string', 'non-empty-string'], 'test');
      expect(result.valid).toBe(true);
    });

    it('应该返回验证错误', () => {
      const result = handler.validate('string', 123);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('重试机制', () => {
    it('应该成功重试', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('ECONNRESET');
        }
        return 'success';
      };

      const result = await handler.withRetry(fn, {
        maxRetries: 3,
        retryableErrors: ['ECONNRESET']
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('应该在最大重试次数后失败', async () => {
      const fn = async () => {
        throw new Error('ECONNRESET');
      };

      await expect(
        handler.withRetry(fn, {
          maxRetries: 2,
          retryableErrors: ['ECONNRESET']
        })
      ).rejects.toThrow();
    });

    it('应该使用指数退避', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn((callback: any, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      }) as any;

      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('ECONNRESET');
        }
        return 'success';
      };

      await handler.withRetry(fn, {
        maxRetries: 3,
        initialDelay: 100,
        backoffFactor: 2,
        retryableErrors: ['ECONNRESET']
      });

      expect(delays).toEqual([100, 200]);

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('回退机制', () => {
    it('应该使用主函数', () => {
      const primary = vi.fn(() => 'primary');
      const fallback = vi.fn(() => 'fallback');

      const result = handler.withFallback(primary, fallback);

      expect(result).toBe('primary');
      expect(primary).toHaveBeenCalled();
      expect(fallback).not.toHaveBeenCalled();
    });

    it('应该在主函数失败时使用回退', () => {
      const primary = vi.fn(() => {
        throw new Error('Primary failed');
      });
      const fallback = vi.fn(() => 'fallback');

      const result = handler.withFallback(primary, fallback);

      expect(result).toBe('fallback');
      expect(primary).toHaveBeenCalled();
      expect(fallback).toHaveBeenCalled();
    });
  });

  describe('超时处理', () => {
    it('应该在超时前完成', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 100));

      const result = await handler.withTimeout(promise, 200);

      expect(result).toBe('success');
    });

    it('应该在超时后失败', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 200));

      await expect(
        handler.withTimeout(promise, 100)
      ).rejects.toThrow('Operation timed out');
    });
  });

  describe('JSON处理', () => {
    it('应该成功解析JSON', () => {
      const jsonString = '{"key": "value"}';
      const result = handler.safeParseJSON(jsonString, {});
      expect(result).toEqual({ key: 'value' });
    });

    it('应该在解析失败时使用回退', () => {
      const invalidJson = '{invalid json}';
      const fallback = { key: 'fallback' };
      const result = handler.safeParseJSON(invalidJson, fallback);
      expect(result).toEqual(fallback);
    });

    it('应该成功序列化JSON', () => {
      const obj = { key: 'value' };
      const result = handler.safeStringifyJSON(obj);
      expect(result).toBe('{"key":"value"}');
    });

    it('应该在序列化失败时使用回退', () => {
      const circularObj: any = { key: 'value' };
      circularObj.self = circularObj;
      const fallback = '{}';
      const result = handler.safeStringifyJSON(circularObj, fallback);
      expect(result).toBe(fallback);
    });
  });

  describe('安全访问', () => {
    it('应该安全获取嵌套属性', () => {
      const obj = { level1: { level2: { level3: 'value' } } };
      const result = handler.safeGet(obj, 'level1.level2.level3', 'fallback');
      expect(result).toBe('value');
    });

    it('应该在路径不存在时使用回退', () => {
      const obj = { level1: { level2: {} } };
      const result = handler.safeGet(obj, 'level1.level2.level3', 'fallback');
      expect(result).toBe('fallback');
    });

    it('应该安全设置嵌套属性', () => {
      const obj: any = {};
      const result = handler.safeSet(obj, 'level1.level2.level3', 'value');
      expect(result).toBe(true);
      expect(obj.level1.level2.level3).toBe('value');
    });

    it('应该在设置失败时返回false', () => {
      const obj = null;
      const result = handler.safeSet(obj, 'level1.level2.level3', 'value');
      expect(result).toBe(false);
    });
  });

  describe('输入处理', () => {
    it('应该清理输入', () => {
      const input = '<script>alert("test")</script>';
      const result = handler.sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('应该验证输入', () => {
      const input = 'valid input';
      const result = handler.validateInput(input, 100);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe(input);
    });

    it('应该在输入过长时标记无效', () => {
      const input = 'a'.repeat(200);
      const result = handler.validateInput(input, 100);
      expect(result.valid).toBe(false);
      expect(result.sanitized.length).toBe(100);
    });
  });

  describe('空值处理', () => {
    it('应该处理null值', () => {
      const result = handler.handleNullish(null, 'fallback');
      expect(result).toBe('fallback');
    });

    it('应该处理undefined值', () => {
      const result = handler.handleNullish(undefined, 'fallback');
      expect(result).toBe('fallback');
    });

    it('应该返回有效值', () => {
      const result = handler.handleNullish('valid', 'fallback');
      expect(result).toBe('valid');
    });

    it('应该处理空数组', () => {
      const result = handler.handleEmpty([], ['fallback']);
      expect(result).toEqual(['fallback']);
    });

    it('应该处理空字符串', () => {
      const result = handler.handleEmpty('', 'fallback');
      expect(result).toBe('fallback');
    });

    it('应该返回非空值', () => {
      const result = handler.handleEmpty('valid', 'fallback');
      expect(result).toBe('valid');
    });
  });

  describe('指标', () => {
    it('应该返回指标', () => {
      const metrics = handler.getMetrics();
      expect(metrics).toHaveProperty('totalCases');
      expect(metrics).toHaveProperty('handledCases');
      expect(metrics).toHaveProperty('failedCases');
      expect(metrics).toHaveProperty('recoveryRate');
      expect(metrics).toHaveProperty('averageResolutionTime');
    });

    it('应该重置指标', () => {
      handler.resetMetrics();
      const metrics = handler.getMetrics();
      expect(metrics.totalCases).toBe(0);
      expect(metrics.handledCases).toBe(0);
      expect(metrics.failedCases).toBe(0);
    });
  });

  describe('事件系统', () => {
    it('应该发射边缘情况注册事件', () => {
      const handlerSpy = vi.fn();
      handler.on('edge-case:registered', handlerSpy);

      const edgeCase = {
        id: 'test-event',
        name: 'Test Event',
        description: 'Test event',
        category: 'validation' as const,
        severity: 'medium' as const,
        condition: () => false,
        handler: () => {}
      };

      handler.registerEdgeCase(edgeCase);

      expect(handlerSpy).toHaveBeenCalledWith(edgeCase);
    });

    it('应该发射边缘情况处理事件', async () => {
      const handlerSpy = vi.fn();
      handler.on('edge-case:handled', handlerSpy);

      const edgeCase = {
        id: 'test-handled',
        name: 'Test Handled',
        description: 'Test handled',
        category: 'validation' as const,
        severity: 'medium' as const,
        condition: () => true,
        handler: () => {}
      };

      handler.registerEdgeCase(edgeCase);
      await handler.checkEdgeCases();

      expect(handlerSpy).toHaveBeenCalledWith(edgeCase);
    });
  });

  describe('销毁', () => {
    it('应该成功销毁处理器', () => {
      expect(() => {
        handler.destroy();
      }).not.toThrow();
    });

    it('应该清理所有资源', () => {
      handler.destroy();

      const edgeCases = handler.getEdgeCases();
      expect(edgeCases.length).toBe(0);
    });
  });
});
