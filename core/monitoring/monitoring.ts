import { EventEmitter } from 'events';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import {
  MonitoringSystem,
  MonitoringConfig,
  MonitoringStatus,
  Metric,
  MetricsQuery,
  MonitoringModule,
  HealthStatus,
  MetricType,
  Logger
} from './types';

export class MonitoringSystemImpl extends EventEmitter implements MonitoringSystem {
  private config: MonitoringConfig | null = null;
  private isRunning: boolean = false;
  private startedAt: Date | null = null;
  private metricsCollected: number = 0;
  private alertsTriggered: number = 0;
  private collectionInterval: NodeJS.Timeout | null = null;
  private metricsHistory: Metric[] = [];
  private logger: Logger;
  private dataDirectory: string;

  constructor(logger: Logger, dataDirectory: string = './data/monitoring') {
    super();
    this.logger = logger;
    this.dataDirectory = dataDirectory;
    this.ensureDataDirectory();
  }

  async startMonitoring(config: MonitoringConfig): Promise<void> {
    this.logger.info('启动监控系统', { config });

    if (this.isRunning) {
      this.logger.warn('监控系统已经在运行中');
      return;
    }

    this.config = config;
    this.isRunning = true;
    this.startedAt = new Date();
    this.metricsCollected = 0;
    this.alertsTriggered = 0;

    this.collectionInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        this.logger.error('采集指标失败', error as Error);
      }
    }, config.collectionInterval);

    this.emit('monitoring:started', { startedAt: this.startedAt });
    this.logger.info('监控系统已启动');
  }

  async stopMonitoring(): Promise<void> {
    this.logger.info('停止监控系统');

    if (!this.isRunning) {
      this.logger.warn('监控系统未在运行');
      return;
    }

    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }

    this.isRunning = false;
    this.emit('monitoring:stopped', { stoppedAt: new Date() });
    this.logger.info('监控系统已停止');
  }

  async getMonitoringStatus(): Promise<MonitoringStatus> {
    const healthStatus = await this.calculateHealthStatus();

    return {
      isRunning: this.isRunning,
      startedAt: this.startedAt || undefined,
      metricsCollected: this.metricsCollected,
      alertsTriggered: this.alertsTriggered,
      healthStatus
    };
  }

  async getRealTimeMetrics(): Promise<Metric[]> {
    if (!this.isRunning) {
      throw new Error('监控系统未在运行');
    }

    return this.collectSystemMetrics();
  }

  async getHistoricalMetrics(query: MetricsQuery): Promise<Metric[]> {
    this.logger.info('获取历史指标', { query });

    let metrics = [...this.metricsHistory];

    if (query.name) {
      metrics = metrics.filter(m => m.name === query.name);
    }

    if (query.labelFilters) {
      for (const filter of query.labelFilters) {
        metrics = metrics.filter(m => {
          const labelValue = m.labels[filter.name];
          return this.matchLabel(labelValue, filter.operator, filter.value);
        });
      }
    }

    metrics = metrics.filter(m => m.timestamp >= query.startTime && m.timestamp <= query.endTime);

    if (query.aggregation) {
      metrics = this.aggregateMetrics(metrics, query.aggregation, query.interval);
    }

    return metrics;
  }

  private async collectMetrics(): Promise<void> {
    if (!this.config) {
      return;
    }

    const metrics: Metric[] = [];

    if (this.config.enabledModules.includes(MonitoringModule.SYSTEM_METRICS)) {
      const systemMetrics = await this.collectSystemMetrics();
      metrics.push(...systemMetrics);
    }

    if (this.config.enabledModules.includes(MonitoringModule.APPLICATION_METRICS)) {
      const appMetrics = await this.collectApplicationMetrics();
      metrics.push(...appMetrics);
    }

    this.metricsHistory.push(...metrics);
    this.metricsCollected += metrics.length;

    this.cleanupOldMetrics();

    this.emit('metrics:collected', { metrics, timestamp: new Date() });
  }

  private async collectSystemMetrics(): Promise<Metric[]> {
    const metrics: Metric[] = [];
    const timestamp = new Date();

    const cpus = os.cpus();
    const cpuUsage = await this.getCpuUsage();
    metrics.push({
      name: 'cpu.usage.percent',
      type: MetricType.GAUGE,
      value: cpuUsage,
      unit: 'percent',
      labels: {
        host: os.hostname()
      },
      timestamp
    });

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    metrics.push({
      name: 'memory.usage.percent',
      type: MetricType.GAUGE,
      value: memoryUsage,
      unit: 'percent',
      labels: {
        host: os.hostname()
      },
      timestamp
    });

    metrics.push({
      name: 'memory.total.bytes',
      type: MetricType.GAUGE,
      value: totalMem,
      unit: 'bytes',
      labels: {
        host: os.hostname()
      },
      timestamp
    });

    metrics.push({
      name: 'memory.free.bytes',
      type: MetricType.GAUGE,
      value: freeMem,
      unit: 'bytes',
      labels: {
        host: os.hostname()
      },
      timestamp
    });

    const loadAvg = os.loadavg();
    metrics.push({
      name: 'system.load.1m',
      type: MetricType.GAUGE,
      value: loadAvg[0],
      unit: '',
      labels: {
        host: os.hostname()
      },
      timestamp
    });

    metrics.push({
      name: 'system.load.5m',
      type: MetricType.GAUGE,
      value: loadAvg[1],
      unit: '',
      labels: {
        host: os.hostname()
      },
      timestamp
    });

    metrics.push({
      name: 'system.load.15m',
      type: MetricType.GAUGE,
      value: loadAvg[2],
      unit: '',
      labels: {
        host: os.hostname()
      },
      timestamp
    });

    return metrics;
  }

  private async collectApplicationMetrics(): Promise<Metric[]> {
    const metrics: Metric[] = [];
    const timestamp = new Date();

    const memoryUsage = process.memoryUsage();
    metrics.push({
      name: 'process.memory.rss.bytes',
      type: MetricType.GAUGE,
      value: memoryUsage.rss,
      unit: 'bytes',
      labels: {
        pid: process.pid.toString()
      },
      timestamp
    });

    metrics.push({
      name: 'process.memory.heap.total.bytes',
      type: MetricType.GAUGE,
      value: memoryUsage.heapTotal,
      unit: 'bytes',
      labels: {
        pid: process.pid.toString()
      },
      timestamp
    });

    metrics.push({
      name: 'process.memory.heap.used.bytes',
      type: MetricType.GAUGE,
      value: memoryUsage.heapUsed,
      unit: 'bytes',
      labels: {
        pid: process.pid.toString()
      },
      timestamp
    });

    metrics.push({
      name: 'process.memory.external.bytes',
      type: MetricType.GAUGE,
      value: memoryUsage.external,
      unit: 'bytes',
      labels: {
        pid: process.pid.toString()
      },
      timestamp
    });

    const cpuUsage = process.cpuUsage();
    metrics.push({
      name: 'process.cpu.user.microseconds',
      type: MetricType.COUNTER,
      value: cpuUsage.user,
      unit: 'microseconds',
      labels: {
        pid: process.pid.toString()
      },
      timestamp
    });

    metrics.push({
      name: 'process.cpu.system.microseconds',
      type: MetricType.COUNTER,
      value: cpuUsage.system,
      unit: 'microseconds',
      labels: {
        pid: process.pid.toString()
      },
      timestamp
    });

    metrics.push({
      name: 'process.uptime.seconds',
      type: MetricType.GAUGE,
      value: process.uptime(),
      unit: 'seconds',
      labels: {
        pid: process.pid.toString()
      },
      timestamp
    });

    return metrics;
  }

  private async getCpuUsage(): Promise<number> {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle / total);

    return usage;
  }

  private cleanupOldMetrics(): void {
    if (!this.config) {
      return;
    }

    const retentionTime = this.config.retentionDays * 24 * 60 * 60 * 1000;
    const cutoffTime = new Date(Date.now() - retentionTime);

    this.metricsHistory = this.metricsHistory.filter(m => m.timestamp >= cutoffTime);
  }

  private async calculateHealthStatus(): Promise<HealthStatus> {
    const metrics = await this.getRealTimeMetrics();

    const cpuUsage = metrics.find(m => m.name === 'cpu.usage.percent');
    const memoryUsage = metrics.find(m => m.name === 'memory.usage.percent');

    if (!cpuUsage || !memoryUsage) {
      return HealthStatus.UNKNOWN;
    }

    if (cpuUsage.value > 90 || memoryUsage.value > 90) {
      return HealthStatus.CRITICAL;
    }

    if (cpuUsage.value > 80 || memoryUsage.value > 80) {
      return HealthStatus.WARNING;
    }

    return HealthStatus.HEALTHY;
  }

  private matchLabel(labelValue: string | undefined, operator: string, value: string): boolean {
    if (labelValue === undefined) {
      return false;
    }

    switch (operator) {
      case '=':
        return labelValue === value;
      case '!=':
        return labelValue !== value;
      case '=~':
        return new RegExp(value).test(labelValue);
      case '!~':
        return !new RegExp(value).test(labelValue);
      default:
        return false;
    }
  }

  private aggregateMetrics(metrics: Metric[], aggregation: string, interval?: number): Metric[] {
    if (metrics.length === 0) {
      return [];
    }

    const aggregated: Metric[] = [];
    const groups = new Map<string, Metric[]>();

    metrics.forEach(metric => {
      const key = metric.name;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(metric);
    });

    groups.forEach((groupMetrics, name) => {
      const values = groupMetrics.map(m => m.value);
      let aggregatedValue: number;

      switch (aggregation) {
        case 'avg':
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        default:
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
      }

      aggregated.push({
        name,
        type: groupMetrics[0].type,
        value: aggregatedValue,
        unit: groupMetrics[0].unit,
        labels: groupMetrics[0].labels,
        timestamp: new Date()
      });
    });

    return aggregated;
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDirectory)) {
      fs.mkdirSync(this.dataDirectory, { recursive: true });
    }
  }
}