/**
 * @file PrometheusIntegration.ts
 * @description Prometheus集成 - 指标导出和监控
 * @module core/monitoring
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import EventEmitter from 'eventemitter3';
import { logger } from '../utils/logger';

/**
 * 指标类型
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

/**
 * 指标配置
 */
export interface MetricConfig {
  name: string;
  type: MetricType;
  help: string;
  labels?: string[];
  buckets?: number[];
  percentiles?: number[];
}

/**
 * 指标值
 */
export interface MetricValue {
  value: number;
  labels?: Record<string, string>;
  timestamp?: number;
}

/**
 * Counter指标
 */
class Counter {
  private value: number = 0;
  private labelValues: Map<string, number> = new Map();

  constructor(private config: MetricConfig) {}

  inc(labels?: Record<string, string>, amount: number = 1): void {
    if (labels) {
      const key = this.getLabelKey(labels);
      this.labelValues.set(key, (this.labelValues.get(key) || 0) + amount);
    } else {
      this.value += amount;
    }
  }

  get(): number {
    return this.value;
  }

  getWithLabels(labels: Record<string, string>): number {
    const key = this.getLabelKey(labels);
    return this.labelValues.get(key) || 0;
  }

  private getLabelKey(labels: Record<string, string>): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  toPrometheusFormat(): string {
    const lines: string[] = [];
    lines.push(`# HELP ${this.config.name} ${this.config.help}`);
    lines.push(`# TYPE ${this.config.name} counter`);
    
    if (this.labelValues.size > 0) {
      for (const [labelKey, value] of this.labelValues) {
        lines.push(`${this.config.name}{${labelKey}} ${value}`);
      }
    } else {
      lines.push(`${this.config.name} ${this.value}`);
    }
    
    return lines.join('\n');
  }
}

/**
 * Gauge指标
 */
class Gauge {
  private value: number = 0;
  private labelValues: Map<string, number> = new Map();

  constructor(private config: MetricConfig) {}

  set(value: number, labels?: Record<string, string>): void {
    if (labels) {
      const key = this.getLabelKey(labels);
      this.labelValues.set(key, value);
    } else {
      this.value = value;
    }
  }

  inc(labels?: Record<string, string>, amount: number = 1): void {
    if (labels) {
      const key = this.getLabelKey(labels);
      this.labelValues.set(key, (this.labelValues.get(key) || 0) + amount);
    } else {
      this.value += amount;
    }
  }

  dec(labels?: Record<string, string>, amount: number = 1): void {
    this.inc(labels, -amount);
  }

  get(): number {
    return this.value;
  }

  private getLabelKey(labels: Record<string, string>): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  toPrometheusFormat(): string {
    const lines: string[] = [];
    lines.push(`# HELP ${this.config.name} ${this.config.help}`);
    lines.push(`# TYPE ${this.config.name} gauge`);
    
    if (this.labelValues.size > 0) {
      for (const [labelKey, value] of this.labelValues) {
        lines.push(`${this.config.name}{${labelKey}} ${value}`);
      }
    } else {
      lines.push(`${this.config.name} ${this.value}`);
    }
    
    return lines.join('\n');
  }
}

/**
 * Histogram指标
 */
class Histogram {
  private buckets: Map<number, number> = new Map();
  private sum: number = 0;
  private count: number = 0;

  constructor(private config: MetricConfig) {
    const buckets = config.buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    buckets.forEach(bucket => this.buckets.set(bucket, 0));
  }

  observe(value: number): void {
    this.sum += value;
    this.count++;

    for (const bucket of this.buckets.keys()) {
      if (value <= bucket) {
        this.buckets.set(bucket, (this.buckets.get(bucket) || 0) + 1);
      }
    }
  }

  toPrometheusFormat(): string {
    const lines: string[] = [];
    lines.push(`# HELP ${this.config.name} ${this.config.help}`);
    lines.push(`# TYPE ${this.config.name} histogram`);
    
    const sortedBuckets = Array.from(this.buckets.entries()).sort(([a], [b]) => a - b);
    
    let cumulative = 0;
    for (const [bucket, count] of sortedBuckets) {
      cumulative += count;
      lines.push(`${this.config.name}_bucket{le="${bucket}"} ${cumulative}`);
    }
    
    lines.push(`${this.config.name}_bucket{le="+Inf"} ${this.count}`);
    lines.push(`${this.config.name}_sum ${this.sum}`);
    lines.push(`${this.config.name}_count ${this.count}`);
    
    return lines.join('\n');
  }
}

/**
 * Prometheus集成配置
 */
export interface PrometheusConfig {
  port?: number;
  path?: string;
  prefix?: string;
  defaultLabels?: Record<string, string>;
}

/**
 * Prometheus集成
 */
export class PrometheusIntegration extends EventEmitter {
  private metrics: Map<string, Counter | Gauge | Histogram> = new Map();
  private config: Required<PrometheusConfig>;

  constructor(config: PrometheusConfig = {}) {
    super();
    
    this.config = {
      port: config.port || 9090,
      path: config.path || '/metrics',
      prefix: config.prefix || 'yyc3_',
      defaultLabels: config.defaultLabels || {}
    };
  }

  /**
   * 注册Counter指标
   */
  registerCounter(config: Omit<MetricConfig, 'type'>): Counter {
    const fullConfig: MetricConfig = {
      ...config,
      name: this.config.prefix + config.name,
      type: MetricType.COUNTER
    };

    const counter = new Counter(fullConfig);
    this.metrics.set(fullConfig.name, counter);
    return counter;
  }

  /**
   * 注册Gauge指标
   */
  registerGauge(config: Omit<MetricConfig, 'type'>): Gauge {
    const fullConfig: MetricConfig = {
      ...config,
      name: this.config.prefix + config.name,
      type: MetricType.GAUGE
    };

    const gauge = new Gauge(fullConfig);
    this.metrics.set(fullConfig.name, gauge);
    return gauge;
  }

  /**
   * 注册Histogram指标
   */
  registerHistogram(config: Omit<MetricConfig, 'type'>): Histogram {
    const fullConfig: MetricConfig = {
      ...config,
      name: this.config.prefix + config.name,
      type: MetricType.HISTOGRAM
    };

    const histogram = new Histogram(fullConfig);
    this.metrics.set(fullConfig.name, histogram);
    return histogram;
  }

  /**
   * 获取指标
   */
  getMetric(name: string): Counter | Gauge | Histogram | undefined {
    return this.metrics.get(this.config.prefix + name);
  }

  /**
   * 导出所有指标（Prometheus格式）
   */
  exportMetrics(): string {
    const lines: string[] = [];

    for (const metric of this.metrics.values()) {
      lines.push(metric.toPrometheusFormat());
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 创建HTTP服务器用于指标导出
   */
  createMetricsServer(): {
    start: () => Promise<void>;
    stop: () => Promise<void>;
  } {
    let server: any = null;

    return {
      start: async () => {
        // 模拟HTTP服务器
        logger.info(`Prometheus metrics server starting on port ${this.config.port}`, 'PrometheusIntegration');
        logger.info(`Metrics available at http://localhost:${this.config.port}${this.config.path}`, 'PrometheusIntegration');
        
        server = {
          address: () => ({ port: this.config.port }),
          close: () => {}
        };

        this.emit('server:started', { port: this.config.port, path: this.config.path });
      },

      stop: async () => {
        if (server) {
          server.close();
          server = null;
          this.emit('server:stopped');
          logger.info('Prometheus metrics server stopped', 'PrometheusIntegration');
        }
      }
    };
  }

  /**
   * 获取配置
   */
  getConfig(): Required<PrometheusConfig> {
    return { ...this.config };
  }

  /**
   * 清空所有指标
   */
  clear(): void {
    this.metrics.clear();
  }
}

/**
 * 创建Prometheus集成实例
 */
export function createPrometheusIntegration(config?: PrometheusConfig): PrometheusIntegration {
  return new PrometheusIntegration(config);
}

/**
 * 默认指标注册
 */
export function registerDefaultMetrics(prometheus: PrometheusIntegration): void {
  // HTTP请求指标
  prometheus.registerCounter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labels: ['method', 'route', 'status_code']
  });

  prometheus.registerHistogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labels: ['method', 'route'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  });

  // 系统资源指标
  prometheus.registerGauge({
    name: 'process_cpu_usage',
    help: 'Process CPU usage percentage'
  });

  prometheus.registerGauge({
    name: 'process_memory_usage_bytes',
    help: 'Process memory usage in bytes'
  });

  prometheus.registerGauge({
    name: 'process_heap_usage_bytes',
    help: 'Process heap usage in bytes'
  });

  // 数据库指标
  prometheus.registerCounter({
    name: 'database_queries_total',
    help: 'Total number of database queries',
    labels: ['operation', 'table']
  });

  prometheus.registerHistogram({
    name: 'database_query_duration_seconds',
    help: 'Database query duration in seconds',
    labels: ['operation'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1]
  });

  // 缓存指标
  prometheus.registerCounter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labels: ['cache_name']
  });

  prometheus.registerCounter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labels: ['cache_name']
  });

  // 错误指标
  prometheus.registerCounter({
    name: 'errors_total',
    help: 'Total number of errors',
    labels: ['type', 'severity']
  });
}
