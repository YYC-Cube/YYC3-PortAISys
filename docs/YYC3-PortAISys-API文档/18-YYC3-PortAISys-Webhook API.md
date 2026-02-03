# Webhook API 文档

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys Webhook API 提供事件驱动的通知机制，允许您订阅系统事件并接收实时通知。

## 概述

Webhook API 允许您将应用程序与 YYC³ PortAISys 集成，当特定事件发生时，系统会向您配置的端点发送 HTTP POST 请求。

### 核心特性

- **实时事件通知**：即时接收系统事件
- **多种事件类型**：支持多种业务事件订阅
- **灵活配置**：自定义事件过滤和重试策略
- **安全验证**：HMAC 签名验证确保数据安全
- **高可靠性**：自动重试和失败通知机制

### 事件类型

| 事件类型 | 描述 | 触发条件 |
|---------|------|---------|
| `ai.chat.completed` | AI 对话完成 | AI 对话响应生成完成 |
| `ai.chat.error` | AI 对话错误 | AI 对话过程中发生错误 |
| `workflow.started` | 工作流启动 | 工作流开始执行 |
| `workflow.completed` | 工作流完成 | 工作流执行完成 |
| `workflow.failed` | 工作流失败 | 工作流执行失败 |
| `model.deployed` | 模型部署 | 模型部署成功 |
| `model.scaling` | 模型扩缩容 | 模型实例数量变化 |
| `user.created` | 用户创建 | 新用户注册 |
| `user.deleted` | 用户删除 | 用户账户删除 |
| `file.uploaded` | 文件上传 | 文件上传完成 |
| `file.processed` | 文件处理 | 文件处理完成 |
| `training.started` | 训练开始 | 模型训练任务启动 |
| `training.completed` | 训练完成 | 模型训练任务完成 |
| `training.failed` | 训练失败 | 模型训练任务失败 |
| `system.alert` | 系统告警 | 系统触发告警 |

---

## Webhook 配置

### 创建 Webhook

创建新的 Webhook 配置。

**请求**

- **方法**: `POST`
- **路径**: `/v1/webhooks`
- **认证**: Bearer Token (API Key)

**请求体**

```json
{
  "name": "AI对话完成通知",
  "description": "当AI对话完成时发送通知",
  "url": "https://your-app.com/webhooks/yyc3",
  "events": [
    "ai.chat.completed",
    "ai.chat.error"
  ],
  "secret": "your-webhook-secret",
  "active": true,
  "headers": {
    "X-Custom-Header": "custom-value"
  },
  "retryConfig": {
    "maxRetries": 3,
    "retryDelay": 1000,
    "backoffMultiplier": 2
  },
  "timeout": 10000,
  "metadata": {
    "environment": "production",
    "team": "backend"
  }
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| name | string | 是 | Webhook 名称 |
| description | string | 否 | Webhook 描述 |
| url | string | 是 | 接收通知的 URL |
| events | array | 是 | 订阅的事件类型列表 |
| secret | string | 是 | 用于签名验证的密钥 |
| active | boolean | 否 | 是否激活，默认 true |
| headers | object | 否 | 自定义请求头 |
| retryConfig | object | 否 | 重试配置 |
| timeout | number | 否 | 请求超时时间（毫秒），默认 10000 |
| metadata | object | 否 | 元数据 |

**响应**

- **成功 (201)**

```json
{
  "success": true,
  "data": {
    "id": "webhook-abc123",
    "name": "AI对话完成通知",
    "description": "当AI对话完成时发送通知",
    "url": "https://your-app.com/webhooks/yyc3",
    "events": [
      "ai.chat.completed",
      "ai.chat.error"
    ],
    "active": true,
    "retryConfig": {
      "maxRetries": 3,
      "retryDelay": 1000,
      "backoffMultiplier": 2
    },
    "timeout": 10000,
    "metadata": {
      "environment": "production",
      "team": "backend"
    },
    "createdAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

- **错误 (400)**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_WEBHOOK_URL",
    "message": "无效的 Webhook URL",
    "details": {
      "url": "https://your-app.com/webhooks/yyc3"
    }
  }
}
```

### 获取 Webhook 列表

获取所有 Webhook 配置。

**请求**

- **方法**: `GET`
- **路径**: `/v1/webhooks`
- **认证**: Bearer Token (API Key)

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| active | boolean | 否 | 按激活状态过滤 |
| event | string | 否 | 按事件类型过滤 |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": "webhook-abc123",
        "name": "AI对话完成通知",
        "url": "https://your-app.com/webhooks/yyc3",
        "events": ["ai.chat.completed"],
        "active": true,
        "createdAt": "2026-02-03T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 获取 Webhook 详情

获取指定 Webhook 的详细信息。

**请求**

- **方法**: `GET`
- **路径**: `/v1/webhooks/{webhookId}`
- **认证**: Bearer Token (API Key)

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| webhookId | string | 是 | Webhook ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": "webhook-abc123",
    "name": "AI对话完成通知",
    "description": "当AI对话完成时发送通知",
    "url": "https://your-app.com/webhooks/yyc3",
    "events": [
      "ai.chat.completed",
      "ai.chat.error"
    ],
    "active": true,
    "headers": {
      "X-Custom-Header": "custom-value"
    },
    "retryConfig": {
      "maxRetries": 3,
      "retryDelay": 1000,
      "backoffMultiplier": 2
    },
    "timeout": 10000,
    "metadata": {
      "environment": "production",
      "team": "backend"
    },
    "stats": {
      "totalDelivered": 1250,
      "totalFailed": 5,
      "successRate": 0.996
    },
    "createdAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

### 更新 Webhook

更新 Webhook 配置。

**请求**

- **方法**: `PATCH`
- **路径**: `/v1/webhooks/{webhookId}`
- **认证**: Bearer Token (API Key)

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| webhookId | string | 是 | Webhook ID |

**请求体**

```json
{
  "active": false,
  "events": ["ai.chat.completed"]
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": "webhook-abc123",
    "name": "AI对话完成通知",
    "url": "https://your-app.com/webhooks/yyc3",
    "events": ["ai.chat.completed"],
    "active": false,
    "updatedAt": "2026-02-03T11:00:00.000Z"
  }
}
```

### 删除 Webhook

删除 Webhook 配置。

**请求**

- **方法**: `DELETE`
- **路径**: `/v1/webhooks/{webhookId}`
- **认证**: Bearer Token (API Key)

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| webhookId | string | 是 | Webhook ID |

**响应**

- **成功 (204)**

无响应体

---

## Webhook 事件

### 事件格式

所有 Webhook 事件都遵循以下格式：

```json
{
  "id": "evt-abc123",
  "event": "ai.chat.completed",
  "timestamp": "2026-02-03T10:00:00.000Z",
  "data": {
    // 事件特定数据
  },
  "signature": "sha256=abc123..."
}
```

### AI 对话完成事件

当 AI 对话完成时触发。

**事件类型**: `ai.chat.completed`

**事件数据**

```json
{
  "id": "evt-abc123",
  "event": "ai.chat.completed",
  "timestamp": "2026-02-03T10:00:00.000Z",
  "data": {
    "chatId": "chat-xyz789",
    "userId": "user-123",
    "model": "gpt-4",
    "message": {
      "role": "assistant",
      "content": "这是AI的回复内容..."
    },
    "usage": {
      "promptTokens": 150,
      "completionTokens": 300,
      "totalTokens": 450
    },
    "latency": 1250
  }
}
```

### AI 对话错误事件

当 AI 对话过程中发生错误时触发。

**事件类型**: `ai.chat.error`

**事件数据**

```json
{
  "id": "evt-abc123",
  "event": "ai.chat.error",
  "timestamp": "2026-02-03T10:00:00.000Z",
  "data": {
    "chatId": "chat-xyz789",
    "userId": "user-123",
    "model": "gpt-4",
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "请求频率超限",
      "details": {
        "limit": 100,
        "remaining": 0,
        "resetAt": "2026-02-03T11:00:00.000Z"
      }
    }
  }
}
```

### 工作流启动事件

当工作流开始执行时触发。

**事件类型**: `workflow.started`

**事件数据**

```json
{
  "id": "evt-abc123",
  "event": "workflow.started",
  "timestamp": "2026-02-03T10:00:00.000Z",
  "data": {
    "workflowId": "wf-xyz789",
    "workflowName": "数据处理工作流",
    "userId": "user-123",
    "input": {
      "fileId": "file-abc123",
      "options": {
        "format": "json",
        "validate": true
      }
    }
  }
}
```

### 工作流完成事件

当工作流执行完成时触发。

**事件类型**: `workflow.completed`

**事件数据**

```json
{
  "id": "evt-abc123",
  "event": "workflow.completed",
  "timestamp": "2026-02-03T10:05:00.000Z",
  "data": {
    "workflowId": "wf-xyz789",
    "workflowName": "数据处理工作流",
    "userId": "user-123",
    "status": "completed",
    "output": {
      "resultFileId": "file-def456",
      "recordsProcessed": 1000,
      "recordsFailed": 0
    },
    "duration": 300000
  }
}
```

### 模型部署事件

当模型部署成功时触发。

**事件类型**: `model.deployed`

**事件数据**

```json
{
  "id": "evt-abc123",
  "event": "model.deployed",
  "timestamp": "2026-02-03T10:00:00.000Z",
  "data": {
    "modelId": "model-xyz789",
    "modelName": "bert-base-chinese",
    "version": "1.0.0",
    "deploymentId": "deploy-abc123",
    "endpoint": "https://api.yyc3.com/v1/models/model-xyz789/inference",
    "instanceCount": 2,
    "instanceType": "gpu.a100.large"
  }
}
```

### 训练完成事件

当模型训练任务完成时触发。

**事件类型**: `training.completed`

**事件数据**

```json
{
  "id": "evt-abc123",
  "event": "training.completed",
  "timestamp": "2026-02-03T15:00:00.000Z",
  "data": {
    "trainingJobId": "train-xyz789",
    "modelId": "model-abc123",
    "modelName": "custom-bert",
    "status": "completed",
    "metrics": {
      "accuracy": 0.95,
      "loss": 0.05,
      "f1Score": 0.94
    },
    "duration": 3600000,
    "outputModelId": "model-def456"
  }
}
```

---

## 签名验证

### HMAC 签名

为确保 Webhook 请求的真实性，YYC³ 使用 HMAC-SHA256 签名。

**签名计算**

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  const expectedSignature = `sha256=${digest}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**使用示例**

```typescript
import express from 'express';

const app = express();

app.post('/webhooks/yyc3', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-yyc3-signature'] as string;
  const payload = req.body;
  const secret = 'your-webhook-secret';
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = JSON.parse(payload);
  console.log('Received event:', event.event);
  
  res.status(200).send('OK');
});
```

---

## 重试机制

### 重试策略

当 Webhook 请求失败时，系统会自动重试。

**重试配置**

| 参数 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| maxRetries | number | 3 | 最大重试次数 |
| retryDelay | number | 1000 | 初始重试延迟（毫秒） |
| backoffMultiplier | number | 2 | 退避乘数 |

**重试延迟计算**

```
重试延迟 = 初始延迟 × (退避乘数 ^ 重试次数)
```

**示例**

- 第 1 次重试：1000ms
- 第 2 次重试：2000ms
- 第 3 次重试：4000ms

### 失败处理

当所有重试失败后，系统会记录失败事件并发送通知。

**失败事件**

```json
{
  "id": "evt-abc123",
  "event": "webhook.delivery_failed",
  "timestamp": "2026-02-03T10:00:00.000Z",
  "data": {
    "webhookId": "webhook-xyz789",
    "originalEvent": {
      "id": "evt-def456",
      "event": "ai.chat.completed"
    },
    "error": {
      "code": "CONNECTION_TIMEOUT",
      "message": "连接超时"
    },
    "retryCount": 3,
    "lastAttemptAt": "2026-02-03T10:00:00.000Z"
  }
}
```

---

## 最佳实践

### 1. 快速响应

Webhook 端点应该快速响应（< 5 秒），避免超时。

```typescript
app.post('/webhooks/yyc3', async (req, res) => {
  // 快速返回 200
  res.status(200).send('OK');
  
  // 异步处理事件
  processEventAsync(req.body);
});
```

### 2. 幂等性处理

确保重复事件不会导致重复操作。

```typescript
const processedEvents = new Set();

async function processEvent(event: any) {
  const eventId = event.id;
  
  if (processedEvents.has(eventId)) {
    return; // 已处理，跳过
  }
  
  processedEvents.add(eventId);
  
  // 处理事件
  await handleEvent(event);
}
```

### 3. 错误处理

妥善处理各种错误情况。

```typescript
app.post('/webhooks/yyc3', (req, res) => {
  try {
    const event = req.body;
    
    if (!event.event || !event.data) {
      return res.status(400).json({ error: 'Invalid event format' });
    }
    
    processEvent(event);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
});
```

### 4. 安全验证

始终验证签名和来源。

```typescript
function validateWebhook(req: express.Request): boolean {
  const signature = req.headers['x-yyc3-signature'] as string;
  const payload = req.body;
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!signature || !secret) {
    return false;
  }
  
  return verifyWebhookSignature(payload, signature, secret);
}
```

### 5. 日志记录

记录所有 Webhook 事件以便调试。

```typescript
app.post('/webhooks/yyc3', (req, res) => {
  const event = req.body;
  
  console.log('Webhook received:', {
    id: event.id,
    event: event.event,
    timestamp: event.timestamp
  });
  
  // 处理事件
  processEvent(event);
  
  res.status(200).send('OK');
});
```

---

## 监控和调试

### Webhook 日志

查看 Webhook 交付日志。

**请求**

- **方法**: `GET`
- **路径**: `/v1/webhooks/{webhookId}/logs`
- **认证**: Bearer Token (API Key)

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| limit | number | 否 | 返回数量，默认 50 |
| status | string | 否 | 按状态过滤 (success/failed) |

**响应**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-abc123",
        "eventId": "evt-xyz789",
        "status": "success",
        "statusCode": 200,
        "responseTime": 125,
        "attempt": 1,
        "timestamp": "2026-02-03T10:00:00.000Z"
      }
    ]
  }
}
```

### 测试 Webhook

发送测试事件到 Webhook 端点。

**请求**

- **方法**: `POST`
- **路径**: `/v1/webhooks/{webhookId}/test`
- **认证**: Bearer Token (API Key)

**请求体**

```json
{
  "eventType": "ai.chat.completed",
  "testData": {
    "chatId": "test-chat-123",
    "message": {
      "role": "assistant",
      "content": "测试消息"
    }
  }
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "testId": "test-abc123",
    "status": "delivered",
    "statusCode": 200,
    "responseTime": 125
  }
}
```

---

## 速率限制

Webhook 请求遵循以下速率限制：

| 限制类型 | 限制值 |
|---------|--------|
| 每秒请求数 | 10 |
| 每分钟请求数 | 600 |
| 每小时请求数 | 10000 |

超过限制时，系统会返回 `429 Too Many Requests` 响应。

---

## 常见问题

### Q: 如何处理重复的 Webhook 事件？

A: 使用事件 ID 实现幂等性处理，记录已处理的事件 ID。

### Q: Webhook 请求超时怎么办？

A: 系统会自动重试，最多重试 3 次。建议优化端点响应时间。

### Q: 如何验证 Webhook 签名？

A: 使用 HMAC-SHA256 算法和您的 Webhook Secret 验证签名。

### Q: 可以订阅多个事件吗？

A: 可以，在创建 Webhook 时指定多个事件类型。

### Q: 如何调试 Webhook 问题？

A: 查看 Webhook 日志和使用测试功能验证端点配置。

---

## 支持与反馈

如有问题或建议，请联系：

- **邮箱**: support@yyc3.com
- **文档**: https://docs.yyc3.com
- **GitHub**: https://github.com/yyc3/portaisys

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
