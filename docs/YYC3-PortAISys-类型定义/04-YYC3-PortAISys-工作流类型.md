# YYC³ PortAISys - 工作流类型

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 工作流类型定义包含所有工作流和节点相关的数据类型和接口。

## 概述

工作流类型定义提供了 YYC³ PortAISys 系统中工作流管理、节点执行、流程控制等相关类型。

---

## 工作流类型

### IWorkflow

工作流接口。

```typescript
interface IWorkflow extends INamedEntity {
  /**
   * 工作流描述
   */
  description?: string;

  /**
   * 工作流节点列表
   */
  nodes: IWorkflowNode[];

  /**
   * 工作流边列表
   */
  edges: IWorkflowEdge[];

  /**
   * 工作流状态
   */
  status: WorkflowStatus;

  /**
   * 工作流版本
   */
  version: string;

  /**
   * 工作流标签
   */
  tags?: string[];

  /**
   * 工作流元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const workflow: IWorkflow = {
  id: 'workflow-123',
  name: '数据处理工作流',
  description: '处理用户上传的数据',
  nodes: [
    {
      id: 'node-1',
      type: 'data-processor',
      name: '数据处理器',
      config: { format: 'json' }
    }
  ],
  edges: [
    {
      from: 'node-1',
      to: 'node-2',
      condition: { success: true }
    }
  ],
  status: WorkflowStatus.ACTIVE,
  version: '1.0.0',
  tags: ['data-processing', 'automation'],
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### WorkflowStatus

工作流状态枚举。

```typescript
enum WorkflowStatus {
  /**
   * 草稿状态
   */
  DRAFT = 'draft',

  /**
   * 活跃状态
   */
  ACTIVE = 'active',

  /**
   * 非活跃状态
   */
  INACTIVE = 'inactive',

  /**
   * 已删除状态
   */
  DELETED = 'deleted',

  /**
   * 归档状态
   */
  ARCHIVED = 'archived'
}

/**
 * 示例
 */
const status: WorkflowStatus = WorkflowStatus.ACTIVE;
```

### ICreateWorkflowRequest

创建工作流请求接口。

```typescript
interface ICreateWorkflowRequest {
  /**
   * 工作流名称
   */
  name: string;

  /**
   * 工作流描述
   */
  description?: string;

  /**
   * 工作流节点列表
   */
  nodes: IWorkflowNode[];

  /**
   * 工作流边列表
   */
  edges: IWorkflowEdge[];

  /**
   * 工作流标签
   */
  tags?: string[];

  /**
   * 工作流元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const createWorkflowRequest: ICreateWorkflowRequest = {
  name: '数据处理工作流',
  description: '处理用户上传的数据',
  nodes: [
    {
      id: 'node-1',
      type: 'data-processor',
      name: '数据处理器',
      config: { format: 'json' }
    }
  ],
  edges: [
    {
      from: 'node-1',
      to: 'node-2',
      condition: { success: true }
    }
  ],
  tags: ['data-processing', 'automation']
};
```

---

## 节点类型

### IWorkflowNode

工作流节点接口。

```typescript
interface IWorkflowNode {
  /**
   * 节点 ID
   */
  id: ID;

  /**
   * 节点类型
   */
  type: string;

  /**
   * 节点名称
   */
  name: string;

  /**
   * 节点描述
   */
  description?: string;

  /**
   * 节点配置
   */
  config?: Record<string, any>;

  /**
   * 节点位置
   */
  position?: {
    /**
     * X 坐标
     */
    x: number;

    /**
     * Y 坐标
     */
    y: number;
  };

  /**
   * 节点元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const node: IWorkflowNode = {
  id: 'node-1',
  type: 'data-processor',
  name: '数据处理器',
  description: '处理输入数据',
  config: {
    format: 'json',
    validate: true
  },
  position: { x: 100, y: 100 },
  metadata: {
    category: 'data-processing'
  }
};
```

### NodeType

节点类型枚举。

```typescript
enum NodeType {
  /**
   * 数据处理器
   */
  DATA_PROCESSOR = 'data-processor',

  /**
   * AI 分析器
   */
  AI_ANALYZER = 'ai-analyzer',

  /**
   * 数据转换器
   */
  DATA_TRANSFORMER = 'data-transformer',

  /**
   * 条件分支
   */
  CONDITION_BRANCH = 'condition-branch',

  /**
   * 循环节点
   */
  LOOP = 'loop',

  /**
   * 并行节点
   */
  PARALLEL = 'parallel',

  /**
   * 合并节点
   */
  MERGE = 'merge',

  /**
   * 输出节点
   */
  OUTPUT = 'output',

  /**
   * 自定义节点
   */
  CUSTOM = 'custom'
}

/**
 * 示例
 */
const nodeType: NodeType = NodeType.AI_ANALYZER;
```

---

## 边类型

### IWorkflowEdge

工作流边接口。

```typescript
interface IWorkflowEdge {
  /**
   * 边 ID
   */
  id: ID;

  /**
   * 源节点 ID
   */
  from: ID;

  /**
   * 目标节点 ID
   */
  to: ID;

  /**
   * 边条件
   */
  condition?: Record<string, any>;

  /**
   * 边标签
   */
  label?: string;

  /**
   * 边元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const edge: IWorkflowEdge = {
  id: 'edge-1',
  from: 'node-1',
  to: 'node-2',
  condition: {
    success: true,
    data: { type: 'json' }
  },
  label: '成功',
  metadata: {
    priority: 'high'
  }
};
```

---

## 执行类型

### IWorkflowExecution

工作流执行接口。

```typescript
interface IWorkflowExecution extends IBaseEntity {
  /**
   * 工作流 ID
   */
  workflowId: ID;

  /**
   * 工作流名称
   */
  workflowName: string;

  /**
   * 执行用户 ID
   */
  userId?: ID;

  /**
   * 执行状态
   */
  status: ExecutionStatus;

  /**
   * 执行输入
   */
  input?: Record<string, any>;

  /**
   * 执行输出
   */
  output?: Record<string, any>;

  /**
   * 执行进度
   */
  progress?: {
    /**
     * 当前节点索引
     */
    currentNodeIndex?: number;

    /**
     * 总节点数
     */
    totalNodes?: number;

    /**
     * 进度百分比
     */
    percentage?: number;
  };

  /**
   * 执行错误
   */
  error?: {
    /**
     * 错误代码
     */
    code: string;

    /**
     * 错误消息
     */
    message: string;

    /**
     * 错误节点 ID
     */
    nodeId?: ID;

    /**
     * 错误详情
     */
    details?: any;
  };

  /**
   * 执行开始时间
   */
  startedAt?: Timestamp;

  /**
   * 执行完成时间
   */
  completedAt?: Timestamp;

  /**
   * 执行持续时间（毫秒）
   */
  duration?: number;
}

/**
 * 示例
 */
const execution: IWorkflowExecution = {
  id: 'exec-abc123',
  workflowId: 'workflow-123',
  workflowName: '数据处理工作流',
  userId: 'user-456',
  status: ExecutionStatus.COMPLETED,
  input: {
    fileId: 'file-789'
  },
  output: {
    resultFileId: 'file-def456',
    recordsProcessed: 1000
  },
  progress: {
    currentNodeIndex: 5,
    totalNodes: 5,
    percentage: 100
  },
  startedAt: '2026-02-03T10:00:00.000Z',
  completedAt: '2026-02-03T10:05:00.000Z',
  duration: 300000,
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:05:00.000Z'
};
```

### ExecutionStatus

执行状态枚举。

```typescript
enum ExecutionStatus {
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
  PAUSED = 'paused',

  /**
   * 已超时
   */
  TIMEOUT = 'timeout'
}

/**
 * 示例
 */
const status: ExecutionStatus = ExecutionStatus.RUNNING;
```

### IExecuteWorkflowRequest

执行工作流请求接口。

```typescript
interface IExecuteWorkflowRequest {
  /**
   * 工作流 ID
   */
  workflowId: ID;

  /**
   * 执行输入
   */
  input?: Record<string, any>;

  /**
   * 执行选项
   */
  options?: {
    /**
     * 是否异步执行
     */
    async?: boolean;

    /**
     * 超时时间（毫秒）
     */
    timeout?: number;

    /**
     * 是否调试模式
     */
    debug?: boolean;

    /**
     * 回调 URL
     */
    callbackUrl?: URL;
  };

  /**
   * 执行元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const executeWorkflowRequest: IExecuteWorkflowRequest = {
  workflowId: 'workflow-123',
  input: {
    fileId: 'file-789'
  },
  options: {
    async: true,
    timeout: 300000,
    debug: false
  }
};
```

---

## 节点执行类型

### INodeExecution

节点执行接口。

```typescript
interface INodeExecution extends IBaseEntity {
  /**
   * 执行 ID
   */
  executionId: ID;

  /**
   * 节点 ID
   */
  nodeId: ID;

  /**
   * 节点名称
   */
  nodeName: string;

  /**
   * 节点类型
   */
  nodeType: string;

  /**
   * 执行状态
   */
  status: ExecutionStatus;

  /**
   * 节点输入
   */
  input?: Record<string, any>;

  /**
   * 节点输出
   */
  output?: Record<string, any>;

  /**
   * 执行错误
   */
  error?: {
    /**
     * 错误代码
     */
    code: string;

    /**
     * 错误消息
     */
    message: string;

    /**
     * 错误详情
     */
    details?: any;
  };

  /**
   * 执行开始时间
   */
  startedAt?: Timestamp;

  /**
   * 执行完成时间
   */
  completedAt?: Timestamp;

  /**
   * 执行持续时间（毫秒）
   */
  duration?: number;
}

/**
 * 示例
 */
const nodeExecution: INodeExecution = {
  id: 'node-exec-abc123',
  executionId: 'exec-xyz789',
  nodeId: 'node-1',
  nodeName: '数据处理器',
  nodeType: 'data-processor',
  status: ExecutionStatus.COMPLETED,
  input: {
    data: { type: 'json' }
  },
  output: {
    result: { processed: true }
  },
  startedAt: '2026-02-03T10:00:00.000Z',
  completedAt: '2026-02-03T10:01:00.000Z',
  duration: 60000,
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:01:00.000Z'
};
```

---

## 工作流模板类型

### IWorkflowTemplate

工作流模板接口。

```typescript
interface IWorkflowTemplate extends INamedEntity {
  /**
   * 模板描述
   */
  description?: string;

  /**
   * 模板分类
   */
  category: string;

  /**
   * 模板标签
   */
  tags?: string[];

  /**
   * 模板图标
   */
  icon?: URL;

  /**
   * 模板缩略图
   */
  thumbnail?: URL;

  /**
   * 模板使用次数
   */
  usageCount?: number;

  /**
   * 模板评分
   */
  rating?: number;

  /**
   * 模板作者
   */
  author?: string;

  /**
   * 模板元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const template: IWorkflowTemplate = {
  id: 'template-123',
  name: '数据处理模板',
  description: '标准数据处理工作流模板',
  category: 'data-processing',
  tags: ['data', 'processing', 'automation'],
  icon: 'https://cdn.yyc3.com/icons/template-123.png',
  thumbnail: 'https://cdn.yyc3.com/thumbnails/template-123.png',
  usageCount: 1250,
  rating: 4.5,
  author: 'YYC³',
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

---

## 使用示例

### 创建工作流

```typescript
import { ICreateWorkflowRequest, NodeType } from '@yyc3/types';

const createWorkflowRequest: ICreateWorkflowRequest = {
  name: '数据处理工作流',
  description: '处理用户上传的数据',
  nodes: [
    {
      id: 'node-1',
      type: NodeType.DATA_PROCESSOR,
      name: '数据处理器',
      config: { format: 'json' }
    },
    {
      id: 'node-2',
      type: NodeType.AI_ANALYZER,
      name: 'AI 分析器',
      config: { model: 'gpt-4' }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      from: 'node-1',
      to: 'node-2',
      condition: { success: true }
    }
  ]
};

const workflow = await workflowService.create(createWorkflowRequest);
```

### 执行工作流

```typescript
import { IExecuteWorkflowRequest } from '@yyc3/types';

const executeWorkflowRequest: IExecuteWorkflowRequest = {
  workflowId: 'workflow-123',
  input: {
    fileId: 'file-789'
  },
  options: {
    async: true,
    timeout: 300000,
    debug: false
  }
};

const execution = await workflowService.execute(executeWorkflowRequest);
```

### 查询执行状态

```typescript
import { IWorkflowExecution, ExecutionStatus } from '@yyc3/types';

const execution: IWorkflowExecution = await workflowService.getExecution('exec-abc123');

if (execution.status === ExecutionStatus.COMPLETED) {
  console.log('工作流执行完成', execution.output);
} else if (execution.status === ExecutionStatus.FAILED) {
  console.error('工作流执行失败', execution.error);
}
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
