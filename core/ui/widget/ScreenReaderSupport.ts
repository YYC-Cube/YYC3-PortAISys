/**
 * @file ui/widget/ScreenReaderSupport.ts
 * @description Screen Reader Support 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,ui
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
