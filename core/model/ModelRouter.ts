/**
 * @file 模型路由器
 * @description 智能模型选择和路由管理
 * @module model/ModelRouter
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-12-30
 */

import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { ModelProvider, ChatRequest, ChatResponse } from '../types/model.types';
import { OpenAIAdapter } from './OpenAIAdapter';
import { AnthropicAdapter } from './AnthropicAdapter';
import { LocalModelAdapter } from './LocalModelAdapter';
import { IModelAdapter } from './ModelAdapter';

/**
 * 路由策略枚举
 */
export enum RoutingStrategy {
  ROUND_ROBIN = 'round_robin',           // 轮询
  LEAST_LATENCY = 'least_latency',        // 最低延迟
  COST_OPTIMIZED = 'cost_optimized',      // 成本优化
  QUALITY_FIRST = 'quality_first',         // 质量优先
  MANUAL = 'manual'                       // 手动指定
}

/**
 * 模型配置接口
 */
export interface ModelRouteConfig {
  provider: ModelProvider;
  model: string;
  priority: number;
  enabled: boolean;
  config?: {
    apiKey?: string;
    baseUrl?: string;
    modelPath?: string;
    host?: string;
    port?: number;
  };
}

/**
 * 路由器配置接口
 */
export interface RouterConfig {
  strategy: RoutingStrategy;
  defaultProvider: ModelProvider;
  routes: ModelRouteConfig[];
  fallbackEnabled: boolean;
}

/**
 * 模型性能统计
 */
interface ModelStats {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  averageLatency: number;
  lastUsed: Date;
}

/**
 * 模型路由器
 *
 * 功能：
 * 1. 智能模型选择（基于多种策略）
 * 2. 自动故障转移
 * 3. 性能监控和统计
 * 4. 成本优化
 * 5. 质量优先
 */
export class ModelRouter {
  private config: RouterConfig;
  private adapters: Map<string, IModelAdapter> = new Map();
  private stats: Map<string, ModelStats> = new Map();
  private roundRobinIndex: number = 0;

  constructor(config: RouterConfig) {
    this.config = config;

    logger.info('模型路由器初始化', 'ModelRouter', {
      strategy: config.strategy,
      defaultProvider: config.defaultProvider,
      routesCount: config.routes.length
    });
  }

  /**
   * 初始化路由器
   */
  async initialize(): Promise<void> {
    logger.info('初始化模型路由器', 'ModelRouter');

    // 初始化所有启用的适配器
    for (const route of this.config.routes) {
      if (!route.enabled) {
        continue;
      }

      try {
        const adapter = this.createAdapter(route);
        await adapter.initialize(route.config);

        const adapterKey = this.getAdapterKey(route.provider, route.model);
        this.adapters.set(adapterKey, adapter);
        this.stats.set(adapterKey, {
          totalRequests: 0,
          successRequests: 0,
          failedRequests: 0,
          averageLatency: 0,
          lastUsed: new Date()
        });

        logger.info('模型适配器已初始化', 'ModelRouter', {
          provider: route.provider,
          model: route.model
        });
      } catch (error) {
        logger.error('模型适配器初始化失败', 'ModelRouter', {
          provider: route.provider,
          model: route.model,
          error
        });

        if (!this.config.fallbackEnabled) {
          throw error;
        }
      }
    }

    logger.info('模型路由器初始化完成', 'ModelRouter', {
      adaptersCount: this.adapters.size
    });
  }

  /**
   * 聊天补全（自动路由）
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();

    // 选择最佳模型
    const selectedRoute = this.selectModel(request);
    const adapterKey = this.getAdapterKey(selectedRoute.provider, selectedRoute.model);
    const adapter = this.adapters.get(adapterKey);

    if (!adapter) {
      throw new Error(`未找到模型适配器: ${selectedRoute.provider}/${selectedRoute.model}`);
    }

    logger.info('路由请求到模型', 'ModelRouter', {
      provider: selectedRoute.provider,
      model: selectedRoute.model,
      strategy: this.config.strategy
    });

    try {
      // 调用模型
      const response = await adapter.chat(request);
      const processingTime = Date.now() - startTime;

      // 更新统计
      this.updateStats(adapterKey, true, processingTime);

      metrics.increment('model_router.success', 1, {
        provider: selectedRoute.provider,
        model: selectedRoute.model
      });

      logger.info('模型请求成功', 'ModelRouter', {
        provider: selectedRoute.provider,
        model: selectedRoute.model,
        processingTime
      });

      return response;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // 更新统计
      this.updateStats(adapterKey, false, processingTime);

      metrics.increment('model_router.error', 1, {
        provider: selectedRoute.provider,
        model: selectedRoute.model
      });

      logger.error('模型请求失败', 'ModelRouter', {
        provider: selectedRoute.provider,
        model: selectedRoute.model,
        error,
        processingTime
      });

      // 故障转移
      if (this.config.fallbackEnabled) {
        logger.info('尝试故障转移', 'ModelRouter');
        return this.chatWithFallback(request, adapterKey);
      }

      throw error;
    }
  }

  /**
   * 故障转移
   */
  private async chatWithFallback(request: ChatRequest, failedAdapterKey: string): Promise<ChatResponse> {
    const availableRoutes = this.config.routes.filter(route => {
      const key = this.getAdapterKey(route.provider, route.model);
      return route.enabled && this.adapters.has(key) && key !== failedAdapterKey;
    });

    if (availableRoutes.length === 0) {
      throw new Error('没有可用的备用模型');
    }

    // 选择第一个可用的模型作为备选
    const fallbackRoute = availableRoutes[0];
    const adapterKey = this.getAdapterKey(fallbackRoute.provider, fallbackRoute.model);
    const adapter = this.adapters.get(adapterKey)!;

    logger.info('故障转移到备用模型', 'ModelRouter', {
      provider: fallbackRoute.provider,
      model: fallbackRoute.model
    });

    const response = await adapter.chat(request);

    metrics.increment('model_router.fallback', 1, {
      fromProvider: this.getProviderFromKey(failedAdapterKey),
      toProvider: fallbackRoute.provider
    });

    return response;
  }

  /**
   * 选择模型
   */
  private selectModel(request: ChatRequest): ModelRouteConfig {
    // 如果请求指定了provider和model，直接使用
    if (request.provider && request.model) {
      const route = this.config.routes.find(
        r => r.provider === request.provider && r.model === request.model && r.enabled
      );

      if (route) {
        return route;
      }
    }

    // 根据策略选择模型
    switch (this.config.strategy) {
      case RoutingStrategy.ROUND_ROBIN:
        return this.selectRoundRobin();

      case RoutingStrategy.LEAST_LATENCY:
        return this.selectLeastLatency();

      case RoutingStrategy.COST_OPTIMIZED:
        return this.selectCostOptimized();

      case RoutingStrategy.QUALITY_FIRST:
        return this.selectQualityFirst();

      case RoutingStrategy.MANUAL:
        return this.selectManual();

      default:
        return this.selectDefault();
    }
  }

  /**
   * 轮询策略
   */
  private selectRoundRobin(): ModelRouteConfig {
    const enabledRoutes = this.config.routes.filter(r => r.enabled);
    this.roundRobinIndex = (this.roundRobinIndex + 1) % enabledRoutes.length;
    return enabledRoutes[this.roundRobinIndex];
  }

  /**
   * 最低延迟策略
   */
  private selectLeastLatency(): ModelRouteConfig {
    const enabledRoutes = this.config.routes.filter(r => r.enabled);

    let bestRoute = enabledRoutes[0];
    let bestLatency = Infinity;

    for (const route of enabledRoutes) {
      const key = this.getAdapterKey(route.provider, route.model);
      const stats = this.stats.get(key);

      if (stats && stats.totalRequests > 0) {
        if (stats.averageLatency < bestLatency) {
          bestLatency = stats.averageLatency;
          bestRoute = route;
        }
      }
    }

    return bestRoute;
  }

  /**
   * 成本优化策略
   */
  private selectCostOptimized(): ModelRouteConfig {
    const enabledRoutes = this.config.routes.filter(r => r.enabled);

    // 简单实现：优先级越低，成本越低
    return enabledRoutes.sort((a, b) => a.priority - b.priority)[0];
  }

  /**
   * 质量优先策略
   */
  private selectQualityFirst(): ModelRouteConfig {
    const enabledRoutes = this.config.routes.filter(r => r.enabled);

    // 简单实现：优先级越高，质量越好
    return enabledRoutes.sort((a, b) => b.priority - a.priority)[0];
  }

  /**
   * 手动指定策略
   */
  private selectManual(): ModelRouteConfig {
    const route = this.config.routes.find(
      r => r.provider === this.config.defaultProvider && r.enabled
    );

    if (!route) {
      throw new Error(`默认模型未启用: ${this.config.defaultProvider}`);
    }

    return route;
  }

  /**
   * 默认选择
   */
  private selectDefault(): ModelRouteConfig {
    return this.selectManual();
  }

  /**
   * 创建适配器
   */
  private createAdapter(route: ModelRouteConfig): IModelAdapter {
    switch (route.provider) {
      case ModelProvider.OPENAI:
        return new OpenAIAdapter({
          apiKey: route.config?.apiKey!,
          baseUrl: route.config?.baseUrl,
          model: route.model
        });

      case ModelProvider.ANTHROPIC:
        return new AnthropicAdapter({
          apiKey: route.config?.apiKey!,
          baseUrl: route.config?.baseUrl,
          model: route.model
        });

      case ModelProvider.LOCAL:
        return new LocalModelAdapter({
          modelPath: route.config?.modelPath!,
          host: route.config?.host,
          port: route.config?.port,
          model: route.model
        });

      default:
        throw new Error(`不支持的模型提供商: ${route.provider}`);
    }
  }

  /**
   * 更新统计
   */
  private updateStats(adapterKey: string, success: boolean, latency: number): void {
    const stats = this.stats.get(adapterKey);

    if (!stats) {
      return;
    }

    stats.totalRequests++;
    stats.lastUsed = new Date();

    if (success) {
      stats.successRequests++;
      // 更新平均延迟
      stats.averageLatency =
        (stats.averageLatency * (stats.successRequests - 1) + latency) /
        stats.successRequests;
    } else {
      stats.failedRequests++;
    }

    this.stats.set(adapterKey, stats);
  }

  /**
   * 获取适配器键
   */
  private getAdapterKey(provider: ModelProvider, model: string): string {
    return `${provider}:${model}`;
  }

  /**
   * 从键中提取provider
   */
  private getProviderFromKey(key: string): ModelProvider {
    return key.split(':')[0] as ModelProvider;
  }

  /**
   * 获取统计信息
   */
  getStats(): Record<string, ModelStats> {
    return Object.fromEntries(this.stats);
  }

  /**
   * 获取健康状态
   */
  async getHealthStatus(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};

    for (const [key, adapter] of this.adapters) {
      try {
        healthStatus[key] = await adapter.healthCheck();
      } catch (error) {
        healthStatus[key] = false;
      }
    }

    return healthStatus;
  }
}
