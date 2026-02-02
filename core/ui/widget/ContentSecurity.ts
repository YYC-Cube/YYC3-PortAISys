/**
 * @file 内容安全
 * @description 管理内容安全策略
 * @module ui/widget/ContentSecurity
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import EventEmitter from 'eventemitter3';

export class ContentSecurity extends EventEmitter {
  private enabled: boolean;
  private allowedSources: Set<string>;
  private blockedDomains: Set<string>;
  private maxContentLength: number;

  constructor(maxContentLength: number = 1024 * 1024) {
    super();
    this.enabled = true;
    this.allowedSources = new Set();
    this.blockedDomains = new Set();
    this.maxContentLength = maxContentLength;
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

  addAllowedSource(source: string): void {
    this.allowedSources.add(source);
  }

  removeAllowedSource(source: string): void {
    this.allowedSources.delete(source);
  }

  isSourceAllowed(source: string): boolean {
    if (this.allowedSources.size === 0) return true;
    return this.allowedSources.has(source);
  }

  addBlockedDomain(domain: string): void {
    this.blockedDomains.add(domain);
  }

  removeBlockedDomain(domain: string): void {
    this.blockedDomains.delete(domain);
  }

  isDomainBlocked(domain: string): boolean {
    return this.blockedDomains.has(domain);
  }

  sanitize(content: string): string {
    if (!this.enabled) return content;

    let sanitized = content;

    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    return sanitized;
  }

  validateContent(content: string): { valid: boolean; reason?: string } {
    if (!this.enabled) {
      return { valid: true };
    }

    if (content.length > this.maxContentLength) {
      return {
        valid: false,
        reason: `Content length exceeds maximum allowed length of ${this.maxContentLength}`,
      };
    }

    if (/<script/i.test(content)) {
      return {
        valid: false,
        reason: 'Script tags are not allowed',
      };
    }

    if (/<iframe/i.test(content)) {
      return {
        valid: false,
        reason: 'Iframe tags are not allowed',
      };
    }

    if (/javascript:/i.test(content)) {
      return {
        valid: false,
        reason: 'JavaScript URLs are not allowed',
      };
    }

    return { valid: true };
  }

  setMaxContentLength(length: number): void {
    this.maxContentLength = length;
  }

  getMaxContentLength(): number {
    return this.maxContentLength;
  }

  destroy(): void {
    this.allowedSources.clear();
    this.blockedDomains.clear();
    this.removeAllListeners();
  }
}
