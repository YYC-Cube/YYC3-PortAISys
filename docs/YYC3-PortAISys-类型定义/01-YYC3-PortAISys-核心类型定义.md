# YYC³ PortAISys - 核心类型定义

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 核心类型定义包含所有基础数据类型和通用接口。

## 概述

核心类型定义提供了 YYC³ PortAISys 系统中使用的基础数据类型和通用接口，这些类型被其他所有模块共享和使用。

---

## 基础类型

### ID

唯一标识符类型。

```typescript
type ID = string;

/**
 * 示例
 */
const userId: ID = 'user-123';
const fileId: ID = 'file-abc123';
```

### Timestamp

时间戳类型。

```typescript
type Timestamp = string;

/**
 * ISO 8601 格式的时间戳
 */
const createdAt: Timestamp = '2026-02-03T10:00:00.000Z';
```

### Email

电子邮件类型。

```typescript
type Email = string;

/**
 * 验证电子邮件格式
 */
const email: Email = 'user@example.com';
```

### URL

统一资源定位符类型。

```typescript
type URL = string;

/**
 * HTTP/HTTPS URL
 */
const url: URL = 'https://api.yyc3.com/v1/users';
```

---

## 通用接口

### IBaseEntity

基础实体接口，所有实体都应实现此接口。

```typescript
interface IBaseEntity {
  /**
   * 实体唯一标识符
   */
  id: ID;

  /**
   * 创建时间
   */
  createdAt: Timestamp;

  /**
   * 更新时间
   */
  updatedAt: Timestamp;
}

/**
 * 示例
 */
const user: IBaseEntity = {
  id: 'user-123',
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### INamedEntity

命名实体接口，扩展基础实体接口。

```typescript
interface INamedEntity extends IBaseEntity {
  /**
   * 实体名称
   */
  name: string;

  /**
   * 实体描述
   */
  description?: string;
}

/**
 * 示例
 */
const workflow: INamedEntity = {
  id: 'workflow-123',
  name: '数据处理工作流',
  description: '处理用户上传的数据',
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### IMetadataEntity

元数据实体接口。

```typescript
interface IMetadataEntity {
  /**
   * 元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const file: IMetadataEntity = {
  metadata: {
    author: 'John Doe',
    version: '1.0.0',
    tags: ['document', 'pdf']
  }
};
```

---

## 响应类型

### ISuccessResponse

成功响应接口。

```typescript
interface ISuccessResponse<T> {
  /**
   * 请求是否成功
   */
  success: true;

  /**
   * 响应数据
   */
  data: T;

  /**
   * 响应消息
   */
  message?: string;

  /**
   * 响应时间戳
   */
  timestamp: Timestamp;
}

/**
 * 示例
 */
const response: ISuccessResponse<User> = {
  success: true,
  data: {
    id: 'user-123',
    name: 'John Doe'
  },
  message: '操作成功',
  timestamp: '2026-02-03T10:00:00.000Z'
};
```

### IErrorResponse

错误响应接口。

```typescript
interface IErrorResponse {
  /**
   * 请求是否成功
   */
  success: false;

  /**
   * 错误信息
   */
  error: {
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
   * 响应时间戳
   */
  timestamp: Timestamp;
}

/**
 * 示例
 */
const errorResponse: IErrorResponse = {
  success: false,
  error: {
    code: 'INVALID_PARAMETER',
    message: '参数无效',
    details: {
      field: 'email',
      reason: '格式不正确'
    }
  },
  timestamp: '2026-02-03T10:00:00.000Z'
};
```

### IPaginatedResponse

分页响应接口。

```typescript
interface IPaginatedResponse<T> {
  /**
   * 数据列表
   */
  items: T[];

  /**
   * 分页信息
   */
  pagination: {
    /**
     * 当前页码
     */
    page: number;

    /**
     * 每页数量
     */
    pageSize: number;

    /**
     * 总数量
     */
    total: number;

    /**
     * 总页数
     */
    totalPages: number;
  };
}

/**
 * 示例
 */
const paginatedResponse: IPaginatedResponse<User> = {
  items: [
    { id: 'user-123', name: 'John Doe' },
    { id: 'user-456', name: 'Jane Doe' }
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 100,
    totalPages: 5
  }
};
```

---

## 请求类型

### IBaseRequest

基础请求接口。

```typescript
interface IBaseRequest {
  /**
   * 请求 ID（用于追踪）
   */
  requestId?: ID;

  /**
   * 超时时间（毫秒）
   */
  timeout?: number;
}

/**
 * 示例
 */
const request: IBaseRequest = {
  requestId: 'req-abc123',
  timeout: 30000
};
```

### IQueryRequest

查询请求接口。

```typescript
interface IQueryRequest {
  /**
   * 查询参数
   */
  query?: Record<string, any>;

  /**
   * 排序字段
   */
  sortBy?: string;

  /**
   * 排序方向
   */
  sortOrder?: 'asc' | 'desc';

  /**
   * 分页页码
   */
  page?: number;

  /**
   * 每页数量
   */
  pageSize?: number;
}

/**
 * 示例
 */
const queryRequest: IQueryRequest = {
  query: { status: 'active' },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20
};
```

---

## 配置类型

### IConfig

基础配置接口。

```typescript
interface IConfig {
  /**
   * 配置名称
   */
  name: string;

  /**
   * 配置值
   */
  value: any;

  /**
   * 配置描述
   */
  description?: string;

  /**
   * 是否为敏感配置
   */
  sensitive?: boolean;
}

/**
 * 示例
 */
const config: IConfig = {
  name: 'api.timeout',
  value: 30000,
  description: 'API 请求超时时间（毫秒）',
  sensitive: false
};
```

---

## 枚举类型

### Environment

环境枚举。

```typescript
enum Environment {
  /**
   * 开发环境
   */
  DEVELOPMENT = 'development',

  /**
   * 测试环境
   */
  STAGING = 'staging',

  /**
   * 生产环境
   */
  PRODUCTION = 'production'
}

/**
 * 示例
 */
const env: Environment = Environment.PRODUCTION;
```

### Status

状态枚举。

```typescript
enum Status {
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
   * 挂起状态
   */
  SUSPENDED = 'suspended',

  /**
   * 处理中状态
   */
  PENDING = 'pending',

  /**
   * 已完成状态
   */
  COMPLETED = 'completed',

  /**
   * 失败状态
   */
  FAILED = 'failed'
}

/**
 * 示例
 */
const status: Status = Status.ACTIVE;
```

---

## 常量

### 常量定义

```typescript
/**
 * 默认分页大小
 */
const DEFAULT_PAGE_SIZE = 20;

/**
 * 最大分页大小
 */
const MAX_PAGE_SIZE = 100;

/**
 * 默认超时时间（毫秒）
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * 最大重试次数
 */
const MAX_RETRY_COUNT = 3;

/**
 * 重试延迟（毫秒）
 */
const RETRY_DELAY = 1000;
```

---

## 类型工具

### Partial<T>

将类型 T 的所有属性变为可选。

```typescript
type PartialUser = Partial<User>;

/**
 * 示例
 */
const partialUser: PartialUser = {
  name: 'John Doe'
};
```

### Required<T>

将类型 T 的所有属性变为必填。

```typescript
type RequiredUser = Required<Partial<User>>;

/**
 * 示例
 */
const requiredUser: RequiredUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
};
```

### Pick<T, K>

从类型 T 中选择属性 K。

```typescript
type UserName = Pick<User, 'name' | 'email'>;

/**
 * 示例
 */
const userName: UserName = {
  name: 'John Doe',
  email: 'john@example.com'
};
```

### Omit<T, K>

从类型 T 中排除属性 K。

```typescript
type UserWithoutPassword = Omit<User, 'password'>;

/**
 * 示例
 */
const userWithoutPassword: UserWithoutPassword = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
};
```

---

## 使用示例

### 创建实体

```typescript
import { IBaseEntity, INamedEntity } from '@yyc3/types';

class User implements INamedEntity {
  id: ID;
  name: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  constructor(data: INamedEntity) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
```

### 创建响应

```typescript
import { ISuccessResponse, IErrorResponse } from '@yyc3/types';

function createSuccessResponse<T>(data: T, message?: string): ISuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

function createErrorResponse(code: string, message: string, details?: any): IErrorResponse {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString()
  };
}
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
