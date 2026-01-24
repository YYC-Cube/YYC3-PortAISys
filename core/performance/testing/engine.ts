/**
 * @file 性能测试引擎实现
 * @description 实现性能测试引擎，提供完整的性能测试功能
 * @module performance-testing
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-07
 */

import { EventEmitter } from 'events';
import {
  PerformanceTestConfig,
  PerformanceTestResult,
  PerformanceTestEngine,
  TestStatus,
  TestType,
  PerformanceMetric,
  TestSummary,
  Logger,
  PerformanceTestRunner
} from './types';
import { PerformanceMonitorImpl } from './monitor';
import { PerformanceAnalyzerImpl } from './analyzer';

export class PerformanceTestEngineImpl extends EventEmitter implements PerformanceTestEngine {
  private activeTests: Map<string, PerformanceTestRunner> = new Map();
  private monitor: PerformanceMonitorImpl;
  private analyzer: PerformanceAnalyzerImpl;
  private logger: Logger;

  constructor(
    monitor: PerformanceMonitorImpl,
    analyzer: PerformanceAnalyzerImpl,
    logger: Logger
  ) {
    super();
    this.monitor = monitor;
    this.analyzer = analyzer;
    this.logger = logger;
  }

  async runTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    this.logger.info(`开始性能测试: ${config.testName}`, { config });

    const runner = new PerformanceTestRunnerImpl(config, this.monitor, this.logger);
    this.activeTests.set(config.testId, runner);

    try {
      const result = await runner.run();
      this.logger.info(`性能测试完成: ${config.testName}`, { result });
      return result;
    } catch (error) {
      this.logger.error(`性能测试失败: ${config.testName}`, error as Error);
      throw error;
    } finally {
      this.activeTests.delete(config.testId);
    }
  }

  async runBaselineTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    this.logger.info(`开始基准测试: ${config.testName}`);

    const baselineConfig: PerformanceTestConfig = {
      ...config,
      testType: TestType.BASELINE,
      testName: `${config.testName} (Baseline)`,
      concurrency: Math.max(1, Math.floor(config.concurrency / 2)),
      duration: Math.min(config.duration, 60000)
    };

    return this.runTest(baselineConfig);
  }

  async runStressTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    this.logger.info(`开始压力测试: ${config.testName}`);

    const stressConfig: PerformanceTestConfig = {
      ...config,
      testType: TestType.STRESS,
      testName: `${config.testName} (Stress)`,
      concurrency: config.concurrency * 2,
      duration: config.duration
    };

    return this.runTest(stressConfig);
  }

  async runMonitoringTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    this.logger.info(`开始监控测试: ${config.testName}`);

    const monitoringConfig: PerformanceTestConfig = {
      ...config,
      testType: TestType.MONITORING,
      testName: `${config.testName} (Monitoring)`
    };

    return this.runTest(monitoringConfig);
  }

  async runAnalysisTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    this.logger.info(`开始分析测试: ${config.testName}`);

    const analysisConfig: PerformanceTestConfig = {
      ...config,
      testType: TestType.ANALYSIS,
      testName: `${config.testName} (Analysis)`
    };

    const result = await this.runTest(analysisConfig);

    const analysisReport = this.analyzer.analyzeResults(result);
    const bottlenecks = this.analyzer.identifyBottlenecks(result);
    const recommendations = this.analyzer.generateRecommendations(result);

    this.logger.info(`分析报告生成完成`, { analysisReport, bottlenecks, recommendations });

    return {
      ...result,
      metadata: {
        ...result.metadata,
        analysisReport,
        bottlenecks,
        recommendations
      }
    };
  }

  async cancelTest(testId: string): Promise<void> {
    this.logger.info(`取消测试: ${testId}`);

    const runner = this.activeTests.get(testId);
    if (!runner) {
      this.logger.warn(`测试 ${testId} 未找到或已完成`);
      return;
    }

    await runner.cancel();
    this.activeTests.delete(testId);
    this.logger.info(`测试 ${testId} 已取消`);
  }

  async getTestStatus(testId: string): Promise<TestStatus> {
    const runner = this.activeTests.get(testId);
    if (!runner) {
      return TestStatus.PENDING;
    }

    return runner.getStatus();
  }
}

class PerformanceTestRunnerImpl implements PerformanceTestRunner {
  private config: PerformanceTestConfig;
  private monitor: PerformanceMonitorImpl;
  private logger: Logger;
  private status: TestStatus = TestStatus.PENDING;
  private startTime: Date | null = null;
  private endTime: Date | null = null;
  private metrics: PerformanceMetric[] = [];
  private results: any[] = [];
  private isCancelled: boolean = false;

  constructor(
    config: PerformanceTestConfig,
    monitor: PerformanceMonitorImpl,
    logger: Logger
  ) {
    this.config = config;
    this.monitor = monitor;
    this.logger = logger;
  }

  async run(): Promise<PerformanceTestResult> {
    this.status = TestStatus.RUNNING;
    this.startTime = new Date();
    this.isCancelled = false;

    try {
      await this.monitor.startMonitoring(this.config.testId);

      const rampUpTime = this.config.rampUpTime || 0;
      if (rampUpTime > 0) {
        await this.performRampUp(rampUpTime);
      }

      await this.executeTest();

      this.endTime = new Date();
      this.status = TestStatus.COMPLETED;

      const summary = this.calculateSummary();
      const violations = this.checkThresholds();

      const result: PerformanceTestResult = {
        testId: this.config.testId,
        testName: this.config.testName,
        testType: this.config.testType,
        status: this.status,
        startTime: this.startTime,
        endTime: this.endTime,
        duration: this.endTime.getTime() - this.startTime.getTime(),
        metrics: this.metrics,
        thresholds: this.config.thresholds,
        violations,
        summary,
        rawResults: this.results,
        metadata: {
          concurrency: this.config.concurrency,
          rampUpTime: this.config.rampUpTime,
          environment: this.config.environment
        }
      };

      return result;
    } catch (error) {
      this.status = TestStatus.FAILED;
      this.endTime = new Date();
      this.logger.error(`测试执行失败: ${this.config.testName}`, error as Error);
      throw error;
    } finally {
      await this.monitor.stopMonitoring(this.config.testId);
      this.monitor.clearMetricsHistory(this.config.testId);
    }
  }

  async cancel(): Promise<void> {
    this.isCancelled = true;
    this.status = TestStatus.CANCELLED;
    this.endTime = new Date();
    this.logger.info(`测试取消: ${this.config.testName}`);
  }

  getStatus(): TestStatus {
    return this.status;
  }

  private async performRampUp(rampUpTime: number): Promise<void> {
    this.logger.info(`开始预热阶段: ${rampUpTime}ms`);

    const steps = 10;
    const stepDuration = rampUpTime / steps;

    for (let i = 1; i <= steps; i++) {
      if (this.isCancelled) {
        return;
      }

      const currentConcurrency = Math.floor((this.config.concurrency / steps) * i);
      await this.executeRequests(currentConcurrency, stepDuration);

      this.logger.debug(`预热进度: ${i}/${steps}, 并发数: ${currentConcurrency}`);
    }

    this.logger.info(`预热阶段完成`);
  }

  private async executeTest(): Promise<void> {
    this.logger.info(`开始执行测试: 并发数=${this.config.concurrency}, 持续时间=${this.config.duration}ms`);

    const startTime = Date.now();
    const endTime = startTime + this.config.duration;

    while (Date.now() < endTime && !this.isCancelled) {
      await this.executeRequests(this.config.concurrency, 1000);
    }

    this.logger.info(`测试执行完成`);
  }

  private async executeRequests(concurrency: number, duration: number): Promise<void> {
    const promises: Promise<void>[] = [];

    for (let i = 0; i < concurrency; i++) {
      if (this.isCancelled) {
        break;
      }

      promises.push(this.executeSingleRequest());
    }

    await Promise.all(promises);
  }

  private async executeSingleRequest(): Promise<void> {
    const startTime = Date.now();

    try {
      const result = await this.mockRequest();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.results.push({
        success: true,
        responseTime,
        timestamp: new Date(startTime)
      });

      this.metrics.push({
        name: 'response_time',
        type: 'response_time' as any,
        value: responseTime,
        unit: 'ms',
        timestamp: new Date(startTime)
      });
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.results.push({
        success: false,
        responseTime,
        timestamp: new Date(startTime),
        error: (error as Error).message
      });

      this.metrics.push({
        name: 'error',
        type: 'error_rate' as any,
        value: 1,
        unit: 'count',
        timestamp: new Date(startTime)
      });
    }
  }

  private async mockRequest(): Promise<any> {
    const delay = Math.random() * 100 + 50;

    await new Promise(resolve => setTimeout(resolve, delay));

    if (Math.random() < 0.01) {
      throw new Error('模拟请求失败');
    }

    return { success: true };
  }

  private calculateSummary(): TestSummary {
    const totalRequests = this.results.length;
    const successfulRequests = this.results.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;

    const responseTimes = this.results
      .filter(r => r.success)
      .map(r => r.responseTime)
      .sort((a, b) => a - b);

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const minResponseTime = responseTimes.length > 0 ? responseTimes[0] : 0;
    const maxResponseTime = responseTimes.length > 0 ? responseTimes[responseTimes.length - 1] : 0;

    const p50ResponseTime = this.calculatePercentile(responseTimes, 50);
    const p95ResponseTime = this.calculatePercentile(responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(responseTimes, 99);

    const duration = this.endTime && this.startTime
      ? this.endTime.getTime() - this.startTime.getTime()
      : 0;

    const throughput = duration > 0 ? (totalRequests / duration) * 1000 : 0;
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

    const cpuMetrics = this.metrics.filter(m => m.name === 'cpu_usage');
    const memoryMetrics = this.metrics.filter(m => m.name === 'memory_usage');
    const networkMetrics = this.metrics.filter(m => m.name === 'network_io');

    const resourceUtilization = {
      cpu: cpuMetrics.length > 0 ? cpuMetrics[cpuMetrics.length - 1].value : 0,
      memory: memoryMetrics.length > 0 ? memoryMetrics[memoryMetrics.length - 1].value : 0,
      network: networkMetrics.length > 0 ? networkMetrics[networkMetrics.length - 1].value : 0
    };

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      p50ResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      throughput,
      errorRate,
      resourceUtilization
    };
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) {
      return 0;
    }

    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, Math.min(index, values.length - 1))];
  }

  private checkThresholds() {
    const violations = this.monitor.checkThresholds(this.metrics, this.config.thresholds);
    return violations;
  }
}
