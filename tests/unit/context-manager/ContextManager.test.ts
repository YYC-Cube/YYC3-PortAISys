/**
 * @file unit/context-manager/ContextManager.test.ts
 * @description Context Manager.test 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.1.0
 * @created 2026-07-16
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from '../../../core/context-manager/ContextManager';

describe('ContextManager', () => {
  let cm: ContextManager;

  beforeEach(() => {
    cm = new ContextManager();
  });

  describe('getContext', () => {
    it('应该返回初始上下文（含 timestamp）', () => {
      const ctx = cm.getContext();
      expect(ctx).toBeDefined();
      expect(ctx.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('updateContext', () => {
    it('应该合并更新上下文', () => {
      cm.updateContext({ user: 'test-user', pageContext: { url: '/test' } });
      const ctx = cm.getContext();
      expect(ctx.user).toBe('test-user');
      expect(ctx.pageContext.url).toBe('/test');
    });

    it('应该在更新时刷新 timestamp', () => {
      const before = cm.getContext().timestamp;
      cm.updateContext({ user: 'new' });
      const after = cm.getContext().timestamp;
      expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('getPageContext', () => {
    it('应该返回页面上下文（Node 环境下为 unknown）', async () => {
      const pageCtx = await cm.getPageContext();
      expect(pageCtx).toBeDefined();
      expect(pageCtx.url).toBeDefined();
      expect(pageCtx.title).toBeDefined();
    });
  });

  describe('getMetrics', () => {
    it('应该返回上下文度量', () => {
      cm.updateContext({ user: 'a', pageContext: { x: 1 } });
      const metrics = cm.getMetrics();
      expect(metrics.contextSize).toBeGreaterThan(0);
      expect(metrics.lastUpdated).toBeDefined();
    });
  });
});
