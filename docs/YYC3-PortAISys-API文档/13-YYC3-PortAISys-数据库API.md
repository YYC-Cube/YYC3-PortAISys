# 数据库API

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 数据库API文档

## 概述

数据库API提供完整的数据库操作功能，支持多种数据库类型（MySQL、PostgreSQL、MongoDB、SQLite）、数据查询、数据写入、数据迁移、数据备份和恢复等高级功能。

## 功能特性

- ✅ 多数据库支持（MySQL、PostgreSQL、MongoDB、SQLite）
- ✅ 数据查询（简单查询、复杂查询、聚合查询）
- ✅ 数据写入（插入、更新、删除）
- ✅ 事务管理
- ✅ 数据迁移和版本控制
- ✅ 数据备份和恢复
- ✅ 数据库连接池管理
- ✅ 查询优化和索引管理
- ✅ 数据库监控和性能分析
- ✅ 数据加密和脱敏

## 认证

所有数据库API都需要认证。使用Bearer Token认证方式：

```http
Authorization: Bearer <access_token>
```

## API端点

### 1. 数据库连接

#### 1.1 创建数据库连接

创建新的数据库连接。

**请求**

```http
POST /v1/database/connections
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "production-db",
  "type": "postgresql",
  "host": "db.yyc3.com",
  "port": 5432,
  "database": "yyc3_production",
  "username": "yyc3_user",
  "password": "secure_password",
  "ssl": true,
  "pool": {
    "min": 2,
    "max": 10,
    "idleTimeout": 30000
  },
  "options": {
    "connectionTimeout": 10000,
    "queryTimeout": 30000
  }
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| name | string | 是 | 连接名称 |
| type | string | 是 | 数据库类型：mysql、postgresql、mongodb、sqlite |
| host | string | 是 | 数据库主机地址 |
| port | number | 是 | 数据库端口 |
| database | string | 是 | 数据库名称 |
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| ssl | boolean | 否 | 是否使用SSL，默认为false |
| pool | object | 否 | 连接池配置 |
| options | object | 否 | 其他连接选项 |

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "connection": {
      "id": "conn-abc123",
      "name": "production-db",
      "type": "postgresql",
      "host": "db.yyc3.com",
      "port": 5432,
      "database": "yyc3_production",
      "status": "connected",
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "数据库连接创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.2 测试数据库连接

测试数据库连接是否正常。

**请求**

```http
POST /v1/database/connections/{connectionId}/test
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "connectionId": "conn-abc123",
    "status": "connected",
    "latency": 5.2,
    "version": "PostgreSQL 14.5",
    "testAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "数据库连接测试成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.3 列出数据库连接

列出所有数据库连接。

**请求**

```http
GET /v1/database/connections
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "id": "conn-abc123",
        "name": "production-db",
        "type": "postgresql",
        "host": "db.yyc3.com",
        "port": 5432,
        "database": "yyc3_production",
        "status": "connected",
        "createdAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "conn-def456",
        "name": "analytics-db",
        "type": "mongodb",
        "host": "mongo.yyc3.com",
        "port": 27017,
        "database": "yyc3_analytics",
        "status": "connected",
        "createdAt": "2026-02-03T11:00:00.000Z"
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.4 删除数据库连接

删除数据库连接。

**请求**

```http
DELETE /v1/database/connections/{connectionId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "connectionId": "conn-abc123",
    "deleted": true
  },
  "message": "数据库连接删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 2. 数据查询

#### 2.1 执行查询

执行SQL或NoSQL查询。

**请求**

```http
POST /v1/database/query
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "query": "SELECT * FROM users WHERE status = :status AND created_at > :created_at",
  "params": {
    "status": "active",
    "created_at": "2026-01-01T00:00:00.000Z"
  },
  "options": {
    "timeout": 30000,
    "limit": 100,
    "offset": 0
  }
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| connectionId | string | 是 | 连接ID |
| query | string | 是 | 查询语句 |
| params | object | 否 | 查询参数 |
| options | object | 否 | 查询选项 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "status": "active",
        "createdAt": "2026-01-15T12:00:00.000Z"
      },
      {
        "id": "user-456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "status": "active",
        "createdAt": "2026-01-20T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 2,
      "limit": 100,
      "offset": 0,
      "hasMore": false
    },
    "performance": {
      "executionTime": 15.2,
      "rowsAffected": 2,
      "rowsReturned": 2
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.2 执行批量查询

执行多个查询。

**请求**

```http
POST /v1/database/query/batch
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "queries": [
    {
      "id": "query-1",
      "query": "SELECT * FROM users WHERE id = :id",
      "params": {
        "id": "user-123"
      }
    },
    {
      "id": "query-2",
      "query": "SELECT * FROM orders WHERE user_id = :user_id",
      "params": {
        "user_id": "user-123"
      }
    }
  ],
  "transaction": true
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "query-1",
        "results": [
          {
            "id": "user-123",
            "name": "John Doe",
            "email": "john@example.com"
          }
        ],
        "executionTime": 5.2
      },
      {
        "id": "query-2",
        "results": [
          {
            "id": "order-789",
            "userId": "user-123",
            "amount": 100
          }
        ],
        "executionTime": 8.5
      }
    ],
    "transaction": {
      "id": "txn-abc123",
      "status": "committed"
    },
    "totalExecutionTime": 13.7
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 3. 数据写入

#### 3.1 插入数据

插入单条或多条数据。

**请求**

```http
POST /v1/database/insert
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "table": "users",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active"
  },
  "options": {
    "returning": true,
    "onConflict": "ignore"
  }
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| connectionId | string | 是 | 连接ID |
| table | string | 是 | 表名 |
| data | object/array | 是 | 数据对象或数组 |
| options | object | 否 | 插入选项 |

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "inserted": 1,
    "id": "user-789",
    "data": {
      "id": "user-789",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "createdAt": "2026-02-03T12:00:00.000Z"
    },
    "performance": {
      "executionTime": 8.5
    }
  },
  "message": "数据插入成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.2 批量插入数据

批量插入多条数据。

**请求**

```http
POST /v1/database/insert/batch
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "table": "users",
  "data": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "status": "active"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "status": "active"
    },
    {
      "name": "Bob Johnson",
      "email": "bob@example.com",
      "status": "inactive"
    }
  ],
  "options": {
    "batchSize": 100,
    "returning": false
  }
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "inserted": 3,
    "failed": 0,
    "performance": {
      "executionTime": 25.3,
      "avgTimePerRecord": 8.4
    }
  },
  "message": "批量插入成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.3 更新数据

更新数据。

**请求**

```http
PATCH /v1/database/update
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "table": "users",
  "filter": {
    "id": "user-123"
  },
  "data": {
    "name": "John Updated",
    "status": "active",
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "options": {
    "returning": true
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "updated": 1,
    "data": {
      "id": "user-123",
      "name": "John Updated",
      "email": "john@example.com",
      "status": "active",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    },
    "performance": {
      "executionTime": 6.2
    }
  },
  "message": "数据更新成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.4 删除数据

删除数据。

**请求**

```http
DELETE /v1/database/delete
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "table": "users",
  "filter": {
    "status": "inactive"
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "deleted": 5,
    "performance": {
      "executionTime": 12.5
    }
  },
  "message": "数据删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 4. 事务管理

#### 4.1 开始事务

开始一个新事务。

**请求**

```http
POST /v1/database/transactions
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "isolationLevel": "read_committed",
  "readOnly": false
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn-abc123",
      "connectionId": "conn-abc123",
      "status": "active",
      "isolationLevel": "read_committed",
      "readOnly": false,
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "事务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 4.2 提交事务

提交事务。

**请求**

```http
POST /v1/database/transactions/{transactionId}/commit
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn-abc123",
      "status": "committed",
      "committedAt": "2026-02-03T12:00:30.000Z"
    }
  },
  "message": "事务提交成功",
  "timestamp": "2026-02-03T12:00:30.000Z"
}
```

#### 4.3 回滚事务

回滚事务。

**请求**

```http
POST /v1/database/transactions/{transactionId}/rollback
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn-abc123",
      "status": "rolled_back",
      "rolledBackAt": "2026-02-03T12:00:30.000Z"
    }
  },
  "message": "事务回滚成功",
  "timestamp": "2026-02-03T12:00:30.000Z"
}
```

### 5. 数据迁移

#### 5.1 创建迁移

创建数据库迁移。

**请求**

```http
POST /v1/database/migrations
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "add_user_avatar",
  "description": "添加用户头像字段",
  "connectionId": "conn-abc123",
  "up": "ALTER TABLE users ADD COLUMN avatar VARCHAR(255);",
  "down": "ALTER TABLE users DROP COLUMN avatar;"
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "migration": {
      "id": "migration-abc123",
      "name": "add_user_avatar",
      "description": "添加用户头像字段",
      "version": "20260203120000",
      "status": "pending",
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "迁移创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 5.2 执行迁移

执行待执行的迁移。

**请求**

```http
POST /v1/database/migrations/run
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "version": "20260203120000"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "migration": {
      "id": "migration-abc123",
      "name": "add_user_avatar",
      "version": "20260203120000",
      "status": "completed",
      "executedAt": "2026-02-03T12:00:30.000Z",
      "executionTime": 150
    }
  },
  "message": "迁移执行成功",
  "timestamp": "2026-02-03T12:00:30.000Z"
}
```

#### 5.3 回滚迁移

回滚已执行的迁移。

**请求**

```http
POST /v1/database/migrations/rollback
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "version": "20260203120000"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "migration": {
      "id": "migration-abc123",
      "name": "add_user_avatar",
      "version": "20260203120000",
      "status": "rolled_back",
      "rolledBackAt": "2026-02-03T12:01:00.000Z",
      "executionTime": 120
    }
  },
  "message": "迁移回滚成功",
  "timestamp": "2026-02-03T12:01:00.000Z"
}
```

#### 5.4 列出迁移

列出所有迁移。

**请求**

```http
GET /v1/database/migrations
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| connectionId | string | 否 | 连接ID |
| status | string | 否 | 状态筛选：pending、completed、failed |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "migrations": [
      {
        "id": "migration-abc123",
        "name": "add_user_avatar",
        "version": "20260203120000",
        "status": "completed",
        "executedAt": "2026-02-03T12:00:30.000Z"
      },
      {
        "id": "migration-def456",
        "name": "add_user_bio",
        "version": "20260203130000",
        "status": "pending",
        "createdAt": "2026-02-03T13:00:00.000Z"
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 6. 数据备份

#### 6.1 创建备份

创建数据库备份。

**请求**

```http
POST /v1/database/backups
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "name": "daily-backup",
  "description": "每日备份",
  "type": "full",
  "compression": true,
  "encryption": true,
  "destination": {
    "type": "s3",
    "bucket": "yyc3-backups",
    "path": "/database/production"
  }
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "backup": {
      "id": "backup-abc123",
      "name": "daily-backup",
      "type": "full",
      "status": "in_progress",
      "size": 0,
      "compression": true,
      "encryption": true,
      "createdAt": "2026-02-03T12:00:00.000Z",
      "estimatedCompletionAt": "2026-02-03T12:10:00.000Z"
    }
  },
  "message": "备份任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 6.2 查询备份状态

查询备份任务状态。

**请求**

```http
GET /v1/database/backups/{backupId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "backup": {
      "id": "backup-abc123",
      "name": "daily-backup",
      "type": "full",
      "status": "completed",
      "size": 1073741824,
      "compression": true,
      "encryption": true,
      "destination": {
        "type": "s3",
        "bucket": "yyc3-backups",
        "path": "/database/production/backup-abc123.sql.gz"
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "completedAt": "2026-02-03T12:08:30.000Z",
      "executionTime": 510
    }
  },
  "timestamp": "2026-02-03T12:08:30.000Z"
}
```

#### 6.3 列出备份

列出所有备份。

**请求**

```http
GET /v1/database/backups
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| connectionId | string | 否 | 连接ID |
| status | string | 否 | 状态筛选：in_progress、completed、failed |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "backups": [
      {
        "id": "backup-abc123",
        "name": "daily-backup",
        "type": "full",
        "status": "completed",
        "size": 1073741824,
        "createdAt": "2026-02-03T12:00:00.000Z",
        "completedAt": "2026-02-03T12:08:30.000Z"
      },
      {
        "id": "backup-def456",
        "name": "daily-backup",
        "type": "full",
        "status": "completed",
        "size": 1073741824,
        "createdAt": "2026-02-02T12:00:00.000Z",
        "completedAt": "2026-02-02T12:08:30.000Z"
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 7. 数据恢复

#### 7.1 执行恢复

从备份恢复数据库。

**请求**

```http
POST /v1/database/backups/{backupId}/restore
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "options": {
    "dropExisting": false,
    "createDatabase": true
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "restore": {
      "id": "restore-abc123",
      "backupId": "backup-abc123",
      "connectionId": "conn-abc123",
      "status": "in_progress",
      "createdAt": "2026-02-03T12:00:00.000Z",
      "estimatedCompletionAt": "2026-02-03T12:15:00.000Z"
    }
  },
  "message": "恢复任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 7.2 查询恢复状态

查询恢复任务状态。

**请求**

```http
GET /v1/database/restores/{restoreId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "restore": {
      "id": "restore-abc123",
      "backupId": "backup-abc123",
      "connectionId": "conn-abc123",
      "status": "completed",
      "progress": 100,
      "tablesRestored": 50,
      "rowsRestored": 1000000,
      "createdAt": "2026-02-03T12:00:00.000Z",
      "completedAt": "2026-02-03T12:12:30.000Z",
      "executionTime": 750
    }
  },
  "timestamp": "2026-02-03T12:12:30.000Z"
}
```

### 8. 数据库监控

#### 8.1 获取数据库统计

获取数据库统计信息。

**请求**

```http
GET /v1/database/stats
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| connectionId | string | 是 | 连接ID |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "connection": {
      "id": "conn-abc123",
      "name": "production-db",
      "type": "postgresql",
      "database": "yyc3_production"
    },
    "overview": {
      "tables": 50,
      "views": 10,
      "indexes": 200,
      "totalSize": 10737418240,
      "dataSize": 8589934592,
      "indexSize": 2147483648
    },
    "performance": {
      "queriesPerSecond": 100,
      "avgQueryTime": 10.5,
      "slowQueries": 5,
      "connections": 8,
      "activeConnections": 5
    },
    "storage": {
      "totalSpace": 53687091200,
      "usedSpace": 10737418240,
      "freeSpace": 42949672960,
      "usagePercentage": 20
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 8.2 获取慢查询

获取慢查询列表。

**请求**

```http
GET /v1/database/slow-queries
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| connectionId | string | 是 | 连接ID |
| threshold | number | 否 | 慢查询阈值（毫秒），默认为1000 |
| limit | number | 否 | 返回数量限制，默认为50 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "queries": [
      {
        "query": "SELECT * FROM orders WHERE user_id = ?",
        "executionTime": 2500,
        "rowsReturned": 10000,
        "executedAt": "2026-02-03T11:59:00.000Z",
        "suggestion": "添加索引: CREATE INDEX idx_orders_user_id ON orders(user_id)"
      },
      {
        "query": "SELECT * FROM users WHERE email LIKE ?",
        "executionTime": 1800,
        "rowsReturned": 5000,
        "executedAt": "2026-02-03T11:58:00.000Z",
        "suggestion": "考虑使用全文搜索或添加索引"
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 9. 索引管理

#### 9.1 创建索引

创建数据库索引。

**请求**

```http
POST /v1/database/indexes
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "connectionId": "conn-abc123",
  "table": "users",
  "name": "idx_users_email",
  "columns": ["email"],
  "unique": true,
  "type": "btree"
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "index": {
      "name": "idx_users_email",
      "table": "users",
      "columns": ["email"],
      "unique": true,
      "type": "btree",
      "size": 1048576,
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "索引创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 9.2 列出索引

列出表的所有索引。

**请求**

```http
GET /v1/database/indexes
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| connectionId | string | 是 | 连接ID |
| table | string | 是 | 表名 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "indexes": [
      {
        "name": "users_pkey",
        "table": "users",
        "columns": ["id"],
        "unique": true,
        "primary": true,
        "type": "btree",
        "size": 1048576
      },
      {
        "name": "idx_users_email",
        "table": "users",
        "columns": ["email"],
        "unique": true,
        "primary": false,
        "type": "btree",
        "size": 2097152
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 9.3 删除索引

删除索引。

**请求**

```http
DELETE /v1/database/indexes/{indexName}
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| connectionId | string | 是 | 连接ID |
| table | string | 是 | 表名 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "index": {
      "name": "idx_users_email",
      "table": "users",
      "deleted": true
    }
  },
  "message": "索引删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

## 错误代码

| 错误代码 | 描述 | HTTP状态码 |
|----------|------|------------|
| E701 | 数据库连接失败 | 503 |
| E702 | 查询执行失败 | 500 |
| E703 | 表不存在 | 404 |
| E704 | 数据已存在 | 409 |
| E705 | 事务冲突 | 409 |
| E706 | 迁移失败 | 500 |
| E707 | 备份失败 | 500 |
| E708 | 恢复失败 | 500 |
| E709 | 权限不足 | 403 |

## 使用示例

### JavaScript/TypeScript

```typescript
import { DatabaseService } from '@yyc3/sdk';

const dbService = new DatabaseService({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yyc3.com'
});

// 创建连接
const connection = await dbService.createConnection({
  name: 'production-db',
  type: 'postgresql',
  host: 'db.yyc3.com',
  port: 5432,
  database: 'yyc3_production',
  username: 'yyc3_user',
  password: 'secure_password'
});

// 执行查询
const results = await dbService.query({
  connectionId: connection.id,
  query: 'SELECT * FROM users WHERE status = $1',
  params: ['active']
});

console.log('查询结果:', results);

// 插入数据
const inserted = await dbService.insert({
  connectionId: connection.id,
  table: 'users',
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  }
});

console.log('插入成功:', inserted);
```

### Python

```python
from yyc3 import DatabaseService

db_service = DatabaseService(
    api_key='your-api-key',
    base_url='https://api.yyc3.com'
)

# 创建连接
connection = db_service.create_connection(
    name='production-db',
    type='postgresql',
    host='db.yyc3.com',
    port=5432,
    database='yyc3_production',
    username='yyc3_user',
    password='secure_password'
)

# 执行查询
results = db_service.query(
    connection_id=connection.id,
    query='SELECT * FROM users WHERE status = %s',
    params=['active']
)

print(f'查询结果: {results}')

# 插入数据
inserted = db_service.insert(
    connection_id=connection.id,
    table='users',
    data={
        'name': 'John Doe',
        'email': 'john@example.com',
        'status': 'active'
    }
)

print(f'插入成功: {inserted}')
```

## 最佳实践

1. **连接管理**
   - 使用连接池提高性能
   - 定期测试连接健康状态
   - 合理设置连接超时时间

2. **查询优化**
   - 使用索引加速查询
   - 避免SELECT *，只查询需要的字段
   - 使用参数化查询防止SQL注入

3. **事务管理**
   - 合理设置事务隔离级别
   - 保持事务简短，避免长时间锁定
   - 正确处理事务异常

4. **备份策略**
   - 定期创建备份
   - 测试备份恢复流程
   - 使用加密保护备份数据

5. **监控和告警**
   - 监控慢查询并及时优化
   - 监控数据库连接数和资源使用
   - 设置合理的告警阈值

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
