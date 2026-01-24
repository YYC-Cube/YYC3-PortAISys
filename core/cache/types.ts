export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

export interface MultiLevelCacheStats {
  l1: CacheLevelStats;
  l2: CacheLevelStats;
  l3: CacheLevelStats;
  totalHits: number;
  totalMisses: number;
  overallHitRate: number;
}

export interface CacheLevelStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

export interface Server {
  id: string;
  host: string;
  port: number;
  weight: number;
  activeConnections: number;
  maxConnections: number;
  status: 'active' | 'inactive' | 'draining';
  metadata: Record<string, any>;
}

export interface ServerMetrics {
  serverId: string;
  responseTime: number;
  errorRate: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  timestamp: number;
}

export interface ServerStats {
  server: Server;
  metrics: ServerMetrics;
  requestCount: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  lastHealthCheck: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

export interface LoadBalancingStats {
  totalRequests: number;
  totalConnections: number;
  avgResponseTime: number;
  algorithm: string;
  serverCount: number;
  activeServers: number;
  distribution: Map<string, number>;
}

export interface HealthCheckConfig {
  interval: number;
  timeout: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
  path: string;
  method: 'GET' | 'POST' | 'HEAD';
  expectedStatus: number[];
}

export interface HealthCheckResult {
  serverId: string;
  status: 'pass' | 'fail';
  responseTime: number;
  timestamp: number;
  error?: string;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  halfOpenMaxCalls: number;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastStateChange: number;
}

export interface CircuitBreakerStats {
  state: string;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastStateChange: number;
  totalCalls: number;
  rejectedCalls: number;
}

export interface CacheConfig {
  l1: {
    maxSize: number;
    ttl: number;
    strategy: 'lru' | 'lfu' | 'ttl';
  };
  l2: {
    maxSize: number;
    ttl: number;
    strategy: 'lru' | 'lfu' | 'ttl';
  };
  l3: {
    maxSize: number;
    ttl: number;
    strategy: 'lru' | 'lfu' | 'ttl';
  };
}

export interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'weighted-round-robin' | 'least-connections' | 
            'weighted-least-connections' | 'consistent-hashing' | 'adaptive';
  healthCheck: HealthCheckConfig;
  circuitBreaker: CircuitBreakerConfig;
  sessionAffinity: 'none' | 'ip' | 'cookie' | 'url';
}

export type CacheStrategy = 'lru' | 'lfu' | 'ttl';
export type LoadBalancingAlgorithm = 'round-robin' | 'weighted-round-robin' | 
  'least-connections' | 'weighted-least-connections' | 'consistent-hashing' | 'adaptive';
export type SessionAffinity = 'none' | 'ip' | 'cookie' | 'url';
