# API使用指南

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys API使用指南

## 概述

本指南提供YYC³ PortAISys API的详细使用说明，包括认证、请求格式、响应处理、错误处理、最佳实践等内容。

## 目录

1. [快速开始](#快速开始)
2. [认证](#认证)
3. [请求格式](#请求格式)
4. [响应格式](#响应格式)
5. [错误处理](#错误处理)
6. [分页](#分页)
7. [过滤和排序](#过滤和排序)
8. [流式响应](#流式响应)
9. [批量操作](#批量操作)
10. [限流和配额](#限流和配额)
11. [最佳实践](#最佳实践)
12. [常见问题](#常见问题)

## 快速开始

### 1. 获取API密钥

1. 访问 [YYC³控制台](https://console.yyc3.com)
2. 登录您的账号
3. 进入"API密钥"页面
4. 创建新的API密钥
5. 保存API密钥（仅显示一次）

### 2. 发送第一个请求

```bash
curl -X GET https://api.yyc3.com/v1/ai/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ]
  }'
```

### 3. 使用SDK

#### JavaScript/TypeScript

```typescript
import { YYC3Client } from '@yyc3/sdk';

const client = new YYC3Client({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.yyc3.com'
});

const response = await client.ai.chat({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: '你好' }
  ]
});

console.log(response.choices[0].message.content);
```

#### Python

```python
from yyc3 import YYC3Client

client = YYC3Client(
    api_key='YOUR_API_KEY',
    base_url='https://api.yyc3.com'
)

response = client.ai.chat(
    model='gpt-4',
    messages=[
        {'role': 'user', 'content': '你好'}
    ]
)

print(response.choices[0].message.content)
```

## 认证

### Bearer Token认证

所有API请求都需要在HTTP头中包含Bearer Token：

```http
Authorization: Bearer YOUR_API_KEY
```

### API密钥管理

**安全建议**

- ✅ 将API密钥存储在环境变量中
- ✅ 使用密钥管理服务（如AWS Secrets Manager）
- ✅ 定期轮换API密钥
- ❌ 不要将API密钥硬编码在代码中
- ❌ 不要将API密钥提交到版本控制
- ❌ 不要在客户端代码中使用API密钥

**环境变量配置**

```bash
# .env文件
YYC3_API_KEY=your_api_key_here
YYC3_BASE_URL=https://api.yyc3.com
```

```typescript
// TypeScript
const apiKey = process.env.YYC3_API_KEY;
const baseURL = process.env.YYC3_BASE_URL || 'https://api.yyc3.com';
```

```python
# Python
import os

api_key = os.getenv('YYC3_API_KEY')
base_url = os.getenv('YYC3_BASE_URL', 'https://api.yyc3.com')
```

### 权限范围

API密钥可以配置不同的权限范围：

| 权限 | 描述 |
|------|------|
| `ai:read` | 读取AI模型和推理结果 |
| `ai:write` | 执行AI推理 |
| `user:read` | 读取用户信息 |
| `user:write` | 修改用户信息 |
| `workflow:read` | 读取工作流 |
| `workflow:write` | 创建和修改工作流 |
| `file:read` | 读取文件 |
| `file:write` | 上传和修改文件 |
| `admin:*` | 管理员权限（所有权限） |

## 请求格式

### HTTP方法

| 方法 | 用途 | 幂等性 |
|------|------|---------|
| GET | 获取资源 | 是 |
| POST | 创建资源 | 否 |
| PUT | 完整更新资源 | 是 |
| PATCH | 部分更新资源 | 否 |
| DELETE | 删除资源 | 是 |

### 请求头

**必需请求头**

```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**可选请求头**

```http
X-Request-ID: unique-request-id
X-Client-Version: 1.0.0
X-Client-Platform: web
User-Agent: YourApp/1.0.0
```

### 请求体

**JSON格式**

```json
{
  "stringField": "value",
  "numberField": 123,
  "booleanField": true,
  "arrayField": [1, 2, 3],
  "objectField": {
    "nestedField": "value"
  },
  "nullField": null
}
```

**日期时间格式**

所有日期时间字段使用ISO 8601格式：

```json
{
  "createdAt": "2026-02-03T12:00:00.000Z",
  "updatedAt": "2026-02-03T12:30:00.000Z"
}
```

**文件上传**

使用`multipart/form-data`格式上传文件：

```bash
curl -X POST https://api.yyc3.com/v1/files/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@/path/to/file.pdf" \
  -F "path=/documents" \
  -F "metadata={\"author\":\"John Doe\"}"
```

### 查询参数

**基本查询参数**

```
GET /v1/resources?param1=value1&param2=value2
```

**数组参数**

```
GET /v1/resources?tags=tag1,tag2,tag3
```

**对象参数**

```
GET /v1/resources?filter[field1]=value1&filter[field2]=value2
```

**URL编码**

特殊字符需要进行URL编码：

```
GET /v1/search?q=hello%20world
```

## 响应格式

### 成功响应

**标准成功响应**

```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**分页响应**

```json
{
  "success": true,
  "data": {
    "items": [
      // 数据项
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
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### HTTP状态码

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 请求成功，无返回内容 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器错误 |
| 503 | Service Unavailable | 服务不可用 |

### 响应头

**标准响应头**

```http
X-Request-ID: abc123
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
Content-Type: application/json
Content-Length: 1024
```

## 错误处理

### 错误响应格式

**标准错误响应**

```json
{
  "success": false,
  "error": {
    "code": "E001",
    "message": "资源不存在",
    "details": {
      "resource": "user",
      "resourceId": "user-123"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

### 错误代码

**通用错误**

| 错误代码 | 描述 | HTTP状态码 |
|----------|------|------------|
| E001 | 资源不存在 | 404 |
| E002 | 参数无效 | 400 |
| E003 | 认证失败 | 401 |
| E004 | 权限不足 | 403 |
| E005 | 资源冲突 | 409 |
| E006 | 请求过于频繁 | 429 |
| E007 | 服务器错误 | 500 |
| E008 | 服务不可用 | 503 |

### 错误处理最佳实践

**JavaScript/TypeScript**

```typescript
import { YYC3Client, APIError } from '@yyc3/sdk';

const client = new YYC3Client({
  apiKey: 'YOUR_API_KEY'
});

try {
  const response = await client.ai.chat({
    model: 'gpt-4',
    messages: [{ role: 'user', content: '你好' }]
  });
  console.log(response.choices[0].message.content);
} catch (error) {
  if (error instanceof APIError) {
    // 处理API错误
    switch (error.code) {
      case 'E001':
        console.error('资源不存在:', error.message);
        break;
      case 'E006':
        console.error('请求过于频繁，请稍后重试');
        break;
      default:
        console.error('API错误:', error.message);
    }
  } else {
    // 处理其他错误
    console.error('未知错误:', error);
  }
}
```

**Python**

```python
from yyc3 import YYC3Client, APIError

client = YYC3Client(api_key='YOUR_API_KEY')

try:
    response = client.ai.chat(
        model='gpt-4',
        messages=[{'role': 'user', 'content': '你好'}]
    )
    print(response.choices[0].message.content)
except APIError as e:
    # 处理API错误
    if e.code == 'E001':
        print(f'资源不存在: {e.message}')
    elif e.code == 'E006':
        print('请求过于频繁，请稍后重试')
    else:
        print(f'API错误: {e.message}')
except Exception as e:
    # 处理其他错误
    print(f'未知错误: {e}')
```

### 重试策略

**指数退避重试**

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// 使用示例
const response = await retryWithBackoff(() => 
  client.ai.chat({
    model: 'gpt-4',
    messages: [{ role: 'user', content: '你好' }]
  })
);
```

## 分页

### 分页参数

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|---------|------|
| page | number | 否 | 1 | 页码 |
| limit | number | 否 | 20 | 每页数量 |

**请求示例**

```
GET /v1/users?page=2&limit=50
```

### 分页响应

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 50,
      "total": 150,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

### 游标分页

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| cursor | string | 否 | 游标 |
| limit | number | 否 | 每页数量 |

**请求示例**

```
GET /v1/logs?cursor=abc123&limit=100
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "cursor": "def456",
      "hasNext": true
    }
  }
}
```

## 过滤和排序

### 过滤

**基本过滤**

```
GET /v1/users?status=active
```

**多条件过滤**

```
GET /v1/users?status=active&role=admin
```

**范围过滤**

```
GET /v1/users?createdAt[gte]=2026-01-01&createdAt[lte]=2026-12-31
```

**数组过滤**

```
GET /v1/users?tags=tag1,tag2,tag3
```

**对象过滤**

```
GET /v1/users?filter[name]=John&filter[age]=30
```

### 排序

**基本排序**

```
GET /v1/users?sortBy=name&sortOrder=asc
```

**多字段排序**

```
GET /v1/users?sortBy=createdAt,name&sortOrder=desc,asc
```

**排序参数**

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|---------|------|
| sortBy | string | 否 | createdAt | 排序字段 |
| sortOrder | string | 否 | desc | 排序方向：asc、desc |

## 流式响应

### Server-Sent Events (SSE)

**请求示例**

```bash
curl -X POST https://api.yyc3.com/v1/ai/chat/stream \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": true
  }'
```

**响应格式**

```
data: {"id":"chat-abc123","choices":[{"delta":{"content":"你"},"finish_reason":null}]}

data: {"id":"chat-abc123","choices":[{"delta":{"content":"好"},"finish_reason":null}]}

data: {"id":"chat-abc123","choices":[{"delta":{},"finish_reason":"stop"}]}
```

**JavaScript处理**

```typescript
async function streamChat(messages: Message[]) {
  const response = await fetch('https://api.yyc3.com/v1/ai/chat/stream', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      stream: true
    })
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        const delta = data.choices[0].delta;
        if (delta.content) {
          fullContent += delta.content;
          console.log(delta.content);
        }
      }
    }
  }

  return fullContent;
}
```

**Python处理**

```python
import requests
import json

def stream_chat(messages):
    response = requests.post(
        'https://api.yyc3.com/v1/ai/chat/stream',
        headers={
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-4',
            'messages': messages,
            'stream': True
        },
        stream=True
    )

    full_content = ''
    for line in response.iter_lines():
        if line.startswith(b'data: '):
            data = json.loads(line[6:])
            delta = data['choices'][0]['delta']
            if 'content' in delta:
                full_content += delta['content']
                print(delta['content'])

    return full_content
```

## 批量操作

### 批量创建

**请求示例**

```bash
curl -X POST https://api.yyc3.com/v1/users/batch \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {"name": "John Doe", "email": "john@example.com"},
      {"name": "Jane Smith", "email": "jane@example.com"}
    ]
  }'
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "items": [
      {"id": "user-1", "name": "John Doe"},
      {"id": "user-2", "name": "Jane Smith"}
    ]
  }
}
```

### 批量更新

**请求示例**

```bash
curl -X PATCH https://api.yyc3.com/v1/users/batch \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"id": "user-1", "status": "active"},
      {"id": "user-2", "status": "active"}
    ]
  }'
```

### 批量删除

**请求示例**

```bash
curl -X DELETE https://api.yyc3.com/v1/users/batch \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["user-1", "user-2"]
  }'
```

## 限流和配额

### 限流规则

**速率限制**

| 层级 | 请求/分钟 | 请求/小时 | 请求/天 |
|------|-----------|------------|----------|
| 免费 | 60 | 1000 | 10000 |
| 基础 | 600 | 10000 | 100000 |
| 专业 | 6000 | 100000 | 1000000 |
| 企业 | 60000 | 1000000 | 10000000 |

**响应头**

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

### 处理限流

**JavaScript/TypeScript**

```typescript
async function makeRequestWithRateLimit() {
  try {
    const response = await fetch('https://api.yyc3.com/v1/ai/chat', {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    });

    if (response.status === 429) {
      const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
      const waitTime = Math.max(0, resetTime * 1000 - Date.now());
      
      console.log(`请求过于频繁，等待 ${waitTime}ms 后重试`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      return makeRequestWithRateLimit();
    }

    return response.json();
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}
```

### 配额管理

**查询配额**

```bash
curl -X GET https://api.yyc3.com/v1/quota \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "overall": {
      "limit": 1000000,
      "used": 500000,
      "remaining": 500000,
      "resetAt": "2026-03-01T00:00:00.000Z"
    },
    "byService": {
      "ai": {
        "limit": 800000,
        "used": 400000,
        "remaining": 400000
      },
      "storage": {
        "limit": 200000,
        "used": 100000,
        "remaining": 100000
      }
    }
  }
}
```

## 最佳实践

### 1. 性能优化

**使用连接池**

```typescript
import { Agent } from 'undici';

const agent = new Agent({
  keepAliveTimeout: 60000,
  keepAliveMaxTimeout: 300000
});

const response = await fetch('https://api.yyc3.com/v1/ai/chat', {
  dispatcher: agent,
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
```

**批量请求**

```typescript
// 不好的做法：串行请求
for (const userId of userIds) {
  const user = await getUser(userId);
}

// 好的做法：并行请求
const users = await Promise.all(
  userIds.map(userId => getUser(userId))
);
```

### 2. 错误处理

**日志记录**

```typescript
function logError(error: Error, context: any) {
  console.error({
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
}
```

**监控和告警**

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN'
});

try {
  const response = await makeAPIRequest();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### 3. 安全考虑

**输入验证**

```typescript
function validateInput(input: string): boolean {
  // 验证输入长度
  if (input.length > 10000) {
    return false;
  }
  
  // 验证输入内容
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}
```

**输出编码**

```typescript
function encodeOutput(output: string): string {
  return output
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

### 4. 测试

**单元测试**

```typescript
import { describe, it, expect } from 'vitest';
import { YYC3Client } from '@yyc3/sdk';

describe('YYC3Client', () => {
  it('should create chat completion', async () => {
    const client = new YYC3Client({
      apiKey: 'test-api-key'
    });
    
    const response = await client.ai.chat({
      model: 'gpt-4',
      messages: [{ role: 'user', content: '你好' }]
    });
    
    expect(response.choices).toHaveLength(1);
    expect(response.choices[0].message.content).toBeDefined();
  });
});
```

**集成测试**

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { YYC3Client } from '@yyc3/sdk';

describe('API Integration Tests', () => {
  let client: YYC3Client;
  
  beforeAll(() => {
    client = new YYC3Client({
      apiKey: process.env.TEST_API_KEY
    });
  });
  
  it('should authenticate successfully', async () => {
    const response = await client.auth.login({
      username: 'test-user',
      password: 'test-password'
    });
    
    expect(response.success).toBe(true);
    expect(response.data.tokens).toBeDefined();
  });
});
```

## 常见问题

### Q1: 如何处理API密钥泄露？

**A:** 
1. 立即在控制台撤销泄露的API密钥
2. 创建新的API密钥
3. 更新所有使用该密钥的应用
4. 审查API使用日志，确认是否有异常使用

### Q2: 如何提高API请求速率限制？

**A:** 
1. 升级到更高的订阅计划
2. 联系销售团队定制企业方案
3. 优化请求逻辑，减少不必要的请求
4. 使用批量操作减少请求次数

### Q3: 如何调试API请求？

**A:** 
1. 检查请求头是否正确
2. 验证请求体格式是否正确
3. 查看响应中的错误详情
4. 使用`X-Request-ID`追踪请求
5. 启用详细日志记录

### Q4: 如何处理大文件上传？

**A:** 
1. 使用分片上传功能
2. 实现断点续传
3. 显示上传进度
4. 处理网络中断和重试

### Q5: 如何优化API响应时间？

**A:** 
1. 使用CDN加速请求
2. 实施缓存策略
3. 使用批量操作
4. 选择合适的数据中心
5. 优化网络连接

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
