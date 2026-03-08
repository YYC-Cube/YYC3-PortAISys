/**
 * @file tracing/index.ts
 * @description Index 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

export {
  TracingConfig,
  initializeTracing,
  getTracingConfig,
  shutdownTracing,
} from './TracingConfig';

export type {
  TracingOptions,
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
