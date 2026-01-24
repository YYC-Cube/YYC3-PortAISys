/**
 * @file 键盘导航
 * @description 提供键盘导航支持
 * @module ui/widget/KeyboardNavigation
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import { EventEmitter } from 'events';

export class KeyboardNavigation extends EventEmitter {
  private enabled: boolean;
  private shortcuts: Map<string, Function>;
  private currentFocus: string | null;

  constructor() {
    super();
    this.enabled = true;
    this.shortcuts = new Map();
    this.currentFocus = null;
    this.initializeShortcuts();
  }

  private initializeShortcuts(): void {
    this.shortcuts.set('Tab', () => this.navigateNext());
    this.shortcuts.set('Shift+Tab', () => this.navigatePrevious());
    this.shortcuts.set('Enter', () => this.activate());
    this.shortcuts.set('Escape', () => this.cancel());
    this.shortcuts.set('ArrowUp', () => this.navigateUp());
    this.shortcuts.set('ArrowDown', () => this.navigateDown());
    this.shortcuts.set('ArrowLeft', () => this.navigateLeft());
    this.shortcuts.set('ArrowRight', () => this.navigateRight());
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

  registerShortcut(key: string, handler: Function): void {
    this.shortcuts.set(key, handler);
  }

  unregisterShortcut(key: string): void {
    this.shortcuts.delete(key);
  }

  handleKey(key: string, event: KeyboardEvent): void {
    if (!this.enabled) return;

    const handler = this.shortcuts.get(key);
    if (handler) {
      event.preventDefault();
      handler();
      this.emit('keyboard:navigation', key);
    }
  }

  private navigateNext(): void {
    this.emit('navigate', 'next');
  }

  private navigatePrevious(): void {
    this.emit('navigate', 'previous');
  }

  private activate(): void {
    this.emit('activate');
  }

  private cancel(): void {
    this.emit('cancel');
  }

  private navigateUp(): void {
    this.emit('navigate', 'up');
  }

  private navigateDown(): void {
    this.emit('navigate', 'down');
  }

  private navigateLeft(): void {
    this.emit('navigate', 'left');
  }

  private navigateRight(): void {
    this.emit('navigate', 'right');
  }

  setFocus(elementId: string): void {
    this.currentFocus = elementId;
    this.emit('focus:changed', elementId);
  }

  getFocus(): string | null {
    return this.currentFocus;
  }

  destroy(): void {
    this.shortcuts.clear();
    this.removeAllListeners();
  }
}
