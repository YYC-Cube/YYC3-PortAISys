# 缓存管理API

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 缓存管理API文档

## 概述

缓存管理API提供完整的缓存操作功能，支持多级缓存（L1-L4）、缓存分片、缓存预热、缓存失效和缓存监控等高级功能。

## 功能特性

- ✅ 多级缓存（L1内存、L2本地、L3分布式、L4CDN）
- ✅ 缓存分片和负载均衡
- ✅ 缓存预热和批量加载
- ✅ 缓存失效和过期管理
- ✅ 缓存监控和统计
- ✅ 缓存清理和重置
- ✅ 缓存命中率优化
- ✅ 缓存一致性保证
- ✅ 缓存压缩和序列化
- ✅ 缓存标签和命名空间

## 认证

所有缓存管理API都需要认证。使用Bearer Token认证方式：

```http
Authorization: Bearer <access_token>
```

## API端点

### 1. 缓存操作

#### 1.1 设置缓存

设置缓存键值对。

**请求**

```http
POST /v1/cache/set
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "key": "user:123:profile",
  "value": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "ttl": 3600,
  "level": "L2",
  "tags": ["user", "profile"],
  "namespace": "user-service"
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| key | string | 是 | 缓存键 |
| value | any | 是 | 缓存值（支持JSON、字符串、二进制） |
| ttl | number | 否 | 过期时间（秒），默认为3600 |
| level | string | 否 | 缓存级别：L1、L2、L3、L4，默认为L2 |
| tags | array | 否 | 缓存标签 |
| namespace | string | 否 | 命名空间 |
| compress | boolean | 否 | 是否压缩，默认为false |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "key": "user:123:profile",
    "level": "L2",
    "ttl": 3600,
    "expiresAt": "2026-02-03T13:00:00.000Z",
    "size": 256,
    "compressed": false
  },
  "message": "缓存设置成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.2 获取缓存

获取缓存值。

**请求**

```http
GET /v1/cache/get
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| key | string | 是 | 缓存键 |
| level | string | 否 | 缓存级别，默认为自动查找 |

**请求示例**

```bash
curl -X GET "https://api.yyc3.com/v1/cache/get?key=user:123:profile&level=L2" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "key": "user:123:profile",
    "value": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "level": "L2",
    "ttl": 3600,
    "expiresAt": "2026-02-03T13:00:00.000Z",
    "hits": 10,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**缓存未命中响应 (404)**

```json
{
  "success": false,
  "error": {
    "code": "E601",
    "message": "缓存未命中",
    "details": {
      "key": "user:123:profile"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.3 批量获取缓存

批量获取多个缓存值。

**请求**

```http
POST /v1/cache/get/batch
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "keys": [
    "user:123:profile",
    "user:456:profile",
    "user:789:profile"
  ],
  "level": "L2"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "key": "user:123:profile",
        "value": {
          "id": "123",
          "name": "John Doe"
        },
        "hit": true
      },
      {
        "key": "user:456:profile",
        "value": null,
        "hit": false
      },
      {
        "key": "user:789:profile",
        "value": {
          "id": "789",
          "name": "Jane Smith"
        },
        "hit": true
      }
    ],
    "summary": {
      "total": 3,
      "hits": 2,
      "misses": 1,
      "hitRate": 0.67
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.4 删除缓存

删除指定缓存键。

**请求**

```http
DELETE /v1/cache/delete
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| key | string | 是 | 缓存键 |
| level | string | 否 | 缓存级别，默认为所有级别 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "key": "user:123:profile",
    "deleted": true,
    "levels": ["L1", "L2", "L3"]
  },
  "message": "缓存删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.5 批量删除缓存

批量删除多个缓存键。

**请求**

```http
POST /v1/cache/delete/batch
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "keys": [
    "user:123:profile",
    "user:456:profile",
    "user:789:profile"
  ],
  "level": "L2"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "deleted": 3,
    "failed": 0,
    "keys": [
      "user:123:profile",
      "user:456:profile",
      "user:789:profile"
    ]
  },
  "message": "批量删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.6 检查缓存是否存在

检查缓存键是否存在。

**请求**

```http
GET /v1/cache/exists
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| key | string | 是 | 缓存键 |
| level | string | 否 | 缓存级别，默认为自动查找 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "key": "user:123:profile",
    "exists": true,
    "level": "L2",
    "ttl": 3600,
    "expiresAt": "2026-02-03T13:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 2. 缓存管理

#### 2.1 清空缓存

清空指定级别的所有缓存。

**请求**

```http
DELETE /v1/cache/flush
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| level | string | 否 | 缓存级别，默认为所有级别 |
| namespace | string | 否 | 命名空间，仅清空指定命名空间的缓存 |
| pattern | string | 否 | 键模式（支持通配符） |

**请求示例**

```bash
curl -X DELETE "https://api.yyc3.com/v1/cache/flush?level=L2&namespace=user-service&pattern=user:*" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "flushed": 1000,
    "level": "L2",
    "namespace": "user-service",
    "pattern": "user:*"
  },
  "message": "缓存清空成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.2 获取缓存统计

获取缓存统计信息。

**请求**

```http
GET /v1/cache/stats
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| level | string | 否 | 缓存级别，默认为所有级别 |
| namespace | string | 否 | 命名空间 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "overall": {
      "totalKeys": 10000,
      "totalSize": 1073741824,
      "hits": 900000,
      "misses": 100000,
      "hitRate": 0.9,
      "evictions": 1000,
      "avgLatency": 0.5
    },
    "byLevel": {
      "L1": {
        "totalKeys": 1000,
        "totalSize": 104857600,
        "hits": 800000,
        "misses": 50000,
        "hitRate": 0.94,
        "evictions": 500,
        "avgLatency": 0.1
      },
      "L2": {
        "totalKeys": 5000,
        "totalSize": 524288000,
        "hits": 80000,
        "misses": 30000,
        "hitRate": 0.73,
        "evictions": 300,
        "avgLatency": 0.5
      },
      "L3": {
        "totalKeys": 4000,
        "totalSize": 445644800,
        "hits": 20000,
        "misses": 20000,
        "hitRate": 0.5,
        "evictions": 200,
        "avgLatency": 2
      }
    },
    "byNamespace": {
      "user-service": {
        "totalKeys": 3000,
        "hits": 300000,
        "misses": 30000,
        "hitRate": 0.91
      },
      "ai-service": {
        "totalKeys": 5000,
        "hits": 500000,
        "misses": 50000,
        "hitRate": 0.91
      }
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.3 获取缓存键列表

获取缓存键列表。

**请求**

```http
GET /v1/cache/keys
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| pattern | string | 否 | 键模式（支持通配符），默认为* |
| level | string | 否 | 缓存级别 |
| namespace | string | 否 | 命名空间 |
| limit | number | 否 | 返回数量限制，默认为100 |

**请求示例**

```bash
curl -X GET "https://api.yyc3.com/v1/cache/keys?pattern=user:*&level=L2&limit=100" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "keys": [
      {
        "key": "user:123:profile",
        "level": "L2",
        "size": 256,
        "ttl": 3600,
        "expiresAt": "2026-02-03T13:00:00.000Z"
      },
      {
        "key": "user:456:profile",
        "level": "L2",
        "size": 256,
        "ttl": 3600,
        "expiresAt": "2026-02-03T13:00:00.000Z"
      }
    ],
    "total": 2,
    "hasMore": false
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 3. 缓存预热

#### 3.1 创建预热任务

创建缓存预热任务。

**请求**

```http
POST /v1/cache/warmup
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "user-profile-warmup",
  "description": "预热用户档案缓存",
  "source": {
    "type": "database",
    "config": {
      "query": "SELECT * FROM users WHERE status = 'active'",
      "connection": "postgresql"
    }
  },
  "target": {
    "level": "L2",
    "namespace": "user-service",
    "ttl": 3600
  },
  "batchSize": 100,
  "concurrency": 10
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "taskId": "warmup-abc123",
    "name": "user-profile-warmup",
    "status": "pending",
    "estimatedItems": 10000,
    "estimatedTime": 600,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "预热任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.2 查询预热任务状态

查询预热任务执行状态。

**请求**

```http
GET /v1/cache/warmup/{taskId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "warmup-abc123",
      "name": "user-profile-warmup",
      "status": "running",
      "progress": {
        "total": 10000,
        "completed": 5000,
        "failed": 10,
        "percentage": 50
      },
      "performance": {
        "itemsPerSecond": 100,
        "avgLatency": 10,
        "estimatedRemainingTime": 50
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "startedAt": "2026-02-03T12:00:05.000Z",
      "estimatedCompletionAt": "2026-02-03T12:10:05.000Z"
    }
  },
  "timestamp": "2026-02-03T12:05:00.000Z"
}
```

#### 3.3 取消预热任务

取消正在执行的预热任务。

**请求**

```http
POST /v1/cache/warmup/{taskId}/cancel
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "taskId": "warmup-abc123",
    "status": "cancelled",
    "completed": 5000,
    "cancelledAt": "2026-02-03T12:05:00.000Z"
  },
  "message": "预热任务已取消",
  "timestamp": "2026-02-03T12:05:00.000Z"
}
```

### 4. 缓存失效

#### 4.1 按标签失效缓存

按标签失效相关缓存。

**请求**

```http
POST /v1/cache/invalidate/tags
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "tags": ["user", "profile"],
  "level": "L2",
  "namespace": "user-service"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "invalidated": 500,
    "tags": ["user", "profile"],
    "level": "L2",
    "namespace": "user-service"
  },
  "message": "缓存失效成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 4.2 按模式失效缓存

按键模式失效缓存。

**请求**

```http
POST /v1/cache/invalidate/pattern
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "pattern": "user:*:profile",
  "level": "L2",
  "namespace": "user-service"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "invalidated": 1000,
    "pattern": "user:*:profile",
    "level": "L2",
    "namespace": "user-service"
  },
  "message": "缓存失效成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 5. 缓存监控

#### 5.1 获取实时性能指标

获取缓存实时性能指标。

**请求**

```http
GET /v1/cache/metrics/realtime
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| level | string | 否 | 缓存级别 |
| period | number | 否 | 时间周期（秒），默认为60 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "period": 60,
    "metrics": {
      "requests": {
        "total": 10000,
        "reads": 8000,
        "writes": 2000,
        "perSecond": 167
      },
      "latency": {
        "avg": 0.5,
        "p50": 0.3,
        "p95": 1.0,
        "p99": 2.0,
        "max": 5.0
      },
      "hitRate": {
        "overall": 0.9,
        "reads": 0.92,
        "writes": 0.8
      },
      "throughput": {
        "bytesPerSecond": 10485760,
        "operationsPerSecond": 167
      },
      "errors": {
        "total": 10,
        "rate": 0.001
      }
    },
    "byLevel": {
      "L1": {
        "requests": 8000,
        "hitRate": 0.95,
        "avgLatency": 0.1
      },
      "L2": {
        "requests": 1500,
        "hitRate": 0.8,
        "avgLatency": 0.5
      },
      "L3": {
        "requests": 500,
        "hitRate": 0.6,
        "avgLatency": 2.0
      }
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 5.2 获取历史性能数据

获取缓存历史性能数据。

**请求**

```http
GET /v1/cache/metrics/history
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| startTime | string | 是 | 开始时间（ISO 8601） |
| endTime | string | 是 | 结束时间（ISO 8601） |
| interval | string | 否 | 时间间隔：1m、5m、15m、1h、1d，默认为5m |
| level | string | 否 | 缓存级别 |

**请求示例**

```bash
curl -X GET "https://api.yyc3.com/v1/cache/metrics/history?startTime=2026-02-03T00:00:00.000Z&endTime=2026-02-03T12:00:00.000Z&interval=1h" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

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
        "requests": 60000,
        "hits": 54000,
        "misses": 6000,
        "hitRate": 0.9,
        "avgLatency": 0.5,
        "evictions": 100
      },
      {
        "timestamp": "2026-02-03T01:00:00.000Z",
        "requests": 65000,
        "hits": 58500,
        "misses": 6500,
        "hitRate": 0.9,
        "avgLatency": 0.48,
        "evictions": 110
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 6. 缓存配置

#### 6.1 获取缓存配置

获取缓存配置信息。

**请求**

```http
GET /v1/cache/config
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "levels": {
      "L1": {
        "enabled": true,
        "type": "memory",
        "maxSize": 104857600,
        "maxItems": 10000,
        "evictionPolicy": "lru",
        "ttl": 300
      },
      "L2": {
        "enabled": true,
        "type": "redis",
        "host": "redis.yyc3.com",
        "port": 6379,
        "maxMemory": 1073741824,
        "evictionPolicy": "allkeys-lru",
        "ttl": 3600
      },
      "L3": {
        "enabled": true,
        "type": "distributed",
        "nodes": [
          {
            "host": "redis-1.yyc3.com",
            "port": 6379
          },
          {
            "host": "redis-2.yyc3.com",
            "port": 6379
          }
        ],
        "replicas": 2,
        "ttl": 7200
      },
      "L4": {
        "enabled": true,
        "type": "cdn",
        "provider": "cloudflare",
        "ttl": 86400
      }
    },
    "sharding": {
      "enabled": true,
      "algorithm": "consistent-hashing",
      "shards": 16,
      "replicas": 3
    },
    "compression": {
      "enabled": true,
      "algorithm": "gzip",
      "threshold": 1024
    },
    "serialization": {
      "format": "json",
      "compression": true
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 6.2 更新缓存配置

更新缓存配置。

**请求**

```http
PATCH /v1/cache/config
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "level": "L2",
  "config": {
    "maxMemory": 2147483648,
    "evictionPolicy": "allkeys-lfu",
    "ttl": 7200
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "level": "L2",
    "updated": true,
    "config": {
      "maxMemory": 2147483648,
      "evictionPolicy": "allkeys-lfu",
      "ttl": 7200
    }
  },
  "message": "缓存配置更新成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 7. 缓存健康检查

#### 7.1 执行健康检查

执行缓存健康检查。

**请求**

```http
GET /v1/cache/health
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "overall": "healthy",
    "levels": {
      "L1": {
        "status": "healthy",
        "latency": 0.1,
        "memoryUsage": 0.5,
        "connection": "connected"
      },
      "L2": {
        "status": "healthy",
        "latency": 0.5,
        "memoryUsage": 0.7,
        "connection": "connected"
      },
      "L3": {
        "status": "healthy",
        "latency": 2.0,
        "memoryUsage": 0.6,
        "connection": "connected"
      },
      "L4": {
        "status": "healthy",
        "latency": 100,
        "connection": "connected"
      }
    },
    "shards": [
      {
        "id": "shard-1",
        "status": "healthy",
        "latency": 0.5,
        "memoryUsage": 0.6
      },
      {
        "id": "shard-2",
        "status": "healthy",
        "latency": 0.6,
        "memoryUsage": 0.7
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

## 错误代码

| 错误代码 | 描述 | HTTP状态码 |
|----------|------|------------|
| E601 | 缓存未命中 | 404 |
| E602 | 缓存已存在 | 409 |
| E603 | 缓存已过期 | 410 |
| E604 | 缓存空间不足 | 507 |
| E605 | 缓存级别不可用 | 503 |
| E606 | 缓存操作失败 | 500 |
| E607 | 预热任务不存在 | 404 |
| E608 | 预热任务已取消 | 400 |
| E609 | 缓存配置无效 | 400 |

## 使用示例

### JavaScript/TypeScript

```typescript
import { CacheService } from '@yyc3/sdk';

const cacheService = new CacheService({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yyc3.com'
});

// 设置缓存
await cacheService.set({
  key: 'user:123:profile',
  value: {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com'
  },
  ttl: 3600,
  level: 'L2',
  tags: ['user', 'profile']
});

// 获取缓存
const cached = await cacheService.get('user:123:profile');
if (cached) {
  console.log('缓存命中:', cached.value);
} else {
  console.log('缓存未命中，从数据库加载');
}

// 批量获取
const results = await cacheService.getBatch([
  'user:123:profile',
  'user:456:profile',
  'user:789:profile'
]);

console.log('命中率:', results.summary.hitRate);

// 按标签失效
await cacheService.invalidateByTags(['user', 'profile'], 'L2');

// 获取统计信息
const stats = await cacheService.getStats();
console.log('总体命中率:', stats.overall.hitRate);
```

### Python

```python
from yyc3 import CacheService

cache_service = CacheService(
    api_key='your-api-key',
    base_url='https://api.yyc3.com'
)

# 设置缓存
cache_service.set(
    key='user:123:profile',
    value={
        'id': '123',
        'name': 'John Doe',
        'email': 'john@example.com'
    },
    ttl=3600,
    level='L2',
    tags=['user', 'profile']
)

# 获取缓存
cached = cache_service.get('user:123:profile')
if cached:
    print(f'缓存命中: {cached.value}')
else:
    print('缓存未命中，从数据库加载')

# 批量获取
results = cache_service.get_batch([
    'user:123:profile',
    'user:456:profile',
    'user:789:profile'
])

print(f'命中率: {results.summary.hit_rate}')

# 按标签失效
cache_service.invalidate_by_tags(['user', 'profile'], 'L2')

# 获取统计信息
stats = cache_service.get_stats()
print(f'总体命中率: {stats.overall.hit_rate}')
```

## 最佳实践

1. **缓存策略**
   - 根据数据访问模式选择合适的缓存级别
   - 设置合理的TTL避免数据过期
   - 使用标签和命名空间组织缓存

2. **性能优化**
   - 使用批量操作减少网络开销
   - 实施缓存预热提高命中率
   - 监控缓存命中率及时调整策略

3. **内存管理**
   - 设置合理的缓存大小限制
   - 选择合适的淘汰策略（LRU、LFU）
   - 定期清理过期和无效缓存

4. **一致性保证**
   - 使用缓存失效机制保持数据一致性
   - 实施缓存更新策略（Write-through、Write-back）
   - 监控缓存一致性指标

5. **监控和告警**
   - 监控缓存命中率和延迟
   - 设置缓存空间使用告警
   - 定期检查缓存健康状态

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
