/**
 * @file 学习系统类型定义
 * @description 定义学习系统的核心类型接口
 * @module learning/types
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-30
 * @updated 2025-12-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 学习系统配置
export interface LearningConfig {
  enableReinforcementLearning: boolean;
  enablePatternRecognition: boolean;
  feedbackMechanism: boolean;
}

// 用户反馈
export interface UserFeedback {
  rating: number;
  comment?: string;
  improvementSuggestions?: string[];
}

// 学习洞察
export interface LearningInsight {
  id: string;
  type: string;
  content: string;
  confidence: number;
  timestamp: Date;
}

// 性能指标
export interface PerformanceMetric {
  responseTime: number;
  relevance: number;
  usefulness: number;
  userSatisfaction: number;
}

// 交互记录
export interface InteractionRecord {
  timestamp: Date;
  userMessage: LearningUserMessage;
  aiResponse: LearningAIResponse;
  context?: any;
  performance?: PerformanceMetric;
}

// 知识条目
export interface KnowledgeEntry {
  id: string;
  type: 'fact' | 'pattern' | 'preference' | 'rule';
  content: any;
  metadata: {
    source: string;
    confidence: number;
    timestamp: Date;
    lastUsed?: Date;
  };
}

// 学习记录
export interface LearningRecord {
  id: string;
  timestamp: string;
  userQuery?: string;
  accuracy?: number;
  responseTime?: number;
  userSatisfaction?: number;
  toolUsage?: Array<{ toolName: string; effectiveness: number }>;
}

// 性能评估
export interface PerformanceEvaluation {
  id: string;
  timestamp: string;
  accuracy: number;
  responseTime: number;
  userSatisfaction: number;
  toolUsageEffectiveness: number;
  learningProgress: number;
}

// 模式识别结果
export interface PatternRecognitionResult {
  id: string;
  type: string;
  patterns: Array<{ type: string; frequency: number } | { question: string; frequency: number } | { toolName: string; frequency: number } | { hour: number; frequency: number }>;
  confidence: number;
  detectedAt: string;
}

// 反馈分析结果
export interface FeedbackAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  keyThemes: string[];
  improvementAreas: string[];
  confidence: number;
}

// 用户消息和AI响应接口（从核心类型导入或重定义）
export interface LearningUserMessage {
  id: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LearningAIResponse {
  id: string;
  content: string;
  timestamp: Date;
  toolCalls?: any[];
  metadata?: Record<string, any>;
}