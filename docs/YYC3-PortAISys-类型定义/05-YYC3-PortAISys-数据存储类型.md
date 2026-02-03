# YYC³ PortAISys - 数据存储类型

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 数据存储类型定义包含所有数据存储和查询相关的数据类型和接口。

## 概述

数据存储类型定义提供了 YYC³ PortAISys 系统中数据存储、查询、索引等相关类型。

---

## 数据类型

### IData

数据接口。

```typescript
interface IData extends IBaseEntity {
  /**
   * 数据键
   */
  key: string;

  /**
   * 数据值
   */
  value: any;

  /**
   * 数据类型
   */
  dataType: DataType;

  /**
   * 数据大小（字节）
   */
  size?: number;

  /**
   * 数据版本
   */
  version?: number;

  /**
   * 数据过期时间
   */
  expiresAt?: Timestamp;

  /**
   * 数据标签
   */
  tags?: string[];

  /**
   * 数据元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const data: IData = {
  id: 'data-123',
  key: 'user:123:profile',
  value: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  dataType: DataType.JSON,
  size: 1024,
  version: 1,
  tags: ['user', 'profile'],
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### DataType

数据类型枚举。

```typescript
enum DataType {
  /**
   * 字符串类型
   */
  STRING = 'string',

  /**
   * 数字类型
   */
  NUMBER = 'number',

  /**
   * 布尔类型
   */
  BOOLEAN = 'boolean',

  /**
   * JSON 类型
   */
  JSON = 'json',

  /**
   * 数组类型
   */
  ARRAY = 'array',

  /**
   * 二进制类型
   */
  BINARY = 'binary',

  /**
   * 日期类型
   */
  DATE = 'date',

  /**
   * 对象类型
   */
  OBJECT = 'object'
}

/**
 * 示例
 */
const dataType: DataType = DataType.JSON;
```

---

## 查询类型

### IQuery

查询接口。

```typescript
interface IQuery {
  /**
   * 查询条件
   */
  filter?: IQueryFilter;

  /**
   * 排序条件
   */
  sort?: IQuerySort[];

  /**
   * 分页条件
   */
  pagination?: IQueryPagination;

  /**
   * 投影字段
   */
  projection?: string[];

  /**
   * 聚合条件
   */
  aggregation?: IQueryAggregation;
}

/**
 * 示例
 */
const query: IQuery = {
  filter: {
    field: 'status',
    operator: 'eq',
    value: 'active'
  },
  sort: [
    {
      field: 'createdAt',
      order: 'desc'
    }
  ],
  pagination: {
    page: 1,
    pageSize: 20
  }
};
```

### IQueryFilter

查询过滤接口。

```typescript
interface IQueryFilter {
  /**
   * 字段名
   */
  field: string;

  /**
   * 操作符
   */
  operator: QueryOperator;

  /**
   * 值
   */
  value: any;

  /**
   * 逻辑操作符
   */
  logic?: 'and' | 'or';

  /**
   * 嵌套过滤条件
   */
  filters?: IQueryFilter[];
}

/**
 * 示例
 */
const filter: IQueryFilter = {
  field: 'status',
  operator: QueryOperator.EQ,
  value: 'active',
  logic: 'and',
  filters: [
    {
      field: 'createdAt',
      operator: QueryOperator.GTE,
      value: '2026-01-01T00:00:00.000Z'
    }
  ]
};
```

### QueryOperator

查询操作符枚举。

```typescript
enum QueryOperator {
  /**
   * 等于
   */
  EQ = 'eq',

  /**
   * 不等于
   */
  NE = 'ne',

  /**
   * 大于
   */
  GT = 'gt',

  /**
   * 大于等于
   */
  GTE = 'gte',

  /**
   * 小于
   */
  LT = 'lt',

  /**
   * 小于等于
   */
  LTE = 'lte',

  /**
   * 包含
   */
  IN = 'in',

  /**
   * 不包含
   */
  NIN = 'nin',

  /**
   * 包含字符串
   */
  CONTAINS = 'contains',

  /**
   * 以...开头
   */
  STARTS_WITH = 'starts_with',

  /**
   * 以...结尾
   */
  ENDS_WITH = 'ends_with',

  /**
   * 正则匹配
   */
  REGEX = 'regex',

  /**
   * 为空
   */
  IS_NULL = 'is_null',

  /**
   * 不为空
   */
  IS_NOT_NULL = 'is_not_null'
}

/**
 * 示例
 */
const operator: QueryOperator = QueryOperator.EQ;
```

### IQuerySort

查询排序接口。

```typescript
interface IQuerySort {
  /**
   * 字段名
   */
  field: string;

  /**
   * 排序方向
   */
  order: 'asc' | 'desc';
}

/**
 * 示例
 */
const sort: IQuerySort = {
  field: 'createdAt',
  order: 'desc'
};
```

### IQueryPagination

查询分页接口。

```typescript
interface IQueryPagination {
  /**
   * 页码
   */
  page: number;

  /**
   * 每页数量
   */
  pageSize: number;

  /**
   * 游标
   */
  cursor?: string;
}

/**
 * 示例
 */
const pagination: IQueryPagination = {
  page: 1,
  pageSize: 20
};
```

### IQueryAggregation

查询聚合接口。

```typescript
interface IQueryAggregation {
  /**
   * 聚合类型
   */
  type: AggregationType;

  /**
   * 聚合字段
   */
  field: string;

  /**
   * 聚合别名
   */
  alias?: string;

  /**
   * 分组字段
   */
  groupBy?: string;
}

/**
 * 示例
 */
const aggregation: IQueryAggregation = {
  type: AggregationType.COUNT,
  field: 'id',
  alias: 'total',
  groupBy: 'status'
};
```

### AggregationType

聚合类型枚举。

```typescript
enum AggregationType {
  /**
   * 计数
   */
  COUNT = 'count',

  /**
   * 求和
   */
  SUM = 'sum',

  /**
   * 平均值
   */
  AVG = 'avg',

  /**
   * 最小值
   */
  MIN = 'min',

  /**
   * 最大值
   */
  MAX = 'max',

  /**
   * 去重计数
   */
  DISTINCT_COUNT = 'distinct_count',

  /**
   * 标准差
   */
  STDDEV = 'stddev',

  /**
   * 方差
   */
  VARIANCE = 'variance'
}

/**
 * 示例
 */
const aggregationType: AggregationType = AggregationType.COUNT;
```

---

## 索引类型

### IIndex

索引接口。

```typescript
interface IIndex extends IBaseEntity {
  /**
   * 索引名称
   */
  name: string;

  /**
   * 索引字段
   */
  fields: string[];

  /**
   * 索引类型
   */
  type: IndexType;

  /**
   * 索引选项
   */
  options?: {
    /**
     * 是否唯一索引
     */
    unique?: boolean;

    /**
     * 是否稀疏索引
     */
    sparse?: boolean;

    /**
     * 权重
     */
    weights?: Record<string, number>;
  };

  /**
   * 索引状态
   */
  status: IndexStatus;

  /**
   * 索引大小（字节）
   */
  size?: number;

  /**
   * 索引元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const index: IIndex = {
  id: 'index-123',
  name: 'user_email_index',
  fields: ['email'],
  type: IndexType.SINGLE,
  options: {
    unique: true
  },
  status: IndexStatus.ACTIVE,
  size: 1024,
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### IndexType

索引类型枚举。

```typescript
enum IndexType {
  /**
   * 单字段索引
   */
  SINGLE = 'single',

  /**
   * 复合索引
   */
  COMPOUND = 'compound',

  /**
   * 多键索引
   */
  MULTIKEY = 'multikey',

  /**
   * 文本索引
   */
  TEXT = 'text',

  /**
   * 地理空间索引
   */
  GEOSPATIAL = 'geospatial',

  /**
   * 哈希索引
   */
  HASHED = 'hashed'
}

/**
 * 示例
 */
const indexType: IndexType = IndexType.SINGLE;
```

### IndexStatus

索引状态枚举。

```typescript
enum IndexStatus {
  /**
   * 构建中
   */
  BUILDING = 'building',

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
   * 错误
   */
  ERROR = 'error'
}

/**
 * 示例
 */
const indexStatus: IndexStatus = IndexStatus.ACTIVE;
```

---

## 事务类型

### ITransaction

事务接口。

```typescript
interface ITransaction extends IBaseEntity {
  /**
   * 事务 ID
   */
  transactionId: ID;

  /**
   * 事务状态
   */
  status: TransactionStatus;

  /**
   * 事务操作列表
   */
  operations: ITransactionOperation[];

  /**
   * 事务开始时间
   */
  startedAt: Timestamp;

  /**
   * 事务完成时间
   */
  completedAt?: Timestamp;

  /**
   * 事务持续时间（毫秒）
   */
  duration?: number;

  /**
   * 事务元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const transaction: ITransaction = {
  id: 'trans-123',
  transactionId: 'trans-abc123',
  status: TransactionStatus.COMMITTED,
  operations: [
    {
      type: 'create',
      collection: 'users',
      data: { name: 'John Doe' }
    }
  ],
  startedAt: '2026-02-03T10:00:00.000Z',
  completedAt: '2026-02-03T10:00:00.100Z',
  duration: 100,
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.100Z'
};
```

### TransactionStatus

事务状态枚举。

```typescript
enum TransactionStatus {
  /**
   * 进行中
   */
  PENDING = 'pending',

  /**
   * 已提交
   */
  COMMITTED = 'committed',

  /**
   * 已回滚
   */
  ROLLED_BACK = 'rolled_back',

  /**
   * 已取消
   */
  CANCELLED = 'cancelled',

  /**
   * 已超时
   */
  TIMEOUT = 'timeout',

  /**
   * 已失败
   */
  FAILED = 'failed'
}

/**
 * 示例
 */
const transactionStatus: TransactionStatus = TransactionStatus.COMMITTED;
```

### ITransactionOperation

事务操作接口。

```typescript
interface ITransactionOperation {
  /**
   * 操作类型
   */
  type: 'create' | 'update' | 'delete' | 'replace';

  /**
   * 集合名称
   */
  collection: string;

  /**
   * 操作数据
   */
  data: any;

  /**
   * 查询条件（用于更新和删除）
   */
  filter?: IQueryFilter;

  /**
   * 操作选项
   */
  options?: {
    /**
     * 是否跳过验证
     */
    skipValidation?: boolean;

    /**
     * 是否触发钩子
     */
    skipHooks?: boolean;
  };
}

/**
 * 示例
 */
const operation: ITransactionOperation = {
  type: 'create',
  collection: 'users',
  data: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  options: {
    skipValidation: false,
    skipHooks: false
  }
};
```

---

## 使用示例

### 创建数据

```typescript
import { IData, DataType } from '@yyc3/types';

const data: IData = {
  key: 'user:123:profile',
  value: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  dataType: DataType.JSON,
  tags: ['user', 'profile']
};

const result = await dataService.create(data);
```

### 查询数据

```typescript
import { IQuery, QueryOperator } from '@yyc3/types';

const query: IQuery = {
  filter: {
    field: 'status',
    operator: QueryOperator.EQ,
    value: 'active'
  },
  sort: [
    {
      field: 'createdAt',
      order: 'desc'
    }
  ],
  pagination: {
    page: 1,
    pageSize: 20
  }
};

const result = await dataService.query(query);
```

### 创建索引

```typescript
import { IIndex, IndexType } from '@yyc3/types';

const index: IIndex = {
  name: 'user_email_index',
  fields: ['email'],
  type: IndexType.SINGLE,
  options: {
    unique: true
  }
};

const result = await indexService.create(index);
```

### 执行事务

```typescript
import { ITransaction, ITransactionOperation } from '@yyc3/types';

const operations: ITransactionOperation[] = [
  {
    type: 'create',
    collection: 'users',
    data: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  },
  {
    type: 'create',
    collection: 'profiles',
    data: {
      userId: 'user-123',
      bio: 'Software Developer'
    }
  }
];

const transaction = await transactionService.execute(operations);
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
