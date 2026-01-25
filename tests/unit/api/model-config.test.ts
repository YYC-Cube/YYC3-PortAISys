/**
 * @file 模型配置API测试
 * @description 测试模型配置API接口的功能
 * @module tests/unit/api/model-config
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../src/pages/api/model-config';

// 模拟环境变量
vi.mock('process', () => ({
  env: {
    OPENAI_API_KEY: 'test-api-key',
    API_TYPE: 'openai',
    MODEL_NAME: 'gpt-4',
    BASE_URL: 'https://api.openai.com',
    ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    TIMEOUT: '30000',
    MAX_TOKENS: '4096',
    TEMPERATURE: '0.7',
    NODE_ENV: 'test'
  }
}));

describe('Model Config API', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let status: number;
  let json: any;

  beforeEach(() => {
    status = 200;
    json = {};
    
    req = {
      method: 'GET'
    };
    
    res = {
      status: vi.fn((code) => {
        status = code;
        return res;
      }),
      json: vi.fn((data) => {
        json = data;
        return res;
      })
    };
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/model-config', () => {
    it('应该成功返回当前模型配置', async () => {
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.apiType).toBe('openai');
      expect(json.data.modelName).toBe('gpt-4');
      expect(json.data.hasApiKey).toBeUndefined(); // 应该从环境变量中获取
    });
  });

  describe('POST /api/model-config', () => {
    it('应该成功更新模型配置并返回更新后的配置', async () => {
      // 准备
      req.method = 'POST';
      req.body = {
        apiKey: 'new-api-key',
        modelName: 'gpt-4o',
        temperature: 0.8
      };
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.apiKey).toBe('new-api-key');
      expect(json.data.modelName).toBe('gpt-4o');
      expect(json.data.temperature).toBe(0.8);
    });

    it('当只提供部分配置时应该使用默认值', async () => {
      // 准备
      req.method = 'POST';
      req.body = {
        modelName: 'gpt-4o'
      };
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.modelName).toBe('gpt-4o');
      expect(json.data.apiType).toBe('openai'); // 应该使用默认值
    });
  });

  describe('不支持的HTTP方法', () => {
    it('当使用PUT方法时应该返回405错误', async () => {
      // 准备
      req.method = 'PUT';
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(405);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Method not allowed');
    });

    it('当使用DELETE方法时应该返回405错误', async () => {
      // 准备
      req.method = 'DELETE';
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(405);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Method not allowed');
    });
  });
});
