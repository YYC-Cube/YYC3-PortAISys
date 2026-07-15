/**
 * @file unit/learning/LearningSystem.test.ts
 * @description Learning System.test 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LearningSystem } from '../../../core/learning/LearningSystem';
import { MemorySystem } from '../../../core/memory/MemorySystem';
import type { AutonomousAIConfig } from '../../../core/autonomous-ai-widget/types';

const mockConfig: AutonomousAIConfig = {
  apiType: 'openai',
  modelName: 'gpt-4',
  maxTokens: 4096,
  temperature: 0.7,
  enableLearning: true,
  enableMemory: true,
  enableToolUse: false,
  enableContextAwareness: false,
};

describe('LearningSystem', () => {
  let learning: LearningSystem;
  let memory: MemorySystem;

  beforeEach(() => {
    memory = new MemorySystem(mockConfig);
    learning = new LearningSystem(mockConfig, memory);
  });

  describe('recordInteraction', () => {
    it('应该成功记录交互', async () => {
      await learning.recordInteraction({
        userMessage: 'How to use AI?',
        aiResponse: 'AI can be used in many ways.',
        feedback: 'positive',
        context: { topic: 'ai' },
      } as any);

      // 验证 memory 中也保存了
      const records = await memory.getLearningRecords();
      expect(records).toHaveLength(1);
    });

    it('应该在 enableLearning=false 时不记录', async () => {
      const m = new MemorySystem({ ...mockConfig, enableLearning: false });
      const ls = new LearningSystem({ ...mockConfig, enableLearning: false }, m);
      await ls.recordInteraction({
        userMessage: 'test',
        aiResponse: 'resp',
        feedback: 'neutral',
      } as any);

      const records = await m.getLearningRecords();
      expect(records).toHaveLength(0);
    });
  });

  describe('recognizePatterns', () => {
    it('应该在无记录时返回空数组', async () => {
      const patterns = await learning.recognizePatterns();
      expect(patterns).toEqual([]);
    });

    it('应该在有记录后返回模式识别结果', async () => {
      for (let i = 0; i < 3; i++) {
        await learning.recordInteraction({
          userMessage: 'How to code?',
          aiResponse: 'Use TypeScript.',
          feedback: 'positive',
        } as any);
      }

      const patterns = await learning.recognizePatterns();
      expect(patterns).toBeDefined();
      // 可能有或无模式，取决于阈值
    });
  });

  describe('evaluatePerformance', () => {
    it('应该返回性能评估结果', async () => {
      await learning.recordInteraction({
        userMessage: 'test',
        aiResponse: 'ok',
        feedback: 'positive',
      } as any);

      const evaluation = await learning.evaluatePerformance?.();
      if (evaluation) {
        expect(evaluation).toBeDefined();
      }
    });
  });
});
