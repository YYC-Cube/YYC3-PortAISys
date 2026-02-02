import EventEmitter from 'eventemitter3';
import {
  HealthCheckConfig,
  HealthCheckResult,
  CircuitBreakerConfig,
  CircuitBreakerState,
  CircuitBreakerStats
} from './types';

export class HealthChecker extends EventEmitter {
  private config: HealthCheckConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private results: Map<string, HealthCheckResult[]>;
  private consecutiveFailures: Map<string, number>;
  private consecutiveSuccesses: Map<string, number>;

  constructor(config: HealthCheckConfig) {
    super();
    this.config = config;
    this.results = new Map();
    this.consecutiveFailures = new Map();
    this.consecutiveSuccesses = new Map();
  }

  start(servers: Array<{ id: string; host: string; port: string }>): void {
    if (this.intervalId) {
      this.stop();
    }

    for (const server of servers) {
      this.results.set(server.id, []);
      this.consecutiveFailures.set(server.id, 0);
      this.consecutiveSuccesses.set(server.id, 0);
    }

    this.intervalId = setInterval(() => {
      this.performHealthChecks(servers);
    }, this.config.interval);

    this.emit('health-checker:started');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.emit('health-checker:stopped');
    }
  }

  private async performHealthChecks(
    servers: Array<{ id: string; host: string; port: string }>
  ): Promise<void> {
    for (const server of servers) {
      try {
        const result = await this.checkServer(server);
        this.recordResult(server.id, result);
      } catch (error) {
        const failedResult: HealthCheckResult = {
          serverId: server.id,
          status: 'fail',
          responseTime: this.config.timeout,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        this.recordResult(server.id, failedResult);
      }
    }
  }

  private async checkServer(
    server: { id: string; host: string; port: string }
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const url = `http://${server.host}:${server.port}${this.config.path}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: this.config.method,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const isHealthy = this.config.expectedStatus.includes(response.status);

      return {
        serverId: server.id,
        status: isHealthy ? 'pass' : 'fail',
        responseTime,
        timestamp: Date.now()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        serverId: server.id,
        status: 'fail',
        responseTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private recordResult(serverId: string, result: HealthCheckResult): void {
    const results = this.results.get(serverId);
    if (results) {
      results.push(result);

      if (results.length > 100) {
        results.shift();
      }

      if (result.status === 'pass') {
        this.consecutiveFailures.set(serverId, 0);

        const successes = (this.consecutiveSuccesses.get(serverId) || 0) + 1;
        this.consecutiveSuccesses.set(serverId, successes);

        if (successes >= this.config.healthyThreshold) {
          this.emit('server:healthy', { serverId, result });
        }
      } else {
        this.consecutiveSuccesses.set(serverId, 0);

        const failures = (this.consecutiveFailures.get(serverId) || 0) + 1;
        this.consecutiveFailures.set(serverId, failures);

        if (failures >= this.config.unhealthyThreshold) {
          this.emit('server:unhealthy', { serverId, result });
        }
      }

      this.emit('health-check:completed', { serverId, result });
    }
  }

  getResults(serverId: string): HealthCheckResult[] {
    return this.results.get(serverId) || [];
  }

  getLatestResult(serverId: string): HealthCheckResult | null {
    const results = this.results.get(serverId);
    return results && results.length > 0 ? results[results.length - 1] : null;
  }

  isHealthy(serverId: string): boolean {
    const successes = this.consecutiveSuccesses.get(serverId) || 0;
    return successes >= this.config.healthyThreshold;
  }

  isUnhealthy(serverId: string): boolean {
    const failures = this.consecutiveFailures.get(serverId) || 0;
    return failures >= this.config.unhealthyThreshold;
  }

  getAverageResponseTime(serverId: string): number {
    const results = this.results.get(serverId);
    if (!results || results.length === 0) return 0;

    const total = results.reduce((sum, r) => sum + r.responseTime, 0);
    return total / results.length;
  }
}

export class CircuitBreaker extends EventEmitter {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private totalCalls: number = 0;
  private rejectedCalls: number = 0;

  constructor(config: CircuitBreakerConfig) {
    super();
    this.config = config;
    this.state = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      lastStateChange: Date.now()
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    if (this.state.state === 'open') {
      const timeSinceOpen = Date.now() - this.state.lastStateChange;
      if (timeSinceOpen > this.config.timeout) {
        this.transitionToHalfOpen();
      } else {
        this.rejectedCalls++;
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    this.state.successCount++;

    if (this.state.state === 'half-open') {
      if (this.state.successCount >= this.config.successThreshold) {
        this.transitionToClosed();
      }
    } else if (this.state.state === 'closed') {
      this.state.failureCount = 0;
    }

    this.emit('circuit-breaker:success', { state: this.state.state });
  }

  private recordFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.state === 'closed') {
      if (this.state.failureCount >= this.config.failureThreshold) {
        this.transitionToOpen();
      }
    } else if (this.state.state === 'half-open') {
      this.transitionToOpen();
    }

    this.emit('circuit-breaker:failure', { state: this.state.state });
  }

  private transitionToOpen(): void {
    this.state.state = 'open';
    this.state.lastStateChange = Date.now();
    this.state.successCount = 0;
    this.emit('circuit-breaker:opened');
  }

  private transitionToHalfOpen(): void {
    this.state.state = 'half-open';
    this.state.lastStateChange = Date.now();
    this.state.successCount = 0;
    this.emit('circuit-breaker:half-opened');
  }

  private transitionToClosed(): void {
    this.state.state = 'closed';
    this.state.lastStateChange = Date.now();
    this.state.failureCount = 0;
    this.state.successCount = 0;
    this.emit('circuit-breaker:closed');
  }

  isOpen(): boolean {
    if (this.state.state === 'open') {
      const timeSinceOpen = Date.now() - this.state.lastStateChange;
      if (timeSinceOpen > this.config.timeout) {
        this.transitionToHalfOpen();
        return false;
      }
      return true;
    }
    return false;
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state.state,
      failureCount: this.state.failureCount,
      successCount: this.state.successCount,
      lastFailureTime: this.state.lastFailureTime,
      lastStateChange: this.state.lastStateChange,
      totalCalls: this.totalCalls,
      rejectedCalls: this.rejectedCalls
    };
  }

  reset(): void {
    this.state = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      lastStateChange: Date.now()
    };
    this.totalCalls = 0;
    this.rejectedCalls = 0;
    this.emit('circuit-breaker:reset');
  }
}
