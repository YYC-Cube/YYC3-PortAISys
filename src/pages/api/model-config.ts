/**
 * @file pages/api/model-config.ts
 * @description Model Config 模块 — 模型配置管理（含认证 + Zod 输入校验）
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
import { AutonomousAIConfig } from '../../../core/autonomous-ai-widget/types';
import { withAuth } from '../../lib/auth';
import { ModelConfigUpdateSchema, validate } from './schemas';

/**
 * 模型配置API接口
 * @route GET /api/model-config
 * @route POST /api/model-config
 * @access 需认证（Bearer Token）
 * @param req 请求对象
 * @param res 响应对象
 * @returns {Promise<void>}
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // 获取当前模型配置
      const currentConfig: AutonomousAIConfig = {
        apiKey: process.env.OPENAI_API_KEY || '',
        apiType: (process.env.API_TYPE || 'openai') as AutonomousAIConfig['apiType'],
        modelName: process.env.MODEL_NAME || 'gpt-4',
        baseURL: process.env.BASE_URL || 'https://api.openai.com',
        endpoint: process.env.ENDPOINT || 'https://api.openai.com/v1/chat/completions',
        timeout: parseInt(process.env.TIMEOUT || '30000'),
        maxTokens: parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        enableLearning: false,
        enableMemory: false,
        enableToolUse: false,
        enableContextAwareness: false,
        position: 'bottom-right',
        theme: 'auto',
        language: 'zh-CN',
      };

      res.status(200).json({
        success: true,
        data: currentConfig
      });
    } else if (req.method === 'POST') {
      // Zod 校验配置更新请求
      const validation = validate(ModelConfigUpdateSchema, req.body);
      if (!validation.success) {
        return res.status(validation.status).json(validation.body);
      }

      const body = validation.data;

      // 这里可以实现配置持久化逻辑，例如存储到数据库或配置文件
      // 目前只返回更新后的配置
      const updatedConfig: AutonomousAIConfig = {
        apiKey: body.apiKey || process.env.OPENAI_API_KEY || '',
        apiType: (body.apiType || process.env.API_TYPE || 'openai') as AutonomousAIConfig['apiType'],
        modelName: body.modelName || process.env.MODEL_NAME || 'gpt-4',
        baseURL: body.baseURL || process.env.BASE_URL || 'https://api.openai.com',
        endpoint: body.endpoint || process.env.ENDPOINT || 'https://api.openai.com/v1/chat/completions',
        timeout: body.timeout || parseInt(process.env.TIMEOUT || '30000'),
        maxTokens: body.maxTokens || parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: body.temperature || parseFloat(process.env.TEMPERATURE || '0.7'),
        enableLearning: false,
        enableMemory: false,
        enableToolUse: false,
        enableContextAwareness: false,
        position: 'bottom-right',
        theme: 'auto',
        language: 'zh-CN',
      };

      res.status(200).json({
        success: true,
        data: updatedConfig
      });
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export default withAuth(handler);
