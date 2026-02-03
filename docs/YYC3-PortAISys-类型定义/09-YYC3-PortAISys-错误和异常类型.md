# YYC³ PortAISys - 错误和异常类型

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 错误和异常类型定义包含所有错误代码和异常相关的数据类型和接口。

## 概述

错误和异常类型定义提供了 YYC³ PortAISys 系统中错误代码、异常处理、错误响应等相关类型。

---

## 错误类型

### IError

错误接口。

```typescript
interface IError {
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

  /**
   * 错误时间戳
   */
  timestamp: Timestamp;

  /**
   * 错误堆栈
   */
  stack?: string;

  /**
   * 错误元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const error: IError = {
  code: 'AUTH_001',
  message: '认证失败：无效的凭据',
  details: {
    field: 'password',
    reason: '密码错误'
  },
  timestamp: '2026-02-03T10:00:00.000Z',
  stack: 'Error: 认证失败\n    at AuthService.login (/src/services/auth.ts:45:12)\n    at ...',
  metadata: {
    userId: 'user-123',
    ip: '192.168.1.1'
  }
};
```

### ErrorCode

错误代码枚举。

```typescript
enum ErrorCode {
  // 认证错误 (AUTH_xxx)
  AUTH_001 = 'AUTH_001',
  AUTH_002 = 'AUTH_002',
  AUTH_003 = 'AUTH_003',
  AUTH_004 = 'AUTH_004',
  AUTH_005 = 'AUTH_005',

  // 授权错误 (AUTHZ_xxx)
  AUTHZ_001 = 'AUTHZ_001',
  AUTHZ_002 = 'AUTHZ_002',
  AUTHZ_003 = 'AUTHZ_003',

  // 验证错误 (VALIDATION_xxx)
  VALIDATION_001 = 'VALIDATION_001',
  VALIDATION_002 = 'VALIDATION_002',
  VALIDATION_003 = 'VALIDATION_003',
  VALIDATION_004 = 'VALIDATION_004',
  VALIDATION_005 = 'VALIDATION_005',

  // 资源错误 (RESOURCE_xxx)
  RESOURCE_001 = 'RESOURCE_001',
  RESOURCE_002 = 'RESOURCE_002',
  RESOURCE_003 = 'RESOURCE_003',
  RESOURCE_004 = 'RESOURCE_004',
  RESOURCE_005 = 'RESOURCE_005',

  // 业务逻辑错误 (BUSINESS_xxx)
  BUSINESS_001 = 'BUSINESS_001',
  BUSINESS_002 = 'BUSINESS_002',
  BUSINESS_003 = 'BUSINESS_003',
  BUSINESS_004 = 'BUSINESS_004',
  BUSINESS_005 = 'BUSINESS_005',

  // 系统错误 (SYSTEM_xxx)
  SYSTEM_001 = 'SYSTEM_001',
  SYSTEM_002 = 'SYSTEM_002',
  SYSTEM_003 = 'SYSTEM_003',
  SYSTEM_004 = 'SYSTEM_004',
  SYSTEM_005 = 'SYSTEM_005',

  // 网络错误 (NETWORK_xxx)
  NETWORK_001 = 'NETWORK_001',
  NETWORK_002 = 'NETWORK_002',
  NETWORK_003 = 'NETWORK_003',
  NETWORK_004 = 'NETWORK_004',
  NETWORK_005 = 'NETWORK_005',

  // 数据库错误 (DATABASE_xxx)
  DATABASE_001 = 'DATABASE_001',
  DATABASE_002 = 'DATABASE_002',
  DATABASE_003 = 'DATABASE_003',
  DATABASE_004 = 'DATABASE_004',
  DATABASE_005 = 'DATABASE_005',

  // 外部服务错误 (EXTERNAL_xxx)
  EXTERNAL_001 = 'EXTERNAL_001',
  EXTERNAL_002 = 'EXTERNAL_002',
  EXTERNAL_003 = 'EXTERNAL_003',
  EXTERNAL_004 = 'EXTERNAL_004',
  EXTERNAL_005 = 'EXTERNAL_005'
}

/**
 * 示例
 */
const errorCode: ErrorCode = ErrorCode.AUTH_001;
```

---

## 错误代码详情

### 认证错误 (AUTH_xxx)

| 错误代码 | 错误消息 | 描述 | HTTP 状态码 |
|---------|---------|------|------------|
| AUTH_001 | 认证失败：无效的凭据 | 用户名或密码错误 | 401 |
| AUTH_002 | 认证失败：令牌已过期 | JWT 令牌已过期 | 401 |
| AUTH_003 | 认证失败：令牌无效 | JWT 令牌格式错误或签名无效 | 401 |
| AUTH_004 | 认证失败：令牌缺失 | 请求头中缺少认证令牌 | 401 |
| AUTH_005 | 认证失败：账户已被锁定 | 用户账户因多次登录失败被锁定 | 401 |

### 授权错误 (AUTHZ_xxx)

| 错误代码 | 错误消息 | 描述 | HTTP 状态码 |
|---------|---------|------|------------|
| AUTHZ_001 | 授权失败：权限不足 | 用户没有执行此操作的权限 | 403 |
| AUTHZ_002 | 授权失败：角色不允许 | 用户角色不允许执行此操作 | 403 |
| AUTHZ_003 | 授权失败：资源访问受限 | 用户没有访问此资源的权限 | 403 |

### 验证错误 (VALIDATION_xxx)

| 错误代码 | 错误消息 | 描述 | HTTP 状态码 |
|---------|---------|------|------------|
| VALIDATION_001 | 验证失败：必填字段缺失 | 请求中缺少必填字段 | 400 |
| VALIDATION_002 | 验证失败：字段格式错误 | 字段格式不符合要求 | 400 |
| VALIDATION_003 | 验证失败：字段值超出范围 | 字段值超出允许的范围 | 400 |
| VALIDATION_004 | 验证失败：字段类型错误 | 字段类型不符合要求 | 400 |
| VALIDATION_005 | 验证失败：字段值重复 | 字段值已存在，不允许重复 | 400 |

### 资源错误 (RESOURCE_xxx)

| 错误代码 | 错误消息 | 描述 | HTTP 状态码 |
|---------|---------|------|------------|
| RESOURCE_001 | 资源不存在 | 请求的资源不存在 | 404 |
| RESOURCE_002 | 资源已被删除 | 请求的资源已被删除 | 404 |
| RESOURCE_003 | 资源冲突 | 资源状态冲突，无法执行操作 | 409 |
| RESOURCE_004 | 资源已存在 | 资源已存在，无法创建 | 409 |
| RESOURCE_005 | 资源被锁定 | 资源被锁定，无法修改 | 423 |

### 业务逻辑错误 (BUSINESS_xxx)

| 错误代码 | 错误消息 | 描述 | HTTP 状态码 |
|---------|---------|------|------------|
| BUSINESS_001 | 业务逻辑错误：操作不允许 | 当前业务状态不允许执行此操作 | 400 |
| BUSINESS_002 | 业务逻辑错误：依赖资源不存在 | 操作依赖的资源不存在 | 400 |
| BUSINESS_003 | 业务逻辑错误：配额已用尽 | 用户配额已用尽 | 400 |
| BUSINESS_004 | 业务逻辑错误：超出限制 | 操作超出业务限制 | 400 |
| BUSINESS_005 | 业务逻辑错误：状态不正确 | 资源状态不正确，无法执行操作 | 400 |

### 系统错误 (SYSTEM_xxx)

| 错误代码 | 错误消息 | 描述 | HTTP 状态码 |
|---------|---------|------|------------|
| SYSTEM_001 | 系统错误：内部服务器错误 | 服务器内部错误 | 500 |
| SYSTEM_002 | 系统错误：服务不可用 | 服务暂时不可用 | 503 |
| SYSTEM_003 | 系统错误：超时 | 请求处理超时 | 504 |
| SYSTEM_004 | 系统错误：内存不足 | 服务器内存不足 | 500 |
| SYSTEM_005 | 系统错误：磁盘空间不足 | 服务器磁盘空间不足 | 500 |

### 网络错误 (NETWORK_xxx)

| 错误代码 | 错误消息 | 描述 | HTTP 状态码 |
|---------|---------|------|------------|
| NETWORK_001 | 网络错误：连接失败 | 无法连接到服务器 | 502 |
| NETWORK_002 | 网络错误：DNS 解析失败 | 无法解析域名 | 502 |
| NETWORK_003 | 网络错误：请求超时 | 请求超时 | 504 |
| NETWORK_004 | 网络错误：连接被拒绝 | 连接被服务器拒绝 | 502 |
| NETWORK_005 | 网络错误：连接中断 | 连接在传输过程中中断 | 502 |

### 数据库错误 (DATABASE_xxx)

| 错误代码 | 错误消息 | 描述 | HTTP 状态码 |
|---------|---------|------|------------|
| DATABASE_001 | 数据库错误：连接失败 | 无法连接到数据库 | 500 |
| DATABASE_002 | 数据库错误：查询失败 | 数据库查询执行失败 | 500 |
| DATABASE_003 | 数据库错误：事务失败 | 数据库事务执行失败 | 500 |
| DATABASE_004 | 数据库错误：约束违反 | 违反数据库约束 | 400 |
| DATABASE_005 | 数据库错误：死锁 | 数据库死锁 | 500 |

### 外部服务错误 (EXTERNAL_xxx)

| 错误代码 | 错误消息 | 描述 | HTTP 状态码 |
|---------|---------|------|------------|
| EXTERNAL_001 | 外部服务错误：API 调用失败 | 调用外部 API 失败 | 502 |
| EXTERNAL_002 | 外部服务错误：服务不可用 | 外部服务不可用 | 503 |
| EXTERNAL_003 | 外部服务错误：认证失败 | 外部服务认证失败 | 401 |
| EXTERNAL_004 | 外部服务错误：超时 | 外部服务请求超时 | 504 |
| EXTERNAL_005 | 外部服务错误：返回错误 | 外部服务返回错误 | 502 |

---

## 错误响应类型

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

    /**
     * 请求 ID
     */
    requestId?: string;

    /**
     * 错误时间戳
     */
    timestamp: Timestamp;
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
    code: 'AUTH_001',
    message: '认证失败：无效的凭据',
    details: {
      field: 'password',
      reason: '密码错误'
    },
    requestId: 'req-abc123',
    timestamp: '2026-02-03T10:00:00.000Z'
  },
  timestamp: '2026-02-03T10:00:00.000Z'
};
```

---

## 异常类型

### IException

异常接口。

```typescript
interface IException extends Error {
  /**
   * 错误代码
   */
  code: string;

  /**
   * 错误类型
   */
  type: ExceptionType;

  /**
   * 错误严重级别
   */
  severity: ExceptionSeverity;

  /**
   * 错误上下文
   */
  context?: Record<string, any>;

  /**
   * 错误时间戳
   */
  timestamp: Timestamp;

  /**
   * 是否可重试
   */
  retryable?: boolean;

  /**
   * 重试延迟（毫秒）
   */
  retryDelay?: number;
}

/**
 * 示例
 */
const exception: IException = {
  name: 'AuthenticationException',
  message: '认证失败：无效的凭据',
  code: 'AUTH_001',
  type: ExceptionType.AUTHENTICATION,
  severity: ExceptionSeverity.HIGH,
  context: {
    userId: 'user-123',
    ip: '192.168.1.1'
  },
  timestamp: '2026-02-03T10:00:00.000Z',
  retryable: false
};
```

### ExceptionType

异常类型枚举。

```typescript
enum ExceptionType {
  /**
   * 认证异常
   */
  AUTHENTICATION = 'authentication',

  /**
   * 授权异常
   */
  AUTHORIZATION = 'authorization',

  /**
   * 验证异常
   */
  VALIDATION = 'validation',

  /**
   * 资源异常
   */
  RESOURCE = 'resource',

  /**
   * 业务逻辑异常
   */
  BUSINESS = 'business',

  /**
   * 系统异常
   */
  SYSTEM = 'system',

  /**
   * 网络异常
   */
  NETWORK = 'network',

  /**
   * 数据库异常
   */
  DATABASE = 'database',

  /**
   * 外部服务异常
   */
  EXTERNAL = 'external',

  /**
   * 未知异常
   */
  UNKNOWN = 'unknown'
}

/**
 * 示例
 */
const exceptionType: ExceptionType = ExceptionType.AUTHENTICATION;
```

### ExceptionSeverity

异常严重级别枚举。

```typescript
enum ExceptionSeverity {
  /**
   * 低级别
   */
  LOW = 'low',

  /**
   * 中级别
   */
  MEDIUM = 'medium',

  /**
   * 高级别
   */
  HIGH = 'high',

  /**
   * 严重级别
   */
  CRITICAL = 'critical'
}

/**
 * 示例
 */
const exceptionSeverity: ExceptionSeverity = ExceptionSeverity.HIGH;
```

---

## 使用示例

### 创建错误响应

```typescript
import { IErrorResponse, ErrorCode } from '@yyc3/types';

const errorResponse: IErrorResponse = {
  success: false,
  error: {
    code: ErrorCode.AUTH_001,
    message: '认证失败：无效的凭据',
    details: {
      field: 'password',
      reason: '密码错误'
    },
    requestId: 'req-abc123',
    timestamp: new Date().toISOString()
  },
  timestamp: new Date().toISOString()
};

return errorResponse;
```

### 抛出异常

```typescript
import { IException, ExceptionType, ExceptionSeverity } from '@yyc3/types';

const exception: IException = {
  name: 'AuthenticationException',
  message: '认证失败：无效的凭据',
  code: 'AUTH_001',
  type: ExceptionType.AUTHENTICATION,
  severity: ExceptionSeverity.HIGH,
  context: {
    userId: 'user-123',
    ip: '192.168.1.1'
  },
  timestamp: new Date().toISOString(),
  retryable: false
};

throw exception;
```

### 捕获并处理异常

```typescript
try {
  await authService.login(email, password);
} catch (error) {
  if (error.code === 'AUTH_001') {
    console.error('认证失败，请检查用户名和密码');
  } else if (error.code === 'AUTH_002') {
    console.error('令牌已过期，请重新登录');
  } else {
    console.error('未知错误:', error.message);
  }
}
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
