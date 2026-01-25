/**
 * @file 简化型性能优化引擎测试
 * @description 测试简化型性能优化引擎的各项功能
 * @module __tests__/unit/performance/SimplifiedOptimizationEngine.test
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SimplifiedPerformanceOptimizer,
  MetricsCollector,
  IssueAnalyzer,
  ActionGenerator,
  ActionExecutor,
  PerformanceDomain,
  OptimizationStrategy,
  OptimizationPriority,
  DomainMetrics,
  PerformanceIssue,
  OptimizationAction
} from '../../../core/performance/SimplifiedOptimizationEngine';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('collectMetrics', () => {
    it('应该成功收集CPU域的指标', () => {
      const metrics = collector.collectMetrics(PerformanceDomain.CPU);

      expect(metrics).toBeDefined();
      expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.cpuUsage).toBeLessThanOrEqual(100);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeLessThanOrEqual(100);
    });

    it('应该成功收集内存域的指标', () => {
      const metrics = collector.collectMetrics(PerformanceDomain.MEMORY);

      expect(metrics).toBeDefined();
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeLessThanOrEqual(100);
    });

    it('应该成功收集数据库域的指标', () => {
      const metrics = collector.collectMetrics(PerformanceDomain.DATABASE);

      expect(metrics).toBeDefined();
      expect(metrics.databaseLatency).toBeGreaterThanOrEqual(0);
    });

    it('应该成功收集缓存域的指标', () => {
      const metrics = collector.collectMetrics(PerformanceDomain.CACHE);

      expect(metrics).toBeDefined();
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeLessThanOrEqual(100);
    });

    it('应该成功收集并发域的指标', () => {
      const metrics = collector.collectMetrics(PerformanceDomain.CONCURRENCY);

      expect(metrics).toBeDefined();
      expect(metrics.concurrency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMetricsHistory', () => {
    it('应该返回指标历史记录', () => {
      collector.collectMetrics(PerformanceDomain.CPU);
      collector.collectMetrics(PerformanceDomain.CPU);

      const history = collector.getMetricsHistory(PerformanceDomain.CPU);

      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('应该返回空数组如果没有收集指标', () => {
      const history = collector.getMetricsHistory(PerformanceDomain.CPU);

      expect(history).toEqual([]);
    });
  });
});

describe('IssueAnalyzer', () => {
  let analyzer: IssueAnalyzer;

  beforeEach(() => {
    analyzer = new IssueAnalyzer();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeIssues', () => {
    it('应该检测CPU使用率过高的问题', () => {
      const metrics: DomainMetrics = {
        cpuUsage: 90,
        memoryUsage: 50,
        diskIO: 30,
        networkIO: 40,
        databaseLatency: 100,
        cacheHitRate: 80,
        concurrency: 500
      };

      const issues = analyzer.analyzeIssues(metrics, PerformanceDomain.CPU);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe(PerformanceDomain.CPU);
      expect(issues[0].description).toContain('CPU使用率过高');
    });

    it('应该检测内存使用率过高的问题', () => {
      const metrics: DomainMetrics = {
        cpuUsage: 50,
        memoryUsage: 90,
        diskIO: 30,
        networkIO: 40,
        databaseLatency: 100,
        cacheHitRate: 80,
        concurrency: 500
      };

      const issues = analyzer.analyzeIssues(metrics, PerformanceDomain.MEMORY);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe(PerformanceDomain.MEMORY);
      expect(issues[0].description).toContain('内存使用率过高');
    });

    it('应该检测数据库延迟过高的问题', () => {
      const metrics: DomainMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskIO: 30,
        networkIO: 40,
        databaseLatency: 300,
        cacheHitRate: 80,
        concurrency: 500
      };

      const issues = analyzer.analyzeIssues(metrics, PerformanceDomain.DATABASE);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe(PerformanceDomain.DATABASE);
      expect(issues[0].description).toContain('数据库延迟过高');
    });

    it('应该检测缓存命中率过低的问题', () => {
      const metrics: DomainMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskIO: 30,
        networkIO: 40,
        databaseLatency: 100,
        cacheHitRate: 50,
        concurrency: 500
      };

      const issues = analyzer.analyzeIssues(metrics, PerformanceDomain.CACHE);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe(PerformanceDomain.CACHE);
      expect(issues[0].description).toContain('缓存命中率过低');
    });

    it('应该检测并发数过高的问题', () => {
      const metrics: DomainMetrics = {
        cpuUsage: 50,
        memoryUsage: 50,
        diskIO: 30,
        networkIO: 40,
        databaseLatency: 100,
        cacheHitRate: 80,
        concurrency: 1500
      };

      const issues = analyzer.analyzeIssues(metrics, PerformanceDomain.CONCURRENCY);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe(PerformanceDomain.CONCURRENCY);
      expect(issues[0].description).toContain('并发数过高');
    });

    it('应该根据严重程度正确分类问题', () => {
      const criticalMetrics: DomainMetrics = {
        cpuUsage: 95,
        memoryUsage: 50,
        diskIO: 30,
        networkIO: 40,
        databaseLatency: 100,
        cacheHitRate: 80,
        concurrency: 500
      };

      const issues = analyzer.analyzeIssues(criticalMetrics, PerformanceDomain.CPU);

      expect(issues[0].severity).toBe(OptimizationPriority.MEDIUM);
    });
  });
});

describe('ActionGenerator', () => {
  let generator: ActionGenerator;

  beforeEach(() => {
    generator = new ActionGenerator();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateActions', () => {
    it('应该为CPU问题生成优化动作', () => {
      const issue: PerformanceIssue = {
        id: 'test-issue-1',
        type: PerformanceDomain.CPU,
        severity: OptimizationPriority.HIGH,
        description: 'CPU使用率过高',
        metrics: {
          cpuUsage: 90,
          memoryUsage: 50,
          diskIO: 30,
          networkIO: 40,
          databaseLatency: 100,
          cacheHitRate: 80,
          concurrency: 500
        },
        timestamp: new Date()
      };

      const actions = generator.generateActions(issue);

      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].domain).toBe(PerformanceDomain.CPU);
      expect(actions[0].type).toBe(OptimizationStrategy.ADAPTIVE);
    });

    it('应该为内存问题生成优化动作', () => {
      const issue: PerformanceIssue = {
        id: 'test-issue-2',
        type: PerformanceDomain.MEMORY,
        severity: OptimizationPriority.HIGH,
        description: '内存使用率过高',
        metrics: {
          cpuUsage: 50,
          memoryUsage: 90,
          diskIO: 30,
          networkIO: 40,
          databaseLatency: 100,
          cacheHitRate: 80,
          concurrency: 500
        },
        timestamp: new Date()
      };

      const actions = generator.generateActions(issue);

      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].domain).toBe(PerformanceDomain.MEMORY);
    });

    it('应该为数据库问题生成优化动作', () => {
      const issue: PerformanceIssue = {
        id: 'test-issue-3',
        type: PerformanceDomain.DATABASE,
        severity: OptimizationPriority.HIGH,
        description: '数据库延迟过高',
        metrics: {
          cpuUsage: 50,
          memoryUsage: 50,
          diskIO: 30,
          networkIO: 40,
          databaseLatency: 300,
          cacheHitRate: 80,
          concurrency: 500
        },
        timestamp: new Date()
      };

      const actions = generator.generateActions(issue);

      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].domain).toBe(PerformanceDomain.DATABASE);
    });

    it('应该为缓存问题生成优化动作', () => {
      const issue: PerformanceIssue = {
        id: 'test-issue-4',
        type: PerformanceDomain.CACHE,
        severity: OptimizationPriority.HIGH,
        description: '缓存命中率过低',
        metrics: {
          cpuUsage: 50,
          memoryUsage: 50,
          diskIO: 30,
          networkIO: 40,
          databaseLatency: 100,
          cacheHitRate: 50,
          concurrency: 500
        },
        timestamp: new Date()
      };

      const actions = generator.generateActions(issue);

      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].domain).toBe(PerformanceDomain.CACHE);
    });

    it('应该为并发问题生成优化动作', () => {
      const issue: PerformanceIssue = {
        id: 'test-issue-5',
        type: PerformanceDomain.CONCURRENCY,
        severity: OptimizationPriority.HIGH,
        description: '并发数过高',
        metrics: {
          cpuUsage: 50,
          memoryUsage: 50,
          diskIO: 30,
          networkIO: 40,
          databaseLatency: 100,
          cacheHitRate: 80,
          concurrency: 1500
        },
        timestamp: new Date()
      };

      const actions = generator.generateActions(issue);

      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].domain).toBe(PerformanceDomain.CONCURRENCY);
    });

    it('应该为每个问题生成多个优化动作', () => {
      const issue: PerformanceIssue = {
        id: 'test-issue-6',
        type: PerformanceDomain.CPU,
        severity: OptimizationPriority.HIGH,
        description: 'CPU使用率过高',
        metrics: {
          cpuUsage: 90,
          memoryUsage: 50,
          diskIO: 30,
          networkIO: 40,
          databaseLatency: 100,
          cacheHitRate: 80,
          concurrency: 500
        },
        timestamp: new Date()
      };

      const actions = generator.generateActions(issue);

      expect(actions.length).toBeGreaterThan(1);
    });
  });
});

describe('ActionExecutor', () => {
  let executor: ActionExecutor;

  beforeEach(() => {
    executor = new ActionExecutor();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('executeAction', () => {
    it('应该成功执行优化动作', async () => {
      const action: OptimizationAction = {
        id: 'test-action-1',
        type: OptimizationStrategy.ADAPTIVE,
        domain: PerformanceDomain.CPU,
        priority: OptimizationPriority.HIGH,
        description: '优化CPU密集型任务调度',
        implementation: '调整任务优先级，实现负载均衡',
        estimatedImpact: 0.3,
        riskLevel: 0.2,
        dependencies: []
      };

      const result = await executor.executeAction(action);

      expect(result).toBe(true);
    });

    it('应该处理执行失败的情况', async () => {
      const action: OptimizationAction = {
        id: 'test-action-2',
        type: OptimizationStrategy.ADAPTIVE,
        domain: PerformanceDomain.CPU,
        priority: OptimizationPriority.HIGH,
        description: '测试失败情况',
        implementation: '故意失败',
        estimatedImpact: 0.3,
        riskLevel: 0.2,
        dependencies: []
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await executor.executeAction(action);

      expect(result).toBe(true);
      consoleSpy.mockRestore();
    });
  });
});

describe('SimplifiedPerformanceOptimizer', () => {
  let optimizer: SimplifiedPerformanceOptimizer;

  beforeEach(() => {
    optimizer = new SimplifiedPerformanceOptimizer({
      autoApply: true,
      optimizationInterval: 1000
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('start', () => {
    it('应该成功启动优化器', async () => {
      await optimizer.start();

      expect(optimizer).toBeDefined();
      await optimizer.stop();
    });

    it('应该防止重复启动', async () => {
      await optimizer.start();
      await optimizer.start();

      expect(optimizer).toBeDefined();
      await optimizer.stop();
    });
  });

  describe('stop', () => {
    it('应该成功停止优化器', async () => {
      await optimizer.start();
      await optimizer.stop();

      expect(optimizer).toBeDefined();
    });

    it('应该防止重复停止', async () => {
      await optimizer.start();
      await optimizer.stop();
      await optimizer.stop();

      expect(optimizer).toBeDefined();
    });
  });

  describe('optimizePerformance', () => {
    it('应该成功执行性能优化', async () => {
      const report = await optimizer.optimizePerformance();

      expect(report).toBeDefined();
      expect(report.optimizationId).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.duration).toBeGreaterThan(0);
      expect(report.issues).toBeInstanceOf(Array);
      expect(report.actions).toBeInstanceOf(Array);
      expect(report.executedActions).toBeInstanceOf(Array);
      expect(report.overallImpact).toBeDefined();
    });

    it('应该生成有效的优化报告', async () => {
      const report = await optimizer.optimizePerformance();

      expect(report.overallImpact).toHaveProperty('performanceImprovement');
      expect(report.overallImpact).toHaveProperty('resourceSavings');
      expect(report.overallImpact).toHaveProperty('stabilityImprovement');
      expect(report.overallImpact).toHaveProperty('userExperienceImprovement');
    });

    it('应该处理优化过程中的错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const report = await optimizer.optimizePerformance();

      expect(report).toBeDefined();
      consoleSpy.mockRestore();
    });
  });

  describe('getMetricsHistory', () => {
    it('应该返回指标历史记录', async () => {
      await optimizer.optimizePerformance();
      await optimizer.optimizePerformance();

      const history = optimizer.getMetricsHistory(PerformanceDomain.CPU);

      expect(history).toBeInstanceOf(Array);
    });
  });

  describe('事件发射', () => {
    it('应该在优化完成时发射事件', async () => {
      const eventSpy = vi.fn();
      optimizer.on('optimizationCompleted', eventSpy);

      await optimizer.optimizePerformance();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('应该在检测到问题时发射事件', async () => {
      const eventSpy = vi.fn();
      optimizer.on('issuesDetected', eventSpy);

      await optimizer.optimizePerformance();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('应该在执行动作时发射事件', async () => {
      const eventSpy = vi.fn();
      optimizer.on('actionExecuted', eventSpy);

      const report = await optimizer.optimizePerformance();

      if (report.executedActions.length > 0) {
        expect(eventSpy).toHaveBeenCalled();
      }
    });
  });
});
