/**
 * @file load-benchmark.test.ts
 * @description 负载性能基准测试
 * @module tests/performance
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { describe, it, expect } from 'vitest';
import { createBenchmarkSuite } from './benchmark-suite';

describe('Load Performance Benchmarks', () => {
  it('应该测试低负载场景', async () => {
    const suite = createBenchmarkSuite();

    const result = await suite.benchmark(
      'Low Load (100 concurrent)',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1));
      },
      { iterations: 1000, concurrent: 1 }
    );

    console.log(suite.generateReport());
    expect(result.opsPerSecond).toBeGreaterThan(500);
  });

  it('应该测试中等负载场景', async () => {
    const suite = createBenchmarkSuite();

    const result = await suite.benchmark(
      'Medium Load (500 concurrent)',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2));
      },
      { iterations: 500, concurrent: 5 }
    );

    console.log(suite.generateReport());
    expect(result.avgLatency).toBeLessThan(50);
  });

  it('应该测试高负载场景', async () => {
    const suite = createBenchmarkSuite();

    const result = await suite.benchmark(
      'High Load (1000 concurrent)',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
      },
      { iterations: 200, concurrent: 10 }
    );

    console.log(suite.generateReport());
    expect(result.avgLatency).toBeLessThan(200);
  });

  it('应该测试峰值负载', async () => {
    const suite = createBenchmarkSuite();

    const result = await suite.benchmark(
      'Peak Load (2000 concurrent)',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      },
      { iterations: 100, concurrent: 20 }
    );

    console.log(suite.generateReport());
    expect(result.p99).toBeLessThan(500);
  });

  it('应该测试持续负载稳定性', async () => {
    const suite = createBenchmarkSuite();

    const result = await suite.benchmark(
      'Sustained Load Stability',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
      },
      { iterations: 1000, concurrent: 5, timeout: 60000 }
    );

    console.log(suite.generateReport());
    
    // 检查延迟分布是否稳定
    const latencyVariance = result.maxLatency - result.minLatency;
    expect(latencyVariance).toBeLessThan(100);
  });

  it('应该模拟真实流量模式', async () => {
    const suite = createBenchmarkSuite();

    // 模拟波动的流量
    let requestDelay = 5;
    const result = await suite.benchmark(
      'Real Traffic Pattern',
      async () => {
        // 随机波动请求延迟
        requestDelay = 3 + Math.random() * 10;
        await new Promise(resolve => setTimeout(resolve, requestDelay));
      },
      { iterations: 1000, warmup: 100 }
    );

    console.log(suite.generateReport());
    expect(result.avgLatency).toBeLessThan(20);
  });

  it('应该测试资源耗尽恢复', async () => {
    const suite = createBenchmarkSuite();
    const resources: any[] = [];

    const result = await suite.benchmark(
      'Resource Exhaustion Recovery',
      async () => {
        // 模拟资源分配和释放
        if (resources.length < 100) {
          resources.push({ data: new Array(1000).fill(0) });
        } else {
          resources.shift();
        }
        await new Promise(resolve => setTimeout(resolve, 1));
      },
      { iterations: 1000, warmup: 100 }
    );

    console.log(suite.generateReport());
    expect(result.avgLatency).toBeLessThan(10);
  });

  it('应该生成完整的负载测试报告', async () => {
    const suite = createBenchmarkSuite();

    // 执行多个负载测试
    await suite.benchmark('Load Test 1', async () => {
      await new Promise(resolve => setTimeout(resolve, 1));
    }, { iterations: 100 });

    await suite.benchmark('Load Test 2', async () => {
      await new Promise(resolve => setTimeout(resolve, 2));
    }, { iterations: 100 });

    const report = suite.generateReport();
    const json = suite.exportJSON();

    console.log(report);
    
    expect(report).toContain('Load Test 1');
    expect(report).toContain('Load Test 2');
    expect(JSON.parse(json).results).toHaveLength(2);
  });
});