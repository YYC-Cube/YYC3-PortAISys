---
@file: 04-YYC3-PortAISys-工作流API.md
@description: YYC³ PortAISys 工作流 API 文档，提供工作流创建、执行、管理和监控功能
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

# YYC³ PortAISys - 工作流API


## 📋 目录

- [工作流API概述](#工作流api概述)
- [工作流管理](#工作流管理)
- [工作流执行](#工作流执行)
- [工作流模板](#工作流模板)
- [工作流监控](#工作流监控)
- [工作流集成](#工作流集成)

---

## 工作流API概述

### API简介

YYC³ PortAISys工作流API提供完整的工作流管理功能，包括工作流创建、编辑、执行、监控和集成等功能。支持可视化工作流设计、节点编排、条件分支、循环、并行执行等高级功能。

### 核心功能

- **工作流设计**: 可视化工作流设计器
- **节点编排**: 支持多种节点类型（AI、数据处理、条件、循环等）
- **执行引擎**: 高性能工作流执行引擎
- **监控告警**: 实时监控和告警
- **版本管理**: 工作流版本控制
- **集成能力**: 支持第三方服务集成

### 支持的节点类型

| 节点类型 | 描述 | 适用场景 |
|---------|------|----------|
| **AI节点** | AI推理和对话 | AI任务处理 |
| **数据节点** | 数据处理和转换 | 数据清洗、格式转换 |
| **条件节点** | 条件判断和分支 | 业务逻辑分支 |
| **循环节点** | 循环执行 | 批量处理 |
| **并行节点** | 并行执行 | 性能优化 |
| **HTTP节点** | HTTP请求 | 第三方服务调用 |
| **数据库节点** | 数据库操作 | 数据持久化 |
| **Webhook节点** | Webhook触发 | 事件驱动 |

---

## 工作流管理

### 创建工作流

**端点**: `POST /v1/workflows`

**描述**: 创建新的工作流。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "AI内容生成工作流",
  "description": "使用AI生成内容并保存到数据库",
  "category": "ai",
  "nodes": [
    {
      "id": "node-1",
      "type": "input",
      "name": "输入节点",
      "config": {
        "fields": [
          {
            "name": "topic",
            "type": "text",
            "label": "主题",
            "required": true
          },
          {
            "name": "length",
            "type": "number",
            "label": "长度",
            "default": 500
          }
        ]
      }
    },
    {
      "id": "node-2",
      "type": "ai",
      "name": "AI生成",
      "config": {
        "model": "gpt-4",
        "prompt": "请根据以下主题生成一篇{{length}}字的文章：{{topic}}",
        "temperature": 0.7,
        "maxTokens": 1000
      }
    },
    {
      "id": "node-3",
      "type": "database",
      "name": "保存到数据库",
      "config": {
        "operation": "insert",
        "table": "articles",
        "data": {
          "title": "{{topic}}",
          "content": "{{node-2.output}}",
          "createdAt": "{{now}}"
        }
      }
    },
    {
      "id": "node-4",
      "type": "output",
      "name": "输出节点",
      "config": {
        "fields": [
          {
            "name": "articleId",
            "value": "{{node-3.output.id}}"
          },
          {
            "name": "content",
            "value": "{{node-2.output}}"
          }
        ]
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    },
    {
      "id": "edge-2",
      "source": "node-2",
      "target": "node-3"
    },
    {
      "id": "edge-3",
      "source": "node-3",
      "target": "node-4"
    }
  ],
  "settings": {
    "timeout": 300,
    "retryPolicy": {
      "maxRetries": 3,
      "retryDelay": 1000
    },
    "notification": {
      "onSuccess": true,
      "onFailure": true,
      "webhook": "https://your-app.com/webhook"
    }
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | 工作流名称 |
| **description** | string | 否 | 工作流描述 |
| **category** | string | 否 | 工作流分类 |
| **nodes** | array | 是 | 工作流节点数组 |
| **edges** | array | 是 | 工作流边（连接）数组 |
| **settings** | object | 否 | 工作流设置 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "workflow-123",
    "name": "AI内容生成工作流",
    "description": "使用AI生成内容并保存到数据库",
    "category": "ai",
    "version": 1,
    "status": "draft",
    "nodes": [
      {
        "id": "node-1",
        "type": "input",
        "name": "输入节点",
        "config": {}
      },
      {
        "id": "node-2",
        "type": "ai",
        "name": "AI生成",
        "config": {}
      },
      {
        "id": "node-3",
        "type": "database",
        "name": "保存到数据库",
        "config": {}
      },
      {
        "id": "node-4",
        "type": "output",
        "name": "输出节点",
        "config": {}
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-1",
        "target": "node-2"
      },
      {
        "id": "edge-2",
        "source": "node-2",
        "target": "node-3"
      },
      {
        "id": "edge-3",
        "source": "node-3",
        "target": "node-4"
      }
    ],
    "settings": {
      "timeout": 300,
      "retryPolicy": {
        "maxRetries": 3,
        "retryDelay": 1000
      },
      "notification": {
        "onSuccess": true,
        "onFailure": true,
        "webhook": "https://your-app.com/webhook"
      }
    },
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "工作流创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 更新工作流

**端点**: `PUT /v1/workflows/{workflowId}`

**描述**: 更新指定的工作流。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "AI内容生成工作流（更新版）",
  "description": "使用AI生成内容并保存到数据库",
  "nodes": [
    {
      "id": "node-1",
      "type": "input",
      "name": "输入节点",
      "config": {}
    },
    {
      "id": "node-2",
      "type": "ai",
      "name": "AI生成",
      "config": {
        "model": "gpt-4-turbo",
        "prompt": "请根据以下主题生成一篇{{length}}字的文章：{{topic}}",
        "temperature": 0.8,
        "maxTokens": 2000
      }
    },
    {
      "id": "node-3",
      "type": "database",
      "name": "保存到数据库",
      "config": {}
    },
    {
      "id": "node-4",
      "type": "output",
      "name": "输出节点",
      "config": {}
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    },
    {
      "id": "edge-2",
      "source": "node-2",
      "target": "node-3"
    },
    {
      "id": "edge-3",
      "source": "node-3",
      "target": "node-4"
    }
  ]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "workflow-123",
    "name": "AI内容生成工作流（更新版）",
    "description": "使用AI生成内容并保存到数据库",
    "version": 2,
    "status": "draft",
    "nodes": [],
    "edges": [],
    "settings": {},
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "工作流更新成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 列出工作流

**端点**: `GET /v1/workflows`

**描述**: 获取工作流列表。

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
| **category** | string | 否 | 工作流分类 |
| **status** | string | 否 | 工作流状态（draft、active、archived） |
| **search** | string | 否 | 搜索关键词 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "workflow-123",
        "name": "AI内容生成工作流",
        "description": "使用AI生成内容并保存到数据库",
        "category": "ai",
        "version": 1,
        "status": "active",
        "nodeCount": 4,
        "executionCount": 150,
        "lastExecutedAt": "2026-02-03T12:00:00.000Z",
        "createdAt": "2026-02-01T12:00:00.000Z",
        "updatedAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "workflow-456",
        "name": "数据处理工作流",
        "description": "数据处理和转换",
        "category": "data",
        "version": 2,
        "status": "active",
        "nodeCount": 6,
        "executionCount": 89,
        "lastExecutedAt": "2026-02-03T11:00:00.000Z",
        "createdAt": "2026-01-28T12:00:00.000Z",
        "updatedAt": "2026-02-02T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取工作流详情

**端点**: `GET /v1/workflows/{workflowId}`

**描述**: 获取指定工作流的详细信息。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "workflow-123",
    "name": "AI内容生成工作流",
    "description": "使用AI生成内容并保存到数据库",
    "category": "ai",
    "version": 1,
    "status": "active",
    "nodes": [
      {
        "id": "node-1",
        "type": "input",
        "name": "输入节点",
        "config": {
          "fields": [
            {
              "name": "topic",
              "type": "text",
              "label": "主题",
              "required": true
            },
            {
              "name": "length",
              "type": "number",
              "label": "长度",
              "default": 500
            }
          ]
        }
      },
      {
        "id": "node-2",
        "type": "ai",
        "name": "AI生成",
        "config": {
          "model": "gpt-4",
          "prompt": "请根据以下主题生成一篇{{length}}字的文章：{{topic}}",
          "temperature": 0.7,
          "maxTokens": 1000
        }
      },
      {
        "id": "node-3",
        "type": "database",
        "name": "保存到数据库",
        "config": {
          "operation": "insert",
          "table": "articles",
          "data": {
            "title": "{{topic}}",
            "content": "{{node-2.output}}",
            "createdAt": "{{now}}"
          }
        }
      },
      {
        "id": "node-4",
        "type": "output",
        "name": "输出节点",
        "config": {
          "fields": [
            {
              "name": "articleId",
              "value": "{{node-3.output.id}}"
            },
            {
              "name": "content",
              "value": "{{node-2.output}}"
            }
          ]
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-1",
        "target": "node-2"
      },
      {
        "id": "edge-2",
        "source": "node-2",
        "target": "node-3"
      },
      {
        "id": "edge-3",
        "source": "node-3",
        "target": "node-4"
      }
    ],
    "settings": {
      "timeout": 300,
      "retryPolicy": {
        "maxRetries": 3,
        "retryDelay": 1000
      },
      "notification": {
        "onSuccess": true,
        "onFailure": true,
        "webhook": "https://your-app.com/webhook"
      }
    },
    "stats": {
      "totalExecutions": 150,
      "successfulExecutions": 145,
      "failedExecutions": 5,
      "averageExecutionTime": 15.5,
      "lastExecutedAt": "2026-02-03T12:00:00.000Z"
    },
    "createdAt": "2026-02-01T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "获取工作流详情成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 删除工作流

**端点**: `DELETE /v1/workflows/{workflowId}`

**描述**: 删除指定的工作流。

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
  "message": "工作流删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 工作流执行

### 执行工作流

**端点**: `POST /v1/workflows/{workflowId}/execute`

**描述**: 执行指定的工作流。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "input": {
    "topic": "人工智能的未来",
    "length": 1000
  },
  "options": {
    "async": false,
    "webhook": "https://your-app.com/webhook"
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **input** | object | 是 | 工作流输入数据 |
| **options** | object | 否 | 执行选项 |
| **options.async** | boolean | 否 | 是否异步执行，默认false |
| **options.webhook** | string | 否 | 完成后通知的webhook URL |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "executionId": "exec-123",
    "workflowId": "workflow-123",
    "status": "completed",
    "input": {
      "topic": "人工智能的未来",
      "length": 1000
    },
    "output": {
      "articleId": "article-456",
      "content": "人工智能（AI）作为21世纪最重要的技术之一..."
    },
    "executionTime": 12.5,
    "nodes": [
      {
        "id": "node-1",
        "name": "输入节点",
        "status": "completed",
        "executionTime": 0.1,
        "output": {
          "topic": "人工智能的未来",
          "length": 1000
        }
      },
      {
        "id": "node-2",
        "name": "AI生成",
        "status": "completed",
        "executionTime": 11.5,
        "output": "人工智能（AI）作为21世纪最重要的技术之一..."
      },
      {
        "id": "node-3",
        "name": "保存到数据库",
        "status": "completed",
        "executionTime": 0.5,
        "output": {
          "id": "article-456"
        }
      },
      {
        "id": "node-4",
        "name": "输出节点",
        "status": "completed",
        "executionTime": 0.1,
        "output": {
          "articleId": "article-456",
          "content": "人工智能（AI）作为21世纪最重要的技术之一..."
        }
      }
    ],
    "startedAt": "2026-02-03T12:00:00.000Z",
    "completedAt": "2026-02-03T12:00:12.500Z"
  },
  "message": "工作流执行成功",
  "timestamp": "2026-02-03T12:00:12.500Z"
}
```

### 异步执行工作流

**端点**: `POST /v1/workflows/{workflowId}/execute`

**描述**: 异步执行指定的工作流。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "input": {
    "topic": "人工智能的未来",
    "length": 1000
  },
  "options": {
    "async": true,
    "webhook": "https://your-app.com/webhook"
  }
}
```

**成功响应** (202):

```json
{
  "success": true,
  "data": {
    "executionId": "exec-123",
    "workflowId": "workflow-123",
    "status": "running",
    "input": {
      "topic": "人工智能的未来",
      "length": 1000
    },
    "startedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "工作流已开始执行",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取执行状态

**端点**: `GET /v1/workflows/{workflowId}/executions/{executionId}`

**描述**: 获取工作流执行状态。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "executionId": "exec-123",
    "workflowId": "workflow-123",
    "status": "running",
    "input": {
      "topic": "人工智能的未来",
      "length": 1000
    },
    "output": null,
    "executionTime": 5.2,
    "nodes": [
      {
        "id": "node-1",
        "name": "输入节点",
        "status": "completed",
        "executionTime": 0.1,
        "output": {
          "topic": "人工智能的未来",
          "length": 1000
        }
      },
      {
        "id": "node-2",
        "name": "AI生成",
        "status": "running",
        "executionTime": 5.1,
        "output": null
      },
      {
        "id": "node-3",
        "name": "保存到数据库",
        "status": "pending",
        "executionTime": 0,
        "output": null
      },
      {
        "id": "node-4",
        "name": "输出节点",
        "status": "pending",
        "executionTime": 0,
        "output": null
      }
    ],
    "startedAt": "2026-02-03T12:00:00.000Z",
    "completedAt": null
  },
  "message": "获取执行状态成功",
  "timestamp": "2026-02-03T12:00:05.200Z"
}
```

### 取消执行

**端点**: `POST /v1/workflows/{workflowId}/executions/{executionId}/cancel`

**描述**: 取消正在执行的工作流。

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
    "executionId": "exec-123",
    "workflowId": "workflow-123",
    "status": "cancelled",
    "cancelledAt": "2026-02-03T12:00:10.000Z"
  },
  "message": "工作流执行已取消",
  "timestamp": "2026-02-03T12:00:10.000Z"
}
```

---

## 工作流模板

### 创建工作流模板

**端点**: `POST /v1/workflow-templates`

**描述**: 创建新的工作流模板。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "AI内容生成模板",
  "description": "使用AI生成内容的工作流模板",
  "category": "ai",
  "nodes": [
    {
      "id": "node-1",
      "type": "input",
      "name": "输入节点",
      "config": {
        "fields": [
          {
            "name": "topic",
            "type": "text",
            "label": "主题",
            "required": true
          },
          {
            "name": "length",
            "type": "number",
            "label": "长度",
            "default": 500
          }
        ]
      }
    },
    {
      "id": "node-2",
      "type": "ai",
      "name": "AI生成",
      "config": {
        "model": "gpt-4",
        "prompt": "请根据以下主题生成一篇{{length}}字的文章：{{topic}}",
        "temperature": 0.7,
        "maxTokens": 1000
      }
    },
    {
      "id": "node-3",
      "type": "output",
      "name": "输出节点",
      "config": {
        "fields": [
          {
            "name": "content",
            "value": "{{node-2.output}}"
          }
        ]
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    },
    {
      "id": "edge-2",
      "source": "node-2",
      "target": "node-3"
    }
  ],
  "isPublic": true
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "template-123",
    "name": "AI内容生成模板",
    "description": "使用AI生成内容的工作流模板",
    "category": "ai",
    "nodes": [],
    "edges": [],
    "isPublic": true,
    "usageCount": 0,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "工作流模板创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 从模板创建工作流

**端点**: `POST /v1/workflow-templates/{templateId}/create-workflow`

**描述**: 从模板创建工作流。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "我的AI内容生成工作流",
  "description": "从模板创建的工作流"
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "workflow-789",
    "name": "我的AI内容生成工作流",
    "description": "从模板创建的工作流",
    "templateId": "template-123",
    "nodes": [],
    "edges": [],
    "status": "draft",
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "从模板创建工作流成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 工作流监控

### 获取执行历史

**端点**: `GET /v1/workflows/{workflowId}/executions`

**描述**: 获取工作流的执行历史。

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
| **status** | string | 否 | 执行状态（running、completed、failed、cancelled） |
| **startDate** | string | 否 | 开始日期 |
| **endDate** | string | 否 | 结束日期 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "executionId": "exec-123",
        "workflowId": "workflow-123",
        "status": "completed",
        "executionTime": 12.5,
        "startedAt": "2026-02-03T12:00:00.000Z",
        "completedAt": "2026-02-03T12:00:12.500Z"
      },
      {
        "executionId": "exec-456",
        "workflowId": "workflow-123",
        "status": "failed",
        "executionTime": 5.2,
        "startedAt": "2026-02-03T11:00:00.000Z",
        "completedAt": "2026-02-03T11:00:05.200Z",
        "error": {
          "code": "E401",
          "message": "工作流执行失败",
          "nodeId": "node-2"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取工作流统计

**端点**: `GET /v1/workflows/{workflowId}/stats`

**描述**: 获取工作流的统计信息。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **period** | string | 否 | 统计周期（day、week、month、year），默认week |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "workflowId": "workflow-123",
    "period": "week",
    "stats": {
      "totalExecutions": 150,
      "successfulExecutions": 145,
      "failedExecutions": 5,
      "cancelledExecutions": 0,
      "successRate": 96.67,
      "averageExecutionTime": 15.5,
      "minExecutionTime": 10.2,
      "maxExecutionTime": 25.8
    },
    "dailyStats": [
      {
        "date": "2026-01-28",
        "executions": 20,
        "successful": 19,
        "failed": 1,
        "averageExecutionTime": 14.5
      },
      {
        "date": "2026-01-29",
        "executions": 22,
        "successful": 22,
        "failed": 0,
        "averageExecutionTime": 15.2
      }
    ],
    "nodeStats": [
      {
        "nodeId": "node-1",
        "nodeName": "输入节点",
        "averageExecutionTime": 0.1,
        "successRate": 100
      },
      {
        "nodeId": "node-2",
        "nodeName": "AI生成",
        "averageExecutionTime": 14.8,
        "successRate": 96.67
      }
    ]
  },
  "message": "获取统计信息成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 工作流集成

### 创建Webhook

**端点**: `POST /v1/workflows/{workflowId}/webhooks`

**描述**: 为工作流创建Webhook。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "执行完成通知",
  "url": "https://your-app.com/webhook/workflow-completed",
  "events": [
    "workflow.completed",
    "workflow.failed"
  ],
  "headers": {
    "Authorization": "Bearer your-secret-token"
  },
  "secret": "webhook-secret-123"
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "webhook-123",
    "workflowId": "workflow-123",
    "name": "执行完成通知",
    "url": "https://your-app.com/webhook/workflow-completed",
    "events": [
      "workflow.completed",
      "workflow.failed"
    ],
    "headers": {
      "Authorization": "Bearer your-secret-token"
    },
    "secret": "webhook-secret-123",
    "status": "active",
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "Webhook创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 删除Webhook

**端点**: `DELETE /v1/workflows/{workflowId}/webhooks/{webhookId}`

**描述**: 删除指定的Webhook。

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
  "message": "Webhook删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 最佳实践

### 工作流设计

1. **模块化设计**: 将复杂工作流拆分为多个小模块
2. **错误处理**: 为每个节点配置适当的错误处理
3. **超时设置**: 为长时间运行的节点设置合理的超时
4. **重试策略**: 为易失败的节点配置重试策略
5. **日志记录**: 记录关键节点的输入输出用于调试

### 性能优化

1. **并行执行**: 使用并行节点提升性能
2. **缓存结果**: 缓存重复计算的结果
3. **批量处理**: 使用批量操作减少API调用
4. **异步执行**: 对于长时间运行的工作流使用异步执行
5. **资源限制**: 设置合理的资源限制防止过度消耗

### 安全考虑

1. **输入验证**: 验证所有输入数据
2. **敏感信息**: 不要在工作流中硬编码敏感信息
3. **访问控制**: 实施适当的访问控制
4. **审计日志**: 记录所有工作流执行
5. **数据加密**: 加密敏感数据

---

## 下一步

- [AI智能体API](./03-AI智能体API.md) - 学习AI相关API
- [数据分析API](./05-数据分析API.md) - 学习数据分析API
- [用户管理API](./06-用户管理API.md) - 学习用户管理API

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
