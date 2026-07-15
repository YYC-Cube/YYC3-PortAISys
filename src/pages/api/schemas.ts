/**
 * @file pages/api/schemas.ts
 * @description API 请求体 Zod 校验 Schema 定义
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,api,validation,zod
 */

import { z } from 'zod';

// ============================================================
// 公共校验工具
// ============================================================

export interface ValidationError {
  success: false;
  status: 400;
  body: { success: false; error: string; details?: unknown };
}

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * 使用 Zod Schema 校验请求数据
 * @param schema Zod schema 定义
 * @param data 待校验数据
 * @param label 数据来源标签（如 'body'、'query'）
 * @returns 校验结果（成功返回 data，失败返回 400 错误体）
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  label: string = 'body'
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const issues = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  return {
    success: false,
    status: 400,
    body: {
      success: false,
      error: `Invalid ${label}`,
      details: issues,
    },
  };
}

// ============================================================
// Chat API
// ============================================================

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(8000),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4000),
  messages: z.array(ChatMessageSchema).max(100).default([]),
  testError: z.boolean().default(false),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ============================================================
// Sessions API
// ============================================================

export const SessionCreateSchema = z.object({
  name: z.string().max(200).optional(),
  template: z.string().max(500).optional(),
  model: z.string().max(100).optional(),
});

export type SessionCreateRequest = z.infer<typeof SessionCreateSchema>;

export const SessionUpdateSchema = z.object({
  name: z.string().max(200).optional(),
  messages: z.array(ChatMessageSchema).max(1000).optional(),
});

export type SessionUpdateRequest = z.infer<typeof SessionUpdateSchema>;

export const SessionIdSchema = z.object({
  id: z.string().min(1).max(100),
});

// ============================================================
// Insights API
// ============================================================

export const MetricDataSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().max(200).optional(),
  value: z.number().optional(),
  unit: z.string().max(20).optional(),
  trend: z.enum(['up', 'down', 'stable']).optional(),
  change: z.number().optional(),
});

export type MetricRequest = z.infer<typeof MetricDataSchema>;

export const InsightsQuerySchema = z.object({
  type: z.enum(['metrics', 'charts', 'generate']).optional(),
  metricId: z.string().min(1).max(100).optional(),
});

// ============================================================
// Suggestions API
// ============================================================

export const ReplyContextSchema = z.object({
  message: z.string().max(8000).optional(),
  sessionId: z.string().max(100).optional(),
  userRole: z.string().max(50).optional(),
});

export type SuggestionsRequest = z.infer<typeof ReplyContextSchema>;

// ============================================================
// Model Config API
// ============================================================

export const ModelConfigUpdateSchema = z.object({
  apiKey: z.string().max(200).optional(),
  apiType: z.enum(['openai', 'anthropic', 'local']).optional(),
  modelName: z.string().max(100).optional(),
  baseURL: z.string().url().max(500).optional(),
  endpoint: z.string().url().max(500).optional(),
  timeout: z.number().int().min(1000).max(300000).optional(),
  maxTokens: z.number().int().min(1).max(32768).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export type ModelConfigUpdateRequest = z.infer<typeof ModelConfigUpdateSchema>;
