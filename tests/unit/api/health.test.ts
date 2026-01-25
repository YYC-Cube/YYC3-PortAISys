/**
 * @file 健康检查API测试
 * @description 测试健康检查API接口的功能
 * @module tests/unit/api/health
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../src/pages/api/health';
import { OpenAIModelAdapter } from '../../../../core/adapters/OpenAIModelAdapter';

// 模拟OpenAIModelAdapter
vi.mock('../../../../core/adapters/OpenAIModelAdapter', () => ({
  OpenAIModelAdapter: vi.fn().mockImplementation(() => ({
    getStatus: vi.fn().mockReturnValue('idle')
  }))
}));

// 模拟环境变量
vi.mock('process', () => ({
  env: {
    OPENAI_API_KEY: 'test-api-key',
    NODE_ENV: 'test'
  },
  uptime: vi.fn().mockReturnValue(1000)
}));

// 模拟内存使用情况
vi.mock('process', async (importOriginal) => {
  const original = await importOriginal<typeof import('process')>();
  return {
    ...original,
    env: {
      OPENAI_API_KEY: 'test-api-key',
      NODE_ENV: 'test'
    },
    uptime: vi.fn().mockReturnValue(1000),
    memoryUsage: vi.fn().mockReturnValue({
      rss: 1000000000,
      heapTotal: 500000000,
      heapUsed: 300000000,
      external: 100000000,
      arrayBuffers: 50000000
    })
  };
});

describe('Health API', () => {
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

  describe('GET /api/health', () => {
    it('应该成功返回健康检查结果', async () => {
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.status).toBe('ok');
      expect(json.data.timestamp).toBeDefined();
      expect(json.data.components).toBeDefined();
      expect(json.data.components.system).toBeDefined();
      expect(json.data.components.model).toBeDefined();
      expect(json.data.components.database).toBeDefined();
    });

    it('应该包含系统状态信息', async () => {
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(json.data.components.system.status).toBe('ok');
      expect(json.data.components.system.uptime).toBeDefined();
      expect(json.data.components.system.memory).toBeDefined();
      expect(json.data.components.system.env).toBe('test');
    });

    it('应该包含模型适配器状态信息', async () => {
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(json.data.components.model.status).toBe('ok');
      expect(json.data.components.model.message).toContain('Model adapter');
      expect(json.data.components.model.config).toBeDefined();
    });

    it('应该包含数据库状态信息', async () => {
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(json.data.components.database.status).toBe('ok');
      expect(json.data.components.database.message).toBe('Database connection not implemented');
    });
  });

  describe('不支持的HTTP方法', () => {
    it('当使用POST方法时应该返回405错误', async () => {
      // 准备
      req.method = 'POST';
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(405);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Method not allowed');
    });

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
