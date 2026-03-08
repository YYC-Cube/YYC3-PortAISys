/**
 * @file workflows/intelligent-calling/types.ts
 * @description Types 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
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
