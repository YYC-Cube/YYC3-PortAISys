/**
 * @file YYC³ 自治AI浮窗系统主入口
 * @description 导出所有核心功能和组件
 * @module index
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-30
 * @updated 2025-12-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 核心配置和实例接口
export * from './autonomous-ai-widget/types';

export { AutonomousAIEngine } from './autonomous-ai-widget/AutonomousAIEngine';

// AI模型适配器
export * from './adapters/ModelAdapter';
export { OpenAIModelAdapter } from './adapters/OpenAIModelAdapter';
export { InternalModelAdapter } from './adapters/InternalModelAdapter';

// 学习系统
export * from './learning/types';
export { LearningSystem } from './learning/LearningSystem';

// 记忆系统
export * from './memory/types';
export { MemorySystem } from './memory/MemorySystem';

// 工具系统
export * from './tools/types';
export { ToolRegistry } from './tools/ToolRegistry';
export * from './tools/core-tools';

// 上下文管理器
export { ContextManager } from './context-manager/ContextManager';

// 消息总线系统
export * from './message-bus/MessageBus';
export { MessageBus } from './message-bus/MessageBus';

// 任务调度器
export * from './task-scheduler/TaskScheduler';
export { TaskScheduler } from './task-scheduler/TaskScheduler';

// 状态管理器
export * from './state-manager/StateManager';
export { StateManager } from './state-manager/StateManager';

// 事件分发器
export * from './event-dispatcher/EventDispatcher';
export { EventDispatcher } from './event-dispatcher/EventDispatcher';

// 知识库系统
export * from './knowledge-base/KnowledgeBase';
export { KnowledgeBase } from './knowledge-base/KnowledgeBase';

// 智能缓存层
export * from './cache/CacheLayer';
export { IntelligentCacheLayer } from './cache/CacheLayer';

// 性能优化引擎
export * from './performance/OptimizationEngine';
export { PerformanceOptimizer } from './performance/OptimizationEngine';

// 全局错误处理器
export * from './error-handler/GlobalErrorHandler';
export { GlobalErrorHandler } from './error-handler/GlobalErrorHandler';

// 统一错误处理系统
export * from './error-handler';
export { ErrorHandler, ErrorBoundary } from './error-handler';

// 可插拔式拖拽移动AI系统
export * from './pluggable/types';
export * from './pluggable/AutonomousAIEngine';
export * from './pluggable/ModelAdapter';
export { AutonomousAIEngine as PluggableAIEngine } from './pluggable/AutonomousAIEngine';
export { ModelAdapter, OpenAIAdapter, AnthropicAdapter, LocalModelAdapter } from './pluggable/ModelAdapter';
export { createEngine, createModelAdapter } from './pluggable';

// 闭环系统
export { ClosedLoopSystem } from './closed-loop/ClosedLoopSystem';

// 价值创建维度
export { GoalManagementSystem } from './closed-loop/value-creation/GoalManagementSystem';
export { ValueValidationFramework } from './closed-loop/value-creation/ValueValidationFramework';

// 技术演进维度
export { TechnicalMaturityModel } from './closed-loop/technical-evolution/TechnicalMaturityModel';
export { TechnologyRoadmap } from './closed-loop/technical-evolution/TechnologyRoadmap';

// 数据驱动维度
export { DataOptimizationLoop } from './closed-loop/data-driven/DataOptimizationLoop';
export { DataQualityFramework } from './closed-loop/data-driven/DataQualityFramework';

// 用户体验维度
export { UXOptimizationLoop } from './closed-loop/ux/UXOptimizationLoop';
export { UserResearchSystem } from './closed-loop/ux/UserResearchSystem';

// 业务价值维度
export { BusinessValueFramework } from './closed-loop/business-value/BusinessValueFramework';
export { ROIcalculator } from './closed-loop/business-value/ROIcalculator';

// UI全局页面系统
export * from './ui/types';
export * from './ui/ChatInterface';
export * from './ui/ToolboxPanel';
export * from './ui/InsightsDashboard';
export * from './ui/WorkflowDesigner';
export * from './ui/UIManager';
export * from './ui/UISystem';
export { ChatInterface } from './ui/ChatInterface';
export { ToolboxPanel } from './ui/ToolboxPanel';
export { InsightsDashboard } from './ui/InsightsDashboard';
export { WorkflowDesigner } from './ui/WorkflowDesigner';
export { UIManager } from './ui/UIManager';
export { UISystem, UISystemConfig } from './ui/UISystem';

// 智能体系统
export * from './ai/AgentProtocol';
export * from './ai/BaseAgent';
export * from './ai/AgentManager';
export * from './ai/agents/LayoutAgent';
export * from './ai/agents/BehaviorAgent';
export * from './ai/agents/ContentAgent';
export * from './ai/agents/AssistantAgent';
export * from './ai/agents/MonitoringAgent';
export * from './ai/index';
export { BaseAgent } from './ai/BaseAgent';
export { AgentManager, AgentManagerConfig } from './ai/AgentManager';
export { LayoutAgent } from './ai/agents/LayoutAgent';
export { BehaviorAgent } from './ai/agents/BehaviorAgent';
export { ContentAgent } from './ai/agents/ContentAgent';
export { AssistantAgent } from './ai/agents/AssistantAgent';
export { MonitoringAgent } from './ai/agents/MonitoringAgent';
export { AgentSystem } from './ai/index';

// 智能体系统集成
export * from './integration/AgentSystemIntegration';
export { AgentSystemIntegration } from './integration/AgentSystemIntegration';

// 版本信息
export const VERSION = '1.0.0';

// 系统信息
export const SYSTEM_INFO = {
  name: 'YYC³ 自治AI浮窗系统',
  description: '完全自治的智能AI浮窗系统，具备独立运行、模块复用、自主学习等高级能力',
  version: VERSION,
  author: 'YYC³ Team',
  license: 'MIT',
  created: '2025-12-30'
};

/**
 * 创建新的AI浮窗实例
 * @param config AI浮窗配置
 * @returns AI浮窗实例
 */
export const createAIWidget = (config: AutonomousAIConfig): AIWidgetInstance => {
  const id = `ai-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const engine = new AutonomousAIEngine(config);
  const closedLoopSystem = new ClosedLoopSystem(config);

  return {
    id,
    config,
    state: {
      isInitialized: true,
      isRunning: true,
      currentStep: 'idle',
      metrics: {
        usageCount: 0,
        learningProgress: 0,
        systemHealth: 'healthy'
      }
    },
    capabilities: {
      autonomousLearning: config.enableLearning,
      memoryStorage: config.enableMemory,
      toolUsage: config.enableToolUse,
      contextAwareness: config.enableContextAwareness,
      multiModelSupport: true,
      realTimeProcessing: true
    },
    destroy: () => {
      // 清理资源
      console.log(`Destroying AI widget instance: ${id}`);
    },
    updateConfig: (newConfig: Partial<AutonomousAIConfig>) => {
      config = { ...config, ...newConfig };
      console.log(`Updated config for AI widget instance: ${id}`, newConfig);
    }
  };
};

/**
 * 初始化整个YYC³ AI系统
 * @param config 系统配置
 * @returns 初始化结果
 */
export const initializeYYC3AI = async (config: AutonomousAIConfig) => {
  try {
    console.log('Initializing YYC³ AI System...');
    
    // 创建核心引擎实例
    const engine = new AutonomousAIEngine(config);
    
    // 初始化闭环系统
    const closedLoopSystem = new ClosedLoopSystem(config);
    
    // 初始化智能体系统集成
    const { AgentSystemIntegration } = await import('./integration/AgentSystemIntegration');
    const agentSystemIntegration = new AgentSystemIntegration({
      enableAutoAgents: true,
      enableLayoutAgent: true,
      enableBehaviorAgent: true,
      enableContentAgent: true,
      enableAssistantAgent: true,
      enableMonitoringAgent: true
    });
    
    await agentSystemIntegration.initialize();
    await agentSystemIntegration.integrateWithEngine(engine);
    
    // 启动学习系统
    if (config.enableLearning) {
      console.log('Starting learning system...');
      // 这里可以添加学习系统的启动逻辑
    }
    
    console.log('YYC³ AI System initialized successfully!');
    
    return {
      engine,
      closedLoopSystem,
      agentSystemIntegration,
      widget: createAIWidget(config),
      systemInfo: SYSTEM_INFO
    };
  } catch (error) {
    console.error('Failed to initialize YYC³ AI System:', error);
    throw error;
  }
};