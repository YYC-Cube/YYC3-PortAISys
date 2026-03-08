/**
 * @file pluggable/index.ts
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

export * from './types';
export * from './AutonomousAIEngine';
export * from './ModelAdapter';

import { AutonomousAIEngine } from './AutonomousAIEngine';
import { ModelAdapter, OpenAIAdapter, AnthropicAdapter, LocalModelAdapter } from './ModelAdapter';

export const createEngine = (config?: any) => new AutonomousAIEngine(config);

export const createModelAdapter = (type: 'openai' | 'anthropic' | 'local' = 'openai') => {
  switch (type) {
    case 'openai':
      return new OpenAIAdapter();
    case 'anthropic':
      return new AnthropicAdapter();
    case 'local':
      return new LocalModelAdapter();
    default:
      return new ModelAdapter('default-adapter');
  }
};
