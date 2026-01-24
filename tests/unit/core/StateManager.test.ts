import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StateManager } from '../../../core/state-manager/StateManager';
import { NotFoundError } from '../../../core/error-handler/ErrorTypes';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager(
      {},
      {
        enablePersistence: false,
        enableSnapshots: false,
        snapshotInterval: 60000,
        maxSnapshots: 10,
        enableTransitions: true,
        maxTransitions: 100
      }
    );
  });

  afterEach(() => {
    stateManager.stopAutoSnapshot();
    stateManager.destroy();
  });

  describe('初始化', () => {
    it('应该正确初始化状态管理器', () => {
      expect(stateManager).toBeDefined();
      expect(stateManager['currentState']).toBeDefined();
      expect(stateManager['previousState']).toBeDefined();
      expect(stateManager['snapshots']).toEqual([]);
      expect(stateManager['transitions']).toEqual([]);
    });

    it('应该初始化指标', () => {
      const metrics = stateManager.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalTransitions).toBe(0);
      expect(metrics.totalSnapshots).toBe(0);
      expect(metrics.currentState).toBe('{}');
    });

    it('应该接受初始状态', () => {
      const manager = new StateManager({ test: 'value' });
      const state = manager.getState();
      expect(state).toEqual({ test: 'value' });
      manager.destroy();
    });
  });

  describe('getState', () => {
    it('应该返回当前状态', () => {
      const state = stateManager.getState();
      expect(state).toBeDefined();
    });

    it('应该返回状态的副本', () => {
      const state1 = stateManager.getState();
      const state2 = stateManager.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2);
    });
  });

  describe('setState', () => {
    it('应该设置新状态', () => {
      const newState = { test: 'value' };
      stateManager.setState(newState);

      const currentState = stateManager.getState();
      expect(currentState).toEqual(newState);
    });

    it('应该记录转换', () => {
      const newState = { test: 'value' };
      stateManager.setState(newState);

      expect(stateManager['transitions'].length).toBe(1);
      expect(stateManager['transitions'][0].to).toEqual(newState);
    });

    it('应该更新指标', () => {
      const newState = { test: 'value' };
      stateManager.setState(newState);

      const metrics = stateManager.getMetrics();
      expect(metrics.totalTransitions).toBe(1);
    });

    it('应该触发状态变化事件', () => {
      const listener = vi.fn();
      stateManager.on('state_changed', listener);

      const newState = { test: 'value' };
      stateManager.setState(newState);

      expect(listener).toHaveBeenCalled();
    });

    it('应该支持自定义事件和元数据', () => {
      const listener = vi.fn();
      stateManager.on('state_changed', listener);

      const newState = { test: 'value' };
      stateManager.setState(newState, 'custom_event', { key: 'value' });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'custom_event',
          metadata: { key: 'value' }
        })
      );
    });
  });

  describe('updateState', () => {
    it('应该更新状态', () => {
      const initialState = { test: 'value', count: 0 };
      stateManager.setState(initialState);

      stateManager.updateState(state => ({ ...state, count: 5 }));

      const currentState = stateManager.getState();
      expect(currentState).toEqual({ test: 'value', count: 5 });
    });

    it('应该记录转换', () => {
      const initialState = { test: 'value', count: 0 };
      stateManager.setState(initialState);

      stateManager.updateState(state => ({ ...state, count: 5 }));

      expect(stateManager['transitions'].length).toBe(2);
    });

    it('应该触发状态变化事件', () => {
      const listener = vi.fn();
      stateManager.on('state_changed', listener);

      const initialState = { test: 'value', count: 0 };
      stateManager.setState(initialState);

      stateManager.updateState(state => ({ ...state, count: 5 }));

      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('应该支持自定义事件和元数据', () => {
      const initialState = { test: 'value', count: 0 };
      stateManager.setState(initialState);

      stateManager.updateState(
        state => ({ ...state, count: 5 }),
        'custom_update',
        { key: 'value' }
      );

      const currentState = stateManager.getState();
      expect(currentState).toEqual({ test: 'value', count: 5 });
    });
  });

  describe('resetState', () => {
    it('应该重置状态到前一个状态', () => {
      const initialState = { test: 'value1' };
      stateManager.setState(initialState);

      const newState = { test: 'value2' };
      stateManager.setState(newState);

      stateManager.resetState();

      const currentState = stateManager.getState();
      expect(currentState).toEqual(initialState);
    });

    it('应该记录转换', () => {
      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      stateManager.resetState();

      expect(stateManager['transitions'].length).toBe(2);
    });

    it('应该触发状态重置事件', () => {
      const listener = vi.fn();
      stateManager.on('state_changed', listener);

      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      stateManager.resetState();

      expect(listener).toHaveBeenCalled();
    });

    it('应该支持自定义初始状态', () => {
      const initialState = { test: 'value1' };
      stateManager.setState(initialState);

      const customInitialState = { test: 'custom' };
      stateManager.resetState(customInitialState);

      const currentState = stateManager.getState();
      expect(currentState).toEqual(customInitialState);
    });
  });

  describe('createSnapshot', () => {
    it('应该创建快照', () => {
      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      const snapshotId = stateManager.createSnapshot();

      expect(snapshotId).toBeDefined();
      expect(typeof snapshotId).toBe('string');

      const snapshot = stateManager.getSnapshot(snapshotId);
      expect(snapshot).toBeDefined();
      expect(snapshot.state).toEqual(initialState);
      expect(snapshot.timestamp).toBeDefined();
    });

    it('应该添加到快照列表', () => {
      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      stateManager.createSnapshot();

      expect(stateManager['snapshots'].length).toBe(1);
    });

    it('应该更新指标', () => {
      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      stateManager.createSnapshot();

      const metrics = stateManager.getMetrics();
      expect(metrics.totalSnapshots).toBe(1);
    });

    it('应该限制最大快照数', () => {
      const limitedStateManager = new StateManager(
        {},
        {
          enablePersistence: false,
          enableSnapshots: false,
          enableTransitions: true,
          snapshotInterval: 60000,
          maxSnapshots: 2
        }
      );

      limitedStateManager.setState({ test: 'value' });
      limitedStateManager.createSnapshot();
      limitedStateManager.createSnapshot();
      limitedStateManager.createSnapshot();

      expect(limitedStateManager['snapshots'].length).toBe(2);
      limitedStateManager.destroy();
    });

    it('应该支持元数据', () => {
      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      const metadata = { type: 'manual', reason: 'test' };
      const snapshotId = stateManager.createSnapshot(metadata);

      const snapshot = stateManager.getSnapshot(snapshotId);
      expect(snapshot.metadata).toEqual(metadata);
    });

    it('应该触发快照创建事件', () => {
      const listener = vi.fn();
      stateManager.on('snapshot_created', listener);

      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      stateManager.createSnapshot();

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('restoreSnapshot', () => {
    it('应该恢复快照', () => {
      const initialState = { test: 'value', count: 0 };
      stateManager.setState(initialState);

      const snapshotId = stateManager.createSnapshot();

      stateManager.setState({ test: 'changed', count: 10 });
      stateManager.restoreSnapshot(snapshotId);

      const currentState = stateManager.getState();
      expect(currentState).toEqual(initialState);
    });

    it('应该触发快照恢复事件', () => {
      const listener = vi.fn();
      stateManager.on('snapshot_restored', listener);

      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      const snapshotId = stateManager.createSnapshot();

      stateManager.setState({ test: 'changed' });
      stateManager.restoreSnapshot(snapshotId);

      expect(listener).toHaveBeenCalled();
    });

    it('应该为不存在的快照抛出错误', () => {
      expect(() => {
        stateManager.restoreSnapshot('non-existent-id');
      }).toThrow(NotFoundError);
    });

    it('应该记录状态转换', () => {
      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      const snapshotId = stateManager.createSnapshot();

      stateManager.setState({ test: 'changed' });
      stateManager.restoreSnapshot(snapshotId);

      expect(stateManager['transitions'].length).toBe(3);
    });
  });

  describe('startAutoSnapshot', () => {
    it('应该启动自动快照', () => {
      stateManager.stopAutoSnapshot();
      stateManager.startAutoSnapshot();

      expect(stateManager['snapshotInterval']).not.toBeNull();
    });

    it('应该在指定间隔创建快照', async () => {
      const autoSnapshotManager = new StateManager(
        { test: 'value' },
        {
          enablePersistence: false,
          enableSnapshots: true,
          enableTransitions: true,
          snapshotInterval: 50,
          maxSnapshots: 10
        }
      );

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(autoSnapshotManager['snapshots'].length).toBeGreaterThan(0);
      autoSnapshotManager.destroy();
    });

    it('应该停止自动快照', () => {
      stateManager.stopAutoSnapshot();
      stateManager.startAutoSnapshot();
      stateManager.stopAutoSnapshot();

      expect(stateManager['snapshotInterval']).toBeNull();
    });

    it('应该重启自动快照', () => {
      stateManager.stopAutoSnapshot();
      stateManager.startAutoSnapshot();

      const interval1 = stateManager['snapshotInterval'];

      stateManager.startAutoSnapshot();

      const interval2 = stateManager['snapshotInterval'];

      expect(interval1).not.toBe(interval2);
    });
  });

  describe('recordTransition', () => {
    it('应该记录转换', () => {
      const fromState = { test: 'value1' };
      const toState = { test: 'value2' };

      stateManager.setState(fromState);
      stateManager.setState(toState);

      expect(stateManager['transitions'].length).toBe(2);
      expect(stateManager['transitions'][1].from).toEqual(fromState);
      expect(stateManager['transitions'][1].to).toEqual(toState);
    });

    it('应该记录转换时间', () => {
      const fromState = { test: 'value1' };
      const toState = { test: 'value2' };

      stateManager.setState(fromState);
      const beforeTime = Date.now();
      stateManager.setState(toState);
      const afterTime = Date.now();

      const transition = stateManager['transitions'][1];
      expect(transition.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(transition.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('应该更新指标', () => {
      const fromState = { test: 'value1' };
      const toState = { test: 'value2' };

      stateManager.setState(fromState);
      stateManager.setState(toState);

      const metrics = stateManager.getMetrics();
      expect(metrics.totalTransitions).toBe(2);
    });

    it('应该限制最大转换数', () => {
      const limitedStateManager = new StateManager(
        {},
        {
          enablePersistence: false,
          enableSnapshots: false,
          enableTransitions: true,
          maxTransitions: 3
        }
      );

      for (let i = 0; i < 10; i++) {
        limitedStateManager.setState({ count: i });
      }

      expect(limitedStateManager['transitions'].length).toBe(3);
      limitedStateManager.destroy();
    });

    it('应该支持自定义事件', () => {
      const fromState = { test: 'value1' };
      const toState = { test: 'value2' };

      stateManager.setState(fromState);
      stateManager.setState(toState, 'custom_event');

      const transition = stateManager['transitions'][1];
      expect(transition.event).toBe('custom_event');
    });

    it('应该支持元数据', () => {
      const fromState = { test: 'value1' };
      const toState = { test: 'value2' };

      stateManager.setState(fromState);
      stateManager.setState(toState, 'custom_event', { key: 'value' });

      const transition = stateManager['transitions'][1];
      expect(transition.metadata).toEqual({ key: 'value' });
    });
  });

  describe('getTransitions', () => {
    it('应该返回所有转换', () => {
      const fromState = { test: 'value1' };
      const toState = { test: 'value2' };

      stateManager.setState(fromState);
      stateManager.setState(toState);

      const transitions = stateManager.getTransitions();
      expect(transitions.length).toBe(2);
    });

    it('应该返回转换的副本', () => {
      const fromState = { test: 'value1' };
      const toState = { test: 'value2' };

      stateManager.setState(fromState);
      stateManager.setState(toState);

      const transitions1 = stateManager.getTransitions();
      const transitions2 = stateManager.getTransitions();

      expect(transitions1).toEqual(transitions2);
      expect(transitions1).not.toBe(transitions2);
    });

    it('应该支持限制返回数量', () => {
      for (let i = 0; i < 5; i++) {
        stateManager.setState({ count: i });
      }

      const transitions = stateManager.getTransitions(3);
      expect(transitions.length).toBe(3);
    });

    it('应该按时间倒序返回', () => {
      for (let i = 0; i < 3; i++) {
        stateManager.setState({ count: i });
      }

      const transitions = stateManager.getTransitions();
      expect(transitions[0].to.count).toBe(2);
      expect(transitions[1].to.count).toBe(1);
      expect(transitions[2].to.count).toBe(0);
    });
  });

  describe('getSnapshots', () => {
    it('应该返回所有快照', () => {
      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      stateManager.createSnapshot();

      const snapshots = stateManager.getSnapshots();
      expect(snapshots.length).toBe(1);
    });

    it('应该返回快照的副本', () => {
      const initialState = { test: 'value' };
      stateManager.setState(initialState);

      stateManager.createSnapshot();

      const snapshots1 = stateManager.getSnapshots();
      const snapshots2 = stateManager.getSnapshots();

      expect(snapshots1).toEqual(snapshots2);
      expect(snapshots1).not.toBe(snapshots2);
    });

    it('应该支持限制返回数量', () => {
      stateManager.setState({ count: 0 });
      stateManager.createSnapshot();
      stateManager.setState({ count: 1 });
      stateManager.createSnapshot();
      stateManager.setState({ count: 2 });
      stateManager.createSnapshot();

      const snapshots = stateManager.getSnapshots(2);
      expect(snapshots.length).toBe(2);
    });

    it('应该按时间倒序返回', () => {
      stateManager.setState({ count: 0 });
      stateManager.createSnapshot();
      stateManager.setState({ count: 1 });
      stateManager.createSnapshot();
      stateManager.setState({ count: 2 });
      stateManager.createSnapshot();

      const snapshots = stateManager.getSnapshots();
      expect(snapshots[0].state.count).toBe(2);
      expect(snapshots[1].state.count).toBe(1);
      expect(snapshots[2].state.count).toBe(0);
    });
  });

  describe('getMetrics', () => {
    it('应该返回指标', () => {
      const metrics = stateManager.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalTransitions).toBe(0);
      expect(metrics.totalSnapshots).toBe(0);
      expect(metrics.currentState).toBe('{}');
    });

    it('应该返回指标的副本', () => {
      const metrics1 = stateManager.getMetrics();
      const metrics2 = stateManager.getMetrics();

      expect(metrics1).toEqual(metrics2);
      expect(metrics1).not.toBe(metrics2);
    });

    it('应该更新最后转换时间', () => {
      stateManager.setState({ test: 'value' });

      const metrics = stateManager.getMetrics();
      expect(metrics.lastTransitionTime).toBeDefined();
      expect(metrics.lastTransitionTime).toBeGreaterThan(0);
    });

    it('应该更新最后快照时间', () => {
      stateManager.setState({ test: 'value' });
      stateManager.createSnapshot();

      const metrics = stateManager.getMetrics();
      expect(metrics.lastSnapshotTime).toBeDefined();
      expect(metrics.lastSnapshotTime).toBeGreaterThan(0);
    });
  });

  describe('deleteSnapshot', () => {
    it('应该删除快照', () => {
      stateManager.setState({ test: 'value' });
      const snapshotId = stateManager.createSnapshot();

      stateManager.deleteSnapshot(snapshotId);

      const snapshot = stateManager.getSnapshot(snapshotId);
      expect(snapshot).toBeUndefined();
    });

    it('应该为不存在的快照抛出错误', () => {
      expect(() => {
        stateManager.deleteSnapshot('non-existent-id');
      }).toThrow(NotFoundError);
    });

    it('应该触发快照删除事件', () => {
      const listener = vi.fn();
      stateManager.on('snapshot_deleted', listener);

      stateManager.setState({ test: 'value' });
      const snapshotId = stateManager.createSnapshot();

      stateManager.deleteSnapshot(snapshotId);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          snapshotId
        })
      );
    });
  });

  describe('clearSnapshots', () => {
    it('应该清除所有快照', () => {
      stateManager.setState({ test: 'value' });
      stateManager.createSnapshot();
      stateManager.createSnapshot();

      stateManager.clearSnapshots();

      expect(stateManager['snapshots']).toEqual([]);
    });

    it('应该重置快照指标', () => {
      stateManager.setState({ test: 'value' });
      stateManager.createSnapshot();

      stateManager.clearSnapshots();

      const metrics = stateManager.getMetrics();
      expect(metrics.totalSnapshots).toBe(0);
    });

    it('应该触发快照清除事件', () => {
      const listener = vi.fn();
      stateManager.on('snapshots_cleared', listener);

      stateManager.clearSnapshots();

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('clearTransitions', () => {
    it('应该清除所有转换', () => {
      stateManager.setState({ test: 'value1' });
      stateManager.setState({ test: 'value2' });

      stateManager.clearTransitions();

      expect(stateManager['transitions']).toEqual([]);
    });

    it('应该重置转换指标', () => {
      stateManager.setState({ test: 'value1' });
      stateManager.setState({ test: 'value2' });

      stateManager.clearTransitions();

      const metrics = stateManager.getMetrics();
      expect(metrics.totalTransitions).toBe(0);
    });

    it('应该触发转换清除事件', () => {
      const listener = vi.fn();
      stateManager.on('transitions_cleared', listener);

      stateManager.clearTransitions();

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('应该停止自动快照', () => {
      stateManager.stopAutoSnapshot();
      stateManager.startAutoSnapshot();

      stateManager.destroy();

      expect(stateManager['snapshotInterval']).toBeNull();
    });

    it('应该清除所有快照', () => {
      stateManager.setState({ test: 'value' });
      stateManager.createSnapshot();

      stateManager.destroy();

      expect(stateManager['snapshots']).toEqual([]);
    });

    it('应该清除所有转换', () => {
      stateManager.setState({ test: 'value1' });
      stateManager.setState({ test: 'value2' });

      stateManager.destroy();

      expect(stateManager['transitions']).toEqual([]);
    });

    it('应该移除所有事件监听器', () => {
      const listener = vi.fn();
      stateManager.on('state_changed', listener);

      stateManager.destroy();
      stateManager.setState({ test: 'value' });

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
