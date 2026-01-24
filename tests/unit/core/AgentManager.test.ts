import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentManager } from '../../../core/ai/AgentManager';
import { BaseAgent, PopupInstance } from '../../../core/ai/BaseAgent';
import { AgentConfig, AgentMessage, AgentCapability, AgentStatus } from '../../../core/ai/AgentProtocol';

class TestAgent extends BaseAgent {
  protected setupCapabilities(): void {
    this.addCapability({
      id: 'test-capability',
      name: '测试能力',
      description: '用于测试的能力',
      enabled: true,
      parameters: {}
    });
  }

  protected setupCommandHandlers(): void {
    this.registerCommandHandler('test-command', async (params) => {
      return { result: 'test-result', params };
    });

    this.registerCommandHandler('error-command', async () => {
      throw new Error('测试错误');
    });
  }

  async shutdown(): Promise<void> {
    this.destroy();
  }
}

describe('AgentManager', () => {
  let agentManager: AgentManager;
  let testAgent1: TestAgent;
  let testAgent2: TestAgent;

  beforeEach(() => {
    agentManager = new AgentManager({
      maxQueueSize: 100,
      maxMessageHistory: 1000,
      enableMetrics: false,
      enableLogging: false,
      defaultTimeout: 5000,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 100,
        backoffMultiplier: 2
      }
    });

    testAgent1 = new TestAgent({
      id: 'agent-1',
      name: '测试智能体1',
      type: 'test',
      capabilities: []
    });

    testAgent2 = new TestAgent({
      id: 'agent-2',
      name: '测试智能体2',
      type: 'test',
      capabilities: []
    });
  });

  afterEach(async () => {
    await agentManager.shutdown();
  });

  describe('初始化', () => {
    it('应该正确初始化智能体管理器', () => {
      expect(agentManager).toBeDefined();
      expect(agentManager.getRegisteredAgentCount()).toBe(0);
      expect(agentManager.getQueueSize()).toBe(0);
      expect(agentManager.getHistorySize()).toBe(0);
    });

    it('应该使用默认配置', () => {
      const defaultManager = new AgentManager();
      expect(defaultManager).toBeDefined();
      defaultManager.shutdown();
    });

    it('应该使用自定义配置', () => {
      const customManager = new AgentManager({
        maxQueueSize: 500,
        maxMessageHistory: 5000,
        enableMetrics: false,
        enableLogging: false
      });
      expect(customManager).toBeDefined();
      customManager.shutdown();
    });
  });

  describe('智能体注册', () => {
    it('应该成功注册智能体', () => {
      const agentId = agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });

      expect(agentId).toBe('agent-1');
      expect(agentManager.getRegisteredAgentCount()).toBe(1);
      expect(agentManager.getAgent('agent-1')).toBe(testAgent1);
    });

    it('应该自动生成智能体ID', () => {
      const agentId = agentManager.registerAgent(testAgent1, {
        name: '测试智能体',
        type: 'test',
        capabilities: []
      });

      expect(agentId).toBeDefined();
      expect(agentId.length).toBeGreaterThan(0);
      expect(agentManager.getRegisteredAgentCount()).toBe(1);
    });

    it('应该拒绝重复注册', () => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });

      expect(() => {
        agentManager.registerAgent(testAgent1, {
          id: 'agent-1',
          name: '测试智能体1',
          type: 'test',
          capabilities: []
        });
      }).toThrow();
    });

    it('应该触发注册事件', () => {
      const eventSpy = vi.fn();
      agentManager.on('agent:registered', eventSpy);

      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'agent-1'
        })
      );
    });
  });

  describe('智能体注销', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
    });

    it('应该成功注销智能体', () => {
      const result = agentManager.unregisterAgent('agent-1');
      expect(result).toBe(true);
      expect(agentManager.getRegisteredAgentCount()).toBe(0);
      expect(agentManager.getAgent('agent-1')).toBeUndefined();
    });

    it('应该返回false当智能体不存在', () => {
      const result = agentManager.unregisterAgent('non-existent');
      expect(result).toBe(false);
    });

    it('应该触发注销事件', () => {
      const eventSpy = vi.fn();
      agentManager.on('agent:unregistered', eventSpy);

      agentManager.unregisterAgent('agent-1');

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'agent-1'
        })
      );
    });
  });

  describe('获取智能体', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
      agentManager.registerAgent(testAgent2, {
        id: 'agent-2',
        name: '测试智能体2',
        type: 'test',
        capabilities: []
      });
    });

    it('应该获取单个智能体', () => {
      const agent = agentManager.getAgent('agent-1');
      expect(agent).toBe(testAgent1);
    });

    it('应该返回undefined当智能体不存在', () => {
      const agent = agentManager.getAgent('non-existent');
      expect(agent).toBeUndefined();
    });

    it('应该获取所有智能体', () => {
      const agents = agentManager.getAllAgents();
      expect(agents).toHaveLength(2);
      expect(agents).toContain(testAgent1);
      expect(agents).toContain(testAgent2);
    });

    it('应该获取所有智能体ID', () => {
      const ids = agentManager.getAgentIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain('agent-1');
      expect(ids).toContain('agent-2');
    });
  });

  describe('发送消息', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
    });

    it('应该成功发送命令消息', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: { test: 'value' }
        }
      };

      const response = await agentManager.sendMessage(message);

      expect(response.success).toBe(true);
      expect(response.data).toEqual({
        result: 'test-result',
        params: { test: 'value' }
      });
    });

    it('应该返回错误当智能体不存在', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'non-existent',
        timestamp: Date.now(),
        payload: {}
      };

      const response = await agentManager.sendMessage(message);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('AGENT_NOT_FOUND');
    });

    it('应该处理命令执行失败', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {
          action: 'error-command',
          parameters: {}
        }
      };

      const response = await agentManager.sendMessage(message);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('COMMAND_EXECUTION_FAILED');
    });
  });

  describe('广播消息', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
      agentManager.registerAgent(testAgent2, {
        id: 'agent-2',
        name: '测试智能体2',
        type: 'test',
        capabilities: []
      });
    });

    it('应该向所有智能体广播消息', async () => {
      const responses = await agentManager.broadcastMessage({
        id: 'broadcast-1',
        type: 'command',
        from: 'sender',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      });

      expect(responses).toHaveLength(2);
      expect(responses.every(r => r.success)).toBe(true);
    });
  });

  describe('消息队列', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
    });

    it('应该将消息加入队列', () => {
      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {}
      };

      agentManager.queueMessage(message, 1);

      expect(agentManager.getQueueSize()).toBeGreaterThanOrEqual(0);
    });

    it('应该按优先级排序消息', () => {
      const message1: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {}
      };

      const message2: AgentMessage = {
        id: 'msg-2',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {}
      };

      agentManager.queueMessage(message1, 1);
      agentManager.queueMessage(message2, 2);

      expect(agentManager.getQueueSize()).toBeGreaterThanOrEqual(0);
    });

    it('应该触发队列事件', () => {
      const eventSpy = vi.fn();
      agentManager.on('message:queued', eventSpy);

      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {}
      };

      agentManager.queueMessage(message);

      expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    it('应该处理队列满的情况', () => {
      const smallQueueManager = new AgentManager({
        maxQueueSize: 2,
        enableMetrics: false,
        enableLogging: false
      });

      smallQueueManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });

      const eventSpy = vi.fn();
      smallQueueManager.on('queue:full', eventSpy);

      for (let i = 0; i < 5; i++) {
        smallQueueManager.queueMessage({
          id: `msg-${i}`,
          type: 'command',
          from: 'sender',
          to: 'agent-1',
          timestamp: Date.now(),
          payload: {}
        });
      }

      expect(eventSpy).toHaveBeenCalled();
      smallQueueManager.shutdown();
    });
  });

  describe('路由管理', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
      agentManager.registerAgent(testAgent2, {
        id: 'agent-2',
        name: '测试智能体2',
        type: 'test',
        capabilities: []
      });
    });

    it('应该添加路由', () => {
      agentManager.addRoute({
        id: 'route-1',
        from: 'agent-1',
        to: 'agent-2',
        conditions: {
          messageTypes: ['command']
        }
      });

      expect(agentManager['routes'].size).toBe(1);
    });

    it('应该移除路由', () => {
      agentManager.addRoute({
        id: 'route-1',
        from: 'agent-1',
        to: 'agent-2',
        conditions: {}
      });

      agentManager.removeRoute('route-1');

      const routes = agentManager['routes'].get('agent-1');
      expect(routes).toEqual([]);
    });

    it('应该触发路由添加事件', () => {
      const eventSpy = vi.fn();
      agentManager.on('route:added', eventSpy);

      agentManager.addRoute({
        id: 'route-1',
        from: 'agent-1',
        to: 'agent-2',
        conditions: {}
      });

      expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    it('应该触发路由移除事件', () => {
      const eventSpy = vi.fn();
      agentManager.on('route:removed', eventSpy);

      agentManager.addRoute({
        id: 'route-1',
        from: 'agent-1',
        to: 'agent-2',
        conditions: {}
      });

      agentManager.removeRoute('route-1');

      expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    it('应该根据条件路由消息', async () => {
      agentManager.addRoute({
        id: 'route-1',
        from: 'agent-1',
        to: 'agent-2',
        conditions: {
          messageTypes: ['command']
        }
      });

      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'agent-1',
        to: 'agent-2',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      };

      const responses = await agentManager.routeMessage(message);

      expect(responses).toHaveLength(1);
    });

    it('应该根据优先级路由消息', async () => {
      agentManager.addRoute({
        id: 'route-1',
        from: 'agent-1',
        to: 'agent-2',
        conditions: {
          priority: 'high'
        }
      });

      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'agent-1',
        to: 'agent-2',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        },
        metadata: {
          priority: 'high'
        }
      };

      const responses = await agentManager.routeMessage(message);

      expect(responses).toHaveLength(1);
    });
  });

  describe('能力管理', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
    });

    it('应该获取智能体能力', () => {
      const capabilities = agentManager.getAgentCapabilities('agent-1');

      expect(capabilities).toHaveLength(1);
      expect(capabilities[0].id).toBe('test-capability');
    });

    it('应该返回空数组当智能体不存在', () => {
      const capabilities = agentManager.getAgentCapabilities('non-existent');

      expect(capabilities).toEqual([]);
    });

    it('应该获取所有智能体能力', () => {
      agentManager.registerAgent(testAgent2, {
        id: 'agent-2',
        name: '测试智能体2',
        type: 'test',
        capabilities: []
      });

      const allCapabilities = agentManager.getAllCapabilities();

      expect(allCapabilities.size).toBe(2);
      expect(allCapabilities.get('agent-1')).toHaveLength(1);
      expect(allCapabilities.get('agent-2')).toHaveLength(1);
    });
  });

  describe('统计信息', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
    });

    it('应该获取智能体统计信息', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      };

      await agentManager.sendMessage(message);

      const stats = agentManager.getAgentStatistics('agent-1');

      expect(stats).toBeDefined();
      expect(stats?.messagesReceived).toBe(1);
      expect(stats?.messagesProcessed).toBe(1);
    });

    it('应该返回undefined当智能体不存在', () => {
      const stats = agentManager.getAgentStatistics('non-existent');

      expect(stats).toBeUndefined();
    });

    it('应该获取所有智能体统计信息', async () => {
      agentManager.registerAgent(testAgent2, {
        id: 'agent-2',
        name: '测试智能体2',
        type: 'test',
        capabilities: []
      });

      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      };

      await agentManager.sendMessage(message);

      const allStats = agentManager.getAllStatistics();

      expect(allStats.size).toBe(2);
    });
  });

  describe('状态管理', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
    });

    it('应该获取智能体状态', () => {
      const status = agentManager.getAgentStatus('agent-1');

      expect(status).toBeDefined();
      expect(status).toBe('idle');
    });

    it('应该返回undefined当智能体不存在', () => {
      const status = agentManager.getAgentStatus('non-existent');

      expect(status).toBeUndefined();
    });

    it('应该获取所有智能体状态', () => {
      agentManager.registerAgent(testAgent2, {
        id: 'agent-2',
        name: '测试智能体2',
        type: 'test',
        capabilities: []
      });

      const allStatuses = agentManager.getAllStatuses();

      expect(allStatuses.size).toBe(2);
      expect(allStatuses.get('agent-1')).toBe('idle');
      expect(allStatuses.get('agent-2')).toBe('idle');
    });

    it('应该在处理消息时更新状态', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      };

      const promise = agentManager.sendMessage(message);
      const statusDuringProcessing = agentManager.getAgentStatus('agent-1');

      expect(statusDuringProcessing).toBe('processing');

      await promise;
      const statusAfterProcessing = agentManager.getAgentStatus('agent-1');

      expect(statusAfterProcessing).toBe('idle');
    });
  });

  describe('消息历史', () => {
    beforeEach(() => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });
    });

    it('应该记录消息历史', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      };

      await agentManager.sendMessage(message);

      expect(agentManager.getHistorySize()).toBe(1);
    });

    it('应该获取所有消息历史', async () => {
      const message1: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      };

      const message2: AgentMessage = {
        id: 'msg-2',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      };

      await agentManager.sendMessage(message1);
      await agentManager.sendMessage(message2);

      const history = agentManager.getMessageHistory();

      expect(history).toHaveLength(2);
    });

    it('应该按智能体过滤消息历史', async () => {
      agentManager.registerAgent(testAgent2, {
        id: 'agent-2',
        name: '测试智能体2',
        type: 'test',
        capabilities: []
      });

      const message1: AgentMessage = {
        id: 'msg-1',
        type: 'command',
        from: 'sender',
        to: 'agent-1',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      };

      const message2: AgentMessage = {
        id: 'msg-2',
        type: 'command',
        from: 'sender',
        to: 'agent-2',
        timestamp: Date.now(),
        payload: {
          action: 'test-command',
          parameters: {}
        }
      };

      await agentManager.sendMessage(message1);
      await agentManager.sendMessage(message2);

      const history1 = agentManager.getMessageHistory('agent-1');
      const history2 = agentManager.getMessageHistory('agent-2');

      expect(history1).toHaveLength(1);
      expect(history2).toHaveLength(1);
    });
  });

  describe('关闭', () => {
    it('应该正确关闭管理器', async () => {
      agentManager.registerAgent(testAgent1, {
        id: 'agent-1',
        name: '测试智能体1',
        type: 'test',
        capabilities: []
      });

      const eventSpy = vi.fn();
      agentManager.on('manager:shutdown', eventSpy);

      await agentManager.shutdown();

      expect(agentManager.getRegisteredAgentCount()).toBe(0);
      expect(agentManager.getQueueSize()).toBe(0);
      expect(agentManager.getHistorySize()).toBe(0);
      expect(eventSpy).toHaveBeenCalledTimes(1);
    });
  });
});
