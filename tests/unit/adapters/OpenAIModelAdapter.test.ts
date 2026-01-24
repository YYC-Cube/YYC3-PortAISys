import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OpenAIModelAdapter } from '../../../core/adapters/OpenAIModelAdapter'
import type { AutonomousAIConfig } from '../../../core/autonomous-ai-widget/types'

describe('OpenAIModelAdapter - 基础功能', () => {
  let adapter: OpenAIModelAdapter
  let config: AutonomousAIConfig

  beforeEach(() => {
    config = {
      apiType: 'openai',
      apiKey: 'test-api-key',
      modelName: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7,
    }

    adapter = new OpenAIModelAdapter(config)
  })

  describe('初始化和配置', () => {
    it('应该正确初始化适配器', async () => {
      await adapter.initialize(config)
      expect(adapter.isInitialized()).toBe(true)
      expect(adapter.getModelName()).toBe('gpt-4')
    })

    it('应该支持配置更新', async () => {
      await adapter.initialize(config)

      const newConfig = { ...config, temperature: 0.5 }
      await adapter.updateConfig(newConfig)

      expect(adapter.getConfig().temperature).toBe(0.5)
    })

    it('应该验证API密钥', async () => {
      const invalidConfig = { ...config, apiKey: '' }

      await expect(adapter.initialize(invalidConfig)).rejects.toThrow('API key')
    })
  })

  describe('文本生成 (非流式)', () => {
    it('应该生成文本响应', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello, World!' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
          model: 'gpt-4',
        }),
      } as any)

      await adapter.initialize(config)

      const result = await adapter.generate({
        prompt: 'Say hello',
      })

      expect(result.content).toBe('Hello, World!')
      expect(result.usage?.totalTokens).toBe(15)
      expect(result.modelId).toBe('gpt-4')
    })

    it('应该支持消息数组格式', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
          usage: { total_tokens: 20 },
        }),
      } as any)

      await adapter.initialize(config)

      const result = await adapter.generate({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi!' },
          { role: 'user', content: 'How are you?' },
        ],
      })

      expect(result.content).toBe('Response')
    })

    it('应该处理系统提示', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Formal response' } }],
          usage: { total_tokens: 15 },
        }),
      } as any)

      await adapter.initialize(config)

      const result = await adapter.generate({
        prompt: 'Explain AI',
        systemPrompt: 'You are a professional teacher.',
      })

      expect(result.content).toBe('Formal response')
    })
  })

  describe('工具调用 (Function Calling)', () => {
    it('应该支持工具定义', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                tool_calls: [
                  {
                    id: 'call_123',
                    type: 'function',
                    function: {
                      name: 'get_weather',
                      arguments: JSON.stringify({ location: 'Beijing' }),
                    },
                  },
                ],
              },
            },
          ],
          usage: { total_tokens: 25 },
        }),
      } as any)

      await adapter.initialize(config)

      const result = await adapter.generate({
        prompt: 'What is the weather in Beijing?',
        tools: [
          {
            name: 'get_weather',
            description: 'Get weather information',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
            },
          },
        ],
      })

      expect(result.toolUsed).toBe(true)
      expect(result.toolCall?.name).toBe('get_weather')
      expect(result.toolCall?.params.location).toBe('Beijing')
    })

    it('应该支持强制工具使用', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                tool_calls: [
                  {
                    id: 'call_456',
                    type: 'function',
                    function: {
                      name: 'search',
                      arguments: JSON.stringify({ query: 'test' }),
                    },
                  },
                ],
              },
            },
          ],
          usage: { total_tokens: 20 },
        }),
      } as any)

      await adapter.initialize(config)

      const result = await adapter.generate({
        prompt: 'Search for test',
        tools: [
          {
            name: 'search',
            description: 'Search tool',
            parameters: {},
          },
        ],
        forceToolUse: true,
      })

      expect(result.toolUsed).toBe(true)
      expect(result.toolCall?.name).toBe('search')
    })
  })

  describe('嵌入向量生成', () => {
    it('应该生成文本嵌入', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            {
              embedding: Array(1536).fill(0.1),
            },
          ],
          usage: { total_tokens: 8 },
        }),
      } as any)

      await adapter.initialize(config)

      const result = await adapter.createEmbedding({
        input: 'Test text',
      })

      expect(result.embedding).toBeDefined()
      expect(result.embedding.length).toBe(1536)
    })

    it('应该支持批量嵌入', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { embedding: Array(1536).fill(0.1) },
            { embedding: Array(1536).fill(0.2) },
            { embedding: Array(1536).fill(0.3) },
          ],
          usage: { total_tokens: 24 },
        }),
      } as any)

      await adapter.initialize(config)

      const results = await adapter.createEmbeddings({
        inputs: ['Text 1', 'Text 2', 'Text 3'],
      })

      expect(results).toHaveLength(3)
      expect(results[0].embedding.length).toBe(1536)
    })
  })

  describe('错误处理', () => {
    it('应该处理API错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: { message: 'Invalid API key' },
        }),
      } as any)

      await adapter.initialize(config)

      await expect(adapter.generate({ prompt: 'test' })).rejects.toThrow('Invalid API key')
    })

    it('应该处理速率限制', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          error: { message: 'Rate limit exceeded', type: 'rate_limit_error' },
        }),
      } as any)

      await adapter.initialize(config)

      await expect(adapter.generate({ prompt: 'test' })).rejects.toThrow('Rate limit exceeded')
    })

    it('应该处理网络错误', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

      await adapter.initialize(config)

      await expect(adapter.generate({ prompt: 'test' })).rejects.toThrow('Network error')
    })

    it('应该处理超时', async () => {
      vi.spyOn(global, 'fetch').mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      )

      await adapter.initialize(config)

      await expect(adapter.generate({ prompt: 'test', timeout: 1000 })).rejects.toThrow('timeout')
    })
  })

  describe('重试机制', () => {
    it('应该自动重试临时错误', async () => {
      let attemptCount = 0

      vi.spyOn(global, 'fetch').mockImplementation(async () => {
        attemptCount++
        if (attemptCount < 3) {
          return {
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'Server error' } }),
          } as any
        }
        return {
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Success' } }],
            usage: { total_tokens: 10 },
          }),
        } as any
      })

      await adapter.initialize(config)

      const result = await adapter.generate({
        prompt: 'test',
        maxRetries: 3,
      })

      expect(attemptCount).toBe(3)
      expect(result.content).toBe('Success')
    })

    it('应该使用指数退避', async () => {
      let attemptCount = 0
      const delays: number[] = []
      let lastCallTime = Date.now()

      vi.spyOn(global, 'fetch').mockImplementation(async () => {
        const now = Date.now()
        attemptCount++

        // 记录调用间隔（从第二次开始）
        if (attemptCount > 1) {
          delays.push(now - lastCallTime)
        }
        lastCallTime = now

        // 前两次请求失败，第三次成功
        if (attemptCount < 3) {
          return {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({ error: { message: 'Server Error' } }),
          } as any
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: 'Success after retry' } }],
            usage: { total_tokens: 10 },
          }),
        } as any
      })

      await adapter.initialize(config)

      const result = await adapter.generate({
        prompt: 'test exponential backoff',
        maxRetries: 3,
        retryDelay: 100,
      })

      // 验证请求成功
      expect(result.content).toBe('Success after retry')
      expect(attemptCount).toBe(3)

      // 验证指数退避：第二次延迟应该大于第一次延迟
      // 由于真实时间延迟，至少应该有两次重试间隔被记录
      expect(delays.length).toBeGreaterThanOrEqual(1)
      if (delays.length >= 2) {
        expect(delays[1]).toBeGreaterThanOrEqual(delays[0])
      }
    })
  })

  describe('指标收集', () => {
    it('应该跟踪请求统计', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test' } }],
          usage: { total_tokens: 10 },
        }),
      } as any)

      await adapter.initialize(config)

      const initialMetrics = adapter.getMetrics()
      const initialRequests = initialMetrics.totalRequests

      await adapter.generate({ prompt: 'test 1' })
      await adapter.generate({ prompt: 'test 2' })

      const finalMetrics = adapter.getMetrics()

      expect(finalMetrics.totalRequests).toBe(initialRequests + 2)
      expect(finalMetrics.successfulRequests).toBeGreaterThanOrEqual(2)
    })

    it('应该计算平均响应时间', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test' } }],
          usage: { total_tokens: 10 },
        }),
      } as any)

      await adapter.initialize(config)

      await adapter.generate({ prompt: 'test 1' })
      await adapter.generate({ prompt: 'test 2' })

      const metrics = adapter.getMetrics()

      expect(metrics.averageResponseTime).toBeGreaterThan(0)
      expect(metrics.averageTokensPerRequest).toBeGreaterThan(0)
    })
  })

  describe('取消操作', () => {
    it('应该支持取消请求', async () => {
      vi.spyOn(global, 'fetch').mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 5000))
      )

      await adapter.initialize(config)

      const promise = adapter.generate({ prompt: 'test' })

      setTimeout(() => {
        adapter.cancel()
      }, 100)

      await expect(promise).rejects.toThrow()
    })
  })
})
