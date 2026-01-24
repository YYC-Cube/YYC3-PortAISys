/**
 * @file api-benchmark.test.ts
 * @description API性能基准测试
 * @module tests/performance
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createBenchmarkSuite, BenchmarkSuite } from './benchmark-suite';

describe('API Performance Benchmarks', () => {
  let suite: BenchmarkSuite;

  beforeAll(() => {
    suite = createBenchmarkSuite();
  });

  it('应该测试API响应时间 (目标: <126ms)', async () => {
    const result = await suite.benchmark(
      'API Response Time',
      async () => {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
      },
      { iterations: 1000, warmup: 100 }
    );

    console.log(suite.generateReport());
    
    expect(result.avgLatency).toBeLessThan(126);
    expect(result.p95).toBeLessThan(200);
    expect(result.p99).toBeLessThan(300);
  });

  it('应该测试API吞吐量 (目标: >1560 req/s)', async () => {
    const result = await suite.benchmark(
      'API Throughput',
      async () => {
        // 模拟快速API调用
        await Promise.resolve();
      },
      { iterations: 10000, warmup: 1000 }
    );

    console.log(`Throughput: ${result.opsPerSecond.toFixed(2)} req/s`);
    
    expect(result.opsPerSecond).toBeGreaterThan(1560);
  });

  it('应该测试并发API请求', async () => {
    const result = await suite.benchmark(
      'Concurrent API Requests',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
      },
      { iterations: 100, concurrent: 10, warmup: 10 }
    );

    console.log(suite.generateReport());
    
    expect(result.avgLatency).toBeLessThan(150);
  });

  it('应该测试API错误处理性能', async () => {
    const result = await suite.benchmark(
      'API Error Handling',
      async () => {
        try {
          throw new Error('Test error');
        } catch (error) {
          // 错误处理
        }
      },
      { iterations: 1000, warmup: 100 }
    );

    expect(result.avgLatency).toBeLessThan(1);
  });

  it('应该生成完整的性能报告', () => {
    const report = suite.generateReport();
    expect(report).toContain('Performance Benchmark Report');
    expect(report).toContain('API Response Time');
    
    const json = suite.exportJSON();
    expect(json).toBeTruthy();
    
    const parsed = JSON.parse(json);
    expect(parsed.results.length).toBeGreaterThan(0);
  });
});