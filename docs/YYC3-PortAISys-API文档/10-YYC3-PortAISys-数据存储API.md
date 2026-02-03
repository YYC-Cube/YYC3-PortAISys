# YYC³ PortAISys - 数据存储API

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

- [数据存储API概述](#数据存储api概述)
- [数据CRUD操作](#数据crud操作)
- [数据查询](#数据查询)
- [数据聚合](#数据聚合)
- [数据导入导出](#数据导入导出)
- [数据备份恢复](#数据备份恢复)

---

## 数据存储API概述

### API简介

YYC³ PortAISys数据存储API提供完整的数据存储功能，包括数据CRUD操作、数据查询、数据聚合、数据导入导出和数据备份恢复等功能。支持多种数据类型和存储策略。

### 支持的数据类型

| 数据类型 | 描述 | 适用场景 |
|---------|------|----------|
| **JSON** | JSON格式数据 | 结构化数据 |
| **CSV** | CSV格式数据 | 表格数据 |
| **Binary** | 二进制数据 | 文件、图片等 |
| **Text** | 文本数据 | 日志、文档等 |

### 存储策略

| 策略 | 描述 | 适用场景 |
|------|------|----------|
| **Hot** | 热数据，频繁访问 | 当前活跃数据 |
| **Warm** | 温数据，偶尔访问 | 历史数据 |
| **Cold** | 冷数据，很少访问 | 归档数据 |

---

## 数据CRUD操作

### 创建数据

**端点**: `POST /v1/data`

**描述**: 创建新的数据记录。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "collection": "users",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "address": {
      "street": "123 Main St",
      "city": "Beijing",
      "country": "China"
    },
    "tags": ["developer", "admin"],
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "options": {
    "validate": true,
    "index": ["email", "name"]
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **collection** | string | 是 | 集合名称 |
| **data** | object | 是 | 数据内容 |
| **options** | object | 否 | 创建选项 |
| **options.validate** | boolean | 否 | 是否验证数据，默认true |
| **options.index** | array | 否 | 索引字段 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "data-123",
    "collection": "users",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "address": {
        "street": "123 Main St",
        "city": "Beijing",
        "country": "China"
      },
      "tags": ["developer", "admin"],
      "createdAt": "2026-02-03T12:00:00.000Z"
    },
    "version": 1,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "数据创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 批量创建数据

**端点**: `POST /v1/data/batch`

**描述**: 批量创建数据记录。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "collection": "users",
  "data": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30
    },
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "age": 28
    },
    {
      "name": "Bob Smith",
      "email": "bob@example.com",
      "age": 35
    }
  ],
  "options": {
    "validate": true,
    "continueOnError": false
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **collection** | string | 是 | 集合名称 |
| **data** | array | 是 | 数据数组 |
| **options** | object | 否 | 创建选项 |
| **options.validate** | boolean | 否 | 是否验证数据，默认true |
| **options.continueOnError** | boolean | 否 | 遇到错误是否继续，默认false |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "created": 3,
    "failed": 0,
    "results": [
      {
        "id": "data-123",
        "status": "success"
      },
      {
        "id": "data-456",
        "status": "success"
      },
      {
        "id": "data-789",
        "status": "success"
      }
    ]
  },
  "message": "批量数据创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 读取数据

**端点**: `GET /v1/data/{dataId}`

**描述**: 读取指定数据记录。

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
    "id": "data-123",
    "collection": "users",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "address": {
        "street": "123 Main St",
        "city": "Beijing",
        "country": "China"
      },
      "tags": ["developer", "admin"],
      "createdAt": "2026-02-03T12:00:00.000Z"
    },
    "version": 1,
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "数据读取成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 更新数据

**端点**: `PUT /v1/data/{dataId}`

**描述**: 更新指定数据记录。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "data": {
    "name": "John Smith",
    "age": 31,
    "updatedAt": "2026-02-03T12:30:00.000Z"
  },
  "options": {
    "validate": true,
    "merge": true
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **data** | object | 是 | 更新数据 |
| **options** | object | 否 | 更新选项 |
| **options.validate** | boolean | 否 | 是否验证数据，默认true |
| **options.merge** | boolean | 否 | 是否合并数据，默认false |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "data-123",
    "collection": "users",
    "data": {
      "name": "John Smith",
      "email": "john@example.com",
      "age": 31,
      "address": {
        "street": "123 Main St",
        "city": "Beijing",
        "country": "China"
      },
      "tags": ["developer", "admin"],
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:30:00.000Z"
    },
    "version": 2,
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "数据更新成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 删除数据

**端点**: `DELETE /v1/data/{dataId}`

**描述**: 删除指定数据记录。

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
    "id": "data-123",
    "deletedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "数据删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 数据查询

### 查询数据

**端点**: `POST /v1/data/query`

**描述**: 查询数据记录。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "collection": "users",
  "filter": {
    "operator": "and",
    "conditions": [
      {
        "field": "age",
        "operator": "gte",
        "value": 25
      },
      {
        "field": "tags",
        "operator": "in",
        "value": ["developer", "admin"]
      }
    ]
  },
  "sort": [
    {
      "field": "createdAt",
      "order": "desc"
    }
  ],
  "projection": {
    "include": ["name", "email", "age"],
    "exclude": ["address"]
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **collection** | string | 是 | 集合名称 |
| **filter** | object | 否 | 过滤条件 |
| **sort** | array | 否 | 排序配置 |
| **projection** | object | 否 | 投影配置 |
| **pagination** | object | 否 | 分页配置 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "data-123",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30,
        "createdAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "data-456",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "age": 28,
        "createdAt": "2026-02-03T11:00:00.000Z"
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
  "message": "数据查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 全文搜索

**端点**: `POST /v1/data/search`

**描述**: 执行全文搜索。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "collection": "users",
  "query": "John developer",
  "fields": ["name", "email", "tags"],
  "options": {
    "fuzzy": true,
    "highlight": true
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **collection** | string | 是 | 集合名称 |
| **query** | string | 是 | 搜索查询 |
| **fields** | array | 否 | 搜索字段 |
| **options** | object | 否 | 搜索选项 |
| **options.fuzzy** | boolean | 否 | 是否模糊搜索，默认false |
| **options.highlight** | boolean | 否 | 是否高亮匹配，默认false |
| **pagination** | object | 否 | 分页配置 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "data-123",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30,
        "tags": ["developer", "admin"],
        "score": 0.95,
        "highlight": {
          "name": "<mark>John</mark> Doe",
          "tags": ["<mark>developer</mark>", "admin"]
        },
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
  "message": "全文搜索成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 数据聚合

### 聚合数据

**端点**: `POST /v1/data/aggregate`

**描述**: 执行数据聚合操作。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "collection": "users",
  "pipeline": [
    {
      "$match": {
        "age": {
          "$gte": 25
        }
      }
    },
    {
      "$group": {
        "_id": "$tags",
        "count": {
          "$sum": 1
        },
        "avgAge": {
          "$avg": "$age"
        }
      }
    },
    {
      "$sort": {
        "count": -1
      }
    }
  ]
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **collection** | string | 是 | 集合名称 |
| **pipeline** | array | 是 | 聚合管道 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": ["developer"],
        "count": 50,
        "avgAge": 30.5
      },
      {
        "_id": ["admin"],
        "count": 20,
        "avgAge": 35.2
      },
      {
        "_id": ["developer", "admin"],
        "count": 10,
        "avgAge": 32.8
      }
    ]
  },
  "message": "数据聚合成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 数据导入导出

### 导入数据

**端点**: `POST /v1/data/import`

**描述**: 导入数据。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
X-Request-ID: <unique-request-id>
```

**请求体**:

```
file: <binary>
collection: users
format: csv
options: {"validate": true, "continueOnError": false}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **file** | file | 是 | 数据文件 |
| **collection** | string | 是 | 集合名称 |
| **format** | string | 是 | 文件格式（csv、json） |
| **options** | string | 否 | 导入选项（JSON字符串） |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "importId": "import-123",
    "collection": "users",
    "format": "csv",
    "totalRecords": 1000,
    "imported": 995,
    "failed": 5,
    "errors": [
      {
        "row": 10,
        "error": "Invalid email format"
      },
      {
        "row": 25,
        "error": "Missing required field: name"
      }
    ],
    "importedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "数据导入成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 导出数据

**端点**: `POST /v1/data/export`

**描述**: 导出数据。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "collection": "users",
  "filter": {
    "operator": "and",
    "conditions": [
      {
        "field": "age",
        "operator": "gte",
        "value": 25
      }
    ]
  },
  "format": "csv",
  "options": {
    "includeHeader": true,
    "delimiter": ",",
    "encoding": "utf-8"
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **collection** | string | 是 | 集合名称 |
| **filter** | object | 否 | 过滤条件 |
| **format** | string | 是 | 导出格式（csv、json） |
| **options** | object | 否 | 导出选项 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "exportId": "export-123",
    "collection": "users",
    "format": "csv",
    "totalRecords": 500,
    "downloadUrl": "https://api.yyc3.com/v1/data/exports/export-123/download",
    "expiresAt": "2026-02-03T13:00:00.000Z"
  },
  "message": "数据导出成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 数据备份恢复

### 创建备份

**端点**: `POST /v1/data/backup`

**描述**: 创建数据备份。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "collections": ["users", "workflows"],
  "options": {
    "compression": true,
    "encryption": true,
    "retentionDays": 30
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **collections** | array | 否 | 集合列表，不指定则备份所有 |
| **options** | object | 否 | 备份选项 |
| **options.compression** | boolean | 否 | 是否压缩，默认true |
| **options.encryption** | boolean | 否 | 是否加密，默认true |
| **options.retentionDays** | number | 否 | 保留天数，默认30 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "backupId": "backup-123",
    "collections": ["users", "workflows"],
    "size": 102400000,
    "compressedSize": 25600000,
    "status": "completed",
    "downloadUrl": "https://api.yyc3.com/v1/data/backups/backup-123/download",
    "expiresAt": "2026-03-05T12:00:00.000Z",
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "数据备份创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 恢复备份

**端点**: `POST /v1/data/restore`

**描述**: 从备份恢复数据。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "backupId": "backup-123",
  "options": {
    "overwrite": false,
    "validate": true
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **backupId** | string | 是 | 备份ID |
| **options** | object | 否 | 恢复选项 |
| **options.overwrite** | boolean | 否 | 是否覆盖现有数据，默认false |
| **options.validate** | boolean | 否 | 是否验证数据，默认true |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "restoreId": "restore-456",
    "backupId": "backup-123",
    "collections": ["users", "workflows"],
    "status": "completed",
    "restoredRecords": 1500,
    "failedRecords": 0,
    "restoredAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "数据恢复成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

---

## 最佳实践

### 数据存储

1. **合理分片**: 合理设计数据分片策略
2. **索引优化**: 为常用查询字段创建索引
3. **数据验证**: 验证所有输入数据
4. **版本控制**: 使用版本控制跟踪数据变更
5. **定期清理**: 定期清理过期数据

### 性能优化

1. **批量操作**: 使用批量操作提高效率
2. **查询优化**: 优化查询语句和索引
3. **缓存策略**: 实施合理的缓存策略
4. **分页查询**: 使用分页避免一次性加载大量数据
5. **异步处理**: 对于耗时操作使用异步处理

### 安全考虑

1. **数据加密**: 敏感数据加密存储
2. **访问控制**: 实施适当的访问控制
3. **审计日志**: 记录所有数据操作
4. **备份策略**: 实施定期备份策略
5. **数据脱敏**: 敏感信息脱敏处理

---

## 下一步

- [文件管理API](./11-文件管理API.md) - 学习文件管理API
- [缓存管理API](./12-缓存管理API.md) - 学习缓存管理API
- [数据库API](./13-数据库API.md) - 学习数据库API

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
