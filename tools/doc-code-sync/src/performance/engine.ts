import { EventEmitter } from 'events';
import * as os from 'os';
import * as v8 from 'v8';
import {
  PerformanceTestConfig,
  PerformanceTestResult,
  PerformanceBenchmark,
  StressTestConfig,
  StressTestResult,
  LoadTestConfig,
  LoadTestResult,
  MemoryUsage,
  CpuUsage,
  PerformanceReport,
} from './types';

export class PerformanceTestEngine extends EventEmitter {
  private cpuBaseline: number = 0;
  private memoryBaseline: number = 0;

  constructor() {
    super();
    this.captureBaseline();
  }

  private captureBaseline(): void {
    this.cpuBaseline = process.cpuUsage().user;
    this.memoryBaseline = process.memoryUsage().heapUsed;
  }

  async runBenchmark(
    testFn: () => Promise<void>,
    config: PerformanceTestConfig
  ): Promise<PerformanceTestResult> {
    const durations: number[] = [];
    const memoryUsages: MemoryUsage[] = [];
    const cpuUsages: CpuUsage[] = [];
    let successCount = 0;
    let failureCount = 0;

    this.emit('testStarted', config.testName);

    if (config.warmupIterations) {
      this.emit('warmupStarted', config.warmupIterations);
      for (let i = 0; i < config.warmupIterations; i++) {
        try {
          await testFn();
        } catch (error) {
          console.warn(`Warmup iteration ${i + 1} failed:`, error);
        }
      }
      this.emit('warmupCompleted');
    }

    this.emit('testRunning', config.iterations);

    for (let i = 0; i < config.iterations; i++) {
      const startTime = Date.now();
      const startCpu = process.cpuUsage();
      const startMemory = process.memoryUsage();

      try {
        await Promise.race([
          testFn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Test timeout')), config.timeout || 30000)
          ),
        ]);

        const duration = Date.now() - startTime;
        const endCpu = process.cpuUsage(startCpu);
        const endMemory = process.memoryUsage();

        durations.push(duration);
        memoryUsages.push({
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal,
          rss: endMemory.rss,
          external: endMemory.external,
          arrayBuffers: endMemory.arrayBuffers,
        });
        cpuUsages.push({
          user: endCpu.user,
          system: endCpu.system,
          percent: ((endCpu.user + endCpu.system) / 1000) / duration * 100,
        });

        successCount++;
        this.emit('iterationCompleted', i + 1, config.iterations, duration);
      } catch (error) {
        failureCount++;
        this.emit('iterationFailed', i + 1, config.iterations, error);
      }
    }

    durations.sort((a, b) => a - b);

    const result: PerformanceTestResult = {
      testName: config.testName,
      iterations: config.iterations,
      concurrency: config.concurrency || 1,
      totalDuration: durations.reduce((sum, d) => sum + d, 0),
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      percentile95: durations[Math.floor(durations.length * 0.95)],
      percentile99: durations[Math.floor(durations.length * 0.99)],
      throughput: (successCount / durations.reduce((sum, d) => sum + d, 0)) * 1000,
      successCount,
      failureCount,
      errorRate: failureCount / config.iterations,
      memoryUsage: this.calculateAverageMemory(memoryUsages),
      cpuUsage: this.calculateAverageCpu(cpuUsages),
      timestamp: Date.now(),
    };

    this.emit('testCompleted', result);
    return result;
  }

  async runConcurrentBenchmark(
    testFn: () => Promise<void>,
    config: PerformanceTestConfig
  ): Promise<PerformanceTestResult> {
    const durations: number[] = [];
    const memoryUsages: MemoryUsage[] = [];
    const cpuUsages: CpuUsage[] = [];
    let successCount = 0;
    let failureCount = 0;

    this.emit('testStarted', config.testName);
    this.emit('testRunning', config.iterations);

    const concurrency = config.concurrency || 1;
    const batches = Math.ceil(config.iterations / concurrency);

    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, config.iterations - batch * concurrency);
      const startTime = Date.now();
      const startCpu = process.cpuUsage();
      const startMemory = process.memoryUsage();

      try {
        await Promise.all(
          Array.from({ length: batchSize }, async (_, i) => {
            const index = batch * concurrency + i;
            try {
              await Promise.race([
                testFn(),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Test timeout')), config.timeout || 30000)
                ),
              ]);
              successCount++;
              this.emit('iterationCompleted', index + 1, config.iterations);
            } catch (error) {
              failureCount++;
              this.emit('iterationFailed', index + 1, config.iterations, error);
            }
          })
        );

        const duration = Date.now() - startTime;
        const endCpu = process.cpuUsage(startCpu);
        const endMemory = process.memoryUsage();

        durations.push(duration);
        memoryUsages.push({
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal,
          rss: endMemory.rss,
          external: endMemory.external,
          arrayBuffers: endMemory.arrayBuffers,
        });
        cpuUsages.push({
          user: endCpu.user,
          system: endCpu.system,
          percent: ((endCpu.user + endCpu.system) / 1000) / duration * 100,
        });
      } catch (error) {
        this.emit('batchFailed', batch, error);
      }
    }

    durations.sort((a, b) => a - b);

    const result: PerformanceTestResult = {
      testName: config.testName,
      iterations: config.iterations,
      concurrency,
      totalDuration: durations.reduce((sum, d) => sum + d, 0),
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      percentile95: durations[Math.floor(durations.length * 0.95)],
      percentile99: durations[Math.floor(durations.length * 0.99)],
      throughput: (successCount / durations.reduce((sum, d) => sum + d, 0)) * 1000,
      successCount,
      failureCount,
      errorRate: failureCount / config.iterations,
      memoryUsage: this.calculateAverageMemory(memoryUsages),
      cpuUsage: this.calculateAverageCpu(cpuUsages),
      timestamp: Date.now(),
    };

    this.emit('testCompleted', result);
    return result;
  }

  async runStressTest(
    testFn: () => Promise<void>,
    config: StressTestConfig
  ): Promise<StressTestResult> {
    this.emit('stressTestStarted', config.testName);

    const results: PerformanceTestResult[] = [];
    let breakingPoint: any = null;

    for (let concurrency = config.startConcurrency; 
         concurrency <= config.endConcurrency; 
         concurrency += config.step) {
      
      this.emit('stressTestStep', concurrency);

      const testConfig: PerformanceTestConfig = {
        testName: `${config.testName}-concurrency-${concurrency}`,
        iterations: config.iterationsPerStep,
        concurrency,
        timeout: 30000,
      };

      try {
        const result = await this.runConcurrentBenchmark(testFn, testConfig);
        results.push(result);

        if (result.errorRate > 0.5) {
          breakingPoint = {
            concurrency,
            errorRate: result.errorRate,
            averageDuration: result.averageDuration,
          };
          this.emit('breakingPointReached', breakingPoint);
          break;
        }
      } catch (error) {
        this.emit('stressTestStepFailed', concurrency, error);
        breakingPoint = {
          concurrency,
          errorRate: 1.0,
          averageDuration: -1,
        };
        break;
      }

      if (config.rampUpTime) {
        await new Promise(resolve => setTimeout(resolve, config.rampUpTime));
      }
    }

    const recommendations = this.generateStressTestRecommendations(results, breakingPoint);

    const stressResult: StressTestResult = {
      testName: config.testName,
      results,
      breakingPoint: breakingPoint || {
        concurrency: config.endConcurrency,
        errorRate: 0,
        averageDuration: results[results.length - 1]?.averageDuration || 0,
      },
      recommendations,
    };

    this.emit('stressTestCompleted', stressResult);
    return stressResult;
  }

  async runLoadTest(
    testFn: () => Promise<void>,
    config: LoadTestConfig
  ): Promise<LoadTestResult> {
    this.emit('loadTestStarted', config.testName);

    const latencies: number[] = [];
    const memoryUsages: MemoryUsage[] = [];
    const cpuUsages: CpuUsage[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalRequests = 0;

    const startTime = Date.now();
    const endTime = startTime + config.duration;

    const interval = 1000 / config.targetRPS;

    while (Date.now() < endTime) {
      const requestStartTime = Date.now();
      const startCpu = process.cpuUsage();
      const startMemory = process.memoryUsage();

      try {
        await Promise.race([
          testFn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          ),
        ]);

        const latency = Date.now() - requestStartTime;
        const endCpu = process.cpuUsage(startCpu);
        const endMemory = process.memoryUsage();

        latencies.push(latency);
        memoryUsages.push({
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal,
          rss: endMemory.rss,
          external: endMemory.external,
          arrayBuffers: endMemory.arrayBuffers,
        });
        cpuUsages.push({
          user: endCpu.user,
          system: endCpu.system,
          percent: ((endCpu.user + endCpu.system) / 1000) / latency * 100,
        });

        successfulRequests++;
        totalRequests++;
      } catch (error) {
        failedRequests++;
        totalRequests++;
      }

      const elapsed = Date.now() - requestStartTime;
      const delay = Math.max(0, interval - elapsed);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    latencies.sort((a, b) => a - b);

    const actualDuration = Date.now() - startTime;
    const actualRPS = totalRequests / (actualDuration / 1000);

    const result: LoadTestResult = {
      testName: config.testName,
      duration: actualDuration,
      targetRPS: config.targetRPS,
      actualRPS,
      totalRequests,
      successfulRequests,
      failedRequests,
      errorRate: failedRequests / totalRequests,
      averageLatency: latencies.reduce((sum, l) => sum + l, 0) / latencies.length,
      percentile95: latencies[Math.floor(latencies.length * 0.95)],
      percentile99: latencies[Math.floor(latencies.length * 0.99)],
      minLatency: latencies[0],
      maxLatency: latencies[latencies.length - 1],
      memoryUsage: this.calculateAverageMemory(memoryUsages),
      cpuUsage: this.calculateAverageCpu(cpuUsages),
    };

    this.emit('loadTestCompleted', result);
    return result;
  }

  compareWithBaseline(
    current: PerformanceTestResult,
    baseline: PerformanceTestResult,
    criteria?: PerformanceBenchmark['criteria']
  ): PerformanceBenchmark {
    const durationChange = current.averageDuration - baseline.averageDuration;
    const durationChangePercent = (durationChange / baseline.averageDuration) * 100;
    const throughputChange = current.throughput - baseline.throughput;
    const throughputChangePercent = (throughputChange / baseline.throughput) * 100;
    const memoryChange = current.memoryUsage.heapUsed - baseline.memoryUsage.heapUsed;
    const memoryChangePercent = (memoryChange / baseline.memoryUsage.heapUsed) * 100;

    let passed = true;
    if (criteria?.maxDuration && current.averageDuration > criteria.maxDuration) {
      passed = false;
    }
    if (criteria?.minThroughput && current.throughput < criteria.minThroughput) {
      passed = false;
    }
    if (criteria?.maxMemory && current.memoryUsage.heapUsed > criteria.maxMemory) {
      passed = false;
    }
    if (criteria?.maxErrorRate && current.errorRate > criteria.maxErrorRate) {
      passed = false;
    }

    return {
      testName: current.testName,
      baseline,
      current,
      comparison: {
        durationChange,
        durationChangePercent,
        throughputChange,
        throughputChangePercent,
        memoryChange,
        memoryChangePercent,
      },
      passed,
      criteria: criteria || {},
    };
  }

  generateReport(
    benchmarks: PerformanceBenchmark[],
    stressTests: StressTestResult[],
    loadTests: LoadTestResult[]
  ): PerformanceReport {
    const totalTests = benchmarks.length + stressTests.length + loadTests.length;
    const passedTests = benchmarks.filter(b => b.passed).length;
    const failedTests = totalTests - passedTests;
    const overallScore = (passedTests / totalTests) * 100;

    const recommendations: string[] = [];

    benchmarks.forEach(benchmark => {
      if (!benchmark.passed) {
        recommendations.push(
          `${benchmark.testName} 未通过性能基准测试`
        );
      }
      if (benchmark.comparison.durationChangePercent > 10) {
        recommendations.push(
          `${benchmark.testName} 平均耗时增加 ${benchmark.comparison.durationChangePercent.toFixed(2)}%，需要优化`
        );
      }
      if (benchmark.comparison.memoryChangePercent > 20) {
        recommendations.push(
          `${benchmark.testName} 内存使用增加 ${benchmark.comparison.memoryChangePercent.toFixed(2)}%，需要优化`
        );
      }
    });

    stressTests.forEach(stressTest => {
      if (stressTest.breakingPoint.errorRate > 0.1) {
        recommendations.push(
          `${stressTest.testName} 在并发 ${stressTest.breakingPoint.concurrency} 时错误率过高`
        );
      }
    });

    loadTests.forEach(loadTest => {
      if (loadTest.errorRate > 0.01) {
        recommendations.push(
          `${loadTest.testName} 在负载测试中错误率过高: ${(loadTest.errorRate * 100).toFixed(2)}%`
        );
      }
      if (loadTest.actualRPS < loadTest.targetRPS * 0.9) {
        recommendations.push(
          `${loadTest.testName} 实际RPS (${loadTest.actualRPS.toFixed(2)}) 低于目标RPS (${loadTest.targetRPS})`
        );
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('所有性能测试均通过，系统性能良好');
    }

    return {
      reportId: `report-${Date.now()}`,
      generatedAt: Date.now(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      },
      tests: {
        benchmarks,
        stressTests,
        loadTests,
      },
      summary: {
        totalTests,
        passedTests,
        failedTests,
        overallScore,
        recommendations,
      },
    };
  }

  private calculateAverageMemory(memoryUsages: MemoryUsage[]): MemoryUsage {
    return {
      heapUsed: memoryUsages.reduce((sum, m) => sum + m.heapUsed, 0) / memoryUsages.length,
      heapTotal: memoryUsages.reduce((sum, m) => sum + m.heapTotal, 0) / memoryUsages.length,
      rss: memoryUsages.reduce((sum, m) => sum + m.rss, 0) / memoryUsages.length,
      external: memoryUsages.reduce((sum, m) => sum + m.external, 0) / memoryUsages.length,
      arrayBuffers: memoryUsages.reduce((sum, m) => sum + m.arrayBuffers, 0) / memoryUsages.length,
    };
  }

  private calculateAverageCpu(cpuUsages: CpuUsage[]): CpuUsage {
    return {
      user: cpuUsages.reduce((sum, c) => sum + c.user, 0) / cpuUsages.length,
      system: cpuUsages.reduce((sum, c) => sum + c.system, 0) / cpuUsages.length,
      percent: cpuUsages.reduce((sum, c) => sum + c.percent, 0) / cpuUsages.length,
    };
  }

  private generateStressTestRecommendations(
    results: PerformanceTestResult[],
    breakingPoint: any
  ): string[] {
    const recommendations: string[] = [];

    if (breakingPoint && breakingPoint.errorRate > 0.1) {
      recommendations.push(
        `系统在并发 ${breakingPoint.concurrency} 时开始出现大量错误，建议优化并发处理逻辑`
      );
    }

    const lastResult = results[results.length - 1];
    if (lastResult && lastResult.averageDuration > 1000) {
      recommendations.push(
        '在高并发情况下平均响应时间过长，建议优化性能瓶颈'
      );
    }

    const memoryGrowth = results.length > 1 
      ? results[results.length - 1].memoryUsage.heapUsed - results[0].memoryUsage.heapUsed
      : 0;
    
    if (memoryGrowth > 100 * 1024 * 1024) {
      recommendations.push(
        '内存使用随并发数增长过快，建议检查内存泄漏问题'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('系统在高并发情况下表现良好');
    }

    return recommendations;
  }
}
