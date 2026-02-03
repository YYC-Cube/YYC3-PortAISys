# 训练服务API

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 训练服务API文档

## 概述

训练服务API提供完整的AI模型训练功能，支持训练任务管理、数据集管理、超参数调优、分布式训练、模型评估和训练监控等高级功能。

## 功能特性

- ✅ 训练任务创建和管理
- ✅ 数据集上传和管理
- ✅ 超参数调优
- ✅ 分布式训练
- ✅ 模型评估和对比
- ✅ 训练监控和日志
- ✅ 模型导出和部署
- ✅ 训练资源管理
- ✅ 训练成本统计
- ✅ 训练模板管理

## 认证

所有训练服务API都需要认证。使用Bearer Token认证方式：

```http
Authorization: Bearer <access_token>
```

## API端点

### 1. 训练任务管理

#### 1.1 创建训练任务

创建新的训练任务。

**请求**

```http
POST /v1/training/jobs
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "bert-fine-tuning",
  "description": "BERT模型微调任务",
  "model": {
    "baseModel": "bert-base-chinese",
    "task": "text-classification",
    "architecture": "transformer"
  },
  "dataset": {
    "id": "dataset-abc123",
    "validationSplit": 0.2,
    "testSplit": 0.1
  },
  "hyperparameters": {
    "learningRate": 0.0001,
    "batchSize": 32,
    "epochs": 10,
    "warmupSteps": 1000,
    "weightDecay": 0.01,
    "gradientClipping": 1.0
  },
  "resources": {
    "instanceType": "gpu.a100.large",
    "instanceCount": 1,
    "distributed": false
  },
  "output": {
    "checkpointInterval": 1000,
    "saveBestOnly": true,
    "exportFormat": "onnx"
  },
  "options": {
    "enableEarlyStopping": true,
    "enableMixedPrecision": true,
    "enableLogging": true
  }
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| name | string | 是 | 训练任务名称 |
| description | string | 否 | 训练任务描述 |
| model | object | 是 | 模型配置 |
| dataset | object | 是 | 数据集配置 |
| hyperparameters | object | 是 | 超参数配置 |
| resources | object | 是 | 资源配置 |
| output | object | 否 | 输出配置 |
| options | object | 否 | 其他选项 |

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job-abc123",
      "name": "bert-fine-tuning",
      "description": "BERT模型微调任务",
      "model": {
        "baseModel": "bert-base-chinese",
        "task": "text-classification",
        "architecture": "transformer"
      },
      "dataset": {
        "id": "dataset-abc123",
        "validationSplit": 0.2,
        "testSplit": 0.1
      },
      "hyperparameters": {
        "learningRate": 0.0001,
        "batchSize": 32,
        "epochs": 10
      },
      "resources": {
        "instanceType": "gpu.a100.large",
        "instanceCount": 1,
        "distributed": false
      },
      "status": "pending",
      "createdAt": "2026-02-03T12:00:00.000Z",
      "estimatedStartTime": "2026-02-03T12:05:00.000Z",
      "estimatedCompletionTime": "2026-02-03T14:00:00.000Z"
    }
  },
  "message": "训练任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.2 查询训练任务状态

查询训练任务状态。

**请求**

```http
GET /v1/training/jobs/{jobId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job-abc123",
      "name": "bert-fine-tuning",
      "status": "running",
      "progress": {
        "epoch": 5,
        "totalEpochs": 10,
        "step": 5000,
        "totalSteps": 10000,
        "percentage": 50
      },
      "metrics": {
        "trainLoss": 0.5,
        "trainAccuracy": 0.85,
        "valLoss": 0.6,
        "valAccuracy": 0.82,
        "learningRate": 0.0001
      },
      "resources": {
        "instanceType": "gpu.a100.large",
        "instanceCount": 1,
        "gpuUtilization": 85,
        "memoryUsage": 70
      },
      "time": {
        "startedAt": "2026-02-03T12:05:00.000Z",
        "elapsedTime": 5400,
        "estimatedRemainingTime": 5400
      },
      "cost": {
        "estimatedCost": 10.0,
        "actualCost": 5.0
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T13:30:00.000Z"
    }
  },
  "timestamp": "2026-02-03T13:30:00.000Z"
}
```

#### 1.3 列出训练任务

列出所有训练任务。

**请求**

```http
GET /v1/training/jobs
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| status | string | 否 | 状态筛选：pending、running、completed、failed、cancelled |
| model | string | 否 | 模型筛选 |
| sortBy | string | 否 | 排序字段：createdAt、updatedAt、name，默认为createdAt |
| sortOrder | string | 否 | 排序方向：asc、desc，默认为desc |
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为20 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-abc123",
        "name": "bert-fine-tuning",
        "status": "running",
        "progress": {
          "percentage": 50
        },
        "model": {
          "baseModel": "bert-base-chinese"
        },
        "createdAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "job-def456",
        "name": "gpt-fine-tuning",
        "status": "completed",
        "progress": {
          "percentage": 100
        },
        "model": {
          "baseModel": "gpt-3.5"
        },
        "createdAt": "2026-02-02T12:00:00.000Z"
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

#### 1.4 停止训练任务

停止正在运行的训练任务。

**请求**

```http
POST /v1/training/jobs/{jobId}/stop
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job-abc123",
      "status": "stopping",
      "stoppedAt": "2026-02-03T13:30:00.000Z"
    }
  },
  "message": "训练任务停止中",
  "timestamp": "2026-02-03T13:30:00.000Z"
}
```

#### 1.5 删除训练任务

删除训练任务。

**请求**

```http
DELETE /v1/training/jobs/{jobId}
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| force | boolean | 否 | 是否强制删除（包括模型），默认为false |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "jobId": "job-abc123",
    "deleted": true,
    "deletedAt": "2026-02-03T13:30:00.000Z"
  },
  "message": "训练任务删除成功",
  "timestamp": "2026-02-03T13:30:00.000Z"
}
```

### 2. 数据集管理

#### 2.1 创建数据集

创建新的数据集。

**请求**

```http
POST /v1/training/datasets
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| file | File | 是 | 数据集文件（支持CSV、JSON、Parquet等格式） |
| name | string | 是 | 数据集名称 |
| description | string | 否 | 数据集描述 |
| type | string | 是 | 数据集类型：text、image、audio、multimodal |
| format | string | 是 | 数据集格式：csv、json、parquet |
| schema | object | 否 | 数据集schema |
| metadata | object | 否 | 数据集元数据 |
| tags | array | 否 | 数据集标签 |

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "dataset": {
      "id": "dataset-abc123",
      "name": "text-classification-dataset",
      "description": "文本分类数据集",
      "type": "text",
      "format": "csv",
      "size": 10485760,
      "rowCount": 10000,
      "columnCount": 3,
      "schema": {
        "columns": [
          {
            "name": "text",
            "type": "string"
          },
          {
            "name": "label",
            "type": "string"
          },
          {
            "name": "category",
            "type": "string"
          }
        ]
      },
      "metadata": {
        "language": "zh-CN",
        "domain": "general"
      },
      "tags": ["classification", "text"],
      "status": "uploaded",
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "数据集创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.2 列出数据集

列出所有数据集。

**请求**

```http
GET /v1/training/datasets
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| type | string | 否 | 数据集类型筛选 |
| tags | string | 否 | 标签筛选（逗号分隔） |
| sortBy | string | 否 | 排序字段：name、createdAt、size，默认为createdAt |
| sortOrder | string | 否 | 排序方向：asc、desc，默认为desc |
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为20 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "datasets": [
      {
        "id": "dataset-abc123",
        "name": "text-classification-dataset",
        "type": "text",
        "format": "csv",
        "size": 10485760,
        "rowCount": 10000,
        "tags": ["classification", "text"],
        "status": "uploaded",
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
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.3 删除数据集

删除数据集。

**请求**

```http
DELETE /v1/training/datasets/{datasetId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "datasetId": "dataset-abc123",
    "deleted": true
  },
  "message": "数据集删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 3. 超参数调优

#### 3.1 创建调优任务

创建超参数调优任务。

**请求**

```http
POST /v1/training/tuning
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "bert-hyperparameter-tuning",
  "description": "BERT模型超参数调优",
  "baseJobId": "job-abc123",
  "parameters": {
    "learningRate": {
      "type": "float",
      "min": 0.00001,
      "max": 0.001,
      "scale": "log"
    },
    "batchSize": {
      "type": "categorical",
      "values": [16, 32, 64]
    },
    "epochs": {
      "type": "int",
      "min": 5,
      "max": 20
    }
  },
  "strategy": {
    "type": "bayesian",
    "maxTrials": 20,
    "parallelTrials": 3
  },
  "objective": {
    "metric": "valAccuracy",
    "direction": "maximize"
  }
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "tuning": {
      "id": "tuning-abc123",
      "name": "bert-hyperparameter-tuning",
      "description": "BERT模型超参数调优",
      "baseJobId": "job-abc123",
      "strategy": {
        "type": "bayesian",
        "maxTrials": 20,
        "parallelTrials": 3
      },
      "status": "pending",
      "trials": [],
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "调优任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.2 查询调优任务状态

查询调优任务状态。

**请求**

```http
GET /v1/training/tuning/{tuningId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "tuning": {
      "id": "tuning-abc123",
      "name": "bert-hyperparameter-tuning",
      "status": "running",
      "progress": {
        "completedTrials": 10,
        "totalTrials": 20,
        "percentage": 50
      },
      "trials": [
        {
          "id": "trial-1",
          "parameters": {
            "learningRate": 0.0001,
            "batchSize": 32,
            "epochs": 10
          },
          "metrics": {
            "valAccuracy": 0.85,
            "valLoss": 0.5
          },
          "status": "completed"
        },
        {
          "id": "trial-2",
          "parameters": {
            "learningRate": 0.00005,
            "batchSize": 64,
            "epochs": 15
          },
          "metrics": {
            "valAccuracy": 0.87,
            "valLoss": 0.45
          },
          "status": "completed"
        }
      ],
      "bestTrial": {
        "id": "trial-2",
        "parameters": {
          "learningRate": 0.00005,
          "batchSize": 64,
          "epochs": 15
        },
        "metrics": {
          "valAccuracy": 0.87,
          "valLoss": 0.45
        }
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T13:00:00.000Z"
    }
  },
  "timestamp": "2026-02-03T13:00:00.000Z"
}
```

### 4. 训练监控

#### 4.1 获取训练日志

获取训练日志。

**请求**

```http
GET /v1/training/jobs/{jobId}/logs
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| level | string | 否 | 日志级别：debug、info、warn、error，默认为info |
| startTime | string | 否 | 开始时间（ISO 8601） |
| endTime | string | 否 | 结束时间（ISO 8601） |
| limit | number | 否 | 返回数量限制，默认为100 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2026-02-03T12:05:00.000Z",
        "level": "info",
        "message": "训练任务开始",
        "step": 0,
        "epoch": 0
      },
      {
        "timestamp": "2026-02-03T12:06:00.000Z",
        "level": "info",
        "message": "Epoch 1/10",
        "step": 1000,
        "epoch": 1,
        "metrics": {
          "trainLoss": 0.8,
          "trainAccuracy": 0.7
        }
      },
      {
        "timestamp": "2026-02-03T12:07:00.000Z",
        "level": "info",
        "message": "验证集评估",
        "step": 1000,
        "epoch": 1,
        "metrics": {
          "valLoss": 0.75,
          "valAccuracy": 0.72
        }
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 4.2 获取训练指标

获取训练指标历史。

**请求**

```http
GET /v1/training/jobs/{jobId}/metrics
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| metrics | string | 否 | 指标名称（逗号分隔），默认为所有指标 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "metrics": {
      "trainLoss": [
        {
          "step": 0,
          "epoch": 0,
          "value": 1.0,
          "timestamp": "2026-02-03T12:05:00.000Z"
        },
        {
          "step": 1000,
          "epoch": 1,
          "value": 0.8,
          "timestamp": "2026-02-03T12:06:00.000Z"
        },
        {
          "step": 2000,
          "epoch": 2,
          "value": 0.65,
          "timestamp": "2026-02-03T12:07:00.000Z"
        }
      ],
      "trainAccuracy": [
        {
          "step": 0,
          "epoch": 0,
          "value": 0.5,
          "timestamp": "2026-02-03T12:05:00.000Z"
        },
        {
          "step": 1000,
          "epoch": 1,
          "value": 0.7,
          "timestamp": "2026-02-03T12:06:00.000Z"
        },
        {
          "step": 2000,
          "epoch": 2,
          "value": 0.8,
          "timestamp": "2026-02-03T12:07:00.000Z"
        }
      ],
      "valLoss": [
        {
          "step": 1000,
          "epoch": 1,
          "value": 0.75,
          "timestamp": "2026-02-03T12:06:00.000Z"
        },
        {
          "step": 2000,
          "epoch": 2,
          "value": 0.7,
          "timestamp": "2026-02-03T12:07:00.000Z"
        }
      ],
      "valAccuracy": [
        {
          "step": 1000,
          "epoch": 1,
          "value": 0.72,
          "timestamp": "2026-02-03T12:06:00.000Z"
        },
        {
          "step": 2000,
          "epoch": 2,
          "value": 0.78,
          "timestamp": "2026-02-03T12:07:00.000Z"
        }
      ]
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 5. 模型导出

#### 5.1 导出训练模型

导出训练完成的模型。

**请求**

```http
POST /v1/training/jobs/{jobId}/export
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "format": "onnx",
  "options": {
    "optimize": true,
    "quantize": true,
    "quantizationType": "int8"
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "export": {
      "id": "export-abc123",
      "jobId": "job-abc123",
      "format": "onnx",
      "status": "processing",
      "estimatedTime": 300,
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "模型导出任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 5.2 下载导出模型

下载导出的模型。

**请求**

```http
GET /v1/training/jobs/{jobId}/exports/{exportId}/download
Authorization: Bearer <access_token>
```

**响应**

文件内容以二进制流形式返回。

### 6. 训练模板

#### 6.1 创建训练模板

创建训练模板。

**请求**

```http
POST /v1/training/templates
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "bert-text-classification",
  "description": "BERT文本分类训练模板",
  "model": {
    "baseModel": "bert-base-chinese",
    "task": "text-classification"
  },
  "hyperparameters": {
    "learningRate": 0.0001,
    "batchSize": 32,
    "epochs": 10
  },
  "resources": {
    "instanceType": "gpu.a100.large",
    "instanceCount": 1
  },
  "isPublic": false
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "template": {
      "id": "template-abc123",
      "name": "bert-text-classification",
      "description": "BERT文本分类训练模板",
      "model": {
        "baseModel": "bert-base-chinese",
        "task": "text-classification"
      },
      "hyperparameters": {
        "learningRate": 0.0001,
        "batchSize": 32,
        "epochs": 10
      },
      "resources": {
        "instanceType": "gpu.a100.large",
        "instanceCount": 1
      },
      "isPublic": false,
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "训练模板创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 6.2 使用模板创建训练任务

使用模板创建训练任务。

**请求**

```http
POST /v1/training/templates/{templateId}/create-job
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "bert-fine-tuning-from-template",
  "datasetId": "dataset-abc123",
  "overrides": {
    "hyperparameters": {
      "epochs": 15
    }
  }
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job-def456",
      "name": "bert-fine-tuning-from-template",
      "templateId": "template-abc123",
      "status": "pending",
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "训练任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

## 错误代码

| 错误代码 | 描述 | HTTP状态码 |
|----------|------|------------|
| E1101 | 训练任务不存在 | 404 |
| E1102 | 数据集不存在 | 404 |
| E1103 | 资源不足 | 503 |
| E1104 | 训练失败 | 500 |
| E1105 | 模型导出失败 | 500 |
| E1106 | 调优任务失败 | 500 |
| E1107 | 权限不足 | 403 |
| E1108 | 参数无效 | 400 |

## 使用示例

### JavaScript/TypeScript

```typescript
import { TrainingService } from '@yyc3/sdk';

const trainingService = new TrainingService({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yyc3.com'
});

// 创建训练任务
const job = await trainingService.createJob({
  name: 'bert-fine-tuning',
  model: {
    baseModel: 'bert-base-chinese',
    task: 'text-classification'
  },
  dataset: {
    id: 'dataset-abc123',
    validationSplit: 0.2,
    testSplit: 0.1
  },
  hyperparameters: {
    learningRate: 0.0001,
    batchSize: 32,
    epochs: 10
  },
  resources: {
    instanceType: 'gpu.a100.large',
    instanceCount: 1
  }
});

console.log('训练任务创建成功:', job);

// 查询训练状态
const status = await trainingService.getJobStatus(job.id);
console.log('训练进度:', status.progress);

// 获取训练日志
const logs = await trainingService.getJobLogs(job.id);
console.log('训练日志:', logs);
```

### Python

```python
from yyc3 import TrainingService

training_service = TrainingService(
    api_key='your-api-key',
    base_url='https://api.yyc3.com'
)

# 创建训练任务
job = training_service.create_job(
    name='bert-fine-tuning',
    model={
        'base_model': 'bert-base-chinese',
        'task': 'text-classification'
    },
    dataset={
        'id': 'dataset-abc123',
        'validation_split': 0.2,
        'test_split': 0.1
    },
    hyperparameters={
        'learning_rate': 0.0001,
        'batch_size': 32,
        'epochs': 10
    },
    resources={
        'instance_type': 'gpu.a100.large',
        'instance_count': 1
    }
)

print(f'训练任务创建成功: {job}')

# 查询训练状态
status = training_service.get_job_status(job.id)
print(f'训练进度: {status.progress}')

# 获取训练日志
logs = training_service.get_job_logs(job.id)
print(f'训练日志: {logs}')
```

## 最佳实践

1. **训练配置**
   - 合理设置超参数初始值
   - 使用验证集防止过拟合
   - 启用早停机制节省资源

2. **资源管理**
   - 根据模型大小选择合适的实例
   - 使用分布式训练加速大模型训练
   - 监控资源使用情况

3. **监控和调优**
   - 实时监控训练指标
   - 使用超参数调优找到最佳配置
   - 定期保存检查点

4. **成本控制**
   - 估算训练成本并设置预算
   - 使用早停机制避免浪费
   - 选择性价比高的实例类型

5. **安全考虑**
   - 保护训练数据隐私
   - 加密存储训练模型
   - 控制训练任务访问权限

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
