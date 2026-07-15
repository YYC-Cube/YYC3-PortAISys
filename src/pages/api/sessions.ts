/**
 * @file pages/api/sessions.ts
 * @description Sessions 模块 — 会话管理（含认证 + Zod 输入校验）
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
import { ChatSession } from '../../../core/ui/types';
import { withAuth } from '../../lib/auth';
import { SessionCreateSchema, SessionUpdateSchema, validate } from './schemas';
import crypto from 'crypto';

// 内存存储会话数据（实际应用中应该使用数据库）
let sessions: Map<string, ChatSession> = new Map();

/**
 * 生成唯一ID（使用 crypto 防止碰撞）
 * @returns {string} 唯一ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 会话管理API接口
 * @route GET /api/sessions
 * @route POST /api/sessions
 * @route GET /api/sessions/:id
 * @route PUT /api/sessions/:id
 * @route DELETE /api/sessions/:id
 * @access 需认证（Bearer Token）
 * @param req 请求对象
 * @param res 响应对象
 * @returns {Promise<void>}
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    switch (req.method) {
      case 'GET':
        if (id) {
          // 获取单个会话
          const session = sessions.get(id as string);
          if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
          }
          res.status(200).json({ success: true, data: session });
        } else {
          // 获取所有会话
          const sessionList = Array.from(sessions.values());
          res.status(200).json({ success: true, data: sessionList });
        }
        break;

      case 'POST': {
        // Zod 校验创建请求
        const validation = validate(SessionCreateSchema, req.body);
        if (!validation.success) {
          return res.status(validation.status).json(validation.body);
        }

        const { name, template, model } = validation.data;
        const sessionId = generateId();
        const newSession: ChatSession = {
          id: sessionId,
          name: name || `会话 ${new Date().toLocaleString('zh-CN')}`,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          template: template as any,
          model
        };
        sessions.set(sessionId, newSession);
        res.status(201).json({ success: true, data: newSession });
        break;
      }

      case 'PUT': {
        // Zod 校验更新请求
        const validation = validate(SessionUpdateSchema, req.body);
        if (!validation.success) {
          return res.status(validation.status).json(validation.body);
        }

        if (!id) {
          return res.status(400).json({ success: false, error: 'Session ID is required' });
        }
        const session = sessions.get(id as string);
        if (!session) {
          return res.status(404).json({ success: false, error: 'Session not found' });
        }
        const { name: updatedName, messages: updatedMessages } = validation.data;
        if (updatedName) {
          session.name = updatedName;
        }
        if (updatedMessages) {
          session.messages = updatedMessages as any[];
        }
        session.updatedAt = Date.now();
        sessions.set(id as string, session);
        res.status(200).json({ success: true, data: session });
        break;
      }

      case 'DELETE':
        // 删除会话
        if (!id) {
          return res.status(400).json({ success: false, error: 'Session ID is required' });
        }
        const deleted = sessions.delete(id as string);
        if (!deleted) {
          return res.status(404).json({ success: false, error: 'Session not found' });
        }
        res.status(200).json({ success: true, data: { message: 'Session deleted successfully' } });
        break;

      default:
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
