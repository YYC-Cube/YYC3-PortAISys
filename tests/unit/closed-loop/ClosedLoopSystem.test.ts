/**
 * @file unit/closed-loop/ClosedLoopSystem.test.ts
 * @description Closed Loop System.test 模块
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
import { ClosedLoopSystem } from '../../../core/closed-loop/ClosedLoopSystem';
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

describe('ClosedLoopSystem', () => {
  let system: ClosedLoopSystem;

  beforeEach(() => {
    system = new ClosedLoopSystem(mockConfig);
  });

  describe('构造函数', () => {
    it('应该成功初始化五维闭环系统', () => {
      expect(system).toBeDefined();
    });
  });

  describe('runClosedLoop', () => {
    it('应该成功运行闭环流程而不抛出异常', async () => {
      const metrics = {
        performance: 0.85,
        reliability: 0.90,
        userSatisfaction: 0.88,
      };

      await expect(system.runClosedLoop(metrics)).resolves.not.toThrow();
    });

    it('应该在 metrics 为空时优雅处理', async () => {
      await expect(system.runClosedLoop({})).resolves.not.toThrow();
    });
  });

  describe('getSystemStatus', () => {
    it('应该返回各子系统状态', async () => {
      const status = await system.getSystemStatus();
      expect(status).toBeDefined();
      expect(status.valueCreationStatus).toBeDefined();
      expect(status.technicalEvolutionStatus).toBeDefined();
      expect(status.technologyRoadmapStatus).toBeDefined();
    });
  });
});
