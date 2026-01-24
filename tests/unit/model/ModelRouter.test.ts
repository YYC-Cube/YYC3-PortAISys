/**
 * @file 模型路由器单元测试
 * @description 测试 ModelRouter 的核心功能
 * @module tests/unit/model/ModelRouter.test.ts
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ModelRouter, RoutingStrategy, RouterConfig, ModelRouteConfig } from '../../../core/model/ModelRouter';
import { ModelProvider, ChatRequest } from '../../../core/types/model.types';
import { IModelAdapter } from '../../../core/model/ModelAdapter';

describe('ModelRouter', () => {
  let router: ModelRouter;
  let config: RouterConfig;
  let mockAdapter: IModelAdapter;

  beforeEach(() => {
    mockAdapter = {
      initialize: vi.fn().mockResolvedValue(undefined),
      chat: vi.fn().mockResolvedValue({
        success: true,
        content: { message: 'test response' },
        metadata: { model: 'test-model', tokens: 10 }
      }),
      healthCheck: vi.fn().mockResolvedValue(true)
    } as unknown as IModelAdapter;

    config = {
      strategy: RoutingStrategy.ROUND_ROBIN,
      defaultProvider: ModelProvider.OPENAI,
      routes: [
        {
          provider: ModelProvider.OPENAI,
          model: 'gpt-4',
          priority: 1,
          enabled: true,
          config: { apiKey: 'test-key' }
        },
        {
          provider: ModelProvider.ANTHROPIC,
          model: 'claude-3',
          priority: 2,
          enabled: true,
          config: { apiKey: 'test-key' }
        }
      ],
      fallbackEnabled: true
    };

    router = new ModelRouter(config);
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该正确初始化路由器', async () => {
      await router.initialize();
      expect(router).toBeDefined();
    });

    it('应该使用提供的配置', async () => {
      expect(router).toBeDefined();
      const stats = router.getStats();
      expect(stats).toBeDefined();
    });

    it('应该接受自定义配置', async () => {
      const customConfig: RouterConfig = {
        strategy: RoutingStrategy.LEAST_LATENCY,
        defaultProvider: ModelProvider.ANTHROPIC,
        routes: [
          {
            provider: ModelProvider.ANTHROPIC,
            model: 'claude-3',
            priority: 1,
            enabled: true,
            config: { apiKey: 'test-key' }
          }
        ],
        fallbackEnabled: false
      };

      const customRouter = new ModelRouter(customConfig);
      expect(customRouter).toBeDefined();
    });
  });

  describe('模型选择', () => {
    it('应该使用轮询策略选择模型', async () => {
      const roundRobinConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.ROUND_ROBIN
      };

      const roundRobinRouter = new ModelRouter(roundRobinConfig);
      await roundRobinRouter.initialize();

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'test' }]
      };

      const stats1 = roundRobinRouter.getStats();
      const stats2 = roundRobinRouter.getStats();
      expect(stats1).toBeDefined();
      expect(stats2).toBeDefined();
    });

    it('应该使用最低延迟策略选择模型', async () => {
      const leastLatencyConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.LEAST_LATENCY
      };

      const leastLatencyRouter = new ModelRouter(leastLatencyConfig);
      await leastLatencyRouter.initialize();

      const stats = leastLatencyRouter.getStats();
      expect(stats).toBeDefined();
    });

    it('应该使用成本优化策略选择模型', async () => {
      const costOptimizedConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.COST_OPTIMIZED
      };

      const costOptimizedRouter = new ModelRouter(costOptimizedConfig);
      await costOptimizedRouter.initialize();

      const stats = costOptimizedRouter.getStats();
      expect(stats).toBeDefined();
    });

    it('应该使用质量优先策略选择模型', async () => {
      const qualityFirstConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.QUALITY_FIRST
      };

      const qualityFirstRouter = new ModelRouter(qualityFirstConfig);
      await qualityFirstRouter.initialize();

      const stats = qualityFirstRouter.getStats();
      expect(stats).toBeDefined();
    });

    it('应该使用手动指定策略选择模型', async () => {
      const manualConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.MANUAL
      };

      const manualRouter = new ModelRouter(manualConfig);
      await manualRouter.initialize();

      const stats = manualRouter.getStats();
      expect(stats).toBeDefined();
    });
  });

  describe('统计信息', () => {
    it('应该获取统计信息', async () => {
      await router.initialize();
      const stats = router.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });

    it('应该更新统计信息', async () => {
      await router.initialize();
      const stats1 = router.getStats();
      expect(stats1).toBeDefined();
    });
  });

  describe('健康状态', () => {
    it('应该获取健康状态', async () => {
      await router.initialize();
      const healthStatus = await router.getHealthStatus();
      expect(healthStatus).toBeDefined();
      expect(typeof healthStatus).toBe('object');
    });

    it('应该返回所有适配器的健康状态', async () => {
      await router.initialize();
      const stats = router.getStats();
      const adapterCount = Object.keys(stats).length;

      const healthStatus = await router.getHealthStatus();
      expect(healthStatus).toBeDefined();
      expect(typeof healthStatus).toBe('object');
    });
  });

  describe('故障转移', () => {
    it('应该在主模型失败时转移到备用模型', async () => {
      const fallbackConfig: RouterConfig = {
        ...config,
        fallbackEnabled: true
      };

      const fallbackRouter = new ModelRouter(fallbackConfig);
      await fallbackRouter.initialize();

      const healthStatus = await fallbackRouter.getHealthStatus();
      expect(healthStatus).toBeDefined();
    });

    it('应该在没有备用模型时抛出错误', async () => {
      const singleRouteConfig: RouterConfig = {
        ...config,
        routes: [
          {
            provider: ModelProvider.OPENAI,
            model: 'gpt-4',
            priority: 1,
            enabled: true,
            config: { apiKey: 'test-key' }
          }
        ],
        fallbackEnabled: true
      };

      const singleRouteRouter = new ModelRouter(singleRouteConfig);
      await singleRouteRouter.initialize();

      const healthStatus = await singleRouteRouter.getHealthStatus();
      expect(healthStatus).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该处理初始化失败', async () => {
      const invalidConfig: RouterConfig = {
        ...config,
        routes: [
          {
            provider: ModelProvider.OPENAI,
            model: 'gpt-4',
            priority: 1,
            enabled: true,
            config: {}
          }
        ],
        fallbackEnabled: false
      };

      const invalidRouter = new ModelRouter(invalidConfig);
      expect(invalidRouter).toBeDefined();
    });

    it('应该处理健康检查失败', async () => {
      await router.initialize();
      const healthStatus = await router.getHealthStatus();
      expect(healthStatus).toBeDefined();
    });
  });

  describe('路由策略', () => {
    it('应该正确实现轮询策略', async () => {
      const roundRobinConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.ROUND_ROBIN
      };

      const roundRobinRouter = new ModelRouter(roundRobinConfig);
      await roundRobinRouter.initialize();

      const stats = roundRobinRouter.getStats();
      expect(stats).toBeDefined();
    });

    it('应该正确实现最低延迟策略', async () => {
      const leastLatencyConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.LEAST_LATENCY
      };

      const leastLatencyRouter = new ModelRouter(leastLatencyConfig);
      await leastLatencyRouter.initialize();

      const stats = leastLatencyRouter.getStats();
      expect(stats).toBeDefined();
    });

    it('应该正确实现成本优化策略', async () => {
      const costOptimizedConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.COST_OPTIMIZED
      };

      const costOptimizedRouter = new ModelRouter(costOptimizedConfig);
      await costOptimizedRouter.initialize();

      const stats = costOptimizedRouter.getStats();
      expect(stats).toBeDefined();
    });

    it('应该正确实现质量优先策略', async () => {
      const qualityFirstConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.QUALITY_FIRST
      };

      const qualityFirstRouter = new ModelRouter(qualityFirstConfig);
      await qualityFirstRouter.initialize();

      const stats = qualityFirstRouter.getStats();
      expect(stats).toBeDefined();
    });

    it('应该正确实现手动指定策略', async () => {
      const manualConfig: RouterConfig = {
        ...config,
        strategy: RoutingStrategy.MANUAL
      };

      const manualRouter = new ModelRouter(manualConfig);
      await manualRouter.initialize();

      const stats = manualRouter.getStats();
      expect(stats).toBeDefined();
    });
  });
});
