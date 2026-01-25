/**
 * @file 模型配置API接口
 * @description 管理模型配置
 * @module api/model-config
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { AutonomousAIConfig } from '../../../core/autonomous-ai-widget/types';

/**
 * 模型配置API接口
 * @route GET /api/model-config
 * @route POST /api/model-config
 * @access 公开
 * @param req 请求对象
 * @param res 响应对象
 * @returns {Promise<void>}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // 获取当前模型配置
      const currentConfig: AutonomousAIConfig = {
        apiKey: process.env.OPENAI_API_KEY || '',
        apiType: process.env.API_TYPE || 'openai',
        modelName: process.env.MODEL_NAME || 'gpt-4',
        baseURL: process.env.BASE_URL || 'https://api.openai.com',
        endpoint: process.env.ENDPOINT || 'https://api.openai.com/v1/chat/completions',
        timeout: parseInt(process.env.TIMEOUT || '30000'),
        maxTokens: parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7')
      };

      res.status(200).json({
        success: true,
        data: currentConfig
      });
    } else if (req.method === 'POST') {
      // 更新模型配置
      const { apiKey, apiType, modelName, baseURL, endpoint, timeout, maxTokens, temperature } = req.body;

      // 这里可以实现配置持久化逻辑，例如存储到数据库或配置文件
      // 目前只返回更新后的配置
      const updatedConfig: AutonomousAIConfig = {
        apiKey: apiKey || process.env.OPENAI_API_KEY || '',
        apiType: apiType || process.env.API_TYPE || 'openai',
        modelName: modelName || process.env.MODEL_NAME || 'gpt-4',
        baseURL: baseURL || process.env.BASE_URL || 'https://api.openai.com',
        endpoint: endpoint || process.env.ENDPOINT || 'https://api.openai.com/v1/chat/completions',
        timeout: timeout || parseInt(process.env.TIMEOUT || '30000'),
        maxTokens: maxTokens || parseInt(process.env.MAX_TOKENS || '4096'),
        temperature: temperature || parseFloat(process.env.TEMPERATURE || '0.7')
      };

      res.status(200).json({
        success: true,
        data: updatedConfig
      });
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Model config API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
