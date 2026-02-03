# 第三方集成 API 文档

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 第三方集成 API 提供与主流第三方服务和平台的集成能力，实现无缝的数据交换和功能扩展。

## 概述

第三方集成 API 支持与各种第三方服务和平台集成，包括云服务、数据库、消息队列、监控系统、身份认证提供商等。

### 核心特性

- **多种集成类型**：支持多种第三方服务集成
- **统一接口**：提供统一的集成接口和管理方式
- **安全认证**：支持多种认证方式（OAuth、API Key、JWT）
- **实时同步**：支持实时数据同步和事件推送
- **灵活配置**：支持自定义集成配置和映射规则
- **监控告警**：集成状态监控和异常告警

### 支持的集成类型

| 集成类型 | 支持的服务 | 示例 |
|---------|-----------|------|
| 云存储 | AWS S3、Azure Blob、Google Cloud Storage | 文件存储和备份 |
| 数据库 | MySQL、PostgreSQL、MongoDB、Redis | 数据存储和缓存 |
| 消息队列 | Kafka、RabbitMQ、AWS SQS | 异步消息处理 |
| 监控系统 | Prometheus、Grafana、Datadog | 系统监控和告警 |
| 身份认证 | OAuth 2.0、LDAP、SAML | 用户认证和授权 |
| 通知服务 | SendGrid、Twilio、阿里云短信 | 邮件和短信通知 |
| AI 服务 | OpenAI、Anthropic、Google AI | AI 模型集成 |
| CI/CD | GitHub Actions、GitLab CI、Jenkins | 持续集成和部署 |

---

## 集成管理

### 创建集成

创建新的第三方集成。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:create`

**请求体**

```json
{
  "name": "AWS S3 集成",
  "description": "用于文件存储和备份",
  "type": "storage",
  "provider": "aws-s3",
  "config": {
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-east-1",
    "bucket": "yyc3-backup-bucket"
  },
  "auth": {
    "type": "api-key",
    "credentials": {
      "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
      "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    }
  },
  "options": {
    "autoSync": true,
    "syncInterval": 3600,
    "enableEncryption": true,
    "encryptionAlgorithm": "AES256"
  },
  "metadata": {
    "environment": "production",
    "team": "backend"
  }
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| name | string | 是 | 集成名称 |
| description | string | 否 | 集成描述 |
| type | string | 是 | 集成类型 |
| provider | string | 是 | 服务提供商 |
| config | object | 是 | 集成配置 |
| auth | object | 是 | 认证配置 |
| options | object | 否 | 集成选项 |
| metadata | object | 否 | 元数据 |

**响应**

- **成功 (201)**

```json
{
  "success": true,
  "data": {
    "id": "int-abc123",
    "name": "AWS S3 集成",
    "description": "用于文件存储和备份",
    "type": "storage",
    "provider": "aws-s3",
    "status": "active",
    "config": {
      "region": "us-east-1",
      "bucket": "yyc3-backup-bucket"
    },
    "options": {
      "autoSync": true,
      "syncInterval": 3600,
      "enableEncryption": true,
      "encryptionAlgorithm": "AES256"
    },
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
    "code": "INVALID_INTEGRATION_CONFIG",
    "message": "无效的集成配置",
    "details": {
      "field": "config.region",
      "reason": "Invalid AWS region"
    }
  }
}
```

### 获取集成列表

获取所有已创建的集成。

**请求**

- **方法**: `GET`
- **路径**: `/v1/integrations`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:read`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| type | string | 否 | 按集成类型过滤 |
| status | string | 否 | 按状态过滤 (active/inactive) |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "int-abc123",
        "name": "AWS S3 集成",
        "type": "storage",
        "provider": "aws-s3",
        "status": "active",
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

### 获取集成详情

获取指定集成的详细信息。

**请求**

- **方法**: `GET`
- **路径**: `/v1/integrations/{integrationId}`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:read`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": "int-abc123",
    "name": "AWS S3 集成",
    "description": "用于文件存储和备份",
    "type": "storage",
    "provider": "aws-s3",
    "status": "active",
    "config": {
      "region": "us-east-1",
      "bucket": "yyc3-backup-bucket"
    },
    "options": {
      "autoSync": true,
      "syncInterval": 3600,
      "enableEncryption": true,
      "encryptionAlgorithm": "AES256"
    },
    "metadata": {
      "environment": "production",
      "team": "backend"
    },
    "stats": {
      "totalRequests": 1250,
      "successfulRequests": 1240,
      "failedRequests": 10,
      "successRate": 0.992,
      "lastSyncAt": "2026-02-03T09:00:00.000Z"
    },
    "createdAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

### 更新集成

更新集成配置。

**请求**

- **方法**: `PATCH`
- **路径**: `/v1/integrations/{integrationId}`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:update`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**请求体**

```json
{
  "config": {
    "region": "us-west-2",
    "bucket": "yyc3-backup-bucket-new"
  },
  "options": {
    "autoSync": false
  }
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": "int-abc123",
    "name": "AWS S3 集成",
    "type": "storage",
    "provider": "aws-s3",
    "status": "active",
    "config": {
      "region": "us-west-2",
      "bucket": "yyc3-backup-bucket-new"
    },
    "options": {
      "autoSync": false,
      "syncInterval": 3600,
      "enableEncryption": true,
      "encryptionAlgorithm": "AES256"
    },
    "updatedAt": "2026-02-03T11:00:00.000Z"
  }
}
```

### 删除集成

删除集成配置。

**请求**

- **方法**: `DELETE`
- **路径**: `/v1/integrations/{integrationId}`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:delete`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**响应**

- **成功 (204)**

无响应体

---

## 集成操作

### 测试集成

测试集成连接是否正常。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/{integrationId}/test`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:test`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**请求体**

```json
{
  "operation": "connect",
  "params": {
    "timeout": 30000
  }
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "testId": "test-abc123",
    "status": "success",
    "message": "连接成功",
    "latency": 125,
    "testedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

- **错误 (400)**

```json
{
  "success": false,
  "error": {
    "code": "CONNECTION_FAILED",
    "message": "连接失败",
    "details": {
      "reason": "Invalid credentials",
      "retryable": true
    }
  }
}
```

### 同步数据

手动触发数据同步。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/{integrationId}/sync`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:sync`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**请求体**

```json
{
  "direction": "bidirectional",
  "filters": {
    "resourceType": ["users", "files"],
    "modifiedSince": "2026-02-01T00:00:00.000Z"
  },
  "options": {
    "fullSync": false,
    "batchSize": 100,
    "conflictResolution": "prefer-local"
  }
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| direction | string | 是 | 同步方向 (pull/push/bidirectional) |
| filters | object | 否 | 同步过滤条件 |
| options | object | 否 | 同步选项 |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "syncId": "sync-abc123",
    "status": "in_progress",
    "direction": "bidirectional",
    "startedAt": "2026-02-03T10:00:00.000Z",
    "estimatedCompletion": "2026-02-03T10:05:00.000Z"
  }
}
```

### 获取同步状态

获取数据同步状态。

**请求**

- **方法**: `GET`
- **路径**: `/v1/integrations/{integrationId}/sync/{syncId}`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:sync`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |
| syncId | string | 是 | 同步 ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "syncId": "sync-abc123",
    "status": "completed",
    "direction": "bidirectional",
    "progress": {
      "total": 1000,
      "processed": 1000,
      "failed": 5,
      "percentage": 100
    },
    "results": {
      "pulled": 500,
      "pushed": 495,
      "conflicts": 5
    },
    "startedAt": "2026-02-03T10:00:00.000Z",
    "completedAt": "2026-02-03T10:04:30.000Z",
    "duration": 270000
  }
}
```

---

## 集成认证

### OAuth 2.0 认证

使用 OAuth 2.0 进行第三方服务认证。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/oauth/authorize`
- **认证**: Bearer Token (API Key)

**请求体**

```json
{
  "provider": "github",
  "clientId": "your-client-id",
  "redirectUri": "https://your-app.com/callback",
  "scopes": ["repo", "user"],
  "state": "random-state-string"
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://github.com/login/oauth/authorize?client_id=your-client-id&redirect_uri=https://your-app.com/callback&scope=repo%20user&state=random-state-string",
    "state": "random-state-string"
  }
}
```

### OAuth 回调

处理 OAuth 回调。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/oauth/callback`
- **认证**: Bearer Token (API Key)

**请求体**

```json
{
  "provider": "github",
  "code": "authorization-code-from-provider",
  "state": "random-state-string"
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "accessToken": "gho_xxxxxxxxxxxx",
    "refreshToken": "ghr_xxxxxxxxxxxx",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "scope": ["repo", "user"]
  }
}
```

### 刷新令牌

刷新 OAuth 访问令牌。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/oauth/refresh`
- **认证**: Bearer Token (API Key)

**请求体**

```json
{
  "provider": "github",
  "refreshToken": "ghr_xxxxxxxxxxxx"
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "accessToken": "gho_yyyyyyyyyyyy",
    "refreshToken": "ghr_yyyyyyyyyyyy",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "scope": ["repo", "user"]
  }
}
```

---

## 云存储集成

### 上传文件

上传文件到云存储。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/{integrationId}/storage/upload`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:storage:upload`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**请求体** (multipart/form-data)

```
file: [文件]
path: /documents/2026/02
name: document.pdf
metadata: {"author": "John Doe", "version": "1.0.0"}
options: {"encrypt": true, "compress": false}
```

**响应**

- **成功 (201)**

```json
{
  "success": true,
  "data": {
    "fileId": "file-abc123",
    "path": "/documents/2026/02/document.pdf",
    "url": "https://yyc3-backup-bucket.s3.amazonaws.com/documents/2026/02/document.pdf",
    "size": 1024000,
    "contentType": "application/pdf",
    "etag": "abc123...",
    "uploadedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

### 下载文件

从云存储下载文件。

**请求**

- **方法**: `GET`
- **路径**: `/v1/integrations/{integrationId}/storage/download`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:storage:download`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| path | string | 是 | 文件路径 |
| versionId | string | 否 | 文件版本 ID |

**响应**

- **成功 (200)**

返回文件内容

### 列出文件

列出云存储中的文件。

**请求**

- **方法**: `GET`
- **路径**: `/v1/integrations/{integrationId}/storage/files`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:storage:read`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| path | string | 否 | 路径前缀，默认 / |
| recursive | boolean | 否 | 是否递归列出，默认 false |
| limit | number | 否 | 返回数量限制，默认 100 |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "fileId": "file-abc123",
        "path": "/documents/2026/02/document.pdf",
        "size": 1024000,
        "contentType": "application/pdf",
        "lastModified": "2026-02-03T10:00:00.000Z"
      }
    ],
    "pagination": {
      "limit": 100,
      "truncated": false
    }
  }
}
```

---

## 数据库集成

### 执行查询

执行数据库查询。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/{integrationId}/database/query`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:database:query`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**请求体**

```json
{
  "query": "SELECT * FROM users WHERE status = :status AND created_at > :created_at",
  "params": {
    "status": "active",
    "created_at": "2026-01-01T00:00:00.000Z"
  },
  "options": {
    "timeout": 30000,
    "limit": 100,
    "offset": 0
  }
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "status": "active",
        "created_at": "2026-01-15T10:00:00.000Z"
      }
    ],
    "rowCount": 1,
    "executionTime": 125
  }
}
```

### 执行命令

执行数据库命令（INSERT、UPDATE、DELETE）。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/{integrationId}/database/execute`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:database:execute`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**请求体**

```json
{
  "command": "INSERT INTO users (name, email, status) VALUES (:name, :email, :status)",
  "params": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "status": "active"
  },
  "options": {
    "timeout": 30000
  }
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "affectedRows": 1,
    "insertId": "user-456",
    "executionTime": 50
  }
}
```

---

## 消息队列集成

### 发送消息

发送消息到消息队列。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/{integrationId}/messaging/send`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:messaging:send`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**请求体**

```json
{
  "topic": "user-events",
  "message": {
    "eventType": "user.created",
    "userId": "user-123",
    "timestamp": "2026-02-03T10:00:00.000Z"
  },
  "options": {
    "key": "user-123",
    "partition": 0,
    "headers": {
      "X-Event-Type": "user.created"
    }
  }
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "messageId": "msg-abc123",
    "topic": "user-events",
    "partition": 0,
    "offset": 12345,
    "timestamp": "2026-02-03T10:00:00.000Z"
  }
}
```

### 接收消息

从消息队列接收消息。

**请求**

- **方法**: `GET`
- **路径**: `/v1/integrations/{integrationId}/messaging/receive`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:messaging:receive`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| topic | string | 是 | 主题名称 |
| consumerGroup | string | 否 | 消费者组 |
| maxMessages | number | 否 | 最大消息数，默认 10 |
| timeout | number | 否 | 超时时间（毫秒），默认 5000 |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg-abc123",
        "topic": "user-events",
        "partition": 0,
        "offset": 12345,
        "key": "user-123",
        "value": {
          "eventType": "user.created",
          "userId": "user-123"
        },
        "headers": {
          "X-Event-Type": "user.created"
        },
        "timestamp": "2026-02-03T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 监控和告警

### 获取集成状态

获取集成运行状态。

**请求**

- **方法**: `GET`
- **路径**: `/v1/integrations/{integrationId}/status`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:read`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "integrationId": "int-abc123",
    "status": "healthy",
    "healthChecks": {
      "connection": "healthy",
      "authentication": "healthy",
      "performance": "healthy"
    },
    "metrics": {
      "uptime": 99.99,
      "avgResponseTime": 125,
      "errorRate": 0.01,
      "lastErrorAt": null
    },
    "checkedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

### 配置告警

配置集成告警规则。

**请求**

- **方法**: `POST`
- **路径**: `/v1/integrations/{integrationId}/alerts`
- **认证**: Bearer Token (API Key)
- **权限**: `integration:alert:manage`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| integrationId | string | 是 | 集成 ID |

**请求体**

```json
{
  "name": "集成连接失败告警",
  "description": "当集成连接失败时发送告警",
  "condition": {
    "metric": "connection.status",
    "operator": "eq",
    "value": "unhealthy"
  },
  "actions": [
    {
      "type": "email",
      "recipients": ["admin@example.com"],
      "template": "integration-failure"
    },
    {
      "type": "webhook",
      "url": "https://your-app.com/webhooks/alerts",
      "payload": {
        "integrationId": "{{integrationId}}",
        "message": "{{message}}"
      }
    }
  ],
  "options": {
    "cooldown": 300,
    "severity": "high"
  }
}
```

**响应**

- **成功 (201)**

```json
{
  "success": true,
  "data": {
    "alertId": "alert-abc123",
    "name": "集成连接失败告警",
    "condition": {
      "metric": "connection.status",
      "operator": "eq",
      "value": "unhealthy"
    },
    "actions": [
      {
        "type": "email",
        "recipients": ["admin@example.com"]
      }
    ],
    "options": {
      "cooldown": 300,
      "severity": "high"
    },
    "createdAt": "2026-02-03T10:00:00.000Z"
  }
}
```

---

## 最佳实践

### 1. 安全配置

妥善管理集成凭证。

```json
{
  "auth": {
    "type": "oauth2",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret"
  }
}
```

### 2. 错误处理

妥善处理集成错误。

```typescript
try {
  const result = await integration.sync();
  console.log('Sync completed:', result);
} catch (error) {
  console.error('Sync failed:', error);
  if (error.retryable) {
    // 重试逻辑
    await retry(() => integration.sync(), { maxAttempts: 3 });
  }
}
```

### 3. 性能优化

优化集成性能。

```json
{
  "options": {
    "batchSize": 100,
    "parallelism": 5,
    "timeout": 30000
  }
}
```

### 4. 监控告警

配置适当的监控和告警。

```json
{
  "alerts": [
    {
      "condition": {
        "metric": "errorRate",
        "operator": "gt",
        "value": 0.05
      },
      "severity": "high"
    }
  ]
}
```

---

## 常见问题

### Q: 如何处理集成凭证？

A: 使用加密存储和密钥管理服务保护凭证。

### Q: 集成失败时如何处理？

A: 实现自动重试机制和告警通知。

### Q: 如何优化集成性能？

A: 使用批量操作、并行处理和缓存策略。

### Q: 集成数据如何同步？

A: 使用增量同步和冲突解决策略。

### Q: 如何监控集成状态？

A: 使用健康检查和监控指标跟踪集成状态。

---

## 支持与反馈

如有问题或建议，请联系：

- **邮箱**: integrations@yyc3.com
- **文档**: https://docs.yyc3.com/integrations
- **GitHub**: https://github.com/yyc3/integrations

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
