/**
 * @file 预定义测试场景
 * @description 提供预定义的性能测试场景
 * @module performance-testing
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-07
 */

import {
  PerformanceTestConfig,
  TestScenario,
  TestType
} from './types';
import { logger } from '../../utils/logger';

export class PredefinedScenarios {
  static getBaselineScenario(): TestScenario {
    const config: PerformanceTestConfig = {
      testId: 'baseline-test',
      testName: '基准性能测试',
      testType: TestType.BASELINE,
      description: '建立系统基准性能指标',
      duration: 60000,
      concurrency: 10,
      rampUpTime: 10000,
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
        },
        {
          metricName: 'cpu_usage',
          warningThreshold: 70,
          criticalThreshold: 85,
          comparison: 'less_than',
          enabled: true
        },
        {
          metricName: 'memory_usage',
          warningThreshold: 75,
          criticalThreshold: 90,
          comparison: 'less_than',
          enabled: true
        }
      ],
      tags: ['baseline', 'performance'],
      environment: 'staging'
    };

    return {
      name: '基准性能测试',
      description: '建立系统基准性能指标，用于后续性能比较',
      config,
      setup: async () => {
        logger.info('设置基准测试环境...', 'scenarios');
      },
      teardown: async () => {
        logger.info('清理基准测试环境...', 'scenarios');
      },
      executeRequest: async () => {
        return { success: true };
      }
    };
  }

  static getStressScenario(): TestScenario {
    const config: PerformanceTestConfig = {
      testId: 'stress-test',
      testName: '压力测试',
      testType: TestType.STRESS,
      description: '测试系统在高负载下的性能表现',
      duration: 120000,
      concurrency: 100,
      rampUpTime: 30000,
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
        },
        {
          metricName: 'memory_usage',
          warningThreshold: 85,
          criticalThreshold: 95,
          comparison: 'less_than',
          enabled: true
        }
      ],
      tags: ['stress', 'performance'],
      environment: 'staging'
    };

    return {
      name: '压力测试',
      description: '测试系统在高负载下的性能表现，识别性能瓶颈',
      config,
      setup: async () => {
        logger.info('设置压力测试环境...', 'scenarios');
      },
      teardown: async () => {
        logger.info('清理压力测试环境...', 'scenarios');
      },
      executeRequest: async () => {
        return { success: true };
      }
    };
  }

  static getMonitoringScenario(): TestScenario {
    const config: PerformanceTestConfig = {
      testId: 'monitoring-test',
      testName: '监控测试',
      testType: TestType.MONITORING,
      description: '持续监控系统性能指标',
      duration: 300000,
      concurrency: 50,
      rampUpTime: 20000,
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
        },
        {
          metricName: 'cpu_usage',
          warningThreshold: 75,
          criticalThreshold: 90,
          comparison: 'less_than',
          enabled: true
        },
        {
          metricName: 'memory_usage',
          warningThreshold: 80,
          criticalThreshold: 92,
          comparison: 'less_than',
          enabled: true
        }
      ],
      tags: ['monitoring', 'performance'],
      environment: 'production'
    };

    return {
      name: '监控测试',
      description: '持续监控系统性能指标，及时发现性能问题',
      config,
      setup: async () => {
        logger.info('设置监控测试环境...', 'scenarios');
      },
      teardown: async () => {
        logger.info('清理监控测试环境...', 'scenarios');
      },
      executeRequest: async () => {
        return { success: true };
      }
    };
  }

  static getAnalysisScenario(): TestScenario {
    const config: PerformanceTestConfig = {
      testId: 'analysis-test',
      testName: '分析测试',
      testType: TestType.ANALYSIS,
      description: '分析系统性能并生成优化建议',
      duration: 180000,
      concurrency: 75,
      rampUpTime: 25000,
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
        },
        {
          metricName: 'cpu_usage',
          warningThreshold: 70,
          criticalThreshold: 85,
          comparison: 'less_than',
          enabled: true
        },
        {
          metricName: 'memory_usage',
          warningThreshold: 75,
          criticalThreshold: 90,
          comparison: 'less_than',
          enabled: true
        }
      ],
      tags: ['analysis', 'performance'],
      environment: 'staging'
    };

    return {
      name: '分析测试',
      description: '分析系统性能并生成优化建议',
      config,
      setup: async () => {
        logger.info('设置分析测试环境...', 'scenarios');
      },
      teardown: async () => {
        logger.info('清理分析测试环境...', 'scenarios');
      },
      executeRequest: async () => {
        return { success: true };
      }
    };
  }

  static getAPITestScenario(): TestScenario {
    const config: PerformanceTestConfig = {
      testId: 'api-test',
      testName: 'API性能测试',
      testType: TestType.BASELINE,
      description: '测试API接口的性能表现',
      duration: 90000,
      concurrency: 20,
      rampUpTime: 15000,
      thresholds: [
        {
          metricName: 'average_response_time',
          warningThreshold: 100,
          criticalThreshold: 200,
          comparison: 'less_than',
          enabled: true
        },
        {
          metricName: 'error_rate',
          warningThreshold: 0.1,
          criticalThreshold: 0.5,
          comparison: 'less_than',
          enabled: true
        },
        {
          metricName: 'throughput',
          warningThreshold: 100,
          criticalThreshold: 50,
          comparison: 'greater_than',
          enabled: true
        }
      ],
      tags: ['api', 'performance'],
      environment: 'staging'
    };

    return {
      name: 'API性能测试',
      description: '测试API接口的性能表现，包括响应时间和吞吐量',
      config,
      setup: async () => {
        logger.info('设置API测试环境...', 'scenarios');
      },
      teardown: async () => {
        logger.info('清理API测试环境...', 'scenarios');
      },
      executeRequest: async () => {
        return { success: true };
      }
    };
  }

  static getDatabaseTestScenario(): TestScenario {
    const config: PerformanceTestConfig = {
      testId: 'database-test',
      testName: '数据库性能测试',
      testType: TestType.ANALYSIS,
      description: '测试数据库查询的性能表现',
      duration: 120000,
      concurrency: 30,
      rampUpTime: 20000,
      thresholds: [
        {
          metricName: 'average_response_time',
          warningThreshold: 50,
          criticalThreshold: 100,
          comparison: 'less_than',
          enabled: true
        },
        {
          metricName: 'error_rate',
          warningThreshold: 0.05,
          criticalThreshold: 0.1,
          comparison: 'less_than',
          enabled: true
        },
        {
          metricName: 'throughput',
          warningThreshold: 200,
          criticalThreshold: 100,
          comparison: 'greater_than',
          enabled: true
        }
      ],
      tags: ['database', 'performance'],
      environment: 'staging'
    };

    return {
      name: '数据库性能测试',
      description: '测试数据库查询的性能表现，识别慢查询',
      config,
      setup: async () => {
        logger.info('设置数据库测试环境...', 'scenarios');
      },
      teardown: async () => {
        logger.info('清理数据库测试环境...', 'scenarios');
      },
      executeRequest: async () => {
        return { success: true };
      }
    };
  }

  static getCustomScenario(
    name: string,
    description: string,
    config: Partial<PerformanceTestConfig>
  ): TestScenario {
    const defaultConfig: PerformanceTestConfig = {
      testId: `custom-${Date.now()}`,
      testName: name,
      testType: TestType.BASELINE,
      description,
      duration: 60000,
      concurrency: 10,
      rampUpTime: 10000,
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
      tags: ['custom', 'performance'],
      environment: 'staging'
    };

    const mergedConfig = { ...defaultConfig, ...config };

    return {
      name,
      description,
      config: mergedConfig,
      setup: async () => {
        logger.info(`设置自定义测试环境: ${name}...`, 'scenarios');
      },
      teardown: async () => {
        logger.info(`清理自定义测试环境: ${name}...`, 'scenarios');
      },
      executeRequest: async () => {
        return { success: true };
      }
    };
  }

  static getAllScenarios(): TestScenario[] {
    return [
      this.getBaselineScenario(),
      this.getStressScenario(),
      this.getMonitoringScenario(),
      this.getAnalysisScenario(),
      this.getAPITestScenario(),
      this.getDatabaseTestScenario()
    ];
  }

  static getScenarioByName(name: string): TestScenario | undefined {
    const scenarios = this.getAllScenarios();
    return scenarios.find(s => s.name === name);
  }
}
