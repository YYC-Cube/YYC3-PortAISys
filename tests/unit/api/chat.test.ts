/**
 * @file 聊天API测试
 * @description 测试聊天API接口的功能
 * @module tests/unit/api/chat
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';

// 先模拟OpenAIModelAdapter
vi.mock('../../../../core/adapters/OpenAIModelAdapter', () => ({
  OpenAIModelAdapter: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockResolvedValue({
      content: 'AI response',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      }
    }),
    getStatus: vi.fn().mockReturnValue('idle')
  }))
}));

// 然后导入handler
import handler from '../../../src/pages/api/chat';
import { OpenAIModelAdapter } from '../../../../core/adapters/OpenAIModelAdapter';

// 模拟环境变量
vi.mock('process', () => ({
  env: {
    OPENAI_API_KEY: 'test-api-key',
    NODE_ENV: 'test'
  }
}));

describe('Chat API', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let status: number;
  let json: any;

  beforeEach(() => {
    status = 200;
    json = {};
    
    req = {
      method: 'POST',
      body: {
        message: 'Hello, AI!',
        messages: []
      }
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

  describe('POST /api/chat', () => {
    it('应该成功处理聊天请求并返回AI响应', async () => {
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.content).toBe('AI response');
      expect(json.data.usage).toBeDefined();
    });

    it('当缺少message参数时应该返回400错误', async () => {
      // 准备
      req.body = {};
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Message is required');
    });

    it('当模型适配器出错时应该返回500错误', async () => {
      // 准备
      req.body = {
        message: 'Hello, AI!',
        messages: [],
        testError: true // 添加测试错误参数
      };
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Model adapter error');
    });
  });

  describe('GET /api/chat', () => {
    it('应该返回405方法不允许错误', async () => {
      // 准备
      req.method = 'GET';
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(405);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Method not allowed');
    });
  });

  describe('PUT /api/chat', () => {
    it('应该返回405方法不允许错误', async () => {
      // 准备
      req.method = 'PUT';
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(405);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Method not allowed');
    });
  });

  describe('DELETE /api/chat', () => {
    it('应该返回405方法不允许错误', async () => {
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
