/**
 * @file unit/autonomous-ai-widget/AutonomousAIEngine.test.ts
 * @description Autonomous AIEngine.test 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AutonomousAIEngine, EngineConfig } from '../../../core/autonomous-ai-widget/AutonomousAIEngine';

const mockConfig: EngineConfig = {
  apiType: 'internal',
  enableLearning: true,
  enableMemory: true,
  enableToolUse: false,
  enableContextAwareness: false,
};

describe('AutonomousAIEngine', () => {
  let engine: AutonomousAIEngine;

  beforeEach(() => {
    engine = new AutonomousAIEngine(mockConfig);
  });

  afterEach(async () => {
    await engine.shutdown();
  });

  describe('构造函数', () => {
    it('应该成功创建引擎实例', () => {
      expect(engine).toBeDefined();
    });
  });

  describe('initialize', () => {
    it('应该成功初始化所有子系统', async () => {
      await engine.initialize();
      const status = engine.getStatus();
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('应该在未初始化时返回正确状态', () => {
      const status = engine.getStatus();
      expect(status.isInitialized).toBe(false);
      expect(status.isRunning).toBe(false);
      expect(status.metrics).toBeDefined();
    });

    it('应该在初始化后返回正确状态', async () => {
      await engine.initialize();
      const status = engine.getStatus();
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('processMessage', () => {
    it('应该在未初始化时拒绝处理消息', async () => {
      await expect(engine.processMessage({
        id: 'test-msg',
        type: 'query',
        content: 'Hello',
        source: 'test',
        timestamp: Date.now(),
      })).rejects.toThrow();
    });

    it('应该在初始化后处理消息', async () => {
      await engine.initialize();
      const response = await engine.processMessage({
        id: 'test-msg',
        type: 'query',
        content: 'Hello',
        source: 'test',
        timestamp: Date.now(),
      });
      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('shutdown', () => {
    it('应该成功关闭引擎', async () => {
      await engine.initialize();
      await engine.shutdown();
      const status = engine.getStatus();
      expect(status.isRunning).toBe(false);
    });
  });
});
