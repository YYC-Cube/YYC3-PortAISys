---
@file: 21-YYC3-PortAISys-错误代码参考.md
@description: YYC³ PortAISys 错误代码参考文档，包含所有 API 错误代码的详细说明
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: api,restful,critical,zh-CN
@category: api
@language: zh-CN
@base_url: https://api.yyc3.com/v1
@authentication: oauth2
@audience: developers
@complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ PortAISys - 错误代码参考


## 📋 目录

- [错误代码概述](#错误代码概述)
- [通用错误](#通用错误)
- [认证错误](#认证错误)
- [用户错误](#用户错误)
- [AI错误](#ai错误)
- [工作流错误](#工作流错误)
- [数据错误](#数据错误)
- [系统错误](#系统错误)
- [错误处理建议](#错误处理建议)

---

## 错误代码概述

### 错误代码格式

YYC³ API使用统一的错误代码格式：`E[类别][序号]`

- **E**: Error（错误）
- **类别**: 错误类别（0-9）
- **序号**: 该类别下的错误序号

### 错误类别

| 类别 | 范围 | 描述 |
|------|------|------|
| **通用错误** | E000-E099 | 通用系统错误 |
| **认证错误** | E100-E199 | 认证和授权相关错误 |
| **用户错误** | E200-E299 | 用户管理相关错误 |
| **AI错误** | E300-E399 | AI服务相关错误 |
| **工作流错误** | E400-E499 | 工作流相关错误 |
| **数据错误** | E500-E599 | 数据存储相关错误 |
| **系统错误** | E900-E999 | 系统级错误 |

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "E001",
    "message": "错误描述",
    "details": {
      // 详细错误信息
    },
    "stack": "错误堆栈（仅开发环境）"
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

---

## 通用错误

### E000 - 服务器内部错误

**HTTP状态码**: 500

**描述**: 服务器内部发生未预期的错误。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E000",
    "message": "服务器内部错误",
    "details": {
      "errorId": "err-abc123",
      "timestamp": "2026-02-03T12:00:00.000Z"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 等待几秒后重试
- 如果问题持续，请联系技术支持
- 检查系统状态页面

### E001 - 资源不存在

**HTTP状态码**: 404

**描述**: 请求的资源不存在。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E001",
    "message": "资源不存在",
    "details": {
      "resource": "user",
      "resourceId": "user-123"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查资源ID是否正确
- 确认资源是否已被删除
- 检查URL路径是否正确

### E002 - 请求参数错误

**HTTP状态码**: 400

**描述**: 请求参数格式错误或缺少必需参数。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E002",
    "message": "请求参数错误",
    "details": {
      "field": "email",
      "issue": "invalid_format",
      "message": "邮箱格式不正确"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查请求参数格式
- 确认所有必需参数都已提供
- 参考API文档了解正确的参数格式

### E003 - 未授权

**HTTP状态码**: 401

**描述**: 请求未授权，缺少有效的认证信息。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E003",
    "message": "未授权",
    "details": {
      "reason": "missing_token"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查是否提供了有效的认证令牌
- 确认令牌是否已过期
- 重新登录获取新的令牌

### E004 - 禁止访问

**HTTP状态码**: 403

**描述**: 请求被禁止，用户没有访问权限。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E004",
    "message": "禁止访问",
    "details": {
      "requiredPermission": "user:delete",
      "userPermissions": ["user:read", "user:write"]
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查用户权限是否足够
- 联系管理员申请所需权限
- 确认用户账户状态正常

### E005 - 资源冲突

**HTTP状态码**: 409

**描述**: 请求的资源与现有资源冲突。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E005",
    "message": "资源冲突",
    "details": {
      "field": "email",
      "value": "user@example.com",
      "conflict": "email_already_exists"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查冲突字段的具体信息
- 使用不同的值重新尝试
- 联系管理员确认资源状态

### E006 - 请求参数验证失败

**HTTP状态码**: 422

**描述**: 请求参数验证失败。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E006",
    "message": "请求参数验证失败",
    "details": {
      "errors": [
        {
          "field": "password",
          "message": "密码至少8个字符"
        },
        {
          "field": "email",
          "message": "邮箱格式不正确"
        }
      ]
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查所有验证错误
- 修正参数后重新提交
- 参考API文档了解验证规则

### E007 - 请求过于频繁

**HTTP状态码**: 429

**描述**: 请求过于频繁，超过了速率限制。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E007",
    "message": "请求过于频繁",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": "2026-02-03T12:01:00.000Z"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 等待速率限制重置后重试
- 实施客户端速率限制
- 考虑使用批量API减少请求次数

---

## 认证错误

### E100 - Token无效或过期

**HTTP状态码**: 401

**描述**: 提供的JWT Token无效或已过期。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E100",
    "message": "Token无效或过期",
    "details": {
      "reason": "token_expired"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 使用刷新令牌获取新的访问令牌
- 如果刷新令牌也过期，重新登录
- 检查系统时间是否正确

### E101 - Token格式错误

**HTTP状态码**: 401

**描述**: Token格式不正确。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E101",
    "message": "Token格式错误",
    "details": {
      "expectedFormat": "Bearer <token>"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查Authorization头格式
- 确保使用`Bearer`前缀
- 参考API文档了解正确的格式

### E102 - API Key无效

**HTTP状态码**: 401

**描述**: 提供的API Key无效。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E102",
    "message": "API Key无效",
    "details": {
      "apiKey": "yyc3_abc123..."
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查API Key是否正确
- 确认API Key是否已被删除
- 重新生成API Key

### E103 - API Key已过期

**HTTP状态码**: 401

**描述**: 提供的API Key已过期。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E103",
    "message": "API Key已过期",
    "details": {
      "expiredAt": "2026-02-01T12:00:00.000Z"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 重新生成API Key
- 设置更长的过期时间
- 定期轮换API Key

### E104 - 用户名或密码错误

**HTTP状态码**: 401

**描述**: 用户名或密码错误。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E104",
    "message": "用户名或密码错误",
    "details": {
      "remainingAttempts": 4,
      "lockoutTime": null
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查用户名和密码是否正确
- 注意大小写
- 使用密码重置功能重置密码

### E105 - 账户已被锁定

**HTTP状态码**: 401

**描述**: 账户因多次登录失败已被锁定。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E105",
    "message": "账户已被锁定",
    "details": {
      "lockoutTime": "2026-02-03T12:15:00.000Z",
      "remainingTime": 900
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 等待锁定时间结束后重试
- 联系管理员解锁账户
- 使用密码重置功能重置密码

---

## 用户错误

### E200 - 用户不存在

**HTTP状态码**: 404

**描述**: 指定的用户不存在。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E200",
    "message": "用户不存在",
    "details": {
      "userId": "user-123"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查用户ID是否正确
- 确认用户是否已被删除
- 联系管理员确认用户状态

### E201 - 邮箱已存在

**HTTP状态码**: 409

**描述**: 指定的邮箱已被使用。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E201",
    "message": "邮箱已存在",
    "details": {
      "email": "user@example.com"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 使用不同的邮箱注册
- 如果忘记密码，使用密码重置功能
- 联系管理员确认邮箱状态

### E202 - 用户名已存在

**HTTP状态码**: 409

**描述**: 指定的用户名已被使用。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E202",
    "message": "用户名已存在",
    "details": {
      "username": "johndoe"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 使用不同的用户名
- 尝试添加数字或特殊字符
- 联系管理员确认用户名状态

### E203 - 权限不足

**HTTP状态码**: 403

**描述**: 用户没有执行该操作的权限。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E203",
    "message": "权限不足",
    "details": {
      "requiredPermission": "user:delete",
      "userRole": "USER",
      "userPermissions": ["user:read", "user:write"]
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查用户权限是否足够
- 联系管理员申请所需权限
- 使用有权限的账户执行操作

### E204 - 账户已被禁用

**HTTP状态码**: 403

**描述**: 用户账户已被禁用。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E204",
    "message": "账户已被禁用",
    "details": {
      "disabledAt": "2026-02-01T12:00:00.000Z",
      "reason": "violation_of_terms"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 联系管理员了解禁用原因
- 按照要求解决问题
- 申请重新启用账户

---

## AI错误

### E300 - AI服务不可用

**HTTP状态码**: 503

**描述**: AI服务当前不可用。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E300",
    "message": "AI服务不可用",
    "details": {
      "model": "gpt-4",
      "reason": "maintenance",
      "estimatedRecoveryTime": "2026-02-03T12:30:00.000Z"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 等待服务恢复后重试
- 检查系统状态页面
- 使用其他可用的模型

### E301 - AI请求参数错误

**HTTP状态码**: 400

**描述**: AI请求参数错误。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E301",
    "message": "AI请求参数错误",
    "details": {
      "field": "messages",
      "issue": "empty_array",
      "message": "消息数组不能为空"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查请求参数格式
- 确认所有必需参数都已提供
- 参考API文档了解正确的参数格式

### E302 - AI请求过于频繁

**HTTP状态码**: 429

**描述**: AI请求过于频繁，超过了速率限制。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E302",
    "message": "AI请求过于频繁",
    "details": {
      "limit": 10,
      "remaining": 0,
      "reset": "2026-02-03T12:01:00.000Z"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 等待速率限制重置后重试
- 实施客户端速率限制
- 考虑使用批量API减少请求次数

### E303 - AI模型加载失败

**HTTP状态码**: 500

**描述**: AI模型加载失败。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E303",
    "message": "AI模型加载失败",
    "details": {
      "model": "gpt-4",
      "error": "model_not_found"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查模型名称是否正确
- 确认模型是否可用
- 联系技术支持

### E304 - AI推理超时

**HTTP状态码**: 504

**描述**: AI推理超时。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E304",
    "message": "AI推理超时",
    "details": {
      "timeout": 30,
      "model": "gpt-4"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 减少输入长度
- 降低maxTokens参数
- 使用更快的模型

---

## 工作流错误

### E400 - 工作流不存在

**HTTP状态码**: 404

**描述**: 指定的工作流不存在。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E400",
    "message": "工作流不存在",
    "details": {
      "workflowId": "workflow-123"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查工作流ID是否正确
- 确认工作流是否已被删除
- 联系管理员确认工作流状态

### E401 - 工作流执行失败

**HTTP状态码**: 500

**描述**: 工作流执行失败。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E401",
    "message": "工作流执行失败",
    "details": {
      "workflowId": "workflow-123",
      "executionId": "exec-456",
      "step": "ai-inference",
      "error": "model_not_available"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查工作流配置
- 确认所有依赖服务可用
- 查看执行日志了解详细错误

### E402 - 工作流验证失败

**HTTP状态码**: 400

**描述**: 工作流验证失败。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E402",
    "message": "工作流验证失败",
    "details": {
      "errors": [
        {
          "step": "step-1",
          "error": "missing_required_field",
          "field": "model"
        },
        {
          "step": "step-2",
          "error": "invalid_connection",
          "connection": "step-1 -> step-2"
        }
      ]
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查所有验证错误
- 修正工作流配置
- 参考工作流文档了解正确的配置

---

## 数据错误

### E500 - 数据库连接失败

**HTTP状态码**: 500

**描述**: 数据库连接失败。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E500",
    "message": "数据库连接失败",
    "details": {
      "database": "postgres",
      "host": "db.yyc3.com",
      "port": 5432
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 等待几秒后重试
- 检查数据库连接配置
- 联系技术支持

### E501 - 数据库查询失败

**HTTP状态码**: 500

**描述**: 数据库查询失败。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E501",
    "message": "数据库查询失败",
    "details": {
      "query": "SELECT * FROM users WHERE id = ?",
      "error": "relation \"users\" does not exist"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查查询语句是否正确
- 确认表和字段是否存在
- 联系技术支持

### E502 - 数据验证失败

**HTTP状态码**: 400

**描述**: 数据验证失败。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E502",
    "message": "数据验证失败",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "error": "invalid_email_format"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查数据格式是否正确
- 确认数据符合验证规则
- 修正数据后重新提交

---

## 系统错误

### E900 - 系统维护中

**HTTP状态码**: 503

**描述**: 系统正在进行维护。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E900",
    "message": "系统维护中",
    "details": {
      "maintenanceType": "scheduled",
      "estimatedEndTime": "2026-02-03T13:00:00.000Z",
      "message": "系统正在进行计划维护，预计13:00恢复"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 等待维护结束后重试
- 查看维护公告了解详情
- 联系技术支持

### E901 - 系统过载

**HTTP状态码**: 503

**描述**: 系统当前过载，无法处理请求。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E901",
    "message": "系统过载",
    "details": {
      "currentLoad": 95,
      "retryAfter": 60
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 等待几秒后重试
- 实施客户端退避策略
- 联系技术支持

### E902 - 配置错误

**HTTP状态码**: 500

**描述**: 系统配置错误。

**示例响应**:

```json
{
  "success": false,
  "error": {
    "code": "E902",
    "message": "配置错误",
    "details": {
      "configKey": "AI_MODEL_ENDPOINT",
      "configValue": "https://invalid-url.com",
      "error": "invalid_endpoint"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "req-abc123"
}
```

**处理建议**:
- 检查系统配置
- 联系技术支持
- 等待配置修复后重试

---

## 错误处理建议

### 通用处理策略

1. **检查错误代码**: 首先检查`error.code`确定错误类型
2. **查看详细信息**: 查看`error.details`了解具体错误信息
3. **实施重试**: 对于临时性错误实施重试机制
4. **记录日志**: 记录错误详情用于调试和分析
5. **用户反馈**: 向用户提供友好的错误消息

### 重试策略

#### 指数退避

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}
```

#### 错误分类重试

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  retryableErrors: string[];
}

const RETRY_CONFIG: Record<string, RetryConfig> = {
  'E000': { maxRetries: 3, baseDelay: 1000, retryableErrors: ['E000', 'E901'] },
  'E300': { maxRetries: 2, baseDelay: 5000, retryableErrors: ['E300', 'E302'] },
  'E500': { maxRetries: 3, baseDelay: 2000, retryableErrors: ['E500', 'E501'] }
};

async function shouldRetry(error: any, config: RetryConfig): boolean {
  return config.retryableErrors.includes(error.code) &&
         error.attempts < config.maxRetries;
}
```

### 错误监控

```typescript
class ErrorMonitor {
  private errors: Map<string, ErrorStats> = new Map();

  /**
   * 记录错误
   */
  recordError(error: any, context: any) {
    const key = `${error.code}-${context.endpoint}`;
    const stats = this.errors.get(key) || {
      count: 0,
      lastOccurred: null,
      context: []
    };

    stats.count++;
    stats.lastOccurred = new Date();
    stats.context.push(context);

    this.errors.set(key, stats);

    // 发送到监控系统
    this.sendToMonitoring(error, context);
  }

  /**
   * 获取错误统计
   */
  getErrorStats(errorCode: string): ErrorStats | undefined {
    const key = `${errorCode}-*`;
    let total = 0;
    let contexts: any[] = [];

    for (const [k, stats] of this.errors.entries()) {
      if (k.startsWith(errorCode)) {
        total += stats.count;
        contexts = contexts.concat(stats.context);
      }
    }

    return {
      count: total,
      lastOccurred: contexts[contexts.length - 1]?.timestamp,
      contexts
    };
  }

  /**
   * 发送到监控系统
   */
  private sendToMonitoring(error: any, context: any) {
    // 实现发送到监控系统的逻辑
  }
}

interface ErrorStats {
  count: number;
  lastOccurred: Date | null;
  context: any[];
}
```

---

## 下一步

- [API总览](./01-API总览.md) - 学习API概述
- [认证API](./02-认证API.md) - 学习认证相关API
- [AI智能体API](./03-AI智能体API.md) - 学习AI相关API

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
