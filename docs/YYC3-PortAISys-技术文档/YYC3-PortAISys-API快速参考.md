---
@file: YYC3-PortAISys-API快速参考.md
@description: YYC3-PortAISys-API快速参考 文档
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: api,restful,critical,zh-CN
@category: technical
@language: zh-CN
@base_url: https://api.yyc3.com/v1
@authentication: oauth2
@audience: developers
@complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ SecurityCenter API 快速参考

### 用户注册

```typescript
const result = await securityCenter.registerUser({
  username: 'john_doe',
  password: 'SecurePass123!',
  email: 'john@example.com'
});
// 返回: { success: true, userId: 'user_john_doe' }
```

### 用户登录

```typescript
const result = await securityCenter.authenticate({
  username: 'john_doe',
  password: 'SecurePass123!'
});
// 如果启用 MFA
if (result.requiresMFA) {
  // 返回: { success: true, requiresMFA: true, mfaToken: '...' }
  // 用户需要输入 6 位验证码
}
```

### MFA 验证

```typescript
const result = await securityCenter.verifyMFA({
  mfaToken: '...',
  code: '123456'
});
// 返回: { success: true, token: '...' }
```

---

## 🔑 会话 (Sessions)

### 创建会话

```typescript
const token = await securityCenter.createSession({
  userId: 'user-123',
  permissions: ['read', 'write'],
  expiresIn: 3600000,           // 1 小时
  maxConcurrentSessions: 5      // 最多 5 个并发会话
});
// 返回: '...' (token string)
```

### 验证会话

```typescript
const validation = await securityCenter.validateSession(token);
// 返回: {
//   valid: true,
//   userId: 'user-123',
//   permissions: ['read', 'write']
// }
```

### 撤销会话

```typescript
const result = await securityCenter.revokeSession(token);
// 返回: { success: true }
```

### 获取活跃会话数

```typescript
const count = await securityCenter.getActiveSessions('user-123');
// 返回: 3 (当前用户有 3 个活跃会话)
```

---

## 🛡️ 输入清理 (Input Sanitization)

### SQL 注入防护

```typescript
const input = "'; DROP TABLE users; --";
const safe = securityCenter.sanitizeInput(input, 'sql');
// 返回: "  TABLE users" (所有 SQL 字符被移除)
```

### XSS 防护

```typescript
const input = '<script>alert("XSS")</script>';
const safe = securityCenter.sanitizeInput(input, 'html');
// 返回: 'alert("XSS")' (脚本标签被移除)
```

### 命令注入防护

```typescript
const input = 'cat /etc/passwd; rm -rf /';
const safe = securityCenter.sanitizeInput(input, 'command');
// 返回: 'cat etcpasswd rm -rf' (Shell 特殊字符被移除)
```

### 路径遍历防护

```typescript
const result = securityCenter.validateFilePath('../../../etc/passwd');
// 返回: { safe: false, error: 'Path traversal detected' }

const result = securityCenter.validateFilePath('/app/data/file.txt');
// 返回: { safe: true }
```

---

## 🔒 密码安全 (Password Security)

### 密码复杂度检查

```typescript
const result = securityCenter.validatePasswordComplexity('weak');
// 返回: {
//   valid: false,
//   errors: [
//     'Password must be at least 8 characters',
//     'Password must contain uppercase letter',
//     'Password must contain number',
//     'Password must contain special character'
//   ]
// }
```

### 密码哈希

```typescript
const hash = await securityCenter.hashPassword('SecurePass123!');
// 返回: '....' (长度 > 50 的哈希字符串)
```

### 密码验证

```typescript
const isValid = await securityCenter.verifyPassword('SecurePass123!', hash);
// 返回: true

const isInvalid = await securityCenter.verifyPassword('wrong', hash);
// 返回: false
```

---

## 🔐 数据加密 (Encryption)

### 加密数据

```typescript
const encrypted = await securityCenter.encrypt('sensitive-data', {
  algorithm: 'AES-256-GCM'
});
// 返回: '....' (加密后的数据)
```

### 解密数据

```typescript
const decrypted = await securityCenter.decrypt(encrypted);
// 返回: 'sensitive-data'
```

---

## ⏱️ 速率限制 (Rate Limiting)

### 获取速率限制器

```typescript
const limiter = securityCenter.getRateLimiter();
// 配置: 50 请求 / 60 秒 / 用户
```

### 检查请求限制

```typescript
const result = await limiter.checkLimit('user-123');
// 返回: { allowed: true }
// 或
// 返回: { allowed: false } (当超过限制)
```

### 应用中的使用

```typescript
const limiter = securityCenter.getRateLimiter();

app.use(async (req, res, next) => {
  const result = await limiter.checkLimit(req.user.id);
  
  if (!result.allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  next();
});
```

---

## 🔐 权限控制 (Access Control)

### 检查用户权限

```typescript
const user = {
  id: 'user-123',
  permissions: ['read', 'write']
};

const hasRead = securityCenter.hasPermission(user, 'read');
// 返回: true

const hasDelete = securityCenter.hasPermission(user, 'delete');
// 返回: false
```

### 获取角色权限

```typescript
const adminPerms = securityCenter.getRolePermissions('admin');
// 返回: ['read', 'write', 'delete', 'manage']

const userPerms = securityCenter.getRolePermissions('user');
// 返回: ['read', 'write']

const guestPerms = securityCenter.getRolePermissions('guest');
// 返回: ['read']
```

### 检查资源访问权限

```typescript
const access = await securityCenter.checkResourceAccess({
  userId: 'user-123',
  resourceId: 'doc-456',
  action: 'edit'
});
// 返回: { allowed: true }
```

---

## 🚨 威胁检测 (Threat Detection)

### 监听威胁事件

```typescript
threatDetector.on('threat-detected', (alert) => {
  console.log(`[${alert.type}] ${alert.message}`);
  console.log(`Severity: ${alert.severity}`);
});
```

### 分析登录尝试

```typescript
await threatDetector.analyzeLoginAttempt({
  userId: 'user-123',
  ip: '192.168.1.1',
  location: 'Unknown Location',
  success: false
});
// 可能触发: 'anomaly-login' 或 'brute-force-attack' 事件
```

### 分析流量（DDoS 检测）

```typescript
const requests = Array.from({ length: 1000 }, (_, i) => ({
  timestamp: Date.now(),
  ip: `1.2.3.${i % 256}`,
  endpoint: '/api/data'
}));

await threatDetector.analyzeTraffic(requests);
// 可能触发: 'ddos-attack' 事件
```

### 分析数据访问

```typescript
await threatDetector.analyzeDataAccess({
  userId: 'user-123',
  action: 'bulk-download',
  dataVolume: 10000,
  sensitiveData: true
});
// 可能触发: 'data-leak-attempt' 事件
```

---

## 📋 合规性检查 (Compliance)

### GDPR 检查

```typescript
const compliance = await complianceManager.checkCompliance('GDPR');
// 返回: {
//   compliant: true,
//   dataEncryption: true,
//   rightToBeForgotten: true,
//   dataPortability: true,
//   consentManagement: true
// }
```

### SOC2 检查

```typescript
const compliance = await complianceManager.checkCompliance('SOC2');
// 返回: {
//   compliant: true,
//   accessControl: true,
//   auditLogging: true,
//   changeManagement: true,
//   incidentResponse: true
// }
```

### ISO27001 检查

```typescript
const compliance = await complianceManager.checkCompliance('ISO27001');
// 返回: {
//   compliant: true,
//   informationSecurity: true,
//   accessControl: true,
//   cryptography: true,
//   incidentManagement: true
// }
```

---

## ⚙️ 配置管理 (Configuration)

### 获取安全配置

```typescript
const config = securityCenter.getSecurityConfig();
// 返回: {
//   enableHTTPS: true,
//   enableMFA: true,
//   enableEncryption: true,
//   enableAuditLogging: true,
//   enableThreatDetection: true,
//   enableAccessControl: true,
//   allowInsecureConnections: false,
//   allowWeakCiphers: false,
//   debugMode: false,
//   sessionTimeout: 3600000,
//   maxFailedAttempts: 5,
//   ...
// }
```

### 验证请求

```typescript
const result = securityCenter.validateRequest({
  protocol: 'http'
});
// 返回: {
//   secure: false,
//   shouldRedirect: true
// }
```

### 验证证书

```typescript
const result = await securityCenter.validateCertificate({
  subject: 'example.com',
  issuer: 'trusted-ca',
  validFrom: new Date('2024-01-01'),
  validTo: new Date('2025-01-01')
});
// 返回: { valid: true }
```

---

## 📊 审计与报告 (Audit & Reporting)

### 获取审计日志

```typescript
const logs = await securityCenter.getAuditLogs({
  startDate: new Date(Date.now() - 86400000), // 1 天前
  endDate: new Date()
});
// 返回: [] (审计日志数组)
```

### 获取安全报告

```typescript
const report = await securityCenter.getSecurityReport();
// 返回: {
//   timestamp: 1234567890,
//   totalUsers: 100,
//   activeSessions: 45,
//   mfaEnabled: 80,
//   lockedAccounts: 3
// }
```

---

## 🛠️ 生命周期 (Lifecycle)

### 初始化

```typescript
const securityCenter = new ComprehensiveSecurityCenter({
  enableRealTimeMonitoring: true,
  enableThreatDetection: true,
  enableCompliance: true
});
```

### 清理资源

```typescript
// 在应用关闭前调用
securityCenter.shutdown();
```

---

## 🔗 完整示例

```typescript
// 1. 注册用户
await securityCenter.registerUser({
  username: 'john',
  password: 'SecurePass123!',
  email: 'john@example.com'
});

// 2. 用户登录
const authResult = await securityCenter.authenticate({
  username: 'john',
  password: 'SecurePass123!'
});

// 3. 如果需要 MFA
if (authResult.requiresMFA) {
  const mfaResult = await securityCenter.verifyMFA({
    mfaToken: authResult.mfaToken,
    code: '123456'
  });
  // 现在已认证
}

// 4. 创建会话
const token = await securityCenter.createSession({
  userId: 'user-john',
  permissions: ['read', 'write']
});

// 5. 在后续请求中验证会话
const validation = await securityCenter.validateSession(token);
if (!validation.valid) {
  // 会话已过期或无效
}

// 6. 清理输入
const cleanInput = securityCenter.sanitizeInput(userInput, 'sql');

// 7. 检查权限
if (securityCenter.hasPermission(user, 'delete')) {
  // 允许删除操作
}

// 8. 监听威胁
threatDetector.on('threat-detected', (alert) => {
  console.error(`Security Alert: ${alert.message}`);
});
```

---

## ⚠️ 常见错误

### 密码不符合复杂度要求

```typescript
const result = securityCenter.validatePasswordComplexity('123456');
// errors: ['Password must be at least 8 characters', ...]
```

### 会话已过期

```typescript
const validation = await securityCenter.validateSession(oldToken);
// { valid: false, error: 'Session expired' }
```

### 账户被锁定

```typescript
const result = await securityCenter.authenticate({ username, password });
// 5 次失败后
// { success: false, error: 'Account is locked ...' }
```

### 速率限制超出

```typescript
const result = await limiter.checkLimit(userId);
// 在 50 次请求后
// { allowed: false }
```

---

## 📞 获取帮助

查看详细文档:

- [SecurityCenter 技术细节](./SecurityCenter-Technical-Details.md)
- [优化成果报告](./Phase1-3-Optimization-Achievement.md)
- [完成度报告](./Phase1-3-Completion-Report.md)

---

**版本**: 1.0
**最后更新**: 2025-01-30
**兼容性**: Node.js 18+, TypeScript 4.5+

---
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
