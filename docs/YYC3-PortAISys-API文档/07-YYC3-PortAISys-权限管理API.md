# YYC³ PortAISys - 权限管理API

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

- [权限管理API概述](#权限管理api概述)
- [角色管理](#角色管理)
- [权限管理](#权限管理)
- [权限检查](#权限检查)
- [资源权限](#资源权限)
- [权限审计](#权限审计)

---

## 权限管理API概述

### API简介

YYC³ PortAISys权限管理API提供完整的权限管理功能，包括角色管理、权限管理、权限检查、资源权限和权限审计等功能。基于RBAC（基于角色的访问控制）模型，支持细粒度的权限控制。

### 核心功能

- **角色管理**: 角色的创建、编辑、删除
- **权限管理**: 权限的创建、编辑、删除
- **权限检查**: 检查用户或角色是否拥有指定权限
- **资源权限**: 资源级别的权限控制
- **权限审计**: 权限变更审计日志

### 权限模型

YYC³采用三层权限模型：

1. **角色层**: 定义用户角色（如ADMIN、USER）
2. **权限层**: 定义具体权限（如user:read、user:write）
3. **资源层**: 定义资源级别的权限（如workflow:123:read）

### 权限格式

权限采用`资源:操作`格式：

| 权限 | 描述 |
|------|------|
| **user:read** | 读取用户信息 |
| **user:write** | 写入用户信息 |
| **user:delete** | 删除用户 |
| **workflow:read** | 读取工作流 |
| **workflow:write** | 写入工作流 |
| **workflow:delete** | 删除工作流 |
| **ai:chat** | AI对话 |
| **ai:manage** | AI管理 |
| **admin:all** | 所有管理权限 |

---

## 角色管理

### 创建角色

**端点**: `POST /v1/roles`

**描述**: 创建新的角色。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "CONTENT_MANAGER",
  "description": "内容管理员",
  "level": 50,
  "permissions": [
    "user:read",
    "workflow:read",
    "workflow:write",
    "ai:chat"
  ],
  "metadata": {
    "department": "Content",
    "category": "management"
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | 角色名称，唯一 |
| **description** | string | 是 | 角色描述 |
| **level** | number | 否 | 角色级别，0-100，默认50 |
| **permissions** | array | 否 | 角色权限列表 |
| **metadata** | object | 否 | 角色元数据 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "role-123",
    "name": "CONTENT_MANAGER",
    "description": "内容管理员",
    "level": 50,
    "permissions": [
      "user:read",
      "workflow:read",
      "workflow:write",
      "ai:chat"
    ],
    "metadata": {
      "department": "Content",
      "category": "management"
    },
    "userCount": 0,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "角色创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 更新角色

**端点**: `PUT /v1/roles/{roleId}`

**描述**: 更新指定角色。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "description": "高级内容管理员",
  "level": 60,
  "permissions": [
    "user:read",
    "user:write",
    "workflow:read",
    "workflow:write",
    "workflow:delete",
    "ai:chat",
    "ai:manage"
  ]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "role-123",
    "name": "CONTENT_MANAGER",
    "description": "高级内容管理员",
    "level": 60,
    "permissions": [
      "user:read",
      "user:write",
      "workflow:read",
      "workflow:write",
      "workflow:delete",
      "ai:chat",
      "ai:manage"
    ],
    "userCount": 5,
    "updatedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "角色更新成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 列出角色

**端点**: `GET /v1/roles`

**描述**: 获取角色列表。

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
| **search** | string | 否 | 搜索关键词 |
| **level** | number | 否 | 角色级别 |
| **sort** | string | 否 | 排序字段，默认level |
| **order** | string | 否 | 排序方向（asc、desc），默认desc |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "role-1",
        "name": "SUPER_ADMIN",
        "description": "超级管理员",
        "level": 100,
        "userCount": 2,
        "isSystem": true,
        "createdAt": "2026-01-01T12:00:00.000Z"
      },
      {
        "id": "role-2",
        "name": "ADMIN",
        "description": "管理员",
        "level": 80,
        "userCount": 5,
        "isSystem": true,
        "createdAt": "2026-01-01T12:00:00.000Z"
      },
      {
        "id": "role-123",
        "name": "CONTENT_MANAGER",
        "description": "内容管理员",
        "level": 50,
        "userCount": 5,
        "isSystem": false,
        "createdAt": "2026-02-03T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取角色详情

**端点**: `GET /v1/roles/{roleId}`

**描述**: 获取指定角色的详细信息。

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
    "id": "role-123",
    "name": "CONTENT_MANAGER",
    "description": "内容管理员",
    "level": 50,
    "permissions": [
      "user:read",
      "workflow:read",
      "workflow:write",
      "ai:chat"
    ],
    "metadata": {
      "department": "Content",
      "category": "management"
    },
    "userCount": 5,
    "users": [
      {
        "id": "user-1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "id": "user-2",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    ],
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "获取角色详情成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 删除角色

**端点**: `DELETE /v1/roles/{roleId}`

**描述**: 删除指定角色。

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
  "message": "角色删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 权限管理

### 创建权限

**端点**: `POST /v1/permissions`

**描述**: 创建新的权限。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "workflow:publish",
  "description": "发布工作流",
  "category": "workflow",
  "resource": "workflow",
  "action": "publish",
  "level": 60
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | 权限名称，格式：资源:操作 |
| **description** | string | 是 | 权限描述 |
| **category** | string | 是 | 权限分类 |
| **resource** | string | 是 | 资源类型 |
| **action** | string | 是 | 操作类型 |
| **level** | number | 否 | 权限级别，0-100，默认50 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "perm-123",
    "name": "workflow:publish",
    "description": "发布工作流",
    "category": "workflow",
    "resource": "workflow",
    "action": "publish",
    "level": 60,
    "roleCount": 0,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "权限创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 列出权限

**端点**: `GET /v1/permissions`

**描述**: 获取权限列表。

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
| **category** | string | 否 | 权限分类 |
| **resource** | string | 否 | 资源类型 |
| **search** | string | 否 | 搜索关键词 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "perm-1",
        "name": "user:read",
        "description": "读取用户信息",
        "category": "user",
        "resource": "user",
        "action": "read",
        "level": 40,
        "roleCount": 5,
        "isSystem": true
      },
      {
        "id": "perm-2",
        "name": "user:write",
        "description": "写入用户信息",
        "category": "user",
        "resource": "user",
        "action": "write",
        "level": 60,
        "roleCount": 3,
        "isSystem": true
      },
      {
        "id": "perm-123",
        "name": "workflow:publish",
        "description": "发布工作流",
        "category": "workflow",
        "resource": "workflow",
        "action": "publish",
        "level": 60,
        "roleCount": 0,
        "isSystem": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 为角色添加权限

**端点**: `POST /v1/roles/{roleId}/permissions`

**描述**: 为角色添加权限。

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
    "workflow:publish",
    "workflow:archive"
  ]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "roleId": "role-123",
    "permissions": [
      "user:read",
      "workflow:read",
      "workflow:write",
      "workflow:publish",
      "workflow:archive",
      "ai:chat"
    ],
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "权限添加成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 从角色移除权限

**端点**: `DELETE /v1/roles/{roleId}/permissions`

**描述**: 从角色移除权限。

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
    "workflow:publish",
    "workflow:archive"
  ]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "roleId": "role-123",
    "permissions": [
      "user:read",
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

---

## 权限检查

### 检查用户权限

**端点**: `POST /v1/permissions/check/user`

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
  "userId": "user-123",
  "permissions": [
    "user:read",
    "user:write",
    "user:delete",
    "workflow:publish"
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
      "user:read": true,
      "user:write": true,
      "user:delete": false,
      "workflow:publish": false
    },
    "roles": [
      {
        "id": "role-1",
        "name": "USER",
        "level": 40
      }
    ]
  },
  "message": "权限检查成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 检查角色权限

**端点**: `POST /v1/permissions/check/role`

**描述**: 检查角色是否拥有指定权限。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "roleId": "role-123",
  "permissions": [
    "user:read",
    "user:write",
    "user:delete",
    "workflow:publish"
  ]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "roleId": "role-123",
    "roleName": "CONTENT_MANAGER",
    "permissions": {
      "user:read": true,
      "user:write": false,
      "user:delete": false,
      "workflow:publish": true
    }
  },
  "message": "权限检查成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 批量检查权限

**端点**: `POST /v1/permissions/check/batch`

**描述**: 批量检查多个用户的权限。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "checks": [
    {
      "userId": "user-123",
      "permissions": ["user:read", "user:write"]
    },
    {
      "userId": "user-456",
      "permissions": ["user:read", "user:delete"]
    }
  ]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "userId": "user-123",
        "permissions": {
          "user:read": true,
          "user:write": true
        }
      },
      {
        "userId": "user-456",
        "permissions": {
          "user:read": true,
          "user:delete": false
        }
      }
    ]
  },
  "message": "批量权限检查成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 资源权限

### 创建资源权限

**端点**: `POST /v1/permissions/resource`

**描述**: 为特定资源创建权限。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "resourceType": "workflow",
  "resourceId": "workflow-123",
  "userId": "user-456",
  "permissions": [
    "read",
    "write",
    "execute"
  ]
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **resourceType** | string | 是 | 资源类型 |
| **resourceId** | string | 是 | 资源ID |
| **userId** | string | 是 | 用户ID |
| **permissions** | array | 是 | 权限列表 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "res-perm-123",
    "resourceType": "workflow",
    "resourceId": "workflow-123",
    "userId": "user-456",
    "userName": "Jane Doe",
    "permissions": [
      "read",
      "write",
      "execute"
    ],
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "资源权限创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取资源权限

**端点**: `GET /v1/permissions/resource/{resourceType}/{resourceId}`

**描述**: 获取指定资源的权限列表。

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
    "resourceType": "workflow",
    "resourceId": "workflow-123",
    "permissions": [
      {
        "id": "res-perm-123",
        "userId": "user-456",
        "userName": "Jane Doe",
        "permissions": ["read", "write", "execute"],
        "createdAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "res-perm-456",
        "userId": "user-789",
        "userName": "Bob Smith",
        "permissions": ["read"],
        "createdAt": "2026-02-03T12:30:00.000Z"
      }
    ]
  },
  "message": "获取资源权限成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 删除资源权限

**端点**: `DELETE /v1/permissions/resource/{resourcePermissionId}`

**描述**: 删除指定的资源权限。

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
  "message": "资源权限删除成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 权限审计

### 获取权限变更日志

**端点**: `GET /v1/permissions/audit`

**描述**: 获取权限变更审计日志。

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
| **userId** | string | 否 | 用户ID |
| **roleId** | string | 否 | 角色ID |
| **action** | string | 否 | 操作类型（grant、revoke） |
| **startDate** | string | 否 | 开始日期 |
| **endDate** | string | 否 | 结束日期 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "audit-1",
        "action": "grant",
        "targetType": "user",
        "targetId": "user-123",
        "targetName": "John Doe",
        "permission": "workflow:publish",
        "grantedBy": "admin@example.com",
        "grantedAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "audit-2",
        "action": "revoke",
        "targetType": "role",
        "targetId": "role-123",
        "targetName": "CONTENT_MANAGER",
        "permission": "user:delete",
        "revokedBy": "admin@example.com",
        "revokedAt": "2026-02-03T12:30:00.000Z"
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
  "message": "获取审计日志成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 导出权限报告

**端点**: `POST /v1/permissions/report`

**描述**: 导出权限报告。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "format": "csv",
  "include": {
    "roles": true,
    "users": true,
    "permissions": true,
    "resourcePermissions": false
  }
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "reportId": "report-123",
    "format": "csv",
    "downloadUrl": "https://api.yyc3.com/v1/permissions/reports/report-123/download",
    "expiresAt": "2026-02-03T13:00:00.000Z"
  },
  "message": "权限报告生成成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 最佳实践

### 权限设计

1. **最小权限原则**: 只分配必要的权限
2. **角色层次**: 建立清晰的角色层次结构
3. **权限分类**: 按资源和操作分类权限
4. **定期审查**: 定期审查和清理不必要的权限
5. **审计追踪**: 记录所有权限变更

### 安全考虑

1. **权限验证**: 在所有操作前验证权限
2. **缓存权限**: 缓存权限信息提高性能
3. **权限继承**: 合理使用权限继承
4. **资源隔离**: 确保资源级别的权限隔离
5. **敏感操作**: 对敏感操作实施额外验证

### 性能优化

1. **权限缓存**: 缓存用户和角色权限
2. **批量检查**: 使用批量权限检查API
3. **索引优化**: 为权限查询创建索引
4. **异步处理**: 对于大批量权限操作使用异步处理
5. **定期清理**: 定期清理过期的权限数据

---

## 下一步

- [用户管理API](./06-用户管理API.md) - 学习用户管理API
- [安全审计API](./08-安全审计API.md) - 学习安全审计API
- [系统监控API](./09-系统监控API.md) - 学习系统监控API

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
