export class ConnectionPoolOptimizer {
  private minConnections: number;
  private maxConnections: number;
  private idleTimeout: number;
  private connectionTimeout: number;
  private acquireTimeout: number;

  private activeConnections: number = 0;
  private idleConnections: number = 0;
  private waitingRequests: number = 0;
  private createdConnections: number = 0;
  private destroyedConnections: number = 0;

  private connectionHistory: Array<{ timestamp: number; active: number; idle: number }> = [];
  private requestHistory: Array<{ timestamp: number; waiting: number }> = [];

  constructor(config: {
    min?: number;
    max?: number;
    idleTimeout?: number;
    connectionTimeout?: number;
    acquireTimeout?: number;
  } = {}) {
    this.minConnections = config.min ?? 5;
    this.maxConnections = config.max ?? 50;
    this.idleTimeout = config.idleTimeout ?? 30000;
    this.connectionTimeout = config.connectionTimeout ?? 10000;
    this.acquireTimeout = config.acquireTimeout ?? 5000;

    this.startMonitoring();
  }

  private startMonitoring(): void {
    setInterval(() => {
      this.recordMetrics();
      this.optimizePool();
    }, 60000);
  }

  private recordMetrics(): void {
    const now = Date.now();
    this.connectionHistory.push({
      timestamp: now,
      active: this.activeConnections,
      idle: this.idleConnections,
    });

    this.requestHistory.push({
      timestamp: now,
      waiting: this.waitingRequests,
    });

    if (this.connectionHistory.length > 1440) {
      this.connectionHistory.shift();
    }

    if (this.requestHistory.length > 1440) {
      this.requestHistory.shift();
    }
  }

  private optimizePool(): void {
    const stats = this.getStatistics();

    if (stats.waitingRequests > 0) {
      this.increasePoolSize();
    }

    if (stats.idleConnections > stats.activeConnections * 2 && stats.idleConnections > 10) {
      this.decreasePoolSize();
    }

    if (stats.waitingRequests > 10) {
      this.increaseAcquireTimeout();
    }

    if (stats.idleConnections > this.maxConnections * 0.8) {
      this.decreaseIdleTimeout();
    }
  }

  private increasePoolSize(): void {
    const newMax = Math.min(this.maxConnections * 1.5, 100);
    this.maxConnections = Math.floor(newMax);
  }

  private decreasePoolSize(): void {
    const newMax = Math.max(this.maxConnections * 0.8, this.minConnections);
    this.maxConnections = Math.floor(newMax);
  }

  private increaseAcquireTimeout(): void {
    this.acquireTimeout = Math.min(this.acquireTimeout * 1.2, 30000);
  }

  private decreaseIdleTimeout(): void {
    this.idleTimeout = Math.max(this.idleTimeout * 0.8, 10000);
  }

  updateConnectionStats(stats: {
    active?: number;
    idle?: number;
    waiting?: number;
    created?: number;
    destroyed?: number;
  }): void {
    if (stats.active !== undefined) {
      this.activeConnections = stats.active;
    }
    if (stats.idle !== undefined) {
      this.idleConnections = stats.idle;
    }
    if (stats.waiting !== undefined) {
      this.waitingRequests = stats.waiting;
    }
    if (stats.created !== undefined) {
      this.createdConnections += stats.created;
    }
    if (stats.destroyed !== undefined) {
      this.destroyedConnections += stats.destroyed;
    }
  }

  getStatistics() {
    const recentConnections = this.connectionHistory.slice(-60);
    const recentRequests = this.requestHistory.slice(-60);

    const avgActive = recentConnections.reduce((sum, h) => sum + h.active, 0) / recentConnections.length;
    const avgIdle = recentConnections.reduce((sum, h) => sum + h.idle, 0) / recentConnections.length;
    const avgWaiting = recentRequests.reduce((sum, r) => sum + r.waiting, 0) / recentRequests.length;

    return {
      activeConnections: this.activeConnections,
      idleConnections: this.idleConnections,
      waitingRequests: this.waitingRequests,
      createdConnections: this.createdConnections,
      destroyedConnections: this.destroyedConnections,
      avgActiveConnections: avgActive,
      avgIdleConnections: avgIdle,
      avgWaitingRequests: avgWaiting,
      utilizationRate: avgActive / this.maxConnections,
      poolEfficiency: avgActive / (avgActive + avgIdle),
    };
  }

  getOptimizedConfig() {
    const stats = this.getStatistics();

    return {
      min: this.minConnections,
      max: this.maxConnections,
      idleTimeout: this.idleTimeout,
      connectionTimeout: this.connectionTimeout,
      acquireTimeout: this.acquireTimeout,
      utilizationRate: stats.utilizationRate,
      poolEfficiency: stats.poolEfficiency,
    };
  }

  getRecommendations(): string[] {
    const stats = this.getStatistics();
    const recommendations: string[] = [];

    if (stats.waitingRequests > 0) {
      recommendations.push(
        `当前有 ${stats.waitingRequests} 个请求等待连接，建议增加连接池大小到 ${Math.min(this.maxConnections * 1.5, 100)}`
      );
    }

    if (stats.idleConnections > stats.activeConnections * 2 && stats.idleConnections > 10) {
      recommendations.push(
        `当前有 ${stats.idleConnections} 个空闲连接，建议减少连接池大小到 ${Math.max(this.maxConnections * 0.8, this.minConnections)}`
      );
    }

    if (stats.utilizationRate < 0.3) {
      recommendations.push(
        `连接池利用率较低 (${(stats.utilizationRate * 100).toFixed(1)}%)，建议减少最小连接数到 ${Math.max(this.minConnections - 2, 2)}`
      );
    }

    if (stats.utilizationRate > 0.8) {
      recommendations.push(
        `连接池利用率较高 (${(stats.utilizationRate * 100).toFixed(1)}%)，建议增加最大连接数到 ${Math.min(this.maxConnections * 1.5, 100)}`
      );
    }

    if (stats.poolEfficiency < 0.5) {
      recommendations.push(
        `连接池效率较低 (${(stats.poolEfficiency * 100).toFixed(1)}%)，建议调整空闲超时时间到 ${Math.max(this.idleTimeout * 0.8, 10000)}ms`
      );
    }

    return recommendations;
  }

  reset(): void {
    this.activeConnections = 0;
    this.idleConnections = 0;
    this.waitingRequests = 0;
    this.createdConnections = 0;
    this.destroyedConnections = 0;
    this.connectionHistory = [];
    this.requestHistory = [];
  }
}
