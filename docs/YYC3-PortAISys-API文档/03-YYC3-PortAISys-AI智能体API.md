# YYC³ PortAISys - AI智能体API

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

- [AI智能体API概述](#ai智能体api概述)
- [AI对话](#ai对话)
- [AI推理](#ai推理)
- [模型管理](#模型管理)
- [知识库管理](#知识库管理)
- [提示词管理](#提示词管理)
- [流式输出](#流式输出)

---

## AI智能体API概述

### API简介

YYC³ PortAISys AI智能体API提供完整的AI功能，包括AI对话、AI推理、模型管理、知识库管理和提示词管理等功能。支持多种AI模型，包括GPT-4、Claude-3、Gemini-Pro等。

### 支持的模型

| 模型 | 描述 | 上下文长度 | 价格 |
|------|------|-----------|------|
| **gpt-4** | OpenAI GPT-4 | 8192 | $0.03/1K tokens |
| **gpt-4-turbo** | OpenAI GPT-4 Turbo | 128000 | $0.01/1K tokens |
| **claude-3** | Anthropic Claude-3 | 200000 | $0.015/1K tokens |
| **gemini-pro** | Google Gemini Pro | 32000 | $0.002/1K tokens |
| **yyc3-ai** | YYC³ 自研模型 | 64000 | $0.001/1K tokens |

### 功能特性

- 多模型支持
- 流式输出
- 上下文管理
- 知识库集成
- 提示词模板
- 多轮对话
- 函数调用
- 图像理解

---

## AI对话

### 创建对话

**端点**: `POST /v1/ai/chat`

**描述**: 创建新的AI对话。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
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
  "maxTokens": 2000,
  "stream": false,
  "functions": [
    {
      "name": "search_database",
      "description": "搜索数据库中的信息",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "搜索查询"
          }
        },
        "required": ["query"]
      }
    }
  ]
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **model** | string | 是 | AI模型名称 |
| **messages** | array | 是 | 对话消息数组 |
| **temperature** | number | 否 | 温度参数，0-2，默认0.7 |
| **maxTokens** | number | 否 | 最大生成token数，默认2048 |
| **stream** | boolean | 否 | 是否流式输出，默认false |
| **functions** | array | 否 | 可调用的函数列表 |
| **knowledgeBaseId** | string | 否 | 知识库ID |
| **promptTemplateId** | string | 否 | 提示词模板ID |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "chat-123",
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
      "promptTokens": 50,
      "completionTokens": 150,
      "totalTokens": 200
    },
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "AI对话成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**流式响应** (200):

```
data: {"id": "chat-123", "choices": [{"index": 0, "delta": {"content": "YYC³"}}]}
data: {"id": "chat-123", "choices": [{"index": 0, "delta": {"content": "（"}}]}
data: {"id": "chat-123", "choices": [{"index": 0, "delta": {"content": "YanYuCloudCube"}}]}
data: [DONE]
```

### 继续对话

**端点**: `POST /v1/ai/chat/{chatId}/continue`

**描述**: 继续已有的对话。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "message": "YYC³有哪些核心功能？"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **message** | string | 是 | 用户消息 |
| **temperature** | number | 否 | 温度参数，0-2 |
| **maxTokens** | number | 否 | 最大生成token数 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "chat-123",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "YYC³系统具有以下核心功能：\n1. 智能AI浮窗系统\n2. 五维闭环系统..."
        },
        "finishReason": "stop"
      }
    ],
    "usage": {
      "promptTokens": 100,
      "completionTokens": 200,
      "totalTokens": 300
    }
  },
  "message": "对话继续成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取对话历史

**端点**: `GET /v1/ai/chat/{chatId}`

**描述**: 获取对话历史记录。

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
    "id": "chat-123",
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "你是一个有用的AI助手。"
      },
      {
        "role": "user",
        "content": "你好，请介绍一下YYC³系统。"
      },
      {
        "role": "assistant",
        "content": "YYC³（YanYuCloudCube）是一个基于云原生架构的便携式智能AI系统..."
      }
    ],
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:05:00.000Z"
  },
  "message": "获取对话历史成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## AI推理

### 文本推理

**端点**: `POST /v1/ai/inference/text`

**描述**: 执行文本推理任务。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "model": "gpt-4",
  "task": "summarization",
  "input": "这是一段很长的文本，需要总结...",
  "parameters": {
    "maxLength": 200,
    "temperature": 0.5
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **model** | string | 是 | AI模型名称 |
| **task** | string | 是 | 推理任务类型（summarization、translation、classification、extraction） |
| **input** | string | 是 | 输入文本 |
| **parameters** | object | 否 | 任务参数 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "inference-123",
    "task": "summarization",
    "result": "YYC³是一个基于云原生架构的便携式智能AI系统，提供高性能AI服务。",
    "model": "gpt-4",
    "usage": {
      "promptTokens": 500,
      "completionTokens": 50,
      "totalTokens": 550
    },
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "文本推理成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 图像推理

**端点**: `POST /v1/ai/inference/image`

**描述**: 执行图像推理任务。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
X-Request-ID: <unique-request-id>
```

**请求体**:

```
model: gpt-4-vision
task: description
image: <binary>
parameters: {"detail": "high"}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **model** | string | 是 | AI模型名称 |
| **task** | string | 是 | 推理任务类型（description、classification、detection） |
| **image** | file | 是 | 图像文件 |
| **parameters** | object | 否 | 任务参数 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "inference-456",
    "task": "description",
    "result": "这是一张显示办公室场景的照片，有多人在工作...",
    "model": "gpt-4-vision",
    "usage": {
      "promptTokens": 1000,
      "completionTokens": 100,
      "totalTokens": 1100
    },
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "图像推理成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 模型管理

### 列出可用模型

**端点**: `GET /v1/ai/models`

**描述**: 获取所有可用的AI模型。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **provider** | string | 否 | 模型提供商（openai、anthropic、google、yyc3） |
| **type** | string | 否 | 模型类型（text、image、audio） |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "gpt-4",
        "name": "GPT-4",
        "provider": "openai",
        "type": "text",
        "contextLength": 8192,
        "pricing": {
          "prompt": 0.03,
          "completion": 0.06
        },
        "capabilities": [
          "chat",
          "completion",
          "function_calling"
        ]
      },
      {
        "id": "claude-3",
        "name": "Claude-3",
        "provider": "anthropic",
        "type": "text",
        "contextLength": 200000,
        "pricing": {
          "prompt": 0.015,
          "completion": 0.075
        },
        "capabilities": [
          "chat",
          "completion",
          "analysis"
        ]
      }
    ]
  },
  "message": "获取模型列表成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取模型详情

**端点**: `GET /v1/ai/models/{modelId}`

**描述**: 获取指定模型的详细信息。

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
    "id": "gpt-4",
    "name": "GPT-4",
    "provider": "openai",
    "type": "text",
    "contextLength": 8192,
    "pricing": {
      "prompt": 0.03,
      "completion": 0.06
    },
    "capabilities": [
      "chat",
      "completion",
      "function_calling"
    ],
    "description": "GPT-4是OpenAI最先进的语言模型，具有强大的理解和生成能力。",
    "version": "0613",
    "status": "available"
  },
  "message": "获取模型详情成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 知识库管理

### 创建知识库

**端点**: `POST /v1/ai/knowledge-bases`

**描述**: 创建新的知识库。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "产品文档",
  "description": "YYC³产品相关文档",
  "type": "document",
  "settings": {
    "chunkSize": 1000,
    "chunkOverlap": 200,
    "embeddingModel": "text-embedding-ada-002"
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | 知识库名称 |
| **description** | string | 否 | 知识库描述 |
| **type** | string | 是 | 知识库类型（document、url、database） |
| **settings** | object | 否 | 知识库设置 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "kb-123",
    "name": "产品文档",
    "description": "YYC³产品相关文档",
    "type": "document",
    "settings": {
      "chunkSize": 1000,
      "chunkOverlap": 200,
      "embeddingModel": "text-embedding-ada-002"
    },
    "status": "creating",
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "知识库创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 上传文档到知识库

**端点**: `POST /v1/ai/knowledge-bases/{kbId}/documents`

**描述**: 上传文档到指定知识库。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
X-Request-ID: <unique-request-id>
```

**请求体**:

```
file: <binary>
metadata: {"title": "产品手册", "tags": ["产品", "手册"]}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "doc-456",
    "knowledgeBaseId": "kb-123",
    "filename": "产品手册.pdf",
    "size": 1024000,
    "status": "processing",
    "metadata": {
      "title": "产品手册",
      "tags": ["产品", "手册"]
    },
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "文档上传成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 查询知识库

**端点**: `POST /v1/ai/knowledge-bases/{kbId}/query`

**描述**: 查询知识库获取相关信息。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "query": "YYC³系统有哪些功能？",
  "topK": 5,
  "threshold": 0.7
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **query** | string | 是 | 查询文本 |
| **topK** | number | 否 | 返回最相关的K个结果，默认5 |
| **threshold** | number | 否 | 相似度阈值，0-1，默认0.7 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "documentId": "doc-456",
        "content": "YYC³系统具有以下核心功能：1. 智能AI浮窗系统...",
        "score": 0.95,
        "metadata": {
          "title": "产品手册",
          "tags": ["产品", "手册"]
        }
      },
      {
        "documentId": "doc-789",
        "content": "YYC³的五维闭环系统包括：分析、执行、优化...",
        "score": 0.88,
        "metadata": {
          "title": "功能介绍",
          "tags": ["功能", "介绍"]
        }
      }
    ]
  },
  "message": "知识库查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 提示词管理

### 创建提示词模板

**端点**: `POST /v1/ai/prompt-templates`

**描述**: 创建新的提示词模板。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "代码生成助手",
  "description": "用于生成代码的提示词模板",
  "category": "coding",
  "template": "你是一个专业的{{language}}开发助手。请根据以下需求生成代码：\n\n需求：{{requirements}}\n\n请提供完整的代码实现，包括必要的注释和错误处理。",
  "variables": [
    {
      "name": "language",
      "type": "select",
      "description": "编程语言",
      "options": ["JavaScript", "Python", "Java", "Go"],
      "default": "JavaScript"
    },
    {
      "name": "requirements",
      "type": "text",
      "description": "代码需求",
      "required": true
    }
  ]
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | 模板名称 |
| **description** | string | 否 | 模板描述 |
| **category** | string | 是 | 模板分类 |
| **template** | string | 是 | 模板内容，使用{{variable}}语法 |
| **variables** | array | 是 | 模板变量定义 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "template-123",
    "name": "代码生成助手",
    "description": "用于生成代码的提示词模板",
    "category": "coding",
    "template": "你是一个专业的{{language}}开发助手。请根据以下需求生成代码：\n\n需求：{{requirements}}\n\n请提供完整的代码实现，包括必要的注释和错误处理。",
    "variables": [
      {
        "name": "language",
        "type": "select",
        "description": "编程语言",
        "options": ["JavaScript", "Python", "Java", "Go"],
        "default": "JavaScript"
      },
      {
        "name": "requirements",
        "type": "text",
        "description": "代码需求",
        "required": true
      }
    ],
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "提示词模板创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 使用提示词模板

**端点**: `POST /v1/ai/prompt-templates/{templateId}/use`

**描述**: 使用指定的提示词模板。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "variables": {
    "language": "Python",
    "requirements": "实现一个快速排序算法"
  },
  "model": "gpt-4"
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "chat-789",
    "templateId": "template-123",
    "prompt": "你是一个专业的Python开发助手。请根据以下需求生成代码：\n\n需求：实现一个快速排序算法\n\n请提供完整的代码实现，包括必要的注释和错误处理。",
    "response": "以下是Python快速排序算法的实现：\n\n```python\ndef quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n```\n\n这个实现使用了递归方法，时间复杂度为O(n log n)。",
    "model": "gpt-4",
    "usage": {
      "promptTokens": 150,
      "completionTokens": 200,
      "totalTokens": 350
    }
  },
  "message": "提示词模板使用成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 流式输出

### Server-Sent Events (SSE)

**端点**: `GET /v1/ai/chat/stream`

**描述**: 使用SSE进行流式AI对话。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Accept: text/event-stream
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **model** | string | 是 | AI模型名称 |
| **message** | string | 是 | 用户消息 |
| **temperature** | number | 否 | 温度参数 |

**响应格式**:

```
event: message
data: {"id": "chat-123", "choices": [{"index": 0, "delta": {"content": "YYC³"}}]}

event: message
data: {"id": "chat-123", "choices": [{"index": 0, "delta": {"content": "（"}}]}

event: message
data: {"id": "chat-123", "choices": [{"index": 0, "delta": {"content": "YanYuCloudCube"}}]}

event: done
data: {"id": "chat-123", "usage": {"promptTokens": 50, "completionTokens": 150, "totalTokens": 200}}
```

### WebSocket

**端点**: `wss://api.yyc3.com/v1/ai/chat/ws`

**描述**: 使用WebSocket进行实时AI对话。

**连接参数**:

```json
{
  "token": "<your-jwt-token>",
  "model": "gpt-4",
  "temperature": 0.7
}
```

**消息格式**:

```json
{
  "type": "message",
  "content": "你好，请介绍一下YYC³系统。"
}
```

**响应格式**:

```json
{
  "type": "delta",
  "content": "YYC³"
}

{
  "type": "delta",
  "content": "（"
}

{
  "type": "delta",
  "content": "YanYuCloudCube"
}

{
  "type": "done",
  "usage": {
    "promptTokens": 50,
    "completionTokens": 150,
    "totalTokens": 200
  }
}
```

---

## 最佳实践

### 性能优化

1. **使用流式输出**: 对于长文本生成，使用流式输出提升用户体验
2. **合理设置温度**: 根据任务类型合理设置temperature参数
3. **控制上下文长度**: 避免过长的上下文导致性能下降
4. **使用知识库**: 对于特定领域问题，使用知识库提升准确性
5. **缓存结果**: 对于相同问题，缓存结果减少API调用

### 成本控制

1. **选择合适模型**: 根据任务需求选择合适的模型
2. **限制Token使用**: 设置maxTokens控制成本
3. **使用提示词模板**: 优化提示词减少Token消耗
4. **监控使用量**: 定期监控API使用量和成本
5. **实施速率限制**: 实施客户端速率限制

### 安全考虑

1. **输入验证**: 验证所有用户输入，防止注入攻击
2. **输出过滤**: 过滤AI输出的敏感信息
3. **访问控制**: 实施适当的访问控制
4. **审计日志**: 记录所有AI调用用于审计
5. **内容审核**: 对AI输出进行内容审核

---

## 下一步

- [工作流API](./04-工作流API.md) - 学习工作流相关API
- [数据分析API](./05-数据分析API.md) - 学习数据分析API
- [模型管理API](./14-模型管理API.md) - 学习模型管理API

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
