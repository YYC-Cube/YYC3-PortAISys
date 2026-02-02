/**
 * @file 键盘快捷键管理系统
 * @description 管理键盘快捷键的注册、触发和处理
 * @module ui/widget/KeyboardShortcutManager
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import EventEmitter from 'eventemitter3';

interface KeyboardShortcutManagerConfig {
  widget: any;
  enableDefaultShortcuts?: boolean;
  enableCustomShortcuts?: boolean;
}

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  callback: () => void;
  context?: string;
  enabled: boolean;
}

export class KeyboardShortcutManager extends EventEmitter {
  private widget: any;
  private enableDefaultShortcuts: boolean;
  private enableCustomShortcuts: boolean;
  private shortcuts: Map<string, KeyboardShortcut>;
  private isListening: boolean;
  private pressedKeys: Set<string>;

  constructor(config: KeyboardShortcutManagerConfig) {
    super();
    this.widget = config.widget;
    this.enableDefaultShortcuts = config.enableDefaultShortcuts || true;
    this.enableCustomShortcuts = config.enableCustomShortcuts || true;
    this.shortcuts = new Map();
    this.isListening = false;
    this.pressedKeys = new Set();
  }

  startListening(): void {
    if (this.isListening) {
      return;
    }

    this.isListening = true;
    // 仅在浏览器环境中添加事件监听器
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
  }

  stopListening(): void {
    this.isListening = false;
    // 仅在浏览器环境中移除事件监听器
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
      document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
  }

  registerDefaultShortcuts(): void {
    if (!this.enableDefaultShortcuts) {
      return;
    }

    const defaultShortcuts: KeyboardShortcut[] = [
      {
        id: 'toggle-chat',
        keys: ['Alt', 'C'],
        description: 'Toggle chat interface',
        callback: () => this.emit('shortcut:triggered', { shortcut: 'toggle-chat' }),
        enabled: true,
      },
      {
        id: 'toggle-tools',
        keys: ['Alt', 'T'],
        description: 'Toggle tools panel',
        callback: () => this.emit('shortcut:triggered', { shortcut: 'toggle-tools' }),
        enabled: true,
      },
      {
        id: 'toggle-insights',
        keys: ['Alt', 'I'],
        description: 'Toggle insights dashboard',
        callback: () => this.emit('shortcut:triggered', { shortcut: 'toggle-insights' }),
        enabled: true,
      },
      {
        id: 'toggle-workflow',
        keys: ['Alt', 'W'],
        description: 'Toggle workflow designer',
        callback: () => this.emit('shortcut:triggered', { shortcut: 'toggle-workflow' }),
        enabled: true,
      },
      {
        id: 'toggle-minimize',
        keys: ['Alt', 'M'],
        description: 'Minimize/maximize widget',
        callback: () => this.emit('shortcut:triggered', { shortcut: 'toggle-minimize' }),
        enabled: true,
      },
      {
        id: 'toggle-maximize',
        keys: ['Alt', 'X'],
        description: 'Maximize/restore widget',
        callback: () => this.emit('shortcut:triggered', { shortcut: 'toggle-maximize' }),
        enabled: true,
      },
      {
        id: 'toggle-theme',
        keys: ['Alt', 'Y'],
        description: 'Toggle theme',
        callback: () => this.emit('shortcut:triggered', { shortcut: 'toggle-theme' }),
        enabled: true,
      },
      {
        id: 'close',
        keys: ['Alt', 'Q'],
        description: 'Close widget',
        callback: () => this.emit('shortcut:triggered', { shortcut: 'close' }),
        enabled: true,
      },
    ];

    defaultShortcuts.forEach(shortcut => {
      this.registerShortcut(shortcut);
    });
  }

  registerShortcut(shortcut: KeyboardShortcut): void {
    if (!this.enableCustomShortcuts && !shortcut.id.startsWith('toggle-')) {
      return;
    }

    this.shortcuts.set(shortcut.id, shortcut);
  }

  unregisterShortcut(id: string): void {
    this.shortcuts.delete(id);
  }

  enableShortcut(id: string): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = true;
    }
  }

  disableShortcut(id: string): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.enabled = false;
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.pressedKeys.add(this.normalizeKey(event.key));
    this.checkShortcuts();
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.pressedKeys.delete(this.normalizeKey(event.key));
  }

  private checkShortcuts(): void {
    for (const shortcut of this.shortcuts.values()) {
      if (!shortcut.enabled) {
        continue;
      }

      const normalizedKeys = shortcut.keys.map(this.normalizeKey);
      const allKeysPressed = normalizedKeys.every(key => this.pressedKeys.has(key));

      if (allKeysPressed) {
        shortcut.callback();
      }
    }
  }

  private normalizeKey(key: string): string {
    return key.toLowerCase() === 'control' ? 'Ctrl' : key;
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  getEnabledShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(shortcut => shortcut.enabled);
  }

  isListeningEnabled(): boolean {
    return this.isListening;
  }

  isDefaultShortcutsEnabled(): boolean {
    return this.enableDefaultShortcuts;
  }

  isCustomShortcutsEnabled(): boolean {
    return this.enableCustomShortcuts;
  }

  setDefaultShortcutsEnabled(enabled: boolean): void {
    this.enableDefaultShortcuts = enabled;
  }

  setCustomShortcutsEnabled(enabled: boolean): void {
    this.enableCustomShortcuts = enabled;
  }

  clearAllShortcuts(): void {
    this.shortcuts.clear();
  }

  destroy(): void {
    this.stopListening();
    this.clearAllShortcuts();
    this.removeAllListeners();
  }
}

export default KeyboardShortcutManager;