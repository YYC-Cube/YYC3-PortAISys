/**
 * @file unit/message-bus/MessageBus.test.ts
 * @description Message Bus.test 模块
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
import { MessageBus } from '../../../core/message-bus/MessageBus';

describe('MessageBus', () => {
  let bus: MessageBus;

  beforeEach(() => {
    bus = new MessageBus({ enableHistory: true, maxHistorySize: 100 });
  });

  afterEach(() => {
    bus.destroy();
  });

  describe('subscribe + publish', () => {
    it('应该将消息投递给已订阅的处理器', async () => {
      const received: any[] = [];
      bus.subscribe('test.event', (msg) => {
        received.push(msg);
      });

      await bus.publish({
        type: 'test.event',
        source: 'unit-test',
        payload: { hello: 'world' },
        priority: 'normal',
      });

      expect(received).toHaveLength(1);
      expect(received[0].payload.hello).toBe('world');
    });

    it('不应该投递给其他类型的订阅者', async () => {
      const received: any[] = [];
      bus.subscribe('other.event', () => { received.push(1); });

      await bus.publish({
        type: 'test.event',
        source: 'unit-test',
        payload: {},
        priority: 'normal',
      });

      expect(received).toHaveLength(0);
    });
  });

  describe('unsubscribe', () => {
    it('应该取消订阅后不再收到消息', async () => {
      const received: any[] = [];
      const subId = bus.subscribe('test.event', (msg) => { received.push(msg); });
      bus.unsubscribe(subId);

      await bus.publish({
        type: 'test.event',
        source: 'test',
        payload: {},
        priority: 'normal',
      });

      expect(received).toHaveLength(0);
    });
  });

  describe('getMetrics', () => {
    it('应该返回总线度量', async () => {
      bus.subscribe('test.event', () => {});
      await bus.publish({
        type: 'test.event',
        source: 'test',
        payload: {},
        priority: 'normal',
      });

      const metrics = bus.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.handlersCount).toBeGreaterThan(0);
    });
  });

  describe('publishBatch', () => {
    it('应该批量发布消息', async () => {
      const received: any[] = [];
      bus.subscribe('batch.event', (msg) => received.push(msg));

      await bus.publishBatch([
        { type: 'batch.event', source: 'a', payload: 1, priority: 'normal' },
        { type: 'batch.event', source: 'b', payload: 2, priority: 'normal' },
      ]);

      expect(received).toHaveLength(2);
    });
  });
});
