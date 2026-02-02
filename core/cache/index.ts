import EventEmitter from 'eventemitter3';
import { MultiLevelCache } from './cache';
import { LoadBalancer } from './loadBalancer';
import { HealthChecker, CircuitBreaker } from './healthCheck';
import {
  CacheConfig,
  LoadBalancerConfig,
  Server,
  ServerMetrics,
  MultiLevelCacheStats,
  LoadBalancingStats,
  HealthCheckResult,
  CircuitBreakerStats
} from './types';

export class CacheAndLoadBalancingPlatform extends EventEmitter {
  private cache: MultiLevelCache;
  private loadBalancer: LoadBalancer;
  private healthChecker: HealthChecker;
  private circuitBreakers: Map<string, CircuitBreaker>;

  constructor(
    cacheConfig: CacheConfig,
    loadBalancerConfig: LoadBalancerConfig
  ) {
    super();

    this.cache = new MultiLevelCache(cacheConfig);
    this.loadBalancer = new LoadBalancer(loadBalancerConfig);
    this.healthChecker = new HealthChecker(loadBalancerConfig.healthCheck);
    this.circuitBreakers = new Map();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.cache.on('cache:miss', async (data) => {
      this.emit('cache:miss', data);
    });

    this.cache.on('cache:hit', async (data) => {
      this.emit('cache:hit', data);
    });

    this.loadBalancer.on('server:selected', async (data) => {
      this.emit('server:selected', data);
    });

    this.healthChecker.on('server:healthy', async (data) => {
      this.emit('server:healthy', data);
    });

    this.healthChecker.on('server:unhealthy', async (data) => {
      this.emit('server:unhealthy', data);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cache.set<T>(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async getMultiple<T>(keys: string[]): Promise<Map<string, T>> {
    return await this.cache.getMultiple<T>(keys);
  }

  async setMultiple<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
    await this.cache.setMultiple<T>(entries, ttl);
  }

  async deleteMultiple(keys: string[]): Promise<void> {
    await this.cache.deleteMultiple(keys);
  }

  async getCacheStats(): Promise<MultiLevelCacheStats> {
    return await this.cache.getStats();
  }

  async warmupCache(keys: string[]): Promise<void> {
    await this.cache.warmup(keys);
  }

  async getCacheHitRates(): Promise<Map<number, number>> {
    return await this.cache.getHitRates();
  }

  addServer(server: Server): void {
    this.loadBalancer.addServer(server);
    const circuitBreaker = new CircuitBreaker(
      this.loadBalancer['config'].circuitBreaker
    );
    this.circuitBreakers.set(server.id, circuitBreaker);
  }

  removeServer(serverId: string): void {
    this.loadBalancer.removeServer(serverId);
    this.circuitBreakers.delete(serverId);
  }

  getNextServer(key?: string): Server {
    return this.loadBalancer.getNextServer(key);
  }

  updateServerMetrics(serverId: string, metrics: ServerMetrics): void {
    this.loadBalancer.updateServerMetrics(serverId, metrics);
  }

  async getServerStats() {
    return await this.loadBalancer.getServerStats();
  }

  async getLoadBalancingStats(): Promise<LoadBalancingStats> {
    return await this.loadBalancer.getLoadBalancingStats();
  }

  startHealthChecks(servers: Array<{ id: string; host: string; port: string }>): void {
    this.healthChecker.start(servers);
  }

  stopHealthChecks(): void {
    this.healthChecker.stop();
  }

  getHealthCheckResults(serverId: string): HealthCheckResult[] {
    return this.healthChecker.getResults(serverId);
  }

  getLatestHealthCheckResult(serverId: string): HealthCheckResult | null {
    return this.healthChecker.getLatestResult(serverId);
  }

  isServerHealthy(serverId: string): boolean {
    return this.healthChecker.isHealthy(serverId);
  }

  isServerUnhealthy(serverId: string): boolean {
    return this.healthChecker.isUnhealthy(serverId);
  }

  getAverageResponseTime(serverId: string): number {
    return this.healthChecker.getAverageResponseTime(serverId);
  }

  async executeWithCircuitBreaker<T>(
    serverId: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.circuitBreakers.get(serverId);
    if (!circuitBreaker) {
      throw new Error(`Circuit breaker not found for server ${serverId}`);
    }

    return await circuitBreaker.execute(fn);
  }

  isCircuitBreakerOpen(serverId: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(serverId);
    return circuitBreaker ? circuitBreaker.isOpen() : false;
  }

  getCircuitBreakerState(serverId: string) {
    const circuitBreaker = this.circuitBreakers.get(serverId);
    return circuitBreaker ? circuitBreaker.getState() : null;
  }

  getCircuitBreakerStats(serverId: string): CircuitBreakerStats | null {
    const circuitBreaker = this.circuitBreakers.get(serverId);
    return circuitBreaker ? circuitBreaker.getStats() : null;
  }

  resetCircuitBreaker(serverId: string): void {
    const circuitBreaker = this.circuitBreakers.get(serverId);
    if (circuitBreaker) {
      circuitBreaker.reset();
    }
  }

  async getPlatformStats() {
    const cacheStats = await this.getCacheStats();
    const loadBalancingStats = await this.getLoadBalancingStats();
    const serverStats = await this.getServerStats();

    return {
      cache: cacheStats,
      loadBalancing: loadBalancingStats,
      servers: serverStats
    };
  }

  destroy(): void {
    this.cache.destroy();
    this.healthChecker.stop();
    this.removeAllListeners();
  }
}

export * from './types';
export { MultiLevelCache } from './cache';
export { LoadBalancer } from './loadBalancer';
export { HealthChecker, CircuitBreaker } from './healthCheck';
export { IntelligentCacheLayer } from './CacheLayer';
export { CacheSharding } from './CacheSharding';
