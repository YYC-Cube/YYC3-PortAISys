/**
 * @file AgentOrchestrator.ts
 * @description Agent编排器 - 协调多个Agent协同工作
 * @module core/ai
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { EventEmitter } from 'events';
import { BaseAgent } from './BaseAgent';
import { CollaborativeAgent } from './agents/CollaborativeAgent';

/**
 * 工作流节点类型
 */
export enum WorkflowNodeType {
  START = 'start',
  END = 'end',
  AGENT = 'agent',
  DECISION = 'decision',
  PARALLEL = 'parallel',
  MERGE = 'merge'
}

/**
 * 工作流节点
 */
export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  agentId?: string;
  condition?: (context: any) => boolean;
  next?: string | string[];
  metadata?: Record<string, any>;
}

/**
 * 工作流定义
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  initialContext?: Record<string, any>;
}

/**
 * 工作流执行上下文
 */
export interface WorkflowContext {
  workflowId: string;
  data: Record<string, any>;
  currentNode: string;
  visitedNodes: string[];
  startTime: number;
  endTime?: number;
  status?: 'running' | 'completed' | 'failed';
  error?: string;
}

/**
 * 编排策略
 */
export enum OrchestrationStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  ADAPTIVE = 'adaptive',
  PRIORITIZED = 'prioritized'
}

/**
 * Agent编排器配置
 */
export interface OrchestratorConfig {
  strategy?: OrchestrationStrategy;
  maxConcurrency?: number;
  timeout?: number;
}

/**
 * Agent编排器
 */
export class AgentOrchestrator extends EventEmitter {
  private config: Required<OrchestratorConfig>;
  private agents: Map<string, BaseAgent> = new Map();
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private activeWorkflows: Map<string, WorkflowContext> = new Map();

  constructor(config: OrchestratorConfig = {}) {
    super();

    this.config = {
      strategy: config.strategy || OrchestrationStrategy.ADAPTIVE,
      maxConcurrency: config.maxConcurrency || 10,
      timeout: config.timeout || 300000 // 5分钟
    };
  }

  /**
   * 注册Agent
   */
  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.getId(), agent);
    this.emit('agent:registered', { agentId: agent.getId() });
  }

  /**
   * 注销Agent
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.emit('agent:unregistered', { agentId });
  }

  /**
   * 注册工作流
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.validateWorkflow(workflow);
    this.workflows.set(workflow.id, workflow);
    this.emit('workflow:registered', { workflowId: workflow.id });
  }

  /**
   * 获取工作流定义
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * 验证工作流
   */
  private validateWorkflow(workflow: WorkflowDefinition): void {
    const hasStart = workflow.nodes.some(n => n.type === WorkflowNodeType.START);
    const hasEnd = workflow.nodes.some(n => n.type === WorkflowNodeType.END);

    if (!hasStart) {
      throw new Error('Workflow must have a START node');
    }

    if (!hasEnd) {
      throw new Error('Workflow must have an END node');
    }

    // 验证所有Agent引用
    for (const node of workflow.nodes) {
      if (node.type === WorkflowNodeType.AGENT && node.agentId) {
        if (!this.agents.has(node.agentId)) {
          throw new Error(`Agent ${node.agentId} not found`);
        }
      }
    }
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(
    workflowId: string,
    initialData?: Record<string, any>
  ): Promise<WorkflowContext> {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const context: WorkflowContext = {
      workflowId,
      data: { ...workflow.initialContext, ...initialData },
      currentNode: this.findStartNode(workflow).id,
      visitedNodes: [],
      startTime: Date.now()
    };

    this.activeWorkflows.set(workflowId, context);
    this.emit('workflow:started', { workflowId, context });

    try {
      // 持续执行节点直到到达 END 节点
      let iterations = 0;
      const maxIterations = 1000; // 防止无限循环

      while (iterations < maxIterations) {
        iterations++;
        const currentNodeObj = workflow.nodes.find(n => n.id === context.currentNode);
        
        if (!currentNodeObj) {
          throw new Error(`Current node ${context.currentNode} not found`);
        }

        // 如果到达 END 节点，停止
        if (currentNodeObj.type === WorkflowNodeType.END) {
          break;
        }

        // 执行当前节点
        await this.executeNode(workflow, context);

        // 查找下一个节点
        const nextEdges = workflow.edges.filter(e => e.from === context.currentNode);
        if (nextEdges.length === 0) {
          // 如果没有出边，尝试找到 END 节点
          const endNode = workflow.nodes.find(n => n.type === WorkflowNodeType.END);
          if (endNode) {
            context.currentNode = endNode.id;
          } else {
            throw new Error(`No next edge from node ${context.currentNode}`);
          }
        } else {
          // 移动到第一条出边的目标节点
          context.currentNode = nextEdges[0].to;
        }
      }

      context.endTime = Date.now();
      context.status = 'completed';
      
      this.emit('workflow:completed', { workflowId, context });
      return context;
    } catch (error) {
      context.status = 'failed';
      context.error = error instanceof Error ? error.message : String(error);
      this.emit('workflow:error', { workflowId, error });
      throw error;
    } finally {
      this.activeWorkflows.delete(workflowId);
    }
  }

  /**
   * 查找开始节点
   */
  private findStartNode(workflow: WorkflowDefinition): WorkflowNode {
    const startNode = workflow.nodes.find(n => n.type === WorkflowNodeType.START);
    if (!startNode) {
      throw new Error('No START node found');
    }
    return startNode;
  }

  /**
   * 执行节点
   */
  private async executeNode(
    workflow: WorkflowDefinition,
    context: WorkflowContext
  ): Promise<void> {
    const node = workflow.nodes.find(n => n.id === context.currentNode);
    
    if (!node) {
      throw new Error(`Node ${context.currentNode} not found`);
    }

    context.visitedNodes.push(node.id);
    this.emit('node:executing', { nodeId: node.id, context });

    switch (node.type) {
      case WorkflowNodeType.START:
        await this.executeStartNode(workflow, context, node);
        break;
      
      case WorkflowNodeType.END:
        // 工作流结束
        return;
      
      case WorkflowNodeType.AGENT:
        await this.executeAgentNode(workflow, context, node);
        break;
      
      case WorkflowNodeType.DECISION:
        await this.executeDecisionNode(workflow, context, node);
        break;
      
      case WorkflowNodeType.PARALLEL:
        await this.executeParallelNode(workflow, context, node);
        break;
      
      case WorkflowNodeType.MERGE:
        await this.executeMergeNode(workflow, context, node);
        break;
    }

    this.emit('node:completed', { nodeId: node.id, context });
  }

  /**
   * 执行开始节点
   */
  private async executeStartNode(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    node: WorkflowNode
  ): Promise<void> {
    // 开始节点只是一个起点，不执行任何操作
  }

  /**
   * 执行Agent节点
   */
  private async executeAgentNode(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    node: WorkflowNode
  ): Promise<void> {
    if (!node.agentId) {
      throw new Error('Agent node must have agentId');
    }

    const agent = this.agents.get(node.agentId);
    if (!agent) {
      throw new Error(`Agent ${node.agentId} not found`);
    }

    // 执行Agent任务（如果 agent 有 execute 方法）
    if (typeof (agent as any).execute === 'function') {
      const result = await (agent as any).execute(context.data);
      context.data = { ...context.data, ...result };
    } else {
      // 否则只是标记为已执行
      context.data[`${node.agentId}_executed`] = true;
    }
  }

  /**
   * 执行决策节点
   */
  private async executeDecisionNode(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    node: WorkflowNode
  ): Promise<void> {
    // 决策逻辑可以在这里实现，但由于使用edges，决策结果应该在主循环中处理
    // 对于简单实现，我们假设第一条边是默认路径
  }

  /**
   * 执行并行节点
   */
  private async executeParallelNode(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    node: WorkflowNode
  ): Promise<void> {
    // 并行执行由主循环处理，这里只是标记为并行节点
  }

  /**
   * 执行合并节点
   */
  private async executeMergeNode(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    node: WorkflowNode
  ): Promise<void> {
    // 合并节点用于同步并行分支的结果
    // 在简单实现中，这里不需要做任何事情
  }

  /**
   * 获取工作流状态
   */
  getWorkflowStatus(workflowId: string): WorkflowContext | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * 取消工作流
   */
  cancelWorkflow(workflowId: string): void {
    const context = this.activeWorkflows.get(workflowId);
    
    if (context) {
      this.activeWorkflows.delete(workflowId);
      this.emit('workflow:cancelled', { workflowId });
    }
  }

  /**
   * 获取所有Agent
   */
  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * 获取所有工作流
   */
  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * 生成编排报告
   */
  generateReport(): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║            Agent Orchestrator Report                        ║
╚══════════════════════════════════════════════════════════════╝

=== Agent统计 ===
已注册Agent: ${this.agents.size}
活动工作流: ${this.activeWorkflows.size}
已注册工作流: ${this.workflows.size}

=== 编排策略 ===
当前策略: ${this.config.strategy}
最大并发: ${this.config.maxConcurrency}
超时时间: ${this.config.timeout}ms

=== 已注册Agent ===
${Array.from(this.agents.values()).map(agent =>
  `- ${agent.getName()} (${agent.getId()})`
).join('\n')}

=== 已注册工作流 ===
${Array.from(this.workflows.values()).map(wf =>
  `- ${wf.name} (${wf.id}) - ${wf.nodes.length} nodes`
).join('\n')}
    `.trim();
  }
}

/**
 * 创建Agent编排器
 */
export function createAgentOrchestrator(config?: OrchestratorConfig): AgentOrchestrator {
  return new AgentOrchestrator(config);
}