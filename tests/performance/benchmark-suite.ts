/**
 * @file performance/benchmark-suite.ts
 * @description Benchmark Suite 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { performance } from 'perf_hooks';

/**
 * 性能测试结果
 */
export interface BenchmarkResult {
  name: string;
  duration: number;
  operations: number;
  opsPerSecond: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p50: number;
  p95: number;
  p99: number;
  memoryUsed?: number;
  cpuUsage?: number;
}

/**
 * 性能测试选项
 */
export interface BenchmarkOptions {
  iterations?: number;
  warmup?: number;
  concurrent?: number;
  timeout?: number;
}

/**
 * 性能基准测试套件
 */
export class BenchmarkSuite {
  private results: BenchmarkResult[] = [];
  private baseline: Map<string, BenchmarkResult> = new Map();

  /**
   * 执行基准测试
   */
  async benchmark(
    name: string,
    fn: () => Promise<void> | void,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult> {
    const {
      iterations = 1000,
      warmup = 100,
      concurrent = 1,
      timeout = 30000
    } = options;

    // 预热
    for (let i = 0; i < warmup; i++) {
      await fn();
    }

    // 收集延迟数据
    const latencies: number[] = [];
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    // 执行测试
    for (let i = 0; i < iterations; i++) {
      const iterStart = performance.now();
      
      if (concurrent > 1) {
        await Promise.all(
          Array.from({ length: concurrent }, () => fn())
        );
      } else {
        await fn();
      }
      
      const iterEnd = performance.now();
      latencies.push(iterEnd - iterStart);

      // 超时检查
      if (iterEnd - startTime > timeout) {
        throw new Error(`Benchmark timeout after ${timeout}ms`);
      }
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;
    const duration = endTime - startTime;

    // 计算统计信息
    const sortedLatencies = latencies.sort((a, b) => a - b);
    const totalOps = iterations * concurrent;

    const result: BenchmarkResult = {
      name,
      duration,
      operations: totalOps,
      opsPerSecond: (totalOps / duration) * 1000,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      minLatency: sortedLatencies[0],
      maxLatency: sortedLatencies[sortedLatencies.length - 1],
      p50: this.percentile(sortedLatencies, 50),
      p95: this.percentile(sortedLatencies, 95),
      p99: this.percentile(sortedLatencies, 99),
      memoryUsed: endMemory - startMemory,
      cpuUsage: process.cpuUsage().user / 1000
    };

    this.results.push(result);
    return result;
  }

  /**
   * 计算百分位数
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[index];
  }

  /**
   * 设置基线
   */
  setBaseline(name: string, result: BenchmarkResult): void {
    this.baseline.set(name, result);
  }

  /**
   * 对比基线
   */
  compareToBaseline(name: string): {
    improvement: number;
    regression: boolean;
  } | null {
    const baseline = this.baseline.get(name);
    const current = this.results.find(r => r.name === name);

    if (!baseline || !current) {
      return null;
    }

    const improvement = 
      ((baseline.avgLatency - current.avgLatency) / baseline.avgLatency) * 100;

    return {
      improvement,
      regression: improvement < 0
    };
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const lines: string[] = [
      '╔══════════════════════════════════════════════════════════════╗',
      '║              Performance Benchmark Report                   ║',
      '╚══════════════════════════════════════════════════════════════╝',
      ''
    ];

    for (const result of this.results) {
      lines.push(`Test: ${result.name}`);
      lines.push(`  Operations: ${result.operations.toLocaleString()}`);
      lines.push(`  Duration: ${result.duration.toFixed(2)}ms`);
      lines.push(`  Throughput: ${result.opsPerSecond.toFixed(2)} ops/sec`);
      lines.push(`  Avg Latency: ${result.avgLatency.toFixed(2)}ms`);
      lines.push(`  Min Latency: ${result.minLatency.toFixed(2)}ms`);
      lines.push(`  Max Latency: ${result.maxLatency.toFixed(2)}ms`);
      lines.push(`  P50: ${result.p50.toFixed(2)}ms`);
      lines.push(`  P95: ${result.p95.toFixed(2)}ms`);
      lines.push(`  P99: ${result.p99.toFixed(2)}ms`);
      
      if (result.memoryUsed !== undefined) {
        lines.push(`  Memory: ${(result.memoryUsed / 1024 / 1024).toFixed(2)}MB`);
      }

      const comparison = this.compareToBaseline(result.name);
      if (comparison) {
        const symbol = comparison.regression ? '↓' : '↑';
        const color = comparison.regression ? '🔴' : '🟢';
        lines.push(
          `  ${color} Baseline Comparison: ${symbol} ${Math.abs(comparison.improvement).toFixed(2)}%`
        );
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 导出结果为JSON
   */
  exportJSON(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      baseline: Array.from(this.baseline.entries()).map(([name, result]) => ({
        ...result,
        name
      }))
    }, null, 2);
  }

  /**
   * 清空结果
   */
  clear(): void {
    this.results = [];
  }

  /**
   * 获取所有结果
   */
  getResults(): BenchmarkResult[] {
    return [...this.results];
  }
}

/**
 * 创建基准测试套件
 */
export function createBenchmarkSuite(): BenchmarkSuite {
  return new BenchmarkSuite();
}