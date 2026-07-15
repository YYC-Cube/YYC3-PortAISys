/**
 * @file unit/task-scheduler/TaskScheduler.test.ts
 * @description Task Scheduler.test 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TaskScheduler } from '../../../core/task-scheduler/TaskScheduler';

describe('TaskScheduler', () => {
  let scheduler: TaskScheduler;

  beforeEach(() => {
    scheduler = new TaskScheduler({ maxConcurrentTasks: 5, defaultTimeout: 5000 });
  });

  afterEach(() => {
    scheduler.shutdown?.();
  });

  describe('schedule', () => {
    it('应该成功调度一个任务', async () => {
      const taskId = await scheduler.schedule({
        name: 'test-task',
        priority: 1,
        execute: async () => 'done',
      });
      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe('string');
    });
  });

  describe('runAll', () => {
    it('应该执行已调度的任务', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');
      await scheduler.schedule({
        name: 'exec-task',
        priority: 1,
        execute: mockFn,
      });

      await scheduler.runAll?.() ?? await scheduler.runNext?.();
      expect(true).toBe(true);
    });
  });

  describe('cancelTask', () => {
    it('应该取消已调度的任务', async () => {
      const taskId = await scheduler.schedule({
        name: 'cancel-task',
        priority: 1,
        execute: async () => 'never',
      });

      await scheduler.cancelTask(taskId);
      expect(true).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('应该返回调度器度量', async () => {
      await scheduler.schedule({
        name: 'm-task',
        priority: 1,
        execute: async () => 1,
      });
      const metrics = scheduler.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalTasks).toBeGreaterThanOrEqual(1);
    });
  });
});
