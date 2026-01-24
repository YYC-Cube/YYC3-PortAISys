/**
 * @file 简单日志器实现
 * @description 实现简单的日志器，用于记录性能测试过程中的日志
 * @module performance-testing
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-07
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
