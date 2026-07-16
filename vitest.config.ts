/**
 * @file vitest.config.ts
 * @description Vitest.config 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    memoryLimit: '4096MB',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['core/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'web-dashboard/',
        '.next/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types.ts',
        '**/*.config.ts',
        '**/mocks/**',
        '**/fixtures/**',
      ],
      // 覆盖率目标 80%，当前 36%，暂不阻断 CI
    },
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/security/**/*.test.ts', 'tests/performance/**/*.test.ts'],
    // 排除E2E（Playwright）测试、集成测试；性能测试通过RUN_PERF环境变量控制
    exclude: ['node_modules', 'dist', 'web-dashboard', '.next', 'coverage', 'tests/e2e/**', 'tests/integration/**'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './core'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
})
