/**
 * @file 会话管理API接口
 * @description 管理聊天会话
 * @module api/sessions
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ChatSession } from '../../../core/ui/types';

// 内存存储会话数据（实际应用中应该使用数据库）
let sessions: Map<string, ChatSession> = new Map();

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * 会话管理API接口
 * @route GET /api/sessions
 * @route POST /api/sessions
 * @route GET /api/sessions/:id
 * @route PUT /api/sessions/:id
 * @route DELETE /api/sessions/:id
 * @access 公开
 * @param req 请求对象
 * @param res 响应对象
 * @returns {Promise<void>}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

      case 'POST':
        // 创建新会话
        const { name, template, model } = req.body;
        const sessionId = generateId();
        const newSession: ChatSession = {
          id: sessionId,
          name: name || `会话 ${new Date().toLocaleString('zh-CN')}`,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          template,
          model
        };
        sessions.set(sessionId, newSession);
        res.status(201).json({ success: true, data: newSession });
        break;

      case 'PUT':
        // 更新会话
        if (!id) {
          return res.status(400).json({ success: false, error: 'Session ID is required' });
        }
        const session = sessions.get(id as string);
        if (!session) {
          return res.status(404).json({ success: false, error: 'Session not found' });
        }
        const { name: updatedName, messages: updatedMessages } = req.body;
        if (updatedName) {
          session.name = updatedName;
        }
        if (updatedMessages) {
          session.messages = updatedMessages;
        }
        session.updatedAt = Date.now();
        sessions.set(id as string, session);
        res.status(200).json({ success: true, data: session });
        break;

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
    console.error('Sessions API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
