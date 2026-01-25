/**
 * @file Tracing 功能测试
 * @description 验证 OpenTelemetry tracing 集成
 * @author YYC³ Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeTracing, shutdownTracing, withSpan, setSpanAttribute } from '@/tracing';

describe('Tracing Integration', () => {
  beforeAll(async () => {
    // 初始化 tracing（测试环境）
    await initializeTracing({
      serviceName: 'yyc3-test',
      serviceVersion: '1.0.0-test',
      endpoint: 'http://localhost:4318/v1/traces',
      enabled: true,
      enableConsoleLogging: false, // 测试时静默
      isTestEnvironment: true, // 启用测试环境优化
    });
  });

  afterAll(async () => {
    // 清理
    await shutdownTracing();
  });

  it('应该成功初始化 tracing 配置', async () => {
    const { getTracingConfig } = await import('@/tracing');
    const config = getTracingConfig();

    expect(config).toBeDefined();
    expect(config?.getInitializedStatus()).toBe(true);
  });

  it('应该能够创建和执行 span', async () => {
    let spanExecuted = false;

    const result = await withSpan('test-span', async (span) => {
      spanExecuted = true;
      setSpanAttribute('test.attribute', 'test-value');
      return 'success';
    });

    expect(spanExecuted).toBe(true);
    expect(result).toBe('success');
  });

  it('应该能够捕获和记录异常', async () => {
    const testError = new Error('Test error');

    try {
      await withSpan('error-span', async () => {
        throw testError;
      });
    } catch (error) {
      expect(error).toBe(testError);
    }
  });

  it('应该支持嵌套 span', async () => {
    const result = await withSpan('parent-span', async () => {
      const childResult = await withSpan('child-span', async () => {
        return 'child-success';
      });

      return `parent-${childResult}`;
    });

    expect(result).toBe('parent-child-success');
  });

  it('应该能够设置多个属性', async () => {
    await withSpan('multi-attribute-span', async (span) => {
      setSpanAttribute('attr1', 'value1');
      setSpanAttribute('attr2', 42);
      setSpanAttribute('attr3', true);

      // 验证span存在
      expect(span).toBeDefined();
    });
  });
});

describe('Tracing Utils', () => {
  it('应该导出所有必需的函数', async () => {
    const {
      initializeTracing,
      getTracingConfig,
      shutdownTracing,
      getTracer,
      withSpan,
      withSpanSync,
      addSpanEvent,
      setSpanAttribute,
      setSpanAttributes,
      recordSpanException,
      getActiveSpan,
      TraceMethod,
    } = await import('@/tracing');

    expect(initializeTracing).toBeDefined();
    expect(getTracingConfig).toBeDefined();
    expect(shutdownTracing).toBeDefined();
    expect(getTracer).toBeDefined();
    expect(withSpan).toBeDefined();
    expect(withSpanSync).toBeDefined();
    expect(addSpanEvent).toBeDefined();
    expect(setSpanAttribute).toBeDefined();
    expect(setSpanAttributes).toBeDefined();
    expect(recordSpanException).toBeDefined();
    expect(getActiveSpan).toBeDefined();
    expect(TraceMethod).toBeDefined();
  });
});
