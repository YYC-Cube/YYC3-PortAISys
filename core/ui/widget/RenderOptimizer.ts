/**
 * @file ui/widget/RenderOptimizer.ts
 * @description Render Optimizer 模块
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

export class RenderOptimizer extends EventEmitter {
  private renderTime: number;
  private fps: number;
  private cacheHitRate: number;
  private frameCount: number;
  private lastFrameTime: number;
  private _cache: Map<string, any>;
  private maxCacheSize: number;

  constructor(maxCacheSize: number = 1000) {
    super();
    this.renderTime = 0;
    this.fps = 60;
    this.cacheHitRate = 0;
    this.frameCount = 0;
    this.lastFrameTime = Date.now();
    this._cache = new Map();
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

  setCache(key: string, value: any): void {
    if (this._cache.size >= this.maxCacheSize) {
      const firstKey = this._cache.keys().next().value;
      if (firstKey !== undefined) {
        this._cache.delete(firstKey);
      }
    }
    this._cache.set(key, value);
  }

  getCached(key: string): any {
    const value = this._cache.get(key);
    if (value !== undefined) {
      this.cacheHitRate = (this.cacheHitRate * 0.9) + (1 * 0.1);
    } else {
      this.cacheHitRate = this.cacheHitRate * 0.9;
    }
    return value;
  }

  clearCache(): void {
    this._cache.clear();
    this.cacheHitRate = 0;
  }

  destroy(): void {
    this.clearCache();
    this.removeAllListeners();
  }
}
