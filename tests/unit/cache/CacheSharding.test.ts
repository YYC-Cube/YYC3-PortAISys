import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheSharding } from '@/core/cache/CacheSharding';

describe('CacheSharding', () => {
  let cacheSharding: CacheSharding;

  beforeEach(() => {
    cacheSharding = new CacheSharding(4);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create CacheSharding with default shard count', () => {
      const defaultCacheSharding = new CacheSharding();
      expect(defaultCacheSharding).toBeDefined();
    });

    it('should create CacheSharding with custom shard count', () => {
      const customCacheSharding = new CacheSharding(8);
      expect(customCacheSharding).toBeDefined();
    });
  });

  describe('get', () => {
    it('should return cache miss for non-existent key', async () => {
      const result = await cacheSharding.get('non-existent-key');
      expect(result.hit).toBe(false);
      expect(result.value).toBeNull();
    });

    it('should return cache hit for existing key', async () => {
      await cacheSharding.set('test-key', 'test-value');
      const result = await cacheSharding.get('test-key');
      expect(result.hit).toBe(true);
      expect(result.value).toBe('test-value');
    });

    it('should update metrics on cache hit', async () => {
      await cacheSharding.set('test-key', 'test-value');
      await cacheSharding.get('test-key');
      const metrics = cacheSharding.getOverallMetrics();
      expect(metrics.totalHits).toBe(1);
      expect(metrics.totalMisses).toBe(0);
    });

    it('should update metrics on cache miss', async () => {
      await cacheSharding.get('non-existent-key');
      const metrics = cacheSharding.getOverallMetrics();
      expect(metrics.totalHits).toBe(0);
      expect(metrics.totalMisses).toBe(1);
    });

    it('should distribute keys across shards', async () => {
      const keys = ['key1', 'key2', 'key3', 'key4', 'key5'];
      for (const key of keys) {
        await cacheSharding.set(key, `value-${key}`);
      }

      for (const key of keys) {
        const result = await cacheSharding.get(key);
        expect(result.hit).toBe(true);
        expect(result.value).toBe(`value-${key}`);
      }
    });
  });

  describe('set', () => {
    it('should set value in cache', async () => {
      await cacheSharding.set('test-key', 'test-value');
      const result = await cacheSharding.get('test-key');
      expect(result.hit).toBe(true);
      expect(result.value).toBe('test-value');
    });

    it('should set complex object in cache', async () => {
      const complexObject = {
        id: 1,
        name: 'Test',
        nested: {
          value: 'nested-value',
        },
      };
      await cacheSharding.set('complex-key', complexObject);
      const result = await cacheSharding.get('complex-key');
      expect(result.hit).toBe(true);
      expect(result.value).toEqual(complexObject);
    });

    it('should set array in cache', async () => {
      const array = [1, 2, 3, 4, 5];
      await cacheSharding.set('array-key', array);
      const result = await cacheSharding.get('array-key');
      expect(result.hit).toBe(true);
      expect(result.value).toEqual(array);
    });

    it('should overwrite existing value', async () => {
      await cacheSharding.set('test-key', 'old-value');
      await cacheSharding.set('test-key', 'new-value');
      const result = await cacheSharding.get('test-key');
      expect(result.hit).toBe(true);
      expect(result.value).toBe('new-value');
    });
  });

  describe('getOverallMetrics', () => {
    it('should return initial metrics', () => {
      const metrics = cacheSharding.getOverallMetrics();
      expect(metrics.totalHits).toBe(0);
      expect(metrics.totalMisses).toBe(0);
      expect(metrics.totalOperations).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.shardCount).toBe(4);
    });

    it('should calculate hit rate correctly', async () => {
      await cacheSharding.set('key1', 'value1');
      await cacheSharding.set('key2', 'value2');
      await cacheSharding.get('key1');
      await cacheSharding.get('key2');
      await cacheSharding.get('key3');

      const metrics = cacheSharding.getOverallMetrics();
      expect(metrics.totalHits).toBe(2);
      expect(metrics.totalMisses).toBe(1);
      expect(metrics.totalOperations).toBe(3);
      expect(metrics.hitRate).toBeCloseTo(0.6667, 4);
    });

    it('should handle zero operations', () => {
      const metrics = cacheSharding.getOverallMetrics();
      expect(metrics.hitRate).toBe(0);
    });
  });

  describe('hashKey', () => {
    it('should generate consistent hash for same key', () => {
      const hash1 = (cacheSharding as any).hashKey('test-key');
      const hash2 = (cacheSharding as any).hashKey('test-key');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different keys', () => {
      const hash1 = (cacheSharding as any).hashKey('key1');
      const hash2 = (cacheSharding as any).hashKey('key2');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate non-negative hash', () => {
      const hash = (cacheSharding as any).hashKey('test-key');
      expect(hash).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getShard', () => {
    it('should return valid shard for any key', () => {
      const shard = (cacheSharding as any).getShard('test-key');
      expect(shard).toBeDefined();
    });

    it('should distribute keys across shards', () => {
      const keys = ['key1', 'key2', 'key3', 'key4', 'key5', 'key6', 'key7', 'key8'];
      const shardIndices = new Set<number>();

      for (const key of keys) {
        const hash = (cacheSharding as any).hashKey(key);
        const shardIndex = hash % 4;
        shardIndices.add(shardIndex);
      }

      expect(shardIndices.size).toBeGreaterThan(1);
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent get operations', async () => {
      await cacheSharding.set('test-key', 'test-value');

      const promises = Array.from({ length: 10 }, () => 
        cacheSharding.get('test-key')
      );

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.hit).toBe(true);
        expect(result.value).toBe('test-value');
      });
    });

    it('should handle concurrent set operations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        cacheSharding.set(`key-${i}`, `value-${i}`)
      );

      await Promise.all(promises);

      for (let i = 0; i < 10; i++) {
        const result = await cacheSharding.get(`key-${i}`);
        expect(result.hit).toBe(true);
        expect(result.value).toBe(`value-${i}`);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string key', async () => {
      await cacheSharding.set('', 'empty-key-value');
      const result = await cacheSharding.get('');
      expect(result.hit).toBe(true);
      expect(result.value).toBe('empty-key-value');
    });

    it('should handle special characters in key', async () => {
      const specialKey = 'key-with-special-chars-!@#$%^&*()';
      await cacheSharding.set(specialKey, 'special-value');
      const result = await cacheSharding.get(specialKey);
      expect(result.hit).toBe(true);
      expect(result.value).toBe('special-value');
    });

    it('should handle very long key', async () => {
      const longKey = 'a'.repeat(1000);
      await cacheSharding.set(longKey, 'long-key-value');
      const result = await cacheSharding.get(longKey);
      expect(result.hit).toBe(true);
      expect(result.value).toBe('long-key-value');
    });

    it('should handle null value', async () => {
      await cacheSharding.set('null-key', null);
      const result = await cacheSharding.get('null-key');
      expect(result.hit).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should handle undefined value', async () => {
      await cacheSharding.set('undefined-key', undefined);
      const result = await cacheSharding.get('undefined-key');
      expect(result.hit).toBe(true);
      expect(result.value).toBeUndefined();
    });
  });
});
