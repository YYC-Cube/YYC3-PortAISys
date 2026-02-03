# YYC³ PortAISys - AI 模型类型

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys AI 模型类型定义包含所有 AI 相关的数据类型和接口。

## 概述

AI 模型类型定义提供了 YYC³ PortAISys 系统中 AI 模型、推理、训练等相关类型。

---

## 模型类型

### IModel

AI 模型接口。

```typescript
interface IModel extends IBaseEntity {
  /**
   * 模型名称
   */
  name: string;

  /**
   * 模型类型
   */
  type: ModelType;

  /**
   * 模型框架
   */
  framework: ModelFramework;

  /**
   * 模型版本
   */
  version: string;

  /**
   * 模型描述
   */
  description?: string;

  /**
   * 模型作者
   */
  author?: string;

  /**
   * 模型许可证
   */
  license?: string;

  /**
   * 模型参数数量
   */
  parameters?: number;

  /**
   * 模型层数
   */
  layers?: number;

  /**
   * 模型状态
   */
  status: ModelStatus;

  /**
   * 模型能力
   */
  capabilities: ModelCapability[];

  /**
   * 模型元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const model: IModel = {
  id: 'model-123',
  name: 'bert-base-chinese',
  type: ModelType.NLP,
  framework: ModelFramework.PYTORCH,
  version: '1.0.0',
  description: 'BERT 中文预训练模型',
  author: 'YYC³',
  license: 'MIT',
  parameters: 110000000,
  layers: 12,
  status: ModelStatus.ACTIVE,
  capabilities: [
    ModelCapability.TEXT_GENERATION,
    ModelCapability.TEXT_CLASSIFICATION
  ],
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### ModelType

模型类型枚举。

```typescript
enum ModelType {
  /**
   * 自然语言处理
   */
  NLP = 'nlp',

  /**
   * 计算机视觉
   */
  CV = 'cv',

  /**
   * 语音识别
   */
  ASR = 'asr',

  /**
   * 语音合成
   */
  TTS = 'tts',

  /**
   * 多模态
   */
  MULTIMODAL = 'multimodal',

  /**
   * 推荐系统
   */
  RECOMMENDATION = 'recommendation',

  /**
   * 强化学习
   */
  RL = 'rl'
}

/**
 * 示例
 */
const modelType: ModelType = ModelType.NLP;
```

### ModelFramework

模型框架枚举。

```typescript
enum ModelFramework {
  /**
   * PyTorch
   */
  PYTORCH = 'pytorch',

  /**
   * TensorFlow
   */
  TENSORFLOW = 'tensorflow',

  /**
   * Keras
   */
  KERAS = 'keras',

  /**
   * ONNX
   */
  ONNX = 'onnx',

  /**
   * Hugging Face
   */
  HUGGINGFACE = 'huggingface',

  /**
   * OpenAI
   */
  OPENAI = 'openai',

  /**
   * Anthropic
   */
  ANTHROPIC = 'anthropic',

  /**
   * Google AI
   */
  GOOGLE = 'google',

  /**
   * 自定义
   */
  CUSTOM = 'custom'
}

/**
 * 示例
 */
const framework: ModelFramework = ModelFramework.PYTORCH;
```

### ModelStatus

模型状态枚举。

```typescript
enum ModelStatus {
  /**
   * 训练中
   */
  TRAINING = 'training',

  /**
   * 已部署
   */
  DEPLOYED = 'deployed',

  /**
   * 活跃
   */
  ACTIVE = 'active',

  /**
   * 非活跃
   */
  INACTIVE = 'inactive',

  /**
   * 已删除
   */
  DELETED = 'deleted',

  /**
   * 失败
   */
  FAILED = 'failed',

  /**
   * 挂起
   */
  SUSPENDED = 'suspended'
}

/**
 * 示例
 */
const status: ModelStatus = ModelStatus.ACTIVE;
```

### ModelCapability

模型能力枚举。

```typescript
enum ModelCapability {
  /**
   * 文本生成
   */
  TEXT_GENERATION = 'text.generation',

  /**
   * 文本分类
   */
  TEXT_CLASSIFICATION = 'text.classification',

  /**
   * 文本嵌入
   */
  TEXT_EMBEDDING = 'text.embedding',

  /**
   * 图像分类
   */
  IMAGE_CLASSIFICATION = 'image.classification',

  /**
   * 图像生成
   */
  IMAGE_GENERATION = 'image.generation',

  /**
   * 图像检测
   */
  IMAGE_DETECTION = 'image.detection',

  /**
   * 语音识别
   */
  SPEECH_RECOGNITION = 'speech.recognition',

  /**
   * 语音合成
   */
  SPEECH_SYNTHESIS = 'speech.synthesis',

  /**
   * 函数调用
   */
  FUNCTION_CALLING = 'function.calling',

  /**
   * 代码生成
   */
  CODE_GENERATION = 'code.generation'
}

/**
 * 示例
 */
const capability: ModelCapability = ModelCapability.TEXT_GENERATION;
```

---

## 推理类型

### IInferenceRequest

推理请求接口。

```typescript
interface IInferenceRequest {
  /**
   * 模型 ID
   */
  modelId: ID;

  /**
   * 输入数据
   */
  input: any;

  /**
   * 推理参数
   */
  parameters?: {
    /**
     * 温度参数（0-2）
     */
    temperature?: number;

    /**
     * Top-P 采样
     */
    topP?: number;

    /**
     * Top-K 采样
     */
    topK?: number;

    /**
     * 频率惩罚
     */
    frequencyPenalty?: number;

    /**
     * 存在惩罚
     */
    presencePenalty?: number;

    /**
     * 最大生成长度
     */
    maxLength?: number;

    /**
     * 停止序列
     */
    stopSequences?: string[];
  };

  /**
   * 是否流式输出
   */
  stream?: boolean;

  /**
   * 请求 ID
   */
  requestId?: ID;
}

/**
 * 示例
 */
const inferenceRequest: IInferenceRequest = {
  modelId: 'model-123',
  input: '请写一首诗',
  parameters: {
    temperature: 0.7,
    topP: 0.9,
    maxLength: 1000
  },
  stream: false
};
```

### IInferenceResponse

推理响应接口。

```typescript
interface IInferenceResponse {
  /**
   * 推理 ID
   */
  inferenceId: ID;

  /**
   * 模型 ID
   */
  modelId: ID;

  /**
   * 输出数据
   */
  output: any;

  /**
   * 使用统计
   */
  usage?: {
    /**
     * 输入 Token 数
     */
    promptTokens?: number;

    /**
     * 输出 Token 数
     */
    completionTokens?: number;

    /**
     * 总 Token 数
     */
    totalTokens?: number;
  };

  /**
   * 推理延迟（毫秒）
   */
  latency?: number;

  /**
   * 推理时间戳
   */
  timestamp: Timestamp;
}

/**
 * 示例
 */
const inferenceResponse: IInferenceResponse = {
  inferenceId: 'infer-abc123',
  modelId: 'model-123',
  output: '这是一首诗...',
  usage: {
    promptTokens: 10,
    completionTokens: 50,
    totalTokens: 60
  },
  latency: 1250,
  timestamp: '2026-02-03T10:00:00.000Z'
};
```

---

## 对话类型

### IChatMessage

对话消息接口。

```typescript
interface IChatMessage {
  /**
   * 消息角色
   */
  role: ChatRole;

  /**
   * 消息内容
   */
  content: string;

  /**
   * 消息名称（可选）
   */
  name?: string;

  /**
   * 函数调用（可选）
   */
  functionCall?: {
    /**
     * 函数名称
     */
    name: string;

    /**
     * 函数参数
     */
    arguments: string;
  };

  /**
   * 消息元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const message: IChatMessage = {
  role: ChatRole.USER,
  content: '你好',
  metadata: {
    timestamp: '2026-02-03T10:00:00.000Z'
  }
};
```

### ChatRole

对话角色枚举。

```typescript
enum ChatRole {
  /**
   * 系统角色
   */
  SYSTEM = 'system',

  /**
   * 用户角色
   */
  USER = 'user',

  /**
   * 助手角色
   */
  ASSISTANT = 'assistant',

  /**
   * 函数角色
   */
  FUNCTION = 'function'
}

/**
 * 示例
 */
const role: ChatRole = ChatRole.USER;
```

### IChatRequest

对话请求接口。

```typescript
interface IChatRequest {
  /**
   * 模型 ID 或名称
   */
  model: string;

  /**
   * 对话消息列表
   */
  messages: IChatMessage[];

  /**
   * 对话参数
   */
  parameters?: {
    /**
     * 温度参数（0-2）
     */
    temperature?: number;

    /**
     * Top-P 采样
     */
    topP?: number;

    /**
     * Top-K 采样
     */
    topK?: number;

    /**
     * 频率惩罚
     */
    frequencyPenalty?: number;

    /**
     * 存在惩罚
     */
    presencePenalty?: number;

    /**
     * 最大 Token 数
     */
    maxTokens?: number;

    /**
     * 停止序列
     */
    stopSequences?: string[];
  };

  /**
   * 是否流式输出
   */
  stream?: boolean;

  /**
   * 函数定义
   */
  functions?: IFunctionDefinition[];

  /**
   * 函数调用模式
   */
  functionCall?: 'auto' | 'none' | { name: string };

  /**
   * 用户 ID
   */
  userId?: ID;

  /**
   * 会话 ID
   */
  sessionId?: ID;
}

/**
 * 示例
 */
const chatRequest: IChatRequest = {
  model: 'gpt-4',
  messages: [
    { role: ChatRole.SYSTEM, content: '你是一个专业的翻译助手' },
    { role: ChatRole.USER, content: '将以下英文翻译成中文：Hello World' }
  ],
  parameters: {
    temperature: 0.7,
    maxTokens: 1000
  }
};
```

### IChatResponse

对话响应接口。

```typescript
interface IChatResponse {
  /**
   * 对话 ID
   */
  chatId: ID;

  /**
   * 模型名称
   */
  model: string;

  /**
   * 消息选择列表
   */
  choices: IChatChoice[];

  /**
   * 使用统计
   */
  usage: {
    /**
     * 输入 Token 数
     */
    promptTokens: number;

    /**
     * 输出 Token 数
     */
    completionTokens: number;

    /**
     * 总 Token 数
     */
    totalTokens: number;
  };

  /**
   * 响应时间戳
   */
  timestamp: Timestamp;
}

/**
 * 示例
 */
const chatResponse: IChatResponse = {
  chatId: 'chat-abc123',
  model: 'gpt-4',
  choices: [
    {
      index: 0,
      message: {
        role: ChatRole.ASSISTANT,
        content: '你好！有什么可以帮助你的吗？'
      },
      finishReason: 'stop'
    }
  ],
  usage: {
    promptTokens: 10,
    completionTokens: 20,
    totalTokens: 30
  },
  timestamp: '2026-02-03T10:00:00.000Z'
};
```

### IChatChoice

对话选择接口。

```typescript
interface IChatChoice {
  /**
   * 选择索引
   */
  index: number;

  /**
   * 消息内容
   */
  message: IChatMessage;

  /**
   * 完成原因
   */
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call';
}

/**
 * 示例
 */
const choice: IChatChoice = {
  index: 0,
  message: {
    role: ChatRole.ASSISTANT,
    content: '你好！'
  },
  finishReason: 'stop'
};
```

---

## 函数类型

### IFunctionDefinition

函数定义接口。

```typescript
interface IFunctionDefinition {
  /**
   * 函数名称
   */
  name: string;

  /**
   * 函数描述
   */
  description?: string;

  /**
   * 函数参数
   */
  parameters?: {
    /**
     * 参数类型
     */
    type: 'object';

    /**
     * 参数属性
     */
    properties: Record<string, {
      /**
       * 参数类型
       */
      type: string;

      /**
       * 参数描述
       */
      description?: string;

      /**
       * 枚举值
       */
      enum?: string[];
    }>;

    /**
     * 必填参数
     */
    required?: string[];
  };
}

/**
 * 示例
 */
const functionDefinition: IFunctionDefinition = {
  name: 'get_weather',
  description: '获取指定城市的天气信息',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: '城市名称'
      },
      unit: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        description: '温度单位'
      }
    },
    required: ['city']
  }
};
```

---

## 训练类型

### ITrainingJob

训练任务接口。

```typescript
interface ITrainingJob extends IBaseEntity {
  /**
   * 任务名称
   */
  name: string;

  /**
   * 任务描述
   */
  description?: string;

  /**
   * 基础模型
   */
  baseModel: {
    /**
     * 模型 ID
     */
    modelId: ID;

    /**
     * 模型名称
     */
    name: string;

    /**
     * 任务类型
     */
    task: string;

    /**
     * 架构类型
     */
    architecture: string;
  };

  /**
   * 数据集配置
   */
  dataset: {
    /**
     * 数据集 ID
     */
    id: ID;

    /**
     * 验证集比例
     */
    validationSplit?: number;

    /**
     * 测试集比例
     */
    testSplit?: number;
  };

  /**
   * 超参数
   */
  hyperparameters: {
    /**
     * 学习率
     */
    learningRate?: number;

    /**
     * 批次大小
     */
    batchSize?: number;

    /**
     * 训练轮数
     */
    epochs?: number;

    /**
     * 预热步数
     */
    warmupSteps?: number;

    /**
     * 权重衰减
     */
    weightDecay?: number;

    /**
     * 梯度裁剪
     */
    gradientClipping?: number;
  };

  /**
   * 资源配置
   */
  resources: {
    /**
     * 实例类型
     */
    instanceType: string;

    /**
     * 实例数量
     */
    instanceCount: number;

    /**
     * 是否分布式训练
     */
    distributed?: boolean;
  };

  /**
   * 输出配置
   */
  output: {
    /**
     * 检查点间隔
     */
    checkpointInterval?: number;

    /**
     * 是否只保存最佳模型
     */
    saveBestOnly?: boolean;

    /**
     * 导出格式
     */
    exportFormat?: 'pytorch' | 'tensorflow' | 'onnx';
  };

  /**
   * 任务状态
   */
  status: TrainingStatus;

  /**
   * 训练进度
   */
  progress?: {
    /**
     * 当前轮数
     */
    currentEpoch?: number;

    /**
     * 总轮数
     */
    totalEpochs?: number;

    /**
     * 当前步数
     */
    currentStep?: number;

    /**
     * 总步数
     */
    totalSteps?: number;

    /**
     * 进度百分比
     */
    percentage?: number;
  };

  /**
   * 训练指标
   */
  metrics?: {
    /**
     * 训练损失
     */
    trainLoss?: number;

    /**
     * 验证损失
     */
    valLoss?: number;

    /**
     * 准确率
     */
    accuracy?: number;

    /**
     * F1 分数
     */
    f1Score?: number;
  };
}

/**
 * 示例
 */
const trainingJob: ITrainingJob = {
  id: 'train-123',
  name: 'BERT 微调任务',
  description: '在中文数据集上微调 BERT 模型',
  baseModel: {
    modelId: 'model-456',
    name: 'bert-base-chinese',
    task: 'text-classification',
    architecture: 'transformer'
  },
  dataset: {
    id: 'dataset-789',
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
  },
  status: TrainingStatus.RUNNING,
  progress: {
    currentEpoch: 5,
    totalEpochs: 10,
    percentage: 50
  },
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### TrainingStatus

训练状态枚举。

```typescript
enum TrainingStatus {
  /**
   * 等待中
   */
  PENDING = 'pending',

  /**
   * 运行中
   */
  RUNNING = 'running',

  /**
   * 已完成
   */
  COMPLETED = 'completed',

  /**
   * 已失败
   */
  FAILED = 'failed',

  /**
   * 已取消
   */
  CANCELLED = 'cancelled',

  /**
   * 已暂停
   */
  PAUSED = 'paused'
}

/**
 * 示例
 */
const status: TrainingStatus = TrainingStatus.RUNNING;
```

---

## 使用示例

### 创建推理请求

```typescript
import { IInferenceRequest, ModelType } from '@yyc3/types';

const request: IInferenceRequest = {
  modelId: 'model-123',
  input: '请写一首诗',
  parameters: {
    temperature: 0.7,
    topP: 0.9,
    maxLength: 1000
  }
};
```

### 创建对话请求

```typescript
import { IChatRequest, ChatRole } from '@yyc3/types';

const request: IChatRequest = {
  model: 'gpt-4',
  messages: [
    { role: ChatRole.SYSTEM, content: '你是一个专业的翻译助手' },
    { role: ChatRole.USER, content: '将以下英文翻译成中文：Hello World' }
  ],
  parameters: {
    temperature: 0.7,
    maxTokens: 1000
  }
};
```

### 定义函数

```typescript
import { IFunctionDefinition } from '@yyc3/types';

const getWeatherFunction: IFunctionDefinition = {
  name: 'get_weather',
  description: '获取指定城市的天气信息',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: '城市名称'
      },
      unit: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        description: '温度单位'
      }
    },
    required: ['city']
  }
};
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
