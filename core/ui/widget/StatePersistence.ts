/**
 * @file 状态持久化系统
 * @description 管理widget状态的持久化存储
 * @module ui/widget/StatePersistence
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import EventEmitter from 'eventemitter3';
import { WidgetState } from '../IntelligentAIWidget';
import { logger } from '../../utils/logger';

export class StatePersistence extends EventEmitter {
  private state: WidgetState;
  private storageKey: string;
  private enabled: boolean;

  constructor(state: WidgetState, storageKey: string = 'widget-state') {
    super();
    this.state = state;
    this.storageKey = storageKey;
    this.enabled = true;
  }

  save(): void {
    if (!this.enabled) return;
    
    try {
      const serialized = JSON.stringify(this.state);
      localStorage.setItem(this.storageKey, serialized);
      this.emit('state:saved', this.state);
    } catch (error) {
      logger.error('Failed to save state:', 'StatePersistence', { error }, error as Error);
      this.emit('save:error', error);
    }
  }

  load(): void {
    if (!this.enabled) return;
    
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (serialized) {
        const loadedState = JSON.parse(serialized);
        this.state = loadedState;
        this.emit('state:loaded', this.state);
      }
    } catch (error) {
      logger.error('Failed to load state:', 'StatePersistence', { error }, error as Error);
      this.emit('load:error', error);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
      this.emit('state:cleared');
    } catch (error) {
      logger.error('Failed to clear state:', 'StatePersistence', { error }, error as Error);
      this.emit('clear:error', error);
    }
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  destroy(): void {
    this.removeAllListeners();
  }
}
