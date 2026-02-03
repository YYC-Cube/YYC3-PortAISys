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
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          // 使用过的变量之后，未使用的变量才报错
          args: 'after-used',
          // 忽略以下划线开头的参数
          argsIgnorePattern: '^_',
          // 不检查catch块的错误参数
          caughtErrors: 'none',
          // 忽略以下划线开头的catch错误
          caughtErrorsIgnorePattern: '^_',
          // 忽略以下划线开头的解构数组元素
          destructuredArrayIgnorePattern: '^_',
          // 允许在剩余属性中有未使用的变量
          ignoreRestSiblings: true,
          // 忽略以下划线开头的变量
          varsIgnorePattern: '^_'
        }
      ],
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
