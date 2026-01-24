/**
 * @file Tracing模块导出
 * @description 统一导出tracing相关功能
 * @module tracing
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-24
 */

export {
  TracingConfig,
  TracingOptions,
  initializeTracing,
  getTracingConfig,
  shutdownTracing,
} from './TracingConfig';

export {
  getTracer,
  withSpan,
  withSpanSync,
  addSpanEvent,
  setSpanAttribute,
  setSpanAttributes,
  recordSpanException,
  getActiveSpan,
  TraceMethod,
} from './TracingUtils';
