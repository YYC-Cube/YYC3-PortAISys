/**
 * @file 本地模型适配器实现
 * @description 实现本地AI模型（如Llama、ChatGLM等）的调用适配器
 * @module model/LocalModelAdapter
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-12-30
 */

import { ModelAdapter, ModelAdapterConfig, IModelAdapter } from './ModelAdapter';
import { logger } from '../utils/logger';
import {
  ModelProvider,
  ChatRequest,
  ChatResponse,
  CompletionRequest,
  CompletionResponse
} from '../types/model.types';

/**
 * 本地模型配置接口
 */
interface LocalModelConfig extends ModelAdapterConfig {
  modelPath: string;
  engine?: 'llama-cpp' | 'ollama' | 'vllm' | 'custom';
  host?: string;
  port?: number;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * 本地模型适配器
 *
 * 功能：
 * 1. 支持多种本地模型引擎（llama-cpp、Ollama、vLLM等）
 * 2. 支持HTTP API调用
 * 3. 支持聊天和文本补全
 * 4. 自动重试和错误处理
 * 5. 完整的日志和监控
 */
export class LocalModelAdapter extends ModelAdapter implements IModelAdapter {
  protected config: LocalModelConfig;
  private baseUrl: string;

  constructor(config: LocalModelConfig) {
    super(ModelProvider.LOCAL, config);
    this.config = config;

    // 构建基础URL
    const host = config.host || 'localhost';
    const port = config.port || 8080;
    this.baseUrl = `http://${host}:${port}`;

    logger.info('本地模型适配器初始化', 'LocalModelAdapter', {
      engine: config.engine,
      modelPath: config.modelPath,
      baseUrl: this.baseUrl
    });
  }

  /**
   * 初始化适配器
   */
  async initialize(config?: unknown): Promise<void> {
    await super.initialize(config);

    if (config) {
      this.config = { ...this.config, ...config as LocalModelConfig };
    }

    // 验证配置
    if (!this.config.modelPath && this.config.engine === 'llama-cpp') {
      throw new Error('本地模型路径未配置');
    }

    // 健康检查
    await this.healthCheck();

    logger.info('本地模型适配器初始化完成', 'LocalModelAdapter');
  }

  /**
   * 聊天补全
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const traceId = this.generateTraceId();

    logger.debug('本地模型聊天请求', 'LocalModelAdapter', {
      model: request.model || this.config.model,
      messagesCount: request.messages.length,
      traceId
    });

    try {
      return this.withRetry(async () => {
        const response = await this.callLocalChat(request);
        const processingTime = Date.now() - startTime;

        logger.debug('本地模型聊天响应', 'LocalModelAdapter', {
          model: response.model,
          processingTime,
          traceId
        });

        return response;
      }, 'chat');
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('本地模型聊天请求失败', 'LocalModelAdapter', {
        error,
        processingTime,
        traceId
      });

      throw error;
    }
  }

  /**
   * 文本补全
   */
  async completion(request: CompletionRequest): Promise<CompletionResponse> {
    const startTime = Date.now();
    const traceId = this.generateTraceId();

    logger.debug('本地模型文本补全请求', 'LocalModelAdapter', {
      model: request.model || this.config.model,
      promptLength: request.prompt.length,
      traceId
    });

    try {
      return this.withRetry(async () => {
        const response = await this.callLocalCompletion(request);
        const processingTime = Date.now() - startTime;

        logger.debug('本地模型文本补全响应', 'LocalModelAdapter', {
          model: response.model,
          processingTime,
          traceId
        });

        return response;
      }, 'completion');
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('本地模型文本补全请求失败', 'LocalModelAdapter', {
        error,
        processingTime,
        traceId
      });

      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      const isHealthy = response.ok;
      logger.debug('本地模型健康检查', 'LocalModelAdapter', {
        status: isHealthy ? 'healthy' : 'unhealthy',
        baseUrl: this.baseUrl
      });

      return isHealthy;
    } catch (error) {
      logger.warn('本地模型健康检查失败', 'LocalModelAdapter', {
        error,
        baseUrl: this.baseUrl
      });

      return false;
    }
  }

  /**
   * 调用本地模型聊天API
   */
  private async callLocalChat(request: ChatRequest): Promise<ChatResponse> {
    const model = request.model || this.config.model || 'default';

    // 根据不同引擎构建请求
    const requestBody = {
      model,
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: request.parameters?.maxTokens || 4096,
      temperature: request.parameters?.temperature || 0.7,
      top_p: request.parameters?.topP || 1.0,
      stream: false
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`本地模型API错误: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      model: data.model || model,
      provider: ModelProvider.LOCAL,
      timestamp: new Date(),
      processingTime: Date.now(),
      type: request.type,
      message: {
        role: 'assistant',
        content: data.choices[0].message.content
      },
      finishReason: data.choices[0].finish_reason,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      },
      traceId: this.generateTraceId()
    };
  }

  /**
   * 调用本地模型文本补全API
   */
  private async callLocalCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const model = request.model || this.config.model || 'default';

    const requestBody = {
      model,
      prompt: request.prompt,
      max_tokens: request.parameters?.maxTokens || 4096,
      temperature: request.parameters?.temperature || 0.7,
      top_p: request.parameters?.topP || 1.0,
      stream: false
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    const response = await fetch(`${this.baseUrl}/v1/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`本地模型API错误: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      model: data.model || model,
      provider: ModelProvider.LOCAL,
      timestamp: new Date(),
      processingTime: Date.now(),
      type: request.type,
      content: data.choices[0].text,
      finishReason: data.choices[0].finish_reason,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      },
      traceId: this.generateTraceId()
    };
  }
}
