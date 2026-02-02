import EventEmitter from 'eventemitter3';
import {
  CacheEntry,
  CacheLevelStats,
  MultiLevelCacheStats,
  CacheConfig
} from './types';

export class MultiLevelCache extends EventEmitter {
  private l1Cache: Map<string, CacheEntry<any>>;
  private l2Cache: Map<string, CacheEntry<any>>;
  private l3Cache: Map<string, CacheEntry<any>>;

  private l1Stats: CacheLevelStats;
  private l2Stats: CacheLevelStats;
  private l3Stats: CacheLevelStats;

  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: CacheConfig) {
    super();
    this.config = config;
    this.l1Cache = new Map();
    this.l2Cache = new Map();
    this.l3Cache = new Map();

    this.l1Stats = {
      size: 0,
      maxSize: config.l1.maxSize,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0
    };

    this.l2Stats = {
      size: 0,
      maxSize: config.l2.maxSize,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0
    };

    this.l3Stats = {
      size: 0,
      maxSize: config.l3.maxSize,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0
    };

    this.cleanupInterval = setInterval(() => this.cleanupExpiredEntries(), 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && !this.isExpired(l1Entry)) {
      this.l1Stats.hits++;
      this.l1Stats.hitRate = this.l1Stats.hits / (this.l1Stats.hits + this.l1Stats.misses);
      l1Entry.accessCount++;
      l1Entry.lastAccess = Date.now();
      this.emit('cache:hit', { level: 'l1', key });
      return l1Entry.value as T;
    }

    if (l1Entry) {
      this.l1Cache.delete(key);
      this.l1Stats.size--;
    }

    this.l1Stats.misses++;
    this.l1Stats.hitRate = this.l1Stats.hits / (this.l1Stats.hits + this.l1Stats.misses);

    const l2Entry = this.l2Cache.get(key);
    if (l2Entry && !this.isExpired(l2Entry)) {
      this.l2Stats.hits++;
      this.l2Stats.hitRate = this.l2Stats.hits / (this.l2Stats.hits + this.l2Stats.misses);
      l2Entry.accessCount++;
      l2Entry.lastAccess = Date.now();

      await this.promoteToL1(key, l2Entry);
      this.emit('cache:hit', { level: 'l2', key });
      return l2Entry.value as T;
    }

    if (l2Entry) {
      this.l2Cache.delete(key);
      this.l2Stats.size--;
    }

    this.l2Stats.misses++;
    this.l2Stats.hitRate = this.l2Stats.hits / (this.l2Stats.hits + this.l2Stats.misses);

    const l3Entry = this.l3Cache.get(key);
    if (l3Entry && !this.isExpired(l3Entry)) {
      this.l3Stats.hits++;
      this.l3Stats.hitRate = this.l3Stats.hits / (this.l3Stats.hits + this.l3Stats.misses);
      l3Entry.accessCount++;
      l3Entry.lastAccess = Date.now();

      await this.promoteToL2(key, l3Entry);
      this.emit('cache:hit', { level: 'l3', key });
      return l3Entry.value as T;
    }

    if (l3Entry) {
      this.l3Cache.delete(key);
      this.l3Stats.size--;
    }

    this.l3Stats.misses++;
    this.l3Stats.hitRate = this.l3Stats.hits / (this.l3Stats.hits + this.l3Stats.misses);
    this.emit('cache:miss', { key });
    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.l1.ttl,
      accessCount: 0,
      lastAccess: Date.now()
    };

    await this.setInL1(key, entry);
    this.emit('cache:set', { key, ttl: entry.ttl });
  }

  async delete(key: string): Promise<void> {
    const deletedL1 = this.l1Cache.delete(key);
    const deletedL2 = this.l2Cache.delete(key);
    const deletedL3 = this.l3Cache.delete(key);

    if (deletedL1) this.l1Stats.size--;
    if (deletedL2) this.l2Stats.size--;
    if (deletedL3) this.l3Stats.size--;

    this.emit('cache:delete', { key });
  }

  async clear(): Promise<void> {
    this.l1Cache.clear();
    this.l2Cache.clear();
    this.l3Cache.clear();

    this.l1Stats.size = 0;
    this.l2Stats.size = 0;
    this.l3Stats.size = 0;

    this.emit('cache:clear');
  }

  async getMultiple<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== null) {
        result.set(key, value);
      }
    }

    return result;
  }

  async setMultiple<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
    for (const [key, value] of entries.entries()) {
      await this.set(key, value, ttl);
    }
  }

  async deleteMultiple(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(key);
    }
  }

  async getStats(): Promise<MultiLevelCacheStats> {
    const totalHits = this.l1Stats.hits + this.l2Stats.hits + this.l3Stats.hits;
    const totalMisses = this.l1Stats.misses + this.l2Stats.misses + this.l3Stats.misses;
    const overallHitRate = totalHits / (totalHits + totalMisses) || 0;

    return {
      l1: { ...this.l1Stats },
      l2: { ...this.l2Stats },
      l3: { ...this.l3Stats },
      totalHits,
      totalMisses,
      overallHitRate
    };
  }

  async warmup(keys: string[]): Promise<void> {
    this.emit('cache:warmup:start', { keyCount: keys.length });

    let successCount = 0;
    for (const key of keys) {
      try {
        const value = await this.fetchFromSource(key);
        if (value !== null) {
          await this.set(key, value);
          successCount++;
        }
      } catch (error) {
        this.emit('cache:warmup:error', { key, error });
      }
    }

    this.emit('cache:warmup:complete', { 
      keyCount: keys.length, 
      successCount,
      failureCount: keys.length - successCount
    });
  }

  async getHitRates(): Promise<Map<number, number>> {
    return new Map([
      [1, this.l1Stats.hitRate],
      [2, this.l2Stats.hitRate],
      [3, this.l3Stats.hitRate]
    ]);
  }

  private async setInL1<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (this.l1Cache.size >= this.l1Stats.maxSize) {
      await this.evictFromL1();
    }

    this.l1Cache.set(key, entry);
    this.l1Stats.size++;
  }

  private async promoteToL1<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (this.l1Cache.size >= this.l1Stats.maxSize) {
      await this.evictFromL1();
    }

    const l1Entry: CacheEntry<T> = {
      ...entry,
      timestamp: Date.now(),
      ttl: this.config.l1.ttl
    };

    this.l1Cache.set(key, l1Entry);
    this.l1Stats.size++;
  }

  private async promoteToL2<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (this.l2Cache.size >= this.l2Stats.maxSize) {
      await this.evictFromL2();
    }

    const l2Entry: CacheEntry<T> = {
      ...entry,
      timestamp: Date.now(),
      ttl: this.config.l2.ttl
    };

    this.l2Cache.set(key, l2Entry);
    this.l2Stats.size++;
  }

  private async evictFromL1(): Promise<void> {
    const strategy = this.config.l1.strategy;
    let keyToDelete: string | null = null;

    if (strategy === 'lru') {
      keyToDelete = this.findLRU(this.l1Cache);
    } else if (strategy === 'lfu') {
      keyToDelete = this.findLFU(this.l1Cache);
    } else if (strategy === 'ttl') {
      keyToDelete = this.findShortestTTL(this.l1Cache);
    }

    if (keyToDelete) {
      this.l1Cache.delete(keyToDelete);
      this.l1Stats.size--;
      this.l1Stats.evictions++;
      this.emit('cache:evict', { level: 'l1', key: keyToDelete });
    }
  }

  private async evictFromL2(): Promise<void> {
    const strategy = this.config.l2.strategy;
    let keyToDelete: string | null = null;

    if (strategy === 'lru') {
      keyToDelete = this.findLRU(this.l2Cache);
    } else if (strategy === 'lfu') {
      keyToDelete = this.findLFU(this.l2Cache);
    } else if (strategy === 'ttl') {
      keyToDelete = this.findShortestTTL(this.l2Cache);
    }

    if (keyToDelete) {
      this.l2Cache.delete(keyToDelete);
      this.l2Stats.size--;
      this.l2Stats.evictions++;
      this.emit('cache:evict', { level: 'l2', key: keyToDelete });
    }
  }

  private findLRU(cache: Map<string, CacheEntry<any>>): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFU(cache: Map<string, CacheEntry<any>>): string | null {
    let leastUsedKey: string | null = null;
    let leastUsedCount = Infinity;

    for (const [key, entry] of cache.entries()) {
      if (entry.accessCount < leastUsedCount) {
        leastUsedCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private findShortestTTL(cache: Map<string, CacheEntry<any>>): string | null {
    let shortestKey: string | null = null;
    let shortestTTL = Infinity;

    const now = Date.now();

    for (const [key, entry] of cache.entries()) {
      const remainingTTL = entry.timestamp + entry.ttl - now;
      if (remainingTTL < shortestTTL) {
        shortestTTL = remainingTTL;
        shortestKey = key;
      }
    }

    return shortestKey;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    return now > entry.timestamp + entry.ttl;
  }

  private cleanupExpiredEntries(): void {
    for (const [key, entry] of this.l1Cache.entries()) {
      if (this.isExpired(entry)) {
        this.l1Cache.delete(key);
        this.l1Stats.size--;
      }
    }

    for (const [key, entry] of this.l2Cache.entries()) {
      if (this.isExpired(entry)) {
        this.l2Cache.delete(key);
        this.l2Stats.size--;
      }
    }

    for (const [key, entry] of this.l3Cache.entries()) {
      if (this.isExpired(entry)) {
        this.l3Cache.delete(key);
        this.l3Stats.size--;
      }
    }

    this.emit('cache:cleanup');
  }

  private async fetchFromSource<T>(_key: string): Promise<T | null> {
    return null;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.removeAllListeners();
  }
}
