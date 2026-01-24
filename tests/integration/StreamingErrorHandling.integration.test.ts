/**
 * @file 流式输出与错误处理集成测试
 * @description 测试OpenAI流式输出与错误处理系统的集成
 * @module tests/integration
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenAIModelAdapter, StreamCallback } from '../../core/adapters/OpenAIModelAdapter';
import { ErrorHandler } from '../../core/error-handler/ErrorHandler';
import { AutonomousAIConfig } from '../../core/autonomous-ai-widget/types';
import { ModelGenerationRequest } from '../../core/adapters/ModelAdapter';

describe('OpenAI流式输出 - 错误处理集成', () => {
  let adapter: OpenAIModelAdapter;
  let errorHandler: ErrorHandler;
  let config: AutonomousAIConfig;

  beforeEach(() => {
    errorHandler = new ErrorHandler({
      enableAutoRecovery: true,
      maxRetries: 3,
      retryDelay: 100
    });

    config = {
      apiType: 'openai',
      apiKey: 'test-key',
      modelName: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7
    };

    adapter = new OpenAIModelAdapter(config, errorHandler);
  });

  describe('错误恢复', () => {
    it('应该在网络错误后自动重试', async () => {
      let attemptCount = 0;
      const mockFetch = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.reject(new TypeError('Network request failed'));
        }
        
        return Promise.resolve({
          ok: true,
          body: createMockStream(['data: {"choices":[{"delta":{"content":"Success"}}]}\n\n'])
        });
      });

      global.fetch = mockFetch;

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test prompt'
      };

      const onChunk: StreamCallback = vi.fn();
      const response = await adapter.generateStream(request, onChunk);

      expect(attemptCount).toBe(2);
      expect(response.content).toBe('Success');
    });

    it('应该记录错误历史', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: { message: 'Server error' } })
      });

      global.fetch = mockFetch;

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test'
      };

      const onChunk: StreamCallback = vi.fn();

      await expect(adapter.generateStream(request, onChunk)).rejects.toThrow();

      const history = errorHandler.getErrorHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('应该在达到最大重试次数后失败', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () => Promise.resolve({ error: { message: 'Persistent error' } })
      });

      global.fetch = mockFetch;

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test'
      };

      const onChunk: StreamCallback = vi.fn();

      await expect(adapter.generateStream(request, onChunk)).rejects.toThrow('Persistent error');

      // 应该尝试了初始请求 + 最大重试次数
      expect(mockFetch).toHaveBeenCalledTimes(4); // 1 + 3 retries
    });
  });

  describe('流式错误处理', () => {
    it('应该处理流中断', async () => {
      const mockStream = {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Start"}}]}\n\n')
            })
            .mockRejectedValueOnce(new Error('Stream interrupted')),
          releaseLock: vi.fn()
        })
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      global.fetch = mockFetch;

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test'
      };

      const onChunk: StreamCallback = vi.fn();

      await expect(adapter.generateStream(request, onChunk)).rejects.toThrow('Stream interrupted');
    });

    it('应该在流式传输时收集指标', async () => {
      const mockStream = createMockStream([
        'data: {"choices":[{"delta":{"content":"Test"}}]}\n\n',
        'data: [DONE]\n\n'
      ]);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      global.fetch = mockFetch;

      await adapter.initialize(config);

      const initialMetrics = adapter.getMetrics();

      const request: ModelGenerationRequest = {
        prompt: 'Test'
      };

      const onChunk: StreamCallback = vi.fn();
      await adapter.generateStream(request, onChunk);

      const finalMetrics = adapter.getMetrics();

      expect(finalMetrics.totalRequests).toBe(initialMetrics.totalRequests + 1);
      expect(finalMetrics.successfulRequests).toBe(initialMetrics.successfulRequests + 1);
      expect(finalMetrics.averageResponseTime).toBeGreaterThan(0);
    });
  });

  describe('取消与清理', () => {
    it('应该正确清理资源在取消后', async () => {
      const mockStream = createMockStream(
        ['data: {"choices":[{"delta":{"content":"Test"}}]}\n\n'],
        5000 // 长延迟
      );

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream
      });

      global.fetch = mockFetch;

      await adapter.initialize(config);

      const request: ModelGenerationRequest = {
        prompt: 'Test'
      };

      const onChunk: StreamCallback = vi.fn();
      const generatePromise = adapter.generateStream(request, onChunk);

      // 立即取消
      setTimeout(() => adapter.cancel(), 50);

      await expect(generatePromise).rejects.toThrow();

      // 状态应该恢复
      expect(adapter.getStatus()).toBe('idle');
    });

    it('应该支持多次取消', async () => {
      await adapter.initialize(config);

      // 第一次取消
      await adapter.cancel();
      expect(adapter.getStatus()).toBe('idle');

      // 第二次取消（应该安全）
      await adapter.cancel();
      expect(adapter.getStatus()).toBe('idle');
    });
  });
});

describe('算法集成测试', () => {
  let algorithms: any;

  beforeEach(async () => {
    const { HighPerformanceAlgorithms } = await import('../../core/algorithms/HighPerformanceAlgorithms');
    algorithms = new HighPerformanceAlgorithms();
  });

  describe('排序与搜索集成', () => {
    it('应该排序后能正确搜索', () => {
      const unsorted = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50];
      const sorted = algorithms.mergeSort(unsorted);
      
      const target = 45;
      const index = algorithms.binarySearch(sorted, target);
      
      expect(index).toBeGreaterThanOrEqual(0);
      expect(sorted[index]).toBe(target);
    });

    it('应该在quickSort后进行二分查找', () => {
      const data = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000));
      const sorted = algorithms.quickSort(data);
      
      const target = sorted[500]; // 选择中间的元素
      const index = algorithms.binarySearch(sorted, target);
      
      expect(index).toBeGreaterThanOrEqual(0);
      expect(sorted[index]).toBe(target);
    });
  });

  describe('模糊搜索与排序集成', () => {
    it('应该先排序再模糊搜索', () => {
      const words = ['apple', 'apricot', 'banana', 'application', 'apply'];
      const sorted = algorithms.mergeSort(words, (a: string, b: string) => a.localeCompare(b));
      
      const results = algorithms.fuzzySearch(sorted, 'app', (item: string) => item, 0.6);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r: any) => r.similarity >= 0.6)).toBe(true);
    });
  });

  describe('聚类与回归集成', () => {
    it('应该对聚类结果进行回归分析', () => {
      // 生成两个明显的聚类
      const cluster1 = Array.from({ length: 50 }, () => [
        1 + Math.random(),
        1 + Math.random()
      ]);
      const cluster2 = Array.from({ length: 50 }, () => [
        10 + Math.random(),
        10 + Math.random()
      ]);
      const data = [...cluster1, ...cluster2];

      // 聚类
      const clusterResult = algorithms.kMeans(data, 2);
      expect(clusterResult.clusters).toHaveLength(2);

      // 对第一个聚类进行回归分析
      const cluster1Indices = clusterResult.clusters[0];
      const cluster1Data = cluster1Indices.map((idx: number) => data[idx]);
      
      if (cluster1Data.length >= 2) {
        const x = cluster1Data.map((point: number[]) => point[0]);
        const y = cluster1Data.map((point: number[]) => point[1]);
        
        const model = algorithms.linearRegression(x, y);
        
        expect(model.slope).toBeDefined();
        expect(model.intercept).toBeDefined();
        expect(typeof model.predict(5)).toBe('number');
      }
    });
  });
});

/**
 * 创建模拟流
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
