/**
 * @file MetricsCollector.ts
 * @description 指标收集器 - 收集和聚合系统指标
 * @module core/monitoring
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { EventEmitter } from 'events';
import { PrometheusIntegration } from './PrometheusIntegration';

/**
 * 指标数据点
 */
export interface MetricDataPoint {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

/**
 * 时间序列数据
 */
export interface TimeSeries {
  metric: string;
  dataPoints: MetricDataPoint[];
}

/**
 * 系统指标
 */
export interface SystemMetrics {
  cpu: {
    usage: number;
    user: number;
    system: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    heapUsed: number;
    heapTotal: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
}

/**
 * 应用指标
 */
export interface ApplicationMetrics {
  http: {
    requestsTotal: number;
    requestsPerSecond: number;
    avgResponseTime: number;
    errorRate: number;
  };
  database: {
    queriesTotal: number;
    queriesPerSecond: number;
    avgQueryTime: number;
    connectionPoolSize: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictions: number;
    size: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

/**
 * 收集器配置
 */
export interface CollectorConfig {
  collectInterval?: number;
  retentionPeriod?: number;
  enablePrometheus?: boolean;
  prometheusPort?: number;
}

/**
 * 指标收集器
 */
export class MetricsCollector extends EventEmitter {
  private config: Required<CollectorConfig>;
  private prometheus?: PrometheusIntegration;
  private timeSeries: Map<string, TimeSeries> = new Map();
  private collectTimer?: NodeJS.Timeout;
  private isCollecting: boolean = false;

  // 计数器
  private counters: Map<string, number> = new Map();
  
  // 统计数据
  private stats = {
    http: {
      requests: [] as number[],
      responseTimes: [] as number[]
    },
    database: {
      queries: [] as number[],
      queryTimes: [] as number[]
    }
  };

  constructor(config: CollectorConfig = {}) {
    super();

    this.config = {
      collectInterval: config.collectInterval || 15000, // 15秒
      retentionPeriod: config.retentionPeriod || 86400000, // 24小时
      enablePrometheus: config.enablePrometheus !== false,
      prometheusPort: config.prometheusPort || 9090
    };

    if (this.config.enablePrometheus) {
      this.initializePrometheus();
    }
  }

  /**
   * 初始化Prometheus集成
   */
  private initializePrometheus(): void {
    const { createPrometheusIntegration, registerDefaultMetrics } = require('./PrometheusIntegration');
    
    this.prometheus = createPrometheusIntegration({
      port: this.config.prometheusPort,
      prefix: 'yyc3_'
    });

    registerDefaultMetrics(this.prometheus);
  }

  /**
   * 开始收集指标
   */
  startCollecting(): void {
    if (this.isCollecting) {
      return;
    }

    this.isCollecting = true;
    this.collectTimer = setInterval(() => {
      this.collect();
    }, this.config.collectInterval);

    // 立即执行一次收集
    this.collect();

    this.emit('collecting:started');
  }

  /**
   * 停止收集指标
   */
  stopCollecting(): void {
    if (this.collectTimer) {
      clearInterval(this.collectTimer);
      this.collectTimer = undefined;
    }

    this.isCollecting = false;
    this.emit('collecting:stopped');
  }

  /**
   * 收集所有指标
   */
  private async collect(): Promise<void> {
    try {
      const timestamp = Date.now();

      // 收集系统指标
      const systemMetrics = this.collectSystemMetrics();
      this.recordSystemMetrics(systemMetrics, timestamp);

      // 收集应用指标
      const appMetrics = this.collectApplicationMetrics();
      this.recordApplicationMetrics(appMetrics, timestamp);

      // 清理过期数据
      this.cleanupOldData(timestamp);

      this.emit('metrics:collected', { timestamp, systemMetrics, appMetrics });
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * 收集系统指标
   */
  private collectSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // 转换为秒
        user: cpuUsage.user / 1000000,
        system: cpuUsage.system / 1000000
      },
      memory: {
        total: memUsage.rss,
        used: memUsage.heapUsed,
        free: memUsage.heapTotal - memUsage.heapUsed,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal
      },
      disk: {
        total: 0, // 需要系统级API
        used: 0,
        free: 0
      },
      network: {
        bytesIn: 0, // 需要网络统计
        bytesOut: 0
      }
    };
  }

  /**
   * 收集应用指标
   */
  private collectApplicationMetrics(): ApplicationMetrics {
    const now = Date.now();
    const windowSize = 60000; // 1分钟窗口

    // 计算HTTP指标
    const recentRequests = this.stats.http.requests.filter(t => now - t < windowSize);
    const recentResponseTimes = this.stats.http.responseTimes.filter((_, i) => 
      now - this.stats.http.requests[i] < windowSize
    );

    const avgResponseTime = recentResponseTimes.length > 0
      ? recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length
      : 0;

    // 计算数据库指标
    const recentQueries = this.stats.database.queries.filter(t => now - t < windowSize);
    const recentQueryTimes = this.stats.database.queryTimes.filter((_, i) =>
      now - this.stats.database.queries[i] < windowSize
    );

    const avgQueryTime = recentQueryTimes.length > 0
      ? recentQueryTimes.reduce((a, b) => a + b, 0) / recentQueryTimes.length
      : 0;

    return {
      http: {
        requestsTotal: this.getCounter('http.requests') || 0,
        requestsPerSecond: recentRequests.length / 60,
        avgResponseTime,
        errorRate: 0 // 需要错误统计
      },
      database: {
        queriesTotal: this.getCounter('database.queries') || 0,
        queriesPerSecond: recentQueries.length / 60,
        avgQueryTime,
        connectionPoolSize: 10 // 需要实际连接池信息
      },
      cache: {
        hitRate: this.calculateCacheHitRate(),
        missRate: this.calculateCacheMissRate(),
        evictions: this.getCounter('cache.evictions') || 0,
        size: this.getCounter('cache.size') || 0
      },
      errors: {
        total: this.getCounter('errors.total') || 0,
        byType: {},
        bySeverity: {}
      }
    };
  }

  /**
   * 记录系统指标
   */
  private recordSystemMetrics(metrics: SystemMetrics, timestamp: number): void {
    this.recordMetric('system.cpu.usage', metrics.cpu.usage, timestamp);
    this.recordMetric('system.memory.used', metrics.memory.used, timestamp);
    this.recordMetric('system.memory.heap_used', metrics.memory.heapUsed, timestamp);

    // 更新Prometheus指标
    if (this.prometheus) {
      const cpuGauge = this.prometheus.getMetric('process_cpu_usage');
      if (cpuGauge) {
        (cpuGauge as any).set(metrics.cpu.usage);
      }

      const memGauge = this.prometheus.getMetric('process_memory_usage_bytes');
      if (memGauge) {
        (memGauge as any).set(metrics.memory.used);
      }

      const heapGauge = this.prometheus.getMetric('process_heap_usage_bytes');
      if (heapGauge) {
        (heapGauge as any).set(metrics.memory.heapUsed);
      }
    }
  }

  /**
   * 记录应用指标
   */
  private recordApplicationMetrics(metrics: ApplicationMetrics, timestamp: number): void {
    this.recordMetric('http.requests_per_second', metrics.http.requestsPerSecond, timestamp);
    this.recordMetric('http.avg_response_time', metrics.http.avgResponseTime, timestamp);
    this.recordMetric('database.queries_per_second', metrics.database.queriesPerSecond, timestamp);
    this.recordMetric('database.avg_query_time', metrics.database.avgQueryTime, timestamp);
    this.recordMetric('cache.hit_rate', metrics.cache.hitRate, timestamp);
  }

  /**
   * 记录指标数据点
   */
  private recordMetric(name: string, value: number, timestamp: number): void {
    let series = this.timeSeries.get(name);
    
    if (!series) {
      series = { metric: name, dataPoints: [] };
      this.timeSeries.set(name, series);
    }

    series.dataPoints.push({ timestamp, value });
  }

  /**
   * 记录HTTP请求
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    const timestamp = Date.now();
    
    this.stats.http.requests.push(timestamp);
    this.stats.http.responseTimes.push(duration);
    this.incrementCounter('http.requests');

    if (this.prometheus) {
      const counter = this.prometheus.getMetric('http_requests_total');
      if (counter) {
        (counter as any).inc({ method, route, status_code: statusCode.toString() });
      }

      const histogram = this.prometheus.getMetric('http_request_duration_seconds');
      if (histogram) {
        (histogram as any).observe(duration / 1000); // 转换为秒
      }
    }
  }

  /**
   * 记录数据库查询
   */
  recordDatabaseQuery(operation: string, table: string, duration: number): void {
    const timestamp = Date.now();
    
    this.stats.database.queries.push(timestamp);
    this.stats.database.queryTimes.push(duration);
    this.incrementCounter('database.queries');

    if (this.prometheus) {
      const counter = this.prometheus.getMetric('database_queries_total');
      if (counter) {
        (counter as any).inc({ operation, table });
      }

      const histogram = this.prometheus.getMetric('database_query_duration_seconds');
      if (histogram) {
        (histogram as any).observe(duration / 1000);
      }
    }
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(cacheName: string): void {
    this.incrementCounter('cache.hits');
    this.incrementCounter(`cache.hits.${cacheName}`);

    if (this.prometheus) {
      const counter = this.prometheus.getMetric('cache_hits_total');
      if (counter) {
        (counter as any).inc({ cache_name: cacheName });
      }
    }
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(cacheName: string): void {
    this.incrementCounter('cache.misses');
    this.incrementCounter(`cache.misses.${cacheName}`);

    if (this.prometheus) {
      const counter = this.prometheus.getMetric('cache_misses_total');
      if (counter) {
        (counter as any).inc({ cache_name: cacheName });
      }
    }
  }

  /**
   * 记录错误
   */
  recordError(type: string, severity: string): void {
    this.incrementCounter('errors.total');
    this.incrementCounter(`errors.type.${type}`);
    this.incrementCounter(`errors.severity.${severity}`);

    if (this.prometheus) {
      const counter = this.prometheus.getMetric('errors_total');
      if (counter) {
        (counter as any).inc({ type, severity });
      }
    }
  }

  /**
   * 增加计数器
   */
  private incrementCounter(name: string, amount: number = 1): void {
    this.counters.set(name, (this.counters.get(name) || 0) + amount);
  }

  /**
   * 获取计数器值
   */
  private getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * 计算缓存命中率
   */
  private calculateCacheHitRate(): number {
    const hits = this.getCounter('cache.hits');
    const misses = this.getCounter('cache.misses');
    const total = hits + misses;
    
    return total > 0 ? (hits / total) * 100 : 0;
  }

  /**
   * 计算缓存未命中率
   */
  private calculateCacheMissRate(): number {
    return 100 - this.calculateCacheHitRate();
  }

  /**
   * 获取时间序列数据
   */
  getTimeSeries(metricName: string, startTime?: number, endTime?: number): TimeSeries | null {
    const series = this.timeSeries.get(metricName);
    
    if (!series) {
      return null;
    }

    if (!startTime && !endTime) {
      return series;
    }

    const filtered = {
      metric: series.metric,
      dataPoints: series.dataPoints.filter(point => {
        if (startTime && point.timestamp < startTime) return false;
        if (endTime && point.timestamp > endTime) return false;
        return true;
      })
    };

    return filtered;
  }

  /**
   * 获取所有指标名称
   */
  getMetricNames(): string[] {
    return Array.from(this.timeSeries.keys());
  }

  /**
   * 获取当前系统指标
   */
  getCurrentSystemMetrics(): SystemMetrics {
    return this.collectSystemMetrics();
  }

  /**
   * 获取当前应用指标
   */
  getCurrentApplicationMetrics(): ApplicationMetrics {
    return this.collectApplicationMetrics();
  }

  /**
   * 导出Prometheus指标
   */
  exportPrometheusMetrics(): string {
    if (!this.prometheus) {
      throw new Error('Prometheus integration is not enabled');
    }
    return this.prometheus.exportMetrics();
  }

  /**
   * 清理过期数据
   */
  private cleanupOldData(currentTime: number): void {
    const cutoffTime = currentTime - this.config.retentionPeriod;

    // 清理时间序列数据
    for (const [name, series] of this.timeSeries) {
      series.dataPoints = series.dataPoints.filter(
        point => point.timestamp >= cutoffTime
      );

      if (series.dataPoints.length === 0) {
        this.timeSeries.delete(name);
      }
    }

    // 清理统计数据
    this.stats.http.requests = this.stats.http.requests.filter(t => t >= cutoffTime);
    this.stats.http.responseTimes = this.stats.http.responseTimes.filter((_, i) =>
      this.stats.http.requests[i] >= cutoffTime
    );

    this.stats.database.queries = this.stats.database.queries.filter(t => t >= cutoffTime);
    this.stats.database.queryTimes = this.stats.database.queryTimes.filter((_, i) =>
      this.stats.database.queries[i] >= cutoffTime
    );
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.timeSeries.clear();
    this.counters.clear();
    this.stats.http.requests = [];
    this.stats.http.responseTimes = [];
    this.stats.database.queries = [];
    this.stats.database.queryTimes = [];
  }

  /**
   * 获取配置
   */
  getConfig(): Required<CollectorConfig> {
    return { ...this.config };
  }
}

/**
 * 创建指标收集器
 */
export function createMetricsCollector(config?: CollectorConfig): MetricsCollector {
  return new MetricsCollector(config);
}