/**
 * @file 用户认证模块
 * @description 处理用户登录、注册、权限验证等核心功能
 * @module auth
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export interface AutonomousAIConfig {
  // 核心配置
  apiType: 'internal' | 'openai' | 'azure' | 'custom';
  modelName: string;
  maxTokens: number;
  temperature: number;
  preferredLanguage?: string;
  
  // API配置
  apiKey?: string;
  baseURL?: string;
  endpoint?: string;
  timeout?: number;
  
  // 自治能力配置
  enableLearning: boolean;
  enableMemory: boolean;
  enableToolUse: boolean;
  enableContextAwareness: boolean;
  
  // UI配置
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  
  // 业务集成
  businessContext?: BusinessContext;
  customTools?: AITool[];
  dataSources?: DataSource[];
}

export interface AIWidgetInstance {
  id: string;
  config: AutonomousAIConfig;
  state: AIWidgetState;
  capabilities: AICapabilities;
  destroy: () => void;
  updateConfig: (config: Partial<AutonomousAIConfig>) => void;
  sendMessage: (message: UserMessage | any) => Promise<AIResponse>;
  registerTool: (tool: AITool) => Promise<void>;
}

// 辅助接口定义
export interface BusinessContext {
  industry?: string;
  userRole?: string;
  availableFeatures?: string[];
  domain?: string;
  tone?: string;
  responseStyle?: string;
}

export interface AITool {
  name: string;
  description: string;
  category?: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
}

export interface DataSource {
  name: string;
  type: string;
  url?: string;
  apiKey?: string;
  query?: string;
}

export interface AIWidgetState {
  isActive: boolean;
  isLoading: boolean;
  currentConversation: ConversationMessage[];
  lastInteraction: Date;
}

export interface AICapabilities {
  canLearn: boolean;
  canUseTools: boolean;
  canRemember: boolean;
  canAdapt: boolean;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'ai' | 'tool';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface UserMessage {
  user: string;
  content: string;
  type?: string;
  tool?: string;
  parameters?: any;
}

export interface AIResponse {
  content: string;
  toolCalls?: any[];
  usage?: any;
  model?: string;
  responseTime?: number;
  data?: any;
  immediate_action_required?: boolean;
  recommended_actions?: any[];
}

export interface AIContext {
  timestamp: Date;
  user: string;
  conversationHistory: ConversationMessage[];
  userPreferences: any;
  businessContext?: BusinessContext;
  pageContext?: any;
  availableTools: AITool[];
}

export interface ModelResponse {
  content: string;
  toolCalls?: any[];
  usage?: any;
  model?: string;
}

export interface LearningConfig {
  enableReinforcementLearning: boolean;
  enablePatternRecognition: boolean;
  feedbackMechanism: boolean;
}

export interface UserFeedback {
  rating: number;
  comment?: string;
  improvementSuggestions?: string[];
}

export interface LearningInsight {
  id: string;
  type: string;
  content: string;
  confidence: number;
  timestamp: Date;
}

export interface PerformanceMetric {
  responseTime: number;
  relevance: number;
  usefulness: number;
  userSatisfaction: number;
}