/**
 * @file ui/widget/MemoryManager.ts
 * @description Memory Manager 模块
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

export class MemoryManager extends EventEmitter {
  private memoryUsage: number;
  private cpuUsage: number;
  private monitoringInterval: number;
  private monitorTimer: NodeJS.Timeout | null;

  constructor(monitoringInterval: number = 1000) {
    super();
    this.memoryUsage = 0;
    this.cpuUsage = 0;
    this.monitoringInterval = monitoringInterval;
    this.monitorTimer = null;
  }

  startMonitoring(): void {
    if (this.monitorTimer) return;
    
    this.monitorTimer = setInterval(() => {
      this.updateMetrics();
    }, this.monitoringInterval);
  }

  stopMonitoring(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
  }

  private updateMetrics(): void {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.memoryUsage = memory.usedJSHeapSize / 1024 / 1024;
    }
    
    this.emit('metrics:updated', {
      memoryUsage: this.memoryUsage,
      cpuUsage: this.cpuUsage,
    });
  }

  getMemoryUsage(): number {
    return this.memoryUsage;
  }

  getCPUUsage(): number {
    return this.cpuUsage;
  }

  destroy(): void {
    this.stopMonitoring();
    this.removeAllListeners();
  }
}
