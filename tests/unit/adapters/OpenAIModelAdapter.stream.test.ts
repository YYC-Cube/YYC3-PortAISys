/**
 * @file OpenAI流式输出测试
 * @description 测试OpenAIModelAdapter的流式输出功能
 * @module tests/unit/adapters
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIModelAdapter, StreamCallback } from '../../../core/adapters/OpenAIModelAdapter';
import { AutonomousAIConfig } from '../../../core/autonomous-ai-widget/types';
import { ModelGenerationRequest } from '../../../core/adapters/ModelAdapter';

describe('OpenAIModelAdapter - Stream功能', () => {
  let adapter: OpenAIModelAdapter;
  let config: AutonomousAIConfig;
  let mockFetch: any;

  beforeEach(() => {
    config = {
      apiType: 'openai',
      apiKey: 'test-api-key',
      modelName: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7,
    };

    adapter = new OpenAIModelAdapter(config);
    
    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateStream', () => {
    it('应该成功处理流式响应', async () => {
      const chunks: string[] = [];
      const onChunk: StreamCallback = (chunk) => {
        if (!chunk.done) {
          chunks.push(chunk.content);
        }
      };

      // 模拟SSE流式响应
      const mockStream = createMockStream([
        'data: {"choices":[{"delta":{"content":"Hello"}}],"model":"gpt-4"}\n\n',
        'data: {"choices":[{"delta":{"content":" World"}}],"model":"gpt-4"}\n\n',
        'data: {"choices":[{"delta":{"content":"!"}}],"model":"gpt-4"}\n\n',
        'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":10,"completion_tokens":15,"total_tokens":25}}\n\n',
        'data: [DONE]\n\n'
      ]);

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockStream,
        json: () => Promise.resolve({})
      });

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }]
      };

      const response = await adapter.generateStream(request, onChunk);

      expect(chunks).toEqual(['Hello', ' World', '!']);
      expect(response.content).toBe('Hello World!');
      expect(response.usage?.totalTokens).toBe(25);
      expect(response.modelId).toBe('gpt-4');
    });

    it('应该正确处理工具调用的流式响应', async () => {
      let toolCallReceived = false;
      const onChunk: StreamCallback = (chunk) => {
        if (chunk.done) {
          toolCallReceived = true;
        }
      };

      const mockStream = createMockStream([
        'data: {"choices":[{"delta":{"tool_calls":[{"function":{"name":"search"}}]}}]}\n\n',
        'data: {"choices":[{"delta":{"tool_calls":[{"function":{"arguments":"{\\"q"}}]}}]}\n\n',
        'data: {"choices":[{"delta":{"tool_calls":[{"function":{"arguments":"uery\\":\\"test\\"}"}}]}}]}\n\n',
        'data: [DONE]\n\n'
      ]);

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockStream
      });

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Search for test',
        tools: [{ name: 'search', description: 'Search tool', parameters: {} }],
        forceToolUse: true
      };

      const response = await adapter.generateStream(request, onChunk);

      expect(response.toolUsed).toBe(true);
      expect(response.toolCall?.name).toBe('search');
      expect(response.toolCall?.params).toEqual({ query: 'test' });
      expect(toolCallReceived).toBe(true);
    });

    it('应该在流式传输中支持取消操作', async () => {
      const onChunk: StreamCallback = vi.fn();

      const mockStream = createMockStream([
        'data: {"choices":[{"delta":{"content":"Start"}}]}\n\n',
        // 模拟长时间传输
      ], 5000);

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockStream
      });

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test prompt'
      };

      // 启动流式生成
      const generatePromise = adapter.generateStream(request, onChunk);

      // 100ms后取消
      setTimeout(() => {
        adapter.cancel();
      }, 100);

      await expect(generatePromise).rejects.toThrow();
    });

    it('应该处理流式响应中的错误', async () => {
      const onChunk: StreamCallback = vi.fn();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
      });

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test prompt'
      };

      await expect(adapter.generateStream(request, onChunk)).rejects.toThrow('Rate limit exceeded');
    });

    it('应该正确累积usage统计', async () => {
      let finalUsage: any = null;
      const onChunk: StreamCallback = (chunk) => {
        if (chunk.done && chunk.usage) {
          finalUsage = chunk.usage;
        }
      };

      const mockStream = createMockStream([
        'data: {"choices":[{"delta":{"content":"Test"}}]}\n\n',
        'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":50,"completion_tokens":100,"total_tokens":150}}\n\n',
        'data: [DONE]\n\n'
      ]);

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockStream
      });

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test prompt'
      };

      const response = await adapter.generateStream(request, onChunk);

      expect(finalUsage).toEqual({
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150
      });
      expect(response.usage).toEqual({
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150
      });
    });

    it('应该支持重试机制', async () => {
      const onChunk: StreamCallback = vi.fn();
      let attemptCount = 0;

      mockFetch.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.resolve({ error: { message: 'Server error' } })
          });
        }
        
        return Promise.resolve({
          ok: true,
          body: createMockStream([
            'data: {"choices":[{"delta":{"content":"Success"}}]}\n\n',
            'data: [DONE]\n\n'
          ])
        });
      });

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test prompt'
      };

      const response = await adapter.generateStream(request, onChunk);

      expect(attemptCount).toBe(2);
      expect(response.content).toBe('Success');
    });

    it('应该更新适配器指标', async () => {
      const onChunk: StreamCallback = vi.fn();

      const mockStream = createMockStream([
        'data: {"choices":[{"delta":{"content":"Test"}}]}\n\n',
        'data: [DONE]\n\n'
      ]);

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockStream
      });

      await adapter.initialize(config);

      const initialMetrics = adapter.getMetrics();
      const initialRequests = initialMetrics.totalRequests;

      const request: ModelGenerationRequest = {
        prompt: 'Test prompt'
      };

      await adapter.generateStream(request, onChunk);

      const finalMetrics = adapter.getMetrics();

      expect(finalMetrics.totalRequests).toBe(initialRequests + 1);
      expect(finalMetrics.successfulRequests).toBeGreaterThanOrEqual(1);
      expect(finalMetrics.averageResponseTime).toBeGreaterThan(0);
    });
  });

  describe('流式响应格式处理', () => {
    it('应该正确处理空行', async () => {
      const chunks: string[] = [];
      const onChunk: StreamCallback = (chunk) => {
        if (!chunk.done) {
          chunks.push(chunk.content);
        }
      };

      const mockStream = createMockStream([
        'data: {"choices":[{"delta":{"content":"Line1"}}]}\n\n',
        '\n',
        'data: {"choices":[{"delta":{"content":"Line2"}}]}\n\n',
        '\n\n',
        'data: [DONE]\n\n'
      ]);

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockStream
      });

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test'
      };

      const response = await adapter.generateStream(request, onChunk);

      expect(response.content).toBe('Line1Line2');
    });

    it('应该忽略无效的JSON数据', async () => {
      const onChunk: StreamCallback = vi.fn();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockStream = createMockStream([
        'data: {"choices":[{"delta":{"content":"Valid"}}]}\n\n',
        'data: {invalid json}\n\n',
        'data: {"choices":[{"delta":{"content":"Data"}}]}\n\n',
        'data: [DONE]\n\n'
      ]);

      mockFetch.mockResolvedValue({
        ok: true,
        body: mockStream
      });

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test'
      };

      const response = await adapter.generateStream(request, onChunk);

      expect(response.content).toBe('ValidData');
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });
});

/**
 * 创建模拟的ReadableStream
 */
function createMockStream(data: string[], delay: number = 10): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index < data.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
        controller.enqueue(encoder.encode(data[index]));
        index++;
      } else {
        controller.close();
      }
    }
  });
}
