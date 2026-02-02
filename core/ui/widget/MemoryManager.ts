/**
 * @file 内存管理器
 * @description 管理内存使用
 * @module ui/widget/MemoryManager
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
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
