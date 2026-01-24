import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../../utils/logger';
import {
  AnalysisSystem,
  Metric,
  MetricsQuery,
  AnalysisResult,
  Anomaly,
  Trend,
  CorrelationResult,
  RootCauseResult,
  Alert,
  MetricType,
  AnomalyDetectionMethod,
  TrendDirection
} from './types';

export class AnalysisSystemImpl extends EventEmitter implements AnalysisSystem {
  private logger: Logger;
  private dataDirectory: string;
  private metricsCache: Map<string, Metric[]> = new Map();
  private cacheSize: number = 10000;
  private anomalyThreshold: number = 3;
  private correlationThreshold: number = 0.7;

  constructor(logger: Logger, dataDirectory: string = './data/monitoring') {
    super();
    this.logger = logger;
    this.dataDirectory = dataDirectory;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.ensureDataDirectory();
      await this.loadMetricsCache();
      this.logger.info('分析系统初始化完成', { 
        cacheSize: this.metricsCache.size 
      });
    } catch (error) {
      this.logger.error('分析系统初始化失败', error as Error);
      throw error;
    }
  }

  private async ensureDataDirectory(): Promise<void> {
    const dirs = [
      this.dataDirectory,
      path.join(this.dataDirectory, 'analysis'),
      path.join(this.dataDirectory, 'metrics')
    ];
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  private async loadMetricsCache(): Promise<void> {
    try {
      const metricsDir = path.join(this.dataDirectory, 'metrics');
      const files = await fs.readdir(metricsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(metricsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const metrics = JSON.parse(content) as Metric[];
          const metricName = path.basename(file, '.json');
          this.metricsCache.set(metricName, metrics);
        }
      }
      
      this.logger.info('加载指标缓存', { count: this.metricsCache.size });
    } catch (error) {
      this.logger.warn('加载指标缓存失败', error as Error);
    }
  }

  async analyzeMetrics(query: MetricsQuery): Promise<AnalysisResult> {
    this.logger.info('分析指标', { query });
    
    const metrics = await this.getMetrics(query);
    
    if (metrics.length === 0) {
      throw new Error('没有找到指标数据');
    }

    const values = metrics.map(m => m.value);
    
    const result: AnalysisResult = {
      metricName: query.metricName,
      startTime: query.startTime || metrics[0].timestamp,
      endTime: query.endTime || metrics[metrics.length - 1].timestamp,
      count: metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: this.calculateMean(values),
      median: this.calculateMedian(values),
      stdDev: this.calculateStdDev(values),
      p50: this.calculatePercentile(values, 50),
      p95: this.calculatePercentile(values, 95),
      p99: this.calculatePercentile(values, 99),
      trend: this.detectTrend(values),
      anomalies: await this.detectAnomalies(query),
      correlations: []
    };
    
    this.emit('analysis:completed', result);
    this.logger.info('指标分析完成', { metricName: query.metricName });
    
    return result;
  }

  async detectAnomalies(query: MetricsQuery): Promise<Anomaly[]> {
    this.logger.info('检测异常', { query });
    
    const metrics = await this.getMetrics(query);
    
    if (metrics.length < 10) {
      return [];
    }

    const values = metrics.map(m => m.value);
    const mean = this.calculateMean(values);
    const stdDev = this.calculateStdDev(values);
    
    const anomalies: Anomaly[] = [];
    
    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      const zScore = Math.abs((metric.value - mean) / stdDev);
      
      if (zScore > this.anomalyThreshold) {
        const anomaly: Anomaly = {
          id: `anomaly-${Date.now()}-${i}`,
          metricName: metric.name,
          timestamp: metric.timestamp,
          value: metric.value,
          expectedValue: mean,
          deviation: metric.value - mean,
          zScore: zScore,
          severity: this.calculateAnomalySeverity(zScore),
          method: AnomalyDetectionMethod.STATISTICAL,
          confidence: Math.min(zScore / this.anomalyThreshold, 1),
          labels: metric.labels
        };
        
        anomalies.push(anomaly);
      }
    }
    
    this.emit('anomalies:detected', anomalies);
    this.logger.info('异常检测完成', { count: anomalies.length });
    
    return anomalies;
  }

  async analyzeTrends(query: MetricsQuery): Promise<Trend[]> {
    this.logger.info('分析趋势', { query });
    
    const metrics = await this.getMetrics(query);
    
    if (metrics.length < 2) {
      return [];
    }

    const trends: Trend[] = [];
    
    const values = metrics.map(m => m.value);
    const direction = this.detectTrendDirection(values);
    const slope = this.calculateSlope(values);
    const rSquared = this.calculateRSquared(values);
    
    const trend: Trend = {
      id: `trend-${Date.now()}`,
      metricName: query.metricName,
      startTime: query.startTime || metrics[0].timestamp,
      endTime: query.endTime || metrics[metrics.length - 1].timestamp,
      direction: direction,
      slope: slope,
      rSquared: rSquared,
      confidence: rSquared,
      changePercent: ((values[values.length - 1] - values[0]) / values[0]) * 100,
      forecast: this.forecastTrend(values, 5)
    };
    
    trends.push(trend);
    
    this.emit('trends:analyzed', trends);
    this.logger.info('趋势分析完成', { count: trends.length });
    
    return trends;
  }

  async correlateMetrics(metrics: string[]): Promise<CorrelationResult[]> {
    this.logger.info('关联分析', { metrics });
    
    if (metrics.length < 2) {
      return [];
    }

    const results: CorrelationResult[] = [];
    
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        
        const data1 = this.metricsCache.get(metric1) || [];
        const data2 = this.metricsCache.get(metric2) || [];
        
        if (data1.length === 0 || data2.length === 0) {
          continue;
        }

        const correlation = this.calculateCorrelation(
          data1.map(m => m.value),
          data2.map(m => m.value)
        );
        
        if (Math.abs(correlation) >= this.correlationThreshold) {
          const result: CorrelationResult = {
            id: `correlation-${Date.now()}-${i}-${j}`,
            metric1: metric1,
            metric2: metric2,
            correlation: correlation,
            strength: this.calculateCorrelationStrength(correlation),
            direction: correlation > 0 ? 'positive' : 'negative',
            significance: this.calculateSignificance(correlation, Math.min(data1.length, data2.length))
          };
          
          results.push(result);
        }
      }
    }
    
    results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    
    this.emit('correlations:analyzed', results);
    this.logger.info('关联分析完成', { count: results.length });
    
    return results;
  }

  async analyzeRootCause(alert: Alert): Promise<RootCauseResult> {
    this.logger.info('根因分析', { alertId: alert.id });
    
    const startTime = new Date(alert.timestamp.getTime() - 30 * 60 * 1000);
    const endTime = new Date(alert.timestamp.getTime() + 30 * 60 * 1000);
    
    const query: MetricsQuery = {
      metricName: alert.metricName,
      startTime: startTime,
      endTime: endTime
    };
    
    const metrics = await this.getMetrics(query);
    const anomalies = await this.detectAnomalies(query);
    const trends = await this.analyzeTrends(query);
    
    const relatedMetrics = Array.from(this.metricsCache.keys()).slice(0, 5);
    const correlations = await this.correlateMetrics([alert.metricName, ...relatedMetrics]);
    
    const result: RootCauseResult = {
      alertId: alert.id,
      metricName: alert.metricName,
      timestamp: alert.timestamp,
      rootCause: this.identifyRootCause(alert, anomalies, trends, correlations),
      confidence: this.calculateRootCauseConfidence(anomalies, trends, correlations),
      relatedAnomalies: anomalies,
      relatedTrends: trends,
      relatedCorrelations: correlations,
      recommendations: this.generateRecommendations(alert, anomalies, trends, correlations)
    };
    
    this.emit('rootcause:analyzed', result);
    this.logger.info('根因分析完成', { alertId: alert.id, rootCause: result.rootCause });
    
    return result;
  }

  private async getMetrics(query: MetricsQuery): Promise<Metric[]> {
    const cached = this.metricsCache.get(query.metricName);
    
    if (!cached) {
      return [];
    }

    let filtered = cached;
    
    if (query.startTime) {
      filtered = filtered.filter(m => m.timestamp >= query.startTime!);
    }
    
    if (query.endTime) {
      filtered = filtered.filter(m => m.timestamp <= query.endTime!);
    }
    
    if (query.labels) {
      filtered = filtered.filter(m => {
        for (const [key, value] of Object.entries(query.labels!)) {
          if (m.labels?.[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return filtered;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculateStdDev(values: number[]): number {
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(this.calculateMean(squaredDiffs));
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  private detectTrend(values: number[]): string {
    const direction = this.detectTrendDirection(values);
    const slope = this.calculateSlope(values);
    
    if (direction === TrendDirection.UP) {
      return `上升趋势 (斜率: ${slope.toFixed(4)})`;
    } else if (direction === TrendDirection.DOWN) {
      return `下降趋势 (斜率: ${slope.toFixed(4)})`;
    } else {
      return `平稳趋势 (斜率: ${slope.toFixed(4)})`;
    }
  }

  private detectTrendDirection(values: number[]): TrendDirection {
    const slope = this.calculateSlope(values);
    
    if (slope > 0.01) {
      return TrendDirection.UP;
    } else if (slope < -0.01) {
      return TrendDirection.DOWN;
    } else {
      return TrendDirection.STABLE;
    }
  }

  private calculateSlope(values: number[]): number {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private calculateRSquared(values: number[]): number {
    const slope = this.calculateSlope(values);
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const mean = this.calculateMean(values);
    
    const ssTotal = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    const ssResidual = values.reduce((sum, val, i) => {
      const predicted = slope * x[i];
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    
    return 1 - (ssResidual / ssTotal);
  }

  private calculateCorrelation(values1: number[], values2: number[]): number {
    const n = Math.min(values1.length, values2.length);
    const mean1 = this.calculateMean(values1.slice(0, n));
    const mean2 = this.calculateMean(values2.slice(0, n));
    
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = values1[i] - mean1;
      const diff2 = values2[i] - mean2;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }
    
    return numerator / Math.sqrt(denominator1 * denominator2);
  }

  private calculateCorrelationStrength(correlation: number): string {
    const absCorrelation = Math.abs(correlation);
    
    if (absCorrelation >= 0.9) {
      return '非常强';
    } else if (absCorrelation >= 0.7) {
      return '强';
    } else if (absCorrelation >= 0.5) {
      return '中等';
    } else if (absCorrelation >= 0.3) {
      return '弱';
    } else {
      return '非常弱';
    }
  }

  private calculateSignificance(correlation: number, sampleSize: number): number {
    const t = Math.abs(correlation) * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    return 1 - this.calculateTCDF(t, sampleSize - 2);
  }

  private calculateTCDF(t: number, df: number): number {
    const x = df / (df + t * t);
    return 1 - 0.5 * this.calculateBetaIncomplete(0.5 * df, 0.5, x);
  }

  private calculateBetaIncomplete(a: number, b: number, x: number): number {
    return x;
  }

  private calculateAnomalySeverity(zScore: number): string {
    if (zScore >= 5) {
      return 'critical';
    } else if (zScore >= 4) {
      return 'high';
    } else if (zScore >= 3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private forecastTrend(values: number[], steps: number): number[] {
    const slope = this.calculateSlope(values);
    const lastValue = values[values.length - 1];
    const forecast: number[] = [];
    
    for (let i = 1; i <= steps; i++) {
      forecast.push(lastValue + slope * i);
    }
    
    return forecast;
  }

  private identifyRootCause(
    alert: Alert,
    anomalies: Anomaly[],
    trends: Trend[],
    correlations: CorrelationResult[]
  ): string {
    if (anomalies.length === 0) {
      return '未检测到异常，可能是误报';
    }

    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    if (criticalAnomalies.length > 0) {
      return `检测到 ${criticalAnomalies.length} 个严重异常，可能是系统故障或资源耗尽`;
    }

    const strongCorrelations = correlations.filter(c => Math.abs(c.correlation) > 0.8);
    if (strongCorrelations.length > 0) {
      const relatedMetrics = strongCorrelations.map(c => c.metric2).join(', ');
      return `指标 ${alert.metricName} 与 ${relatedMetrics} 存在强关联，可能是相关系统问题`;
    }

    if (trends.length > 0 && trends[0].direction === TrendDirection.UP) {
      return `指标呈上升趋势，可能是负载增加或性能下降`;
    }

    return `检测到 ${anomalies.length} 个异常，需要进一步调查`;
  }

  private calculateRootCauseConfidence(
    anomalies: Anomaly[],
    trends: Trend[],
    correlations: CorrelationResult[]
  ): number {
    let confidence = 0.5;
    
    if (anomalies.length > 0) {
      const maxConfidence = Math.max(...anomalies.map(a => a.confidence));
      confidence = Math.max(confidence, maxConfidence);
    }
    
    if (trends.length > 0) {
      const maxConfidence = Math.max(...trends.map(t => t.confidence));
      confidence = Math.max(confidence, maxConfidence);
    }
    
    if (correlations.length > 0) {
      const maxSignificance = Math.max(...correlations.map(c => c.significance));
      confidence = Math.max(confidence, maxSignificance);
    }
    
    return Math.min(confidence, 1);
  }

  private generateRecommendations(
    alert: Alert,
    anomalies: Anomaly[],
    trends: Trend[],
    correlations: CorrelationResult[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (anomalies.length > 0) {
      recommendations.push('检查系统日志，查找错误或异常信息');
      recommendations.push('检查系统资源使用情况（CPU、内存、磁盘）');
    }
    
    if (trends.length > 0 && trends[0].direction === TrendDirection.UP) {
      recommendations.push('考虑扩容或优化系统性能');
      recommendations.push('检查是否有异常流量或请求');
    }
    
    if (correlations.length > 0) {
      const relatedMetrics = correlations.map(c => c.metric2).join(', ');
      recommendations.push(`检查相关指标: ${relatedMetrics}`);
    }
    
    if (alert.severity === 'critical') {
      recommendations.push('立即采取行动，优先处理严重告警');
    }
    
    return recommendations;
  }

  async updateMetricsCache(metrics: Metric[]): Promise<void> {
    for (const metric of metrics) {
      if (!this.metricsCache.has(metric.name)) {
        this.metricsCache.set(metric.name, []);
      }
      
      const cached = this.metricsCache.get(metric.name)!;
      cached.push(metric);
      
      if (cached.length > this.cacheSize) {
        cached.shift();
      }
    }
    
    await this.saveMetricsCache();
  }

  private async saveMetricsCache(): Promise<void> {
    try {
      for (const [metricName, metrics] of this.metricsCache.entries()) {
        const filePath = path.join(this.dataDirectory, 'metrics', `${metricName}.json`);
        await fs.writeFile(filePath, JSON.stringify(metrics, null, 2), 'utf-8');
      }
    } catch (error) {
      this.logger.error('保存指标缓存失败', error as Error);
    }
  }

  clearMetricsCache(): void {
    this.metricsCache.clear();
    this.logger.info('清除指标缓存');
  }

  setAnomalyThreshold(threshold: number): void {
    this.anomalyThreshold = threshold;
    this.logger.info('设置异常检测阈值', { threshold });
  }

  setCorrelationThreshold(threshold: number): void {
    this.correlationThreshold = threshold;
    this.logger.info('设置关联分析阈值', { threshold });
  }
}
