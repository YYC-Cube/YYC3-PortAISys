# YYC³ PortAISys - 用户管理API

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

- [用户管理API概述](#用户管理api概述)
- [用户CRUD操作](#用户crud操作)
- [用户信息管理](#用户信息管理)
- [用户角色管理](#用户角色管理)
- [用户权限管理](#用户权限管理)
- [用户活动管理](#用户活动管理)

---

## 用户管理API概述

### API简介

YYC³ PortAISys用户管理API提供完整的用户管理功能，包括用户创建、查询、更新、删除、角色管理、权限管理和活动管理等功能。支持RBAC（基于角色的访问控制）模型。

### 核心功能

- **用户管理**: 完整的用户CRUD操作
- **角色管理**: 用户角色分配和管理
- **权限管理**: 细粒度的权限控制
- **活动管理**: 用户活动跟踪
- **批量操作**: 批量用户管理
- **用户搜索**: 灵活的用户搜索功能

### 用户角色

| 角色 | 描述 | 权限级别 |
|------|------|----------|
| **SUPER_ADMIN** | 超级管理员 | 所有权限 |
| **ADMIN** | 管理员 | 管理权限 |
| **MODERATOR** | 版主 | 内容管理权限 |
| **USER** | 普通用户 | 基本权限 |
| **GUEST** | 访客 | 只读权限 |

---

## 用户CRUD操作

### 创建用户

**端点**: `POST /v1/users`

**描述**: 创建新用户。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "name": "John Doe",
  "phone": "+8613800138000",
  "avatar": "https://example.com/avatar.jpg",
  "role": "USER",
  "status": "ACTIVE",
  "metadata": {
    "department": "Engineering",
    "position": "Developer"
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **email** | string | 是 | 用户邮箱，必须是有效邮箱格式 |
| **username** | string | 是 | 用户名，3-50字符，唯一 |
| **password** | string | 是 | 密码，至少8字符，必须包含字母和数字 |
| **name** | string | 是 | 用户真实姓名，1-100字符 |
| **phone** | string | 否 | 手机号码，国际格式 |
| **avatar** | string | 否 | 头像URL |
| **role** | string | 否 | 用户角色，默认USER |
| **status** | string | 否 | 用户状态，默认ACTIVE |
| **metadata** | object | 否 | 用户元数据 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "phone": "+8613800138000",
    "avatar": "https://example.com/avatar.jpg",
    "role": "USER",
    "status": "ACTIVE",
    "metadata": {
      "department": "Engineering",
      "position": "Developer"
    },
    "permissions": [
      "user:read",
      "user:write",
      "workflow:read",
      "workflow:write",
      "ai:chat"
    ],
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "用户创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 查询用户列表

**端点**: `GET /v1/users`

**描述**: 获取用户列表。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **page** | number | 否 | 页码，默认1 |
| **limit** | number | 否 | 每页数量，默认20 |
| **search** | string | 否 | 搜索关键词（搜索邮箱、用户名、姓名） |
| **role** | string | 否 | 用户角色 |
| **status** | string | 否 | 用户状态（ACTIVE、INACTIVE、SUSPENDED） |
| **sort** | string | 否 | 排序字段，默认createdAt |
| **order** | string | 否 | 排序方向（asc、desc），默认desc |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user-123",
        "email": "user@example.com",
        "username": "johndoe",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg",
        "role": "USER",
        "status": "ACTIVE",
        "lastLoginAt": "2026-02-03T10:00:00.000Z",
        "createdAt": "2026-02-01T12:00:00.000Z"
      },
      {
        "id": "user-456",
        "email": "jane@example.com",
        "username": "janedoe",
        "name": "Jane Doe",
        "avatar": "https://example.com/avatar2.jpg",
        "role": "ADMIN",
        "status": "ACTIVE",
        "lastLoginAt": "2026-02-03T11:00:00.000Z",
        "createdAt": "2026-01-28T12:00:00.000Z"
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
  "message": "查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取用户详情

**端点**: `GET /v1/users/{userId}`

**描述**: 获取指定用户的详细信息。

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
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "phone": "+8613800138000",
    "avatar": "https://example.com/avatar.jpg",
    "role": "USER",
    "status": "ACTIVE",
    "metadata": {
      "department": "Engineering",
      "position": "Developer"
    },
    "permissions": [
      "user:read",
      "user:write",
      "workflow:read",
      "workflow:write",
      "ai:chat"
    ],
    "stats": {
      "totalLogins": 150,
      "lastLoginAt": "2026-02-03T10:00:00.000Z",
      "totalWorkflows": 25,
      "totalExecutions": 500
    },
    "createdAt": "2026-02-01T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "获取用户详情成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 更新用户

**端点**: `PUT /v1/users/{userId}`

**描述**: 更新指定用户的信息。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "John Smith",
  "phone": "+8613900139000",
  "avatar": "https://example.com/new-avatar.jpg",
  "status": "ACTIVE",
  "metadata": {
    "department": "Product",
    "position": "Manager"
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 否 | 用户真实姓名 |
| **phone** | string | 否 | 手机号码 |
| **avatar** | string | 否 | 头像URL |
| **status** | string | 否 | 用户状态 |
| **metadata** | object | 否 | 用户元数据 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Smith",
    "phone": "+8613900139000",
    "avatar": "https://example.com/new-avatar.jpg",
    "role": "USER",
    "status": "ACTIVE",
    "metadata": {
      "department": "Product",
      "position": "Manager"
    },
    "updatedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "用户更新成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 删除用户

**端点**: `DELETE /v1/users/{userId}`

**描述**: 删除指定用户。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {},
  "message": "用户删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 用户信息管理

### 更新个人信息

**端点**: `PUT /v1/users/me`

**描述**: 更新当前用户的个人信息。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "John Smith",
  "phone": "+8613900139000",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Smith",
    "phone": "+8613900139000",
    "avatar": "https://example.com/new-avatar.jpg",
    "updatedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "个人信息更新成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 修改密码

**端点**: `PUT /v1/users/me/password`

**描述**: 修改当前用户的密码。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **currentPassword** | string | 是 | 当前密码 |
| **newPassword** | string | 是 | 新密码，至少8字符 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {},
  "message": "密码修改成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 上传头像

**端点**: `POST /v1/users/me/avatar`

**描述**: 上传当前用户的头像。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
X-Request-ID: <unique-request-id>
```

**请求体**:

```
avatar: <binary>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "avatar": "https://cdn.yyc3.com/avatars/user-123.jpg",
    "url": "https://cdn.yyc3.com/avatars/user-123.jpg",
    "thumbnailUrl": "https://cdn.yyc3.com/avatars/user-123-thumb.jpg"
  },
  "message": "头像上传成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 用户角色管理

### 分配角色

**端点**: `PUT /v1/users/{userId}/role`

**描述**: 为用户分配角色。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "role": "ADMIN"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **role** | string | 是 | 用户角色 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "role": "ADMIN",
    "permissions": [
      "user:read",
      "user:write",
      "user:delete",
      "workflow:read",
      "workflow:write",
      "workflow:delete",
      "ai:chat",
      "ai:manage"
    ],
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "角色分配成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取角色列表

**端点**: `GET /v1/users/roles`

**描述**: 获取所有可用的角色。

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
    "roles": [
      {
        "name": "SUPER_ADMIN",
        "description": "超级管理员",
        "permissions": ["*"],
        "level": 100
      },
      {
        "name": "ADMIN",
        "description": "管理员",
        "permissions": [
          "user:read",
          "user:write",
          "user:delete",
          "workflow:read",
          "workflow:write",
          "workflow:delete",
          "ai:chat",
          "ai:manage"
        ],
        "level": 80
      },
      {
        "name": "MODERATOR",
        "description": "版主",
        "permissions": [
          "user:read",
          "workflow:read",
          "workflow:write",
          "ai:chat"
        ],
        "level": 60
      },
      {
        "name": "USER",
        "description": "普通用户",
        "permissions": [
          "user:read",
          "user:write",
          "workflow:read",
          "workflow:write",
          "ai:chat"
        ],
        "level": 40
      },
      {
        "name": "GUEST",
        "description": "访客",
        "permissions": [
          "user:read",
          "workflow:read"
        ],
        "level": 20
      }
    ]
  },
  "message": "获取角色列表成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 用户权限管理

### 添加权限

**端点**: `POST /v1/users/{userId}/permissions`

**描述**: 为用户添加权限。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "permissions": [
    "workflow:delete",
    "ai:manage"
  ]
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **permissions** | array | 是 | 权限列表 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "permissions": [
      "user:read",
      "user:write",
      "workflow:read",
      "workflow:write",
      "workflow:delete",
      "ai:chat",
      "ai:manage"
    ],
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "权限添加成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 移除权限

**端点**: `DELETE /v1/users/{userId}/permissions`

**描述**: 移除用户的权限。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "permissions": [
    "workflow:delete",
    "ai:manage"
  ]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "permissions": [
      "user:read",
      "user:write",
      "workflow:read",
      "workflow:write",
      "ai:chat"
    ],
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "权限移除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 检查权限

**端点**: `POST /v1/users/{userId}/permissions/check`

**描述**: 检查用户是否拥有指定权限。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "permissions": [
    "user:delete",
    "workflow:write",
    "ai:chat"
  ]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "permissions": {
      "user:delete": false,
      "workflow:write": true,
      "ai:chat": true
    }
  },
  "message": "权限检查成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 用户活动管理

### 获取用户活动

**端点**: `GET /v1/users/{userId}/activities`

**描述**: 获取用户的活动记录。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **page** | number | 否 | 页码，默认1 |
| **limit** | number | 否 | 每页数量，默认20 |
| **type** | string | 否 | 活动类型（login、logout、create、update、delete） |
| **startDate** | string | 否 | 开始日期 |
| **endDate** | string | 否 | 结束日期 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "activity-1",
        "type": "login",
        "description": "用户登录",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2026-02-03T10:00:00.000Z"
      },
      {
        "id": "activity-2",
        "type": "create",
        "description": "创建工作流",
        "metadata": {
          "workflowId": "workflow-123",
          "workflowName": "AI内容生成工作流"
        },
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
  "message": "获取用户活动成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取用户统计

**端点**: `GET /v1/users/{userId}/stats`

**描述**: 获取用户的统计信息。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **period** | string | 否 | 统计周期（day、week、month、year），默认week |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "period": "week",
    "stats": {
      "totalLogins": 15,
      "totalWorkflows": 5,
      "totalExecutions": 50,
      "totalAiCalls": 100,
      "averageExecutionTime": 15.5
    },
    "dailyStats": [
      {
        "date": "2026-01-28",
        "logins": 2,
        "workflows": 1,
        "executions": 10,
        "aiCalls": 20
      },
      {
        "date": "2026-01-29",
        "logins": 3,
        "workflows": 0,
        "executions": 8,
        "aiCalls": 15
      }
    ]
  },
  "message": "获取用户统计成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 批量操作

### 批量更新用户

**端点**: `PUT /v1/users/batch`

**描述**: 批量更新用户信息。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "userIds": ["user-123", "user-456", "user-789"],
  "updates": {
    "status": "ACTIVE"
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **userIds** | array | 是 | 用户ID列表 |
| **updates** | object | 是 | 更新内容 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": 0,
    "results": [
      {
        "userId": "user-123",
        "status": "success"
      },
      {
        "userId": "user-456",
        "status": "success"
      },
      {
        "userId": "user-789",
        "status": "success"
      }
    ]
  },
  "message": "批量更新成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 批量删除用户

**端点**: `DELETE /v1/users/batch`

**描述**: 批量删除用户。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "userIds": ["user-123", "user-456", "user-789"]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "deleted": 3,
    "failed": 0,
    "results": [
      {
        "userId": "user-123",
        "status": "success"
      },
      {
        "userId": "user-456",
        "status": "success"
      },
      {
        "userId": "user-789",
        "status": "success"
      }
    ]
  },
  "message": "批量删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 最佳实践

### 用户管理

1. **密码安全**: 强制使用强密码，定期要求用户更新密码
2. **角色分配**: 遵循最小权限原则，只分配必要的角色
3. **用户验证**: 验证用户邮箱和手机号码
4. **账户锁定**: 实施账户锁定策略防止暴力破解
5. **审计日志**: 记录所有用户管理操作

### 性能优化

1. **分页查询**: 使用分页避免一次性加载大量用户
2. **索引优化**: 为常用查询字段创建索引
3. **缓存结果**: 缓存用户信息减少数据库查询
4. **批量操作**: 使用批量操作提高效率
5. **异步处理**: 对于耗时操作使用异步处理

### 安全考虑

1. **输入验证**: 验证所有用户输入
2. **权限检查**: 实施严格的权限检查
3. **数据脱敏**: 敏感信息脱敏处理
4. **加密存储**: 密码等敏感信息加密存储
5. **访问控制**: 实施适当的访问控制

---

## 下一步

- [认证API](./02-认证API.md) - 学习认证相关API
- [AI智能体API](./03-AI智能体API.md) - 学习AI相关API
- [权限管理API](./07-权限管理API.md) - 学习权限管理API

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
