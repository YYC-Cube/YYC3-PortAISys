# 推理服务API

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 推理服务API文档

## 概述

推理服务API提供完整的AI模型推理功能，支持实时推理、批量推理、流式推理、多模态推理、函数调用和推理结果缓存等高级功能。

## 功能特性

- ✅ 实时推理（单次请求）
- ✅ 批量推理（批量处理）
- ✅ 流式推理（实时输出）
- ✅ 多模态推理（文本、图像、音频）
- ✅ 函数调用（工具使用）
- ✅ 推理结果缓存
- ✅ 推理性能监控
- ✅ 推理成本统计
- ✅ 推理日志记录
- ✅ 推理限流和配额管理

## 认证

所有推理服务API都需要认证。使用Bearer Token认证方式：

```http
Authorization: Bearer <access_token>
```

## API端点

### 1. 文本推理

#### 1.1 文本生成

生成文本内容。

**请求**

```http
POST /v1/inference/text/generate
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "model": "gpt-4",
  "prompt": "请写一篇关于人工智能的文章",
  "maxTokens": 2000,
  "temperature": 0.7,
  "topP": 0.9,
  "topK": 40,
  "frequencyPenalty": 0.5,
  "presencePenalty": 0.5,
  "stopSequences": ["\n\n", "###"],
  "stream": false,
  "options": {
    "useCache": true,
    "timeout": 30000
  }
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| model | string | 是 | 模型名称或ID |
| prompt | string | 是 | 输入提示词 |
| maxTokens | number | 否 | 最大生成token数，默认为2048 |
| temperature | number | 否 | 温度参数，默认为0.7 |
| topP | number | 否 | 核采样参数，默认为0.9 |
| topK | number | 否 | Top-K采样参数，默认为40 |
| frequencyPenalty | number | 否 | 频率惩罚，默认为0 |
| presencePenalty | number | 否 | 存在惩罚，默认为0 |
| stopSequences | array | 否 | 停止序列 |
| stream | boolean | 否 | 是否流式输出，默认为false |
| options | object | 否 | 推理选项 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "inference-abc123",
    "model": "gpt-4",
    "prompt": "请写一篇关于人工智能的文章",
    "completion": "人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支...",
    "usage": {
      "promptTokens": 15,
      "completionTokens": 500,
      "totalTokens": 515
    },
    "finishReason": "length",
    "cached": false,
    "latency": 1500,
    "cost": 0.0015,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:01.500Z"
}
```

#### 1.2 流式文本生成

流式生成文本内容。

**请求**

```http
POST /v1/inference/text/generate/stream
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "model": "gpt-4",
  "prompt": "请写一篇关于人工智能的文章",
  "maxTokens": 2000,
  "temperature": 0.7,
  "stream": true
}
```

**响应**

Server-Sent Events (SSE) 流式响应：

```
data: {"id":"inference-abc123","model":"gpt-4","choices":[{"delta":{"content":"人"},"finish_reason":null}],"usage":null}

data: {"id":"inference-abc123","model":"gpt-4","choices":[{"delta":{"content":"工"},"finish_reason":null}],"usage":null}

data: {"id":"inference-abc123","model":"gpt-4","choices":[{"delta":{"content":"智"},"finish_reason":null}],"usage":null}

...

data: {"id":"inference-abc123","model":"gpt-4","choices":[{"delta":{},"finish_reason":"length"}],"usage":{"prompt_tokens":15,"completion_tokens":500,"total_tokens":515}}
```

#### 1.3 文本补全

完成给定的文本。

**请求**

```http
POST /v1/inference/text/complete
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "model": "gpt-4",
  "prompt": "人工智能是",
  "suffix": "技术。",
  "maxTokens": 100,
  "temperature": 0.5
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "inference-def456",
    "model": "gpt-4",
    "prompt": "人工智能是",
    "suffix": "技术。",
    "completion": "计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。",
    "usage": {
      "promptTokens": 8,
      "completionTokens": 50,
      "totalTokens": 58
    },
    "finishReason": "stop",
    "latency": 800,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:00.800Z"
}
```

### 2. 对话推理

#### 2.1 创建对话

创建多轮对话。

**请求**

```http
POST /v1/inference/chat/completions
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

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
  "maxTokens": 2000,
  "temperature": 0.7,
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
  ],
  "functionCall": "auto"
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| model | string | 是 | 模型名称或ID |
| messages | array | 是 | 消息数组 |
| maxTokens | number | 否 | 最大生成token数 |
| temperature | number | 否 | 温度参数 |
| stream | boolean | 否 | 是否流式输出 |
| functions | array | 否 | 可用函数列表 |
| functionCall | string | 否 | 函数调用模式：auto、none、{name} |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "chat-abc123",
    "model": "gpt-4",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "YYC³（YanYuCloudCube）是一个基于云原生架构的便携式智能AI系统，旨在为企业提供高性能、高可靠性、高安全性、高扩展性和高可维护性的AI解决方案。",
          "functionCall": null
        },
        "finishReason": "stop"
      }
    ],
    "usage": {
      "promptTokens": 30,
      "completionTokens": 100,
      "totalTokens": 130
    },
    "latency": 1200,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:01.200Z"
}
```

#### 2.2 流式对话

流式创建多轮对话。

**请求**

```http
POST /v1/inference/chat/completions/stream
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

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
  "stream": true
}
```

**响应**

Server-Sent Events (SSE) 流式响应：

```
data: {"id":"chat-abc123","model":"gpt-4","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chat-abc123","model":"gpt-4","choices":[{"index":0,"delta":{"content":"YYC³"},"finish_reason":null}]}

data: {"id":"chat-abc123","model":"gpt-4","choices":[{"index":0,"delta":{"content":"（"},"finish_reason":null}]}

...

data: {"id":"chat-abc123","model":"gpt-4","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":30,"completion_tokens":100,"total_tokens":130}}
```

### 3. 图像推理

#### 3.1 图像生成

生成图像。

**请求**

```http
POST /v1/inference/image/generate
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "model": "dall-e-3",
  "prompt": "一只可爱的猫咪在阳光下玩耍",
  "n": 1,
  "size": "1024x1024",
  "quality": "standard",
  "style": "vivid",
  "responseFormat": "url"
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| model | string | 是 | 模型名称或ID |
| prompt | string | 是 | 图像描述 |
| n | number | 否 | 生成数量，默认为1 |
| size | string | 否 | 图像尺寸：256x256、512x512、1024x1024，默认为1024x1024 |
| quality | string | 否 | 图像质量：standard、hd，默认为standard |
| style | string | 否 | 图像风格：vivid、natural，默认为vivid |
| responseFormat | string | 否 | 响应格式：url、b64_json，默认为url |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "image-abc123",
    "model": "dall-e-3",
    "prompt": "一只可爱的猫咪在阳光下玩耍",
    "images": [
      {
        "url": "https://cdn.yyc3.com/images/image-abc123.png",
        "revisedPrompt": "一只可爱的橘色猫咪在阳光明媚的草地上玩耍，背景是蓝天白云"
      }
    ],
    "usage": {
      "promptTokens": 20,
      "totalTokens": 20
    },
    "latency": 5000,
    "cost": 0.04,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:05.000Z"
}
```

#### 3.2 图像编辑

编辑图像。

**请求**

```http
POST /v1/inference/image/edit
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| image | File | 是 | 原始图像 |
| mask | File | 否 | 掩码图像 |
| prompt | string | 是 | 编辑描述 |
| n | number | 否 | 生成数量，默认为1 |
| size | string | 否 | 图像尺寸，默认为1024x1024 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "image-edit-abc123",
    "prompt": "将背景改为海滩",
    "images": [
      {
        "url": "https://cdn.yyc3.com/images/image-edit-abc123.png"
      }
    ],
    "usage": {
      "promptTokens": 15,
      "totalTokens": 15
    },
    "latency": 4500,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:04.500Z"
}
```

#### 3.3 图像理解

理解图像内容。

**请求**

```http
POST /v1/inference/image/analyze
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| image | File | 是 | 图像文件 |
| prompt | string | 否 | 分析提示词，默认为"描述这张图片" |
| maxTokens | number | 否 | 最大生成token数 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "image-analyze-abc123",
    "model": "gpt-4-vision",
    "prompt": "描述这张图片",
    "description": "这张图片展示了一只可爱的橘色猫咪在阳光明媚的草地上玩耍。猫咪看起来很开心，正在追逐一个玩具。背景是蓝天白云，阳光洒在草地上，营造出温馨的氛围。",
    "objects": [
      {
        "name": "cat",
        "confidence": 0.98,
        "boundingBox": {
          "x": 100,
          "y": 150,
          "width": 300,
          "height": 250
        }
      }
    ],
    "usage": {
      "promptTokens": 100,
      "completionTokens": 50,
      "totalTokens": 150
    },
    "latency": 2000,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:02.000Z"
}
```

### 4. 音频推理

#### 4.1 语音转文字

将语音转换为文字。

**请求**

```http
POST /v1/inference/audio/transcribe
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| file | File | 是 | 音频文件 |
| model | string | 否 | 模型名称，默认为whisper-1 |
| language | string | 否 | 语言代码，默认为auto |
| prompt | string | 否 | 提示词 |
| responseFormat | string | 否 | 响应格式：json、text、srt、verbose_json，默认为json |
| temperature | number | 否 | 温度参数，默认为0 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "transcribe-abc123",
    "model": "whisper-1",
    "text": "你好，欢迎使用YYC³系统。这是一个基于云原生架构的便携式智能AI系统。",
    "language": "zh",
    "duration": 5.2,
    "segments": [
      {
        "id": 0,
        "start": 0,
        "end": 2.5,
        "text": "你好，欢迎使用YYC³系统。",
        "tokens": [
          {
            "text": "你好",
            "start": 0,
            "end": 0.5
          }
        ]
      },
      {
        "id": 1,
        "start": 2.5,
        "end": 5.2,
        "text": "这是一个基于云原生架构的便携式智能AI系统。",
        "tokens": []
      }
    ],
    "usage": {
      "duration": 5.2
    },
    "latency": 1000,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:01.000Z"
}
```

#### 4.2 文字转语音

将文字转换为语音。

**请求**

```http
POST /v1/inference/audio/synthesize
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "model": "tts-1",
  "input": "你好，欢迎使用YYC³系统。",
  "voice": "alloy",
  "outputFormat": "mp3",
  "speed": 1.0
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| model | string | 是 | 模型名称 |
| input | string | 是 | 输入文本 |
| voice | string | 否 | 语音：alloy、echo、fable、onyx、nova、shimmer，默认为alloy |
| outputFormat | string | 否 | 输出格式：mp3、opus、aac、flac，默认为mp3 |
| speed | number | 否 | 语速，默认为1.0 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "synthesize-abc123",
    "model": "tts-1",
    "input": "你好，欢迎使用YYC³系统。",
    "voice": "alloy",
    "audioUrl": "https://cdn.yyc3.com/audio/synthesize-abc123.mp3",
    "duration": 2.5,
    "usage": {
      "characters": 12
    },
    "latency": 500,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:00.500Z"
}
```

### 5. 批量推理

#### 5.1 批量文本生成

批量生成文本。

**请求**

```http
POST /v1/inference/batch/text/generate
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "model": "gpt-4",
  "requests": [
    {
      "id": "req-1",
      "prompt": "请写一篇关于人工智能的文章",
      "maxTokens": 500
    },
    {
      "id": "req-2",
      "prompt": "请写一篇关于机器学习的文章",
      "maxTokens": 500
    },
    {
      "id": "req-3",
      "prompt": "请写一篇关于深度学习的文章",
      "maxTokens": 500
    }
  ],
  "options": {
    "timeout": 60000,
    "maxConcurrency": 3
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "batchId": "batch-abc123",
    "results": [
      {
        "id": "req-1",
        "completion": "人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支...",
        "usage": {
          "promptTokens": 15,
          "completionTokens": 500,
          "totalTokens": 515
        },
        "latency": 1500
      },
      {
        "id": "req-2",
        "completion": "机器学习（Machine Learning，简称ML）是人工智能的一个子领域...",
        "usage": {
          "promptTokens": 15,
          "completionTokens": 500,
          "totalTokens": 515
        },
        "latency": 1600
      },
      {
        "id": "req-3",
        "completion": "深度学习（Deep Learning，简称DL）是机器学习的一个子领域...",
        "usage": {
          "promptTokens": 15,
          "completionTokens": 500,
          "totalTokens": 515
        },
        "latency": 1700
      }
    ],
    "summary": {
      "total": 3,
      "success": 3,
      "failed": 0,
      "totalLatency": 4800,
      "avgLatency": 1600,
      "totalTokens": 1545,
      "totalCost": 0.0045
    },
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:04.800Z"
}
```

### 6. 函数调用

#### 6.1 执行函数调用

执行模型生成的函数调用。

**请求**

```http
POST /v1/inference/functions/execute
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "搜索数据库中关于人工智能的信息"
    }
  ],
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
  ],
  "functionCall": "auto"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "function-abc123",
    "model": "gpt-4",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": null,
          "functionCall": {
            "name": "search_database",
            "arguments": "{\"query\":\"人工智能\"}"
          }
        },
        "finishReason": "function_call"
      }
    ],
    "functionCall": {
      "name": "search_database",
      "arguments": {
        "query": "人工智能"
      }
    },
    "usage": {
      "promptTokens": 50,
      "completionTokens": 20,
      "totalTokens": 70
    },
    "latency": 800,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:00.800Z"
}
```

#### 6.2 提交函数结果

提交函数执行结果。

**请求**

```http
POST /v1/inference/functions/submit
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "inferenceId": "function-abc123",
  "functionName": "search_database",
  "result": {
    "items": [
      {
        "id": "1",
        "title": "人工智能概述",
        "content": "人工智能是计算机科学的一个分支..."
      },
      {
        "id": "2",
        "title": "人工智能应用",
        "content": "人工智能在各个领域都有广泛应用..."
      }
    ],
    "total": 2
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "function-submit-abc123",
    "inferenceId": "function-abc123",
    "functionName": "search_database",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "根据搜索结果，我找到了2条关于人工智能的信息：\n\n1. 人工智能概述\n人工智能是计算机科学的一个分支...\n\n2. 人工智能应用\n人工智能在各个领域都有广泛应用..."
        },
        "finishReason": "stop"
      }
    ],
    "usage": {
      "promptTokens": 150,
      "completionTokens": 100,
      "totalTokens": 250
    },
    "latency": 1000,
    "timestamp": "2026-02-03T12:00:01.000Z"
  },
  "timestamp": "2026-02-03T12:00:02.000Z"
}
```

### 7. 推理监控

#### 7.1 获取推理统计

获取推理统计信息。

**请求**

```http
GET /v1/inference/stats
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| model | string | 否 | 模型名称或ID |
| startTime | string | 否 | 开始时间（ISO 8601） |
| endTime | string | 否 | 结束时间（ISO 8601） |
| granularity | string | 否 | 时间粒度：hour、day、week、month，默认为day |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "period": {
      "startTime": "2026-02-01T00:00:00.000Z",
      "endTime": "2026-02-03T12:00:00.000Z",
      "granularity": "day"
    },
    "overall": {
      "totalRequests": 100000,
      "successfulRequests": 99500,
      "failedRequests": 500,
      "successRate": 0.995,
      "totalTokens": 50000000,
      "totalCost": 1000,
      "avgLatency": 1000
    },
    "byModel": {
      "gpt-4": {
        "requests": 60000,
        "tokens": 30000000,
        "cost": 600,
        "avgLatency": 1200
      },
      "gpt-3.5-turbo": {
        "requests": 40000,
        "tokens": 20000000,
        "cost": 400,
        "avgLatency": 800
      }
    },
    "byType": {
      "text": {
        "requests": 80000,
        "tokens": 40000000,
        "cost": 800
      },
      "image": {
        "requests": 15000,
        "tokens": 7500000,
        "cost": 150
      },
      "audio": {
        "requests": 5000,
        "tokens": 2500000,
        "cost": 50
      }
    },
    "byTime": [
      {
        "timestamp": "2026-02-01T00:00:00.000Z",
        "requests": 33333,
        "tokens": 16666667,
        "cost": 333.33,
        "avgLatency": 1000
      },
      {
        "timestamp": "2026-02-02T00:00:00.000Z",
        "requests": 33333,
        "tokens": 16666667,
        "cost": 333.33,
        "avgLatency": 1000
      },
      {
        "timestamp": "2026-02-03T00:00:00.000Z",
        "requests": 33334,
        "tokens": 16666666,
        "cost": 333.34,
        "avgLatency": 1000
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 7.2 获取推理日志

获取推理日志。

**请求**

```http
GET /v1/inference/logs
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| model | string | 否 | 模型名称或ID |
| type | string | 否 | 推理类型：text、image、audio、chat |
| startTime | string | 否 | 开始时间（ISO 8601） |
| endTime | string | 否 | 结束时间（ISO 8601） |
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为20 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "inference-abc123",
        "model": "gpt-4",
        "type": "text",
        "prompt": "请写一篇关于人工智能的文章",
        "completion": "人工智能（Artificial Intelligence，简称AI）是...",
        "usage": {
          "promptTokens": 15,
          "completionTokens": 500,
          "totalTokens": 515
        },
        "latency": 1500,
        "cost": 0.0015,
        "timestamp": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "inference-def456",
        "model": "gpt-4",
        "type": "chat",
        "messages": [
          {
            "role": "user",
            "content": "你好"
          }
        ],
        "completion": "你好！有什么可以帮助你的吗？",
        "usage": {
          "promptTokens": 10,
          "completionTokens": 10,
          "totalTokens": 20
        },
        "latency": 800,
        "cost": 0.0001,
        "timestamp": "2026-02-03T12:00:01.000Z"
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
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 8. 推理配额

#### 8.1 获取配额信息

获取推理配额信息。

**请求**

```http
GET /v1/inference/quota
Authorization: Bearer <access_token>
```

**成功响应 (200)**

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
    "byModel": {
      "gpt-4": {
        "limit": 100000,
        "used": 50000,
        "remaining": 50000
      },
      "gpt-3.5-turbo": {
        "limit": 900000,
        "used": 450000,
        "remaining": 450000
      }
    },
    "byType": {
      "text": {
        "limit": 800000,
        "used": 400000,
        "remaining": 400000
      },
      "image": {
        "limit": 150000,
        "used": 75000,
        "remaining": 75000
      },
      "audio": {
        "limit": 50000,
        "used": 25000,
        "remaining": 25000
      }
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

## 错误代码

| 错误代码 | 描述 | HTTP状态码 |
|----------|------|------------|
| E901 | 模型不存在 | 404 |
| E902 | 模型未部署 | 503 |
| E903 | 输入参数无效 | 400 |
| E904 | 配额不足 | 429 |
| E905 | 推理超时 | 504 |
| E906 | 推理失败 | 500 |
| E907 | 函数调用失败 | 500 |
| E908 | 文件格式不支持 | 400 |
| E909 | 内容安全检查失败 | 400 |

## 使用示例

### JavaScript/TypeScript

```typescript
import { InferenceService } from '@yyc3/sdk';

const inferenceService = new InferenceService({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yyc3.com'
});

// 文本生成
const textResult = await inferenceService.generateText({
  model: 'gpt-4',
  prompt: '请写一篇关于人工智能的文章',
  maxTokens: 2000,
  temperature: 0.7
});

console.log('生成结果:', textResult.completion);

// 对话
const chatResult = await inferenceService.createChat({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: '你是一个有用的AI助手。' },
    { role: 'user', content: '你好，请介绍一下YYC³系统。' }
  ]
});

console.log('对话结果:', chatResult.choices[0].message.content);

// 图像生成
const imageResult = await inferenceService.generateImage({
  model: 'dall-e-3',
  prompt: '一只可爱的猫咪在阳光下玩耍',
  size: '1024x1024'
});

console.log('图像URL:', imageResult.images[0].url);
```

### Python

```python
from yyc3 import InferenceService

inference_service = InferenceService(
    api_key='your-api-key',
    base_url='https://api.yyc3.com'
)

# 文本生成
text_result = inference_service.generate_text(
    model='gpt-4',
    prompt='请写一篇关于人工智能的文章',
    max_tokens=2000,
    temperature=0.7
)

print(f'生成结果: {text_result.completion}')

# 对话
chat_result = inference_service.create_chat(
    model='gpt-4',
    messages=[
        {'role': 'system', 'content': '你是一个有用的AI助手。'},
        {'role': 'user', 'content': '你好，请介绍一下YYC³系统。'}
    ]
)

print(f'对话结果: {chat_result.choices[0].message.content}')

# 图像生成
image_result = inference_service.generate_image(
    model='dall-e-3',
    prompt='一只可爱的猫咪在阳光下玩耍',
    size='1024x1024'
)

print(f'图像URL: {image_result.images[0].url}')
```

## 最佳实践

1. **性能优化**
   - 使用流式推理减少首字延迟
   - 合理设置maxTokens控制成本
   - 使用缓存减少重复推理

2. **成本控制**
   - 监控推理使用量和成本
   - 根据需求选择合适的模型
   - 使用批量推理降低单位成本

3. **错误处理**
   - 实现重试机制处理临时错误
   - 捕获并处理配额不足错误
   - 记录推理失败日志

4. **安全考虑**
   - 验证输入内容安全性
   - 限制推理频率防止滥用
   - 加密敏感推理数据

5. **监控和告警**
   - 监控推理延迟和成功率
   - 设置成本告警阈值
   - 定期分析推理使用模式

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
