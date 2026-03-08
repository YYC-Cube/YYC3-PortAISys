---
@file: YYC3-PortAISys-缺失补全-第三章.md
@description: YYC3-PortAISys-缺失补全-第三章 文档
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: general,documentation,zh-CN
@category: general
@language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³-AILP 智能浮窗系统 - 缺失补全完整方案（第三章）

### 3.1 导师寄语 🌟

│ "不要把AI模型当作黑盒，而是要把它们当作可插拔的组件。" 模型适配器的核心价值在于：抽象与标准化。
│ 通过统一的接口，我们可以无缝切换OpenAI、Anthropic、本地模型等不同提供商，
│ 甚至可以在一次对话中动态选择最适合的模型。这就是YYC³系统智能化的基础！

### 3.2 模型适配器核心类型定义

  // 📦 src/types/model.types.ts - 模型适配器类型定义

  /**

   * ================== 基础类型定义 ==================
   */

  /**

   * 模型提供商枚举
   */
  export enum ModelProvider {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    GOOGLE = 'google',
    AZURE = 'azure',
    LOCAL = 'local',
    CUSTOM = 'custom'
  }

  /**

   * 模型类型枚举
   */
  export enum ModelType {
    // 大语言模型
    LLM = 'llm',
    CHAT_LLM = 'chat_llm',

    // 多模态模型
    MULTIMODAL = 'multimodal',
    VISION = 'vision',
    AUDIO = 'audio',

    // 专用模型
    EMBEDDING = 'embedding',
    CODE = 'code',
    TRANSLATION = 'translation',
    CLASSIFICATION = 'classification'
  }

  /**

   * 模型能力枚举
   */
  export enum ModelCapability {
    TEXT_GENERATION = 'text_generation',
    TEXT_COMPLETION = 'text_completion',
    CHAT_COMPLETION = 'chat_completion',
    STREAMING = 'streaming',
    FUNCTION_CALLING = 'function_calling',
    IMAGE_GENERATION = 'image_generation',
    VISION_UNDERSTANDING = 'vision_understanding',
    AUDIO_TRANSCRIPTION = 'audio_transcription',
    EMBEDDING = 'embedding'
  }

  /**

   * ================== 请求类型定义 ==================
   */

  /**

   * 基础请求接口
   */
  export interface BaseRequest {
    provider: ModelProvider;
    model: string;
    timeout?: number;
    metadata?: Record<string, unknown>;
  }

  /**

   * 文本补全请求
   */
  export interface CompletionRequest extends BaseRequest {
    type: ModelType.LLM;
    prompt: string;
    parameters?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      topK?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
      stopSequences?: string[];
      logitBias?: Record<number, number>;
    };
  }

  /**

   * 聊天补全请求
   */
  export interface ChatRequest extends BaseRequest {
    type: ModelType.CHAT_LLM;
    messages: ChatMessage[];
    parameters?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
      stopSequences?: string[];
      functionCall?: 'auto' | 'none' | { name: string };
      functions?: FunctionDefinition[];
    };
  }

  /**

   * 聊天消息接口
   */
  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string | MultimodalContent[];
    name?: string;
    functionCall?: {
      name: string;
      arguments: string;
    };
  }

  /**

   * 多模态内容
   */
  export interface MultimodalContent {
    type: 'text' | 'image_url' | 'audio';
    text?: string;
    imageUrl?: {
      url: string;
      detail?: 'auto' | 'low' | 'high';
    };
  }

  /**

   * 函数定义接口
   */
  export interface FunctionDefinition {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties?: Record<string, unknown>;
      required?: string[];
    };
  }

  /**

   * 向量嵌入请求
   */
  export interface EmbeddingRequest extends BaseRequest {
    type: ModelType.EMBEDDING;
    input: string | string[];
    parameters?: {
      dimensions?: number;
      model?: string;
    };
  }

  /**

   * 流式请求
   */
  export interface StreamRequest extends BaseRequest {
    stream: true;
    streamOptions?: {
      includeUsage?: boolean;
    };
  }

  /**

   * ================== 响应类型定义 ==================
   */

  /**

   * 基础响应接口
   */
  export interface BaseResponse {
    success: boolean;
    model: string;
    provider: ModelProvider;
    timestamp: Date;
    processingTime: number;
    traceId?: string;
    error?: ErrorResponse;
  }

  /**

   * 文本补全响应
   */
  export interface CompletionResponse extends BaseResponse {
    type: ModelType.LLM;
    content: string;
    finishReason: 'stop' | 'length' | 'content_filter' | 'unknown';
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    alternatives?: string[];
  }

  /**

   * 聊天补全响应
   */
  export interface ChatResponse extends BaseResponse {
    type: ModelType.CHAT_LLM;
    message: ChatMessage;
    finishReason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'unknown';
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    functionCall?: {
      name: string;
      arguments: string;
    };
  }

  /**

   * 向量嵌入响应
   */
  export interface EmbeddingResponse extends BaseResponse {
    type: ModelType.EMBEDDING;
    embeddings: number[] | number[][];
    dimensions: number;
    usage: {
      promptTokens: number;
      totalTokens: number;
    };
  }

  /**

   * 错误响应
   */
  export interface ErrorResponse {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    retryable?: boolean;
    suggestedRetryAfter?: number; // 秒
  }

  /**

   * ================== 流式类型定义 ==================
   */

  /**

   * 流式数据块
   */
  export interface StreamChunk {
    delta: {
      content?: string;
      role?: string;
      functionCall?: {
        name?: string;
        arguments?: string;
      };
    };
    finishReason?: string;
    index: number;
    isComplete: boolean;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }

  /**

   * ================== 模型信息类型 ==================
   */

  /**

   * 模型信息接口
   */
  export interface ModelInfo {
    id: string;
    name: string;
    provider: ModelProvider;
    type: ModelType;
    capabilities: ModelCapability[];
    pricing?: {
      inputPrice: number;  // 每1K tokens价格
      outputPrice: number;  // 每1K tokens价格
      currency: string;
    };
    limits?: {
      maxInputTokens: number;
      maxOutputTokens: number;
      maxRequestsPerMinute: number;
      maxTokensPerMinute: number;
    };
    version?: string;
    status: 'available' | 'deprecated' | 'experimental';
  }

  /**

   * ================== 适配器配置类型 ==================
   */

  /**

   * 模型适配器配置
   */
  export interface ModelAdapterConfig {
    provider: ModelProvider;
    apiKey?: string;
    baseURL?: string;
    model: string;
    timeout?: number;
    retryPolicy?: {
      maxRetries: number;
      backoffFactor: number;
      initialDelay: number;
    };
    cache?: {
      enabled: boolean;
      ttl: number;
      maxSize: number;
    };
    metrics?: {
      enabled: boolean;
    };
    logging?: {
      enabled: boolean;
      level: 'debug' | 'info' | 'warn' | 'error';
    };
  }

  /**

   * ================== 路由相关类型 ==================
   */

  /**

   * 路由请求
   */
  export interface RoutingRequest {
    request: CompletionRequest | ChatRequest | EmbeddingRequest;
    constraints?: {
      maxLatency?: number;        // 最大延迟（毫秒）
      maxCost?: number;           // 最大成本
      minQuality?: number;        // 最小质量（0-1）
      capabilities?: ModelCapability[];  // 必需能力
    };
    preferences?: {
      provider?: ModelProvider;
      model?: string;
    };
  }

  /**

   * 路由决策
   */
  export interface RoutingDecision {
    adapter: IModelAdapter;
    model: string;
    reason: string;
    score: number;
    estimatedLatency: number;
    estimatedCost: number;
  }

  /**

   * ================== 性能监控类型 ==================
   */

  /**

   * 模型性能指标
   */
  export interface ModelMetrics {
    requestCount: number;
    successCount: number;
    errorCount: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    totalTokens: number;
    totalCost: number;
    errorRate: number;
  }

  /**

   * ================== 工具函数 ==================
   */

  /**

   * 生成追踪ID
   */
  export function generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**

   * 计算成本
   */
  export function calculateCost(
    inputTokens: number,
    outputTokens: number,
    inputPrice: number,
    outputPrice: number
  ): number {
    return (inputTokens / 1000) * inputPrice + (outputTokens / 1000) * outputPrice;
  }

### 3.3 模型适配器抽象基类

  // 📦 src/model/BaseModelAdapter.ts - 模型适配器抽象基类
  import { logger } from '../utils/logger';
  import { metrics } from '../utils/metrics';
  import {
    IModelAdapter,
    ModelAdapterConfig,
    CompletionRequest,
    CompletionResponse,
    ChatRequest,
    ChatResponse,
    EmbeddingRequest,
    EmbeddingResponse,
    ModelInfo,
    ModelMetrics,
    ErrorResponse,
    generateTraceId,
    StreamChunk
  } from '../types/model.types';

  /**

   * 预处理后的请求
   */
  interface PreprocessedRequest {
    original: CompletionRequest | ChatRequest | EmbeddingRequest;
    normalized: unknown;
    headers: Record<string, string>;
    timeout: number;
    traceId: string;
  }

  /**

   * 原始模型响应
   */
  interface RawModelResponse {
    raw: unknown;
    normalized: unknown;
  }

  /**

   * 模型适配器抽象基类
   *
   * 设计理念：
   * 1. 模板方法模式：定义算法骨架，子类实现具体步骤
   * 2. 策略模式：不同模型有不同的调用策略
   * 3. 装饰器模式：添加缓存、重试、监控等横切关注点
   * 4. 统一接口：所有适配器实现相同的接口
   * 5. 可扩展性：易于添加新的模型提供商
   */
  export abstract class BaseModelAdapter implements IModelAdapter {
    // ============ 配置与状态 ============
    protected config: ModelAdapterConfig;
    protected modelInfo: ModelInfo;
    protected metrics: ModelMetrics;
    protected isInitialized: boolean = false;

    // ============ 性能统计 ============
    private latencyHistory: number[] = [];

    constructor(config: ModelAdapterConfig, modelInfo: ModelInfo) {
      this.config = config;
      this.modelInfo = modelInfo;
      this.metrics = {
        requestCount: 0,
        successCount: 0,
        errorCount: 0,
        averageLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        totalTokens: 0,
        totalCost: 0,
        errorRate: 0
      };

      logger.info('模型适配器创建', 'BaseModelAdapter', {
        provider: config.provider,
        model: config.model
      });
    }

    // ================= 模型管理 =================

    getModelInfo(): ModelInfo {
      return this.modelInfo;
    }

    async isAvailable(): Promise<boolean> {
      try {
        // 简单的健康检查
        await this.healthCheck();
        return true;
      } catch (error) {
        logger.warn('模型不可用', 'BaseModelAdapter', {
          provider: this.config.provider,
          model: this.config.model,
          error
        });
        return false;
      }
    }

    async healthCheck(): Promise<{ status: string; latency?: number; message?: string }> {
      const startTime = Date.now();

      try {
        // 子类实现具体的健康检查逻辑
        await this.performHealthCheck();

        const latency = Date.now() - startTime;

        return {
          status: 'healthy',
          latency,
          message: `${this.config.provider} ${this.config.model} is healthy`
        };
      } catch (error) {
        const latency = Date.now() - startTime;

        return {
          status: 'unhealthy',
          latency,
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // ================= 核心推理方法 =================

    /**
     * 文本补全（模板方法）
     */
    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
      const startTime = Date.now();
      const traceId = generateTraceId();

      logger.debug('开始文本补全', 'BaseModelAdapter', {
        model: this.config.model,
        prompt: request.prompt.substring(0, 100) + '...',
        traceId
      });

      try {
        // 1. 更新指标
        this.metrics.requestCount++;

        // 2. 预处理请求
        const preprocessed = await this.preprocessRequest(request, traceId);

        // 3. 检查缓存
        const cached = await this.checkCache(preprocessed);
        if (cached) {
          logger.debug('命中缓存', 'BaseModelAdapter', { traceId });
          metrics.increment('model_adapter.cache_hit');
          return cached;
        }

        // 4. 调用模型API（抽象方法，由子类实现）
        const rawResponse = await this.callModelAPI(preprocessed);

        // 5. 后处理响应
        const processed = await this.postprocessResponse(rawResponse, request);

        // 6. 缓存结果
        await this.cacheResult(preprocessed, processed);

        // 7. 更新性能指标
        const processingTime = Date.now() - startTime;
        this.updateMetrics(processingTime, processed.usage.totalTokens, true);

        // 8. 记录监控指标
        metrics.increment('model_adapter.completion_success');
        metrics.histogram('model_adapter.completion_latency', processingTime);
        metrics.histogram('model_adapter.tokens_used', processed.usage.totalTokens);

        logger.debug('文本补全完成', 'BaseModelAdapter', {
          processingTime,
          tokens: processed.usage.totalTokens,
          traceId
        });

        return processed;
      } catch (error) {
        // 错误处理
        const processingTime = Date.now() - startTime;
        this.updateMetrics(processingTime, 0, false);

        logger.error('文本补全失败', 'BaseModelAdapter', {
          error,
          processingTime,
          traceId
        });

        metrics.increment('model_adapter.completion_failed');

        // 尝试错误恢复
        return await this.handleError(error, request, traceId);
      }
    }

    /**
     * 聊天补全（模板方法）
     */
    async generateChatCompletion(request: ChatRequest): Promise<ChatResponse> {
      const startTime = Date.now();
      const traceId = generateTraceId();

      logger.debug('开始聊天补全', 'BaseModelAdapter', {
        model: this.config.model,
        messageCount: request.messages.length,
        traceId
      });

      try {
        // 1. 更新指标
        this.metrics.requestCount++;

        // 2. 预处理请求
        const preprocessed = await this.preprocessRequest(request, traceId);

        // 3. 检查缓存
        const cached = await this.checkCache(preprocessed);
        if (cached) {
          logger.debug('命中缓存', 'BaseModelAdapter', { traceId });
          metrics.increment('model_adapter.cache_hit');
          return cached;
        }

        // 4. 调用模型API
        const rawResponse = await this.callModelAPI(preprocessed);

        // 5. 后处理响应
        const processed = await this.postprocessResponse(rawResponse, request);

        // 6. 缓存结果
        await this.cacheResult(preprocessed, processed);

        // 7. 更新性能指标
        const processingTime = Date.now() - startTime;
        this.updateMetrics(processingTime, processed.usage.totalTokens, true);

        // 8. 记录监控指标
        metrics.increment('model_adapter.chat_success');
        metrics.histogram('model_adapter.chat_latency', processingTime);
        metrics.histogram('model_adapter.tokens_used', processed.usage.totalTokens);

        logger.debug('聊天补全完成', 'BaseModelAdapter', {
          processingTime,
          tokens: processed.usage.totalTokens,
          traceId
        });

        return processed;
      } catch (error) {
        // 错误处理
        const processingTime = Date.now() - startTime;
        this.updateMetrics(processingTime, 0, false);

        logger.error('聊天补全失败', 'BaseModelAdapter', {
          error,
          processingTime,
          traceId
        });

        metrics.increment('model_adapter.chat_failed');

        return await this.handleError(error, request, traceId);
      }
    }

    /**
     * 生成向量嵌入
     */
    async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
      const startTime = Date.now();
      const traceId = generateTraceId();

      logger.debug('开始生成向量嵌入', 'BaseModelAdapter', {
        model: this.config.model,
        input: Array.isArray(request.input) ? `${request.input.length} items` : request.input.substring(0, 100),
        traceId
      });

      try {
        this.metrics.requestCount++;

        const preprocessed = await this.preprocessRequest(request, traceId);
        const cached = await this.checkCache(preprocessed);

        if (cached) {
          return cached;
        }

        const rawResponse = await this.callModelAPI(preprocessed);
        const processed = await this.postprocessResponse(rawResponse, request);
        await this.cacheResult(preprocessed, processed);

        const processingTime = Date.now() - startTime;
        this.updateMetrics(processingTime, processed.usage.totalTokens, true);

        return processed;
      } catch (error) {
        const processingTime = Date.now() - startTime;
        this.updateMetrics(processingTime, 0, false);

        logger.error('生成向量嵌入失败', 'BaseModelAdapter', { error, processingTime });

        throw error;
      }
    }

    // ================= 流式处理方法 =================

    /**
     * 流式文本补全
     */
    async *streamCompletion(request: CompletionRequest): AsyncIterable<StreamChunk> {
      const traceId = generateTraceId();
      let buffer = '';
      let tokenCount = 0;

      logger.debug('开始流式文本补全', 'BaseModelAdapter', {
        model: this.config.model,
        traceId
      });

      try {
        this.metrics.requestCount++;

        const preprocessed = await this.preprocessRequest(request, traceId);
        const stream = await this.callModelStream(preprocessed);

        for await (const chunk of stream) {
          const parsed = this.parseStreamChunk(chunk);
          tokenCount += parsed.tokens || 0;
          buffer += parsed.text || '';

          const streamChunk: StreamChunk = {
            delta: {
              content: parsed.text
            },
            finishReason: parsed.finishedReason,
            index: parsed.index || 0,
            isComplete: parsed.finished || false
          };

          yield streamChunk;

          if (parsed.finished) {
            // 完成时的最终chunk
            yield {
              delta: {},
              finishReason: parsed.finishedReason,
              index: parsed.index || 0,
              isComplete: true,
              usage: {
                promptTokens: tokenCount, // 简化处理
                completionTokens: tokenCount,
                totalTokens: tokenCount * 2
              }
            };
            break;
          }
        }
      } catch (error) {
        logger.error('流式文本补全失败', 'BaseModelAdapter', { error, traceId });
        throw error;
      }
    }

    // ================= 批量处理方法 =================

    /**
     * 批量文本补全
     */
    async batchComplete(requests: CompletionRequest[]): Promise<CompletionResponse[]> {
      logger.debug('开始批量文本补全', 'BaseModelAdapter', {
        count: requests.length
      });

      const results = await Promise.allSettled(
        requests.map(request => this.generateCompletion(request))
      );

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          // 返回错误响应
          return {
            success: false,
            model: this.config.model,
            provider: this.config.provider,
            timestamp: new Date(),
            processingTime: 0,
            content: '',
            finishReason: 'unknown',
            usage: {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0
            },
            error: {
              code: 'BATCH_ERROR',
              message: result.reason instanceof Error ? result.reason.message : 'Unknown error'
            }
          };
        }
      });
    }

    // ================= 模型配置方法 =================

    async updateConfig(config: Partial<ModelAdapterConfig>): Promise<void> {
      logger.info('更新模型适配器配置', 'BaseModelAdapter', {
        provider: this.config.provider,
        model: this.config.model,
        updates: Object.keys(config)
      });

      this.config = { ...this.config, ...config };

      // 如果需要重新初始化
      if (!this.isInitialized) {
        await this.initialize();
      }
    }

    getConfig(): ModelAdapterConfig {
      return { ...this.config };
    }

    // ================= 性能优化方法 =================

    async warmup(): Promise<void> {
      logger.info('模型预热中...', 'BaseModelAdapter', {
        provider: this.config.provider,
        model: this.config.model
      });

      try {
        // 发送一个简单的请求进行预热
        await this.generateCompletion({
          provider: this.config.provider,
          model: this.config.model,
          type: 'llm' as any,
          prompt: 'Hello'
        });

        logger.info('模型预热完成', 'BaseModelAdapter');
      } catch (error) {
        logger.warn('模型预热失败', 'BaseModelAdapter', { error });
        // 不抛出错误，预热失败不应影响后续使用
      }
    }

    async clearCache(): Promise<void> {
      // 由子类实现
      logger.info('清除缓存', 'BaseModelAdapter');
    }

    async optimizeFor(batchSize: number): Promise<void> {
      logger.info('优化模型适配器', 'BaseModelAdapter', { batchSize });
      // 由子类实现特定优化
    }

    // ================= 性能指标方法 =================

    getMetrics(): ModelMetrics {
      return { ...this.metrics };
    }

    // ================= 抽象方法（由子类实现）=================

    /**
     * 初始化适配器
     */
    abstract initialize(): Promise<void>;

    /**
     * 调用模型API
     */
    protected abstract callModelAPI(request: PreprocessedRequest): Promise<RawModelResponse>;

    /**
     * 调用模型流式API
     */
    protected abstract callModelStream(request: PreprocessedRequest): AsyncIterable<unknown>;

    /**
     * 解析流式数据块
     */
    protected abstract parseStreamChunk(chunk: unknown): {
      text?: string;
      tokens?: number;
      finished?: boolean;
      finishedReason?: string;
      index?: number;
    };

    /**
     * 执行健康检查
     */
    protected abstract performHealthCheck(): Promise<void>;

    // ================= 保护方法（供子类使用）=================

    /**
     * 预处理请求
     */
    protected async preprocessRequest(
      request: CompletionRequest | ChatRequest | EmbeddingRequest,
      traceId: string
    ): Promise<PreprocessedRequest> {
      // 1. 验证请求
      await this.validateRequest(request);

      // 2. 标准化请求
      const normalized = this.normalizeRequest(request);

      // 3. 构建请求头
      const headers = this.buildHeaders();

      return {
        original: request,
        normalized,
        headers,
        timeout: this.config.timeout || 30000,
        traceId
      };
    }

    /**
     * 后处理响应
     */
    protected async postprocessResponse(
      rawResponse: RawModelResponse,
      originalRequest: CompletionRequest | ChatRequest | EmbeddingRequest
    ): Promise<CompletionResponse | ChatResponse | EmbeddingResponse> {
      // 子类可以覆盖此方法实现特定的后处理逻辑
      return rawResponse.normalized as any;
    }

    /**
     * 检查缓存
     */
    protected async checkCache(request: PreprocessedRequest): Promise<CompletionResponse | ChatResponse |
EmbeddingResponse | null> {
      if (!this.config.cache?.enabled) {
        return null;
      }

      const cacheKey = this.generateCacheKey(request);
      logger.debug('检查缓存', 'BaseModelAdapter', { cacheKey });

      // 由子类实现具体的缓存逻辑
      // 这里返回null表示未命中
      return null;
    }

    /**
     * 缓存结果
     */
    protected async cacheResult(
      request: PreprocessedRequest,
      response: CompletionResponse | ChatResponse | EmbeddingResponse
    ): Promise<void> {
      if (!this.config.cache?.enabled) {
        return;
      }

      const cacheKey = this.generateCacheKey(request);
      logger.debug('缓存结果', 'BaseModelAdapter', { cacheKey });

      // 由子类实现具体的缓存逻辑
    }

    /**
     * 错误处理
     */
    protected async handleError(
      error: unknown,
      originalRequest: CompletionRequest | ChatRequest | EmbeddingRequest,
      traceId: string
    ): Promise<CompletionResponse | ChatResponse | EmbeddingResponse> {
      const errorResponse: ErrorResponse = {
        code: 'MODEL_ADAPTER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        retryable: false
      };

      // 尝试错误分类
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          errorResponse.code = 'TIMEOUT_ERROR';
          errorResponse.retryable = true;
          errorResponse.suggestedRetryAfter = 5;
        } else if (error.message.includes('rate limit')) {
          errorResponse.code = 'RATE_LIMIT_ERROR';
          errorResponse.retryable = true;
          errorResponse.suggestedRetryAfter = 60;
        }
      }

      // 返回错误响应
      return {
        success: false,
        model: this.config.model,
        provider: this.config.provider,
        timestamp: new Date(),
        processingTime: 0,
        content: '',
        finishReason: 'unknown',
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        error: errorResponse
      } as any;
    }

    // ================= 私有方法 =================

    /**
     * 验证请求
     */
    private async validateRequest(request: CompletionRequest | ChatRequest | EmbeddingRequest): Promise<void> {
      if (!request.model) {
        throw new Error('Model is required');
      }

      // 验证输入长度
      const maxLength = this.modelInfo.limits?.maxInputTokens || 4096;
      const inputLength = this.calculateInputLength(request);

      if (inputLength > maxLength) {
        logger.warn('输入超过最大长度', 'BaseModelAdapter', {
          inputLength,
          maxLength
        });
        throw new Error(`Input exceeds maximum length: ${inputLength} > ${maxLength}`);
      }
    }

    /**
     * 标准化请求
     */
    private normalizeRequest(request: CompletionRequest | ChatRequest | EmbeddingRequest): unknown {
      // 子类可以覆盖此方法实现特定的标准化逻辑
      return request;
    }

    /**
     * 构建请求头
     */
    private buildHeaders(): Record<string, string> {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'YYC3-PortAISys-Intelligent-Widget/1.0.0'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      return headers;
    }

    /**
     * 生成缓存键
     */
    private generateCacheKey(request: PreprocessedRequest): string {
      // 简单的缓存键生成，子类可以优化
      return `${this.config.provider}-${this.config.model}-${JSON.stringify(request.normalized)}`;
    }

    /**
     * 计算输入长度
     */
    private calculateInputLength(request: CompletionRequest | ChatRequest | EmbeddingRequest): number {
      // 简化的长度计算，实际应该使用tokenizer
      if ('prompt' in request) {
        return request.prompt.length;
      } else if ('messages' in request) {
        return JSON.stringify(request.messages).length;
      } else if ('input' in request) {
        return JSON.stringify(request.input).length;
      }
      return 0;
    }

    /**
     * 更新性能指标
     */
    private updateMetrics(latency: number, tokens: number, success: boolean): void {
      // 更新延迟历史
      this.latencyHistory.push(latency);
      if (this.latencyHistory.length > 100) {
        this.latencyHistory.shift();
      }

      // 计算平均延迟
      this.metrics.averageLatency =
        this.latencyHistory.reduce((sum, l) => sum + l, 0) / this.latencyHistory.length;

      // 计算P95和P99延迟
      const sorted = [...this.latencyHistory].sort((a, b) => a - b);
      this.metrics.p95Latency = sorted[Math.floor(sorted.length * 0.95)] || 0;
      this.metrics.p99Latency = sorted[Math.floor(sorted.length * 0.99)] || 0;

      // 更新token统计
      this.metrics.totalTokens += tokens;

      // 更新成功/失败统计
      if (success) {
        this.metrics.successCount++;
      } else {
        this.metrics.errorCount++;
      }

      // 计算错误率
      this.metrics.errorRate =
        this.metrics.errorCount / (this.metrics.successCount + this.metrics.errorCount);

      // 计算成本
      if (this.modelInfo.pricing) {
        const cost = (tokens / 1000) * this.modelInfo.pricing.inputPrice;
        this.metrics.totalCost += cost;
      }
    }
  }

  // ============ 接口定义 ============

  /**

   * 模型适配器接口
   */
  export interface IModelAdapter {
    // ============ 模型管理 ============
    getModelInfo(): ModelInfo;
    isAvailable(): Promise<boolean>;
    healthCheck(): Promise<{ status: string; latency?: number; message?: string }>;

    // ============ 核心推理 ============
    generateCompletion(request: CompletionRequest): Promise<CompletionResponse>;
    generateChatCompletion(request: ChatRequest): Promise<ChatResponse>;
    generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse>;

    // ============ 流式处理 ============
    streamCompletion(request: CompletionRequest): AsyncIterable<StreamChunk>;
    streamChat?(request: ChatRequest): AsyncIterable<StreamChunk>;

    // ============ 批量处理 ============
    batchComplete(requests: CompletionRequest[]): Promise<CompletionResponse[]>;

    // ============ 模型配置 ============
    updateConfig(config: Partial<ModelAdapterConfig>): Promise<void>;
    getConfig(): ModelAdapterConfig;

    // ============ 性能优化 ============
    warmup(): Promise<void>;
    clearCache(): Promise<void>;
    optimizeFor(batchSize: number): Promise<void>;

    // ============ 性能指标 ============
    getMetrics(): ModelMetrics;
  }

### 3.4 OpenAI适配器实现

  // 📦 src/model/OpenAIAdapter.ts - OpenAI适配器实现
  import { BaseModelAdapter, IModelAdapter, PreprocessedRequest, RawModelResponse } from './BaseModelAdapter';
  import { logger } from '../utils/logger';
  import { metrics } from '../utils/metrics';
  import {
    ModelAdapterConfig,
    ModelInfo,
    CompletionRequest,
    CompletionResponse,
    ChatRequest,
    ChatResponse,
    EmbeddingRequest,
    EmbeddingResponse,
    ModelProvider,
    StreamChunk
  } from '../types/model.types';

  /**

   * OpenAI客户端模拟
   * 实际项目中应该使用 @anthropic-ai/sdk 或 axios
   */
  class OpenAIClient {
    private apiKey: string;
    private baseURL: string;

    constructor(apiKey: string, baseURL?: string) {
      this.apiKey = apiKey;
      this.baseURL = baseURL || 'https://api.openai.com/v1';
    }

    async createCompletion(
      model: string,
      prompt: string,
      options: Record<string, unknown> = {}
    ): Promise<unknown> {
      logger.debug('OpenAI创建补全', 'OpenAIClient', {
        model,
        prompt: prompt.substring(0, 100)
      });

      // 模拟API调用
      // 实际实现中应该使用 fetch 或 axios 调用 OpenAI API
      return {
        id: 'cmpl-' + Date.now(),
        object: 'text_completion',
        created: Date.now(),
        model,
        choices: [
          {
            index: 0,
            text: 'This is a simulated OpenAI response. In production, this would be the actual API response.',
            logprobs: null,
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: Math.ceil(prompt.length / 4),
          completion_tokens: 20,
          total_tokens: Math.ceil(prompt.length / 4) + 20
        }
      };
    }

    async createChatCompletion(
      model: string,
      messages: unknown[],
      options: Record<string, unknown> = {}
    ): Promise<unknown> {
      logger.debug('OpenAI创建聊天补全', 'OpenAIClient', {
        model,
        messageCount: messages.length
      });

      // 模拟API调用
      return {
        id: 'chatcmpl-' + Date.now(),
        object: 'chat.completion',
        created: Date.now(),
        model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'This is a simulated OpenAI chat response. In production, this would be the actual API
response.'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 20,
          total_tokens: 70
        }
      };
    }

    async createEmbedding(
      model: string,
      input: string | string[],
      options: Record<string, unknown> = {}
    ): Promise<unknown> {
      logger.debug('OpenAI创建向量嵌入', 'OpenAIClient', {
        model,
        input: Array.isArray(input) ? `${input.length} items` : input.substring(0, 100)
      });

      // 模拟向量嵌入
      const dimensions = 1536;
      const embeddings: number[][] = [];

      const inputs = Array.isArray(input) ? input : [input];
      for (const _ of inputs) {
        const embedding = Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
        embeddings.push(embedding);
      }

      return {
        object: 'list',
        data: embeddings.map((emb, idx) => ({
          object: 'embedding',
          embedding: emb,
          index: idx
        })),
        model,
        usage: {
          prompt_tokens: inputs.length * 10,
          total_tokens: inputs.length * 10
        }
      };
    }

    async *createCompletionStream(
      model: string,
      prompt: string,
      options: Record<string, unknown> = {}
    ): AsyncIterable<unknown> {
      logger.debug('OpenAI创建流式补全', 'OpenAIClient', {
        model,
        prompt: prompt.substring(0, 100)
      });

      // 模拟流式响应
      const chunks = ['This ', 'is ', 'a ', 'streamed ', 'response.'];

      for (let i = 0; i < chunks.length; i++) {
        yield {
          id: 'cmpl-' + Date.now(),
          object: 'text_completion',
          created: Date.now(),
          model,
          choices: [
            {
              index: 0,
              delta: { content: chunks[i] },
              finish_reason: i === chunks.length - 1 ? 'stop' : null
            }
          ]
        };

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**

   * OpenAI适配器配置
   */
  export interface OpenAIAdapterConfig extends ModelAdapterConfig {
    provider: ModelProvider.OPENAI;
    apiKey: string;
    baseURL?: string;
    organization?: string;
  }

  /**

   * OpenAI适配器实现
   *
   * 设计理念：
   * 1. 完全兼容OpenAI API规范
   * 2. 支持流式和非流式调用
   * 3. 自动重试和错误恢复
   * 4. 完善的日志和监控
   * 5. 支持自定义请求头和组织ID
   */
  export class OpenAIAdapter extends BaseModelAdapter implements IModelAdapter {
    private client: OpenAIClient;
    private rateLimiter: Map<string, { count: number; resetTime: number }>;
    private retryCount: number = 0;

    constructor(config: OpenAIAdapterConfig, modelInfo: ModelInfo) {
      super(config, modelInfo);

      if (!config.apiKey) {
        throw new Error('OpenAI API key is required');
      }

      this.client = new OpenAIClient(config.apiKey, config.baseURL);
      this.rateLimiter = new Map();

      logger.info('OpenAI适配器创建', 'OpenAIAdapter', {
        model: config.model,
        baseURL: config.baseURL
      });
    }

    // ================= 生命周期方法 =================

    async initialize(): Promise<void> {
      logger.info('初始化OpenAI适配器', 'OpenAIAdapter');

      try {
        // 验证API密钥
        await this.validateAPIKey();

        // 预热模型
        if (this.config.logging?.enabled) {
          await this.warmup();
        }

        this.isInitialized = true;
        logger.info('OpenAI适配器初始化成功', 'OpenAIAdapter');
      } catch (error) {
        logger.error('OpenAI适配器初始化失败', 'OpenAIAdapter', { error });
        throw error;
      }
    }

    // ================= 抽象方法实现 =================

    /**
     * 调用OpenAI文本补全API
     */
    protected async callModelAPI(request: PreprocessedRequest): Promise<RawModelResponse> {
      const startTime = Date.now();

      try {
        // 应用速率限制
        await this.applyRateLimit();

        const original = request.original as CompletionRequest | ChatRequest | EmbeddingRequest;
        const response = await this.callOpenAIAPI(original, request.timeout || 30000);

        const processingTime = Date.now() - startTime;

        logger.debug('OpenAI API调用成功', 'OpenAIAdapter', {
          processingTime,
          traceId: request.traceId
        });

        // 重置重试计数
        this.retryCount = 0;

        return {
          raw: response,
          normalized: this.normalizeOpenAIResponse(response, original)
        };
      } catch (error) {
        const processingTime = Date.now() - startTime;

        logger.error('OpenAI API调用失败', 'OpenAIAdapter', {
          error,
          processingTime,
          retryCount: this.retryCount,
          traceId: request.traceId
        });

        // 尝试重试
        if (this.shouldRetry(error as Error) && this.retryCount < (this.config.retryPolicy?.maxRetries || 3)) {
          this.retryCount++;
          const delay = this.calculateRetryDelay(this.retryCount);

          logger.warn('重试OpenAI API调用', 'OpenAIAdapter', {
            retryCount: this.retryCount,
            delay
          });

          await new Promise(resolve => setTimeout(resolve, delay));
          return this.callModelAPI(request);
        }

        throw error;
      }
    }

    /**
     * 调用OpenAI流式API
     */
    protected async *callModelStream(request: PreprocessedRequest): AsyncIterable<unknown> {
      try {
        await this.applyRateLimit();

        const original = request.original as CompletionRequest;
        const stream = this.client.createCompletionStream(
          original.model,
          original.prompt,
          {
            max_tokens: original.parameters?.maxTokens,
            temperature: original.parameters?.temperature,
            top_p: original.parameters?.topP
          }
        );

        for await (const chunk of stream) {
          yield chunk;
        }
      } catch (error) {
        logger.error('OpenAI流式API调用失败', 'OpenAIAdapter', { error });
        throw error;
      }
    }

    /**
     * 解析流式数据块
     */
    protected parseStreamChunk(chunk: unknown): {
      text?: string;
      tokens?: number;
      finished?: boolean;
      finishedReason?: string;
      index?: number;
    } {
      const data = chunk as any;

      if (data.choices?.[0]) {
        const choice = data.choices[0];
        const text = choice.delta?.content || '';
        const finished = choice.finish_reason !== null;

        return {
          text,
          tokens: text.length, // 简化的token计算
          finished,
          finishedReason: choice.finish_reason || undefined,
          index: choice.index || 0
        };
      }

      return { text: '', tokens: 0, finished: false, index: 0 };
    }

    /**
     * 执行健康检查
     */
    protected async performHealthCheck(): Promise<void> {
      try {
        // 发送一个简单的请求验证连接
        await this.client.createCompletion(
          this.config.model,
          'test',
          { max_tokens: 1 }
        );

        logger.info('OpenAI健康检查通过', 'OpenAIAdapter');
      } catch (error) {
        logger.error('OpenAI健康检查失败', 'OpenAIAdapter', { error });
        throw error;
      }
    }

    // ================= 私有辅助方法 =================

    /**
     * 调用OpenAI API（根据请求类型选择对应的API）
     */
    private async callOpenAIAPI(
      request: CompletionRequest | ChatRequest | EmbeddingRequest,
      timeout: number
    ): Promise<unknown> {
      if ('prompt' in request) {
        // 文本补全
        return await this.client.createCompletion(
          request.model,
          request.prompt,
          {
            max_tokens: request.parameters?.maxTokens,
            temperature: request.parameters?.temperature,
            top_p: request.parameters?.topP,
            stop: request.parameters?.stopSequences
          }
        );
      } else if ('messages' in request) {
        // 聊天补全
        return await this.client.createChatCompletion(
          request.model,
          request.messages,
          {
            max_tokens: request.parameters?.maxTokens,
            temperature: request.parameters?.temperature,
            top_p: request.parameters?.topP,
            stop: request.parameters?.stopSequences,
            functions: request.parameters?.functions,
            function_call: request.parameters?.functionCall
          }
        );
      } else if ('input' in request) {
        // 向量嵌入
        return await this.client.createEmbedding(
          request.model,
          request.input,
          {
            dimensions: request.parameters?.dimensions
          }
        );
      }

      throw new Error('Unknown request type');
    }

    /**
     * 标准化OpenAI响应
     */
    private normalizeOpenAIResponse(
      response: any,
      originalRequest: CompletionRequest | ChatRequest | EmbeddingRequest
    ): CompletionResponse | ChatResponse | EmbeddingResponse {
      if (response.choices?.[0]?.message) {
        // 聊天补全响应
        const choice = response.choices[0];
        return {
          success: true,
          model: response.model,
          provider: ModelProvider.OPENAI,
          timestamp: new Date(),
          processingTime: 0,
          type: 'chat_llm' as any,
          message: choice.message,
          finishReason: choice.finish_reason,
          usage: {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens
          }
        };
      } else if (response.choices?.[0]?.text) {
        // 文本补全响应
        const choice = response.choices[0];
        return {
          success: true,
          model: response.model,
          provider: ModelProvider.OPENAI,
          timestamp: new Date(),
          processingTime: 0,
          type: 'llm' as any,
          content: choice.text,
          finishReason: choice.finish_reason,
          usage: {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens
          },
          alternatives: response.choices.slice(1).map((c: any) => c.text)
        };
      } else if (response.data?.[0]?.embedding) {
        // 向量嵌入响应
        return {
          success: true,
          model: response.model,
          provider: ModelProvider.OPENAI,
          timestamp: new Date(),
          processingTime: 0,
          type: 'embedding' as any,
          embeddings: response.data.map((d: any) => d.embedding),
          dimensions: response.data[0].embedding.length,
          usage: {
            promptTokens: response.usage.prompt_tokens,
            totalTokens: response.usage.total_tokens
          }
        };
      }

      throw new Error('Unknown response type');
    }

    /**
     * 验证API密钥
     */
    private async validateAPIKey(): Promise<void> {
      // 简化的验证，实际应该调用一个轻量级的API endpoint
      if (!this.config.apiKey || this.config.apiKey.length < 10) {
        throw new Error('Invalid OpenAI API key');
      }

      logger.info('OpenAI API密钥验证通过', 'OpenAIAdapter');
    }

    /**
     * 应用速率限制
     */
    private async applyRateLimit(): Promise<void> {
      const now = Date.now();
      const key = this.config.apiKey;
      const windowSize = 60000; // 1分钟窗口
      const maxRequests = this.modelInfo.limits?.maxRequestsPerMinute || 3000;

      const rateInfo = this.rateLimiter.get(key);

      if (rateInfo) {
        if (now < rateInfo.resetTime) {
          // 在同一个时间窗口内
          if (rateInfo.count >= maxRequests) {
            // 超过速率限制
            const waitTime = rateInfo.resetTime - now;
            logger.warn('达到OpenAI速率限制，等待...', 'OpenAIAdapter', {
              waitTime: waitTime / 1000
            });

            await new Promise(resolve => setTimeout(resolve, waitTime));

            // 重置计数
            rateInfo.count = 0;
            rateInfo.resetTime = now + windowSize;
          }
        } else {
          // 时间窗口已过，重置
          rateInfo.count = 0;
          rateInfo.resetTime = now + windowSize;
        }
      } else {
        // 初始化速率限制器
        this.rateLimiter.set(key, {
          count: 0,
          resetTime: now + windowSize
        });
      }

      // 增加计数
      const currentRateInfo = this.rateLimiter.get(key)!;
      currentRateInfo.count++;

      metrics.gauge('openai.rate_limit_usage', currentRateInfo.count / maxRequests);
    }

    /**
     * 判断是否应该重试
     */
    private shouldRetry(error: Error): boolean {
      const retryableErrors = [
        'timeout',
        'ETIMEDOUT',
        'ECONNRESET',
        'rate limit',
        '429',
        '500',
        '502',
        '503',
        '504'
      ];

      return retryableErrors.some(code =>
        error.message.toLowerCase().includes(code.toLowerCase())
      );
    }

    /**
     * 计算重试延迟（指数退避）
     */
    private calculateRetryDelay(retryCount: number): number {
      const backoffFactor = this.config.retryPolicy?.backoffFactor || 2;
      const initialDelay = this.config.retryPolicy?.initialDelay || 1000;
      return Math.min(initialDelay * Math.pow(backoffFactor, retryCount - 1), 60000);
    }
  }

  // ============ 导出 ============

  export default OpenAIAdapter;

### 3.5 本地模型适配器实现

  // 📦 src/model/LocalModelAdapter.ts - 本地模型适配器实现
  import { BaseModelAdapter, IModelAdapter, PreprocessedRequest, RawModelResponse } from './BaseModelAdapter';
  import { logger } from '../utils/logger';
  import { metrics } from '../utils/metrics';
  import {
    ModelAdapterConfig,
    ModelInfo,
    CompletionRequest,
    CompletionResponse,
    ModelProvider,
    StreamChunk
  } from '../types/model.types';

  /**

   * 本地模型适配器配置
   */
  export interface LocalModelAdapterConfig extends ModelAdapterConfig {
    provider: ModelProvider.LOCAL;
    modelPath: string;
    engine?: 'llama-cpp' | 'transformers' | 'tensorrt';
    quantization?: 'int8' | 'int4' | 'fp16' | 'fp32';
    threads?: number;
    contextLength?: number;
    gpuLayers?: number;
    useGPU?: boolean;
  }

  /**

   * 模拟的本地模型推理引擎
   * 实际项目中应该集成 llama.cpp、Transformers、TensorRT 等
   */
  class LocalInferenceEngine {
    private modelPath: string;
    private engine: string;
    private quantization: string;
    private threads: number;
    private contextLength: number;
    private useGPU: boolean;
    private gpuLayers: number;

    constructor(config: LocalModelAdapterConfig) {
      this.modelPath = config.modelPath;
      this.engine = config.engine || 'llama-cpp';
      this.quantization = config.quantization || 'int8';
      this.threads = config.threads || 4;
      this.contextLength = config.contextLength || 2048;
      this.useGPU = config.useGPU || false;
      this.gpuLayers = config.gpuLayers || 0;

      logger.info('本地推理引擎初始化', 'LocalInferenceEngine', {
        modelPath: this.modelPath,
        engine: this.engine,
        quantization: this.quantization,
        threads: this.threads,
        useGPU: this.useGPU
      });
    }

    async loadModel(): Promise<void> {
      logger.info('加载本地模型...', 'LocalInferenceEngine', {
        modelPath: this.modelPath
      });

      // 模拟模型加载
      // 实际实现中应该加载 llama.cpp、Transformers 模型
      await new Promise(resolve => setTimeout(resolve, 1000));

      logger.info('本地模型加载完成', 'LocalInferenceEngine');
    }

    async generate(
      prompt: string,
      options: {
        maxTokens?: number;
        temperature?: number;
        topP?: number;
      } = {}
    ): Promise<{
      text: string;
      tokens: number;
      inferenceTime: number;
    }> {
      const startTime = Date.now();

      logger.debug('本地模型推理', 'LocalInferenceEngine', {
        prompt: prompt.substring(0, 100),
        options
      });

      // 模拟推理过程
      // 实际实现中应该调用 llama.cpp、Transformers 的生成方法
      await new Promise(resolve => setTimeout(resolve, 500));

      const inferenceTime = Date.now() - startTime;
      const text = 'This is a simulated local model response. In production, this would be the actual inference result
from your local model.';
      const tokens = Math.ceil(text.length / 4); // 简化的token计算

      return {
        text,
        tokens,
        inferenceTime
      };
    }

    async *generateStream(
      prompt: string,
      options: {
        maxTokens?: number;
        temperature?: number;
        topP?: number;
      } = {}
    ): AsyncIterable<{
      text: string;
      tokens: number;
      finished: boolean;
      finishReason?: string;
    }> {
      logger.debug('本地模型流式推理', 'LocalInferenceEngine', {
        prompt: prompt.substring(0, 100),
        options
      });

      // 模拟流式推理
      const chunks = ['This ', 'is ', 'a ', 'streamed ', 'local ', 'response.'];

      for (let i = 0; i < chunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));

        yield {
          text: chunks[i],
          tokens: chunks[i].length,
          finished: false
        };
      }

      yield {
        text: '',
        tokens: 0,
        finished: true,
        finishReason: 'stop'
      };
    }

    async unloadModel(): Promise<void> {
      logger.info('卸载本地模型', 'LocalInferenceEngine');
      // 释放资源
    }
  }

  /**

   * 本地模型适配器实现
   *
   * 设计理念：
   * 1. 支持多种推理引擎（llama.cpp、Transformers、TensorRT）
   * 2. 优化性能：多线程、GPU加速、量化
   * 3. 内存管理：及时释放资源
   * 4. 离线能力：完全本地运行，不依赖网络
   * 5. 成本优势：零API调用成本
   */
  export class LocalModelAdapter extends BaseModelAdapter implements IModelAdapter {
    private config: LocalModelAdapterConfig;
    private engine: LocalInferenceEngine;
    private isModelLoaded: boolean = false;

    constructor(config: LocalModelAdapterConfig, modelInfo: ModelInfo) {
      super(config, modelInfo);

      this.config = config;
      this.engine = new LocalInferenceEngine(config);

      logger.info('本地模型适配器创建', 'LocalModelAdapter', {
        modelPath: config.modelPath,
        engine: config.engine
      });
    }

    // ================= 生命周期方法 =================

    async initialize(): Promise<void> {
      logger.info('初始化本地模型适配器', 'LocalModelAdapter');

      try {
        // 验证模型文件
        await this.validateModelFile();

        // 加载模型
        await this.engine.loadModel();
        this.isModelLoaded = true;

        logger.info('本地模型适配器初始化成功', 'LocalModelAdapter');
      } catch (error) {
        logger.error('本地模型适配器初始化失败', 'LocalModelAdapter', { error });
        throw error;
      }
    }

    async clearCache(): Promise<void> {
      // 本地模型不需要缓存
      logger.info('本地模型无需缓存', 'LocalModelAdapter');
    }

    // ================= 抽象方法实现 =================

    /**
     * 调用本地模型推理
     */
    protected async callModelAPI(request: PreprocessedRequest): Promise<RawModelResponse> {
      if (!this.isModelLoaded) {
        throw new Error('Model is not loaded');
      }

      const startTime = Date.now();

      try {
        const original = request.original as CompletionRequest;

        const result = await this.engine.generate(original.prompt, {
          maxTokens: original.parameters?.maxTokens,
          temperature: original.parameters?.temperature,
          topP: original.parameters?.topP
        });

        const processingTime = Date.now() - startTime;

        logger.debug('本地模型推理完成', 'LocalModelAdapter', {
          processingTime,
          tokens: result.tokens,
          traceId: request.traceId
        });

        // 更新指标
        metrics.increment('local_model.inference_success');
        metrics.histogram('local_model.inference_time', processingTime);
        metrics.histogram('local_model.tokens_generated', result.tokens);

        return {
          raw: result,
          normalized: this.normalizeLocalResponse(result, original)
        };
      } catch (error) {
        const processingTime = Date.now() - startTime;

        logger.error('本地模型推理失败', 'LocalModelAdapter', {
          error,
          processingTime,
          traceId: request.traceId
        });

        metrics.increment('local_model.inference_failed');

        throw error;
      }
    }

    /**
     * 调用本地模型流式推理
     */
    protected async *callModelStream(request: PreprocessedRequest): AsyncIterable<unknown> {
      if (!this.isModelLoaded) {
        throw new Error('Model is not loaded');
      }

      try {
        const original = request.original as CompletionRequest;
        const stream = this.engine.generateStream(original.prompt, {
          maxTokens: original.parameters?.maxTokens,
          temperature: original.parameters?.temperature,
          topP: original.parameters?.topP
        });

        for await (const chunk of stream) {
          yield chunk;
        }
      } catch (error) {
        logger.error('本地模型流式推理失败', 'LocalModelAdapter', { error });
        throw error;
      }
    }

    /**
     * 解析流式数据块
     */
    protected parseStreamChunk(chunk: unknown): {
      text?: string;
      tokens?: number;
      finished?: boolean;
      finishedReason?: string;
      index?: number;
    } {
      const data = chunk as {
        text: string;
        tokens: number;
        finished: boolean;
        finishReason?: string;
      };

      return {
        text: data.text,
        tokens: data.tokens,
        finished: data.finished,
        finishedReason: data.finishReason,
        index: 0
      };
    }

    /**
     * 执行健康检查
     */
    protected async performHealthCheck(): Promise<void> {
      if (!this.isModelLoaded) {
        throw new Error('Model is not loaded');
      }

      try {
        // 发送一个简单的推理请求验证模型
        await this.engine.generate('test', { maxTokens: 1 });

        logger.info('本地模型健康检查通过', 'LocalModelAdapter');
      } catch (error) {
        logger.error('本地模型健康检查失败', 'LocalModelAdapter', { error });
        throw error;
      }
    }

    // ================= 私有辅助方法 =================

    /**
     * 标准化本地模型响应
     */
    private normalizeLocalResponse(
      result: {
        text: string;
        tokens: number;
        inferenceTime: number;
      },
      originalRequest: CompletionRequest
    ): CompletionResponse {
      return {
        success: true,
        model: this.config.model,
        provider: ModelProvider.LOCAL,
        timestamp: new Date(),
        processingTime: result.inferenceTime,
        type: 'llm' as any,
        content: result.text,
        finishReason: 'stop',
        usage: {
          promptTokens: Math.ceil(originalRequest.prompt.length / 4),
          completionTokens: result.tokens,
          totalTokens: Math.ceil(originalRequest.prompt.length / 4) + result.tokens
        }
      };
    }

    /**
     * 验证模型文件
     */
    private async validateModelFile(): Promise<void> {
      import { existsSync, statSync } from 'node:fs';

      if (!existsSync(this.config.modelPath)) {
        throw new Error(`Model file not found: ${this.config.modelPath}`);
      }

      const stats = statSync(this.config.modelPath);
      if (stats.size === 0) {
        throw new Error(`Model file is empty: ${this.config.modelPath}`);
      }

      logger.info('模型文件验证通过', 'LocalModelAdapter', {
        modelPath: this.config.modelPath,
        size: stats.size
      });
    }

    /**
     * 资源清理
     */
    async destroy(): Promise<void> {
      logger.info('销毁本地模型适配器', 'LocalModelAdapter');

      if (this.isModelLoaded) {
        await this.engine.unloadModelModel();
        this.isModelLoaded = false;
      }

      logger.info('本地模型适配器已销毁', 'LocalModelAdapter');
    }
  }

  // ============ 导出 ============

  export default LocalModelAdapter;

导师提示 💡：这是第三章的前半部分。由于代码量很大，我需要确认：

1. 继续生成第三章的剩余部分（模型路由器、适配器工厂）吗？
2. 还是您希望我先停下来，让您审查已生成的代码？

作为导师，我建议您先理解这几个核心模块：

• BaseModelAdapter（抽象基类）：定义了所有适配器的通用行为
• OpenAIAdapter（OpenAI实现）：展示了如何对接第三方API
• LocalModelAdapter（本地实现）：展示了如何处理本地模型


Thought for 18s

 🚀 YYC³-AILP 智能浮窗系统 - 缺失补全完整方案（第三章续）

│ 继续我们的旅程！ 🌟 前半部分我们实现了具体的模型适配器，现在我们进入系统的"神经中枢"——模型路由器和适配器工厂。
│ 路由器负责智能决策：在众多模型中，谁最适合处理当前请求？ 工厂负责资源管理：如何优雅地创建、注册和管理这些适配器？
│ 这两个模块将把零散的适配器整合成一个有机的整体。💪

--------

## 📋 第三章（续）：模型路由器与适配器工厂

### 3.6 导师寄语 🌟

│ "好的设计是做减法，通过抽象让复杂变得简单。"
│ 模型路由器体现了策略模式的精髓：选择模型的逻辑（策略）可以随时更换，而不影响业务代码。
│ 适配器工厂体现了工厂模式的精髓：对象的创建过程被封装，调用者无需关心细节。
│ 掌握了这两个模式，你就掌握了企业级系统架构的一半秘诀！

### 3.7 智能模型路由器实现

  // 📦 src/model/ModelRouter.ts - 智能模型路由器实现
  import { logger } from '../utils/logger';
  import { metrics } from '../utils/metrics';
  import {
    IModelAdapter,
    RoutingRequest,
    RoutingDecision,
    ModelProvider,
    ModelCapability,
    ModelInfo
  } from '../types/model.types';

  /**
   * 路由策略接口
   *
   * 设计理念：
   * 策略模式允许在运行时切换不同的路由算法。
   * 例如：成本优先、延迟优先、质量优先、混合策略。
   */
  export interface IRoutingStrategy {
    name: string;
    /**
     * 评分方法：给每个适配器打分
     * 返回值：0-1之间的分数，越高越好
     */
    score(
      adapter: IModelAdapter,
      request: RoutingRequest,
      context: RoutingContext
    ): Promise<number>;

    /**
     * 判断适配器是否满足基本条件
     */
    filter(
      adapter: IModelAdapter,
      request: RoutingRequest,
      context: RoutingContext
    ): Promise<boolean>;
  }

  /**
   * 路由上下文
   */
  interface RoutingContext {
    timestamp: Date;
    availableAdapters: Map<string, IModelAdapter>;
    historicalPerformance: Map<string, AdapterPerformanceStats>;
  }

  /**
   * 适配器性能统计
   */
  interface AdapterPerformanceStats {
    totalRequests: number;
    successRate: number;
    averageLatency: number;
    p99Latency: number;
    averageCost: number;
    lastUsed: Date;
  }

  /**
   * 默认路由策略（综合平衡）
   *
   * 考虑因素：
   * 1. 可用性（权重 40%）
   * 2. 成本（权重 30%）
   * 3. 性能（权重 20%）
   * 4. 用户偏好（权重 10%）
   */
  export class DefaultRoutingStrategy implements IRoutingStrategy {
    name = 'default_balanced';

    async score(
      adapter: IModelAdapter,
      request: RoutingRequest,
      context: RoutingContext
    ): Promise<number> {
      const info = adapter.getModelInfo();
      const metrics = adapter.getMetrics();
      const perfStats = context.historicalPerformance.get(info.id) || this.createDefaultStats();

      let score = 0;

      // 1. 可用性评分 (40%)
      const availabilityScore = await this.calculateAvailabilityScore(adapter, perfStats);
      score += availabilityScore * 0.4;

      // 2. 成本评分 (30%) - 成本越低分数越高
      const costScore = this.calculateCostScore(info, metrics, request.constraints);
      score += costScore * 0.3;

      // 3. 性能评分 (20%) - 延迟越低分数越高
      const performanceScore = this.calculatePerformanceScore(perfStats, request.constraints);
      score += performanceScore * 0.2;

      // 4. 偏好评分 (10%) - 用户偏好模型加分
      const preferenceScore = this.calculatePreferenceScore(info, request.preferences);
      score += preferenceScore * 0.1;

      return Math.min(Math.max(score, 0), 1); // 限制在 0-1 之间
    }

    async filter(
      adapter: IModelAdapter,
      request: RoutingRequest,
      _context: RoutingContext
    ): Promise<boolean> {
      const info = adapter.getModelInfo();
      const constraints = request.constraints || {};

      // 1. 检查能力匹配
      if (constraints.capabilities) {
        const hasAllCapabilities = constraints.capabilities.every(cap =>
          info.capabilities.includes(cap)
        );
        if (!hasAllCapabilities) {
          return false;
        }
      }

      // 2. 检查模型状态
      const isAvailable = await adapter.isAvailable();
      if (!isAvailable) {
        return false;
      }

      // 3. 检查Token限制
      if (constraints.maxTokens) {
        const maxTokens = info.limits?.maxOutputTokens || 4096;
        if (maxTokens < constraints.maxTokens) {
          return false;
        }
      }

      return true;
    }

    private createDefaultStats(): AdapterPerformanceStats {
      return {
        totalRequests: 0,
        successRate: 0.9, // 默认90%成功率
        averageLatency: 500,
        p99Latency: 1000,
        averageCost: 0.01,
        lastUsed: new Date()
      };
    }

    private async calculateAvailabilityScore(
      adapter: IModelAdapter,
      stats: AdapterPerformanceStats
    ): Promise<number> {
      // 检查健康状态
      const isHealthy = await adapter.isAvailable();
      if (!isHealthy) return 0;

      // 基于历史成功率
      return stats.successRate;
    }

    private calculateCostScore(
      info: ModelInfo,
      metrics: any,
      constraints?: { maxCost?: number }
    ): number {
      const costPerToken = info.pricing?.inputPrice || 0;

      // 如果有成本限制
      if (constraints?.maxCost) {
        if (costPerToken > constraints.maxCost) {
          return 0; // 超出预算
        }
      }

      // 成本越低分数越高 (归一化到 0-1)
      // 假设最高可接受成本是 $0.01 per token
      const maxAcceptableCost = 0.01;
      return Math.max(0, 1 - (costPerToken / maxAcceptableCost));
    }

    private calculatePerformanceScore(
      stats: AdapterPerformanceStats,
      constraints?: { maxLatency?: number }
    ): number {
      // 如果有延迟限制
      if (constraints?.maxLatency) {
        if (stats.averageLatency > constraints.maxLatency) {
          return 0; // 超出延迟限制
        }
      }

      // 延迟越低分数越高 (归一化到 0-1)
      // 假设最高可接受延迟是 5000ms
      const maxAcceptableLatency = 5000;
      return Math.max(0, 1 - (stats.averageLatency / maxAcceptableLatency));
    }

    private calculatePreferenceScore(
      info: ModelInfo,
      preferences?: { provider?: ModelProvider; model?: string }
    ): number {
      if (!preferences) return 0.5; // 中性分数

      let score = 0;

      // 提供商匹配
      if (preferences.provider === info.provider) {
        score += 0.5;
      }

      // 模型匹配
      if (preferences.model === info.name) {
        score += 0.5;
      }

      return score;
    }
  }

  /**
   * 成本优先路由策略
   *
   * 目标：在满足基本约束的前提下，选择成本最低的模型
   */
  export class CostOptimizedRoutingStrategy implements IRoutingStrategy {
    name = 'cost_optimized';

    async score(adapter: IModelAdapter, request: RoutingRequest): Promise<number> {
      const info = adapter.getModelInfo();
      const costPerToken = info.pricing?.inputPrice || Infinity;

      // 成本越低分数越高
      // 使用指数函数增强差异
      return Math.exp(-costPerToken * 1000);
    }

    async filter(
      adapter: IModelAdapter,
      request: RoutingRequest,
      context: RoutingContext
    ): Promise<boolean> {
      // 复用默认策略的过滤逻辑
      const defaultStrategy = new DefaultRoutingStrategy();
      return defaultStrategy.filter(adapter, request, context);
    }
  }

  /**
   * 延迟优先路由策略
   *
   * 目标：在满足基本约束的前提下，选择延迟最低的模型
   */
  export class LatencyOptimizedRoutingStrategy implements IRoutingStrategy {
    name = 'latency_optimized';

    async score(adapter: IModelAdapter, _request: RoutingRequest, context: RoutingContext): Promise<number> {
      const info = adapter.getModelInfo();
      const stats = context.historicalPerformance.get(info.id);

      if (!stats) {
        return 0.5; // 没有历史数据，给中性分数
      }

      // 延迟越低分数越高
      // 使用指数函数增强差异
      return Math.exp(-stats.averageLatency / 1000);
    }

    async filter(
      adapter: IModelAdapter,
      request: RoutingRequest,
      context: RoutingContext
    ): Promise<boolean> {
      const defaultStrategy = new DefaultRoutingStrategy();
      return defaultStrategy.filter(adapter, request, context);
    }
  }

  /**
   * 智能模型路由器
   *
   * 设计理念：
   * 1. 注册表模式：管理所有可用的模型适配器
   * 2. 策略模式：支持多种路由策略，可动态切换
   * 3. 责任链模式：适配器按优先级排队处理
   * 4. 缓存优化：缓存路由决策，减少重复计算
   * 5. 实时监控：跟踪路由决策效果
   */
  export class ModelRouter {
    private adapters: Map<string, IModelAdapter> = new Map();
    private strategies: Map<string, IRoutingStrategy> = new Map();
    private currentStrategy: IRoutingStrategy;
    private decisionCache: Map<string, RoutingDecision> = new Map();
    private performanceStats: Map<string, AdapterPerformanceStats> = new Map();
    private cacheTTL: number = 60000; // 1分钟缓存

    constructor() {
      // 注册默认策略
      this.registerStrategy(new DefaultRoutingStrategy());
      this.registerStrategy(new CostOptimizedRoutingStrategy());
      this.registerStrategy(new LatencyOptimizedRoutingStrategy());

      // 设置默认策略
      this.currentStrategy = this.strategies.get('default_balanced')!;

      logger.info('模型路由器初始化', 'ModelRouter', {
        strategiesCount: this.strategies.size,
        currentStrategy: this.currentStrategy.name
      });
    }

    // ================= 适配器注册与管理 =================

    /**
     * 注册适配器
     */
    registerAdapter(adapter: IModelAdapter): void {
      const info = adapter.getModelInfo();
      const key = `${info.provider}-${info.name}`;

      this.adapters.set(key, adapter);
      this.performanceStats.set(info.id, this.createDefaultStats());

      logger.info('模型适配器已注册', 'ModelRouter', {
        key,
        provider: info.provider,
        model: info.name,
        capabilities: info.capabilities
      });

      metrics.increment('model_router.adapters_registered');
    }

    /**
     * 取消注册适配器
     */
    unregisterAdapter(key: string): void {
      const adapter = this.adapters.get(key);
      if (adapter) {
        const info = adapter.getModelInfo();
        this.adapters.delete(key);
        this.performanceStats.delete(info.id);

        logger.info('模型适配器已取消注册', 'ModelRouter', { key });

        // 清除相关缓存
        this.invalidateCache();
      }
    }

    /**
     * 获取适配器
     */
    getAdapter(key: string): IModelAdapter | undefined {
      return this.adapters.get(key);
    }

    /**
     * 获取所有适配器
     */
    getAllAdapters(): IModelAdapter[] {
      return Array.from(this.adapters.values());
    }

    // ================= 策略管理 =================

    /**
     * 注册路由策略
     */
    registerStrategy(strategy: IRoutingStrategy): void {
      this.strategies.set(strategy.name, strategy);
      logger.info('路由策略已注册', 'ModelRouter', {
        strategyName: strategy.name
      });
    }

    /**
     * 设置当前策略
     */
    setStrategy(strategyName: string): void {
      const strategy = this.strategies.get(strategyName);
      if (!strategy) {
        throw new Error(`策略不存在: ${strategyName}`);
      }

      this.currentStrategy = strategy;
      logger.info('路由策略已更新', 'ModelRouter', {
        oldStrategy: this.currentStrategy.name,
        newStrategy: strategy.name
      });

      // 策略改变时清除缓存
      this.invalidateCache();
    }

    /**
     * 获取当前策略
     */
    getCurrentStrategy(): IRoutingStrategy {
      return this.currentStrategy;
    }

    // ================= 核心路由逻辑 =================

    /**
     * 路由请求到最佳适配器
     */
    async route(request: RoutingRequest): Promise<RoutingDecision> {
      const startTime = Date.now();

      logger.debug('开始路由请求', 'ModelRouter', {
        requestId: this.generateRequestId(),
        strategy: this.currentStrategy.name
      });

      try {
        // 1. 检查缓存
        const cached = this.checkCache(request);
        if (cached) {
          logger.debug('使用缓存的路由决策', 'ModelRouter');
          return cached;
        }

        // 2. 准备路由上下文
        const context: RoutingContext = {
          timestamp: new Date(),
          availableAdapters: this.adapters,
          historicalPerformance: this.performanceStats
        };

        // 3. 筛选适配器（过滤不满足条件的）
        const candidateAdapters: Array<{ adapter: IModelAdapter; key: string }> = [];

        for (const [key, adapter] of this.adapters) {
          const isCandidate = await this.currentStrategy.filter(adapter, request, context);
          if (isCandidate) {
            candidateAdapters.push({ adapter, key });
          }
        }

        if (candidateAdapters.length === 0) {
          throw new Error('没有找到满足条件的适配器');
        }

        logger.debug('候选适配器数量', 'ModelRouter', {
          count: candidateAdapters.length,
          totalAdapters: this.adapters.size
        });

        // 4. 评分适配器
        const scoredAdapters = await Promise.all(
          candidateAdapters.map(async ({ adapter, key }) => ({
            adapter,
            key,
            score: await this.currentStrategy.score(adapter, request, context)
          }))
        );

        // 5. 排序并选择最佳
        scoredAdapters.sort((a, b) => b.score - a.score);
        const best = scoredAdapters[0];
        const bestAdapter = best.adapter;
        const bestInfo = bestAdapter.getModelInfo();

        logger.debug('路由决策完成', 'ModelRouter', {
          selectedAdapter: best.key,
          score: best.score,
          candidateCount: scoredAdapters.length
        });

        // 6. 构建决策结果
        const decision: RoutingDecision = {
          adapter: bestAdapter,
          model: bestInfo.name,
          reason: this.generateReason(best.score, scoredAdapters),
          score: best.score,
          estimatedLatency: this.performanceStats.get(bestInfo.id)?.averageLatency || 0,
          estimatedCost: bestInfo.pricing?.inputPrice || 0
        };

        // 7. 缓存决策
        this.cacheDecision(request, decision);

        // 8. 更新指标
        const routingTime = Date.now() - startTime;
        metrics.increment('model_router.requests_routed');
        metrics.histogram('model_router.routing_time', routingTime);
        metrics.histogram('model_router.score', best.score);

        return decision;
      } catch (error) {
        logger.error('路由失败', 'ModelRouter', { error });
        throw error;
      }
    }

    /**
     * 批量路由（用于预热或性能测试）
     */
    async batchRoute(requests: RoutingRequest[]): Promise<RoutingDecision[]> {
      logger.debug('批量路由请求', 'ModelRouter', {
        count: requests.length
      });

      // 简化实现：并行路由
      // 实际生产中可能需要限流
      const decisions = await Promise.all(
        requests.map(request => this.route(request))
      );

      return decisions;
    }

    // ================= 性能统计更新 =================

    /**
     * 更新适配器性能统计
     */
    updatePerformanceStats(
      adapterId: string,
      success: boolean,
      latency: number,
      cost: number
    ): void {
      const stats = this.performanceStats.get(adapterId);
      if (!stats) return;

      stats.totalRequests++;

      // 滑动窗口平均（简化实现）
      const alpha = 0.1; // 平滑因子
      stats.averageLatency = alpha * latency + (1 - alpha) * stats.averageLatency;
      stats.averageCost = alpha * cost + (1 - alpha) * stats.averageCost;

      // 成功率
      stats.successRate = (stats.successRate * (stats.totalRequests - 1) + (success ? 1 : 0)) / stats.totalRequests;

      stats.lastUsed = new Date();

      logger.debug('性能统计已更新', 'ModelRouter', {
        adapterId,
        success,
        latency,
        cost,
        newSuccessRate: stats.successRate
      });
    }

    // ================= 缓存管理 =================

    /**
     * 检查缓存
     */
    private checkCache(request: RoutingRequest): RoutingDecision | null {
      const cacheKey = this.generateCacheKey(request);
      const cached = this.decisionCache.get(cacheKey);

      if (!cached) {
        return null;
      }

      // 检查是否过期
      const age = Date.now() - cached.adapter.getModelInfo().version.length; // 简化
      if (age > this.cacheTTL) {
        this.decisionCache.delete(cacheKey);
        return null;
      }

      return cached;
    }

    /**
     * 缓存决策
     */
    private cacheDecision(request: RoutingRequest, decision: RoutingDecision): void {
      const cacheKey = this.generateCacheKey(request);
      this.decisionCache.set(cacheKey, decision);

      // 限制缓存大小
      if (this.decisionCache.size > 1000) {
        // 简单的LRU：删除最旧的（实际应使用LRU算法）
        const firstKey = this.decisionCache.keys().next().value;
        this.decisionCache.delete(firstKey);
      }
    }

    /**
     * 使缓存失效
     */
    private invalidateCache(): void {
      this.decisionCache.clear();
      logger.debug('路由缓存已清除', 'ModelRouter');
    }

    // ================= 工具方法 =================

    private generateRequestId(): string {
      return `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    private generateCacheKey(request: RoutingRequest): string {
      // 简化的缓存键生成
      const constraints = request.constraints || {};
      const preferences = request.preferences || {};
      return JSON.stringify({
        type: request.request.type,
        constraints,
        preferences
      });
    }

    private generateReason(score: number, candidates: Array<{ score: number }>): string {
      const percentage = (score * 100).toFixed(2);
      return `Selected with ${percentage}% score out of ${candidates.length} candidates`;
    }

    private createDefaultStats(): AdapterPerformanceStats {
      return {
        totalRequests: 0,
        successRate: 1.0,
        averageLatency: 0,
        p99Latency: 0,
        averageCost: 0,
        lastUsed: new Date()
      };
    }
  }

  // ============ 导出 ============

  export default ModelRouter;

### 3.8 适配器工厂与注册表实现

  // 📦 src/model/AdapterFactory.ts - 适配器工厂实现
  import { logger } from '../utils/logger';
  import { metrics } from '../utils/metrics';
  import { IModelAdapter } from './BaseModelAdapter';
  import { OpenAIAdapter, OpenAIAdapterConfig } from './OpenAIAdapter';
  import { LocalModelAdapter, LocalModelAdapterConfig } from './LocalModelAdapter';
  import {
    ModelAdapterConfig,
    ModelProvider,
    ModelInfo
  } from '../types/model.types';

  /**
   * 适配器创建器函数类型
   */
  type AdapterCreator = (
    config: ModelAdapterConfig,
    modelInfo: ModelInfo
  ) => IModelAdapter;

  /**
   * 适配器元信息
   */
  interface AdapterMetadata {
    provider: ModelProvider;
    version: string;
    creator: AdapterCreator;
    defaultConfig?: Partial<ModelAdapterConfig>;
    supportedModels: string[];
  }

  /**
   * 适配器工厂
   *
   * 设计理念：
   * 1. 工厂方法模式：封装对象创建逻辑
   * 2. 注册表模式：动态注册和管理适配器类型
   * 3. 单例模式：对于昂贵的适配器，使用单例模式复用
   * 4. 依赖注入：通过配置注入依赖
   * 5. 延迟初始化：适配器在第一次使用时才创建
   */
  export class AdapterFactory {
    private registry: Map<string, AdapterMetadata> = new Map();
    private instances: Map<string, IModelAdapter> = new Map();
    private modelInfoRegistry: Map<string, ModelInfo> = new Map();

    constructor() {
      // 注册内置适配器
      this.registerBuiltinAdapters();

      logger.info('适配器工厂初始化', 'AdapterFactory', {
        registeredAdapters: Array.from(this.registry.keys())
      });
    }

    // ================= 注册管理 =================

    /**
     * 注册适配器类型
     */
    registerAdapter(
      key: string,
      provider: ModelProvider,
      creator: AdapterCreator,
      metadata?: Partial<AdapterMetadata>
    ): void {
      const adapterMetadata: AdapterMetadata = {
        provider,
        version: metadata?.version || '1.0.0',
        creator,
        defaultConfig: metadata?.defaultConfig,
        supportedModels: metadata?.supportedModels || []
      };

      this.registry.set(key, adapterMetadata);

      logger.info('适配器类型已注册', 'AdapterFactory', {
        key,
        provider,
        version: adapterMetadata.version,
        supportedModels: adapterMetadata.supportedModels.length
      });

      metrics.increment('adapter_factory.types_registered');
    }

    /**
     * 注销适配器类型
     */
    unregisterAdapter(key: string): void {
      this.registry.delete(key);
      logger.info('适配器类型已注销', 'AdapterFactory', { key });
    }

    /**
     * 注册模型信息
     */
    registerModelInfo(modelInfo: ModelInfo): void {
      const key = `${modelInfo.provider}-${modelInfo.id}`;
      this.modelInfoRegistry.set(key, modelInfo);

      logger.debug('模型信息已注册', 'AdapterFactory', {
        key,
        modelId: modelInfo.id,
        capabilities: modelInfo.capabilities
      });
    }

    // ================= 实例创建 =================

    /**
     * 创建适配器实例
     */
    async createAdapter(
      config: ModelAdapterConfig,
      useSingleton: boolean = false
    ): Promise<IModelAdapter> {
      const key = this.generateInstanceKey(config);

      logger.debug('创建适配器实例', 'AdapterFactory', {
        key,
        useSingleton,
        provider: config.provider,
        model: config.model
      });

      try {
        // 1. 检查单例缓存
        if (useSingleton) {
          const cachedInstance = this.instances.get(key);
          if (cachedInstance) {
            logger.debug('使用单例实例', 'AdapterFactory', { key });
            return cachedInstance;
          }
        }

        // 2. 查找适配器元信息
        const metadata = this.findAdapterMetadata(config);
        if (!metadata) {
          throw new Error(`未找到适配器类型: ${config.provider}`);
        }

        // 3. 获取模型信息
        const modelInfo = await this.getOrCreateModelInfo(config);

        // 4. 合并配置
        const finalConfig = {
          ...metadata.defaultConfig,
          ...config
        };

        // 5. 创建适配器实例
        const adapter = metadata.creator(finalConfig, modelInfo);

        // 6. 初始化适配器
        await adapter.initialize();

        // 7. 缓存单例实例
        if (useSingleton) {
          this.instances.set(key, adapter);
          logger.info('适配器实例已缓存为单例', 'AdapterFactory', { key });
        }

        // 8. 更新指标
        metrics.increment('adapter_factory.instances_created');

        return adapter;
      } catch (error) {
        logger.error('创建适配器实例失败', 'AdapterFactory', {
          key,
          error
        });

        metrics.increment('adapter_factory.creation_failed');

        throw error;
      }
    }

    /**
     * 获取或创建适配器实例（单例模式）
     */
    async getOrCreateAdapter(config: ModelAdapterConfig): Promise<IModelAdapter> {
      return this.createAdapter(config, true);
    }

    // ================= 批量操作 =================

    /**
     * 批量创建适配器
     */
    async createAdapters(
      configs: ModelAdapterConfig[],
      useSingleton: boolean = false
    ): Promise<IModelAdapter[]> {
      logger.info('批量创建适配器', 'AdapterFactory', {
        count: configs.length,
        useSingleton
      });

      const adapters = await Promise.all(
        configs.map(config => this.createAdapter(config, useSingleton))
      );

      return adapters;
    }

    /**
     * 创建所有已注册适配器的实例
     */
    async createAllRegisteredAdapters(
      configs: ModelAdapterConfig[],
      useSingleton: boolean = false
    ): Promise<Map<string, IModelAdapter>> {
      logger.info('创建所有已注册适配器的实例', 'AdapterFactory', {
        count: configs.length,
        useSingleton
      });

      const instances = new Map<string, IModelAdapter>();

      for (const config of configs) {
        try {
          const adapter = await this.createAdapter(config, useSingleton);
          const key = this.generateInstanceKey(config);
          instances.set(key, adapter);
        } catch (error) {
          logger.warn('创建适配器实例失败，跳过', 'AdapterFactory', {
            provider: config.provider,
            model: config.model,
            error
          });
        }
      }

      logger.info('适配器实例创建完成', 'AdapterFactory', {
        successCount: instances.size,
        totalCount: configs.length
      });

      return instances;
    }

    // ================= 实例管理 =================

    /**
     * 获取缓存的实例
     */
    getCachedInstance(key: string): IModelAdapter | undefined {
      return this.instances.get(key);
    }

    /**
     * 销毁实例
     */
    async destroyInstance(key: string): Promise<void> {
      const instance = this.instances.get(key);
      if (instance) {
        // 调用实例的清理方法（如果有）
        // 这里简化处理
        this.instances.delete(key);
        logger.info('适配器实例已销毁', 'AdapterFactory', { key });
      }
    }

    /**
     * 清空所有实例
     */
    async clearAllInstances(): Promise<void> {
      logger.info('清空所有适配器实例', 'AdapterFactory', {
        count: this.instances.size
      });

      // 清理每个实例
      for (const [key, instance] of this.instances) {
        try {
          // 调用实例的清理方法（如果有）
          // 这里简化处理
          logger.debug('清理实例', 'AdapterFactory', { key });
        } catch (error) {
          logger.warn('清理实例失败', 'AdapterFactory', {
            key,
            error
          });
        }
      }

      this.instances.clear();
    }

    // ================= 私有辅助方法 =================

    /**
     * 注册内置适配器
     */
    private registerBuiltinAdapters(): void {
      // OpenAI 适配器
      this.registerAdapter(
        'openai',
        ModelProvider.OPENAI,
        (config: ModelAdapterConfig, modelInfo: ModelInfo) => {
          return new OpenAIAdapter(config as OpenAIAdapterConfig, modelInfo);
        },
        {
          version: '1.0.0',
          defaultConfig: {
            timeout: 30000,
            retryPolicy: {
              maxRetries: 3,
              backoffFactor: 2,
              initialDelay: 1000
            },
            cache: {
              enabled: true,
              ttl: 300000,
              maxSize: 1000
            },
            logging: {
              enabled: true,
              level: 'info'
            }
          },
          supportedModels: [
            'gpt-4',
            'gpt-4-turbo-preview',
            'gpt-3.5-turbo',
            'text-embedding-ada-002',
            'text-embedding-3-small',
            'text-embedding-3-large'
          ]
        }
      );

      // 本地模型适配器
      this.registerAdapter(
        'local',
        ModelProvider.LOCAL,
        (config: ModelAdapterConfig, modelInfo: ModelInfo) => {
          return new LocalModelAdapter(config as LocalModelAdapterConfig, modelInfo);
        },
        {
          version: '1.0.0',
          defaultConfig: {
            timeout: 60000,
            retryPolicy: {
              maxRetries: 1,
              backoffFactor: 2,
              initialDelay: 1000
            },
            logging: {
              enabled: true,
              level: 'debug'
            }
          },
          supportedModels: [
            'llama-2-7b',
            'llama-2-13b',
            'llama-2-70b',
            'mistral-7b',
            'codellama-7b'
          ]
        }
      );
    }

    /**
     * 查找适配器元信息
     */
    private findAdapterMetadata(config: ModelAdapterConfig): AdapterMetadata | undefined {
      // 直接通过key查找
      const key = config.provider.toString();
      let metadata = this.registry.get(key);

      // 如果没找到，尝试通过provider查找
      if (!metadata) {
        for (const [_, value] of this.registry) {
          if (value.provider === config.provider) {
            metadata = value;
            break;
          }
        }
      }

      return metadata;
    }

    /**
     * 获取或创建模型信息
     */
    private async getOrCreateModelInfo(config: ModelAdapterConfig): Promise<ModelInfo> {
      const key = `${config.provider}-${config.model}`;
      let modelInfo = this.modelInfoRegistry.get(key);

      if (!modelInfo) {
        // 创建默认模型信息
        // 实际项目中，这里应该调用模型API获取详细信息
        modelInfo = {
          id: config.model,
          name: config.model,
          provider: config.provider,
          type: 'chat_llm' as any,
          capabilities: [/* 默认能力 */],
          pricing: {
            inputPrice: 0.01,
            outputPrice: 0.02,
            currency: 'USD'
          },
          limits: {
            maxInputTokens: 4096,
            maxOutputTokens: 4096,
            maxRequestsPerMinute: 3000,
            maxTokensPerMinute: 100000
          },
          version: '1.0.0',
          status: 'available'
        };

        this.registerModelInfo(modelInfo);
      }

      return modelInfo;
    }

    /**
     * 生成实例键
     */
    private generateInstanceKey(config: ModelAdapterConfig): string {
      return `${config.provider}-${config.model}-${config.timeout || 0}`;
    }
  }

  // ============ 导出 ============

  export default AdapterFactory;

### 3.9 集成示例：完整的模型管理器

  // 📦 src/model/ModelManager.ts - 完整的模型管理器集成示例
  import { logger } from '../utils/logger';
  import { metrics } from '../utils/metrics';
  import { AdapterFactory } from './AdapterFactory';
  import { ModelRouter, IRoutingStrategy } from './ModelRouter';
  import { IModelAdapter } from './BaseModelAdapter';
  import {
    ModelAdapterConfig,
    CompletionRequest,
    CompletionResponse,
    ChatRequest,
    ChatResponse,
    RoutingRequest,
    ModelProvider
  } from '../types/model.types';

  /**
   * 模型管理器
   *
   * 设计理念：
   * 这是一个门面模式的实现，将工厂、路由器和适配器整合在一起，
   * 对外提供一个统一、简洁的接口。
   *
   * 功能：
   * 1. 管理多个模型适配器的生命周期
   * 2. 提供智能路由，自动选择最佳模型
   * 3. 封装复杂的调用细节
   * 4. 提供统一的监控和日志
   */
  export class ModelManager {
    private factory: AdapterFactory;
    private router: ModelRouter;
    private activeAdapters: Map<string, IModelAdapter> = new Map();

    constructor() {
      this.factory = new AdapterFactory();
      this.router = new ModelRouter();

      logger.info('模型管理器初始化', 'ModelManager');
    }

    // ================= 生命周期管理 =================

    /**
     * 初始化模型管理器
     */
    async initialize(configs: ModelAdapterConfig[]): Promise<void> {
      logger.info('初始化模型管理器', 'ModelManager', {
        configCount: configs.length
      });

      try {
        // 1. 创建所有适配器
        const instances = await this.factory.createAllRegisteredAdapters(configs, true);

        // 2. 注册到路由器
        for (const [key, adapter] of instances) {
          this.activeAdapters.set(key, adapter);
          this.router.registerAdapter(adapter);
        }

        logger.info('模型管理器初始化完成', 'ModelManager', {
          adapterCount: instances.size
        });
      } catch (error) {
        logger.error('模型管理器初始化失败', 'ModelManager', { error });
        throw error;
      }
    }

    /**
     * 关闭模型管理器
     */
    async shutdown(): Promise<void> {
      logger.info('关闭模型管理器', 'ModelManager');

      try {
        // 清理所有适配器实例
        await this.factory.clearAllInstances();

        this.activeAdapters.clear();

        logger.info('模型管理器已关闭', 'ModelManager');
      } catch (error) {
        logger.error('关闭模型管理器失败', 'ModelManager', { error });
        throw error;
      }
    }

    // ================= 高级接口（自动路由）=================

    /**
     * 智能生成补全（自动路由）
     */
    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
      const startTime = Date.now();

      logger.debug('智能生成补全', 'ModelManager', {
        prompt: request.prompt.substring(0, 100) + '...'
      });

      try {
        // 1. 构建路由请求
        const routingRequest: RoutingRequest = {
          request,
          constraints: {
            maxLatency: 5000,  // 5秒
            maxCost: 0.05      // $0.05
          },
          preferences: {
            provider: request.provider
          }
        };

        // 2. 路由到最佳适配器
        const decision = await this.router.route(routingRequest);

        logger.info('路由决策', 'ModelManager', {
          selectedModel: decision.model,
          score: decision.score,
          reason: decision.reason
        });

        // 3. 调用适配器
        const response = await decision.adapter.generateCompletion(request);

        // 4. 更新性能统计
        this.router.updatePerformanceStats(
          decision.adapter.getModelInfo().id,
          response.success,
          response.metadata?.processingTime || 0,
          this.calculateCost(response.usage.totalTokens, decision)
        );

        return response;
      } catch (error) {
        logger.error('智能生成补全失败', 'ModelManager', { error });
        throw error;
      }
    }

    /**
     * 智能生成聊天补全（自动路由）
     */
    async generateChatCompletion(request: ChatRequest): Promise<ChatResponse> {
      const startTime = Date.now();

      logger.debug('智能生成聊天补全', 'ModelManager', {
        messageCount: request.messages.length
      });

      try {
        // 1. 构建路由请求
        const routingRequest: RoutingRequest = {
          request,
          constraints: {
            maxLatency: 5000,
            maxCost: 0.05
          },
          preferences: {
            provider: request.provider
          }
        };

        // 2. 路由到最佳适配器
        const decision = await this.router.route(routingRequest);

        logger.info('路由决策', 'ModelManager', {
          selectedModel: decision.model,
          score: decision.score,
          reason: decision.reason
        });

        // 3. 调用适配器
        const response = await decision.adapter.generateChatCompletion(request);

        // 4. 更新性能统计
        this.router.updatePerformanceStats(
          decision.adapter.getModelInfo().id,
          response.success,
          response.metadata?.processingTime || 0,
          this.calculateCost(response.usage.totalTokens, decision)
        );

        return response;
      } catch (error) {
        logger.error('智能生成聊天补全失败', 'ModelManager', { error });
        throw error;
      }
    }

    // ================= 配置管理 =================

    /**
     * 设置路由策略
     */
    setRoutingStrategy(strategyName: string): void {
      this.router.setStrategy(strategyName);
      logger.info('路由策略已更新', 'ModelManager', {
        strategy: strategyName
      });
    }

    /**
     * 获取路由器
     */
    getRouter(): ModelRouter {
      return this.router;
    }

    /**
     * 获取工厂
     */
    getFactory(): AdapterFactory {
      return this.factory;
    }

    /**
     * 获取所有活跃的适配器
     */
    getActiveAdapters(): IModelAdapter[] {
      return Array.from(this.activeAdapters.values());
    }

    // ================= 辅助方法 =================

    /**
     * 计算成本
     */
    private calculateCost(tokens: number, decision: any): number {
      const modelInfo = decision.adapter.getModelInfo();
      const price = modelInfo.pricing?.inputPrice || 0;
      return (tokens / 1000) * price;
    }
  }

  // ============ 使用示例 =================

  /**
   * 示例：如何使用模型管理器
   */
  async function exampleUsage() {
    // 1. 创建模型管理器
    const manager = new ModelManager();

    // 2. 配置模型适配器
    const configs: ModelAdapterConfig[] = [
      {
        provider: ModelProvider.OPENAI,
        model: 'gpt-4-turbo-preview',
        apiKey: process.env.OPENAI_API_KEY!
      },
      {
        provider: ModelProvider.LOCAL,
        model: 'llama-2-7b',
        modelPath: '/models/llama-2-7b.gguf',
        engine: 'llama-cpp'
      }
    ];

    // 3. 初始化
    await manager.initialize(configs);

    // 4. 使用自动路由
    const chatRequest: ChatRequest = {
      provider: ModelProvider.OPENAI, // 可选，表示偏好
      model: 'gpt-4-turbo-preview',
      type: 'chat_llm' as any,
      messages: [
        { role: 'user', content: 'Hello, YYC³!' }
      ]
    };

    // 智能路由会自动选择最佳模型（可能是OpenAI，也可能是本地模型）
    const response = await manager.generateChatCompletion(chatRequest);
    console.log('AI回复:', response.message.content);

    // 5. 切换路由策略
    manager.setRoutingStrategy('cost_optimized');

    // 6. 再次请求，会优先选择成本更低的模型
    const costOptimizedResponse = await manager.generateChatCompletion(chatRequest);
    console.log('成本优化回复:', costOptimizedResponse.message.content);

    // 7. 关闭
    await manager.shutdown();
  }

  // ============ 导出 ============

  export default ModelManager;

--------

## 🎯 第三章总结与导师寄语

### 3.10 本章回顾

我们完成了以下核心模块：

1. 类型定义 ( model.types.ts )
  • 定义了完整的模型请求/响应类型
  • 定义了路由、适配器、策略等所有核心接口
  • 为整个模型层提供了TypeScript类型安全
2. 抽象基类 ( BaseModelAdapter.ts )
  • 实现了模板方法模式，定义了统一的调用流程
  • 封装了预处理、后处理、缓存、重试、监控等横切关注点
  • 为具体适配器提供了坚实的基类
3. OpenAI适配器 ( OpenAIAdapter.ts )
  • 展示了如何对接第三方API
  • 实现了API密钥验证、速率限制、错误处理
  • 完全兼容OpenAI API规范
4. 本地模型适配器 ( LocalModelAdapter.ts )
  • 展示了如何处理本地模型推理
  • 实现了模型加载、内存管理、资源释放
  • 支持离线运行，零API成本
5. 智能路由器 ( ModelRouter.ts )
  • 实现了策略模式，支持多种路由策略
  • 实现了评分系统，智能选择最佳模型
  • 集成了性能监控，支持动态学习
6. 适配器工厂 ( AdapterFactory.ts )
  • 实现了工厂方法模式，封装对象创建
  • 实现了注册表模式，支持动态注册适配器
  • 实现了单例模式，优化资源使用
7. 模型管理器 ( ModelManager.ts )
  • 门面模式，整合所有模块，提供统一接口
  • 自动化路由，无需关心底层细节
  • 完整的生命周期管理


### 3.11 设计模式总结

 设计模式                              │ 应用位置                              │ 价值
───────────────────────────────────────┼───────────────────────────────────────┼──────────────────────────────────────
 模板方法                              │ BaseModelAdapter                      │ 定义算法骨架，子类实现细节
 策略模式                              │ ModelRouter                           │ 路由算法可动态切换
 工厂方法                              │ AdapterFactory                        │ 封装对象创建逻辑
 注册表模式                            │ AdapterFactory                        │ 动态管理适配器类型
 单例模式                              │ AdapterFactory                        │ 复用昂贵资源
 门面模式                              │ ModelManager                          │ 简化外部调用接口
 装饰器模式                            │ BaseModelAdapter                      │ 添加缓存、监控等功能

### 3.12 "五高五标五化"符合度提升

 维度                      │ 设计阶段                  │ 实现阶段（第三章）        │ 说明
───────────────────────────┼───────────────────────────┼───────────────────────────┼──────────────────────────────────
 高可用                    │ ⭐⭐⭐⭐⭐                │ ⭐⭐⭐⭐                  │ 实现了健康检查、重试、路由切换
 高性能                    │ ⭐⭐⭐⭐⭐                │ ⭐⭐⭐⭐                  │ 实现了缓存、单例、批量处理
 高安全                    │ ⭐⭐⭐⭐                  │ ⭐⭐⭐⭐                  │ 实现了API密钥管理、速率限制
 高扩展                    │ ⭐⭐⭐⭐⭐                │ ⭐⭐⭐⭐⭐                │ 插件化架构，新增模型极其简单
 高可维护                  │ ⭐⭐⭐⭐⭐                │ ⭐⭐⭐⭐⭐                │ 清晰的层次结构，完整的日志和监控

第三章实现完成度：从 0% 提升到 30% 🎉

### 3.13 导师寄语 🌟

│ "第三章是整个系统最复杂的部分之一，但我们把它拆解得清清楚楚。"
│
│ 关键收获：
│
│ 1. 抽象的力量：通过抽象基类，我们将复杂的模型调用统一成了简单的接口
│ 2. 策略的灵活性：通过策略模式，路由逻辑可以随时调整，无需修改代码
│ 3. 工厂的优雅：通过工厂模式，对象的创建变得透明且可管理
│
│ 下一步：
│
│ • 我们将进入第四章：智能交互界面实现
│ • 这是我们与用户直接接触的地方，需要极致的用户体验
│ • React组件 + 拖拽系统 + 样式系统，让我们一起打造最酷的AI交互界面！

--------

  # 🚀 YYC³-AILP 智能浮窗系统 - 缺失补全完整方案（第四章）

  > **继续我们的旅程！** 🌟
  > 前三章我们构建了坚实的基础设施、核心引擎和智能的模型适配系统。
  > 现在是时候给系统穿上"外衣"了——智能交互界面。
  > 一个好的AI系统，不仅要有强大的"大脑"，更要有友好的"面孔"。
  > 本章我们将用React构建一个可拖拽、可插拔、极致体验的智能浮窗！💪

  ---

---
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
