/**
 * @file Anthropic模型适配器实现
 * @description 实现Anthropic（Claude）模型的调用适配器
 * @module model/AnthropicAdapter
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
 * Anthropic配置接口
 */
interface AnthropicConfig extends ModelAdapterConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Anthropic API响应接口
 */
interface AnthropicMessageResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Anthropic模型适配器
 *
 * 功能：
 * 1. 支持Claude聊天（messages API）
 * 2. 支持文本补全（completions API）
 * 3. 自动重试和错误处理
 * 4. 长上下文支持（100K+ tokens）
 * 5. 完整的日志和监控
 */
export class AnthropicAdapter extends ModelAdapter implements IModelAdapter {
  protected config: AnthropicConfig;
  private defaultModel: string = 'claude-3-opus-20240229';

  constructor(config: AnthropicConfig) {
    super(ModelProvider.ANTHROPIC, config);
    this.config = config;
    this.defaultModel = config.model || this.defaultModel;

    logger.info('Anthropic适配器初始化', 'AnthropicAdapter', {
      model: this.defaultModel,
      baseUrl: config.baseUrl
    });
  }

  /**
   * 初始化适配器
   */
  async initialize(config?: unknown): Promise<void> {
    await super.initialize(config);

    if (config) {
      this.config = { ...this.config, ...config as AnthropicConfig };
    }

    // 验证配置
    if (!this.config.apiKey) {
      throw new Error('Anthropic API密钥未配置');
    }

    logger.info('Anthropic适配器初始化完成', 'AnthropicAdapter');
  }

  /**
   * 聊天补全
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const traceId = this.generateTraceId();

    logger.debug('Anthropic聊天请求', 'AnthropicAdapter', {
      model: request.model || this.defaultModel,
      messagesCount: request.messages.length,
      traceId
    });

    try {
      return this.withRetry(async () => {
        const response = await this.callAnthropicMessages(request);
        const processingTime = Date.now() - startTime;

        logger.debug('Anthropic聊天响应', 'AnthropicAdapter', {
          model: response.model,
          tokensUsed: response.usage.totalTokens,
          processingTime,
          traceId
        });

        return response;
      }, 'chat');
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('Anthropic聊天请求失败', 'AnthropicAdapter', {
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

    logger.debug('Anthropic文本补全请求', 'AnthropicAdapter', {
      model: request.model || this.defaultModel,
      promptLength: request.prompt.length,
      traceId
    });

    try {
      return this.withRetry(async () => {
        const response = await this.callAnthropicCompletion(request);
        const processingTime = Date.now() - startTime;

        logger.debug('Anthropic文本补全响应', 'AnthropicAdapter', {
          model: response.model,
          tokensUsed: response.usage.totalTokens,
          processingTime,
          traceId
        });

        return response;
      }, 'completion');
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('Anthropic文本补全请求失败', 'AnthropicAdapter', {
        error,
        processingTime,
        traceId
      });

      throw error;
    }
  }

  /**
   * 调用Anthropic Messages API
   */
  private async callAnthropicMessages(request: ChatRequest): Promise<ChatResponse> {
    const baseUrl = this.config.baseUrl || 'https://api.anthropic.com';
    const model = request.model || this.defaultModel;

    // 转换消息格式（Anthropic使用不同的消息格式）
    const messages = request.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const requestBody = {
      model,
      max_tokens: request.parameters?.maxTokens || 4096,
      messages,
      temperature: request.parameters?.temperature || 0.7,
      top_p: request.parameters?.topP || 1.0
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
      'anthropic-version': '2023-06-01'
    };

    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API错误: ${response.status} - ${error}`);
    }

    const data: AnthropicMessageResponse = await response.json();

    // 提取文本内容
    const textContent = data.content.find(item => item.type === 'text')?.text || '';

    return {
      success: true,
      model: data.model,
      provider: ModelProvider.ANTHROPIC,
      timestamp: new Date(),
      processingTime: Date.now(),
      type: request.type,
      message: {
        role: 'assistant',
        content: textContent
      },
      finishReason: data.stop_reason,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      },
      traceId: this.generateTraceId()
    };
  }

  /**
   * 调用Anthropic Completions API
   */
  private async callAnthropicCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const baseUrl = this.config.baseUrl || 'https://api.anthropic.com';
    const model = request.model || this.defaultModel;

    const requestBody = {
      model,
      max_tokens_to_sample: request.parameters?.maxTokens || 4096,
      prompt: request.prompt,
      temperature: request.parameters?.temperature || 0.7,
      top_p: request.parameters?.topP || 1.0
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
      'anthropic-version': '2023-06-01'
    };

    const response = await fetch(`${baseUrl}/v1/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API错误: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      model: data.model,
      provider: ModelProvider.ANTHROPIC,
      timestamp: new Date(),
      processingTime: Date.now(),
      type: request.type,
      content: data.completion,
      finishReason: data.stop_reason,
      usage: {
        promptTokens: 0, // Anthropic completion API 不返回token数量
        completionTokens: 0,
        totalTokens: 0
      },
      traceId: this.generateTraceId()
    };
  }
}
