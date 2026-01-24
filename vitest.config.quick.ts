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