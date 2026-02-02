/**
 * @file 性能分析器实现
 * @description 实现性能分析器，用于分析性能测试结果并生成报告
 * @module performance-testing
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-07
 */

import EventEmitter from 'eventemitter3';
import {
  PerformanceTestResult,
  AnalysisReport,
  ComparisonReport,
  BottleneckReport,
  Recommendation,
  Finding,
  Trend,
  Anomaly,
  MetricComparison,
  PerformanceChange,
  RegressionAnalysis,
  PerformanceAnalyzer,
  Logger
} from './types';

export class PerformanceAnalyzerImpl extends EventEmitter implements PerformanceAnalyzer {
  private logger: Logger;

  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  analyzeResults(results: PerformanceTestResult): AnalysisReport {
    this.logger.info(`分析测试结果: ${results.testName}`);

    const overallHealth = this.calculateOverallHealth(results);
    const keyFindings = this.generateKeyFindings(results);
    const trends = this.analyzeTrends(results);
    const anomalies = this.detectAnomalies(results);
    const recommendations = this.generateRecommendations(results);

    const report: AnalysisReport = {
      testId: results.testId,
      testName: results.testName,
      overallHealth,
      keyFindings,
      trends,
      anomalies,
      recommendations
    };

    this.emit('analysisCompleted', report);
    return report;
  }

  compareResults(
    baseline: PerformanceTestResult,
    current: PerformanceTestResult
  ): ComparisonReport {
    this.logger.info(`比较测试结果: ${baseline.testName} vs ${current.testName}`);

    const metricsComparison = this.compareMetrics(baseline, current);
    const performanceChange = this.calculatePerformanceChange(metricsComparison);
    const regressionAnalysis = this.analyzeRegression(metricsComparison);

    const report: ComparisonReport = {
      baselineTestId: baseline.testId,
      currentTestId: current.testId,
      comparisonDate: new Date(),
      metricsComparison,
      performanceChange,
      regressionAnalysis
    };

    this.emit('comparisonCompleted', report);
    return report;
  }

  identifyBottlenecks(results: PerformanceTestResult): BottleneckReport[] {
    this.logger.info(`识别性能瓶颈: ${results.testName}`);

    const bottlenecks: BottleneckReport[] = [];

    const cpuBottleneck = this.identifyCPUBottleneck(results);
    if (cpuBottleneck) {
      bottlenecks.push(cpuBottleneck);
    }

    const memoryBottleneck = this.identifyMemoryBottleneck(results);
    if (memoryBottleneck) {
      bottlenecks.push(memoryBottleneck);
    }

    const networkBottleneck = this.identifyNetworkBottleneck(results);
    if (networkBottleneck) {
      bottlenecks.push(networkBottleneck);
    }

    this.emit('bottlenecksIdentified', bottlenecks);
    return bottlenecks;
  }

  generateRecommendations(results: PerformanceTestResult): Recommendation[] {
    this.logger.info(`生成优化建议: ${results.testName}`);

    const recommendations: Recommendation[] = [];

    const responseTimeRecommendations = this.generateResponseTimeRecommendations(results);
    recommendations.push(...responseTimeRecommendations);

    const throughputRecommendations = this.generateThroughputRecommendations(results);
    recommendations.push(...throughputRecommendations);

    const errorRateRecommendations = this.generateErrorRateRecommendations(results);
    recommendations.push(...errorRateRecommendations);

    const resourceRecommendations = this.generateResourceRecommendations(results);
    recommendations.push(...resourceRecommendations);

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private calculateOverallHealth(results: PerformanceTestResult): 'excellent' | 'good' | 'fair' | 'poor' {
    const { summary, violations } = results;

    let healthScore = 100;

    if (violations.some(v => v.severity === 'critical')) {
      healthScore -= 40;
    } else if (violations.some(v => v.severity === 'warning')) {
      healthScore -= 20;
    }

    if (summary.errorRate > 5) {
      healthScore -= 30;
    } else if (summary.errorRate > 1) {
      healthScore -= 15;
    }

    if (summary.p99ResponseTime > 1000) {
      healthScore -= 20;
    } else if (summary.p99ResponseTime > 500) {
      healthScore -= 10;
    }

    if (summary.resourceUtilization.cpu > 80) {
      healthScore -= 15;
    }

    if (summary.resourceUtilization.memory > 80) {
      healthScore -= 15;
    }

    if (healthScore >= 80) {
      return 'excellent';
    } else if (healthScore >= 60) {
      return 'good';
    } else if (healthScore >= 40) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  private generateKeyFindings(results: PerformanceTestResult): Finding[] {
    const findings: Finding[] = [];
    const { summary, violations } = results;

    if (summary.averageResponseTime < 100) {
      findings.push({
        type: 'positive',
        category: '响应时间',
        description: '平均响应时间表现优秀',
        evidence: results.metrics.filter(m => m.name === 'average_response_time')
      });
    } else if (summary.averageResponseTime > 500) {
      findings.push({
        type: 'negative',
        category: '响应时间',
        description: '平均响应时间需要优化',
        evidence: results.metrics.filter(m => m.name === 'average_response_time')
      });
    }

    if (summary.throughput > 1000) {
      findings.push({
        type: 'positive',
        category: '吞吐量',
        description: '吞吐量表现优秀',
        evidence: results.metrics.filter(m => m.name === 'throughput')
      });
    }

    if (summary.errorRate < 0.1) {
      findings.push({
        type: 'positive',
        category: '错误率',
        description: '错误率非常低，系统稳定性良好',
        evidence: results.metrics.filter(m => m.name === 'error_rate')
      });
    } else if (summary.errorRate > 1) {
      findings.push({
        type: 'negative',
        category: '错误率',
        description: '错误率偏高，需要排查错误原因',
        evidence: results.metrics.filter(m => m.name === 'error_rate')
      });
    }

    if (violations.length > 0) {
      findings.push({
        type: 'negative',
        category: '阈值违规',
        description: `检测到 ${violations.length} 个阈值违规`,
        evidence: []
      });
    }

    return findings;
  }

  private analyzeTrends(results: PerformanceTestResult): Trend[] {
    const trends: Trend[] = [];

    const responseTimeMetrics = results.metrics.filter(m => m.name === 'response_time');
    if (responseTimeMetrics.length > 1) {
      const firstValue = responseTimeMetrics[0].value;
      const lastValue = responseTimeMetrics[responseTimeMetrics.length - 1].value;
      const change = lastValue - firstValue;
      const magnitude = Math.abs(change / firstValue);

      trends.push({
        metricName: 'response_time',
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        magnitude,
        significance: magnitude > 0.2 ? 'significant' : magnitude > 0.1 ? 'moderate' : 'negligible'
      });
    }

    return trends;
  }

  private detectAnomalies(results: PerformanceTestResult): Anomaly[] {
    const anomalies: Anomaly[] = [];

    const responseTimeMetrics = results.metrics.filter(m => m.name === 'response_time');
    if (responseTimeMetrics.length > 10) {
      const values = responseTimeMetrics.map(m => m.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

      responseTimeMetrics.forEach(metric => {
        const deviation = Math.abs(metric.value - mean) / stdDev;
        if (deviation > 3) {
          anomalies.push({
            metricName: metric.name,
            value: metric.value,
            expectedValue: mean,
            deviation,
            timestamp: metric.timestamp,
            severity: deviation > 5 ? 'critical' : deviation > 4 ? 'major' : 'moderate'
          });
        }
      });
    }

    return anomalies;
  }

  private compareMetrics(
    baseline: PerformanceTestResult,
    current: PerformanceTestResult
  ): MetricComparison[] {
    const comparisons: MetricComparison[] = [];

    const baselineMetrics = new Map(baseline.metrics.map(m => [m.name, m]));
    const currentMetrics = new Map(current.metrics.map(m => [m.name, m]));

    for (const [name, baselineMetric] of baselineMetrics) {
      const currentMetric = currentMetrics.get(name);
      if (!currentMetric) {
        continue;
      }

      const change = currentMetric.value - baselineMetric.value;
      const changePercentage = (change / baselineMetric.value) * 100;
      const significance = Math.abs(changePercentage) > 20 ? 'significant' : Math.abs(changePercentage) > 10 ? 'moderate' : 'negligible';

      comparisons.push({
        metricName: name,
        baselineValue: baselineMetric.value,
        currentValue: currentMetric.value,
        change,
        changePercentage,
        significance
      });
    }

    return comparisons;
  }

  private calculatePerformanceChange(comparisons: MetricComparison[]): PerformanceChange {
    const responseTimeComparison = comparisons.find(c => c.metricName === 'average_response_time');
    const throughputComparison = comparisons.find(c => c.metricName === 'throughput');
    const errorRateComparison = comparisons.find(c => c.metricName === 'error_rate');
    const cpuComparison = comparisons.find(c => c.metricName === 'cpu_usage');

    let overall: 'improved' | 'degraded' | 'stable' = 'stable';
    let positiveChanges = 0;
    let negativeChanges = 0;

    if (responseTimeComparison && responseTimeComparison.change < 0) positiveChanges++;
    if (throughputComparison && throughputComparison.change > 0) positiveChanges++;
    if (errorRateComparison && errorRateComparison.change < 0) positiveChanges++;
    if (cpuComparison && cpuComparison.change < 0) positiveChanges++;

    if (responseTimeComparison && responseTimeComparison.change > 0) negativeChanges++;
    if (throughputComparison && throughputComparison.change < 0) negativeChanges++;
    if (errorRateComparison && errorRateComparison.change > 0) negativeChanges++;
    if (cpuComparison && cpuComparison.change > 0) negativeChanges++;

    if (positiveChanges > negativeChanges) {
      overall = 'improved';
    } else if (negativeChanges > positiveChanges) {
      overall = 'degraded';
    }

    return {
      overall,
      responseTime: responseTimeComparison?.changePercentage || 0,
      throughput: throughputComparison?.changePercentage || 0,
      errorRate: errorRateComparison?.changePercentage || 0,
      resourceUtilization: cpuComparison?.changePercentage || 0
    };
  }

  private analyzeRegression(comparisons: MetricComparison[]): RegressionAnalysis {
    const regressedMetrics = comparisons
      .filter(c => c.significance === 'significant')
      .filter(c => {
        if (c.metricName.includes('response_time') || c.metricName.includes('error_rate') || c.metricName.includes('cpu_usage')) {
          return c.change > 0;
        }
        if (c.metricName.includes('throughput')) {
          return c.change < 0;
        }
        return false;
      })
      .map(c => c.metricName);

    const hasRegression = regressedMetrics.length > 0;
    let regressionSeverity: 'minor' | 'moderate' | 'major' | 'critical' = 'minor';

    if (regressedMetrics.length > 3) {
      regressionSeverity = 'critical';
    } else if (regressedMetrics.length > 2) {
      regressionSeverity = 'major';
    } else if (regressedMetrics.length > 1) {
      regressionSeverity = 'moderate';
    }

    const impact = hasRegression
      ? `检测到 ${regressedMetrics.length} 个性能回归指标，需要立即关注`
      : '未检测到性能回归';

    return {
      hasRegression,
      regressedMetrics,
      regressionSeverity,
      impact
    };
  }

  private identifyCPUBottleneck(results: PerformanceTestResult): BottleneckReport | null {
    const cpuMetric = results.metrics.find(m => m.name === 'cpu_usage');
    if (!cpuMetric || cpuMetric.value < 80) {
      return null;
    }

    const severity = cpuMetric.value > 90 ? 'critical' : cpuMetric.value > 85 ? 'major' : 'moderate';

    return {
      type: 'cpu',
      severity,
      description: `CPU使用率过高: ${cpuMetric.value.toFixed(2)}%`,
      metrics: [cpuMetric],
      impact: '高CPU使用率可能导致响应时间增加和系统不稳定',
      suggestions: [
        '优化CPU密集型任务',
        '增加服务器CPU资源',
        '实现任务负载均衡',
        '使用缓存减少计算量'
      ]
    };
  }

  private identifyMemoryBottleneck(results: PerformanceTestResult): BottleneckReport | null {
    const memoryMetric = results.metrics.find(m => m.name === 'memory_usage');
    if (!memoryMetric || memoryMetric.value < 80) {
      return null;
    }

    const severity = memoryMetric.value > 90 ? 'critical' : memoryMetric.value > 85 ? 'major' : 'moderate';

    return {
      type: 'memory',
      severity,
      description: `内存使用率过高: ${memoryMetric.value.toFixed(2)}%`,
      metrics: [memoryMetric],
      impact: '高内存使用率可能导致系统崩溃或性能下降',
      suggestions: [
        '优化内存使用',
        '增加服务器内存',
        '实现内存池和对象复用',
        '清理不必要的缓存'
      ]
    };
  }

  private identifyNetworkBottleneck(results: PerformanceTestResult): BottleneckReport | null {
    const networkMetric = results.metrics.find(m => m.name === 'network_io');
    if (!networkMetric || networkMetric.value < 80) {
      return null;
    }

    const severity = networkMetric.value > 90 ? 'critical' : networkMetric.value > 85 ? 'major' : 'moderate';

    return {
      type: 'network',
      severity,
      description: `网络IO过高: ${networkMetric.value.toFixed(2)} MB/s`,
      metrics: [networkMetric],
      impact: '高网络IO可能导致响应时间增加',
      suggestions: [
        '优化网络请求',
        '启用HTTP/2',
        '压缩响应数据',
        '使用CDN加速'
      ]
    };
  }

  private generateResponseTimeRecommendations(results: PerformanceTestResult): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { summary } = results;

    if (summary.p99ResponseTime > 500) {
      recommendations.push({
        priority: 'high',
        category: '响应时间',
        description: '优化P99响应时间，当前值超过500ms',
        expectedImpact: '显著改善用户体验',
        effort: 'medium',
        metrics: ['p99_response_time']
      });
    }

    if (summary.p95ResponseTime > 300) {
      recommendations.push({
        priority: 'medium',
        category: '响应时间',
        description: '优化P95响应时间，当前值超过300ms',
        expectedImpact: '改善大多数用户的响应体验',
        effort: 'medium',
        metrics: ['p95_response_time']
      });
    }

    return recommendations;
  }

  private generateThroughputRecommendations(results: PerformanceTestResult): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { summary } = results;

    if (summary.throughput < 100) {
      recommendations.push({
        priority: 'high',
        category: '吞吐量',
        description: '提升系统吞吐量，当前值低于100 req/s',
        expectedImpact: '提高系统处理能力',
        effort: 'high',
        metrics: ['throughput']
      });
    }

    return recommendations;
  }

  private generateErrorRateRecommendations(results: PerformanceTestResult): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { summary } = results;

    if (summary.errorRate > 1) {
      recommendations.push({
        priority: 'high',
        category: '错误率',
        description: '降低系统错误率，当前值超过1%',
        expectedImpact: '提高系统稳定性和用户满意度',
        effort: 'high',
        metrics: ['error_rate']
      });
    }

    return recommendations;
  }

  private generateResourceRecommendations(results: PerformanceTestResult): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { summary } = results;

    if (summary.resourceUtilization.cpu > 80) {
      recommendations.push({
        priority: 'medium',
        category: '资源利用',
        description: '优化CPU使用率，当前值超过80%',
        expectedImpact: '提高系统稳定性和性能',
        effort: 'medium',
        metrics: ['cpu_usage']
      });
    }

    if (summary.resourceUtilization.memory > 80) {
      recommendations.push({
        priority: 'medium',
        category: '资源利用',
        description: '优化内存使用率，当前值超过80%',
        expectedImpact: '提高系统稳定性和性能',
        effort: 'medium',
        metrics: ['memory_usage']
      });
    }

    return recommendations;
  }
}
