/**
 * @file ui/widget/EventBus.ts
 * @description Event Bus 模块
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

export class EventBus extends EventEmitter {
  private eventHistory: Map<string, any[]>;
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    super();
    this.eventHistory = new Map();
    this.maxHistorySize = maxHistorySize;
  }

  override emit(event: string | symbol, ...args: any[]): boolean {
    this.recordEvent(String(event), args);
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
