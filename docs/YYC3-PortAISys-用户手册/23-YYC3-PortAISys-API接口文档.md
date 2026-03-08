---
@file: 23-YYC3-PortAISys-API接口文档.md
@description: YYC3-PortAISys-API接口文档 文档
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

# YYC³ PortAISys - API接口文档


## 📋 目录

- [API概述](#api概述)
- [认证方式](#认证方式)
- [基础接口](#基础接口)
- [AI接口](#ai接口)
- [工作流接口](#工作流接口)
- [用户管理接口](#用户管理接口)
- [监控接口](#监控接口)
- [错误处理](#错误处理)
- [SDK使用](#sdk使用)

---

## API概述

### 基础信息

| 项目 | 说明 |
| ---- | ---- |
| **Base URL** | `https://api.your-domain.com` |
| **API版本** | `v1` |
| **数据格式** | `JSON` |
| **字符编码** | `UTF-8` |
| **请求方法** | `GET`, `POST`, `PUT`, `DELETE`, `PATCH` |

### 通用响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { },
  "message": "操作成功",
  "timestamp": 1706980800000
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "E001",
    "message": "错误描述",
    "details": { }
  },
  "timestamp": 1706980800000
}
```

### 分页参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- | ---- |
| **page** | integer | 否 | 1 | 页码，从1开始 |
| **pageSize** | integer | 否 | 20 | 每页数量，最大100 |
| **sortBy** | string | 否 | createdAt | 排序字段 |
| **sortOrder** | string | 否 | desc | 排序方向：asc/desc |

**分页响应**:
```json
{
  "success": true,
  "data": {
    "items": [ ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 认证方式

### JWT认证

**请求头**:
```http
Authorization: Bearer <jwt_token>
```

**获取Token**:
```bash
curl -X POST https://api.your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "用户名",
      "role": "USER"
    }
  }
}
```

### API密钥认证

**请求头**:
```http
X-API-Key: <api_key>
```

**创建API密钥**:
```bash
curl -X POST https://api.your-domain.com/api/v1/api-keys \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Key",
    "scopes": ["read", "write"],
    "expiresIn": 2592000
  }'
```

---

## 基础接口

### 健康检查

**接口**: `GET /health`

**描述**: 检查应用健康状态

**请求示例**:
```bash
curl https://api.your-domain.com/health
```

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": 1706980800000,
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": "ok",
    "redis": "ok",
    "ai": "ok"
  }
}
```

### 数据库健康检查

**接口**: `GET /api/v1/health/database`

**描述**: 检查数据库连接状态

**请求示例**:
```bash
curl https://api.your-domain.com/api/v1/health/database
```

**响应示例**:
```json
{
  "status": "ok",
  "database": "postgresql",
  "version": "15.0",
  "connections": {
    "active": 5,
    "idle": 10,
    "max": 200
  },
  "latency": 2.5
}
```

### Redis健康检查

**接口**: `GET /api/v1/health/redis`

**描述**: 检查Redis连接状态

**请求示例**:
```bash
curl https://api.your-domain.com/api/v1/health/redis
```

**响应示例**:
```json
{
  "status": "ok",
  "connected": true,
  "memory": {
    "used": "256MB",
    "peak": "512MB",
    "total": "4GB"
  },
  "stats": {
    "keys": 12345,
    "expires": 100,
    "hits": 98765,
    "misses": 1234
  }
}
```

---

## AI接口

### AI对话

**接口**: `POST /api/v1/ai/chat`

**描述**: 发送AI对话请求

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| **model** | string | 否 | AI模型，默认gpt-4 |
| **messages** | array | 是 | 对话消息数组 |
| **temperature** | number | 否 | 温度参数，0-2，默认0.7 |
| **maxTokens** | integer | 否 | 最大Token数，默认4096 |
| **stream** | boolean | 否 | 是否流式输出，默认false |

**请求示例**:
```bash
curl -X POST https://api.your-domain.com/api/v1/ai/chat \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "你是一个有用的AI助手。"
      },
      {
        "role": "user",
        "content": "你好，请介绍一下YYC³系统。"
      }
    ],
    "temperature": 0.7,
    "maxTokens": 1000,
    "stream": false
  }'
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "chatcmpl-xxxxxxxx",
    "model": "gpt-4",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "YYC³（YanYuCloudCube）是一个基于云原生架构的便携式智能AI系统..."
        },
        "finishReason": "stop"
      }
    ],
    "usage": {
      "promptTokens": 25,
      "completionTokens": 150,
      "totalTokens": 175
    }
  }
}
```

### AI流式对话

**接口**: `POST /api/v1/ai/chat/stream`

**描述**: 发送AI流式对话请求

**请求示例**:
```bash
curl -X POST https://api.your-domain.com/api/v1/ai/chat/stream \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "请写一首诗。"
      }
    ],
    "stream": true
  }'
```

**响应格式**: Server-Sent Events (SSE)

```
data: {"id": "chatcmpl-xxxxxxxx", "choices": [{"delta": {"content": "春"}}]}

data: {"id": "chatcmpl-xxxxxxxx", "choices": [{"delta": {"content": "天"}}]}

data: {"id": "chatcmpl-xxxxxxxx", "choices": [{"delta": {"content": "来"}}]}

data: {"id": "chatcmpl-xxxxxxxx", "choices": [{"delta": {"content": "了"}}]}

data: [DONE]
```

### AI模型列表

**接口**: `GET /api/v1/ai/models`

**描述**: 获取可用的AI模型列表

**请求示例**:
```bash
curl https://api.your-domain.com/api/v1/ai/models \
  -H "Authorization: Bearer <jwt_token>"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "openai": [
      {
        "id": "gpt-4",
        "name": "GPT-4",
        "description": "最先进的模型",
        "maxTokens": 8192,
        "pricing": {
          "input": 0.03,
          "output": 0.06
        }
      },
      {
        "id": "gpt-3.5-turbo",
        "name": "GPT-3.5 Turbo",
        "description": "快速且经济的模型",
        "maxTokens": 4096,
        "pricing": {
          "input": 0.001,
          "output": 0.002
        }
      }
    ],
    "anthropic": [
      {
        "id": "claude-3-opus-20240229",
        "name": "Claude 3 Opus",
        "description": "最强大的Claude模型",
        "maxTokens": 200000,
        "pricing": {
          "input": 0.015,
          "output": 0.075
        }
      }
    ]
  }
}
```

---

## 工作流接口

### 创建工作流

**接口**: `POST /api/v1/workflows`

**描述**: 创建新的工作流

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| **name** | string | 是 | 工作流名称 |
| **description** | string | 否 | 工作流描述 |
| **templateId** | string | 否 | 模板ID |
| **config** | object | 否 | 工作流配置 |
| **enabled** | boolean | 否 | 是否启用，默认true |

**请求示例**:
```bash
curl -X POST https://api.your-domain.com/api/v1/workflows \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "客户服务工作流",
    "description": "自动化客户服务流程",
    "templateId": "customer-service-template",
    "config": {
      "steps": [
        {
          "id": "step1",
          "type": "ai-analysis",
          "config": {
            "model": "gpt-4",
            "prompt": "分析客户问题"
          }
        },
        {
          "id": "step2",
          "type": "database-query",
          "config": {
            "query": "SELECT * FROM customers WHERE id = $customerId"
          }
        }
      ]
    },
    "enabled": true
  }'
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "wf-xxxxxxxx",
    "name": "客户服务工作流",
    "description": "自动化客户服务流程",
    "status": "active",
    "createdAt": "2026-02-03T10:00:00Z",
    "config": { }
  }
}
```

### 执行工作流

**接口**: `POST /api/v1/workflows/{workflowId}/execute`

**描述**: 执行指定的工作流

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| **workflowId** | string | 是 | 工作流ID |

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| **input** | object | 否 | 工作流输入数据 |
| **async** | boolean | 否 | 是否异步执行，默认false |

**请求示例**:
```bash
curl -X POST https://api.your-domain.com/api/v1/workflows/wf-xxxxxxxx/execute \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "customerId": "customer-123",
      "message": "客户反馈问题"
    },
    "async": false
  }'
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "executionId": "exec-xxxxxxxx",
    "workflowId": "wf-xxxxxxxx",
    "status": "completed",
    "result": {
      "step1": {
        "status": "success",
        "output": "分析结果"
      },
      "step2": {
        "status": "success",
        "output": { }
      }
    },
    "startedAt": "2026-02-03T10:00:00Z",
    "completedAt": "2026-02-03T10:00:05Z",
    "duration": 5000
  }
}
```

### 获取工作流列表

**接口**: `GET /api/v1/workflows`

**描述**: 获取工作流列表

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- | ---- |
| **page** | integer | 否 | 1 | 页码 |
| **pageSize** | integer | 否 | 20 | 每页数量 |
| **status** | string | 否 | - | 状态筛选：active/inactive |
| **search** | string | 否 | - | 搜索关键词 |

**请求示例**:
```bash
curl "https://api.your-domain.com/api/v1/workflows?page=1&pageSize=20&status=active" \
  -H "Authorization: Bearer <jwt_token>"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "wf-xxxxxxxx",
        "name": "客户服务工作流",
        "description": "自动化客户服务流程",
        "status": "active",
        "createdAt": "2026-02-03T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

## 用户管理接口

### 用户登录

**接口**: `POST /api/v1/auth/login`

**描述**: 用户登录获取Token

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| **email** | string | 是 | 邮箱地址 |
| **password** | string | 是 | 密码 |
| **rememberMe** | boolean | 否 | 是否记住我，默认false |

**请求示例**:
```bash
curl -X POST https://api.your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "rememberMe": true
  }'
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "用户名",
      "role": "USER",
      "permissions": ["read", "write"]
    }
  }
}
```

### 用户注册

**接口**: `POST /api/v1/auth/register`

**描述**: 新用户注册

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| **email** | string | 是 | 邮箱地址 |
| **password** | string | 是 | 密码（至少8位） |
| **confirmPassword** | string | 是 | 确认密码 |
| **name** | string | 是 | 用户名 |

**请求示例**:
```bash
curl -X POST https://api.your-domain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "name": "新用户"
  }'
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "user-456",
    "email": "newuser@example.com",
    "name": "新用户",
    "role": "USER",
    "createdAt": "2026-02-03T10:00:00Z"
  },
  "message": "注册成功"
}
```

### 获取用户信息

**接口**: `GET /api/v1/users/me`

**描述**: 获取当前登录用户的信息

**请求示例**:
```bash
curl https://api.your-domain.com/api/v1/users/me \
  -H "Authorization: Bearer <jwt_token>"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "用户名",
    "role": "USER",
    "permissions": ["read", "write", "delete"],
    "preferences": {
      "language": "zh-CN",
      "theme": "light",
      "notifications": true
    },
    "createdAt": "2026-01-01T00:00:00Z",
    "lastLoginAt": "2026-02-03T10:00:00Z"
  }
}
```

### 更新用户信息

**接口**: `PUT /api/v1/users/me`

**描述**: 更新当前用户的信息

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| **name** | string | 否 | 用户名 |
| **email** | string | 否 | 邮箱地址 |
| **preferences** | object | 否 | 用户偏好设置 |

**请求示例**:
```bash
curl -X PUT https://api.your-domain.com/api/v1/users/me \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新后的用户名",
    "preferences": {
      "language": "en-US",
      "theme": "dark",
      "notifications": false
    }
  }'
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "更新后的用户名",
    "preferences": {
      "language": "en-US",
      "theme": "dark",
      "notifications": false
    },
    "updatedAt": "2026-02-03T10:00:00Z"
  },
  "message": "用户信息更新成功"
}
```

---

## 监控接口

### 获取系统指标

**接口**: `GET /api/v1/metrics`

**描述**: 获取系统性能指标

**请求示例**:
```bash
curl https://api.your-domain.com/api/v1/metrics \
  -H "Authorization: Bearer <jwt_token>"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "system": {
      "cpu": {
        "usage": 45.5,
        "cores": 8
      },
      "memory": {
        "used": "8GB",
        "total": "16GB",
        "usage": 50.0
      },
      "disk": {
        "used": "200GB",
        "total": "500GB",
        "usage": 40.0
      }
    },
    "application": {
      "requests": {
        "total": 10000,
        "success": 9500,
        "error": 500,
        "successRate": 95.0
      },
      "responseTime": {
        "avg": 150,
        "p50": 120,
        "p95": 200,
        "p99": 300
      },
      "connections": {
        "active": 50,
        "idle": 20,
        "max": 200
      }
    },
    "database": {
      "connections": 25,
      "queries": {
        "total": 50000,
        "slow": 100,
        "avgTime": 50
      }
    },
    "cache": {
      "hitRate": 95.5,
      "keys": 12345,
      "memory": "256MB"
    }
  }
}
```

### 获取告警列表

**接口**: `GET /api/v1/alerts`

**描述**: 获取系统告警列表

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- | ---- |
| **level** | string | 否 | - | 告警级别：error/warn/info |
| **status** | string | 否 | - | 告警状态：active/resolved |
| **startTime** | string | 否 | - | 开始时间（ISO 8601） |
| **endTime** | string | 否 | - | 结束时间（ISO 8601） |

**请求示例**:
```bash
curl "https://api.your-domain.com/api/v1/alerts?level=error&status=active" \
  -H "Authorization: Bearer <jwt_token>"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "alert-123",
        "level": "error",
        "message": "数据库连接失败",
        "source": "database",
        "status": "active",
        "createdAt": "2026-02-03T10:00:00Z",
        "metadata": {
          "error": "Connection timeout",
          "retryCount": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 错误处理

### 错误代码

| 代码 | HTTP状态 | 描述 |
| ---- | --------- | ---- |
| **E001** | 400 | 数据库连接错误 |
| **E002** | 400 | Redis连接错误 |
| **E003** | 400 | AI模型调用错误 |
| **E004** | 401 | 认证失败 |
| **E005** | 403 | 授权失败 |
| **E006** | 400 | 参数验证失败 |
| **E007** | 429 | 请求频率超限 |
| **E008** | 400 | 缓存操作失败 |
| **E009** | 400 | 文件上传失败 |
| **E010** | 400 | 工作流执行失败 |

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "E004",
    "message": "认证失败：Token无效或已过期",
    "details": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "reason": "Token expired"
    }
  },
  "timestamp": 1706980800000
}
```

---

## SDK使用

### JavaScript/TypeScript SDK

**安装**:
```bash
npm install @yyc3/portaisys-sdk
```

**初始化**:
```typescript
import { YYC3Client } from '@yyc3/portaisys-sdk';

const client = new YYC3Client({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.your-domain.com'
});

// 或使用JWT认证
const client = new YYC3Client({
  token: 'your-jwt-token',
  baseUrl: 'https://api.your-domain.com'
});
```

**使用示例**:
```typescript
// AI对话
const response = await client.ai.chat({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: '你好' }
  ]
});

// 创建工作流
const workflow = await client.workflows.create({
  name: '我的工作流',
  description: '工作流描述',
  config: { }
});

// 执行工作流
const result = await client.workflows.execute(workflow.id, {
  input: { },
  async: false
});
```

### Python SDK

**安装**:
```bash
pip install yyc3-portaisys-sdk
```

**初始化**:
```python
from yyc3_portaisys import YYC3Client

client = YYC3Client(
    api_key='your-api-key',
    base_url='https://api.your-domain.com'
)

# 或使用JWT认证
client = YYC3Client(
    token='your-jwt-token',
    base_url='https://api.your-domain.com'
)
```

**使用示例**:
```python
# AI对话
response = client.ai.chat(
    model='gpt-4',
    messages=[
        {'role': 'user', 'content': '你好'}
    ]
)

# 创建工作流
workflow = client.workflows.create(
    name='我的工作流',
    description='工作流描述',
    config={ }
)

# 执行工作流
result = client.workflows.execute(
    workflow_id=workflow.id,
    input={ },
    async=False
)
```

---

## 速率限制

| 限制类型 | 限制值 | 说明 |
| -------- | ------- | ---- |
| **匿名用户** | 100请求/分钟 | 未认证用户 |
| **认证用户** | 1000请求/分钟 | 已认证用户 |
| **API密钥** | 5000请求/分钟 | 使用API密钥 |
| **批量请求** | 10请求/秒 | 批量操作 |

**速率限制响应头**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1706981400
```

---

## 版本管理

### 当前版本

**版本**: v1.0
**发布日期**: 2026-02-03

### 版本策略

- **主版本**: 不兼容的API修改
- **次版本**: 向下兼容的功能性新增
- **修订版本**: 向下兼容的问题修正

### 弃用通知

**弃用API**:
- `POST /api/v1/legacy/endpoint` - 将于2026-06-01弃用

**建议迁移**:
- 使用 `POST /api/v1/new/endpoint` 替代

---

## 获取帮助

- **API文档**: https://docs.your-domain.com/api
- **GitHub Issues**: https://github.com/YYC-Cube/YYC3-PortAISys/issues
- **邮件支持**: api-support@0379.email

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
