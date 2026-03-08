---
@file: 19-YYC3-PortAISys-安全管理指南.md
@description: YYC3-PortAISys-安全管理指南 文档
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: general,documentation,zh-CN
@category: general
@language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ PortAISys - 安全管理指南


## 📋 目录

- [安全概述](#安全概述)
- [身份认证](#身份认证)
- [访问控制](#访问控制)
- [数据安全](#数据安全)
- [网络安全](#网络安全)
- [安全审计](#安全审计)
- [合规性](#合规性)

---

## 安全概述

### 安全架构

YYC³ 采用多层次的安全架构，确保系统、数据和用户的安全。

```
┌─────────────────────────────────────────────────────────────┐
│                  YYC³ 安全架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐                                       │
│  │  网络层安全  │───▶ 防火墙、DDoS防护、TLS加密          │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │  应用层安全  │───▶ 身份认证、访问控制、输入验证        │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │  数据层安全  │───▶ 数据加密、备份、审计日志            │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │  运维层安全  │───▶ 安全监控、漏洞扫描、应急响应        │
│  └──────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

### 安全原则

- **最小权限原则**: 用户只拥有完成工作所需的最小权限
- **纵深防御**: 多层次安全防护
- **零信任**: 不信任任何内部或外部网络
- **安全默认**: 默认配置安全
- **持续监控**: 持续监控和审计

---

## 身份认证

### JWT认证

#### 配置JWT

```typescript
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

class AuthService {
  private secret: string;
  private expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * 生成JWT令牌
   */
  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: 'yyc3-portaisys',
      audience: 'yyc3-users'
    });
  }

  /**
   * 验证JWT令牌
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * 刷新JWT令牌
   */
  refreshToken(token: string): string | null {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    // 生成新令牌
    return this.generateToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions
    });
  }
}
```

#### 使用JWT中间件

```typescript
import { Request, Response, NextFunction } from 'express';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'E004',
        message: '未授权：缺少认证令牌'
      }
    });
  }

  const token = authHeader.substring(7);
  const authService = new AuthService();
  const payload = authService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'E004',
        message: '未授权：无效或过期的令牌'
      }
    });
  }

  // 将用户信息附加到请求对象
  req.user = payload;
  next();
}

// 使用中间件
app.get('/api/v1/users/me', authMiddleware, async (req, res) => {
  const user = await getUserById(req.user.userId);
  res.json({ success: true, data: user });
});
```

### OAuth 2.0

#### 配置OAuth

```typescript
import { OAuth2Client } from 'google-auth-library';

class OAuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * 获取授权URL
   */
  getAuthUrl(): string {
    const authUrl = this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      prompt: 'consent'
    });

    return authUrl;
  }

  /**
   * 获取令牌
   */
  async getToken(code: string) {
    const { tokens } = await this.googleClient.getToken(code);
    return tokens;
  }

  /**
   * 验证令牌
   */
  async verifyToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    return payload;
  }
}
```

### 多因素认证

#### 实现MFA

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

class MFAService {
  /**
   * 生成MFA密钥
   */
  generateSecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `YYC³ (${userId})`,
      issuer: 'YYC³ PortAISys',
      length: 32
    });

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url
    };
  }

  /**
   * 验证MFA代码
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
  }

  /**
   * 生成QR码
   */
  async generateQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }
}
```

---

## 访问控制

### RBAC权限模型

#### 定义角色和权限

```typescript
enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

enum Permission {
  // 用户权限
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',

  // 工作流权限
  WORKFLOW_READ = 'workflow:read',
  WORKFLOW_WRITE = 'workflow:write',
  WORKFLOW_EXECUTE = 'workflow:execute',
  WORKFLOW_DELETE = 'workflow:delete',

  // AI权限
  AI_CHAT = 'ai:chat',
  AI_ANALYZE = 'ai:analyze',

  // 系统权限
  SYSTEM_READ = 'system:read',
  SYSTEM_WRITE = 'system:write',
  SYSTEM_ADMIN = 'system:admin'
}

// 角色权限映射
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.USER]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.WORKFLOW_READ,
    Permission.WORKFLOW_WRITE,
    Permission.WORKFLOW_EXECUTE,
    Permission.AI_CHAT,
    Permission.AI_ANALYZE,
    Permission.SYSTEM_READ
  ],
  [Role.GUEST]: [
    Permission.USER_READ,
    Permission.WORKFLOW_READ,
    Permission.AI_CHAT
  ]
};
```

#### 实现权限检查

```typescript
class RBACService {
  /**
   * 检查用户权限
   */
  hasPermission(userRole: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
  }

  /**
   * 检查多个权限
   */
  hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
    return permissions.every(permission =>
      this.hasPermission(userRole, permission)
    );
  }

  /**
   * 检查任一权限
   */
  hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
    return permissions.some(permission =>
      this.hasPermission(userRole, permission)
    );
  }
}

// 权限中间件
function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rbacService = new RBACService();

    if (!rbacService.hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'E005',
          message: '权限不足'
        }
      });
    }

    next();
  };
}

// 使用示例
app.delete('/api/v1/workflows/:id',
  authMiddleware,
  requirePermission(Permission.WORKFLOW_DELETE),
  async (req, res) => {
    await deleteWorkflow(req.params.id);
    res.json({ success: true });
  }
);
```

### API密钥管理

#### 生成API密钥

```typescript
import crypto from 'crypto';

class APIKeyService {
  /**
   * 生成API密钥
   */
  generateKey(): string {
    const prefix = 'yyc3_';
    const key = crypto.randomBytes(32).toString('hex');
    return `${prefix}${key}`;
  }

  /**
   * 哈希API密钥
   */
  hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * 验证API密钥
   */
  verifyKey(key: string, hashedKey: string): boolean {
    return this.hashKey(key) === hashedKey;
  }

  /**
   * 创建API密钥
   */
  async createAPIKey(userId: string, scopes: string[]) {
    const key = this.generateKey();
    const hashedKey = this.hashKey(key);

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        key: hashedKey,
        scopes,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天
      }
    });

    return {
      id: apiKey.id,
      key,                           // 只返回一次
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt
    };
  }
}
```

---

## 数据安全

### 数据加密

#### 对称加密

```typescript
import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  private ivLength = 16;

  constructor() {
    const key = process.env.ENCRYPTION_KEY || 'your-32-byte-encryption-key';
    this.key = Buffer.from(key, 'hex');
  }

  /**
   * 加密数据
   */
  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // 组合IV、加密数据和认证标签
    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex'), authTag]);
    return combined.toString('base64');
  }

  /**
   * 解密数据
   */
  decrypt(encryptedText: string): string {
    const combined = Buffer.from(encryptedText, 'base64');

    const iv = combined.slice(0, this.ivLength);
    const encrypted = combined.slice(this.ivLength, -16);
    const authTag = combined.slice(-16);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

#### 字段级加密

```typescript
import { Prisma } from '@prisma/client';

// Prisma中间件实现字段级加密
const encryptionService = new EncryptionService();

prisma.$use(async (params, next) => {
  // 加密敏感字段
  if (params.action === 'create' || params.action === 'update') {
    if (params.args.data) {
      const data = params.args.data;

      if (data.email) {
        data.email = encryptionService.encrypt(data.email);
      }
      if (data.phone) {
        data.phone = encryptionService.encrypt(data.phone);
      }
    }
  }

  // 解密敏感字段
  if (params.action === 'findUnique' || params.action === 'findFirst' || params.action === 'findMany') {
    const result = await next(params);

    if (result) {
      if (Array.isArray(result)) {
        return result.map(item => decryptFields(item));
      } else {
        return decryptFields(result);
      }
    }

    return result;
  }

  return next(params);
});

function decryptFields(data: any): any {
  if (data.email) {
    data.email = encryptionService.decrypt(data.email);
  }
  if (data.phone) {
    data.phone = encryptionService.decrypt(data.phone);
  }
  return data;
}
```

### 数据脱敏

```typescript
class DataMaskingService {
  /**
   * 脱敏邮箱
   */
  maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '***';
    return `${maskedUsername}@${domain}`;
  }

  /**
   * 脱敏手机号
   */
  maskPhone(phone: string): string {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  /**
   * 脱敏身份证号
   */
  maskIdCard(idCard: string): string {
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  }

  /**
   * 脱敏银行卡号
   */
  maskBankCard(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
  }
}
```

---

## 网络安全

### CORS配置

```typescript
import cors from 'cors';

const corsOptions = {
  origin: function (origin: string | undefined, callback: any) {
    const allowedOrigins = [
      'https://your-domain.com',
      'https://www.your-domain.com'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的CORS源'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400  // 24小时
};

app.use(cors(corsOptions));
```

### 安全头配置

```typescript
import helmet from 'helmet';

app.use(helmet({
  // X-Frame-Options
  frameguard: {
    action: 'sameorigin'
  },

  // X-Content-Type-Options
  noSniff: true,

  // X-XSS-Protection
  xssFilter: true,

  // Strict-Transport-Security
  hsts: {
    maxAge: 31536000,  // 1年
    includeSubDomains: true,
    preload: true
  },

  // Content-Security-Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https:'],
      frameAncestors: ["'self'"]
    }
  },

  // Referrer-Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // Permissions-Policy
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"]
    }
  }
}));
```

### 速率限制

```typescript
import rateLimit from 'express-rate-limit';

// 通用速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15分钟
  max: 100,                    // 最多100个请求
  message: {
    success: false,
    error: {
      code: 'E007',
      message: '请求过多，请稍后再试'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 跳过健康检查端点
    return req.path === '/health';
  }
});

app.use('/api/', limiter);

// 严格速率限制（登录等敏感操作）
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'E007',
      message: '登录尝试过多，请15分钟后再试'
    }
  }
});

app.post('/api/v1/auth/login', strictLimiter);
```

---

## 安全审计

### 审计日志

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  details?: any;
}

class AuditService {
  /**
   * 记录审计日志
   */
  async log(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    await prisma.auditLog.create({
      data: {
        ...entry,
        timestamp: new Date()
      }
    });

    // 同时发送到SIEM系统
    await this.sendToSIEM(entry);
  }

  /**
   * 查询审计日志
   */
  async query(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: {
        ...filters,
        timestamp: {
          ...(filters.startDate && { gte: filters.startDate }),
          ...(filters.endDate && { lte: filters.endDate })
        }
      },
      orderBy: { timestamp: 'desc' }
    });
  }

  /**
   * 发送到SIEM系统
   */
  private async sendToSIEM(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    // 实现SIEM集成
  }
}

// 使用示例
const auditService = new AuditService();

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticate(email, password);

    await auditService.log({
      userId: user.id,
      action: 'login',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      success: true
    });

    res.json({ success: true, data: user });
  } catch (error) {
    await auditService.log({
      userId: 'unknown',
      action: 'login',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      success: false,
      details: { error: error.message }
    });

    res.status(401).json({
      success: false,
      error: {
        code: 'E004',
        message: '认证失败'
      }
    });
  }
});
```

---

## 合规性

### GDPR合规

```typescript
class GDPRService {
  /**
   * 数据导出（用户数据可携带权）
   */
  async exportUserData(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        workflows: true,
        auditLogs: true
      }
    });

    return user;
  }

  /**
   * 数据删除（被遗忘权）
   */
  async deleteUserData(userId: string): Promise<void> {
    await prisma.$transaction([
      // 删除用户数据
      prisma.auditLog.deleteMany({ where: { userId } }),
      prisma.workflow.deleteMany({ where: { userId } }),
      prisma.order.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);
  }

  /**
   * 数据处理同意
   */
  async recordConsent(userId: string, consentType: string): Promise<void> {
    await prisma.consent.create({
      data: {
        userId,
        consentType,
        grantedAt: new Date(),
        ipAddress: '0.0.0.0'  // 从请求中获取
      }
    });
  }
}
```

### SOC 2合规

```typescript
class SOC2Service {
  /**
   * 访问控制审计
   */
  async auditAccessControls(): Promise<any> {
    const users = await prisma.user.findMany();
    const roles = await prisma.role.findMany();
    const permissions = await prisma.permission.findMany();

    return {
      users: users.length,
      roles: roles.length,
      permissions: permissions.length,
      lastAudit: new Date()
    };
  }

  /**
   * 变更管理
   */
  async recordChange(change: {
    type: string;
    resource: string;
    resourceId: string;
    before?: any;
    after?: any;
    changedBy: string;
  }): Promise<void> {
    await prisma.changeLog.create({
      data: {
        ...change,
        timestamp: new Date()
      }
    });
  }
}
```

---

## 下一步

- [监控和告警系统](./13-监控和告警系统.md) - 监控配置
- [故障排除指南](./24-故障排除指南.md) - 故障排除
- [最佳实践](./25-最佳实践.md) - 更多最佳实践

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
