import { IntelligentCacheLayer } from './CacheLayer';

export class CacheSharding {
  private shards: Map<number, IntelligentCacheLayer> = new Map();
  private shardCount: number;
  private shardMetrics: Map<number, any> = new Map();

  constructor(shardCount: number = 4) {
    this.shardCount = shardCount;
    this.initializeShards();
  }

  private initializeShards(): void {
    for (let i = 0; i < this.shardCount; i++) {
      const shard = new IntelligentCacheLayer({
        l1Size: 1250,
        l1TTL: 300000,
      });
      this.shards.set(i, shard);
      this.shardMetrics.set(i, {
        hits: 0,
        misses: 0,
        totalOperations: 0,
      });
    }
  }

  private getShard(key: string): IntelligentCacheLayer {
    const hash = this.hashKey(key);
    const shardIndex = hash % this.shardCount;
    return this.shards.get(shardIndex)!;
  }

  private hashKey(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  async get<T>(key: string, options?: any): Promise<any> {
    const shard = this.getShard(key);
    const result = await shard.get<T>(key, options);
    
    const shardIndex = this.hashKey(key) % this.shardCount;
    const metrics = this.shardMetrics.get(shardIndex)!;
    metrics.totalOperations++;
    if (result.hit) {
      metrics.hits++;
    } else {
      metrics.misses++;
    }
    
    return result;
  }

  async set<T>(key: string, value: T, options?: any): Promise<void> {
    const shard = this.getShard(key);
    await shard.set(key, value, options);
  }

  async delete(key: string): Promise<void> {
    const shard = this.getShard(key);
    await shard.delete(key);
  }

  async clear(): Promise<void> {
    for (const shard of this.shards.values()) {
      await shard.clear();
    }
  }

  getMetrics(): Map<number, any> {
    return new Map(this.shardMetrics);
  }

  getOverallMetrics(): any {
    let totalHits = 0;
    let totalMisses = 0;
    let totalOperations = 0;

    for (const metrics of this.shardMetrics.values()) {
      totalHits += metrics.hits;
      totalMisses += metrics.misses;
      totalOperations += metrics.totalOperations;
    }

    return {
      totalHits,
      totalMisses,
      totalOperations,
      hitRate: totalHits / totalOperations,
      shardCount: this.shardCount,
    };
  }
}
