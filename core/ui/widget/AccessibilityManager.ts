/**
 * @file ui/widget/AccessibilityManager.ts
 * @description Accessibility Manager 模块
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

export class AccessibilityManager extends EventEmitter {
  private enabled: boolean;
  private settings: Map<string, any>;

  constructor() {
    super();
    this.enabled = true;
    this.settings = new Map();
    this.initializeSettings();
  }

  private initializeSettings(): void {
    this.settings.set('screenReader', true);
    this.settings.set('keyboardNavigation', true);
    this.settings.set('highContrast', false);
    this.settings.set('reducedMotion', false);
    this.settings.set('fontSize', 'medium');
  }

  enable(): void {
    this.enabled = true;
    this.emit('a11y:enabled');
  }

  disable(): void {
    this.enabled = false;
    this.emit('a11y:disabled');
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setSetting(key: string, value: any): void {
    this.settings.set(key, value);
    this.emit('setting:changed', { key, value });
  }

  getSetting(key: string): any {
    return this.settings.get(key);
  }

  getSettings(): Map<string, any> {
    return new Map(this.settings);
  }

  destroy(): void {
    this.removeAllListeners();
  }
}
