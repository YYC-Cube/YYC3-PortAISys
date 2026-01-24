import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiModelManager } from '../../core/ai/MultiModelManager';
import type { ModelProvider, ModelConfig } from '../../core/ai/types';

describe('多模型管理集成测试', () => {
  let modelManager: MultiModelManager;

  beforeEach(async () => {
    modelManager = new MultiModelManager({
      defaultProvider: 'openai',
      fallbackEnabled: true,
      loadBalancing: true,
      caching: true,
    });

    // 注册多个模型提供商
    await modelManager.registerProvider('openai', {
      apiKey: process.env.OPENAI_API_KEY || 'test-key',
      models: ['gpt-4', 'gpt-3.5-turbo'],
    });

    await modelManager.registerProvider('anthropic', {
      apiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
      models: ['claude-3-opus', 'claude-3-sonnet'],
    });

    await modelManager.registerProvider('google', {
      apiKey: process.env.GOOGLE_API_KEY || 'test-key',
      models: ['gemini-pro', 'gemini-pro-vision'],
    });

    await modelManager.initialize();
  });

  afterEach(async () => {
    await modelManager.shutdown();
  });

  describe('模型选择策略', () => {
    it('应该根据性能选择最佳模型', async () => {
      const selected = await modelManager.selectModel({
        task: 'text-generation',
        strategy: 'performance',
        requirements: {
          maxLatency: 1000,
          minQuality: 0.8,
        },
      });

      expect(selected).toBeDefined();
      expect(selected.provider).toBeDefined();
      expect(selected.modelId).toBeDefined();
    });

    it('应该根据成本选择模型', async () => {
      const selected = await modelManager.selectModel({
        task: 'text-generation',
        strategy: 'cost',
        requirements: {
          maxCostPerToken: 0.00001,
        },
      });

      expect(selected).toBeDefined();
      expect(selected.estimatedCost).toBeDefined();
      expect(selected.estimatedCost).toBeLessThanOrEqual(0.00001);
    });

    it('应该根据质量选择模型', async () => {
      const selected = await modelManager.selectModel({
        task: 'code-generation',
        strategy: 'quality',
        requirements: {
          minAccuracy: 0.9,
        },
      });

      expect(selected).toBeDefined();
      expect(selected.qualityMetrics.accuracy).toBeGreaterThanOrEqual(0.9);
    });

    it('应该根据可用性选择模型', async () => {
      // 模拟某些模型不可用
      vi.spyOn(modelManager, 'checkModelAvailability')
        .mockResolvedValueOnce(false) // openai不可用
        .mockResolvedValueOnce(true); // anthropic可用

      const selected = await modelManager.selectModel({
        task: 'text-generation',
        strategy: 'availability',
      });

      expect(selected).toBeDefined();
      expect(selected.provider).not.toBe('openai');
    });

    it('应该实现负载均衡', async () => {
      const selections: string[] = [];

      // 进行多次选择
      for (let i = 0; i < 10; i++) {
        const selected = await modelManager.selectModel({
          task: 'text-generation',
          strategy: 'load-balance',
        });
        selections.push(`${selected.provider}:${selected.modelId}`);
      }

      // 应该使用多个不同的模型
      const uniqueSelections = new Set(selections);
      expect(uniqueSelections.size).toBeGreaterThan(1);
    });
  });

  describe('模型生成和推理', () => {
    it('应该使用选定的模型生成文本', async () => {
      const result = await modelManager.generate({
        prompt: 'Write a short story about AI',
        maxTokens: 100,
        temperature: 0.7,
      });

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.modelUsed).toBeDefined();
      expect(result.tokensUsed).toBeGreaterThan(0);
    });

    it('应该支持流式生成', async () => {
      const chunks: string[] = [];

      await modelManager.generateStream({
        prompt: 'Count from 1 to 10',
        onChunk: (chunk) => {
          chunks.push(chunk);
        },
      });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('')).toContain('1');
    });

    it('应该支持批量推理', async () => {
      const prompts = [
        'Translate "hello" to Spanish',
        'Translate "goodbye" to French',
        'Translate "thank you" to German',
      ];

      const results = await modelManager.batchGenerate(prompts);

      expect(results).toHaveLength(3);
      expect(results[0].text).toContain('hola');
      expect(results[1].text).toContain('au revoir');
      expect(results[2].text).toContain('danke');
    });

    it('应该支持多模态输入', async () => {
      const result = await modelManager.generate({
        prompt: 'What is in this image?',
        images: [
          {
            url: 'https://example.com/image.jpg',
            type: 'url',
          },
        ],
        modelPreference: 'vision-capable',
      });

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.modelUsed).toContain('vision');
    });
  });

  describe('容错和故障转移', () => {
    it('应该在主模型失败时切换到备用模型', async () => {
      let primaryCalled = false;
      let fallbackCalled = false;

      // 模拟主模型失败
      vi.spyOn(modelManager, 'callModel').mockImplementation(
        async (provider, modelId, params) => {
          if (provider === 'openai' && !primaryCalled) {
            primaryCalled = true;
            throw new Error('Primary model failed');
          }
          if (provider === 'anthropic') {
            fallbackCalled = true;
            return { text: 'Fallback response', tokensUsed: 10 };
          }
          throw new Error('Unexpected call');
        }
      );

      const result = await modelManager.generate({
        prompt: 'Test prompt',
        fallback: true,
      });

      expect(primaryCalled).toBe(true);
      expect(fallbackCalled).toBe(true);
      expect(result.text).toBe('Fallback response');
    });

    it('应该重试临时失败', async () => {
      let attemptCount = 0;

      vi.spyOn(modelManager, 'callModel').mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Rate limit exceeded');
        }
        return { text: 'Success after retry', tokensUsed: 10 };
      });

      const result = await modelManager.generate({
        prompt: 'Test prompt',
        retries: 3,
        retryDelay: 100,
      });

      expect(attemptCount).toBe(3);
      expect(result.text).toBe('Success after retry');
    });

    it('应该处理超时', async () => {
      vi.spyOn(modelManager, 'callModel').mockImplementation(
        async () =>
          new Promise((resolve) => setTimeout(() => resolve({ text: 'Late response', tokensUsed: 10 }), 5000))
      );

      const start = Date.now();
      await expect(
        modelManager.generate({
          prompt: 'Test prompt',
          timeout: 1000,
        })
      ).rejects.toThrow('timeout');

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });

    it('应该降级到更简单的模型', async () => {
      // 模拟高级模型不可用
      vi.spyOn(modelManager, 'checkModelAvailability').mockImplementation(
        async (provider, modelId) => {
          return !modelId.includes('gpt-4');
        }
      );

      const result = await modelManager.generate({
        prompt: 'Simple task',
        preferredModel: 'gpt-4',
        allowDowngrade: true,
      });

      expect(result).toBeDefined();
      expect(result.modelUsed).not.toContain('gpt-4');
    });
  });

  describe('性能监控', () => {
    it('应该跟踪模型性能指标', async () => {
      await modelManager.generate({ prompt: 'Test 1' });
      await modelManager.generate({ prompt: 'Test 2' });
      await modelManager.generate({ prompt: 'Test 3' });

      const metrics = modelManager.getPerformanceMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.avgLatency).toBeGreaterThan(0);
      expect(metrics.successRate).toBeGreaterThan(0);
    });

    it('应该跟踪各提供商的使用情况', async () => {
      await modelManager.generate({ prompt: 'Test', provider: 'openai' });
      await modelManager.generate({ prompt: 'Test', provider: 'anthropic' });
      await modelManager.generate({ prompt: 'Test', provider: 'openai' });

      const usage = modelManager.getProviderUsage();

      expect(usage.openai.requests).toBe(2);
      expect(usage.anthropic.requests).toBe(1);
    });

    it('应该计算成本统计', async () => {
      await modelManager.generate({
        prompt: 'Generate a long text',
        maxTokens: 1000,
      });

      const costs = modelManager.getCostStatistics();

      expect(costs).toBeDefined();
      expect(costs.totalCost).toBeGreaterThan(0);
      expect(costs.costByProvider).toBeDefined();
    });

    it('应该检测性能下降', async () => {
      const alerts: any[] = [];

      modelManager.on('performance:degraded', (alert) => {
        alerts.push(alert);
      });

      // 模拟性能下降
      for (let i = 0; i < 10; i++) {
        vi.spyOn(modelManager, 'callModel').mockImplementation(
          async () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ text: 'Slow response', tokensUsed: 10 }), 5000)
            )
        );

        try {
          await modelManager.generate({ prompt: 'Test', timeout: 6000 });
        } catch (e) {
          // 忽略超时错误
        }
      }

      expect(alerts.length).toBeGreaterThan(0);
    }, 70000);
  });

  describe('缓存和优化', () => {
    it('应该缓存相同的请求', async () => {
      const prompt = 'What is 2+2?';

      // 第一次请求
      const start1 = Date.now();
      const result1 = await modelManager.generate({
        prompt,
        cache: true,
      });
      const duration1 = Date.now() - start1;

      // 第二次请求（应该从缓存获取）
      const start2 = Date.now();
      const result2 = await modelManager.generate({
        prompt,
        cache: true,
      });
      const duration2 = Date.now() - start2;

      expect(result1.text).toBe(result2.text);
      expect(duration2).toBeLessThan(duration1);
      expect(result2.fromCache).toBe(true);
    });

    it('应该支持语义缓存', async () => {
      // 语义相似的请求应该命中缓存
      const prompt1 = 'What is the capital of France?';
      const prompt2 = 'Tell me the capital city of France';

      await modelManager.generate({
        prompt: prompt1,
        cache: true,
        semanticCache: true,
      });

      const result = await modelManager.generate({
        prompt: prompt2,
        cache: true,
        semanticCache: true,
      });

      expect(result.fromCache).toBe(true);
      expect(result.semanticMatch).toBe(true);
    });

    it('应该压缩prompt以节省tokens', async () => {
      const longPrompt = `
        This is a very long prompt with lots of repetitive information.
        ${Array(100).fill('Repeat this sentence. ').join('')}
        Please provide a concise answer.
      `;

      const result = await modelManager.generate({
        prompt: longPrompt,
        compressPrompt: true,
      });

      expect(result).toBeDefined();
      expect(result.originalTokens).toBeGreaterThan(result.compressedTokens);
    });

    it('应该批量处理以提高效率', async () => {
      const prompts = Array.from({ length: 20 }, (_, i) => `Task ${i}`);

      const start = Date.now();
      const results = await modelManager.batchGenerate(prompts, {
        batchSize: 5,
        parallel: true,
      });
      const duration = Date.now() - start;

      expect(results).toHaveLength(20);
      // 批量处理应该比逐个处理快
      expect(duration).toBeLessThan(prompts.length * 1000);
    });
  });

  describe('模型比较和A/B测试', () => {
    it('应该同时调用多个模型进行比较', async () => {
      const prompt = 'Explain quantum computing in simple terms';

      const comparison = await modelManager.compareModels(prompt, [
        { provider: 'openai', modelId: 'gpt-4' },
        { provider: 'anthropic', modelId: 'claude-3-opus' },
        { provider: 'google', modelId: 'gemini-pro' },
      ]);

      expect(comparison).toHaveLength(3);
      expect(comparison[0].response).toBeDefined();
      expect(comparison[0].latency).toBeDefined();
      expect(comparison[0].quality).toBeDefined();
    });

    it('应该支持A/B测试', async () => {
      const testConfig = {
        variantA: { provider: 'openai', modelId: 'gpt-4' },
        variantB: { provider: 'anthropic', modelId: 'claude-3-opus' },
        splitRatio: 0.5,
      };

      await modelManager.startABTest('test-1', testConfig);

      const results: any[] = [];

      // 进行多次请求
      for (let i = 0; i < 100; i++) {
        const result = await modelManager.generate({
          prompt: 'Test prompt',
          abTest: 'test-1',
        });
        results.push(result);
      }

      const variantACount = results.filter(
        (r) => r.modelUsed.includes('gpt-4')
      ).length;
      const variantBCount = results.filter((r) =>
        r.modelUsed.includes('claude')
      ).length;

      // 应该大致按50/50分配
      expect(variantACount).toBeGreaterThan(40);
      expect(variantACount).toBeLessThan(60);
      expect(variantBCount).toBeGreaterThan(40);
      expect(variantBCount).toBeLessThan(60);
    });

    it('应该分析A/B测试结果', async () => {
      await modelManager.startABTest('test-2', {
        variantA: { provider: 'openai', modelId: 'gpt-4' },
        variantB: { provider: 'anthropic', modelId: 'claude-3-opus' },
        splitRatio: 0.5,
      });

      // 执行一些测试请求
      for (let i = 0; i < 50; i++) {
        await modelManager.generate({
          prompt: `Test prompt ${i}`,
          abTest: 'test-2',
        });
      }

      const analysis = await modelManager.analyzeABTest('test-2');

      expect(analysis).toBeDefined();
      expect(analysis.variantA.requests).toBeGreaterThan(0);
      expect(analysis.variantB.requests).toBeGreaterThan(0);
      expect(analysis.winner).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
    });
  });

  describe('配额和限流', () => {
    it('应该强制执行速率限制', async () => {
      const rateLimit = { requestsPerMinute: 50 };
      await modelManager.setRateLimit('openai', rateLimit);

      const promises = [];
      for (let i = 0; i < 60; i++) {
        promises.push(
          modelManager.generate({
            prompt: `Request ${i}`,
            provider: 'openai',
          })
        );
      }

      const start = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - start;

      // 应该需要至少12秒来完成60个请求（50个/分钟）
      expect(duration).toBeGreaterThan(12000);
    }, 120000);

    it('应该跟踪配额使用', async () => {
      await modelManager.setQuota('openai', {
        maxTokensPerDay: 10000,
        maxRequestsPerDay: 100,
      });

      await modelManager.generate({
        prompt: 'Test',
        provider: 'openai',
        maxTokens: 100,
      });

      const quota = modelManager.getQuotaUsage('openai');

      expect(quota).toBeDefined();
      expect(quota.tokensUsed).toBeGreaterThan(0);
      expect(quota.requestsUsed).toBe(1);
      expect(quota.remaining.tokens).toBeLessThan(10000);
    });

    it('应该在超出配额时阻止请求', async () => {
      await modelManager.setQuota('openai', {
        maxRequestsPerDay: 1,
      });

      // 第一个请求应该成功
      await modelManager.generate({
        prompt: 'Test 1',
        provider: 'openai',
      });

      // 第二个请求应该失败
      await expect(
        modelManager.generate({
          prompt: 'Test 2',
          provider: 'openai',
        })
      ).rejects.toThrow('Quota exceeded');
    });
  });

  describe('模型微调和定制', () => {
    it('应该支持模型微调', async () => {
      const trainingData = [
        { prompt: 'Input 1', completion: 'Output 1' },
        { prompt: 'Input 2', completion: 'Output 2' },
        { prompt: 'Input 3', completion: 'Output 3' },
      ];

      const fineTuneJob = await modelManager.fineTuneModel({
        provider: 'openai',
        baseModel: 'gpt-3.5-turbo',
        trainingData,
        validationData: trainingData.slice(0, 1),
      });

      expect(fineTuneJob).toBeDefined();
      expect(fineTuneJob.id).toBeDefined();
      expect(fineTuneJob.status).toBe('created');
    });

    it('应该监控微调进度', async () => {
      const jobId = 'ft-job-123';

      const progress = await modelManager.getFineTuneProgress(jobId);

      expect(progress).toBeDefined();
      expect(progress.status).toBeDefined();
      expect(progress.trainingSteps).toBeGreaterThanOrEqual(0);
    });

    it('应该使用微调后的模型', async () => {
      const fineTunedModelId = 'ft:gpt-3.5-turbo:custom';

      await modelManager.registerCustomModel({
        id: fineTunedModelId,
        provider: 'openai',
        baseModel: 'gpt-3.5-turbo',
        type: 'fine-tuned',
      });

      const result = await modelManager.generate({
        prompt: 'Test with fine-tuned model',
        modelId: fineTunedModelId,
      });

      expect(result).toBeDefined();
      expect(result.modelUsed).toBe(fineTunedModelId);
    });
  });

  describe('安全和合规', () => {
    it('应该过滤敏感内容', async () => {
      const result = await modelManager.generate({
        prompt: 'Potentially harmful content',
        contentFilter: true,
      });

      expect(result).toBeDefined();
      if (result.filtered) {
        expect(result.filterReason).toBeDefined();
      }
    });

    it('应该记录审计日志', async () => {
      await modelManager.generate({
        prompt: 'Test prompt',
        auditLog: true,
      });

      const logs = modelManager.getAuditLogs();

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].timestamp).toBeDefined();
      expect(logs[0].prompt).toBe('Test prompt');
      expect(logs[0].modelUsed).toBeDefined();
    });

    it('应该支持数据加密', async () => {
      const result = await modelManager.generate({
        prompt: 'Sensitive data',
        encrypt: true,
        encryptionKey: 'test-key-123',
      });

      expect(result).toBeDefined();
      expect(result.encrypted).toBe(true);
    });

    it('应该验证输入', async () => {
      await expect(
        modelManager.generate({
          prompt: '', // 空prompt
        })
      ).rejects.toThrow('Invalid prompt');

      await expect(
        modelManager.generate({
          prompt: 'x'.repeat(100000), // 过长的prompt
        })
      ).rejects.toThrow('Prompt too long');
    });
  });
});