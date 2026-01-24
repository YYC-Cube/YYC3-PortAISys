import { describe, it, expect, beforeEach } from 'vitest';
import { AgentOrchestrator } from '../../../core/ai/AgentOrchestrator';
import { CollaborativeAgent } from '../../../core/ai/agents/CollaborativeAgent';

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator();
  });

  describe('工作流管理', () => {
    it('应该注册工作流', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          { id: 'start', type: 'start' as const },
          { id: 'end', type: 'end' as const },
        ],
        edges: [{ from: 'start', to: 'end' }],
      };

      orchestrator.registerWorkflow(workflow);
      expect(orchestrator.getWorkflow('test-workflow')).toBeDefined();
    });

    it('应该执行工作流', async () => {
      const agent = new CollaborativeAgent('test-agent', {
        type: 'test',
        capabilities: ['testing'],
        config: {},
      });

      orchestrator.registerAgent(agent);
      orchestrator.registerWorkflow({
        id: 'simple',
        name: 'Simple',
        nodes: [
          { id: 'start', type: 'start' as const },
          { id: 'task', type: 'agent' as const, agentId: 'test-agent' },
          { id: 'end', type: 'end' as const },
        ],
        edges: [
          { from: 'start', to: 'task' },
          { from: 'task', to: 'end' },
        ],
      });

      const result = await orchestrator.executeWorkflow('simple', {});
      expect(result.status).toBe('completed');
    });
  });

  describe('代理协调', () => {
    it('应该协调多个代理', async () => {
      const agent1 = new CollaborativeAgent('agent1', {
        type: 'worker',
        capabilities: ['task1'],
        config: {},
      });
      const agent2 = new CollaborativeAgent('agent2', {
        type: 'worker',
        capabilities: ['task2'],
        config: {},
      });

      orchestrator.registerAgent(agent1);
      orchestrator.registerAgent(agent2);

      orchestrator.registerWorkflow({
        id: 'multi-agent',
        name: 'Multi Agent',
        nodes: [
          { id: 'start', type: 'start' as const },
          { id: 'parallel', type: 'parallel' as const },
          { id: 'task1', type: 'agent' as const, agentId: 'agent1' },
          { id: 'task2', type: 'agent' as const, agentId: 'agent2' },
          { id: 'merge', type: 'merge' as const },
          { id: 'end', type: 'end' as const },
        ],
        edges: [
          { from: 'start', to: 'parallel' },
          { from: 'parallel', to: 'task1' },
          { from: 'parallel', to: 'task2' },
          { from: 'task1', to: 'merge' },
          { from: 'task2', to: 'merge' },
          { from: 'merge', to: 'end' },
        ],
      });

      const result = await orchestrator.executeWorkflow('multi-agent', {});
      expect(result.status).toBe('completed');
    });
  });
});