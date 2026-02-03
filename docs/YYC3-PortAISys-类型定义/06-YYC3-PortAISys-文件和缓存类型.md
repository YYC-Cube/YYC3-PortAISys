# YYC³ PortAISys - 文件和缓存类型

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 文件和缓存类型定义包含所有文件管理和缓存相关的数据类型和接口。

## 概述

文件和缓存类型定义提供了 YYC³ PortAISys 系统中文件管理、缓存操作等相关类型。

---

## 文件类型

### IFile

文件接口。

```typescript
interface IFile extends IBaseEntity {
  /**
   * 文件名
   */
  name: string;

  /**
   * 文件路径
   */
  path: string;

  /**
   * 文件大小（字节）
   */
  size: number;

  /**
   * 文件类型
   */
  mimeType: string;

  /**
   * 文件扩展名
   */
  extension: string;

  /**
   * 文件 URL
   */
  url: URL;

  /**
   * 文件状态
   */
  status: FileStatus;

  /**
   * 文件所有者 ID
   */
  ownerId: ID;

  /**
   * 文件标签
   */
  tags?: string[];

  /**
   * 文件元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const file: IFile = {
  id: 'file-123',
  name: 'document.pdf',
  path: '/documents/2026/02/document.pdf',
  size: 1024000,
  mimeType: 'application/pdf',
  extension: 'pdf',
  url: 'https://cdn.yyc3.com/files/document.pdf',
  status: FileStatus.UPLOADED,
  ownerId: 'user-456',
  tags: ['document', 'pdf'],
  metadata: {
    author: 'John Doe',
    version: '1.0.0'
  },
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### FileStatus

文件状态枚举。

```typescript
enum FileStatus {
  /**
   * 上传中
   */
  UPLOADING = 'uploading',

  /**
   * 已上传
   */
  UPLOADED = 'uploaded',

  /**
   * 处理中
   */
  PROCESSING = 'processing',

  /**
   * 已处理
   */
  PROCESSED = 'processed',

  /**
   * 已删除
   */
  DELETED = 'deleted',

  /**
   * 失败
   */
  FAILED = 'failed',

  /**
   * 已过期
   */
  EXPIRED = 'expired'
}

/**
 * 示例
 */
const status: FileStatus = FileStatus.UPLOADED;
```

### ICreateFileRequest

创建文件请求接口。

```typescript
interface ICreateFileRequest {
  /**
   * 文件名
   */
  name: string;

  /**
   * 文件路径
   */
  path: string;

  /**
   * 文件内容（Base64 或 URL）
   */
  content: string | ArrayBuffer;

  /**
   * 文件类型
   */
  mimeType?: string;

  /**
   * 文件标签
   */
  tags?: string[];

  /**
   * 文件元数据
   */
  metadata?: Record<string, any>;

  /**
   * 上传选项
   */
  options?: {
    /**
     * 是否压缩
     */
    compress?: boolean;

    /**
     * 是否加密
     */
    encrypt?: boolean;

    /**
     * 加密算法
     */
    encryptionAlgorithm?: 'AES256' | 'AES128';
  };
}

/**
 * 示例
 */
const createFileRequest: ICreateFileRequest = {
  name: 'document.pdf',
  path: '/documents/2026/02',
  content: 'base64-encoded-content',
  mimeType: 'application/pdf',
  tags: ['document', 'pdf'],
  metadata: {
    author: 'John Doe',
    version: '1.0.0'
  },
  options: {
    compress: true,
    encrypt: false
  }
};
```

---

## 文件夹类型

### IFolder

文件夹接口。

```typescript
interface IFolder extends IBaseEntity {
  /**
   * 文件夹名称
   */
  name: string;

  /**
   * 文件夹路径
   */
  path: string;

  /**
   * 父文件夹 ID
   */
  parentId?: ID;

  /**
   * 文件夹所有者 ID
   */
  ownerId: ID;

  /**
   * 文件夹标签
   */
  tags?: string[];

  /**
   * 文件夹元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const folder: IFolder = {
  id: 'folder-123',
  name: '2026',
  path: '/documents/2026',
  parentId: 'folder-456',
  ownerId: 'user-789',
  tags: ['documents', '2026'],
  metadata: {
    year: 2026,
    type: 'yearly'
  },
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

---

## 文件版本类型

### IFileVersion

文件版本接口。

```typescript
interface IFileVersion extends IBaseEntity {
  /**
   * 文件 ID
   */
  fileId: ID;

  /**
   * 版本号
   */
  version: number;

  /**
   * 版本标签
   */
  tag?: string;

  /**
   * 版本描述
   */
  description?: string;

  /**
   * 版本大小（字节）
   */
  size: number;

  /**
   * 版本 URL
   */
  url: URL;

  /**
   * 版本创建者 ID
   */
  creatorId: ID;

  /**
   * 是否为当前版本
   */
  isCurrent: boolean;
}

/**
 * 示例
 */
const fileVersion: IFileVersion = {
  id: 'version-123',
  fileId: 'file-456',
  version: 2,
  tag: 'v2.0.0',
  description: '修复了 PDF 渲染问题',
  size: 1024000,
  url: 'https://cdn.yyc3.com/files/document-v2.pdf',
  creatorId: 'user-789',
  isCurrent: true,
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

---

## 缓存类型

### ICache

缓存接口。

```typescript
interface ICache extends IBaseEntity {
  /**
   * 缓存键
   */
  key: string;

  /**
   * 缓存值
   */
  value: any;

  /**
   * 缓存类型
   */
  type: CacheType;

  /**
   * 缓存大小（字节）
   */
  size?: number;

  /**
   * 缓存级别
   */
  level: CacheLevel;

  /**
   * 过期时间（秒）
   */
  ttl: number;

  /**
   * 过期时间
   */
  expiresAt: Timestamp;

  /**
   * 命中次数
   */
  hitCount?: number;

  /**
   * 未命中次数
   */
  missCount?: number;

  /**
   * 最后访问时间
   */
  lastAccessedAt?: Timestamp;

  /**
   * 缓存标签
   */
  tags?: string[];

  /**
   * 缓存命名空间
   */
  namespace?: string;
}

/**
 * 示例
 */
const cache: ICache = {
  id: 'cache-123',
  key: 'user:123:profile',
  value: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  type: CacheType.OBJECT,
  size: 1024,
  level: CacheLevel.L2,
  ttl: 3600,
  expiresAt: '2026-02-03T11:00:00.000Z',
  hitCount: 100,
  missCount: 5,
  lastAccessedAt: '2026-02-03T10:30:00.000Z',
  tags: ['user', 'profile'],
  namespace: 'user-service',
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:30:00.000Z'
};
```

### CacheType

缓存类型枚举。

```typescript
enum CacheType {
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
   * 对象类型
   */
  OBJECT = 'object',

  /**
   * 数组类型
   */
  ARRAY = 'array',

  /**
   * 二进制类型
   */
  BINARY = 'binary',

  /**
   * JSON 类型
   */
  JSON = 'json'
}

/**
 * 示例
 */
const cacheType: CacheType = CacheType.OBJECT;
```

### CacheLevel

缓存级别枚举。

```typescript
enum CacheLevel {
  /**
   * L1 缓存（内存）
   */
  L1 = 'L1',

  /**
   * L2 缓存（Redis）
   */
  L2 = 'L2',

  /**
   * L3 缓存（Memcached）
   */
  L3 = 'L3',

  /**
   * L4 缓存（数据库）
   */
  L4 = 'L4'
}

/**
 * 示例
 */
const cacheLevel: CacheLevel = CacheLevel.L2;
```

### ISetCacheRequest

设置缓存请求接口。

```typescript
interface ISetCacheRequest {
  /**
   * 缓存键
   */
  key: string;

  /**
   * 缓存值
   */
  value: any;

  /**
   * 过期时间（秒）
   */
  ttl?: number;

  /**
   * 缓存级别
   */
  level?: CacheLevel;

  /**
   * 缓存标签
   */
  tags?: string[];

  /**
   * 缓存命名空间
   */
  namespace?: string;

  /**
   * 缓存选项
   */
  options?: {
    /**
     * 是否覆盖已存在的缓存
     */
    overwrite?: boolean;

    /**
     * 是否异步写入
     */
    async?: boolean;
  };
}

/**
 * 示例
 */
const setCacheRequest: ISetCacheRequest = {
  key: 'user:123:profile',
  value: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  ttl: 3600,
  level: CacheLevel.L2,
  tags: ['user', 'profile'],
  namespace: 'user-service',
  options: {
    overwrite: true,
    async: false
  }
};
```

---

## 缓存分片类型

### ICacheShard

缓存分片接口。

```typescript
interface ICacheShard {
  /**
   * 分片 ID
   */
  shardId: ID;

  /**
   * 分片键范围
   */
  keyRange: {
    /**
     * 起始键
     */
    start: string;

    /**
     * 结束键
     */
    end: string;
  };

  /**
   * 分片节点
   */
  nodes: ICacheNode[];

  /**
   * 分片状态
   */
  status: ShardStatus;

  /**
   * 分片大小（字节）
   */
  size?: number;

  /**
   * 分片元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const cacheShard: ICacheShard = {
  shardId: 'shard-1',
  keyRange: {
    start: 'a',
    end: 'm'
  },
  nodes: [
    {
      nodeId: 'node-1',
      host: 'cache-1.yyc3.com',
      port: 6379
    }
  ],
  status: ShardStatus.ACTIVE,
  size: 1073741824,
  metadata: {
    region: 'us-east-1'
  }
};
```

### ICacheNode

缓存节点接口。

```typescript
interface ICacheNode {
  /**
   * 节点 ID
   */
  nodeId: ID;

  /**
   * 节点主机
   */
  host: string;

  /**
   * 节点端口
   */
  port: number;

  /**
   * 节点状态
   */
  status: NodeStatus;

  /**
   * 节点负载
   */
  load?: {
    /**
     * 连接数
     */
    connections?: number;

    /**
     * 内存使用率
     */
    memoryUsage?: number;

    /**
     * CPU 使用率
     */
    cpuUsage?: number;
  };

  /**
   * 节点元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const cacheNode: ICacheNode = {
  nodeId: 'node-1',
  host: 'cache-1.yyc3.com',
  port: 6379,
  status: NodeStatus.ACTIVE,
  load: {
    connections: 1000,
    memoryUsage: 0.6,
    cpuUsage: 0.4
  },
  metadata: {
    region: 'us-east-1',
    availabilityZone: 'us-east-1a'
  }
};
```

### ShardStatus

分片状态枚举。

```typescript
enum ShardStatus {
  /**
   * 活跃状态
   */
  ACTIVE = 'active',

  /**
   * 非活跃状态
   */
  INACTIVE = 'inactive',

  /**
   * 迁移中
   */
  MIGRATING = 'migrating',

  /**
   * 已删除
   */
  DELETED = 'deleted',

  /**
   * 错误状态
   */
  ERROR = 'error'
}

/**
 * 示例
 */
const shardStatus: ShardStatus = ShardStatus.ACTIVE;
```

### NodeStatus

节点状态枚举。

```typescript
enum NodeStatus {
  /**
   * 活跃状态
   */
  ACTIVE = 'active',

  /**
   * 非活跃状态
   */
  INACTIVE = 'inactive',

  /**
   * 维护中
   */
  MAINTENANCE = 'maintenance',

  /**
   * 已删除
   */
  DELETED = 'deleted',

  /**
   * 错误状态
   */
  ERROR = 'error'
}

/**
 * 示例
 */
const nodeStatus: NodeStatus = NodeStatus.ACTIVE;
```

---

## 使用示例

### 上传文件

```typescript
import { ICreateFileRequest } from '@yyc3/types';

const createFileRequest: ICreateFileRequest = {
  name: 'document.pdf',
  path: '/documents/2026/02',
  content: 'base64-encoded-content',
  mimeType: 'application/pdf',
  tags: ['document', 'pdf'],
  options: {
    compress: true,
    encrypt: false
  }
};

const file = await fileService.upload(createFileRequest);
```

### 设置缓存

```typescript
import { ISetCacheRequest, CacheLevel } from '@yyc3/types';

const setCacheRequest: ISetCacheRequest = {
  key: 'user:123:profile',
  value: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  ttl: 3600,
  level: CacheLevel.L2,
  tags: ['user', 'profile'],
  namespace: 'user-service'
};

const cache = await cacheService.set(setCacheRequest);
```

### 获取缓存

```typescript
import { CacheLevel } from '@yyc3/types';

const cache = await cacheService.get('user:123:profile', {
  level: CacheLevel.L2,
  namespace: 'user-service'
});

if (cache) {
  console.log('缓存命中', cache.value);
} else {
  console.log('缓存未命中');
}
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
