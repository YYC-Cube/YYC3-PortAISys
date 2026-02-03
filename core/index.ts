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

import type { AutonomousAIConfig, AIWidgetInstance } from './autonomous-ai-widget/types';
import { AutonomousAIEngine as PluggableAutonomousAIEngine } from './pluggable/AutonomousAIEngine';
import type { EngineConfig } from './pluggable/types';
import { ClosedLoopSystem } from './closed-loop/ClosedLoopSystem';
import { logger } from './utils/logger';

// 核心配置和实例接口
export type { AutonomousAIConfig, AIWidgetInstance } from './autonomous-ai-widget/types';
export { AutonomousAIEngine as PluggableAutonomousAIEngine } from './pluggable/AutonomousAIEngine';

// AI模型适配器
export type { ModelAdapter, ModelGenerationRequest, ModelGenerationResponse, ModelAdapterRegistration, ModelAdapterFactory } from './adapters/ModelAdapter';
export { OpenAIModelAdapter } from './adapters/OpenAIModelAdapter';
export { InternalModelAdapter } from './adapters/InternalModelAdapter';

// 学习系统
export type {
  LearningConfig as LearningLearningConfig,
  UserFeedback as LearningUserFeedback,
  LearningInsight as LearningLearningInsight,
  PerformanceMetric as LearningPerformanceMetric,
  InteractionRecord,
  KnowledgeEntry,
  LearningRecord,
  PerformanceEvaluation,
  PatternRecognitionResult,
  FeedbackAnalysisResult,
  LearningUserMessage,
  LearningAIResponse
} from './learning/types';
export { LearningSystem } from './learning/LearningSystem';

// 记忆系统
export { MemorySystem } from './memory/MemorySystem';

// 工具系统
export * from './tools/types';
export { ToolRegistry } from './tools/ToolRegistry';
export * from './tools/core-tools';

// 上下文管理器
export { ContextManager } from './context-manager/ContextManager';

// 消息总线系统
export { MessageBus } from './message-bus/MessageBus';

// 任务调度器
export { TaskScheduler } from './task-scheduler/TaskScheduler';

// 状态管理器
export { StateManager } from './state-manager/StateManager';

// 事件分发器
export { EventDispatcher } from './event-dispatcher/EventDispatcher';

// 知识库系统
export { KnowledgeBase } from './knowledge-base/KnowledgeBase';

// 智能缓存层
export { IntelligentCacheLayer } from './cache/CacheLayer';

// 性能优化引擎
export { PerformanceOptimizer } from './performance/OptimizationEngine';

// 全局错误处理器
export { GlobalErrorHandler } from './error-handler/GlobalErrorHandler';

// 统一错误处理系统
export type {
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  ErrorMetadata
} from './error-handler/ErrorTypes';
export {
  YYC3Error,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  InternalError,
  isYYC3Error,
  getErrorCode,
  getErrorCategory,
  getErrorSeverity,
  isRetryable
} from './error-handler/ErrorTypes';
export * from './error-handler/ErrorHandler';
export * from './error-handler/ErrorBoundary';
export * from './error-handler/IntegratedErrorHandler';

// 可插拔式拖拽移动AI系统
export type {
  EngineStatus,
  MessageType,
  TaskStatus,
  EngineConfig,
  MessageHandler,
  AgentGoal,
  TaskPlan,
  TaskStep,
  TaskResult,
  TaskStepResult,
  TaskProgress,
  ISubsystem,
  SubsystemStatus,
  SystemEvent,
  EngineState,
  EngineSnapshot,
  EngineMetrics,
  DiagnosticReport,
  SubsystemHealth,
  PerformanceMetrics,
  DiagnosticIssue,
  ModelConfig,
  ModelRequest,
  ModelResponse,
  ModelCapabilities,
  IModelAdapter,
  IAutonomousAIEngine,
  ComplexTask,
  TaskRequirement,
  CoordinationResult,
  SubsystemAssignment,
  DependencyGraph
} from './pluggable/types';
export * from './pluggable/AutonomousAIEngine';
export * from './pluggable/ModelAdapter';
export { createEngine, createModelAdapter } from './pluggable';

// 闭环系统
export { ClosedLoopSystem } from './closed-loop/ClosedLoopSystem';

// 价值创建维度
export { GoalManagementSystem } from './closed-loop/value-creation/GoalManagementSystem';

// 技术演进维度
export { TechnicalMaturityModel } from './closed-loop/technical-evolution/TechnicalMaturityModel';
export { TechnologyRoadmap } from './closed-loop/technical-evolution/TechnologyRoadmap';

// UI全局页面系统
export * from './ui/types';
export * from './ui/ChatInterface';
export * from './ui/ToolboxPanel';
export * from './ui/InsightsDashboard';
export * from './ui/WorkflowDesigner';
export * from './ui/UIManager';
export * from './ui/UISystem';

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

  return {
    id,
    config,
    state: {
      isActive: true,
      isLoading: false,
      currentConversation: [],
      lastInteraction: new Date()
    },
    capabilities: {
      canLearn: config.enableLearning,
      canUseTools: config.enableToolUse,
      canRemember: config.enableMemory,
      canAdapt: config.enableContextAwareness
    },
    destroy: () => {
      logger.warn(`Destroying AI widget instance: ${id}`, 'index');
    },
    updateConfig: (newConfig: Partial<AutonomousAIConfig>) => {
      config = { ...config, ...newConfig };
      logger.warn(`Updated config for AI widget instance: ${id}`, 'index', { newConfig });
    },
    sendMessage: async (_message: any) => {
      return { content: '', timestamp: Date.now() };
    },
    registerTool: async (tool: any) => {
      logger.warn(`Registering tool: ${tool.name}`, 'index');
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
    logger.info('Initializing YYC³ AI System...', 'index');

    // 转换配置类型
    const engineConfig: EngineConfig = {
      maxConcurrentTasks: 10,
      taskTimeout: 300000,
      enablePersistence: true,
      persistencePath: './data/engine-state',
      enableMetrics: true,
      debugMode: false,
      logLevel: 'info',
      modelAdapter: config.apiType,
      subsystems: []
    };

    // 创建核心引擎实例
    const engine = new PluggableAutonomousAIEngine(engineConfig);

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
      logger.info('Starting learning system...', 'index');
      // 这里可以添加学习系统的启动逻辑
    }

    logger.info('YYC³ AI System initialized successfully!', 'index');

    return {
      engine,
      closedLoopSystem,
      agentSystemIntegration,
      widget: createAIWidget(config),
      systemInfo: SYSTEM_INFO
    };
  } catch (error) {
    logger.error('Failed to initialize YYC³ AI System:', 'index', { error }, error as Error);
    throw error;
  }
};
