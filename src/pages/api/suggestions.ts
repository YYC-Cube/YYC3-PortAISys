/**
 * @file pages/api/suggestions.ts
 * @description Suggestions 模块 — 建议回复（含认证 + Zod 输入校验）
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.1.0
 * @created 2026-03-07
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,api
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ReplyContext, SuggestedReply } from '../../../core/ui/types';
import { withAuth } from '../../lib/auth';
import { ReplyContextSchema, validate } from './schemas';

/**
 * 基于上下文生成建议回复
 * @param context 回复上下文
 * @returns 建议回复列表
 */
function generateSuggestions(context: ReplyContext): SuggestedReply[] {
  const suggestions: SuggestedReply[] = [];

  // 基于消息内容的建议
  if (context.lastMessage && context.lastMessage.toLowerCase().includes('什么')) {
    suggestions.push({
      text: '您想了解的具体是什么呢？',
      confidence: 0.9,
      category: 'clarification',
    });
  }

  if (context.lastMessage && context.lastMessage.toLowerCase().includes('如何')) {
    suggestions.push({
      text: '让我为您详细说明一下操作步骤',
      confidence: 0.85,
      category: 'instruction',
    });
  }

  if (context.lastMessage && context.lastMessage.toLowerCase().includes('谢谢')) {
    suggestions.push({
      text: '不客气，很高兴能帮到您',
      confidence: 0.95,
      category: 'gratitude',
    });
  }

  if (context.lastMessage && context.lastMessage.toLowerCase().includes('问题')) {
    suggestions.push({
      text: '请详细描述一下您遇到的问题，我会尽力帮助您',
      confidence: 0.8,
      category: 'support',
    });
  }

  // 通用建议
  if (suggestions.length < 3) {
    const generalSuggestions: SuggestedReply[] = [
      {
        text: '请详细说明一下',
        confidence: 0.9,
        category: 'clarification',
      },
      {
        text: '这很有帮助，谢谢',
        confidence: 0.85,
        category: 'gratitude',
      },
      {
        text: '能否提供更多例子',
        confidence: 0.8,
        category: 'request',
      },
      {
        text: '我理解您的意思',
        confidence: 0.85,
        category: 'acknowledgment',
      },
      {
        text: '让我思考一下',
        confidence: 0.75,
        category: 'thinking',
      },
    ];

    // 随机选择一些通用建议，确保不重复
    const availableSuggestions = generalSuggestions.filter(
      general => !suggestions.some(s => s.text === general.text)
    );

    while (suggestions.length < 3 && availableSuggestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSuggestions.length);
      suggestions.push(availableSuggestions[randomIndex]);
      availableSuggestions.splice(randomIndex, 1);
    }
  }

  return suggestions;
}

/**
 * 建议回复API接口
 * @route POST /api/suggestions
 * @access 需认证（Bearer Token）
 * @param req 请求对象
 * @param res 响应对象
 * @returns {Promise<void>}
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Zod 输入校验
    const validation = validate(ReplyContextSchema, req.body);
    if (!validation.success) {
      return res.status(validation.status).json(validation.body);
    }

    const context: ReplyContext = validation.data;

    // 生成建议回复
    const suggestions = generateSuggestions(context);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

export default withAuth(handler);
