import EventEmitter from 'eventemitter3';
import {
  Server,
  ServerMetrics,
  ServerStats,
  LoadBalancingStats,
  LoadBalancerConfig
} from './types';

export class LoadBalancer extends EventEmitter {
  private servers: Map<string, Server>;
  private serverMetrics: Map<string, ServerMetrics[]>;
  private serverStats: Map<string, ServerStats>;

  private currentIndex: number = 0;
  private config: LoadBalancerConfig;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private sessionMap: Map<string, string>;

  constructor(config: LoadBalancerConfig) {
    super();
    this.config = config;
    this.servers = new Map();
    this.serverMetrics = new Map();
    this.serverStats = new Map();
    this.circuitBreakers = new Map();
    this.sessionMap = new Map();
  }

  addServer(server: Server): void {
    this.servers.set(server.id, server);
    this.serverMetrics.set(server.id, []);
    this.serverStats.set(server.id, {
      server,
      metrics: this.createEmptyMetrics(server.id),
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
      lastHealthCheck: Date.now(),
      healthStatus: 'healthy'
    });

    this.circuitBreakers.set(server.id, new CircuitBreaker(this.config.circuitBreaker));
    this.emit('server:added', { server });
  }

  removeServer(serverId: string): void {
    const server = this.servers.get(serverId);
    if (server) {
      this.servers.delete(serverId);
      this.serverMetrics.delete(serverId);
      this.serverStats.delete(serverId);
      this.circuitBreakers.delete(serverId);

      for (const [session, sid] of this.sessionMap.entries()) {
        if (sid === serverId) {
          this.sessionMap.delete(session);
        }
      }

      this.emit('server:removed', { serverId });
    }
  }

  getNextServer(key?: string): Server {
    const activeServers = this.getActiveServers();

    if (activeServers.length === 0) {
      throw new Error('No active servers available');
    }

    let selectedServer: Server;

    if (this.config.sessionAffinity !== 'none' && key) {
      const sessionKey = this.getSessionKey(key);
      const serverId = this.sessionMap.get(sessionKey);

      if (serverId && this.servers.has(serverId)) {
        const server = this.servers.get(serverId)!;
        if (server.status === 'active' && !this.circuitBreakers.get(serverId)!.isOpen()) {
          selectedServer = server;
          this.emit('server:selected', { 
            server: selectedServer, 
            method: 'session-affinity' 
          });
          return selectedServer;
        }
      }
    }

    switch (this.config.algorithm) {
      case 'round-robin':
        selectedServer = this.roundRobin(activeServers);
        break;
      case 'weighted-round-robin':
        selectedServer = this.weightedRoundRobin(activeServers);
        break;
      case 'least-connections':
        selectedServer = this.leastConnections(activeServers);
        break;
      case 'weighted-least-connections':
        selectedServer = this.weightedLeastConnections(activeServers);
        break;
      case 'consistent-hashing':
        selectedServer = this.consistentHashing(activeServers, key);
        break;
      case 'adaptive':
        selectedServer = this.adaptive(activeServers);
        break;
      default:
        selectedServer = this.roundRobin(activeServers);
    }

    if (this.config.sessionAffinity !== 'none' && key) {
      const sessionKey = this.getSessionKey(key);
      this.sessionMap.set(sessionKey, selectedServer.id);
    }

    this.emit('server:selected', { 
      server: selectedServer, 
      method: this.config.algorithm 
    });

    return selectedServer;
  }

  updateServerMetrics(serverId: string, metrics: ServerMetrics): void {
    const serverMetricsList = this.serverMetrics.get(serverId);
    if (serverMetricsList) {
      serverMetricsList.push(metrics);

      if (serverMetricsList.length > 100) {
        serverMetricsList.shift();
      }

      const stats = this.serverStats.get(serverId);
      if (stats) {
        stats.metrics = this.calculateAverageMetrics(serverMetricsList);
        stats.requestCount++;
        stats.avgResponseTime = stats.metrics.responseTime;

        if (metrics.errorRate > 0) {
          stats.errorCount++;
        } else {
          stats.successCount++;
        }

        const circuitBreaker = this.circuitBreakers.get(serverId);
        if (circuitBreaker) {
          if (metrics.errorRate > 0.5) {
            circuitBreaker.recordFailure();
          } else {
            circuitBreaker.recordSuccess();
          }
        }

        this.updateHealthStatus(serverId);
      }

      this.emit('metrics:updated', { serverId, metrics });
    }
  }

  async getServerStats(): Promise<ServerStats[]> {
    return Array.from(this.serverStats.values());
  }

  async getLoadBalancingStats(): Promise<LoadBalancingStats> {
    const stats = await this.getServerStats();
    const totalRequests = stats.reduce((sum, s) => sum + s.requestCount, 0);
    const totalConnections = stats.reduce((sum, s) => sum + s.server.activeConnections, 0);
    const avgResponseTime = stats.reduce((sum, s) => sum + s.avgResponseTime, 0) / stats.length;

    const distribution = new Map<string, number>();
    for (const stat of stats) {
      distribution.set(stat.server.id, stat.requestCount);
    }

    return {
      totalRequests,
      totalConnections,
      avgResponseTime,
      algorithm: this.config.algorithm,
      serverCount: this.servers.size,
      activeServers: this.getActiveServers().length,
      distribution
    };
  }

  private getActiveServers(): Server[] {
    return Array.from(this.servers.values()).filter(server => {
      const circuitBreaker = this.circuitBreakers.get(server.id);
      return server.status === 'active' && 
             (circuitBreaker ? !circuitBreaker.isOpen() : true);
    });
  }

  private roundRobin(servers: Server[]): Server {
    const server = servers[this.currentIndex % servers.length];
    this.currentIndex++;
    return server;
  }

  private weightedRoundRobin(servers: Server[]): Server {
    const totalWeight = servers.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;

    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }

    return servers[0];
  }

  private leastConnections(servers: Server[]): Server {
    return servers.reduce((min, server) => 
      server.activeConnections < min.activeConnections ? server : min
    );
  }

  private weightedLeastConnections(servers: Server[]): Server {
    let minScore = Infinity;
    let selectedServer = servers[0];

    for (const server of servers) {
      const score = server.activeConnections / server.weight;
      if (score < minScore) {
        minScore = score;
        selectedServer = server;
      }
    }

    return selectedServer;
  }

  private consistentHashing(servers: Server[], key?: string): Server {
    const hashKey = key || Date.now().toString();
    const hash = this.hash(hashKey);
    const index = hash % servers.length;
    return servers[index];
  }

  private adaptive(servers: Server[]): Server {
    let bestScore = -Infinity;
    let selectedServer = servers[0];

    for (const server of servers) {
      const stats = this.serverStats.get(server.id);
      if (stats) {
        const score = this.calculateAdaptiveScore(server, stats);
        if (score > bestScore) {
          bestScore = score;
          selectedServer = server;
        }
      }
    }

    return selectedServer;
  }

  private calculateAdaptiveScore(server: Server, stats: ServerStats): number {
    const connectionScore = 1 - (server.activeConnections / server.maxConnections);
    const responseScore = 1 / (stats.avgResponseTime + 1);
    const errorScore = 1 - stats.metrics.errorRate;
    const weightScore = server.weight / 10;

    return (connectionScore * 0.3) + (responseScore * 0.3) + 
           (errorScore * 0.3) + (weightScore * 0.1);
  }

  private getSessionKey(key: string): string {
    switch (this.config.sessionAffinity) {
      case 'ip':
        return key.split(':')[0];
      case 'cookie':
        return key;
      case 'url':
        return key.split('?')[0];
      default:
        return key;
    }
  }

  private createEmptyMetrics(serverId: string): ServerMetrics {
    return {
      serverId,
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      timestamp: Date.now()
    };
  }

  private calculateAverageMetrics(metrics: ServerMetrics[]): ServerMetrics {
    if (metrics.length === 0) {
      return this.createEmptyMetrics('');
    }

    const avg = {
      serverId: metrics[0].serverId,
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      timestamp: Date.now()
    };

    for (const m of metrics) {
      avg.responseTime += m.responseTime;
      avg.errorRate += m.errorRate;
      avg.throughput += m.throughput;
      avg.cpuUsage += m.cpuUsage;
      avg.memoryUsage += m.memoryUsage;
    }

    avg.responseTime /= metrics.length;
    avg.errorRate /= metrics.length;
    avg.throughput /= metrics.length;
    avg.cpuUsage /= metrics.length;
    avg.memoryUsage /= metrics.length;

    return avg;
  }

  private updateHealthStatus(serverId: string): void {
    const stats = this.serverStats.get(serverId);
    if (!stats) return;

    const circuitBreaker = this.circuitBreakers.get(serverId);
    const isCircuitOpen = circuitBreaker ? circuitBreaker.isOpen() : false;

    if (isCircuitOpen || stats.metrics.errorRate > 0.5 || 
        stats.metrics.cpuUsage > 90 || stats.metrics.memoryUsage > 90) {
      stats.healthStatus = 'unhealthy';
    } else if (stats.metrics.errorRate > 0.2 || 
               stats.metrics.cpuUsage > 70 || 
               stats.metrics.memoryUsage > 70) {
      stats.healthStatus = 'degraded';
    } else {
      stats.healthStatus = 'healthy';
    }

    this.emit('health:updated', { serverId, status: stats.healthStatus });
  }

  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

class CircuitBreaker {
  private config: any;
  private failureCount: number = 0;
  private successCount: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private lastStateChange: number = Date.now();

  constructor(config: any) {
    this.config = config;
  }

  recordFailure(): void {
    this.failureCount++;

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
      this.lastStateChange = Date.now();
      this.successCount = 0;
    }
  }

  recordSuccess(): void {
    this.successCount++;

    if (this.state === 'half-open' && this.successCount >= this.config.successThreshold) {
      this.state = 'closed';
      this.lastStateChange = Date.now();
      this.failureCount = 0;
    }
  }

  isOpen(): boolean {
    if (this.state === 'open') {
      const timeSinceOpen = Date.now() - this.lastStateChange;
      if (timeSinceOpen > this.config.timeout) {
        this.state = 'half-open';
        this.lastStateChange = Date.now();
        return false;
      }
      return true;
    }
    return false;
  }

  getState(): string {
    return this.state;
  }
}
