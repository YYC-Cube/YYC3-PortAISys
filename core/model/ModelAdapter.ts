/**
 * @file 模型适配器基类
 * @description 定义模型适配器的抽象接口和基础实现
 * @module model/ModelAdapter
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-12-30
 */

import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { ModelProvider, ChatRequest, ChatResponse, CompletionRequest, CompletionResponse } from '../types/model.types';

/**
 * 模型适配器接口
 */
export interface IModelAdapter {
  provider: ModelProvider;
  initialize(config?: unknown): Promise<void>;
  chat(request: ChatRequest): Promise<ChatResponse>;
  completion(request: CompletionRequest): Promise<CompletionResponse>;
  healthCheck(): Promise<boolean>;
}

/**
 * 模型适配器配置
 */
export interface ModelAdapterConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * 模型适配器基类
 *
 * 设计理念：
 * 1. 抽象接口：定义统一的模型调用接口
 * 2. 错误处理：统一的错误处理和重试机制
 * 3. 监控指标：记录所有API调用的性能数据
 * 4. 可扩展性：便于添加新的模型提供商
 */
export abstract class ModelAdapter implements IModelAdapter {
  protected config: ModelAdapterConfig;
  public provider: ModelProvider;
  protected initialized: boolean = false;

  constructor(provider: ModelProvider, config: ModelAdapterConfig = {}) {
    this.provider = provider;
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      ...config
    };

    logger.info('模型适配器创建', 'ModelAdapter', {
      provider,
      hasApiKey: !!config.apiKey
    });
  }

  /**
   * 初始化适配器
   */
  async initialize(config?: unknown): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config as ModelAdapterConfig };
    }

    this.initialized = true;
    logger.info('模型适配器初始化完成', 'ModelAdapter', { provider: this.provider });
  }

  /**
   * 聊天补全（抽象方法，子类必须实现）
   */
  abstract chat(request: ChatRequest): Promise<ChatResponse>;

  /**
   * 文本补全（抽象方法，子类必须实现）
   */
  abstract completion(request: CompletionRequest): Promise<CompletionResponse>;

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    return this.initialized;
  }

  // ================= 辅助方法 =================

  protected async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const maxRetries = this.config.maxRetries || 3;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await operation();
        const processingTime = Date.now() - startTime;

        metrics.increment('model_adapter.success', 1, { provider: this.provider });
        metrics.histogram('model_adapter.latency', processingTime, { provider: this.provider });

        logger.debug('模型调用成功', 'ModelAdapter', {
          provider: this.provider,
          operation: operationName,
          attempt,
          processingTime
        });

        return result;
      } catch (error) {
        lastError = error as Error;

        logger.warn('模型调用失败，重试中', 'ModelAdapter', {
          provider: this.provider,
          operation: operationName,
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message
        });

        metrics.increment('model_adapter.retry', 1, { provider: this.provider });

        if (attempt < maxRetries) {
          // 指数退避
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }

    metrics.increment('model_adapter.error', 1, { provider: this.provider });

    throw new Error(
      `模型调用失败（${operationName}），已重试 ${maxRetries} 次：${lastError?.message}`
    );
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
