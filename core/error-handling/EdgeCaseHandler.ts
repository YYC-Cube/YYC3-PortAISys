/**
 * @file 边缘情况处理系统
 * @description 提供全面的边缘情况处理和错误管理功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { EventEmitter } from 'eventemitter3';

export interface EdgeCase {
  id: string;
  name: string;
  description: string;
  category: 'validation' | 'network' | 'data' | 'ui' | 'security' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: () => boolean;
  handler: () => Promise<void> | void;
  recovery?: () => Promise<void> | void;
}

export interface EdgeCaseMetrics {
  totalCases: number;
  handledCases: number;
  failedCases: number;
  recoveryRate: number;
  averageResolutionTime: number;
}

export interface ValidationRule {
  name: string;
  validate: (value: any) => boolean;
  errorMessage: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface NetworkRetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

export class EdgeCaseHandler extends EventEmitter {
  private edgeCases: Map<string, EdgeCase> = new Map();
  private validationRules: Map<string, ValidationRule[]> = new Map();
  private metrics: EdgeCaseMetrics = {
    totalCases: 0,
    handledCases: 0,
    failedCases: 0,
    recoveryRate: 0,
    averageResolutionTime: 0
  };
  private resolutionTimes: number[] = [];
  private isHandling: boolean = false;

  constructor() {
    super();
    this.initializeDefaultEdgeCases();
    this.initializeDefaultValidationRules();
  }

  private initializeDefaultEdgeCases(): void {
    this.registerEdgeCase({
      id: 'null-undefined-check',
      name: 'Null/Undefined Check',
      description: 'Handle null or undefined values',
      category: 'validation',
      severity: 'high',
      condition: () => false,
      handler: () => {
        throw new Error('Null or undefined value detected');
      }
    });

    this.registerEdgeCase({
      id: 'empty-array-check',
      name: 'Empty Array Check',
      description: 'Handle empty arrays',
      category: 'data',
      severity: 'medium',
      condition: () => false,
      handler: () => {
        throw new Error('Empty array detected');
      }
    });

    this.registerEdgeCase({
      id: 'network-timeout',
      name: 'Network Timeout',
      description: 'Handle network request timeouts',
      category: 'network',
      severity: 'high',
      condition: () => false,
      handler: () => {
        throw new Error('Network timeout occurred');
      },
      recovery: () => {
        this.emit('network:retry');
      }
    });

    this.registerEdgeCase({
      id: 'memory-limit',
      name: 'Memory Limit',
      description: 'Handle memory limit exceeded',
      category: 'performance',
      severity: 'critical',
      condition: () => {
        if (typeof process !== 'undefined' && process.memoryUsage) {
          const usage = process.memoryUsage();
          const limit = 1024 * 1024 * 1024;
          return usage.heapUsed > limit;
        }
        return false;
      },
      handler: () => {
        this.emit('memory:warning', 'Memory limit exceeded');
      },
      recovery: () => {
        if (typeof global !== 'undefined' && (global as any).gc) {
          (global as any).gc();
        }
      }
    });

    this.registerEdgeCase({
      id: 'invalid-json',
      name: 'Invalid JSON',
      description: 'Handle invalid JSON data',
      category: 'data',
      severity: 'high',
      condition: () => false,
      handler: () => {
        throw new Error('Invalid JSON data');
      }
    });

    this.registerEdgeCase({
      id: 'concurrent-request-limit',
      name: 'Concurrent Request Limit',
      description: 'Handle too many concurrent requests',
      category: 'performance',
      severity: 'medium',
      condition: () => false,
      handler: () => {
        this.emit('request:limit', 'Concurrent request limit reached');
      }
    });

    this.registerEdgeCase({
      id: 'security-token-expired',
      name: 'Security Token Expired',
      description: 'Handle expired security tokens',
      category: 'security',
      severity: 'high',
      condition: () => false,
      handler: () => {
        this.emit('security:token-expired');
      },
      recovery: () => {
        this.emit('security:token-refresh');
      }
    });

    this.registerEdgeCase({
      id: 'ui-element-not-found',
      name: 'UI Element Not Found',
      description: 'Handle missing UI elements',
      category: 'ui',
      severity: 'medium',
      condition: () => false,
      handler: () => {
        throw new Error('UI element not found');
      }
    });

    this.registerEdgeCase({
      id: 'data-corruption',
      name: 'Data Corruption',
      description: 'Handle corrupted data',
      category: 'data',
      severity: 'critical',
      condition: () => false,
      handler: () => {
        this.emit('data:corruption', 'Data corruption detected');
      },
      recovery: () => {
        this.emit('data:restore');
      }
    });

    this.registerEdgeCase({
      id: 'rate-limit-exceeded',
      name: 'Rate Limit Exceeded',
      description: 'Handle API rate limit exceeded',
      category: 'network',
      severity: 'medium',
      condition: () => false,
      handler: () => {
        this.emit('rate-limit:exceeded');
      },
      recovery: () => {
        this.emit('rate-limit:retry');
      }
    });
  }

  private initializeDefaultValidationRules(): void {
    this.registerValidationRule('string', {
      name: 'String Validation',
      validate: (value: any) => typeof value === 'string',
      errorMessage: 'Value must be a string',
      severity: 'error'
    });

    this.registerValidationRule('number', {
      name: 'Number Validation',
      validate: (value: any) => typeof value === 'number' && !isNaN(value),
      errorMessage: 'Value must be a valid number',
      severity: 'error'
    });

    this.registerValidationRule('boolean', {
      name: 'Boolean Validation',
      validate: (value: any) => typeof value === 'boolean',
      errorMessage: 'Value must be a boolean',
      severity: 'error'
    });

    this.registerValidationRule('array', {
      name: 'Array Validation',
      validate: (value: any) => Array.isArray(value),
      errorMessage: 'Value must be an array',
      severity: 'error'
    });

    this.registerValidationRule('object', {
      name: 'Object Validation',
      validate: (value: any) => typeof value === 'object' && value !== null && !Array.isArray(value),
      errorMessage: 'Value must be an object',
      severity: 'error'
    });

    this.registerValidationRule('email', {
      name: 'Email Validation',
      validate: (value: any) => {
        if (typeof value !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      errorMessage: 'Invalid email format',
      severity: 'error'
    });

    this.registerValidationRule('url', {
      name: 'URL Validation',
      validate: (value: any) => {
        if (typeof value !== 'string') return false;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      errorMessage: 'Invalid URL format',
      severity: 'error'
    });

    this.registerValidationRule('uuid', {
      name: 'UUID Validation',
      validate: (value: any) => {
        if (typeof value !== 'string') return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
      },
      errorMessage: 'Invalid UUID format',
      severity: 'error'
    });

    this.registerValidationRule('positive-number', {
      name: 'Positive Number Validation',
      validate: (value: any) => typeof value === 'number' && value > 0,
      errorMessage: 'Value must be a positive number',
      severity: 'error'
    });

    this.registerValidationRule('non-empty-string', {
      name: 'Non-Empty String Validation',
      validate: (value: any) => typeof value === 'string' && value.trim().length > 0,
      errorMessage: 'Value must be a non-empty string',
      severity: 'error'
    });

    this.registerValidationRule('non-empty-array', {
      name: 'Non-Empty Array Validation',
      validate: (value: any) => Array.isArray(value) && value.length > 0,
      errorMessage: 'Value must be a non-empty array',
      severity: 'warning'
    });

    this.registerValidationRule('date', {
      name: 'Date Validation',
      validate: (value: any) => value instanceof Date || !isNaN(Date.parse(value)),
      errorMessage: 'Invalid date format',
      severity: 'error'
    });
  }

  registerEdgeCase(edgeCase: EdgeCase): void {
    this.edgeCases.set(edgeCase.id, edgeCase);
    this.emit('edge-case:registered', edgeCase);
  }

  unregisterEdgeCase(id: string): void {
    this.edgeCases.delete(id);
    this.emit('edge-case:unregistered', id);
  }

  getEdgeCase(id: string): EdgeCase | undefined {
    return this.edgeCases.get(id);
  }

  getEdgeCases(): EdgeCase[] {
    return Array.from(this.edgeCases.values());
  }

  getEdgeCasesByCategory(category: EdgeCase['category']): EdgeCase[] {
    return Array.from(this.edgeCases.values()).filter(ec => ec.category === category);
  }

  getEdgeCasesBySeverity(severity: EdgeCase['severity']): EdgeCase[] {
    return Array.from(this.edgeCases.values()).filter(ec => ec.severity === severity);
  }

  async checkEdgeCases(): Promise<void> {
    if (this.isHandling) {
      return;
    }

    this.isHandling = true;
    this.emit('edge-case:check-started');

    try {
      for (const edgeCase of this.edgeCases.values()) {
        const startTime = Date.now();

        if (edgeCase.condition()) {
          this.metrics.totalCases++;

          try {
            await edgeCase.handler();
            this.metrics.handledCases++;
            this.emit('edge-case:handled', edgeCase);

            if (edgeCase.recovery) {
              await edgeCase.recovery();
              this.emit('edge-case:recovered', edgeCase);
            }
          } catch (error) {
            this.metrics.failedCases++;
            this.emit('edge-case:failed', { edgeCase, error });
          }

          const resolutionTime = Date.now() - startTime;
          this.resolutionTimes.push(resolutionTime);
          this.updateMetrics();
        }
      }

      this.emit('edge-case:check-completed');
    } finally {
      this.isHandling = false;
    }
  }

  registerValidationRule(type: string, rule: ValidationRule): void {
    if (!this.validationRules.has(type)) {
      this.validationRules.set(type, []);
    }
    this.validationRules.get(type)!.push(rule);
    this.emit('validation-rule:registered', { type, rule });
  }

  unregisterValidationRule(type: string, ruleName: string): void {
    const rules = this.validationRules.get(type);
    if (rules) {
      const index = rules.findIndex(r => r.name === ruleName);
      if (index !== -1) {
        rules.splice(index, 1);
        this.emit('validation-rule:unregistered', { type, ruleName });
      }
    }
  }

  validate(type: string, value: any): { valid: boolean; errors: string[] } {
    const rules = this.validationRules.get(type);
    if (!rules) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = [];
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.errorMessage);
        if (rule.severity === 'error') {
          this.emit('validation:error', { type, rule, value });
        } else {
          this.emit('validation:warning', { type, rule, value });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateMultiple(types: string[], value: any): { valid: boolean; errors: string[] } {
    const allErrors: string[] = [];

    for (const type of types) {
      const result = this.validate(type, value);
      allErrors.push(...result.errors);
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }

  async withRetry<T>(
    fn: () => Promise<T>,
    config: Partial<NetworkRetryConfig> = {}
  ): Promise<T> {
    const finalConfig: NetworkRetryConfig = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'],
      ...config
    };

    let lastError: Error | null = null;
    let delay = finalConfig.initialDelay;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === finalConfig.maxRetries) {
          this.emit('retry:exhausted', { attempts: attempt + 1, error });
          throw lastError;
        }

        const isRetryable = finalConfig.retryableErrors.some(errCode =>
          lastError!.message.includes(errCode)
        );

        if (!isRetryable) {
          this.emit('retry:not-retryable', { error: lastError });
          throw lastError;
        }

        this.emit('retry:attempt', { attempt: attempt + 1, delay, error: lastError });

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * finalConfig.backoffFactor, finalConfig.maxDelay);
      }
    }

    throw lastError;
  }

  withFallback<T>(primary: () => T, fallback: () => T): T {
    try {
      return primary();
    } catch (error) {
      this.emit('fallback:triggered', { error });
      return fallback();
    }
  }

  withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    timeoutMessage: string = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          this.emit('timeout:occurred', { timeout, message: timeoutMessage });
          reject(new Error(timeoutMessage));
        }, timeout);
      })
    ]);
  }

  safeParseJSON<T = any>(jsonString: string, fallback: T): T {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      this.emit('json:parse-error', { jsonString, error });
      return fallback;
    }
  }

  safeStringifyJSON(obj: any, fallback: string = '{}'): string {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      this.emit('json:stringify-error', { obj, error });
      return fallback;
    }
  }

  safeGet<T>(obj: any, path: string, fallback: T): T {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        this.emit('safe-get:undefined', { path, obj });
        return fallback;
      }
      current = current[key];
    }

    return current !== undefined ? current : fallback;
  }

  safeSet(obj: any, path: string, value: any): boolean {
    try {
      const keys = path.split('.');
      const lastKey = keys.pop()!;
      let current = obj;

      for (const key of keys) {
        if (current[key] === undefined) {
          current[key] = {};
        }
        current = current[key];
      }

      current[lastKey] = value;
      return true;
    } catch (error) {
      this.emit('safe-set:error', { path, value, error });
      return false;
    }
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  validateInput(input: string, maxLength: number = 1000): { valid: boolean; sanitized: string } {
    if (typeof input !== 'string') {
      return { valid: false, sanitized: '' };
    }

    if (input.length > maxLength) {
      this.emit('input:too-long', { length: input.length, maxLength });
      return { valid: false, sanitized: input.substring(0, maxLength) };
    }

    const sanitized = this.sanitizeInput(input);
    return { valid: true, sanitized };
  }

  handleNullish<T>(value: T | null | undefined, fallback: T): T {
    if (value === null || value === undefined) {
      this.emit('nullish:detected', { value, fallback });
      return fallback;
    }
    return value;
  }

  handleEmpty<T>(value: T[] | string, fallback: T[] | string): T[] | string {
    if (Array.isArray(value) && value.length === 0) {
      this.emit('empty:detected', { value, fallback });
      return fallback;
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      this.emit('empty:detected', { value, fallback });
      return fallback;
    }
    return value;
  }

  private updateMetrics(): void {
    this.metrics.totalCases = this.metrics.handledCases + this.metrics.failedCases;
    this.metrics.recoveryRate = this.metrics.totalCases > 0
      ? (this.metrics.handledCases / this.metrics.totalCases) * 100
      : 0;
    this.metrics.averageResolutionTime = this.resolutionTimes.length > 0
      ? this.resolutionTimes.reduce((sum, time) => sum + time, 0) / this.resolutionTimes.length
      : 0;
  }

  getMetrics(): EdgeCaseMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      totalCases: 0,
      handledCases: 0,
      failedCases: 0,
      recoveryRate: 0,
      averageResolutionTime: 0
    };
    this.resolutionTimes = [];
    this.emit('metrics:reset');
  }

  destroy(): void {
    this.edgeCases.clear();
    this.validationRules.clear();
    this.removeAllListeners();
  }
}
