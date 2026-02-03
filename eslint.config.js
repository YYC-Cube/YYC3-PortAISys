import { defineConfig } from 'eslint/config';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.github/**',
      'tools/**',
      'web-dashboard/**',
      'test-reports/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'error',
      'no-debugger': 'error',
      'max-lines': ['warn', { max: 2000, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
      'complexity': ['warn', { max: 30 }]
    }
  },
  {
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'core/examples/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['core/utils/logger.ts'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['core/performance/testing/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off'
    }
  }
]);
