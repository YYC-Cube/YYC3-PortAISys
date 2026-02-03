/**
 * @file OpenAI模型适配器实现
 * @description 实现OpenAI API的模型适配器
 * @module adapters/OpenAIModelAdapter
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { ModelAdapter, ModelGenerationRequest, ModelGenerationResponse } from './ModelAdapter';
import { AutonomousAIConfig } from '../autonomous-ai-widget/types';
import { AITool } from '../tools/types';
import {
  ValidationError,
  NetworkError,
  InternalError,
  TimeoutError,
  AuthenticationError,
  isRetryable
} from '../error-handler/ErrorTypes';
import { ErrorHandler } from '../error-handler/ErrorHandler';
import { logger } from '../utils/logger';

/**
 * 流式响应回调函数类型
 */
export type StreamCallback = (chunk: {
  content: string;
  done: boolean;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}) => void;

/**
 * OpenAI模型适配器实现
 * 封装了OpenAI API的调用逻辑，实现了ModelAdapter接口
 */
export class OpenAIModelAdapter implements ModelAdapter {
  private config: AutonomousAIConfig;
  private status: 'idle' | 'initializing' | 'generating' | 'error' = 'idle';
  private abortController: AbortController | null = null;
  private supportedTools: string[] = ['search', 'calculator', 'code_interpreter', 'retrieval'];
  private totalRequests: number = 0;
  private successfulRequests: number = 0;
  private failedRequests: number = 0;
  private responseTimes: number[] = [];
  private totalTokensUsed: number = 0;
  private errorHandler: ErrorHandler;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(config: AutonomousAIConfig, errorHandler?: ErrorHandler) {
    this.config = config;
    this.errorHandler = errorHandler || new ErrorHandler({ enableAutoRecovery: true });
  }

  /**
   * 初始化适配器
   * @param config 配置信息
   */
  async initialize(config: AutonomousAIConfig): Promise<void> {
    this.status = 'initializing';
    this.config = config;

    if (!this.config.apiType) {
      throw new ValidationError('apiType is required', 'apiType', {
        additionalData: { config: this.config }
      });
    }

    if (!this.config.modelName) {
      throw new ValidationError('modelName is required', 'modelName', {
        additionalData: { config: this.config }
      });
    }

    if (this.config.apiType === 'openai' && !this.config.apiKey) {
      throw new ValidationError('API key is required for OpenAI API', 'apiKey', {
        additionalData: { apiType: this.config.apiType }
      });
    }

    this.status = 'idle';
  }

  /**
   * 检查适配器是否已初始化
   */
  isInitialized(): boolean {
    return this.status !== 'initializing' &&
           !!this.config.apiKey &&
           !!this.config.apiType &&
           !!this.config.modelName;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AutonomousAIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取模型名称
   */
  getModelName(): string {
    return this.config.modelName || 'gpt-4';
  }

  /**
   * 生成AI响应
   * @param request 生成请求参数
   * @returns 生成响应
   */
  async generate(request: ModelGenerationRequest): Promise<ModelGenerationResponse> {
    this.status = 'generating';
    this.abortController = new AbortController();
    const startTime = Date.now();
    this.totalRequests++;

    // 处理超时
    const timeout = (request as any).timeout;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let timeoutPromise: Promise<never> | undefined;

    if (timeout) {
      timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          this.abortController?.abort();
          reject(new TimeoutError(
            `Request timeout after ${timeout}ms`,
            timeout,
            {
              path: this.config.baseURL || 'https://api.openai.com',
              additionalData: { timeout }
            }
          ));
        }, timeout);
      });
    }

    try {
      const generatePromise = this.generateWithRetry(request);
      const result = timeout
        ? await Promise.race([generatePromise, timeoutPromise!])
        : await generatePromise;

      const responseTime = Math.max(1, Date.now() - startTime); // 确保至少1ms
      this.responseTimes.push(responseTime);
      this.successfulRequests++;

      // 统计token使用
      if (result.usage?.totalTokens) {
        this.totalTokensUsed += result.usage.totalTokens;
      }

      return result;
    } catch (error) {
      this.failedRequests++;
      this.status = 'error';

      await this.errorHandler.handleError(error as Error, {
        operation: 'generate',
        adapter: 'OpenAIModelAdapter',
        request
      });
      throw error;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      this.abortController = null;
    }
  }

  private async generateWithRetry(request: ModelGenerationRequest): Promise<ModelGenerationResponse> {
    let lastError: Error | null = null;

    // 从request中获取重试配置，如果没有则使用实例默认值
    const maxRetries = (request as any).maxRetries ?? this.maxRetries;
    const retryDelay = (request as any).retryDelay ?? this.retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const openaiRequest = this.buildOpenAIRequest(request);
        const response = await this.callOpenAIAPI(openaiRequest);
        return this.convertOpenAIResponse(response, request);
      } catch (error) {
        lastError = error as Error;

        if (!isRetryable(error as Error) || attempt >= maxRetries) {
          break;
        }

        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * 生成AI响应（流式版本）
   * @param request 生成请求参数
   * @param onChunk 流式响应回调
   * @returns 最终的完整响应
   */
  async generateStream(
    _request: ModelGenerationRequest,
    onChunk: StreamCallback
  ): Promise<ModelGenerationResponse> {
    this.status = 'generating';
    this.abortController = new AbortController();
    const startTime = Date.now();
    this.totalRequests++;

    try {
      const result = await this.generateStreamWithRetry(_request, onChunk);

      const responseTime = Math.max(1, Date.now() - startTime); // 确保至少1ms
      this.responseTimes.push(responseTime);
      this.successfulRequests++;

      // 统计token使用
      if (result.usage?.totalTokens) {
        this.totalTokensUsed += result.usage.totalTokens;
      }

      return result;
    } catch (error) {
      this.failedRequests++;
      this.status = 'error';
      await this.errorHandler.handleError(error as Error, {
        operation: 'generateStream',
        adapter: 'OpenAIModelAdapter',
        _request
      });
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  private async generateStreamWithRetry(
    _request: ModelGenerationRequest,
    onChunk: StreamCallback
  ): Promise<ModelGenerationResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const openaiRequest = this.buildOpenAIRequest(_request, true);
        return await this.callOpenAIStreamAPI(openaiRequest, _request, onChunk);
      } catch (error) {
        lastError = error as Error;

        if (!isRetryable(error as Error) || attempt >= this.maxRetries) {
          break;
        }

        const delay = this.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * 取消当前生成任务
   */
  async cancel(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
      // 不要立即设置为null，因为processStreamResponse方法可能还在检查取消状态
      // this.abortController = null;
    }
    this.status = 'idle';
  }

  /**
   * 生成单个文本的嵌入向量
   * @param params 嵌入参数
   */
  async createEmbedding(params: { input: string; model?: string }): Promise<{ embedding: number[] }> {
    const embeddingModel = params.model || 'text-embedding-3-small';
    const url = `${this.config.endpoint || 'https://api.openai.com'}/v1/embeddings`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: embeddingModel,
          input: params.input,
        }),
      });

      if (!response.ok) {
        throw new NetworkError(`Failed to create embedding: ${response.statusText}`, { path: url });
      }

      const data = await response.json();
      return {
        embedding: data.data[0].embedding,
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * 生成多个文本的嵌入向量
   * @param params 批量嵌入参数
   */
  async createEmbeddings(params: { inputs: string[]; model?: string }): Promise<Array<{ embedding: number[] }>> {
    const embeddingModel = params.model || 'text-embedding-3-small';
    const url = `${this.config.endpoint || 'https://api.openai.com'}/v1/embeddings`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: embeddingModel,
          input: params.inputs,
        }),
      });

      if (!response.ok) {
        throw new NetworkError(`Failed to create embeddings: ${response.statusText}`, { path: url });
      }

      const data = await response.json();
      return data.data.map((item: any) => ({
        embedding: item.embedding,
      }));
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * 获取模型支持的工具类型
   */
  getSupportedTools(): string[] {
    return [...this.supportedTools];
  }

  /**
   * 检查模型是否支持指定工具
   * @param toolName 工具名称
   */
  supportsTool(toolName: string): boolean {
    return this.supportedTools.includes(toolName);
  }

  /**
   * 获取适配器状态
   */
  getStatus(): 'idle' | 'initializing' | 'generating' | 'error' {
    return this.status;
  }

  /**
   * 获取适配器配置
   */
  getConfig(): AutonomousAIConfig {
    return { ...this.config };
  }

  /**
   * 获取适配器指标
   */
  getMetrics(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    averageTokensPerRequest: number;
  } {
    const averageResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
      : 0;

    const averageTokensPerRequest = this.totalTokensUsed > 0 && this.successfulRequests > 0
      ? this.totalTokensUsed / this.successfulRequests
      : 0;

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      averageResponseTime,
      averageTokensPerRequest,
    };
  }

  /**
   * 构建OpenAI API请求
   * @param request 生成请求参数
   * @param stream 是否使用流式输出
   */
  private buildOpenAIRequest(request: ModelGenerationRequest, stream: boolean = false): any {
    const openaiMessages: Array<{ role: string; content: string; tool_calls?: any[] }> = [];

    // 添加系统提示
    if (request.messages?.find(m => m.role === 'system')) {
      openaiMessages.push(...request.messages);
    } else {
      openaiMessages.push({ role: 'system', content: 'You are a helpful AI assistant.' });
      if (request.messages) {
        openaiMessages.push(...request.messages);
      }
    }

    // 添加用户提示
    openaiMessages.push({ role: 'user', content: request.prompt });

    // 构建工具配置
    const tools = request.tools?.map(tool => this.convertToOpenAITool(tool));

    return {
      model: this.config.modelName,
      messages: openaiMessages,
      max_tokens: request.modelConfig?.maxTokens || this.config.maxTokens || 4096,
      temperature: request.modelConfig?.temperature || this.config.temperature || 0.7,
      tools: tools || [],
      tool_choice: request.forceToolUse ? 'auto' : 'none',
      stream,
    };
  }

  /**
   * 调用OpenAI流式API
   * @param request OpenAI请求参数
   * @param originalRequest 原始请求
   * @param onChunk 流式响应回调
   */
  private async callOpenAIStreamAPI(
    request: any,
    originalRequest: ModelGenerationRequest,
    onChunk: StreamCallback
  ): Promise<ModelGenerationResponse> {
    const apiKey = this.config.apiKey;
    const baseURL = this.config.baseURL || 'https://api.openai.com/v1/chat/completions';

    try {
      const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: this.abortController?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleAPIError(response, errorData, baseURL);
      }

      if (!response.body) {
        throw new InternalError('Response body is null', {
          additionalData: { baseURL }
        });
      }

      return await this.processStreamResponse(response.body, originalRequest, onChunk);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(
          `Network error connecting to OpenAI: ${error.message}`,
          {
            path: baseURL,
            additionalData: { originalError: error.message }
          },
          error as Error
        );
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError(
          `OpenAI request was cancelled`,
          this.config.timeout || 30000,
          {
            path: baseURL,
            additionalData: { reason: 'aborted' }
          }
        );
      }

      throw error;
    }
  }

  /**
   * 处理流式响应
   * @param body 响应体
   * @param request 原始请求
   * @param onChunk 流式回调函数
   */
  private async processStreamResponse(
    body: ReadableStream<Uint8Array>,
    _request: ModelGenerationRequest,
    onChunk: StreamCallback
  ): Promise<ModelGenerationResponse> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    const streamState = {
      fullContent: '',
      toolCall: null as any,
      usage: null as any,
      modelId: ''
    };

    try {
      await this.processStreamLoop(reader, decoder, streamState, onChunk);
      this.checkAbortStatus();

      onChunk({
        content: '',
        done: true,
        usage: streamState.usage ? {
          promptTokens: streamState.usage.prompt_tokens,
          completionTokens: streamState.usage.completion_tokens,
          totalTokens: streamState.usage.total_tokens
        } : undefined
      });

      this.status = 'idle';

      return {
        content: streamState.fullContent,
        toolUsed: !!streamState.toolCall,
        toolCall: streamState.toolCall
          ? {
              name: streamState.toolCall.function.name,
              params: JSON.parse(streamState.toolCall.function.arguments),
            }
          : undefined,
        usage: streamState.usage
          ? {
              promptTokens: streamState.usage.prompt_tokens,
              completionTokens: streamState.usage.completion_tokens,
              totalTokens: streamState.usage.total_tokens,
            }
          : undefined,
        timestamp: Date.now(),
        modelId: streamState.modelId,
      };
    } finally {
      reader.releaseLock();
      this.abortController = null;
    }
  }

  private async processStreamLoop(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder,
    state: { fullContent: string; toolCall: any; usage: any; modelId: string },
    onChunk: StreamCallback
  ): Promise<void> {
    while (true) {
      this.checkAbortStatus();
      const { done, value } = await reader.read();
      if (done) break;

      this.checkAbortStatus();
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        this.processStreamLine(line, state, onChunk);
      }
    }
  }

  private processStreamLine(
    line: string,
    state: { fullContent: string; toolCall: any; usage: any; modelId: string },
    onChunk: StreamCallback
  ): void {
    if (!line.startsWith('data: ')) return;

    const data = line.slice(6);
    if (data === '[DONE]') return;

    try {
      const parsed = JSON.parse(data);
      state.modelId = parsed.model || state.modelId;

      const delta = parsed.choices?.[0]?.delta;
      if (!delta) return;

      if (delta.content) {
        state.fullContent += delta.content;
        onChunk({
          content: delta.content,
          done: false
        });
      }

      if (delta.tool_calls) {
        this.updateToolCall(delta.tool_calls[0], state);
      }

      if (parsed.usage) {
        state.usage = parsed.usage;
      }
    } catch (parseError) {
      logger.warn('Failed to parse SSE data:', 'OpenAIModelAdapter', { data, parseError }, parseError as Error);
    }
  }

  private updateToolCall(
    toolCallDelta: any,
    state: { toolCall: any }
  ): void {
    if (!state.toolCall) {
      state.toolCall = {
        function: {
          name: toolCallDelta.function?.name || '',
          arguments: toolCallDelta.function?.arguments || ''
        }
      };
    } else {
      if (toolCallDelta.function?.name) {
        state.toolCall.function.name += toolCallDelta.function.name;
      }
      if (toolCallDelta.function?.arguments) {
        state.toolCall.function.arguments += toolCallDelta.function.arguments;
      }
    }
  }

  private checkAbortStatus(): void {
    if (this.abortController?.signal.aborted) {
      throw new Error('Request cancelled');
    }
  }

  /**
   * 处理API错误
   * @param response 响应对象
   * @param errorData 错误数据
   * @param baseURL API地址
   */
  private handleAPIError(response: Response, errorData: any, baseURL: string): Error {
    if (response.status === 401 || response.status === 403) {
      return new AuthenticationError(
        `OpenAI authentication failed: ${response.status} ${response.statusText} ${errorData.error?.message}`,
        {
          path: baseURL,
          additionalData: {
            status: response.status,
            statusText: response.statusText,
            errorData
          }
        }
      );
    }

    if (response.status === 408 || response.status === 504) {
      return new TimeoutError(
        `OpenAI request timeout: ${response.status} ${response.statusText}`,
        30000,
        {
          path: baseURL,
          additionalData: {
            status: response.status,
            statusText: response.statusText,
            errorData
          }
        }
      );
    }

    if (response.status === 429) {
      const errorMessage = errorData?.error?.message || 'Rate limit exceeded';
      return new NetworkError(
        errorMessage,
        {
          path: baseURL,
          additionalData: {
            status: response.status,
            statusText: response.statusText,
            errorData
          }
        }
      );
    }

    if (response.status >= 500) {
      return new NetworkError(
        `OpenAI server error: ${response.status} ${response.statusText}`,
        {
          path: baseURL,
          additionalData: {
            status: response.status,
            statusText: response.statusText,
            errorData
          }
        }
      );
    }

    return new NetworkError(
      `OpenAI API error: ${response.status} ${response.statusText} ${errorData.error?.message}`,
      {
        path: baseURL,
        additionalData: {
          status: response.status,
          statusText: response.statusText,
          errorData
        }
      }
    );
  }

  /**
   * 调用OpenAI API
   * @param request OpenAI请求参数
   */
  private async callOpenAIAPI(request: any): Promise<any> {
    const apiKey = this.config.apiKey;
    const baseURL = this.config.baseURL || 'https://api.openai.com/v1/chat/completions';

    try {
      const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: this.abortController?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError(
            `OpenAI authentication failed: ${response.status} ${response.statusText} ${errorData.error?.message}`,
            {
              path: baseURL,
              additionalData: {
                status: response.status,
                statusText: response.statusText,
                errorData
              }
            }
          );
        }

        if (response.status === 408 || response.status === 504) {
          throw new TimeoutError(
            `OpenAI request timeout: ${response.status} ${response.statusText}`,
            30000,
            {
              path: baseURL,
              additionalData: {
                status: response.status,
                statusText: response.statusText,
                errorData
              }
            }
          );
        }

        if (response.status === 429) {
          const errorMessage = errorData?.error?.message || 'Rate limit exceeded';
          throw new NetworkError(
            errorMessage,
            {
              path: baseURL,
              additionalData: {
                status: response.status,
                statusText: response.statusText,
                errorData
              }
            }
          );
        }

        if (response.status >= 500) {
          throw new NetworkError(
            `OpenAI server error: ${response.status} ${response.statusText}`,
            {
              path: baseURL,
              additionalData: {
                status: response.status,
                statusText: response.statusText,
                errorData
              }
            }
          );
        }

        throw new NetworkError(
          `OpenAI API error: ${response.status} ${response.statusText} ${errorData.error?.message}`,
          {
            path: baseURL,
            additionalData: {
              status: response.status,
              statusText: response.statusText,
              errorData
            }
          }
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(
          `Network error connecting to OpenAI: ${error.message}`,
          {
            path: baseURL,
            additionalData: { originalError: error.message }
          },
          error as Error
        );
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError(
          `OpenAI request was cancelled`,
          this.config.timeout || 30000,
          {
            path: baseURL,
            additionalData: { reason: 'aborted' }
          }
        );
      }

      throw error;
    }
  }

  /**
   * 转换OpenAI响应为统一格式
   * @param openaiResponse OpenAI API响应
   * @param request 原始请求
   */
  private convertOpenAIResponse(openaiResponse: any, _request: ModelGenerationRequest): ModelGenerationResponse {
    const message = openaiResponse?.choices?.[0]?.message || {};
    const toolCall = message.tool_calls?.[0];

    this.status = 'idle';

    return {
      content: message.content || '',
      toolUsed: !!toolCall,
      toolCall: toolCall
        ? {
            name: toolCall.function.name,
            params: JSON.parse(toolCall.function.arguments),
          }
        : undefined,
      usage: openaiResponse.usage
        ? {
            promptTokens: openaiResponse.usage.prompt_tokens,
            completionTokens: openaiResponse.usage.completion_tokens,
            totalTokens: openaiResponse.usage.total_tokens,
          }
        : undefined,
      timestamp: Date.now(),
      modelId: openaiResponse.model,
    };
  }

  /**
   * 转换工具定义为OpenAI格式
   * @param tool 工具定义
   */
  private convertToOpenAITool(tool: AITool): any {
    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    };
  }
}
