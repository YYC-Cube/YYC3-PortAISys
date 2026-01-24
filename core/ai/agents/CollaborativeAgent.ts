/**
 * @file CollaborativeAgent.ts
 * @description 协作Agent - 支持多Agent协同工作
 * @module core/ai/agents
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { BaseAgent } from '../BaseAgent';
import { EventEmitter } from 'events';
import { AgentConfig } from '../AgentProtocol';

/**
 * 协作消息类型
 */
export enum CollaborationMessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  BROADCAST = 'broadcast',
  QUERY = 'query',
  NOTIFY = 'notify'
}

/**
 * 协作消息
 */
export interface CollaborationMessage {
  id: string;
  type: CollaborationMessageType;
  from: string;
  to?: string | string[];
  content: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * 协作任务
 */
export interface CollaborationTask {
  id: string;
  description: string;
  requiredCapabilities: string[];
  priority: number;
  deadline?: number;
  assignedAgents: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

/**
 * 协作策略
 */
export enum CollaborationStrategy {
  PARALLEL = 'parallel',       // 并行执行
  SEQUENTIAL = 'sequential',   // 顺序执行
  CONSENSUS = 'consensus',     // 共识决策
  LEADER_FOLLOWER = 'leader_follower', // 领导-跟随
  AUCTION = 'auction'          // 拍卖分配
}

/**
 * 协作Agent配置
 */
export interface CollaborativeAgentConfig {
  id?: string;
  name?: string;
  capabilities?: string[];
  type?: string;
  config?: any;
  strategy?: CollaborationStrategy;
  maxCollaborators?: number;
}

/**
 * 协作Agent
 */
export class CollaborativeAgent extends BaseAgent {
  private collaborators: Map<string, CollaborativeAgent> = new Map();
  private messageQueue: CollaborationMessage[] = [];
  private tasks: Map<string, CollaborationTask> = new Map();
  private strategy: CollaborationStrategy;
  private maxCollaborators: number;

  constructor(idOrConfig: string | CollaborativeAgentConfig, legacyConfig?: CollaborativeAgentConfig) {
    let finalConfig: CollaborativeAgentConfig;

    if (typeof idOrConfig === 'string') {
      // Legacy format: (id, config)
      finalConfig = {
        id: idOrConfig,
        name: idOrConfig,
        ...legacyConfig
      };
    } else {
      // New format: (config)
      finalConfig = idOrConfig;
    }

    const agentConfig: AgentConfig = {
      id: finalConfig.id || 'collaborative-agent',
      name: finalConfig.name || 'Collaborative Agent',
      description: `Collaborative Agent: ${finalConfig.name || 'Unnamed'}`,
      capabilities: (finalConfig.capabilities || []).map((capName: string) => ({
        name: capName,
        description: `Capability: ${capName}`,
        version: '1.0.0'
      })),
      policies: {
        maxConcurrentRequests: 10,
        rateLimit: 100,
        privacyLevel: 'high',
        dataRetention: 86400000
      }
    };
    super(agentConfig);
    
    this.strategy = finalConfig.strategy || CollaborationStrategy.PARALLEL;
    this.maxCollaborators = finalConfig.maxCollaborators || 10;
  }

  /**
   * 设置协作Agent的能力
   */
  protected setupCapabilities(): void {
    this.capabilities.set('collaborate', {
      name: 'collaborate',
      description: 'Multi-agent collaboration capability',
      version: '1.0.0'
    });
    this.capabilities.set('broadcast', {
      name: 'broadcast',
      description: 'Broadcast messages to all collaborators',
      version: '1.0.0'
    });
    this.capabilities.set('consensus', {
      name: 'consensus',
      description: 'Reach consensus with collaborators',
      version: '1.0.0'
    });
  }

  /**
   * 设置协作Agent的命令处理器
   */
  protected setupCommandHandlers(): void {
    this.commandHandlers.set('add-collaborator', async (params) => {
      this.addCollaborator(params.agent);
      return { success: true };
    });
    this.commandHandlers.set('remove-collaborator', async (params) => {
      this.removeCollaborator(params.agentId);
      return { success: true };
    });
    this.commandHandlers.set('send-message', async (params) => {
      return await this.sendToCollaborator(params.targetId, params.message);
    });
    this.commandHandlers.set('broadcast-message', async (params) => {
      return await this.broadcastMessage(params.message);
    });
  }

  /**
   * 添加协作者
   */
  addCollaborator(agent: CollaborativeAgent): void {
    if (this.collaborators.size >= this.maxCollaborators) {
      throw new Error('Maximum number of collaborators reached');
    }

    this.collaborators.set(agent.getId(), agent);
    this.emit('collaborator:added', { agentId: agent.getId() });
  }

  /**
   * 移除协作者
   */
  removeCollaborator(agentId: string): void {
    this.collaborators.delete(agentId);
    this.emit('collaborator:removed', { agentId });
  }

  /**
   * 发送消息给协作者
   */
  async sendToCollaborator(
    targetId: string,
    content: any,
    type: CollaborationMessageType = CollaborationMessageType.REQUEST
  ): Promise<void> {
    const target = this.collaborators.get(targetId);
    
    if (!target) {
      throw new Error(`Collaborator ${targetId} not found`);
    }

    const message: CollaborationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      from: this.getId(),
      to: targetId,
      content,
      timestamp: Date.now()
    };

    await target.receiveMessage(message);
    this.emit('message:sent', { message });
  }

  /**
   * 广播消息给所有协作者
   */
  async broadcast(content: any): Promise<void> {
    const message: CollaborationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: CollaborationMessageType.BROADCAST,
      from: this.getId(),
      to: Array.from(this.collaborators.keys()),
      content,
      timestamp: Date.now()
    };

    const promises = Array.from(this.collaborators.values()).map(
      agent => agent.receiveMessage(message)
    );

    await Promise.all(promises);
    this.emit('broadcast:sent', { message });
  }

  /**
   * 接收消息
   */
  async receiveMessage(message: CollaborationMessage): Promise<void> {
    this.messageQueue.push(message);
    this.emit('message:received', { message });

    // 处理消息
    await this.processMessage(message);
  }

  /**
   * 处理消息
   */
  private async processMessage(message: CollaborationMessage): Promise<void> {
    switch (message.type) {
      case CollaborationMessageType.REQUEST:
        await this.handleRequest(message);
        break;
      case CollaborationMessageType.QUERY:
        await this.handleQuery(message);
        break;
      case CollaborationMessageType.BROADCAST:
        await this.handleBroadcast(message);
        break;
      case CollaborationMessageType.NOTIFY:
        await this.handleNotification(message);
        break;
    }
  }

  /**
   * 处理请求
   */
  private async handleRequest(message: CollaborationMessage): Promise<void> {
    // 检查是否有能力处理请求
    const requiredCapability = message.content.capability;
    
    if (requiredCapability && this.hasCapability(requiredCapability)) {
      const response = await this.processRequest(message.content);
      
      await this.sendToCollaborator(
        message.from,
        response,
        CollaborationMessageType.RESPONSE
      );
    }
  }

  /**
   * 处理查询
   */
  private async handleQuery(message: CollaborationMessage): Promise<void> {
    const response = {
      capabilities: Array.from(this.capabilities),
      status: this.getStatus(),
      availableCapacity: this.getAvailableCapacity()
    };

    await this.sendToCollaborator(
      message.from,
      response,
      CollaborationMessageType.RESPONSE
    );
  }

  /**
   * 处理广播
   */
  private async handleBroadcast(message: CollaborationMessage): Promise<void> {
    // 处理广播消息
    this.emit('broadcast:received', { message });
  }

  /**
   * 处理通知
   */
  private async handleNotification(message: CollaborationMessage): Promise<void> {
    this.emit('notification:received', { message });
  }

  /**
   * 创建协作任务
   */
  async createTask(task: Omit<CollaborationTask, 'id' | 'status' | 'assignedAgents'>): Promise<string> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullTask: CollaborationTask = {
      id: taskId,
      ...task,
      assignedAgents: [],
      status: 'pending'
    };

    this.tasks.set(taskId, fullTask);

    // 分配任务给合适的协作者
    await this.assignTask(fullTask);

    return taskId;
  }

  /**
   * 获取任务进度
   */
  getTaskProgress(taskId: string): any {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    return {
      taskId: task.id,
      status: task.status,
      progress: 0.5, // Default 50% progress
      assignedAgents: task.assignedAgents,
      requiredCapabilities: task.requiredCapabilities
    };
  }

  /**
   * 分配任务
   */
  private async assignTask(task: CollaborationTask): Promise<void> {
    const suitableAgents = this.findSuitableAgents(task.requiredCapabilities);

    if (suitableAgents.length === 0) {
      task.status = 'failed';
      this.emit('task:failed', { taskId: task.id, reason: 'No suitable agents' });
      return;
    }

    switch (this.strategy) {
      case CollaborationStrategy.PARALLEL:
        await this.executeParallel(task, suitableAgents);
        break;
      case CollaborationStrategy.SEQUENTIAL:
        await this.executeSequential(task, suitableAgents);
        break;
      case CollaborationStrategy.CONSENSUS:
        await this.executeConsensus(task, suitableAgents);
        break;
      case CollaborationStrategy.LEADER_FOLLOWER:
        await this.executeLeaderFollower(task, suitableAgents);
        break;
      case CollaborationStrategy.AUCTION:
        await this.executeAuction(task, suitableAgents);
        break;
    }
  }

  /**
   * 查找合适的Agent
   */
  private findSuitableAgents(requiredCapabilities: string[] | undefined): CollaborativeAgent[] {
    if (!requiredCapabilities || requiredCapabilities.length === 0) {
      // 如果没有指定需要的能力，返回所有协作者
      return Array.from(this.collaborators.values());
    }
    return Array.from(this.collaborators.values()).filter(agent =>
      requiredCapabilities.every(cap => agent.hasCapability(cap))
    );
  }

  /**
   * 并行执行
   */
  private async executeParallel(
    task: CollaborationTask,
    agents: CollaborativeAgent[]
  ): Promise<void> {
    task.status = 'in_progress';
    task.assignedAgents = agents.map(a => a.getId());

    const promises = agents.map(agent =>
      agent.receiveMessage({
        id: `msg-${Date.now()}`,
        type: CollaborationMessageType.REQUEST,
        from: this.getId(),
        to: agent.getId(),
        content: { task },
        timestamp: Date.now()
      })
    );

    await Promise.all(promises);
    task.status = 'completed';
    
    this.emit('task:completed', { taskId: task.id });
  }

  /**
   * 顺序执行
   */
  private async executeSequential(
    task: CollaborationTask,
    agents: CollaborativeAgent[]
  ): Promise<void> {
    task.status = 'in_progress';
    task.assignedAgents = agents.map(a => a.getId());

    for (const agent of agents) {
      await agent.receiveMessage({
        id: `msg-${Date.now()}`,
        type: CollaborationMessageType.REQUEST,
        from: this.getId(),
        to: agent.getId(),
        content: { task },
        timestamp: Date.now()
      });
    }

    task.status = 'completed';
    this.emit('task:completed', { taskId: task.id });
  }

  /**
   * 共识执行
   */
  private async executeConsensus(
    task: CollaborationTask,
    agents: CollaborativeAgent[]
  ): Promise<void> {
    task.status = 'in_progress';
    
    // 收集所有Agent的投票
    const votes = await Promise.all(
      agents.map(agent =>
        agent.receiveMessage({
          id: `msg-${Date.now()}`,
          type: CollaborationMessageType.QUERY,
          from: this.getId(),
          to: agent.getId(),
          content: { task, requestVote: true },
          timestamp: Date.now()
        }).then(() => Math.random() > 0.3) // 模拟投票
      )
    );

    const approvalRate = votes.filter(v => v).length / votes.length;
    
    if (approvalRate > 0.5) {
      task.status = 'completed';
      this.emit('task:completed', { taskId: task.id });
    } else {
      task.status = 'failed';
      this.emit('task:failed', { taskId: task.id, reason: 'No consensus' });
    }
  }

  /**
   * 领导-跟随执行
   */
  private async executeLeaderFollower(
    task: CollaborationTask,
    agents: CollaborativeAgent[]
  ): Promise<void> {
    const leader = agents[0];
    const followers = agents.slice(1);

    task.status = 'in_progress';
    task.assignedAgents = [leader.getId(), ...followers.map(a => a.getId())];

    // 领导者执行主要任务
    await leader.receiveMessage({
      id: `msg-${Date.now()}`,
      type: CollaborationMessageType.REQUEST,
      from: this.getId(),
      to: leader.getId(),
      content: { task, role: 'leader' },
      timestamp: Date.now()
    });

    // 跟随者执行辅助任务
    await Promise.all(
      followers.map(follower =>
        follower.receiveMessage({
          id: `msg-${Date.now()}`,
          type: CollaborationMessageType.REQUEST,
          from: this.getId(),
          to: follower.getId(),
          content: { task, role: 'follower' },
          timestamp: Date.now()
        })
      )
    );

    task.status = 'completed';
    this.emit('task:completed', { taskId: task.id });
  }

  /**
   * 拍卖执行
   */
  private async executeAuction(
    task: CollaborationTask,
    agents: CollaborativeAgent[]
  ): Promise<void> {
    // 收集所有Agent的出价
    const bids = await Promise.all(
      agents.map(async agent => ({
        agent,
        bid: Math.random() * 100 // 模拟出价
      }))
    );

    // 选择最高出价者
    const winner = bids.reduce((best, current) =>
      current.bid > best.bid ? current : best
    );

    task.status = 'in_progress';
    task.assignedAgents = [winner.agent.getId()];

    await winner.agent.receiveMessage({
      id: `msg-${Date.now()}`,
      type: CollaborationMessageType.REQUEST,
      from: this.getId(),
      to: winner.agent.getId(),
      content: { task },
      timestamp: Date.now()
    });

    task.status = 'completed';
    this.emit('task:completed', { taskId: task.id });
  }

  /**
   * 处理请求
   */
  private async processRequest(content: any): Promise<any> {
    // 模拟处理请求
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, result: 'Processed' };
  }

  /**
   * 获取可用容量
   */
  private getAvailableCapacity(): number {
    // 模拟可用容量计算
    return 1.0;
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): CollaborationTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): CollaborationTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 获取协作者列表
   */
  getCollaborators(): CollaborativeAgent[] {
    return Array.from(this.collaborators.values());
  }

  /**
   * 生成协作报告
   */
  generateCollaborationReport(): string {
    const completedTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'completed').length;
    const failedTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'failed').length;

    return `
╔══════════════════════════════════════════════════════════════╗
║          Collaborative Agent Report                         ║
╚══════════════════════════════════════════════════════════════╝

Agent: ${this.getName()}
ID: ${this.getId()}

=== 协作统计 ===
协作者数量: ${this.collaborators.size}
总任务数: ${this.tasks.size}
已完成: ${completedTasks}
失败: ${failedTasks}

=== 协作策略 ===
当前策略: ${this.strategy}
最大协作者: ${this.maxCollaborators}

=== 消息统计 ===
消息队列大小: ${this.messageQueue.length}

=== 协作者列表 ===
${Array.from(this.collaborators.values()).map(agent =>
  `- ${agent.getName()} (${agent.getId()})`
).join('\n')}
    `.trim();
  }
}

/**
 * 创建协作Agent
 */
export function createCollaborativeAgent(
  config: CollaborativeAgentConfig
): CollaborativeAgent {
  return new CollaborativeAgent(config);
}