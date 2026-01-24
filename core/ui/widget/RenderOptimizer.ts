/**
 * @file 渲染优化器
 * @description 优化渲染性能
 * @module ui/widget/RenderOptimizer
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import { EventEmitter } from 'events';

export class RenderOptimizer extends EventEmitter {
  private renderTime: number;
  private fps: number;
  private cacheHitRate: number;
  private frameCount: number;
  private lastFrameTime: number;
  private cache: Map<string, any>;
  private maxCacheSize: number;

  constructor(maxCacheSize: number = 1000) {
    super();
    this.renderTime = 0;
    this.fps = 60;
    this.cacheHitRate = 0;
    this.frameCount = 0;
    this.lastFrameTime = Date.now();
    this.cache = new Map();
    this.maxCacheSize = maxCacheSize;
  }

  optimizeRender(renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    this.renderTime = performance.now() - startTime;
    this.updateFPS();
  }

  private updateFPS(): void {
    this.frameCount++;
    const now = Date.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }

  getRenderTime(): number {
    return this.renderTime;
  }

  getFPS(): number {
    return this.fps;
  }

  getCacheHitRate(): number {
    return this.cacheHitRate;
  }

  cache(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  getCached(key: string): any {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.cacheHitRate = (this.cacheHitRate * 0.9) + (1 * 0.1);
    } else {
      this.cacheHitRate = this.cacheHitRate * 0.9;
    }
    return value;
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheHitRate = 0;
  }

  destroy(): void {
    this.clearCache();
    this.removeAllListeners();
  }
}
