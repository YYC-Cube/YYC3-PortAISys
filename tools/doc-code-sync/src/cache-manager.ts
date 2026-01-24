import { LRUCache } from 'lru-cache';

export interface CacheOptions {
  maxSize?: number;
  ttl?: number;
  updateAgeOnGet?: boolean;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

export class CacheManager<T> {
  private cache: LRUCache<string, CacheEntry<T>>;
  private ttl: number;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 3600000; // 默认1小时
    this.cache = new LRUCache<string, CacheEntry<T>>({
      max: options.maxSize || 1000,
      updateAgeOnGet: options.updateAgeOnGet || false,
      ttl: this.ttl,
      updateAgeOnHas: false,
    });
  }

  set(key: string, value: T): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      hits: 0,
    };
    this.cache.set(key, entry);
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.hits++;
      return entry.value;
    }
    return undefined;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  getStats(): CacheStats {
    const entries = Array.from(this.cache.entries());
    const totalHits = entries.reduce((sum, [, entry]) => sum + entry.hits, 0);
    const avgHits = entries.length > 0 ? totalHits / entries.length : 0;

    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      totalHits,
      avgHits,
      hitRate: this.calculateHitRate(),
    };
  }

  private calculateHitRate(): number {
    const stats = this.getStats();
    if (stats.totalHits === 0) return 0;
    return (stats.totalHits / (stats.totalHits + this.cache.calculatedSize)) * 100;
  }

  async getOrSet(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value);
    return value;
  }

  invalidate(pattern: string): number {
    const keys = this.keys();
    let count = 0;

    for (const key of keys) {
      if (this.matchPattern(key, pattern)) {
        this.delete(key);
        count++;
      }
    }

    return count;
  }

  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }

  cleanupExpired(): number {
    const keys = this.keys();
    const now = Date.now();
    let count = 0;

    for (const key of keys) {
      const entry = this.cache.get(key);
      if (entry && now - entry.timestamp > this.ttl) {
        this.delete(key);
        count++;
      }
    }

    return count;
  }
}

export interface CacheStats {
  size: number;
  maxSize: number;
  totalHits: number;
  avgHits: number;
  hitRate: number;
}

export class MultiLevelCache<T> {
  private l1Cache: CacheManager<T>;
  private l2Cache: CacheManager<T>;

  constructor(l1Options: CacheOptions = {}, l2Options: CacheOptions = {}) {
    this.l1Cache = new CacheManager<T>(l1Options);
    this.l2Cache = new CacheManager<T>(l2Options);
  }

  async get(key: string): Promise<T | undefined> {
    const l1Value = this.l1Cache.get(key);
    if (l1Value !== undefined) {
      return l1Value;
    }

    const l2Value = this.l2Cache.get(key);
    if (l2Value !== undefined) {
      this.l1Cache.set(key, l2Value);
      return l2Value;
    }

    return undefined;
  }

  async set(key: string, value: T): Promise<void> {
    this.l1Cache.set(key, value);
    this.l2Cache.set(key, value);
  }

  async getOrSet(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value);
    return value;
  }

  invalidate(key: string): void {
    this.l1Cache.delete(key);
    this.l2Cache.delete(key);
  }

  clear(): void {
    this.l1Cache.clear();
    this.l2Cache.clear();
  }

  getStats(): {
    l1: CacheStats;
    l2: CacheStats;
  } {
    return {
      l1: this.l1Cache.getStats(),
      l2: this.l2Cache.getStats(),
    };
  }
}
