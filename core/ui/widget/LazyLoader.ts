/**
 * @file ui/widget/LazyLoader.ts
 * @description Lazy Loader 模块
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

export class LazyLoader extends EventEmitter {
  private loadedModules: Set<string>;
  private loadingModules: Map<string, Promise<any>>;
  private moduleCache: Map<string, any>;

  constructor() {
    super();
    this.loadedModules = new Set();
    this.loadingModules = new Map();
    this.moduleCache = new Map();
  }

  async load(moduleId: string, loader: () => Promise<any>): Promise<any> {
    if (this.loadedModules.has(moduleId)) {
      return this.moduleCache.get(moduleId);
    }

    if (this.loadingModules.has(moduleId)) {
      return this.loadingModules.get(moduleId);
    }

    this.emit('loading:started', moduleId);

    const loadingPromise = loader()
      .then((module) => {
        this.loadedModules.add(moduleId);
        this.moduleCache.set(moduleId, module);
        this.loadingModules.delete(moduleId);
        this.emit('loading:completed', moduleId);
        return module;
      })
      .catch((error) => {
        this.loadingModules.delete(moduleId);
        this.emit('loading:error', { moduleId, error });
        throw error;
      });

    this.loadingModules.set(moduleId, loadingPromise);
    return loadingPromise;
  }

  isLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId);
  }

  isLoading(moduleId: string): boolean {
    return this.loadingModules.has(moduleId);
  }

  unload(moduleId: string): void {
    this.loadedModules.delete(moduleId);
    this.moduleCache.delete(moduleId);
    this.emit('module:unloaded', moduleId);
  }

  clearCache(): void {
    this.loadedModules.clear();
    this.moduleCache.clear();
    this.loadingModules.clear();
    this.emit('cache:cleared');
  }

  destroy(): void {
    this.clearCache();
    this.removeAllListeners();
  }
}
