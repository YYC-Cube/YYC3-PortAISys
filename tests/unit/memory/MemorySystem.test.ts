/**
 * @file unit/memory/MemorySystem.test.ts
 * @description Memory System.test 模块
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

describe('MemorySystem', () => {
  let memory: MemorySystem;

  beforeEach(() => {
    memory = new MemorySystem(mockConfig);
  });

  describe('saveInteractionHistory', () => {
    it('应该成功保存交互历史', async () => {
      await memory.saveInteractionHistory(
        { content: 'Hello', role: 'user', timestamp: new Date().toISOString() },
        { content: 'Hi there', role: 'assistant', timestamp: new Date().toISOString() }
      );
      const history = await memory.getInteractionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].user.content).toBe('Hello');
    });

    it('应该在 enableMemory=false 时不保存', async () => {
      const m = new MemorySystem({ ...mockConfig, enableMemory: false });
      await m.saveInteractionHistory(
        { content: 'test', role: 'user', timestamp: new Date().toISOString() },
        { content: 'resp', role: 'assistant', timestamp: new Date().toISOString() }
      );
      const history = await m.getInteractionHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('cacheAnswer', () => {
    it('应该缓存并返回答案', async () => {
      await memory.cacheAnswer('What is AI?', 'Artificial Intelligence');
      const cached = await memory.getCachedAnswer('What is AI?');
      expect(cached).toBe('Artificial Intelligence');
    });

    it('应该在大小写不敏感时匹配缓存', async () => {
      await memory.cacheAnswer('Hello', 'World');
      const cached = await memory.getCachedAnswer('hello');
      expect(cached).toBe('World');
    });

    it('应该在无缓存时返回 null', async () => {
      const cached = await memory.getCachedAnswer('nonexistent');
      expect(cached).toBeNull();
    });
  });

  describe('getAnswersForQuery', () => {
    it('应该从交互历史中返回匹配答案', async () => {
      await memory.saveInteractionHistory(
        { content: 'How to code', role: 'user', timestamp: new Date().toISOString() },
        { content: 'Use TypeScript', role: 'assistant', timestamp: new Date().toISOString() }
      );
      const answers = await memory.getAnswersForQuery('code');
      expect(answers).toContain('Use TypeScript');
    });
  });

  describe('saveLearningRecord', () => {
    it('应该成功保存学习记录', async () => {
      await memory.saveLearningRecord({
        id: 'test-record',
        timestamp: new Date().toISOString(),
        userMessage: 'test',
        aiResponse: 'response',
        feedback: 'positive',
        context: {},
      } as any);

      const records = await memory.getLearningRecords();
      expect(records).toHaveLength(1);
    });

    it('应该在 enableLearning=false 时不保存', async () => {
      const m = new MemorySystem({ ...mockConfig, enableLearning: false });
      await m.saveLearningRecord({
        id: 'test',
        timestamp: new Date().toISOString(),
      } as any);
      const records = await m.getLearningRecords();
      expect(records).toHaveLength(0);
    });
  });
});
