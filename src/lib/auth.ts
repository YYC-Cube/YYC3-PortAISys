/**
 * @file lib/auth.ts
 * @description API 认证中间件 — HMAC-SHA256 Bearer Token 校验
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,security,api
 */

import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 认证跳过标志：test/development 环境跳过认证
 * 生产环境（production）强制校验
 */
const AUTH_DISABLED =
  process.env.NODE_ENV === 'test' ||
  process.env.NODE_ENV === 'development';

/**
 * HMAC 签名密钥（从 JWT_SECRET 读取，不可硬编码）
 */
const SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || '';

/**
 * 生成 API 令牌（HMAC-SHA256）
 * 用于客户端认证，服务端签发后客户端在 Authorization 头携带
 * @param payload 签名载荷（如用户 ID）
 * @returns 十六进制签名字符串
 */
export function generateToken(payload: string = 'api-access'): string {
  if (!SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

/**
 * 验证 API 令牌（时序安全比较，防止侧信道攻击）
 * @param token 客户端提供的令牌
 * @returns 验证是否通过
 */
export function verifyToken(token: string): boolean {
  if (!SECRET || !token) return false;

  const expected = generateToken('api-access');

  if (token.length !== expected.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * 认证结果
 */
export interface AuthResult {
  authenticated: boolean;
  error?: string;
}

/**
 * 检查请求是否通过认证
 * @param req Next.js API 请求对象
 * @returns 认证结果
 */
export function checkAuth(req: NextApiRequest): AuthResult {
  if (AUTH_DISABLED) {
    return { authenticated: true };
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Authentication required. Provide Authorization: Bearer <token>',
    };
  }

  const token = authHeader.substring(7);

  if (!verifyToken(token)) {
    return {
      authenticated: false,
      error: 'Invalid or expired token',
    };
  }

  return { authenticated: true };
}

/**
 * 高阶函数：为 API handler 包装认证中间件
 * @param handler 原始 API handler
 * @returns 带认证检查的 handler
 */
export function withAuth<T extends NextApiRequest>(
  handler: (req: T, res: NextApiResponse) => Promise<void> | void
): (req: T, res: NextApiResponse) => Promise<void> | void {
  return async (req: T, res: NextApiResponse) => {
    const authResult = checkAuth(req);

    if (!authResult.authenticated) {
      res.status(401).json({
        success: false,
        error: authResult.error,
      });
      return;
    }

    return handler(req, res);
  };
}
