/**
 * @file 事件总线
 * @description 管理事件总线
 * @module ui/widget/EventBus
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import { EventEmitter } from 'events';

export class EventBus extends EventEmitter {
  private eventHistory: Map<string, any[]>;
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    super();
    this.eventHistory = new Map();
    this.maxHistorySize = maxHistorySize;
  }

  override emit(event: string, ...args: any[]): boolean {
    this.recordEvent(event, args);
    return super.emit(event, ...args);
  }

  private recordEvent(event: string, args: any[]): void {
    if (!this.eventHistory.has(event)) {
      this.eventHistory.set(event, []);
    }

    const history = this.eventHistory.get(event)!;
    history.push({ timestamp: Date.now(), args });

    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  getEventHistory(event: string): any[] {
    return this.eventHistory.get(event) || [];
  }

  clearHistory(event?: string): void {
    if (event) {
      this.eventHistory.delete(event);
    } else {
      this.eventHistory.clear();
    }
  }

  destroy(): void {
    this.clearHistory();
    this.removeAllListeners();
  }
}
