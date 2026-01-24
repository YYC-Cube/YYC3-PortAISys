/**
 * @file 模型适配器类型定义
 * @description 定义AI模型适配器的核心类型和接口
 * @module types/model.types
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-12-30
 */

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
  LLM = 'llm',
  CHAT_LLM = 'chat_llm',
  MULTIMODAL = 'multimodal',
  VISION = 'vision',
  AUDIO = 'audio',
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
    frequencyPenalty?: number;
    presencePenalty?: number;
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
    functions?: FunctionDefinition[];
  };
}

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
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
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * 聊天补全响应
 */
export interface ChatResponse extends BaseResponse {
  type: ModelType.CHAT_LLM;
  message: ChatMessage;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
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
}
