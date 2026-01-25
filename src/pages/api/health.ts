/**
 * @file 健康检查API接口
 * @description 监控系统状态
 * @module api/health
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIModelAdapter } from '../../../core/adapters/OpenAIModelAdapter';
import { AutonomousAIConfig } from '../../../core/autonomous-ai-widget/types';

/**
 * 健康检查API接口
 * @route GET /api/health
 * @access 公开
 * @param req 请求对象
 * @param res 响应对象
 * @returns {Promise<void>}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // 检查系统状态
    const systemStatus = {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development'
    };

    // 检查模型适配器状态
    let modelStatus = {
      status: 'ok',
      message: 'Model adapter initialized'
    };

    try {
      const modelConfig: AutonomousAIConfig = {
        apiKey: process.env.OPENAI_API_KEY || '',
        apiType: 'openai',
        modelName: 'gpt-4',
        baseURL: 'https://api.openai.com',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        timeout: 30000,
        maxTokens: 4096,
        temperature: 0.7
      };

      const modelAdapter = new OpenAIModelAdapter(modelConfig);
      const adapterStatus = modelAdapter.getStatus();
      
      modelStatus = {
        status: adapterStatus === 'idle' ? 'ok' : 'warning',
        message: `Model adapter status: ${adapterStatus}`,
        config: {
          apiType: modelConfig.apiType,
          modelName: modelConfig.modelName,
          hasApiKey: !!modelConfig.apiKey
        }
      };
    } catch (error) {
      modelStatus = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to initialize model adapter'
      };
    }

    // 检查数据库连接（如果有）
    const dbStatus = {
      status: 'ok',
      message: 'Database connection not implemented'
    };

    // 综合健康状态
    const overallStatus = systemStatus.status === 'ok' && modelStatus.status === 'ok' ? 'ok' : 'warning';

    res.status(200).json({
      success: true,
      data: {
        status: overallStatus,
        timestamp: systemStatus.timestamp,
        components: {
          system: systemStatus,
          model: modelStatus,
          database: dbStatus
        }
      }
    });
  } catch (error) {
    console.error('Health check API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
