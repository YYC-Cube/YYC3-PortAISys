/**
 * @file unit/knowledge-base/KnowledgeBase.test.ts
 * @description Knowledge Base.test 模块
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
import { KnowledgeBase } from '../../../core/knowledge-base/KnowledgeBase';

describe('KnowledgeBase', () => {
  let kb: KnowledgeBase;

  beforeEach(() => {
    kb = new KnowledgeBase({ maxItems: 100 });
  });

  describe('add', () => {
    it('应该成功添加知识项并返回 ID', async () => {
      const id = await kb.add({
        type: 'fact',
        content: 'The sky is blue',
        tags: ['nature'],
      });
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('应该拒绝超过最大容量的添加', async () => {
      const small = new KnowledgeBase({ maxItems: 1 });
      await small.add({ type: 'fact', content: 'item1' });
      await expect(small.add({ type: 'fact', content: 'item2' })).rejects.toThrow();
    });
  });

  describe('query', () => {
    it('应该按类型查询', async () => {
      await kb.add({ type: 'fact', content: 'fact1' });
      await kb.add({ type: 'rule', content: 'rule1' });

      const results = await kb.query({ type: 'fact' });
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('fact');
    });

    it('应该按标签查询', async () => {
      await kb.add({ type: 'fact', content: 'a', tags: ['tag1'] });
      await kb.add({ type: 'fact', content: 'b', tags: ['tag2'] });

      const results = await kb.query({ tags: ['tag1'] });
      expect(results).toHaveLength(1);
    });

    it('应该按最低置信度过滤', async () => {
      await kb.add({ type: 'fact', content: 'high', confidence: 0.9 });
      await kb.add({ type: 'fact', content: 'low', confidence: 0.3 });

      const results = await kb.query({ minConfidence: 0.5 });
      expect(results).toHaveLength(1);
      expect(results[0].confidence).toBe(0.9);
    });
  });

  describe('update', () => {
    it('应该成功更新已有项', async () => {
      const id = await kb.add({ type: 'fact', content: 'original' });
      await kb.update(id, { content: 'updated' });

      const results = await kb.query({});
      expect(results[0].content).toBe('updated');
    });

    it('应该抛出 NotFoundError 当更新不存在的项', async () => {
      await expect(kb.update('nonexistent', { content: 'x' })).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('应该成功删除已有项', async () => {
      const id = await kb.add({ type: 'fact', content: 'temp' });
      await kb.remove(id);
      const results = await kb.query({});
      expect(results).toHaveLength(0);
    });

    it('应该抛出 NotFoundError 当删除不存在的项', async () => {
      await expect(kb.remove('nonexistent')).rejects.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('应该正确返回度量信息', async () => {
      await kb.add({ type: 'fact', content: 'a' });
      await kb.add({ type: 'rule', content: 'b' });

      const metrics = kb.getMetrics();
      expect(metrics.totalItems).toBe(2);
      expect(metrics.totalQueries).toBeGreaterThanOrEqual(0);
    });
  });
});
