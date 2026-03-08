/**
 * @file vitest.config.quick.ts
 * @description Vitest.config.quick 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/plugin-system.test.ts',
      'tests/integration/ai-engine.test.ts',
    ],
    exclude: [
      'node_modules',
      'dist',
      'tests/e2e',
      'tests/performance',
    ],
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['core/**/*.ts'],
      exclude: [
        'core/**/*.test.ts',
        'core/**/types.ts',
        'core/**/index.ts',
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});