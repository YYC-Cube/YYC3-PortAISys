import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AutonomousAIEngine } from '../../../core/AutonomousAIEngine';
import { EngineConfig, EngineStatus, MessageType, AgentMessage, ISubsystem } from '../../../core/types/engine.types';

class TestSubsystem implements ISubsystem {
  name: string;
  initialized: boolean = false;
  started: boolean = false;
  stopped: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async start(): Promise<void> {
    this.started = true;
  }

  async stop(): Promise<void> {
    this.stopped = true;
  }

  getStatus(): string {
    return this.started ? 'running' : 'stopped';
  }
}

describe('AutonomousAIEngine', () => {
  let engine: AutonomousAIEngine;
  let config: EngineConfig;

  beforeEach(() => {
    config = {
      version: '1.0.0',
      environment: 'test',
      messageConfig: {
        maxQueueSize: 100,
        retryPolicy: {
          maxRetries: 3,
          backoffFactor: 2
        }
      }
    };

    engine = new AutonomousAIEngine(config);
  });

  afterEach(async () => {
    if (engine.getStatus() !== EngineStatus.STOPPED) {
      await engine.shutdown();
    }
  });

  describe('初始化', () => {
    it('应该正确初始化引擎', () => {
      expect(engine).toBeDefined();
      expect(engine.getStatus()).toBe(EngineStatus.STOPPED);
    });

    it('应该使用提供的配置', () => {
      expect(engine).toBeDefined();
    });

    it('应该接受自定义配置', () => {
      const customConfig: EngineConfig = {
        version: '2.0.0',
        environment: 'production',
        messageConfig: {
          maxQueueSize: 500,
          retryPolicy: {
            maxRetries: 5,
            backoffFactor: 3
          }
        }
      };

      const customEngine = new AutonomousAIEngine(customConfig);
      expect(customEngine).toBeDefined();
    });
  });

  describe('生命周期管理', () => {
    it('应该成功初始化', async () => {
      const subsystem = new TestSubsystem('test-subsystem');
      engine.registerSubsystem(subsystem);

      await engine.initialize(config);

      expect(subsystem.initialized).toBe(true);
      expect(engine.getStatus()).toBe(EngineStatus.STOPPED);
    });

    it('应该成功启动', async () => {
      const subsystem = new TestSubsystem('test-subsystem');
      engine.registerSubsystem(subsystem);

      await engine.initialize(config);
      await engine.start();

      expect(subsystem.started).toBe(true);
      expect(engine.getStatus()).toBe(EngineStatus.RUNNING);
    });

    it('应该成功暂停', async () => {
      await engine.initialize(config);
      await engine.start();
      await engine.pause();

      expect(engine.getStatus()).toBe(EngineStatus.PAUSED);
    });

    it('应该成功关闭', async () => {
      const subsystem = new TestSubsystem('test-subsystem');
      engine.registerSubsystem(subsystem);

      await engine.initialize(config);
      await engine.start();
      await engine.shutdown();

      expect(subsystem.stopped).toBe(true);
      expect(engine.getStatus()).toBe(EngineStatus.STOPPED);
    });

    it('应该在关闭时清理消息总线', async () => {
      await engine.initialize(config);
      await engine.start();
      await engine.shutdown();

      const messageBusStatus = engine['messageBus'].getQueueStatus();
      expect(messageBusStatus.size).toBe(0);
    });
  });

  describe('状态获取', () => {
    it('应该返回正确的状态', () => {
      const status = engine.getStatus();
      expect(status).toBe(EngineStatus.STOPPED);
    });

    it('应该在启动后返回运行状态', async () => {
      await engine.initialize(config);
      await engine.start();

      expect(engine.getStatus()).toBe(EngineStatus.RUNNING);
    });

    it('应该在暂停后返回暂停状态', async () => {
      await engine.initialize(config);
      await engine.start();
      await engine.pause();

      expect(engine.getStatus()).toBe(EngineStatus.PAUSED);
    });
  });

  describe('消息处理', () => {
    beforeEach(async () => {
      await engine.initialize(config);
      await engine.start();
    });

    it('应该成功处理消息', async () => {
      const handler = vi.fn().mockResolvedValue({
        success: true,
        content: { result: 'test' }
      });

      engine.registerMessageHandler(MessageType.QUERY, handler);

      const message: AgentMessage = {
        id: 'msg-1',
        type: MessageType.QUERY,
        content: { query: 'test' },
        timestamp: new Date()
      };

      const response = await engine.processMessage(message);

      expect(handler).toHaveBeenCalled();
      expect(response.success).toBe(true);
    });

    it('应该拒绝在非运行状态下处理消息', async () => {
      await engine.pause();

      const message: AgentMessage = {
        id: 'msg-1',
        type: MessageType.QUERY,
        content: { query: 'test' },
        timestamp: new Date()
      };

      await expect(engine.processMessage(message)).rejects.toThrow();
    });

    it('应该返回错误当没有找到处理器', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        type: MessageType.QUERY,
        content: { query: 'test' },
        timestamp: new Date()
      };

      const response = await engine.processMessage(message);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('MESSAGE_PROCESSING_ERROR');
    });

    it('应该注册消息处理器', () => {
      const handler = vi.fn();

      engine.registerMessageHandler(MessageType.QUERY, handler);

      expect(engine['messageHandlers'].has(MessageType.QUERY)).toBe(true);
    });

    it('应该注销消息处理器', () => {
      const handler = vi.fn();

      engine.registerMessageHandler(MessageType.QUERY, handler);
      engine.unregisterMessageHandler(MessageType.QUERY);

      expect(engine['messageHandlers'].has(MessageType.QUERY)).toBe(false);
    });
  });

  describe('任务管理', () => {
    beforeEach(async () => {
      await engine.initialize(config);
      await engine.start();
    });

    it('应该规划任务', async () => {
      const goal = { type: 'test-goal' };
      const plan = await engine.planTask(goal);

      expect(plan).toEqual(goal);
    });

    it('应该执行任务', async () => {
      const taskId = 'task-1';
      const result = await engine.executeTask(taskId);

      expect(result).toEqual({
        taskId,
        status: 'completed'
      });
    });

    it('应该取消任务', async () => {
      const taskId = 'task-1';

      await expect(engine.cancelTask(taskId)).resolves.not.toThrow();
    });

    it('应该获取任务进度', () => {
      const taskId = 'task-1';
      const progress = engine.getTaskProgress(taskId);

      expect(progress).toEqual({
        taskId,
        progress: 0
      });
    });
  });

  describe('子系统管理', () => {
    it('应该注册子系统', () => {
      const subsystem = new TestSubsystem('test-subsystem');

      engine.registerSubsystem(subsystem);

      expect(engine.getSubsystem('test-subsystem')).toBe(subsystem);
    });

    it('应该注销子系统', () => {
      const subsystem = new TestSubsystem('test-subsystem');

      engine.registerSubsystem(subsystem);
      engine.unregisterSubsystem('test-subsystem');

      expect(engine.getSubsystem('test-subsystem')).toBeUndefined();
    });

    it('应该获取子系统', () => {
      const subsystem = new TestSubsystem('test-subsystem');

      engine.registerSubsystem(subsystem);

      const retrieved = engine.getSubsystem('test-subsystem');

      expect(retrieved).toBe(subsystem);
    });

    it('应该在初始化时初始化所有子系统', async () => {
      const subsystem1 = new TestSubsystem('subsystem-1');
      const subsystem2 = new TestSubsystem('subsystem-2');

      engine.registerSubsystem(subsystem1);
      engine.registerSubsystem(subsystem2);

      await engine.initialize(config);

      expect(subsystem1.initialized).toBe(true);
      expect(subsystem2.initialized).toBe(true);
    });

    it('应该在启动时启动所有子系统', async () => {
      const subsystem1 = new TestSubsystem('subsystem-1');
      const subsystem2 = new TestSubsystem('subsystem-2');

      engine.registerSubsystem(subsystem1);
      engine.registerSubsystem(subsystem2);

      await engine.initialize(config);
      await engine.start();

      expect(subsystem1.started).toBe(true);
      expect(subsystem2.started).toBe(true);
    });

    it('应该在关闭时停止所有子系统', async () => {
      const subsystem1 = new TestSubsystem('subsystem-1');
      const subsystem2 = new TestSubsystem('subsystem-2');

      engine.registerSubsystem(subsystem1);
      engine.registerSubsystem(subsystem2);

      await engine.initialize(config);
      await engine.start();
      await engine.shutdown();

      expect(subsystem1.stopped).toBe(true);
      expect(subsystem2.stopped).toBe(true);
    });
  });

  describe('状态管理', () => {
    beforeEach(async () => {
      await engine.initialize(config);
      await engine.start();
    });

    it('应该获取引擎状态', () => {
      const state = engine.getState();

      expect(state).toBeDefined();
      expect(state.status).toBe(EngineStatus.RUNNING);
      expect(state.tasks).toBeDefined();
      expect(state.subsystems).toBeDefined();
      expect(state.metrics).toBeDefined();
    });

    it('应该保存状态', async () => {
      const savedState = await engine.saveState();

      expect(savedState).toBeDefined();
      expect(savedState.status).toBe(EngineStatus.RUNNING);
    });

    it('应该恢复状态', async () => {
      const snapshot = {
        status: EngineStatus.RUNNING,
        uptime: 1000,
        tasks: { total: 0, active: 0, completed: 0, failed: 0 },
        subsystems: [],
        metrics: {
          messageThroughput: '0',
          averageResponseTime: '0',
          errorRate: '0'
        }
      };

      await expect(engine.restoreState(snapshot)).resolves.not.toThrow();
    });

    it('应该重置状态', async () => {
      await engine.executeTask('task-1');
      await engine.resetState();

      const state = engine.getState();
      expect(state.tasks.total).toBe(0);
    });
  });

  describe('指标监控', () => {
    beforeEach(async () => {
      await engine.initialize(config);
      await engine.start();
    });

    it('应该获取引擎指标', () => {
      const metrics = engine.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.status).toBe(EngineStatus.RUNNING);
      expect(metrics.taskCount).toBe(0);
      expect(metrics.activeTasks).toBe(0);
      expect(metrics.queuedTasks).toBe(0);
      expect(metrics.completedTasks).toBe(0);
      expect(metrics.failedTasks).toBe(0);
      expect(metrics.messageThroughput).toBe(0);
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.subsystemHealth).toBeDefined();
      expect(metrics.errorRate).toBe(0);
      expect(metrics.responseTimes).toBeDefined();
    });

    it('应该在处理消息后更新指标', async () => {
      await engine.start();

      const handler = vi.fn().mockResolvedValue({
        success: true,
        content: { result: 'test' }
      });

      engine.registerMessageHandler(MessageType.QUERY, handler);

      const message: AgentMessage = {
        id: 'msg-1',
        type: MessageType.QUERY,
        content: { query: 'test' },
        timestamp: new Date()
      };

      await engine.processMessage(message);

      await new Promise(resolve => setTimeout(resolve, 10));

      const metrics = engine.getMetrics();
      expect(metrics.messageThroughput).toBeGreaterThan(0);
    });

    it('应该在执行任务后更新任务计数', async () => {
      await engine.executeTask('task-1');

      const state = engine.getState();
      expect(state.tasks.total).toBe(1);
    });
  });

  describe('事件广播', () => {
    it('应该广播事件', () => {
      const event = { type: 'test-event', data: {} };

      expect(() => engine.broadcastEvent(event)).not.toThrow();
    });
  });

  describe('错误处理', () => {
    it('应该处理子系统初始化失败', async () => {
      class FailingSubsystem implements ISubsystem {
        name = 'failing-subsystem';

        async initialize(): Promise<void> {
          throw new Error('初始化失败');
        }

        async start(): Promise<void> {}

        async stop(): Promise<void> {}

        getStatus(): string {
          return 'stopped';
        }
      }

      const failingSubsystem = new FailingSubsystem();
      engine.registerSubsystem(failingSubsystem);

      await expect(engine.initialize(config)).resolves.not.toThrow();
    });

    it('应该处理子系统启动失败', async () => {
      class FailingSubsystem implements ISubsystem {
        name = 'failing-subsystem';

        async initialize(): Promise<void> {}

        async start(): Promise<void> {
          throw new Error('启动失败');
        }

        async stop(): Promise<void> {}

        getStatus(): string {
          return 'stopped';
        }
      }

      const failingSubsystem = new FailingSubsystem();
      engine.registerSubsystem(failingSubsystem);

      await engine.initialize(config);
      await expect(engine.start()).resolves.not.toThrow();
    });

    it('应该处理子系统停止失败', async () => {
      class FailingSubsystem implements ISubsystem {
        name = 'failing-subsystem';

        async initialize(): Promise<void> {}

        async start(): Promise<void> {}

        async stop(): Promise<void> {
          throw new Error('停止失败');
        }

        getStatus(): string {
          return 'stopped';
        }
      }

      const failingSubsystem = new FailingSubsystem();
      engine.registerSubsystem(failingSubsystem);

      await engine.initialize(config);
      await engine.start();
      await expect(engine.shutdown()).resolves.not.toThrow();
    });

    it('应该处理消息处理错误', async () => {
      await engine.initialize(config);
      await engine.start();

      const handler = vi.fn().mockRejectedValue(new Error('处理失败'));

      engine.registerMessageHandler(MessageType.QUERY, handler);

      const message: AgentMessage = {
        id: 'msg-1',
        type: MessageType.QUERY,
        content: { query: 'test' },
        timestamp: new Date()
      };

      const response = await engine.processMessage(message);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('MESSAGE_PROCESSING_ERROR');
    });
  });
});
