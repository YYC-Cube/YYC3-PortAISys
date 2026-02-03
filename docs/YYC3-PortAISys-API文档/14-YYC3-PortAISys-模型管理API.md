# 模型管理API

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 模型管理API文档

## 概述

模型管理API提供完整的AI模型生命周期管理功能，支持模型上传、部署、版本控制、性能监控、模型优化和模型共享等高级功能。

## 功能特性

- ✅ 模型上传和导入（支持多种格式）
- ✅ 模型部署和版本管理
- ✅ 模型性能监控和分析
- ✅ 模型优化和压缩
- ✅ 模型量化和剪枝
- ✅ 模型A/B测试
- ✅ 模型共享和发布
- ✅ 模型权限管理
- ✅ 模型训练任务管理
- ✅ 模型评估和对比

## 认证

所有模型管理API都需要认证。使用Bearer Token认证方式：

```http
Authorization: Bearer <access_token>
```

## API端点

### 1. 模型上传

#### 1.1 上传模型

上传新的AI模型。

**请求**

```http
POST /v1/models/upload
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| model | File | 是 | 模型文件（支持.onnx、.pt、.h5、.pb等格式） |
| name | string | 是 | 模型名称 |
| type | string | 是 | 模型类型：classification、regression、nlp、cv、multimodal |
| framework | string | 是 | 框架类型：pytorch、tensorflow、onnx、keras |
| version | string | 否 | 模型版本，默认为1.0.0 |
| description | string | 否 | 模型描述 |
| tags | array | 否 | 模型标签 |
| metadata | object | 否 | 模型元数据 |
| config | object | 否 | 模型配置 |

**请求示例**

```bash
curl -X POST https://api.yyc3.com/v1/models/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "model=@/path/to/model.onnx" \
  -F "name=bert-base-chinese" \
  -F "type=nlp" \
  -F "framework=onnx" \
  -F "version=1.0.0" \
  -F "description=BERT中文预训练模型" \
  -F 'tags=["nlp","bert","chinese"]' \
  -F 'metadata={"parameters":110000000,"layers":12}'
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "model": {
      "id": "model-abc123",
      "name": "bert-base-chinese",
      "type": "nlp",
      "framework": "onnx",
      "version": "1.0.0",
      "description": "BERT中文预训练模型",
      "tags": ["nlp", "bert", "chinese"],
      "metadata": {
        "parameters": 110000000,
        "layers": 12
      },
      "size": 440401920,
      "format": "onnx",
      "status": "uploaded",
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "模型上传成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.2 从URL导入模型

从URL导入模型。

**请求**

```http
POST /v1/models/import
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "gpt-4",
  "type": "nlp",
  "framework": "openai",
  "version": "1.0.0",
  "source": {
    "type": "url",
    "url": "https://api.openai.com/v1/models/gpt-4",
    "apiKey": "your-openai-api-key"
  },
  "description": "GPT-4语言模型",
  "tags": ["nlp", "gpt", "llm"]
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "model": {
      "id": "model-def456",
      "name": "gpt-4",
      "type": "nlp",
      "framework": "openai",
      "version": "1.0.0",
      "description": "GPT-4语言模型",
      "tags": ["nlp", "gpt", "llm"],
      "source": {
        "type": "url",
        "url": "https://api.openai.com/v1/models/gpt-4"
      },
      "status": "imported",
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "模型导入成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 2. 模型部署

#### 2.1 部署模型

部署模型到推理服务。

**请求**

```http
POST /v1/models/{modelId}/deploy
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "environment": "production",
  "instanceType": "gpu.t4.medium",
  "minInstances": 1,
  "maxInstances": 5,
  "autoscaling": {
    "enabled": true,
    "targetCpu": 70,
    "targetMemory": 80
  },
  "endpoint": {
    "name": "bert-inference",
    "path": "/v1/inference/bert"
  },
  "options": {
    "batchSize": 32,
    "maxLatency": 1000,
    "enableLogging": true
  }
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| environment | string | 是 | 部署环境：development、staging、production |
| instanceType | string | 是 | 实例类型 |
| minInstances | number | 是 | 最小实例数 |
| maxInstances | number | 是 | 最大实例数 |
| autoscaling | object | 否 | 自动扩缩容配置 |
| endpoint | object | 否 | 端点配置 |
| options | object | 否 | 部署选项 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "deployment": {
      "id": "deploy-abc123",
      "modelId": "model-abc123",
      "environment": "production",
      "instanceType": "gpu.t4.medium",
      "minInstances": 1,
      "maxInstances": 5,
      "currentInstances": 1,
      "status": "deploying",
      "endpoint": {
        "name": "bert-inference",
        "url": "https://api.yyc3.com/v1/inference/bert",
        "status": "provisioning"
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "estimatedReadyAt": "2026-02-03T12:05:00.000Z"
    }
  },
  "message": "模型部署任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.2 查询部署状态

查询模型部署状态。

**请求**

```http
GET /v1/models/{modelId}/deployments/{deploymentId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "deployment": {
      "id": "deploy-abc123",
      "modelId": "model-abc123",
      "environment": "production",
      "instanceType": "gpu.t4.medium",
      "minInstances": 1,
      "maxInstances": 5,
      "currentInstances": 2,
      "status": "running",
      "endpoint": {
        "name": "bert-inference",
        "url": "https://api.yyc3.com/v1/inference/bert",
        "status": "active"
      },
      "metrics": {
        "requestsPerSecond": 100,
        "avgLatency": 50,
        "p95Latency": 100,
        "p99Latency": 150,
        "errorRate": 0.01
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "readyAt": "2026-02-03T12:05:00.000Z"
    }
  },
  "timestamp": "2026-02-03T12:10:00.000Z"
}
```

#### 2.3 停止部署

停止模型部署。

**请求**

```http
POST /v1/models/{modelId}/deployments/{deploymentId}/stop
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "deployment": {
      "id": "deploy-abc123",
      "status": "stopping",
      "stoppedAt": "2026-02-03T12:15:00.000Z"
    }
  },
  "message": "模型部署停止中",
  "timestamp": "2026-02-03T12:15:00.000Z"
}
```

### 3. 模型管理

#### 3.1 获取模型列表

获取所有模型列表。

**请求**

```http
GET /v1/models
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| type | string | 否 | 模型类型筛选 |
| framework | string | 否 | 框架类型筛选 |
| status | string | 否 | 状态筛选：uploaded、deployed、stopped |
| tags | string | 否 | 标签筛选（逗号分隔） |
| sortBy | string | 否 | 排序字段：name、createdAt、size，默认为createdAt |
| sortOrder | string | 否 | 排序方向：asc、desc，默认为desc |
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为20 |

**请求示例**

```bash
curl -X GET "https://api.yyc3.com/v1/models?type=nlp&framework=onnx&status=deployed&tags=nlp,bert&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "model-abc123",
        "name": "bert-base-chinese",
        "type": "nlp",
        "framework": "onnx",
        "version": "1.0.0",
        "description": "BERT中文预训练模型",
        "tags": ["nlp", "bert", "chinese"],
        "size": 440401920,
        "status": "deployed",
        "deployment": {
          "id": "deploy-abc123",
          "environment": "production",
          "endpoint": "https://api.yyc3.com/v1/inference/bert"
        },
        "createdAt": "2026-02-03T12:00:00.000Z",
        "updatedAt": "2026-02-03T12:00:00.000Z"
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
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.2 获取模型详情

获取模型的详细信息。

**请求**

```http
GET /v1/models/{modelId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "model": {
      "id": "model-abc123",
      "name": "bert-base-chinese",
      "type": "nlp",
      "framework": "onnx",
      "version": "1.0.0",
      "description": "BERT中文预训练模型",
      "tags": ["nlp", "bert", "chinese"],
      "metadata": {
        "parameters": 110000000,
        "layers": 12,
        "hiddenSize": 768,
        "maxSequenceLength": 512
      },
      "size": 440401920,
      "format": "onnx",
      "status": "deployed",
      "deployment": {
        "id": "deploy-abc123",
        "environment": "production",
        "instanceType": "gpu.t4.medium",
        "currentInstances": 2,
        "endpoint": {
          "name": "bert-inference",
          "url": "https://api.yyc3.com/v1/inference/bert",
          "status": "active"
        },
        "metrics": {
          "requestsPerSecond": 100,
          "avgLatency": 50,
          "p95Latency": 100,
          "p99Latency": 150,
          "errorRate": 0.01
        }
      },
      "performance": {
        "accuracy": 0.95,
        "f1Score": 0.94,
        "latency": 50,
        "throughput": 100
      },
      "owner": {
        "id": "user-123",
        "name": "John Doe"
      },
      "permissions": {
        "read": true,
        "write": true,
        "delete": true,
        "deploy": true,
        "share": true
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.3 更新模型

更新模型信息。

**请求**

```http
PATCH /v1/models/{modelId}
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "bert-base-chinese-v2",
  "description": "BERT中文预训练模型v2",
  "tags": ["nlp", "bert", "chinese", "v2"],
  "metadata": {
    "parameters": 110000000,
    "layers": 12,
    "hiddenSize": 768,
    "maxSequenceLength": 512,
    "version": "2.0.0"
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "model": {
      "id": "model-abc123",
      "name": "bert-base-chinese-v2",
      "description": "BERT中文预训练模型v2",
      "tags": ["nlp", "bert", "chinese", "v2"],
      "updatedAt": "2026-02-03T12:30:00.000Z"
    }
  },
  "message": "模型更新成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

#### 3.4 删除模型

删除模型。

**请求**

```http
DELETE /v1/models/{modelId}
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| force | boolean | 否 | 是否强制删除（包括部署），默认为false |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "modelId": "model-abc123",
    "deleted": true,
    "deletedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "模型删除成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 4. 模型版本管理

#### 4.1 创建模型版本

创建模型的新版本。

**请求**

```http
POST /v1/models/{modelId}/versions
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "version": "2.0.0",
  "description": "优化版本，提升准确率",
  "modelFile": "/path/to/model-v2.onnx",
  "changes": [
    "优化了模型结构",
    "提升了准确率到96%",
    "减少了延迟到40ms"
  ]
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "version": {
      "id": "version-abc123",
      "modelId": "model-abc123",
      "version": "2.0.0",
      "description": "优化版本，提升准确率",
      "changes": [
        "优化了模型结构",
        "提升了准确率到96%",
        "减少了延迟到40ms"
      ],
      "size": 440401920,
      "status": "uploaded",
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "模型版本创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 4.2 列出模型版本

列出模型的所有版本。

**请求**

```http
GET /v1/models/{modelId}/versions
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "id": "version-abc123",
        "modelId": "model-abc123",
        "version": "2.0.0",
        "description": "优化版本，提升准确率",
        "size": 440401920,
        "status": "uploaded",
        "isCurrent": true,
        "createdAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "version-def456",
        "modelId": "model-abc123",
        "version": "1.0.0",
        "description": "初始版本",
        "size": 440401920,
        "status": "uploaded",
        "isCurrent": false,
        "createdAt": "2026-02-01T12:00:00.000Z"
      }
    ],
    "total": 2
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 4.3 切换模型版本

切换到指定版本。

**请求**

```http
POST /v1/models/{modelId}/versions/{versionId}/activate
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "model": {
      "id": "model-abc123",
      "currentVersion": "1.0.0",
      "activatedAt": "2026-02-03T12:30:00.000Z"
    }
  },
  "message": "模型版本切换成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 5. 模型优化

#### 5.1 量化模型

对模型进行量化以减小模型大小。

**请求**

```http
POST /v1/models/{modelId}/optimize/quantize
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "quantizationType": "int8",
  "calibrationData": {
    "type": "dataset",
    "datasetId": "dataset-abc123"
  },
  "options": {
    "preserveAccuracy": true,
    "targetAccuracy": 0.94
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task-abc123",
      "type": "quantize",
      "status": "processing",
      "quantizationType": "int8",
      "estimatedTime": 300,
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "模型量化任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 5.2 剪枝模型

对模型进行剪枝以减少参数数量。

**请求**

```http
POST /v1/models/{modelId}/optimize/prune
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "pruningMethod": "magnitude",
  "sparsity": 0.5,
  "fineTune": true,
  "options": {
    "preserveAccuracy": true,
    "targetAccuracy": 0.93
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task-def456",
      "type": "prune",
      "status": "processing",
      "pruningMethod": "magnitude",
      "sparsity": 0.5,
      "estimatedTime": 600,
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "模型剪枝任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 5.3 压缩模型

对模型进行压缩。

**请求**

```http
POST /v1/models/{modelId}/optimize/compress
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "compressionMethod": "gzip",
  "level": 9,
  "options": {
    "optimizeInference": true
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task-ghi789",
      "type": "compress",
      "status": "processing",
      "compressionMethod": "gzip",
      "level": 9,
      "estimatedTime": 60,
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "模型压缩任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 6. 模型评估

#### 6.1 创建评估任务

创建模型评估任务。

**请求**

```http
POST /v1/models/{modelId}/evaluate
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "datasetId": "dataset-abc123",
  "metrics": ["accuracy", "precision", "recall", "f1", "auc"],
  "split": "test",
  "options": {
    "batchSize": 32,
    "detailedReport": true
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "eval-abc123",
      "modelId": "model-abc123",
      "datasetId": "dataset-abc123",
      "status": "processing",
      "metrics": ["accuracy", "precision", "recall", "f1", "auc"],
      "estimatedTime": 300,
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "模型评估任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 6.2 查询评估结果

查询模型评估结果。

**请求**

```http
GET /v1/models/{modelId}/evaluations/{evaluationId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "evaluation": {
      "id": "eval-abc123",
      "modelId": "model-abc123",
      "datasetId": "dataset-abc123",
      "status": "completed",
      "metrics": {
        "accuracy": 0.95,
        "precision": 0.94,
        "recall": 0.93,
        "f1": 0.935,
        "auc": 0.97
      },
      "confusionMatrix": {
        "truePositive": 950,
        "falsePositive": 50,
        "falseNegative": 70,
        "trueNegative": 930
      },
      "detailedReport": {
        "byClass": [
          {
            "class": "positive",
            "precision": 0.95,
            "recall": 0.93,
            "f1": 0.94
          },
          {
            "class": "negative",
            "precision": 0.95,
            "recall": 0.93,
            "f1": 0.94
          }
        ]
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "completedAt": "2026-02-03T12:05:00.000Z",
      "executionTime": 300
    }
  },
  "timestamp": "2026-02-03T12:05:00.000Z"
}
```

### 7. 模型A/B测试

#### 7.1 创建A/B测试

创建模型A/B测试。

**请求**

```http
POST /v1/models/ab-test
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "bert-v1-vs-v2-test",
  "description": "测试BERT v1和v2的性能差异",
  "modelA": {
    "modelId": "model-abc123",
    "version": "1.0.0",
    "weight": 0.5
  },
  "modelB": {
    "modelId": "model-abc123",
    "version": "2.0.0",
    "weight": 0.5
  },
  "metrics": ["accuracy", "latency", "throughput"],
  "duration": 86400,
  "traffic": {
    "type": "percentage",
    "percentage": 10
  }
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "test": {
      "id": "abtest-abc123",
      "name": "bert-v1-vs-v2-test",
      "description": "测试BERT v1和v2的性能差异",
      "status": "running",
      "modelA": {
        "modelId": "model-abc123",
        "version": "1.0.0",
        "weight": 0.5
      },
      "modelB": {
        "modelId": "model-abc123",
        "version": "2.0.0",
        "weight": 0.5
      },
      "metrics": ["accuracy", "latency", "throughput"],
      "duration": 86400,
      "startTime": "2026-02-03T12:00:00.000Z",
      "endTime": "2026-02-04T12:00:00.000Z"
    }
  },
  "message": "A/B测试创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 7.2 查询A/B测试结果

查询A/B测试结果。

**请求**

```http
GET /v1/models/ab-test/{testId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "test": {
      "id": "abtest-abc123",
      "name": "bert-v1-vs-v2-test",
      "status": "completed",
      "results": {
        "modelA": {
          "version": "1.0.0",
          "requests": 10000,
          "accuracy": 0.94,
          "avgLatency": 50,
          "throughput": 100
        },
        "modelB": {
          "version": "2.0.0",
          "requests": 10000,
          "accuracy": 0.96,
          "avgLatency": 40,
          "throughput": 120
        },
        "comparison": {
          "accuracyImprovement": 0.02,
          "latencyImprovement": -10,
          "throughputImprovement": 20,
          "winner": "modelB"
        }
      },
      "startTime": "2026-02-03T12:00:00.000Z",
      "endTime": "2026-02-04T12:00:00.000Z"
    }
  },
  "timestamp": "2026-02-04T12:00:00.000Z"
}
```

### 8. 模型监控

#### 8.1 获取模型性能指标

获取模型实时性能指标。

**请求**

```http
GET /v1/models/{modelId}/metrics
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| period | number | 否 | 时间周期（秒），默认为3600 |
| deploymentId | string | 否 | 部署ID |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "period": 3600,
    "metrics": {
      "requests": {
        "total": 360000,
        "success": 356400,
        "failed": 3600,
        "perSecond": 100
      },
      "latency": {
        "avg": 50,
        "p50": 45,
        "p95": 100,
        "p99": 150,
        "max": 500
      },
      "throughput": {
        "requestsPerSecond": 100,
        "tokensPerSecond": 10000
      },
      "accuracy": {
        "overall": 0.95,
        "byClass": {
          "positive": 0.94,
          "negative": 0.96
        }
      },
      "resources": {
        "cpu": {
          "usage": 70,
          "cores": 4
        },
        "memory": {
          "usage": 80,
          "total": 16384,
          "used": 13107
        },
        "gpu": {
          "usage": 85,
          "memory": 90
        }
      }
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 8.2 获取模型历史数据

获取模型历史性能数据。

**请求**

```http
GET /v1/models/{modelId}/metrics/history
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| startTime | string | 是 | 开始时间（ISO 8601） |
| endTime | string | 是 | 结束时间（ISO 8601） |
| interval | string | 否 | 时间间隔：1m、5m、15m、1h、1d，默认为1h |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "startTime": "2026-02-03T00:00:00.000Z",
    "endTime": "2026-02-03T12:00:00.000Z",
    "interval": "1h",
    "metrics": [
      {
        "timestamp": "2026-02-03T00:00:00.000Z",
        "requests": 360000,
        "avgLatency": 50,
        "p95Latency": 100,
        "accuracy": 0.95,
        "errorRate": 0.01
      },
      {
        "timestamp": "2026-02-03T01:00:00.000Z",
        "requests": 378000,
        "avgLatency": 48,
        "p95Latency": 95,
        "accuracy": 0.95,
        "errorRate": 0.009
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 9. 模型权限管理

#### 9.1 设置模型权限

设置模型的访问权限。

**请求**

```http
POST /v1/models/{modelId}/permissions
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "permissions": {
    "read": true,
    "write": false,
    "delete": false,
    "deploy": false,
    "share": false
  },
  "users": [
    {
      "userId": "user-456",
      "permissions": {
        "read": true,
        "write": true,
        "delete": false,
        "deploy": false,
        "share": false
      }
    }
  ],
  "roles": [
    {
      "roleId": "role-789",
      "permissions": {
        "read": true,
        "write": false,
        "delete": false,
        "deploy": false,
        "share": false
      }
    }
  ]
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "model": {
      "id": "model-abc123",
      "permissions": {
        "read": true,
        "write": false,
        "delete": false,
        "deploy": false,
        "share": false
      }
    }
  },
  "message": "模型权限设置成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 9.2 共享模型

生成模型共享链接。

**请求**

```http
POST /v1/models/{modelId}/share
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "expiresIn": 86400,
  "maxDownloads": 10,
  "password": "share123",
  "permissions": {
    "read": true,
    "deploy": false
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "shareId": "share-abc123",
    "shareUrl": "https://yyc3.com/models/share/share-abc123",
    "expiresAt": "2026-02-04T12:00:00.000Z",
    "maxDownloads": 10,
    "downloadsUsed": 0,
    "password": true
  },
  "message": "模型共享链接生成成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

## 错误代码

| 错误代码 | 描述 | HTTP状态码 |
|----------|------|------------|
| E801 | 模型不存在 | 404 |
| E802 | 模型已存在 | 409 |
| E803 | 模型上传失败 | 500 |
| E804 | 模型部署失败 | 500 |
| E805 | 模型版本不存在 | 404 |
| E806 | 优化任务失败 | 500 |
| E807 | 评估任务失败 | 500 |
| E808 | 权限不足 | 403 |
| E809 | 模型格式不支持 | 400 |

## 使用示例

### JavaScript/TypeScript

```typescript
import { ModelService } from '@yyc3/sdk';

const modelService = new ModelService({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yyc3.com'
});

// 上传模型
const model = await modelService.upload({
  file: document.getElementById('modelInput').files[0],
  name: 'bert-base-chinese',
  type: 'nlp',
  framework: 'onnx',
  version: '1.0.0',
  description: 'BERT中文预训练模型',
  tags: ['nlp', 'bert', 'chinese']
});

console.log('模型上传成功:', model);

// 部署模型
const deployment = await modelService.deploy(model.id, {
  environment: 'production',
  instanceType: 'gpu.t4.medium',
  minInstances: 1,
  maxInstances: 5
});

console.log('模型部署中:', deployment);

// 获取模型列表
const models = await modelService.list({
  type: 'nlp',
  framework: 'onnx',
  status: 'deployed'
});

console.log('模型列表:', models.items);
```

### Python

```python
from yyc3 import ModelService

model_service = ModelService(
    api_key='your-api-key',
    base_url='https://api.yyc3.com'
)

# 上传模型
with open('model.onnx', 'rb') as f:
    model = model_service.upload(
        file=f,
        name='bert-base-chinese',
        type='nlp',
        framework='onnx',
        version='1.0.0',
        description='BERT中文预训练模型',
        tags=['nlp', 'bert', 'chinese']
    )

print(f'模型上传成功: {model}')

# 部署模型
deployment = model_service.deploy(
    model_id=model.id,
    environment='production',
    instance_type='gpu.t4.medium',
    min_instances=1,
    max_instances=5
)

print(f'模型部署中: {deployment}')

# 获取模型列表
models = model_service.list(
    type='nlp',
    framework='onnx',
    status='deployed'
)

print(f'模型列表: {models.items}')
```

## 最佳实践

1. **模型管理**
   - 使用版本控制管理模型迭代
   - 定期备份重要模型
   - 记录模型训练和优化过程

2. **部署优化**
   - 根据负载选择合适的实例类型
   - 配置自动扩缩容应对流量波动
   - 使用A/B测试验证新版本性能

3. **性能监控**
   - 监控模型准确率和延迟
   - 设置性能告警阈值
   - 定期分析模型性能趋势

4. **模型优化**
   - 使用量化和剪枝减小模型大小
   - 在准确率和性能之间找到平衡
   - 优化前充分评估影响

5. **安全考虑**
   - 控制模型访问权限
   - 加密存储敏感模型
   - 定期审核模型共享记录

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
