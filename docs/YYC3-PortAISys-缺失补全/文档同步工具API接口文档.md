# YYC³ 文档同步工具API接口文档

## 文档信息

**文档名称**: 文档同步工具API接口文档  
**文档版本**: v1.0  
**创建日期**: 2026-01-20  
**文档状态**: ✅ 已完成  
**维护团队**: YYC³ 开发团队  

---

## 一、API概述

### 1.1 基本信息

**API名称**: YYC³ 文档同步工具 API  
**API版本**: v1.0  
**基础URL**: `http://localhost:3100/api/v1`  
**协议**: HTTP/HTTPS  
**数据格式**: JSON

### 1.2 认证方式

**认证类型**: JWT (JSON Web Token)

**认证流程**:
1. 用户登录获取Token
2. 在请求头中携带Token
3. Token有效期: 24小时

**请求头示例**:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 1.3 响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... }
  },
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

---

## 二、认证接口

### 2.1 用户登录

**接口地址**: `POST /api/v1/auth/login`

**请求参数**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-001",
      "email": "user@example.com",
      "name": "张三",
      "role": "admin"
    },
    "expiresAt": "2026-01-21T12:00:00.000Z"
  },
  "message": "登录成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误码**:
- `AUTH_001`: 邮箱或密码错误
- `AUTH_002`: 账户已被禁用
- `AUTH_003`: 登录次数过多，请稍后再试

### 2.2 用户注册

**接口地址**: `POST /api/v1/auth/register`

**请求参数**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三",
  "role": "editor"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-002",
      "email": "user@example.com",
      "name": "张三",
      "role": "editor"
    }
  },
  "message": "注册成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误码**:
- `AUTH_004`: 邮箱已被注册
- `AUTH_005`: 密码强度不足
- `AUTH_006`: 邮箱格式不正确

### 2.3 刷新Token

**接口地址**: `POST /api/v1/auth/refresh`

**请求参数**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-01-21T12:00:00.000Z"
  },
  "message": "Token刷新成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误码**:
- `AUTH_007`: Token无效
- `AUTH_008`: Token已过期

---

## 三、映射规则接口

### 3.1 获取映射规则列表

**接口地址**: `GET /api/v1/mappings`

**请求参数**:
- `page`: 页码（默认: 1）
- `pageSize`: 每页数量（默认: 20）
- `status`: 状态筛选（可选: pending, syncing, success, failed, disabled）

**请求示例**:
```http
GET /api/v1/mappings?page=1&pageSize=20&status=success
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "mappings": [
      {
        "id": "mapping-001",
        "document": "docs/example.md",
        "codeFiles": ["core/example.ts"],
        "type": "one-to-one",
        "syncEnabled": true,
        "syncStatus": "success",
        "lastSyncTime": "2026-01-20T12:00:00.000Z",
        "createdAt": "2026-01-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    }
  },
  "message": "获取成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

### 3.2 获取单个映射规则

**接口地址**: `GET /api/v1/mappings/{id}`

**请求示例**:
```http
GET /api/v1/mappings/mapping-001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "mapping-001",
    "document": "docs/example.md",
    "codeFiles": ["core/example.ts"],
    "type": "one-to-one",
    "syncEnabled": true,
    "syncStatus": "success",
    "syncStrategy": "overwrite",
    "conflictResolution": "manual",
    "lastSyncTime": "2026-01-20T12:00:00.000Z",
    "syncHistory": [
      {
        "syncTime": "2026-01-20T12:00:00.000Z",
        "status": "success",
        "duration": 1234,
        "message": "同步成功"
      }
    ],
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-20T12:00:00.000Z"
  },
  "message": "获取成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误码**:
- `MAPPING_001`: 映射规则不存在

### 3.3 创建映射规则

**接口地址**: `POST /api/v1/mappings`

**请求参数**:
```json
{
  "document": "docs/new-feature.md",
  "codeFiles": ["core/new-feature.ts"],
  "type": "one-to-one",
  "syncEnabled": true,
  "syncStrategy": "overwrite",
  "conflictResolution": "manual"
}
```

**映射类型**:
- `one-to-one`: 一对一映射
- `one-to-many`: 一对多映射
- `many-to-one`: 多对一映射

**同步策略**:
- `overwrite`: 覆盖
- `merge`: 合并
- `append`: 追加

**冲突解决策略**:
- `manual`: 手动解决
- `latest`: 最新版本
- `document`: 文档优先
- `code`: 代码优先

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "mapping-002",
    "document": "docs/new-feature.md",
    "codeFiles": ["core/new-feature.ts"],
    "type": "one-to-one",
    "syncEnabled": true,
    "syncStatus": "pending",
    "createdAt": "2026-01-20T12:00:00.000Z"
  },
  "message": "创建成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误码**:
- `MAPPING_002`: 文档文件不存在
- `MAPPING_003`: 代码文件不存在
- `MAPPING_004`: 映射类型不正确
- `MAPPING_005`: 同步策略不正确

### 3.4 更新映射规则

**接口地址**: `PUT /api/v1/mappings/{id}`

**请求参数**:
```json
{
  "syncEnabled": false,
  "syncStrategy": "merge",
  "conflictResolution": "latest"
}
```

**请求示例**:
```http
PUT /api/v1/mappings/mapping-001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "syncEnabled": false
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "mapping-001",
    "document": "docs/example.md",
    "codeFiles": ["core/example.ts"],
    "type": "one-to-one",
    "syncEnabled": false,
    "syncStatus": "disabled",
    "updatedAt": "2026-01-20T12:00:00.000Z"
  },
  "message": "更新成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误码**:
- `MAPPING_001`: 映射规则不存在
- `MAPPING_006`: 没有更新权限

### 3.5 删除映射规则

**接口地址**: `DELETE /api/v1/mappings/{id}`

**请求示例**:
```http
DELETE /api/v1/mappings/mapping-001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "mapping-001"
  },
  "message": "删除成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误码**:
- `MAPPING_001`: 映射规则不存在
- `MAPPING_007`: 没有删除权限

---

## 四、同步接口

### 4.1 手动同步

**接口地址**: `POST /api/v1/sync`

**请求参数**:
```json
{
  "mappingId": "mapping-001",
  "force": false
}
```

**参数说明**:
- `mappingId`: 映射规则ID（可选，不指定则同步所有）
- `force`: 强制同步（可选，默认: false）

**请求示例**:
```http
POST /api/v1/sync
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "mappingId": "mapping-001"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "syncId": "sync-001",
    "mappingId": "mapping-001",
    "status": "syncing",
    "startTime": "2026-01-20T12:00:00.000Z"
  },
  "message": "同步任务已创建",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误码**:
- `SYNC_001`: 映射规则不存在
- `SYNC_002`: 同步任务已在执行中
- `SYNC_003`: 没有同步权限

### 4.2 批量同步

**接口地址**: `POST /api/v1/sync/batch`

**请求参数**:
```json
{
  "mappingIds": ["mapping-001", "mapping-002", "mapping-003"],
  "force": false
}
```

**请求示例**:
```http
POST /api/v1/sync/batch
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "mappingIds": ["mapping-001", "mapping-002"]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "syncTasks": [
      {
        "syncId": "sync-001",
        "mappingId": "mapping-001",
        "status": "syncing",
        "startTime": "2026-01-20T12:00:00.000Z"
      },
      {
        "syncId": "sync-002",
        "mappingId": "mapping-002",
        "status": "syncing",
        "startTime": "2026-01-20T12:00:00.000Z"
      }
    ]
  },
  "message": "批量同步任务已创建",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

### 4.3 获取同步状态

**接口地址**: `GET /api/v1/sync/status`

**请求参数**:
- `syncId`: 同步任务ID（可选）

**请求示例**:
```http
GET /api/v1/sync/status?syncId=sync-001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "syncId": "sync-001",
    "mappingId": "mapping-001",
    "status": "success",
    "startTime": "2026-01-20T12:00:00.000Z",
    "endTime": "2026-01-20T12:00:01.234Z",
    "duration": 1234,
    "message": "同步成功",
    "details": {
      "filesSynced": 1,
      "bytesTransferred": 1024,
      "conflictsResolved": 0
    }
  },
  "message": "获取成功",
  "timestamp": "2026-01-20T12:00:01.234Z"
}
```

**同步状态**:
- `pending`: 待执行
- `syncing`: 执行中
- `success`: 执行成功
- `failed`: 执行失败
- `cancelled`: 已取消

---

## 五、监控接口

### 5.1 获取系统状态

**接口地址**: `GET /api/v1/monitor/status`

**请求示例**:
```http
GET /api/v1/monitor/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "uptime": 86400,
    "version": "1.0.0",
    "lastSyncTime": "2026-01-20T12:00:00.000Z",
    "totalMappings": 50,
    "syncedMappings": 45,
    "failedMappings": 2,
    "pendingMappings": 3,
    "syncSuccessRate": 90.0,
    "avgSyncLatency": 2345,
    "systemResources": {
      "cpu": {
        "usage": 45.2,
        "status": "normal"
      },
      "memory": {
        "usage": 68.3,
        "status": "normal"
      },
      "disk": {
        "usage": 72.1,
        "status": "normal"
      }
    }
  },
  "message": "获取成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

### 5.2 获取同步历史

**接口地址**: `GET /api/v1/monitor/history`

**请求参数**:
- `page`: 页码（默认: 1）
- `pageSize`: 每页数量（默认: 20）
- `mappingId`: 映射规则ID筛选（可选）
- `status`: 状态筛选（可选: success, failed）
- `startTime`: 开始时间（可选）
- `endTime`: 结束时间（可选）

**请求示例**:
```http
GET /api/v1/monitor/history?page=1&pageSize=20&status=success
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "syncId": "sync-001",
        "mappingId": "mapping-001",
        "document": "docs/example.md",
        "codeFiles": ["core/example.ts"],
        "status": "success",
        "startTime": "2026-01-20T12:00:00.000Z",
        "endTime": "2026-01-20T12:00:01.234Z",
        "duration": 1234,
        "message": "同步成功"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "获取成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

### 5.3 获取性能指标

**接口地址**: `GET /api/v1/monitor/metrics`

**请求参数**:
- `startTime`: 开始时间（可选）
- `endTime`: 结束时间（可选）
- `interval`: 时间间隔（可选: 1m, 5m, 1h, 1d）

**请求示例**:
```http
GET /api/v1/monitor/metrics?interval=1h
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "timestamp": "2026-01-20T12:00:00.000Z",
        "syncSuccessRate": 95.0,
        "syncLatency": 2345,
        "syncThroughput": 50,
        "errorRate": 5.0,
        "cpuUsage": 45.2,
        "memoryUsage": 68.3,
        "diskUsage": 72.1
      },
      {
        "timestamp": "2026-01-20T13:00:00.000Z",
        "syncSuccessRate": 96.0,
        "syncLatency": 2156,
        "syncThroughput": 55,
        "errorRate": 4.0,
        "cpuUsage": 43.8,
        "memoryUsage": 66.5,
        "diskUsage": 72.5
      }
    ]
  },
  "message": "获取成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

---

## 六、告警接口

### 6.1 获取告警列表

**接口地址**: `GET /api/v1/alerts`

**请求参数**:
- `page`: 页码（默认: 1）
- `pageSize`: 每页数量（默认: 20）
- `level`: 告警级别筛选（可选: critical, warning, info）
- `status`: 状态筛选（可选: active, resolved, dismissed）

**请求示例**:
```http
GET /api/v1/alerts?page=1&pageSize=20&level=critical
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-001",
        "level": "critical",
        "type": "sync_failure",
        "title": "同步失败告警",
        "message": "映射规则 mapping-001 同步失败",
        "details": {
          "mappingId": "mapping-001",
          "error": "文件写入失败",
          "timestamp": "2026-01-20T12:00:00.000Z"
        },
        "status": "active",
        "createdAt": "2026-01-20T12:00:00.000Z",
        "resolvedAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 10,
      "totalPages": 1
    }
  },
  "message": "获取成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

### 6.2 标记告警已解决

**接口地址**: `PUT /api/v1/alerts/{id}/resolve`

**请求参数**:
```json
{
  "resolution": "问题已修复",
  "resolvedBy": "user-001"
}
```

**请求示例**:
```http
PUT /api/v1/alerts/alert-001/resolve
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "resolution": "问题已修复"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "status": "resolved",
    "resolution": "问题已修复",
    "resolvedAt": "2026-01-20T12:00:00.000Z"
  },
  "message": "标记成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

---

## 七、配置接口

### 7.1 获取全局配置

**接口地址**: `GET /api/v1/config`

**请求示例**:
```http
GET /api/v1/config
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "globalSettings": {
      "autoSync": true,
      "syncInterval": 300,
      "conflictResolution": "manual",
      "notificationEnabled": true,
      "maxConcurrentSyncs": 50,
      "batchSize": 100,
      "cacheEnabled": true,
      "cacheTTL": 3600
    },
    "monitoring": {
      "enabled": true,
      "metrics": {
        "syncSuccessRate": {
          "enabled": true,
          "threshold": {
            "warning": 95,
            "critical": 90
          }
        }
      },
      "alerts": {
        "enabled": true,
        "channels": [
          {
            "type": "console",
            "enabled": true
          },
          {
            "type": "email",
            "enabled": false
          }
        ]
      }
    }
  },
  "message": "获取成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

### 7.2 更新全局配置

**接口地址**: `PUT /api/v1/config`

**请求参数**:
```json
{
  "autoSync": false,
  "syncInterval": 600,
  "conflictResolution": "latest"
}
```

**请求示例**:
```http
PUT /api/v1/config
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "autoSync": false
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "globalSettings": {
      "autoSync": false,
      "syncInterval": 600,
      "conflictResolution": "latest",
      "notificationEnabled": true
    },
    "updatedAt": "2026-01-20T12:00:00.000Z"
  },
  "message": "更新成功",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**错误码**:
- `CONFIG_001`: 没有配置权限
- `CONFIG_002`: 配置参数不正确

---

## 八、错误码说明

### 8.1 认证错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| AUTH_001 | 邮箱或密码错误 | 检查邮箱和密码是否正确 |
| AUTH_002 | 账户已被禁用 | 联系管理员启用账户 |
| AUTH_003 | 登录次数过多 | 等待一段时间后再试 |
| AUTH_004 | 邮箱已被注册 | 使用其他邮箱注册 |
| AUTH_005 | 密码强度不足 | 使用更强的密码 |
| AUTH_006 | 邮箱格式不正确 | 检查邮箱格式 |
| AUTH_007 | Token无效 | 重新登录获取新Token |
| AUTH_008 | Token已过期 | 刷新Token或重新登录 |

### 8.2 映射规则错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| MAPPING_001 | 映射规则不存在 | 检查映射规则ID是否正确 |
| MAPPING_002 | 文档文件不存在 | 检查文档文件路径是否正确 |
| MAPPING_003 | 代码文件不存在 | 检查代码文件路径是否正确 |
| MAPPING_004 | 映射类型不正确 | 检查映射类型是否正确 |
| MAPPING_005 | 同步策略不正确 | 检查同步策略是否正确 |
| MAPPING_006 | 没有更新权限 | 联系管理员获取权限 |
| MAPPING_007 | 没有删除权限 | 联系管理员获取权限 |

### 8.3 同步错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| SYNC_001 | 映射规则不存在 | 检查映射规则ID是否正确 |
| SYNC_002 | 同步任务已在执行中 | 等待当前同步完成 |
| SYNC_003 | 没有同步权限 | 联系管理员获取权限 |

### 8.4 配置错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| CONFIG_001 | 没有配置权限 | 联系管理员获取权限 |
| CONFIG_002 | 配置参数不正确 | 检查配置参数是否正确 |

---

## 九、使用示例

### 9.1 JavaScript示例

```javascript
// 引入axios
const axios = require('axios');

// 配置API基础URL
const api = axios.create({
  baseURL: 'http://localhost:3100/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 登录获取Token
async function login(email, password) {
  try {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data.data.token;
    
    // 保存Token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return token;
  } catch (error) {
    console.error('登录失败:', error.response.data);
    throw error;
  }
}

// 获取映射规则列表
async function getMappings(page = 1, pageSize = 20) {
  try {
    const response = await api.get('/mappings', {
      params: { page, pageSize }
    });
    return response.data.data;
  } catch (error) {
    console.error('获取映射规则失败:', error.response.data);
    throw error;
  }
}

// 创建映射规则
async function createMapping(mapping) {
  try {
    const response = await api.post('/mappings', mapping);
    return response.data.data;
  } catch (error) {
    console.error('创建映射规则失败:', error.response.data);
    throw error;
  }
}

// 手动同步
async function sync(mappingId) {
  try {
    const response = await api.post('/sync', { mappingId });
    return response.data.data;
  } catch (error) {
    console.error('同步失败:', error.response.data);
    throw error;
  }
}

// 使用示例
(async () => {
  // 登录
  await login('user@example.com', 'password123');
  
  // 获取映射规则
  const mappings = await getMappings();
  console.log('映射规则:', mappings.mappings);
  
  // 创建新映射
  const newMapping = await createMapping({
    document: 'docs/new.md',
    codeFiles: ['core/new.ts'],
    type: 'one-to-one',
    syncEnabled: true
  });
  console.log('新映射:', newMapping);
  
  // 执行同步
  const syncResult = await sync(newMapping.id);
  console.log('同步结果:', syncResult);
})();
```

### 9.2 Python示例

```python
import requests
import json

# 配置API基础URL
BASE_URL = 'http://localhost:3100/api/v1'
HEADERS = {
    'Content-Type': 'application/json'
}

# 登录获取Token
def login(email, password):
    url = f'{BASE_URL}/auth/login'
    data = {
        'email': email,
        'password': password
    }
    
    response = requests.post(url, json=data, headers=HEADERS)
    
    if response.status_code == 200:
        token = response.json()['data']['token']
        HEADERS['Authorization'] = f'Bearer {token}'
        return token
    else:
        raise Exception(f'登录失败: {response.json()}')

# 获取映射规则列表
def get_mappings(page=1, page_size=20):
    url = f'{BASE_URL}/mappings'
    params = {
        'page': page,
        'pageSize': page_size
    }
    
    response = requests.get(url, params=params, headers=HEADERS)
    
    if response.status_code == 200:
        return response.json()['data']
    else:
        raise Exception(f'获取映射规则失败: {response.json()}')

# 创建映射规则
def create_mapping(mapping):
    url = f'{BASE_URL}/mappings'
    
    response = requests.post(url, json=mapping, headers=HEADERS)
    
    if response.status_code == 200:
        return response.json()['data']
    else:
        raise Exception(f'创建映射规则失败: {response.json()}')

# 手动同步
def sync(mapping_id):
    url = f'{BASE_URL}/sync'
    data = {
        'mappingId': mapping_id
    }
    
    response = requests.post(url, json=data, headers=HEADERS)
    
    if response.status_code == 200:
        return response.json()['data']
    else:
        raise Exception(f'同步失败: {response.json()}')

# 使用示例
if __name__ == '__main__':
    # 登录
    token = login('user@example.com', 'password123')
    
    # 获取映射规则
    mappings = get_mappings()
    print('映射规则:', mappings['mappings'])
    
    # 创建新映射
    new_mapping = create_mapping({
        'document': 'docs/new.md',
        'codeFiles': ['core/new.ts'],
        'type': 'one-to-one',
        'syncEnabled': True
    })
    print('新映射:', new_mapping)
    
    # 执行同步
    sync_result = sync(new_mapping['id'])
    print('同步结果:', sync_result)
```

---

## 十、总结

本文档详细描述了YYC³文档同步工具的API接口，包括认证接口、映射规则接口、同步接口、监控接口、告警接口和配置接口。

通过使用本API，开发者可以集成YYC³文档同步工具到自己的应用中，实现自动化的文档和代码同步管理。

---

**文档结束**

**签名**: YYC³ 开发团队  
**日期**: 2026-01-20
