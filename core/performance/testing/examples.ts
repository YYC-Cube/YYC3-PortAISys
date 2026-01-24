/**
 * @file 性能测试框架使用示例
 * @description 展示如何使用性能测试框架进行性能测试
 * @module performance-testing
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-07
 */

import {
  PerformanceTestEngineImpl,
  PerformanceMonitorImpl,
  PerformanceAnalyzerImpl,
  SimpleLogger,
  PredefinedScenarios,
  PerformanceTestConfig,
  TestType
} from './index';

async function basicUsageExample() {
  console.log('=== 基本使用示例 ===\n');

  const logger = new SimpleLogger('PerformanceTest');
  const monitor = new PerformanceMonitorImpl(logger);
  const analyzer = new PerformanceAnalyzerImpl(logger);
  const engine = new PerformanceTestEngineImpl(monitor, analyzer, logger);

  const config: PerformanceTestConfig = {
    testId: 'basic-test',
    testName: '基本性能测试',
    testType: TestType.BASELINE,
    description: '演示基本性能测试功能',
    duration: 10000,
    concurrency: 5,
    rampUpTime: 2000,
    thresholds: [
      {
        metricName: 'average_response_time',
        warningThreshold: 200,
        criticalThreshold: 500,
        comparison: 'less_than',
        enabled: true
      },
      {
        metricName: 'error_rate',
        warningThreshold: 0.5,
        criticalThreshold: 1.0,
        comparison: 'less_than',
        enabled: true
      }
    ],
    tags: ['example', 'basic'],
    environment: 'development'
  };

  try {
    const result = await engine.runTest(config);
    console.log('测试结果:', JSON.stringify(result.summary, null, 2));
    console.log('阈值违规:', result.violations);
  } catch (error) {
    console.error('测试失败:', error);
  }
}

async function stressTestExample() {
  console.log('\n=== 压力测试示例 ===\n');

  const logger = new SimpleLogger('StressTest');
  const monitor = new PerformanceMonitorImpl(logger);
  const analyzer = new PerformanceAnalyzerImpl(logger);
  const engine = new PerformanceTestEngineImpl(monitor, analyzer, logger);

  const config: PerformanceTestConfig = {
    testId: 'stress-test',
    testName: '压力测试',
    testType: TestType.STRESS,
    description: '演示压力测试功能',
    duration: 20000,
    concurrency: 50,
    rampUpTime: 5000,
    thresholds: [
      {
        metricName: 'average_response_time',
        warningThreshold: 500,
        criticalThreshold: 1000,
        comparison: 'less_than',
        enabled: true
      },
      {
        metricName: 'error_rate',
        warningThreshold: 1.0,
        criticalThreshold: 5.0,
        comparison: 'less_than',
        enabled: true
      },
      {
        metricName: 'cpu_usage',
        warningThreshold: 80,
        criticalThreshold: 95,
        comparison: 'less_than',
        enabled: true
      }
    ],
    tags: ['example', 'stress'],
    environment: 'staging'
  };

  try {
    const result = await engine.runStressTest(config);
    console.log('测试结果:', JSON.stringify(result.summary, null, 2));
    console.log('阈值违规:', result.violations);
  } catch (error) {
    console.error('测试失败:', error);
  }
}

async function monitoringTestExample() {
  console.log('\n=== 监控测试示例 ===\n');

  const logger = new SimpleLogger('MonitoringTest');
  const monitor = new PerformanceMonitorImpl(logger);
  const analyzer = new PerformanceAnalyzerImpl(logger);
  const engine = new PerformanceTestEngineImpl(monitor, analyzer, logger);

  const config: PerformanceTestConfig = {
    testId: 'monitoring-test',
    testName: '监控测试',
    testType: TestType.MONITORING,
    description: '演示监控测试功能',
    duration: 15000,
    concurrency: 20,
    rampUpTime: 3000,
    thresholds: [
      {
        metricName: 'average_response_time',
        warningThreshold: 300,
        criticalThreshold: 600,
        comparison: 'less_than',
        enabled: true
      },
      {
        metricName: 'error_rate',
        warningThreshold: 0.5,
        criticalThreshold: 2.0,
        comparison: 'less_than',
        enabled: true
      }
    ],
    tags: ['example', 'monitoring'],
    environment: 'production'
  };

  try {
    const result = await engine.runMonitoringTest(config);
    console.log('测试结果:', JSON.stringify(result.summary, null, 2));
    console.log('阈值违规:', result.violations);
  } catch (error) {
    console.error('测试失败:', error);
  }
}

async function analysisTestExample() {
  console.log('\n=== 分析测试示例 ===\n');

  const logger = new SimpleLogger('AnalysisTest');
  const monitor = new PerformanceMonitorImpl(logger);
  const analyzer = new PerformanceAnalyzerImpl(logger);
  const engine = new PerformanceTestEngineImpl(monitor, analyzer, logger);

  const config: PerformanceTestConfig = {
    testId: 'analysis-test',
    testName: '分析测试',
    testType: TestType.ANALYSIS,
    description: '演示分析测试功能',
    duration: 15000,
    concurrency: 25,
    rampUpTime: 3000,
    thresholds: [
      {
        metricName: 'average_response_time',
        warningThreshold: 250,
        criticalThreshold: 500,
        comparison: 'less_than',
        enabled: true
      },
      {
        metricName: 'error_rate',
        warningThreshold: 0.5,
        criticalThreshold: 1.5,
        comparison: 'less_than',
        enabled: true
      }
    ],
    tags: ['example', 'analysis'],
    environment: 'staging'
  };

  try {
    const result = await engine.runAnalysisTest(config);
    console.log('测试结果:', JSON.stringify(result.summary, null, 2));
    console.log('阈值违规:', result.violations);

    if (result.metadata?.analysisReport) {
      console.log('分析报告:', JSON.stringify(result.metadata.analysisReport, null, 2));
    }
    if (result.metadata?.bottlenecks) {
      console.log('性能瓶颈:', JSON.stringify(result.metadata.bottlenecks, null, 2));
    }
    if (result.metadata?.recommendations) {
      console.log('优化建议:', JSON.stringify(result.metadata.recommendations, null, 2));
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
}

async function baselineComparisonExample() {
  console.log('\n=== 基准对比示例 ===\n');

  const logger = new SimpleLogger('BaselineComparison');
  const monitor = new PerformanceMonitorImpl(logger);
  const analyzer = new PerformanceAnalyzerImpl(logger);
  const engine = new PerformanceTestEngineImpl(monitor, analyzer, logger);

  const config: PerformanceTestConfig = {
    testId: 'comparison-test',
    testName: '对比测试',
    testType: TestType.BASELINE,
    description: '演示基准对比功能',
    duration: 10000,
    concurrency: 10,
    rampUpTime: 2000,
    thresholds: [
      {
        metricName: 'average_response_time',
        warningThreshold: 200,
        criticalThreshold: 500,
        comparison: 'less_than',
        enabled: true
      }
    ],
    tags: ['example', 'comparison'],
    environment: 'staging'
  };

  try {
    const baselineResult = await engine.runBaselineTest(config);
    console.log('基准测试结果:', JSON.stringify(baselineResult.summary, null, 2));

    const currentResult = await engine.runTest(config);
    console.log('当前测试结果:', JSON.stringify(currentResult.summary, null, 2));

    const comparisonReport = analyzer.compareResults(baselineResult, currentResult);
    console.log('对比报告:', JSON.stringify(comparisonReport, null, 2));
  } catch (error) {
    console.error('测试失败:', error);
  }
}

async function predefinedScenarioExample() {
  console.log('\n=== 预定义场景示例 ===\n');

  const logger = new SimpleLogger('PredefinedScenario');
  const monitor = new PerformanceMonitorImpl(logger);
  const analyzer = new PerformanceAnalyzerImpl(logger);
  const engine = new PerformanceTestEngineImpl(monitor, analyzer, logger);

  const scenarios = PredefinedScenarios.getAllScenarios();

  for (const scenario of scenarios) {
    console.log(`\n运行场景: ${scenario.name}`);
    console.log(`描述: ${scenario.description}`);

    try {
      if (scenario.setup) {
        await scenario.setup();
      }

      const result = await engine.runTest(scenario.config);
      console.log('测试结果:', JSON.stringify(result.summary, null, 2));

      if (scenario.teardown) {
        await scenario.teardown();
      }
    } catch (error) {
      console.error('测试失败:', error);
    }
  }
}

async function customScenarioExample() {
  console.log('\n=== 自定义场景示例 ===\n');

  const logger = new SimpleLogger('CustomScenario');
  const monitor = new PerformanceMonitorImpl(logger);
  const analyzer = new PerformanceAnalyzerImpl(logger);
  const engine = new PerformanceTestEngineImpl(monitor, analyzer, logger);

  const customScenario = PredefinedScenarios.getCustomScenario(
    '自定义API测试',
    '测试自定义API接口的性能',
    {
      testId: 'custom-api-test',
      testName: '自定义API测试',
      testType: TestType.BASELINE,
      duration: 20000,
      concurrency: 15,
      rampUpTime: 5000,
      thresholds: [
        {
          metricName: 'average_response_time',
          warningThreshold: 150,
          criticalThreshold: 300,
          comparison: 'less_than',
          enabled: true
        },
        {
          metricName: 'throughput',
          warningThreshold: 150,
          criticalThreshold: 100,
          comparison: 'greater_than',
          enabled: true
        }
      ],
      tags: ['custom', 'api'],
      environment: 'staging'
    }
  );

  console.log(`运行场景: ${customScenario.name}`);
  console.log(`描述: ${customScenario.description}`);

  try {
    if (customScenario.setup) {
      await customScenario.setup();
    }

    const result = await engine.runTest(customScenario.config);
    console.log('测试结果:', JSON.stringify(result.summary, null, 2));

    if (customScenario.teardown) {
      await customScenario.teardown();
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
}

async function main() {
  console.log('性能测试框架使用示例\n');
  console.log('====================================\n');

  await basicUsageExample();
  await stressTestExample();
  await monitoringTestExample();
  await analysisTestExample();
  await baselineComparisonExample();
  await predefinedScenarioExample();
  await customScenarioExample();

  console.log('\n====================================');
  console.log('所有示例执行完成');
}

if (require.main === module) {
  main().catch(console.error);
}

export {
  basicUsageExample,
  stressTestExample,
  monitoringTestExample,
  analysisTestExample,
  baselineComparisonExample,
  predefinedScenarioExample,
  customScenarioExample
};
