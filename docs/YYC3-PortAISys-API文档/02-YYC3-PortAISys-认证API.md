# YYC³ PortAISys - 认证API

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> **文档版本**: v1.0
> **创建日期**: 2026-02-03
> **文档状态**: ✅ 已完成
> **维护团队**: YYC³ 产品团队

---

## 📋 目录

- [认证API概述](#认证api概述)
- [用户注册](#用户注册)
- [用户登录](#用户登录)
- [Token刷新](#token刷新)
- [用户登出](#用户登出)
- [密码重置](#密码重置)
- [OAuth 2.0](#oauth-20)
- [API密钥管理](#api密钥管理)
- [多因素认证](#多因素认证)

---

## 认证API概述

### API简介

YYC³ PortAISys认证API提供完整的用户认证和授权功能，支持多种认证方式，包括用户名密码认证、JWT Token认证、OAuth 2.0认证和多因素认证（MFA）。

### 认证方式

| 认证方式 | 描述 | 适用场景 |
|---------|------|----------|
| **用户名密码** | 使用用户名和密码进行认证 | 基本认证 |
| **JWT Token** | 使用JWT Token进行认证 | API调用 |
| **OAuth 2.0** | 使用OAuth 2.0进行认证 | 第三方集成 |
| **API Key** | 使用API Key进行认证 | 服务间调用 |
| **MFA** | 多因素认证 | 高安全要求 |

### 安全特性

- 密码使用bcrypt加密存储
- JWT Token使用强密钥签名
- 支持Token刷新机制
- 实施登录失败限制
- 支持会话管理
- 支持设备管理

---

## 用户注册

### 注册新用户

**端点**: `POST /v1/auth/register`

**描述**: 创建新用户账户。

**请求头**:

```http
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "name": "John Doe",
  "phone": "+8613800138000"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **email** | string | 是 | 用户邮箱，必须是有效邮箱格式 |
| **username** | string | 是 | 用户名，3-50字符，唯一 |
| **password** | string | 是 | 密码，至少8字符，必须包含字母和数字 |
| **name** | string | 是 | 用户真实姓名，1-100字符 |
| **phone** | string | 否 | 手机号码，国际格式 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "phone": "+8613800138000",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  },
  "message": "用户注册成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**错误响应** (400):

```json
{
  "success": false,
  "error": {
    "code": "E201",
    "message": "邮箱已存在",
    "details": {
      "field": "email",
      "value": "user@example.com"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**错误代码**:

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| **E002** | 400 | 请求参数错误 |
| **E201** | 409 | 邮箱已存在 |
| **E202** | 409 | 用户名已存在 |
| **E206** | 400 | 密码格式错误 |

---

## 用户登录

### 用户名密码登录

**端点**: `POST /v1/auth/login`

**描述**: 使用用户名和密码登录。

**请求头**:

```http
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "username": "johndoe",
  "password": "password123",
  "rememberMe": true
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **username** | string | 是 | 用户名或邮箱 |
| **password** | string | 是 | 密码 |
| **rememberMe** | boolean | 否 | 是否记住登录，默认false |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "role": "USER",
      "status": "ACTIVE",
      "permissions": [
        "user:read",
        "user:write",
        "workflow:read",
        "workflow:write",
        "ai:chat"
      ]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    },
    "device": {
      "id": "device-123",
      "name": "Chrome on Windows",
      "ip": "192.168.1.1",
      "location": "Beijing, China",
      "lastUsedAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "登录成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**错误响应** (401):

```json
{
  "success": false,
  "error": {
    "code": "E104",
    "message": "用户名或密码错误",
    "details": {
      "remainingAttempts": 4,
      "lockoutTime": null
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**错误代码**:

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| **E002** | 400 | 请求参数错误 |
| **E104** | 401 | 用户名或密码错误 |
| **E105** | 401 | 账户已被锁定 |
| **E200** | 404 | 用户不存在 |

### OAuth登录

**端点**: `POST /v1/auth/oauth/login`

**描述**: 使用OAuth 2.0登录。

**请求头**:

```http
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "provider": "google",
  "code": "4/0AX4XfWh7...",
  "redirectUri": "https://your-app.com/callback"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **provider** | string | 是 | OAuth提供商（google、github、wechat） |
| **code** | string | 是 | OAuth授权码 |
| **redirectUri** | string | 是 | 重定向URI |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "status": "ACTIVE"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  },
  "message": "OAuth登录成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## Token刷新

### 刷新访问令牌

**端点**: `POST /v1/auth/refresh`

**描述**: 使用刷新令牌获取新的访问令牌。

**请求头**:

```http
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **refreshToken** | string | 是 | 刷新令牌 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  },
  "message": "Token刷新成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**错误响应** (401):

```json
{
  "success": false,
  "error": {
    "code": "E100",
    "message": "刷新令牌无效或已过期",
    "details": {}
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 用户登出

### 登出当前会话

**端点**: `POST /v1/auth/logout`

**描述**: 登出当前会话，使当前Token失效。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "deviceId": "device-123"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **deviceId** | string | 否 | 设备ID，指定登出哪个设备 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {},
  "message": "登出成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 登出所有会话

**端点**: `POST /v1/auth/logout-all`

**描述**: 登出所有会话，使所有Token失效。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "loggedOutDevices": 5
  },
  "message": "已登出所有设备",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 密码重置

### 请求密码重置

**端点**: `POST /v1/auth/password/reset/request`

**描述**: 请求密码重置，发送重置邮件。

**请求头**:

```http
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "email": "user@example.com"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **email** | string | 是 | 用户邮箱 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {},
  "message": "密码重置邮件已发送",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 确认密码重置

**端点**: `POST /v1/auth/password/reset/confirm`

**描述**: 使用重置令牌确认密码重置。

**请求头**:

```http
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "token": "reset-token-123",
  "newPassword": "newpassword123"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **token** | string | 是 | 重置令牌 |
| **newPassword** | string | 是 | 新密码，至少8字符 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {},
  "message": "密码重置成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## OAuth 2.0

### 获取授权URL

**端点**: `GET /v1/oauth/authorize`

**描述**: 获取OAuth授权URL。

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **provider** | string | 是 | OAuth提供商（google、github、wechat） |
| **redirectUri** | string | 是 | 重定向URI |
| **scope** | string | 否 | 授权范围 |
| **state** | string | 否 | 状态参数，用于防止CSRF攻击 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "authorizeUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...",
    "state": "state-123"
  },
  "message": "授权URL生成成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取访问令牌

**端点**: `POST /v1/oauth/token`

**描述**: 使用授权码获取访问令牌。

**请求头**:

```http
Content-Type: application/x-www-form-urlencoded
X-Request-ID: <unique-request-id>
```

**请求体**:

```
grant_type=authorization_code&
code=4/0AX4XfWh7...&
redirect_uri=https://your-app.com/callback&
client_id=your-client-id&
client_secret=your-client-secret
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **grant_type** | string | 是 | 授权类型，固定为`authorization_code` |
| **code** | string | 是 | 授权码 |
| **redirect_uri** | string | 是 | 重定向URI |
| **client_id** | string | 是 | 客户端ID |
| **client_secret** | string | 是 | 客户端密钥 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "scope": "read write"
  },
  "message": "访问令牌获取成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## API密钥管理

### 创建API密钥

**端点**: `POST /v1/api-keys`

**描述**: 创建新的API密钥。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "My API Key",
  "description": "用于测试的API密钥",
  "scopes": ["read", "write"],
  "expiresIn": 30
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | API密钥名称 |
| **description** | string | 否 | API密钥描述 |
| **scopes** | array | 是 | 权限范围（read、write、admin） |
| **expiresIn** | number | 否 | 过期天数，默认30天 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "apiKey": {
      "id": "api-key-123",
      "name": "My API Key",
      "description": "用于测试的API密钥",
      "key": "yyc3_abc123...",
      "scopes": ["read", "write"],
      "expiresAt": "2026-03-05T12:00:00.000Z",
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "API密钥创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**注意**: `key`字段只在创建时返回一次，请妥善保存。

### 列出API密钥

**端点**: `GET /v1/api-keys`

**描述**: 获取当前用户的所有API密钥。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **page** | number | 否 | 页码，默认1 |
| **limit** | number | 否 | 每页数量，默认20 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "api-key-123",
        "name": "My API Key",
        "description": "用于测试的API密钥",
        "key": "yyc3_abc123...",
        "scopes": ["read", "write"],
        "expiresAt": "2026-03-05T12:00:00.000Z",
        "lastUsedAt": "2026-02-03T12:00:00.000Z",
        "createdAt": "2026-02-03T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 删除API密钥

**端点**: `DELETE /v1/api-keys/{apiKeyId}`

**描述**: 删除指定的API密钥。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {},
  "message": "API密钥删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 多因素认证

### 启用MFA

**端点**: `POST /v1/auth/mfa/enable`

**描述**: 启用多因素认证。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "type": "totp"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **type** | string | 是 | MFA类型（totp、sms） |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "backupCodes": [
      "12345678",
      "87654321",
      "11112222"
    ]
  },
  "message": "MFA设置成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 验证MFA

**端点**: `POST /v1/auth/mfa/verify`

**描述**: 验证MFA代码。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "code": "123456"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **code** | string | 是 | MFA代码 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {},
  "message": "MFA验证成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 最佳实践

### 安全最佳实践

1. **使用HTTPS**: 始终使用HTTPS进行认证
2. **保护密钥**: 不要在代码中硬编码密钥
3. **Token存储**: 安全存储Token，使用HttpOnly Cookie
4. **定期刷新**: 定期刷新Token，避免过期
5. **登出清理**: 登出时清理所有Token和会话

### 开发最佳实践

1. **错误处理**: 实现完善的错误处理机制
2. **重试机制**: 对于临时性错误实现重试
3. **Token管理**: 实现自动Token刷新机制
4. **会话管理**: 实现会话超时和清理
5. **日志记录**: 记录认证相关日志

---

## 下一步

- [AI智能体API](./03-AI智能体API.md) - 学习AI相关API
- [工作流API](./04-工作流API.md) - 学习工作流相关API
- [用户管理API](./06-用户管理API.md) - 学习用户管理API

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
