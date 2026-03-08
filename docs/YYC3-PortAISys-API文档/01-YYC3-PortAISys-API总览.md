---
@file: 01-YYC3-PortAISys-API总览.md
@description: YYC³ PortAISys API 总览文档，包含 API 概述、认证方式、请求格式、响应格式和错误处理
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: api,restful,critical,zh-CN
@category: api
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

# YYC³ PortAISys - API总览


## 📋 目录

- [API概述](#api概述)
- [认证方式](#认证方式)
- [请求格式](#请求格式)
- [响应格式](#响应格式)
- [错误处理](#错误处理)
- [速率限制](#速率限制)
- [版本控制](#版本控制)
- [最佳实践](#最佳实践)

---

## API概述

### API简介

YYC³ PortAISys提供了一套完整的RESTful API，用于访问系统的各个核心功能模块。API设计遵循RESTful架构风格，支持JSON数据格式，提供统一的响应格式和错误处理机制。

### 设计原则

基于YYC³「五高五标五化」理念：

**五高**:

- **高可用**: API服务稳定可靠，可用性≥99.9%
- **高性能**: API响应快速，P95响应时间<200ms
- **高安全**: API安全可控，支持多种认证方式
- **高扩展**: API可扩展性强，支持水平扩展
- **高可维护**: API易于维护和升级

**五标**:

- **标准化**: API设计遵循RESTful标准
- **规范化**: API响应格式统一规范
- **自动化**: API文档自动生成和更新
- **智能化**: API支持智能推荐和优化
- **可视化**: API监控和可视化

**五化**:

- **流程化**: API调用流程化
- **文档化**: API文档完整化
- **工具化**: API开发工具化
- **数字化**: API监控数字化
- **生态化**: API生态化

### 基础信息

#### 基础URL

```
生产环境: https://api.yyc3.com/v1
测试环境: https://api-staging.yyc3.com/v1
开发环境: https://api-dev.yyc3.com/v1
```

#### 支持的协议

- HTTPS（生产环境强制使用）
- HTTP/2（推荐）
- WebSocket（实时通信）

#### 支持的数据格式

- application/json（推荐）
- application/xml
- multipart/form-data（文件上传）
- application/x-www-form-urlencoded

---

## 认证方式

### JWT Token认证

#### 获取Token

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 使用Token

```http
GET /v1/users/me
Authorization: Bearer <your-jwt-token>
```

#### Token刷新

```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<your-refresh-token>"
}
```

### API Key认证

#### 获取API Key

```http
POST /v1/api-keys
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "My API Key",
  "scopes": ["read", "write"],
  "expiresIn": 30
}
```

#### 使用API Key

```http
GET /v1/data
X-API-Key: <your-api-key>
```

### OAuth 2.0认证

#### 授权流程

```http
GET /v1/oauth/authorize?
  response_type=code&
  client_id=<client-id>&
  redirect_uri=<redirect-uri>&
  scope=read write&
  state=<state>
```

#### 获取访问令牌

```http
POST /v1/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=<authorization-code>&
redirect_uri=<redirect-uri>&
client_id=<client-id>&
client_secret=<client-secret>
```

#### 使用访问令牌

```http
GET /v1/users/me
Authorization: Bearer <oauth-access-token>
```

---

## 请求格式

### 请求头

#### 标准请求头

```http
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
User-Agent: YYC3-Client/1.0
X-Request-ID: <unique-request-id>
X-Client-Version: 1.0.0
```

#### 可选请求头

```http
X-Forwarded-For: <client-ip>
X-Real-IP: <client-ip>
Accept-Language: zh-CN
Accept-Encoding: gzip, deflate
```

### 请求参数

#### 路径参数

```http
GET /v1/users/{userId}
GET /v1/workflows/{workflowId}/executions/{executionId}
```

#### 查询参数

```http
GET /v1/users?page=1&limit=20&sort=createdAt:desc
GET /v1/workflows?status=active&category=ai
```

#### 请求体

```http
POST /v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 请求示例

#### GET请求

```bash
curl -X GET https://api.yyc3.com/v1/users \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json"
```

#### POST请求

```bash
curl -X POST https://api.yyc3.com/v1/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

#### PUT请求

```bash
curl -X PUT https://api.yyc3.com/v1/users/123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

#### DELETE请求

```bash
curl -X DELETE https://api.yyc3.com/v1/users/123 \
  -H "Authorization: Bearer <token>"
```

---

## 响应格式

### 成功响应

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
  requestId?: string;
}
```

#### 示例

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "用户创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

### 错误响应

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
  timestamp: string;
  requestId?: string;
}
```

#### 示例

```json
{
  "success": false,
  "error": {
    "code": "E001",
    "message": "用户不存在",
    "details": {
      "userId": "user-123"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

### 分页响应

```typescript
interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
  timestamp: string;
}
```

#### 示例

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user-1",
        "name": "User 1"
      },
      {
        "id": "user-2",
        "name": "User 2"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 错误处理

### 错误代码

#### 通用错误代码

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| **E000** | 500 | 服务器内部错误 |
| **E001** | 404 | 资源不存在 |
| **E002** | 400 | 请求参数错误 |
| **E003** | 401 | 未授权 |
| **E004** | 403 | 禁止访问 |
| **E005** | 409 | 资源冲突 |
| **E006** | 422 | 请求参数验证失败 |
| **E007** | 429 | 请求过于频繁 |

#### 认证错误代码

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| **E100** | 401 | Token无效或过期 |
| **E101** | 401 | Token格式错误 |
| **E102** | 401 | API Key无效 |
| **E103** | 401 | API Key已过期 |
| **E104** | 401 | 用户名或密码错误 |
| **E105** | 401 | 账户已被锁定 |

#### 用户错误代码

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| **E200** | 404 | 用户不存在 |
| **E201** | 409 | 邮箱已存在 |
| **E202** | 409 | 用户名已存在 |
| **E203** | 403 | 权限不足 |
| **E204** | 403 | 账户已被禁用 |

#### AI错误代码

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| **E300** | 500 | AI服务不可用 |
| **E301** | 400 | AI请求参数错误 |
| **E302** | 429 | AI请求过于频繁 |
| **E303** | 500 | AI模型加载失败 |
| **E304** | 400 | AI推理超时 |

### 错误处理最佳实践

1. **检查success字段**: 首先检查`success`字段判断请求是否成功
2. **处理错误代码**: 根据`error.code`进行相应的错误处理
3. **显示友好消息**: 向用户显示`error.message`而不是技术细节
4. **记录错误日志**: 记录错误详情用于调试和分析
5. **实现重试机制**: 对于临时性错误实现重试机制

---

## 速率限制

### 限制策略

#### 按用户限制

| 端点类型 | 限制 | 时间窗口 |
|---------|------|---------|
| **认证端点** | 5次 | 15分钟 |
| **读取端点** | 100次 | 1分钟 |
| **写入端点** | 20次 | 1分钟 |
| **AI端点** | 10次 | 1分钟 |

#### 按IP限制

| 端点类型 | 限制 | 时间窗口 |
|---------|------|---------|
| **认证端点** | 10次 | 15分钟 |
| **读取端点** | 200次 | 1分钟 |
| **写入端点** | 40次 | 1分钟 |
| **AI端点** | 20次 | 1分钟 |

### 速率限制响应

```json
{
  "success": false,
  "error": {
    "code": "E007",
    "message": "请求过于频繁",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": "2026-02-03T12:01:00.000Z"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 速率限制头

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1675406460
```

---

## 版本控制

### 版本策略

- API版本通过URL路径指定：`/v1/`, `/v2/`
- 支持多版本共存
- 新版本向后兼容
- 废弃版本提前6个月通知

### 版本选择

#### 通过URL

```http
GET /v1/users
GET /v2/users
```

#### 通过请求头

```http
GET /users
Accept: application/vnd.yyc3.v1+json
```

### 版本变更通知

```json
{
  "success": true,
  "data": {
    "currentVersion": "v1",
    "latestVersion": "v2",
    "deprecatedAt": "2026-08-03T00:00:00.000Z",
    "sunsetAt": "2027-02-03T00:00:00.000Z",
    "migrationGuide": "https://docs.yyc3.com/api/migration-v1-to-v2"
  },
  "message": "API版本信息",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 最佳实践

### 请求最佳实践

1. **使用HTTPS**: 生产环境强制使用HTTPS
2. **设置超时**: 为所有请求设置合理的超时时间
3. **重试机制**: 对于临时性错误实现指数退避重试
4. **请求ID**: 为每个请求生成唯一的请求ID
5. **压缩数据**: 启用gzip压缩减少传输数据量

### 响应处理最佳实践

1. **检查状态码**: 首先检查HTTP状态码
2. **验证响应格式**: 验证响应数据格式
3. **处理错误**: 实现完善的错误处理机制
4. **缓存响应**: 对可缓存的响应进行缓存
5. **日志记录**: 记录请求和响应日志

### 安全最佳实践

1. **保护密钥**: 不要在代码中硬编码密钥
2. **使用HTTPS**: 始终使用HTTPS进行通信
3. **验证证书**: 验证服务器SSL证书
4. **限制权限**: 使用最小权限原则
5. **定期轮换**: 定期轮换API密钥和Token

---

## 下一步

- [认证API](./02-认证API.md) - 学习认证相关API
- [AI智能体API](./03-AI智能体API.md) - 学习AI相关API
- [工作流API](./04-工作流API.md) - 学习工作流相关API

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
