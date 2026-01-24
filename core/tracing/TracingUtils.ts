/**
 * @file Tracing工具函数
 * @description 提供手动创建span的工具函数
 * @module tracing/TracingUtils
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-24
 */

import { trace, context, Span, SpanStatusCode, Tracer } from '@opentelemetry/api';

/**
 * 获取当前tracer
 */
export function getTracer(name: string = 'yyc3-core'): Tracer {
  return trace.getTracer(name, '1.0.0');
}

/**
 * 创建并执行一个span
 * @param name - span名称
 * @param fn - 要执行的函数
 * @param attributes - 可选的span属性
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, async (span) => {
    try {
      // 添加自定义属性
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }

      // 执行函数
      const result = await fn(span);

      // 标记成功
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      // 记录错误
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      // 结束span
      span.end();
    }
  });
}

/**
 * 为同步函数创建span
 * @param name - span名称
 * @param fn - 要执行的函数
 * @param attributes - 可选的span属性
 */
export function withSpanSync<T>(
  name: string,
  fn: (span: Span) => T,
  attributes?: Record<string, string | number | boolean>
): T {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, (span) => {
    try {
      // 添加自定义属性
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }

      // 执行函数
      const result = fn(span);

      // 标记成功
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      // 记录错误
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      // 结束span
      span.end();
    }
  });
}

/**
 * 添加事件到当前span
 */
export function addSpanEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * 设置当前span的属性
 */
export function setSpanAttribute(key: string, value: string | number | boolean): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttribute(key, value);
  }
}

/**
 * 设置当前span的多个属性
 */
export function setSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }
}

/**
 * 记录异常到当前span
 */
export function recordSpanException(error: Error): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  }
}

/**
 * 获取当前活动的span
 */
export function getActiveSpan(): Span | undefined {
  return trace.getActiveSpan();
}

/**
 * 装饰器：为类方法自动创建span
 */
export function TraceMethod(spanName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const name = spanName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return withSpan(
        name,
        async (span) => {
          // 添加方法参数信息（如果需要）
          span.setAttribute('method', propertyKey);
          span.setAttribute('class', target.constructor.name);

          return originalMethod.apply(this, args);
        }
      );
    };

    return descriptor;
  };
}
