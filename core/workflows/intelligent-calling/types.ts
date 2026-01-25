/**
 * @file 智能呼叫工作流类型定义
 * @description 定义智能呼叫相关的类型和接口
 * @module workflows/intelligent-calling/types
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-12-30
 */

/**
 * 实时上下文接口
 */
export interface RealTimeContext {
  transcript: string;
  sentiment: {
    score: number;
    emotion: string;
  };
  intent: string;
  detectedIntent?: string;
  callContext: Record<string, unknown>;
}

/**
 * 实时建议接口
 */
export interface RealTimeSuggestion {
  type: string;
  message: string;
  suggestedPhrase: string;
  urgency: 'low' | 'medium' | 'high';
}

/**
 * 实时辅助结果接口
 */
export interface RealTimeAssistance {
  transcript: string;
  sentimentScore: number;
  detectedIntent: string;
  realTimeSuggestions: RealTimeSuggestion[];
  warningAlerts: unknown[];
  opportunityFlags: unknown[];
}

/**
 * 通话准备接口
 */
export interface CallPreparation {
  callId: string;
  customerInfo: Record<string, unknown>;
  callPurpose: string;
  preparedScripts: string[];
}

/**
 * 通话执行接口
 */
export interface CallExecution {
  callId: string;
  status: string;
  transcript?: string;
  sentimentAnalysis?: unknown;
  recommendations?: unknown[];
  realTimeAI: RealTimeAI;
}

/**
 * 实时AI接口
 */
export interface RealTimeAI {
  speechToText: SpeechToText;
  sentimentAnalysis: SentimentAnalysis;
  intentRecognition: IntentRecognition;
  nextBestAction: NextBestAction;
  analyze: (transcript: string) => Promise<any>;
}

/**
 * 语音转文本接口
 */
export interface SpeechToText {
  transcribeRealtime: (audioStream: unknown) => Promise<string>;
}

/**
 * 情感分析接口
 */
export interface SentimentAnalysis {
  analyzeRealtime: (transcript: string) => Promise<{
    score: number;
    emotion: string;
  }>;
}

/**
 * 意图识别接口
 */
export interface IntentRecognition {
  classifyIntent: (transcript: string) => Promise<string>;
}

/**
 * 下一步最佳行动接口
 */
export interface NextBestAction {
  suggest: (context: RealTimeContext) => Promise<RealTimeSuggestion[]>;
}

/**
 * 通话会话接口
 */
export interface CallSession {
  sessionId: string;
  audioStream: unknown;
  context: Record<string, unknown>;
}
