import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AutonomousAIEngine } from '../../core/AutonomousAIEngine';

describe('AI Engine 集成测试', () => {
  let engine: AutonomousAIEngine;

  beforeAll(async () => {
    engine = new AutonomousAIEngine({
      mode: 'autonomous',
      enableLearning: true,
    });
    await engine.initialize();
  });

  afterAll(async () => {
    await engine.shutdown();
  });

  describe('核心功能', () => {
    it('应该处理用户请求', async () => {
      const result = await engine.processRequest({
        type: 'query',
        content: '什么是人工智能？',
      });

      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
    });

    it('应该分析用户意图', async () => {
      const intent = await engine.analyzeIntent('我想查询订单状态');

      expect(intent).toBeDefined();
      expect(intent.type).toBe('query');
      expect(intent.entities).toContain('order');
    });
  });

  describe('自主学习', () => {
    it('应该从交互中学习', async () => {
      await engine.processRequest({
        type: 'query',
        content: '测试问题',
        feedback: 'positive',
      });

      const knowledge = engine.getKnowledgeBase();
      expect(knowledge.size).toBeGreaterThan(0);
    });
  });

  describe('性能', () => {
    it('应该在合理时间内响应', async () => {
      const start = Date.now();
      await engine.processRequest({
        type: 'query',
        content: '快速测试',
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });
});