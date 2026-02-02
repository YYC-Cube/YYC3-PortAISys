/**
 * @file 屏幕阅读器支持
 * @description 提供屏幕阅读器支持
 * @module ui/widget/ScreenReaderSupport
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import EventEmitter from 'eventemitter3';

export class ScreenReaderSupport extends EventEmitter {
  private enabled: boolean;
  private announcements: string[];

  constructor() {
    super();
    this.enabled = true;
    this.announcements = [];
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.enabled) return;

    this.announcements.push(message);
    this.emit('announcement', { message, priority });
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

  getAnnouncements(): string[] {
    return [...this.announcements];
  }

  clearAnnouncements(): void {
    this.announcements = [];
  }

  destroy(): void {
    this.clearAnnouncements();
    this.removeAllListeners();
  }
}
