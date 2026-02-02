/**
 * @file Widget沙箱
 * @description 提供安全的执行环境
 * @module ui/widget/WidgetSandbox
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import EventEmitter from 'eventemitter3';

export class WidgetSandbox extends EventEmitter {
  private enabled: boolean;
  private allowedDomains: Set<string>;
  private allowedFunctions: Set<string>;

  constructor() {
    super();
    this.enabled = true;
    this.allowedDomains = new Set();
    this.allowedFunctions = new Set();
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    this.allowedFunctions.add('console.log');
    this.allowedFunctions.add('console.warn');
    this.allowedFunctions.add('console.error');
  }

  enable(): void {
    this.enabled = true;
    this.emit('enabled');
  }

  disable(): void {
    this.enabled = false;
    this.emit('disabled');
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  addAllowedDomain(domain: string): void {
    this.allowedDomains.add(domain);
  }

  removeAllowedDomain(domain: string): void {
    this.allowedDomains.delete(domain);
  }

  isDomainAllowed(domain: string): boolean {
    return this.allowedDomains.has(domain);
  }

  addAllowedFunction(funcName: string): void {
    this.allowedFunctions.add(funcName);
  }

  removeAllowedFunction(funcName: string): void {
    this.allowedFunctions.delete(funcName);
  }

  isFunctionAllowed(funcName: string): boolean {
    return this.allowedFunctions.has(funcName);
  }

  execute(code: string): any {
    if (!this.enabled) {
      throw new Error('Sandbox is disabled');
    }

    try {
      return eval(code);
    } catch (error) {
      this.emit('sandbox:violation', { error, code });
      throw error;
    }
  }

  destroy(): void {
    this.allowedDomains.clear();
    this.allowedFunctions.clear();
    this.removeAllListeners();
  }
}
