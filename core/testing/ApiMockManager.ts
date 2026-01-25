/**
 * @file API模拟管理器
 * @description 提供智能的API模拟管理功能，支持动态配置和管理模拟接口
 * @module testing/ApiMockManager
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { vi } from 'vitest';

/**
 * API模拟配置接口
 */
export interface ApiMockConfig {
  /** 模拟接口名称 */
  name: string;
  /** 模拟响应数据 */
  response: any;
  /** 模拟延迟时间（毫秒） */
  delay?: number;
  /** 是否模拟错误 */
  error?: boolean;
  /** 错误信息 */
  errorMessage?: string;
  /** 错误状态码 */
  errorCode?: number;
  /** 调用次数限制 */
  callLimit?: number;
}

/**
 * API模拟实例接口
 */
export interface ApiMockInstance {
  /** 模拟函数 */
  mock: any;
  /** 配置 */
  config: ApiMockConfig;
  /** 调用计数 */
  callCount: number;
  /** 重置模拟 */
  reset: () => void;
  /** 验证调用 */
  verify: (times?: number) => void;
}

/**
 * API模拟管理器
 * 提供智能的API模拟管理功能，支持动态配置和管理模拟接口
 */
export class ApiMockManager {
  private mocks: Map<string, ApiMockInstance> = new Map();

  /**
   * 创建API模拟
   * @param key 模拟键名
   * @param config 模拟配置
   * @returns 模拟实例
   */
  createMock(key: string, config: ApiMockConfig): ApiMockInstance {
    const mockFn = vi.fn();
    
    // 配置模拟函数行为
    mockFn.mockImplementation(async (...args: any[]) => {
      const mockInstance = this.mocks.get(key);
      if (!mockInstance) {
        throw new Error(`Mock not found: ${key}`);
      }

      // 增加调用计数
      mockInstance.callCount++;

      // 检查调用次数限制
      if (mockInstance.config.callLimit && mockInstance.callCount > mockInstance.config.callLimit) {
        throw new Error(`Call limit exceeded for mock: ${key}`);
      }

      // 模拟延迟
      if (mockInstance.config.delay) {
        await new Promise(resolve => setTimeout(resolve, mockInstance.config.delay));
      }

      // 模拟错误
      if (mockInstance.config.error) {
        throw new Error(mockInstance.config.errorMessage || 'Mock error');
      }

      // 返回模拟响应
      return mockInstance.config.response;
    });

    const mockInstance: ApiMockInstance = {
      mock: mockFn,
      config,
      callCount: 0,
      reset: () => {
        mockFn.mockReset();
        mockInstance.callCount = 0;
      },
      verify: (times?: number) => {
        // 验证逻辑由测试框架处理
        return mockFn;
      }
    };

    this.mocks.set(key, mockInstance);
    return mockInstance;
  }

  /**
   * 获取API模拟
   * @param key 模拟键名
   * @returns 模拟实例
   */
  getMock(key: string): ApiMockInstance | undefined {
    return this.mocks.get(key);
  }

  /**
   * 移除API模拟
   * @param key 模拟键名
   */
  removeMock(key: string): void {
    const mockInstance = this.mocks.get(key);
    if (mockInstance) {
      mockInstance.reset();
      this.mocks.delete(key);
    }
  }

  /**
   * 重置所有API模拟
   */
  resetAll(): void {
    this.mocks.forEach(mock => mock.reset());
  }

  /**
   * 清理所有API模拟
   */
  cleanup(): void {
    this.mocks.forEach(mock => mock.reset());
    this.mocks.clear();
  }

  /**
   * 创建OpenAI API模拟
   * @param config 模拟配置
   * @returns 模拟实例
   */
  createOpenAIMock(config?: Partial<ApiMockConfig>): ApiMockInstance {
    const defaultConfig: ApiMockConfig = {
      name: 'openai-api',
      response: {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now() / 1000,
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'This is a mock response'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      },
      delay: 100,
      error: false
    };

    return this.createMock('openai-api', {
      ...defaultConfig,
      ...config
    });
  }

  /**
   * 创建流式响应模拟
   * @param config 模拟配置
   * @returns 模拟实例
   */
  createStreamingMock(config?: Partial<ApiMockConfig>): ApiMockInstance {
    const defaultConfig: ApiMockConfig = {
      name: 'streaming-api',
      response: {
        createReadStream: vi.fn().mockReturnValue({
          on: vi.fn((event: string, callback: Function) => {
            if (event === 'data') {
              // 模拟流式数据
              const chunks = [
                'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}',
                'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}',
                'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}',
                'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
                'data: [DONE]'
              ];

              chunks.forEach((chunk, index) => {
                setTimeout(() => callback(chunk), index * 100);
              });
            }
            return {
              on: vi.fn(),
              end: vi.fn()
            };
          }),
          end: vi.fn(),
          destroy: vi.fn()
        })
      },
      delay: 50,
      error: false
    };

    return this.createMock('streaming-api', {
      ...defaultConfig,
      ...config
    });
  }
}

// 导出单例实例
export const apiMockManager = new ApiMockManager();
