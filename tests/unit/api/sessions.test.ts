/**
 * @file 会话管理API测试
 * @description 测试会话管理API接口的功能
 * @module tests/unit/api/sessions
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../src/pages/api/sessions';

// 模拟环境变量
vi.mock('process', () => ({
  env: {
    NODE_ENV: 'test'
  }
}));

describe('Sessions API', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let status: number;
  let json: any;

  beforeEach(() => {
    status = 200;
    json = {};
    
    req = {
      method: 'GET',
      query: {}
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

  describe('GET /api/sessions', () => {
    it('应该成功返回所有会话列表', async () => {
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('当会话存在时应该返回会话详情', async () => {
      // 首先创建一个会话
      req.method = 'POST';
      req.body = {
        name: '测试会话'
      };
      
      await handler(req as NextApiRequest, res as NextApiResponse);
      const createdSession = json.data;
      
      // 然后获取该会话
      req.method = 'GET';
      req.query = { id: createdSession.id };
      
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe(createdSession.id);
    });

    it('当会话不存在时应该返回404错误', async () => {
      // 准备
      req.method = 'GET';
      req.query = { id: 'non-existent-id' };
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Session not found');
    });
  });

  describe('POST /api/sessions', () => {
    it('应该成功创建新会话', async () => {
      // 准备
      req.method = 'POST';
      req.body = {
        name: '测试会话',
        model: 'gpt-4'
      };
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.name).toBe('测试会话');
      expect(json.data.model).toBe('gpt-4');
      expect(json.data.messages).toEqual([]);
    });

    it('当未提供名称时应该使用默认名称', async () => {
      // 准备
      req.method = 'POST';
      req.body = {};
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.name).toContain('会话');
    });
  });

  describe('PUT /api/sessions/:id', () => {
    it('应该成功更新会话', async () => {
      // 首先创建一个会话
      req.method = 'POST';
      req.body = {
        name: '原始会话'
      };
      
      await handler(req as NextApiRequest, res as NextApiResponse);
      const createdSession = json.data;
      
      // 然后更新该会话
      req.method = 'PUT';
      req.query = { id: createdSession.id };
      req.body = {
        name: '更新后的会话'
      };
      
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.name).toBe('更新后的会话');
    });

    it('当会话不存在时应该返回404错误', async () => {
      // 准备
      req.method = 'PUT';
      req.query = { id: 'non-existent-id' };
      req.body = {
        name: '更新后的会话'
      };
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Session not found');
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('应该成功删除会话', async () => {
      // 首先创建一个会话
      req.method = 'POST';
      req.body = {
        name: '测试会话'
      };
      
      await handler(req as NextApiRequest, res as NextApiResponse);
      const createdSession = json.data;
      
      // 然后删除该会话
      req.method = 'DELETE';
      req.query = { id: createdSession.id };
      
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.message).toBe('Session deleted successfully');
    });

    it('当会话不存在时应该返回404错误', async () => {
      // 准备
      req.method = 'DELETE';
      req.query = { id: 'non-existent-id' };
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Session not found');
    });
  });

  describe('不支持的HTTP方法', () => {
    it('当使用PATCH方法时应该返回405错误', async () => {
      // 准备
      req.method = 'PATCH';
      
      // 执行
      await handler(req as NextApiRequest, res as NextApiResponse);
      
      // 断言
      expect(status).toBe(405);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Method not allowed');
    });
  });
});
