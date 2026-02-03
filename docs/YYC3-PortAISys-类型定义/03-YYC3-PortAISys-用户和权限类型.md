# YYC³ PortAISys - 用户和权限类型

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 用户和权限类型定义包含所有用户、角色、权限相关的数据类型和接口。

## 概述

用户和权限类型定义提供了 YYC³ PortAISys 系统中用户管理、角色管理、权限控制等相关类型。

---

## 用户类型

### IUser

用户接口。

```typescript
interface IUser extends IBaseEntity {
  /**
   * 用户名
   */
  name: string;

  /**
   * 用户邮箱
   */
  email: Email;

  /**
   * 用户手机号
   */
  phone?: string;

  /**
   * 用户头像
   */
  avatar?: URL;

  /**
   * 用户状态
   */
  status: UserStatus;

  /**
   * 用户角色
   */
  roles: Role[];

  /**
   * 用户权限
   */
  permissions: Permission[];

  /**
   * 用户元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const user: IUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+8613800138000',
  avatar: 'https://cdn.yyc3.com/avatars/user-123.jpg',
  status: UserStatus.ACTIVE,
  roles: [
    { id: 'role-1', name: '管理员' }
  ],
  permissions: [
    { id: 'perm-1', name: 'user:read' }
  ],
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### UserStatus

用户状态枚举。

```typescript
enum UserStatus {
  /**
   * 活跃状态
   */
  ACTIVE = 'active',

  /**
   * 非活跃状态
   */
  INACTIVE = 'inactive',

  /**
   * 已删除状态
   */
  DELETED = 'deleted',

  /**
   * 挂起状态
   */
  SUSPENDED = 'suspended',

  /**
   * 锁定状态
   */
  LOCKED = 'locked',

  /**
   * 待验证状态
   */
  PENDING_VERIFICATION = 'pending_verification'
}

/**
 * 示例
 */
const status: UserStatus = UserStatus.ACTIVE;
```

### ICreateUserRequest

创建用户请求接口。

```typescript
interface ICreateUserRequest {
  /**
   * 用户名
   */
  name: string;

  /**
   * 用户邮箱
   */
  email: Email;

  /**
   * 用户密码
   */
  password: string;

  /**
   * 用户手机号
   */
  phone?: string;

  /**
   * 用户角色 ID 列表
   */
  roleIds?: ID[];

  /**
   * 用户元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const createUserRequest: ICreateUserRequest = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePassword123!',
  phone: '+8613800138000',
  roleIds: ['role-1']
};
```

### IUpdateUserRequest

更新用户请求接口。

```typescript
interface IUpdateUserRequest {
  /**
   * 用户名
   */
  name?: string;

  /**
   * 用户邮箱
   */
  email?: Email;

  /**
   * 用户手机号
   */
  phone?: string;

  /**
   * 用户头像
   */
  avatar?: URL;

  /**
   * 用户状态
   */
  status?: UserStatus;

  /**
   * 用户角色 ID 列表
   */
  roleIds?: ID[];

  /**
   * 用户元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const updateUserRequest: IUpdateUserRequest = {
  name: 'Jane Doe',
  status: UserStatus.ACTIVE
};
```

---

## 角色类型

### IRole

角色接口。

```typescript
interface IRole extends IBaseEntity {
  /**
   * 角色名称
   */
  name: string;

  /**
   * 角色描述
   */
  description?: string;

  /**
   * 角色权限列表
   */
  permissions: Permission[];

  /**
   * 角色元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const role: IRole = {
  id: 'role-1',
  name: '管理员',
  description: '系统管理员角色',
  permissions: [
    { id: 'perm-1', name: 'user:read' },
    { id: 'perm-2', name: 'user:write' }
  ],
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### ICreateRoleRequest

创建角色请求接口。

```typescript
interface ICreateRoleRequest {
  /**
   * 角色名称
   */
  name: string;

  /**
   * 角色描述
   */
  description?: string;

  /**
   * 权限 ID 列表
   */
  permissionIds?: ID[];

  /**
   * 角色元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const createRoleRequest: ICreateRoleRequest = {
  name: '管理员',
  description: '系统管理员角色',
  permissionIds: ['perm-1', 'perm-2']
};
```

---

## 权限类型

### IPermission

权限接口。

```typescript
interface IPermission extends IBaseEntity {
  /**
   * 权限名称
   */
  name: string;

  /**
   * 权限描述
   */
  description?: string;

  /**
   * 权限资源
   */
  resource: string;

  /**
   * 权限操作
   */
  action: string;

  /**
   * 权限条件
   */
  conditions?: Record<string, any>;

  /**
   * 权限元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const permission: IPermission = {
  id: 'perm-1',
  name: 'user:read',
  description: '读取用户信息',
  resource: 'user',
  action: 'read',
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### ICreatePermissionRequest

创建权限请求接口。

```typescript
interface ICreatePermissionRequest {
  /**
   * 权限名称
   */
  name: string;

  /**
   * 权限描述
   */
  description?: string;

  /**
   * 权限资源
   */
  resource: string;

  /**
   * 权限操作
   */
  action: string;

  /**
   * 权限条件
   */
  conditions?: Record<string, any>;

  /**
   * 权限元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const createPermissionRequest: ICreatePermissionRequest = {
  name: 'user:read',
  description: '读取用户信息',
  resource: 'user',
  action: 'read'
};
```

---

## 认证类型

### ILoginRequest

登录请求接口。

```typescript
interface ILoginRequest {
  /**
   * 用户邮箱
   */
  email: Email;

  /**
   * 用户密码
   */
  password: string;

  /**
   * 记住我
   */
  rememberMe?: boolean;

  /**
   * 设备信息
   */
  device?: {
    /**
     * 设备类型
     */
    type: 'desktop' | 'mobile' | 'tablet';

    /**
     * 操作系统
     */
    os?: string;

    /**
     * 浏览器
     */
    browser?: string;
  };
}

/**
 * 示例
 */
const loginRequest: ILoginRequest = {
  email: 'john@example.com',
  password: 'SecurePassword123!',
  rememberMe: true,
  device: {
    type: 'desktop',
    os: 'macOS',
    browser: 'Chrome'
  }
};
```

### ILoginResponse

登录响应接口。

```typescript
interface ILoginResponse {
  /**
   * 访问令牌
   */
  accessToken: string;

  /**
   * 刷新令牌
   */
  refreshToken: string;

  /**
   * 令牌类型
   */
  tokenType: string;

  /**
   * 过期时间（秒）
   */
  expiresIn: number;

  /**
   * 用户信息
   */
  user: IUser;

  /**
   * 会话 ID
   */
  sessionId: ID;

  /**
   * 响应时间戳
   */
  timestamp: Timestamp;
}

/**
 * 示例
 */
const loginResponse: ILoginResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com'
  },
  sessionId: 'session-abc123',
  timestamp: '2026-02-03T10:00:00.000Z'
};
```

### IRefreshTokenRequest

刷新令牌请求接口。

```typescript
interface IRefreshTokenRequest {
  /**
   * 刷新令牌
   */
  refreshToken: string;
}

/**
 * 示例
 */
const refreshTokenRequest: IRefreshTokenRequest = {
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

### IRefreshTokenResponse

刷新令牌响应接口。

```typescript
interface IRefreshTokenResponse {
  /**
   * 新的访问令牌
   */
  accessToken: string;

  /**
   * 新的刷新令牌
   */
  refreshToken: string;

  /**
   * 令牌类型
   */
  tokenType: string;

  /**
   * 过期时间（秒）
   */
  expiresIn: number;

  /**
   * 响应时间戳
   */
  timestamp: Timestamp;
}

/**
 * 示例
 */
const refreshTokenResponse: IRefreshTokenResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  tokenType: 'Bearer',
  expiresIn: 3600,
  timestamp: '2026-02-03T10:00:00.000Z'
};
```

---

## 会话类型

### ISession

会话接口。

```typescript
interface ISession extends IBaseEntity {
  /**
   * 用户 ID
   */
  userId: ID;

  /**
   * 会话令牌
   */
  token: string;

  /**
   * 会话 IP 地址
   */
  ipAddress?: string;

  /**
   * 设备信息
   */
  device?: {
    type: string;
    os?: string;
    browser?: string;
  };

  /**
   * 过期时间
   */
  expiresAt: Timestamp;

  /**
   * 最后活跃时间
   */
  lastActiveAt: Timestamp;

  /**
   * 是否活跃
   */
  isActive: boolean;
}

/**
 * 示例
 */
const session: ISession = {
  id: 'session-abc123',
  userId: 'user-123',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  ipAddress: '192.168.1.1',
  device: {
    type: 'desktop',
    os: 'macOS',
    browser: 'Chrome'
  },
  expiresAt: '2026-02-03T11:00:00.000Z',
  lastActiveAt: '2026-02-03T10:30:00.000Z',
  isActive: true,
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:30:00.000Z'
};
```

---

## 使用示例

### 创建用户

```typescript
import { ICreateUserRequest, UserStatus } from '@yyc3/types';

const createUserRequest: ICreateUserRequest = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePassword123!',
  phone: '+8613800138000',
  roleIds: ['role-1']
};

const user = await userService.createUser(createUserRequest);
```

### 登录

```typescript
import { ILoginRequest } from '@yyc3/types';

const loginRequest: ILoginRequest = {
  email: 'john@example.com',
  password: 'SecurePassword123!',
  rememberMe: true,
  device: {
    type: 'desktop',
    os: 'macOS',
    browser: 'Chrome'
  }
};

const response = await authService.login(loginRequest);
```

### 检查权限

```typescript
import { IUser, Permission } from '@yyc3/types';

function hasPermission(user: IUser, permissionName: string): boolean {
  return user.permissions.some(
    (permission: Permission) => permission.name === permissionName
  );
}

const canReadUser = hasPermission(user, 'user:read');
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
