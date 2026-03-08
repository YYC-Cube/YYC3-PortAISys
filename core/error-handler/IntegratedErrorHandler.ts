/**
 * @file error-handler/IntegratedErrorHandler.ts
 * @description Integrated Error Handler 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { ErrorHandler } from './ErrorHandler';
import { YYC3Error } from './ErrorTypes';
import { ErrorBoundary } from './ErrorBoundary';
import { GlobalErrorHandler, ErrorContext as GlobalErrorContext } from './GlobalErrorHandler';
import { ErrorCategory, ErrorSeverity } from './ErrorTypes';
import EventEmitter from 'eventemitter3';

export class IntegratedErrorHandler extends EventEmitter {
  private errorHandler: ErrorHandler;
  private globalErrorHandler: GlobalErrorHandler;
  private errorBoundary: ErrorBoundary;

  constructor() {
    super();
    
    this.errorHandler = new ErrorHandler({
      enableLogging: true,
      enableReporting: true,
      enableAutoRecovery: true,
      maxRetryAttempts: 3,
      retryDelay: 1000,
      logLevel: ErrorSeverity.MEDIUM
    });

    this.globalErrorHandler = new GlobalErrorHandler({
      enableLogging: true,
      enableMetrics: true,
      enableAutoRecovery: true,
      maxRetryAttempts: 3,
      retryDelay: 1000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      errorRetentionPeriod: '7d',
      notifyOnCritical: true,
      notifyOnHigh: true
    });

    this.errorBoundary = new ErrorBoundary(this.errorHandler, {
      enableRecovery: true,
      maxRetries: 3,
      retryDelay: 1000
    });

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    this.errorHandler.on('error', async (_report) => {
      const globalContext: GlobalErrorContext = {
        timestamp: new Date(),
        component: 'ErrorHandler',
        operation: 'error',
        metadata: {}
      };

      await this.globalErrorHandler.handleError(
        _report.error,
        globalContext
      );
    });

    this.errorBoundary.on('error', ({ error, errorInfo }) => {
      const globalContext: GlobalErrorContext = {
        timestamp: new Date(),
        component: errorInfo.componentStack || 'Unknown',
        operation: errorInfo.componentStack ? 'render' : 'unknown',
        metadata: errorInfo
      };

      this.globalErrorHandler.handleError(
        error,
        globalContext
      );
    });
  }

  async handleError(error: Error | YYC3Error, context: Record<string, any> = {}): Promise<any> {
    return this.errorHandler.handleError(error, context);
  }

  async captureError(error: Error | YYC3Error, errorInfo: any = {}): Promise<void> {
    return this.errorBoundary.captureError(error, errorInfo);
  }

  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  getGlobalErrorHandler(): GlobalErrorHandler {
    return this.globalErrorHandler;
  }

  getErrorBoundary(): ErrorBoundary {
    return this.errorBoundary;
  }

  registerRecoveryStrategy(category: ErrorCategory, strategy: any): void {
    this.errorHandler.registerRecoveryStrategy(category, strategy);
  }

  async getStatistics(): Promise<any> {
    return this.globalErrorHandler.getStatistics();
  }

  async getErrorHistory(): Promise<any[]> {
    return this.globalErrorHandler.getErrorHistory();
  }

  async clearHistory(): Promise<void> {
    return this.globalErrorHandler.clearErrorHistory();
  }

  destroy(): void {
    this.errorHandler.removeAllListeners();
    this.errorBoundary.removeAllListeners();
    this.globalErrorHandler.destroy();
    this.removeAllListeners();
  }
}

let instance: IntegratedErrorHandler | null = null;

export const getIntegratedErrorHandler = (): IntegratedErrorHandler => {
  if (!instance) {
    instance = new IntegratedErrorHandler();
  }
  return instance;
};

export const createIntegratedErrorHandler = (): IntegratedErrorHandler => {
  return new IntegratedErrorHandler();
};

export default IntegratedErrorHandler;
