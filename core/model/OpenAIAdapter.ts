/**
 * @file OpenAI模型适配器实现
 * @description 实现OpenAI模型的调用适配器
 * @module model/OpenAIAdapter
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
 * OpenAI配置接口
 */
interface OpenAIConfig extends ModelAdapterConfig {
  apiKey: string;
  baseUrl?: string;
  organization?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * OpenAI API响应接口
 */
interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI模型适配器
 *
 * 功能：
 * 1. 支持聊天补全（chat completion）
 * 2. 支持文本补全（text completion）
 * 3. 自动重试和错误处理
 * 4. 流式输出支持（TODO）
 * 5. 完整的日志和监控
 */
export class OpenAIAdapter extends ModelAdapter implements IModelAdapter {
  protected config: OpenAIConfig;
  private defaultModel: string = 'gpt-4-turbo-preview';

  constructor(config: OpenAIConfig) {
    super(ModelProvider.OPENAI, config);
    this.config = config;
    this.defaultModel = config.model || this.defaultModel;

    logger.info('OpenAI适配器初始化', 'OpenAIAdapter', {
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
      this.config = { ...this.config, ...config as OpenAIConfig };
    }

    // 验证配置
    if (!this.config.apiKey) {
      throw new Error('OpenAI API密钥未配置');
    }

    logger.info('OpenAI适配器初始化完成', 'OpenAIAdapter');
  }

  /**
   * 聊天补全
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const traceId = this.generateTraceId();

    logger.debug('OpenAI聊天请求', 'OpenAIAdapter', {
      model: request.model || this.defaultModel,
      messagesCount: request.messages.length,
      traceId
    });

    try {
      return this.withRetry(async () => {
        const response = await this.callOpenAIChat(request);
        const processingTime = Date.now() - startTime;

        logger.debug('OpenAI聊天响应', 'OpenAIAdapter', {
          model: response.model,
          tokensUsed: response.usage.totalTokens,
          processingTime,
          traceId
        });

        return response;
      }, 'chat');
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('OpenAI聊天请求失败', 'OpenAIAdapter', {
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

    logger.debug('OpenAI文本补全请求', 'OpenAIAdapter', {
      model: request.model || this.defaultModel,
      promptLength: request.prompt.length,
      traceId
    });

    try {
      return this.withRetry(async () => {
        const response = await this.callOpenAICompletion(request);
        const processingTime = Date.now() - startTime;

        logger.debug('OpenAI文本补全响应', 'OpenAIAdapter', {
          model: response.model,
          tokensUsed: response.usage.totalTokens,
          processingTime,
          traceId
        });

        return response;
      }, 'completion');
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('OpenAI文本补全请求失败', 'OpenAIAdapter', {
        error,
        processingTime,
        traceId
      });

      throw error;
    }
  }

  /**
   * 调用OpenAI聊天API
   */
  private async callOpenAIChat(request: ChatRequest): Promise<ChatResponse> {
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
    const model = request.model || this.defaultModel;

    const requestBody = {
      model,
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: request.parameters?.maxTokens || 4096,
      temperature: request.parameters?.temperature || 0.7,
      top_p: request.parameters?.topP || 1.0
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
    };

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API错误: ${response.status} - ${error}`);
    }

    const data: OpenAIChatResponse = await response.json();

    return {
      success: true,
      model: data.model,
      provider: ModelProvider.OPENAI,
      timestamp: new Date(),
      processingTime: Date.now(),
      type: request.type,
      message: {
        role: data.choices[0].message.role as 'assistant',
        content: data.choices[0].message.content
      },
      finishReason: data.choices[0].finish_reason,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      traceId: this.generateTraceId()
    };
  }

  /**
   * 调用OpenAI文本补全API
   */
  private async callOpenAICompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
    const model = request.model || this.defaultModel;

    const requestBody = {
      model,
      prompt: request.prompt,
      max_tokens: request.parameters?.maxTokens || 4096,
      temperature: request.parameters?.temperature || 0.7,
      top_p: request.parameters?.topP || 1.0
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
    };

    const response = await fetch(`${baseUrl}/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API错误: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      model: data.model,
      provider: ModelProvider.OPENAI,
      timestamp: new Date(),
      processingTime: Date.now(),
      type: request.type,
      content: data.choices[0].text,
      finishReason: data.choices[0].finish_reason,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      traceId: this.generateTraceId()
    };
  }
}
