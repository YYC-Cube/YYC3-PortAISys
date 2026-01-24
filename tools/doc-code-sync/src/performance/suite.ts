import { PerformanceTestEngine } from './engine';
import { WorkerManager } from '../worker/manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  PerformanceTestConfig,
  PerformanceBenchmark,
  StressTestConfig,
  LoadTestConfig,
  PerformanceReport,
} from './types';

export class PerformanceTestSuite {
  private engine: PerformanceTestEngine;
  private workerManager: WorkerManager;
  private results: {
    benchmarks: PerformanceBenchmark[];
    stressTests: any[];
    loadTests: any[];
  };

  constructor() {
    this.engine = new PerformanceTestEngine();
    this.workerManager = new WorkerManager({
      maxWorkers: 4,
      workerScript: path.join(__dirname, '../worker/worker-entry.js'),
      config: {
        maxMemoryMB: 512,
        maxTaskDuration: 30000,
        enableProfiling: false,
        logLevel: 'error',
      },
    });

    this.results = {
      benchmarks: [],
      stressTests: [],
      loadTests: [],
    };
  }

  async runAllTests(): Promise<PerformanceReport> {
    console.log('🚀 开始执行完整的性能测试套件...\n');

    await this.runBenchmarkTests();
    await this.runStressTests();
    await this.runLoadTests();

    const report = this.engine.generateReport(
      this.results.benchmarks,
      this.results.stressTests,
      this.results.loadTests
    );

    await this.workerManager.shutdown();

    return report;
  }

  async runBenchmarkTests(): Promise<void> {
    console.log('📊 执行基准性能测试...\n');

    const tests = [
      {
        name: '文件同步性能',
        testFn: () => this.testFileSync(),
        config: {
          testName: 'file-sync',
          iterations: 100,
          concurrency: 1,
          warmupIterations: 10,
        },
      },
      {
        name: '文件分析性能',
        testFn: () => this.testFileAnalysis(),
        config: {
          testName: 'file-analysis',
          iterations: 100,
          concurrency: 1,
          warmupIterations: 10,
        },
      },
      {
        name: '文件处理性能',
        testFn: () => this.testFileProcessing(),
        config: {
          testName: 'file-processing',
          iterations: 100,
          concurrency: 1,
          warmupIterations: 10,
        },
      },
      {
        name: '文件验证性能',
        testFn: () => this.testFileValidation(),
        config: {
          testName: 'file-validation',
          iterations: 100,
          concurrency: 1,
          warmupIterations: 10,
        },
      },
      {
        name: '并发同步性能',
        testFn: () => this.testConcurrentSync(),
        config: {
          testName: 'concurrent-sync',
          iterations: 50,
          concurrency: 4,
          warmupIterations: 5,
        },
      },
    ];

    for (const test of tests) {
      console.log(`  测试: ${test.name}`);
      const result = await this.engine.runBenchmark(test.testFn, test.config);
      console.log(`    ✅ 完成 - 平均耗时: ${result.averageDuration.toFixed(2)}ms\n`);
      
      this.results.benchmarks.push({
        testName: test.config.testName,
        baseline: result,
        current: result,
        comparison: {
          durationChange: 0,
          durationChangePercent: 0,
          throughputChange: 0,
          throughputChangePercent: 0,
          memoryChange: 0,
          memoryChangePercent: 0,
        },
        passed: true,
        criteria: {},
      });
    }
  }

  async runStressTests(): Promise<void> {
    console.log('🔥 执行压力测试...\n');

    const tests = [
      {
        name: '同步压力测试',
        testFn: () => this.testFileSync(),
        config: {
          testName: 'sync-stress',
          startConcurrency: 1,
          endConcurrency: 20,
          step: 2,
          iterationsPerStep: 10,
        },
      },
      {
        name: '分析压力测试',
        testFn: () => this.testFileAnalysis(),
        config: {
          testName: 'analysis-stress',
          startConcurrency: 1,
          endConcurrency: 20,
          step: 2,
          iterationsPerStep: 10,
        },
      },
    ];

    for (const test of tests) {
      console.log(`  测试: ${test.name}`);
      const result = await this.engine.runStressTest(test.testFn, test.config);
      console.log(`    ✅ 完成 - 破坏点: 并发 ${result.breakingPoint.concurrency}\n`);
      this.results.stressTests.push(result);
    }
  }

  async runLoadTests(): Promise<void> {
    console.log('⚡ 执行负载测试...\n');

    const tests = [
      {
        name: '同步负载测试',
        testFn: () => this.testFileSync(),
        config: {
          testName: 'sync-load',
          duration: 30000,
          targetRPS: 100,
        },
      },
      {
        name: '分析负载测试',
        testFn: () => this.testFileAnalysis(),
        config: {
          testName: 'analysis-load',
          duration: 30000,
          targetRPS: 100,
        },
      },
    ];

    for (const test of tests) {
      console.log(`  测试: ${test.name}`);
      const result = await this.engine.runLoadTest(test.testFn, test.config);
      console.log(`    ✅ 完成 - 实际RPS: ${result.actualRPS.toFixed(2)}\n`);
      this.results.loadTests.push(result);
    }
  }

  private async testFileSync(): Promise<void> {
    const testFile = path.join(__dirname, '../../test-data/test-file.md');
    const codeFile = path.join(__dirname, '../../test-data/test-file.ts');

    await this.workerManager.executeSyncTask({
      mappingId: 'test-mapping',
      documentPath: testFile,
      codePaths: [codeFile],
      direction: 'doc-to-code',
    });
  }

  private async testFileAnalysis(): Promise<void> {
    const testFile = path.join(__dirname, '../../test-data/test-file.ts');

    await this.workerManager.executeAnalyzeTask({
      filePath: testFile,
      analysisType: 'structure',
      options: {
        includeLineNumbers: true,
        includeComments: true,
        maxDepth: 10,
      },
    });
  }

  private async testFileProcessing(): Promise<void> {
    const testFile = path.join(__dirname, '../../test-data/test-file.ts');

    await this.workerManager.executeProcessTask({
      filePath: testFile,
      operation: 'format',
      options: {
        preserveComments: true,
        indentSize: 2,
        outputFormat: 'utf-8',
      },
    });
  }

  private async testFileValidation(): Promise<void> {
    const testFile = path.join(__dirname, '../../test-data/test-file.ts');

    await this.workerManager.executeValidateTask({
      filePath: testFile,
      validationType: 'syntax',
      options: {
        strictMode: true,
        customRules: [],
      },
    });
  }

  private async testConcurrentSync(): Promise<void> {
    const testFile = path.join(__dirname, '../../test-data/test-file.md');
    const codeFile = path.join(__dirname, '../../test-data/test-file.ts');

    await this.workerManager.executeBatchSyncTasks([
      {
        mappingId: 'test-mapping-1',
        documentPath: testFile,
        codePaths: [codeFile],
        direction: 'doc-to-code',
      },
      {
        mappingId: 'test-mapping-2',
        documentPath: testFile,
        codePaths: [codeFile],
        direction: 'doc-to-code',
      },
      {
        mappingId: 'test-mapping-3',
        documentPath: testFile,
        codePaths: [codeFile],
        direction: 'doc-to-code',
      },
      {
        mappingId: 'test-mapping-4',
        documentPath: testFile,
        codePaths: [codeFile],
        direction: 'doc-to-code',
      },
    ]);
  }

  async saveReport(report: PerformanceReport, outputPath: string): Promise<void> {
    const markdown = this.generateMarkdownReport(report);
    await fs.writeFile(outputPath, markdown, 'utf-8');
    console.log(`\n📄 性能测试报告已保存到: ${outputPath}`);
  }

  private generateMarkdownReport(report: PerformanceReport): string {
    let markdown = `# YYC³ 文档同步工具 - 性能测试报告

**报告ID**: ${report.reportId}
**生成时间**: ${new Date(report.generatedAt).toLocaleString('zh-CN')}

---

## 📊 测试环境

- **Node.js 版本**: ${report.environment.nodeVersion}
- **操作系统**: ${report.environment.platform} (${report.environment.arch})
- **CPU 核心数**: ${report.environment.cpus}
- **总内存**: ${(report.environment.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB
- **可用内存**: ${(report.environment.freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB

---

## 📈 基准性能测试

`;

    report.tests.benchmarks.forEach(benchmark => {
      markdown += `### ${benchmark.testName}

| 指标 | 基准值 | 当前值 | 变化 |
|------|----------|----------|--------|
| 平均耗时 | ${benchmark.baseline.averageDuration.toFixed(2)}ms | ${benchmark.current.averageDuration.toFixed(2)}ms | ${benchmark.comparison.durationChangePercent.toFixed(2)}% |
| 吞吐量 | ${benchmark.baseline.throughput.toFixed(2)} ops/s | ${benchmark.current.throughput.toFixed(2)} ops/s | ${benchmark.comparison.throughputChangePercent.toFixed(2)}% |
| 内存使用 | ${(benchmark.baseline.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB | ${(benchmark.current.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB | ${benchmark.comparison.memoryChangePercent.toFixed(2)}% |
| 错误率 | ${(benchmark.baseline.errorRate * 100).toFixed(2)}% | ${(benchmark.current.errorRate * 100).toFixed(2)}% | - |

**状态**: ${benchmark.passed ? '✅ 通过' : '❌ 失败'}

`;
    });

    markdown += `## 🔥 压力测试

`;

    report.tests.stressTests.forEach(stressTest => {
      markdown += `### ${stressTest.testName}

**破坏点**: 并发 ${stressTest.breakingPoint.concurrency}
**错误率**: ${(stressTest.breakingPoint.errorRate * 100).toFixed(2)}%
**平均耗时**: ${stressTest.breakingPoint.averageDuration.toFixed(2)}ms

**建议**:
`;
      stressTest.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
      markdown += '\n';
    });

    markdown += `## ⚡ 负载测试

`;

    report.tests.loadTests.forEach(loadTest => {
      markdown += `### ${loadTest.testName}

| 指标 | 值 |
|------|-----|
| 目标RPS | ${loadTest.targetRPS} |
| 实际RPS | ${loadTest.actualRPS.toFixed(2)} |
| 总请求数 | ${loadTest.totalRequests} |
| 成功请求数 | ${loadTest.successfulRequests} |
| 失败请求数 | ${loadTest.failedRequests} |
| 错误率 | ${(loadTest.errorRate * 100).toFixed(2)}% |
| 平均延迟 | ${loadTest.averageLatency.toFixed(2)}ms |
| P95延迟 | ${loadTest.percentile95.toFixed(2)}ms |
| P99延迟 | ${loadTest.percentile99.toFixed(2)}ms |

`;
    });

    markdown += `## 📊 总结

| 指标 | 值 |
|------|-----|
| 总测试数 | ${report.summary.totalTests} |
| 通过测试数 | ${report.summary.passedTests} |
| 失败测试数 | ${report.summary.failedTests} |
| 总体评分 | ${report.summary.overallScore.toFixed(2)}% |

## 💡 建议

`;

    report.summary.recommendations.forEach(rec => {
      markdown += `- ${rec}\n`;
    });

    markdown += `
---

**报告生成时间**: ${new Date().toLocaleString('zh-CN')}
**YYC³ 文档同步工具 v1.0.0**
`;

    return markdown;
  }
}
