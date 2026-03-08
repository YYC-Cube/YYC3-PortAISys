/**
 * @file vitest.integration.config.ts
 * @description Vitest Integration Test Configuration
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-08
 * @updated 2026-03-08
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
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'web-dashboard', '.next', 'coverage', 'tests/unit/**', 'tests/e2e/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './core'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
})
