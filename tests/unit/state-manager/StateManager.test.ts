/**
 * @file unit/state-manager/StateManager.test.ts
 * @description State Manager.test 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../../../core/state-manager/StateManager';

describe('StateManager', () => {
  let sm: StateManager;

  beforeEach(() => {
    sm = new StateManager({ count: 0 }, { enableSnapshots: false });
  });

  describe('getState', () => {
    it('应该返回初始状态', () => {
      const state = sm.getState();
      expect(state.count).toBe(0);
    });
  });

  describe('setState', () => {
    it('应该更新状态', () => {
      sm.setState({ count: 5 });
      expect(sm.getState().count).toBe(5);
    });

    it('应该在状态变化时触发 transition 事件', () => {
      const listener = vi.fn();
      sm.on('state_changed', listener);
      sm.setState({ count: 1 });
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('createSnapshot', () => {
    it('应该创建状态快照并返回快照 ID', () => {
      const snapshotSm = new StateManager({ x: 10 }, { enableSnapshots: true, snapshotInterval: 999999 });
      snapshotSm.setState({ x: 20 });
      const snapshotId = snapshotSm.createSnapshot();
      expect(snapshotId).toBeDefined();
      expect(typeof snapshotId).toBe('string');
    });
  });

  describe('getMetrics', () => {
    it('应该返回度量信息', () => {
      sm.setState({ count: 3 });
      const metrics = sm.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalTransitions).toBeGreaterThan(0);
    });
  });
});
