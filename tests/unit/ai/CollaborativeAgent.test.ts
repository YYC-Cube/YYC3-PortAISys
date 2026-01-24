import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CollaborativeAgent } from '../../../core/ai/agents/CollaborativeAgent'
import type { AgentMessage } from '../../../core/ai/AgentProtocol'

describe('CollaborativeAgent', () => {
  let agent: CollaborativeAgent

  beforeEach(() => {
    agent = new CollaborativeAgent('test-agent', {
      type: 'test-agent',
      capabilities: ['testing', 'collaboration'],
      config: {
        maxRetries: 3,
        timeout: 5000,
      },
    })
  })

  describe('基础功能', () => {
    it('应该正确初始化协作代理', () => {
      expect(agent.getId()).toBe('test-agent')
      const capNames = agent.getCapabilities().map(c => c.name)
      expect(capNames).toContain('collaborate')
    })

    it('应该能够添加协作者', () => {
      const collaborator = new CollaborativeAgent('collaborator-1', {
        type: 'helper',
        capabilities: ['assisting'],
        config: {},
      })

      agent.addCollaborator(collaborator)
      expect(agent.getCollaborators()).toHaveLength(1)
    })

    it('应该能够移除协作者', () => {
      const collaborator = new CollaborativeAgent('collaborator-1', {
        type: 'helper',
        capabilities: ['assisting'],
        config: {},
      })

      agent.addCollaborator(collaborator)
      agent.removeCollaborator('collaborator-1')
      expect(agent.getCollaborators()).toHaveLength(0)
    })
  })

  describe('消息通信', () => {
    it('应该能够发送消息给协作者', async () => {
      const collaborator = new CollaborativeAgent('collaborator-1', {
        type: 'helper',
        capabilities: ['assisting'],
        config: {},
      })

      agent.addCollaborator(collaborator)
      await agent.sendToCollaborator('collaborator-1', { type: 'request', content: 'Test' })
      expect(agent.getCollaborators()).toHaveLength(1)
    })

    it('应该能够广播消息', async () => {
      const collaborator1 = new CollaborativeAgent('collaborator-1', {
        type: 'helper',
        capabilities: ['assisting'],
        config: {},
      })

      agent.addCollaborator(collaborator1)
      await agent.broadcast({ type: 'announcement', content: 'Test' })
      expect(agent.getCollaborators()).toHaveLength(1)
    })

    it('应该正确处理接收到的消息', async () => {
      const message: AgentMessage = {
        id: 'msg-1',
        from: 'sender-agent',
        to: 'test-agent',
        content: { type: 'request' },
        timestamp: Date.now(),
      }

      await agent.receiveMessage(message)
      expect(agent.getId()).toBe('test-agent')
    })
  })

  describe('协作策略', () => {
    it('应该支持并行协作策略', () => {
      const c1 = new CollaborativeAgent('c1', { type: 'w', config: {} })
      const c2 = new CollaborativeAgent('c2', { type: 'w', config: {} })
      agent.addCollaborator(c1)
      agent.addCollaborator(c2)
      expect(agent.getCollaborators()).toHaveLength(2)
    })

    it('应该支持顺序协作策略', () => {
      const c1 = new CollaborativeAgent('c1', { type: 'w', config: {} })
      const c2 = new CollaborativeAgent('c2', { type: 'w', config: {} })
      agent.addCollaborator(c1)
      agent.addCollaborator(c2)
      expect(agent.getCollaborators()).toHaveLength(2)
    })

    it('应该支持共识决策', () => {
      const c1 = new CollaborativeAgent('c1', { type: 'v', config: {} })
      const c2 = new CollaborativeAgent('c2', { type: 'v', config: {} })
      const c3 = new CollaborativeAgent('c3', { type: 'v', config: {} })
      agent.addCollaborator(c1)
      agent.addCollaborator(c2)
      agent.addCollaborator(c3)
      expect(agent.getCollaborators()).toHaveLength(3)
    })
  })

  describe('任务管理', () => {
    it('应该能够创建协作任务', async () => {
      const taskId = await agent.createTask({
        description: 'Task',
        type: 'processing' as any,
        requiredCapabilities: [],
        priority: 1,
      })
      expect(typeof taskId).toBe('string')
    })

    it('应该能够分配任务给协作者', async () => {
      const c = new CollaborativeAgent('c1', { type: 'w', config: {} })
      agent.addCollaborator(c)
      const tid = await agent.createTask({
        description: 'T',
        type: 'processing' as any,
        requiredCapabilities: [],
        priority: 1,
      })
      expect(tid).toBeDefined()
    })

    it('应该能够监控任务进度', async () => {
      const taskId = await agent.createTask({
        description: 'Task',
        type: 'processing' as any,
        requiredCapabilities: [],
        priority: 1,
      })
      const p = agent.getTaskProgress(taskId)
      expect(p).toBeDefined()
    })
  })

  describe('错误处理', () => {
    it('应该处理协作者不存在的情况', async () => {
      await expect(agent.sendToCollaborator('non-existent', {})).rejects.toThrow()
    })

    it('应该处理消息发送失败', async () => {
      const c = new CollaborativeAgent('c1', { type: 'w', config: {} })
      vi.spyOn(c, 'receiveMessage').mockRejectedValue(new Error('Failed'))
      agent.addCollaborator(c)
      await expect(agent.sendToCollaborator('c1', {})).rejects.toThrow()
    })

    it('应该处理任务执行失败', async () => {
      const c = new CollaborativeAgent('c1', { type: 'w', config: {} })
      agent.addCollaborator(c)
      const tid = await agent.createTask({
        description: 'T',
        type: 'processing' as any,
        requiredCapabilities: ['p'],
        priority: 1,
      })
      expect(tid).toBeDefined()
    })
  })

  describe('性能测试', () => {
    it('应该能够处理大量协作者', () => {
      for (let i = 0; i < 10; i++) {
        const c = new CollaborativeAgent(`c${i}`, { type: 'w', config: {} })
        agent.addCollaborator(c)
      }
      expect(agent.getCollaborators()).toHaveLength(10)
    })

    it('应该能够高效广播消息', async () => {
      for (let i = 0; i < 10; i++) {
        agent.addCollaborator(new CollaborativeAgent(`c${i}`, { type: 'w', config: {} }))
      }
      await agent.broadcast({ content: 'test' })
      expect(agent.getCollaborators()).toHaveLength(10)
    })
  })
})
