/**
 * @file performance/testing/logger.ts
 * @description Logger 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { Logger } from './types';

export class SimpleLogger implements Logger {
  private context: string;

  constructor(context: string = 'PerformanceTesting') {
    this.context = context;
  }

  info(message: string, metadata?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [INFO] [${this.context}] ${message}`;
    console.log(logMessage);
    if (metadata) {
      console.log(JSON.stringify(metadata, null, 2));
    }
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [WARN] [${this.context}] ${message}`;
    console.warn(logMessage);
    if (metadata) {
      console.warn(JSON.stringify(metadata, null, 2));
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [ERROR] [${this.context}] ${message}`;
    console.error(logMessage);
    if (error) {
      console.error(error.stack);
    }
    if (metadata) {
      console.error(JSON.stringify(metadata, null, 2));
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [DEBUG] [${this.context}] ${message}`;
    console.log(logMessage);
    if (metadata) {
      console.log(JSON.stringify(metadata, null, 2));
    }
  }
}
