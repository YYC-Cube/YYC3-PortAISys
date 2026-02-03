# YYC³ PortAISys - 类型使用指南

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 类型使用指南提供类型定义的使用最佳实践和指导。

## 概述

本指南提供了 YYC³ PortAISys 系统中类型定义的使用最佳实践，包括类型选择、类型定义、类型验证等方面。

---

## 类型定义原则

### 1. 命名规范

#### 接口命名

```typescript
// 使用 PascalCase 和 I 前缀
interface IUser {
  id: string;
  name: string;
}

interface ICreateUserRequest {
  name: string;
  email: string;
}

interface IUserResponse {
  success: true;
  data: IUser;
}
```

#### 类型别名命名

```typescript
// 使用 PascalCase
type ID = string;
type Timestamp = string;
type Email = string;
type URL = string;
```

#### 枚举命名

```typescript
// 使用 PascalCase
enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted'
}
```

### 2. 类型注释

```typescript
/**
 * 用户接口
 * @description 定义用户的基本信息
 */
interface IUser {
  /**
   * 用户 ID
   */
  id: ID;

  /**
   * 用户名
   */
  name: string;

  /**
   * 用户邮箱
   */
  email: Email;
}
```

### 3. 可选属性

```typescript
interface IUser {
  id: ID;
  name: string;
  email: Email;
  
  // 可选属性使用 ?
  avatar?: URL;
  phone?: string;
  metadata?: Record<string, any>;
}
```

### 4. 只读属性

```typescript
interface IUser {
  id: ID;
  name: string;
  email: Email;
  
  // 只读属性使用 readonly
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
```

---

## 类型选择指南

### 1. 基础类型

```typescript
// 字符串类型
const name: string = 'John Doe';

// 数字类型
const age: number = 25;

// 布尔类型
const isActive: boolean = true;

// 数组类型
const tags: string[] = ['user', 'admin'];
const numbers: Array<number> = [1, 2, 3];

// 对象类型
const user: Record<string, any> = { name: 'John Doe', age: 25 };
```

### 2. 联合类型

```typescript
// 联合类型
type Status = 'active' | 'inactive' | 'deleted';

// 使用联合类型
const status: Status = 'active';
```

### 3. 交叉类型

```typescript
interface IUser {
  id: ID;
  name: string;
}

interface IAdmin {
  permissions: string[];
}

// 交叉类型
type IAdminUser = IUser & IAdmin;

const adminUser: IAdminUser = {
  id: 'user-123',
  name: 'John Doe',
  permissions: ['read', 'write', 'delete']
};
```

### 4. 泛型类型

```typescript
// 泛型接口
interface IResponse<T> {
  success: boolean;
  data: T;
}

// 使用泛型
const userResponse: IResponse<IUser> = {
  success: true,
  data: {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com'
  }
};
```

---

## 类型验证

### 1. 类型守卫

```typescript
// 类型守卫函数
function isUser(obj: any): obj is IUser {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

// 使用类型守卫
if (isUser(data)) {
  console.log(data.name);
}
```

### 2. 类型断言

```typescript
// 类型断言
const user = data as IUser;

// 类型断言（更安全）
const user = <IUser>data;
```

### 3. 类型推断

```typescript
// 类型推断
const user = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
};

// TypeScript 会自动推断类型
```

---

## 类型工具

### 1. Partial

```typescript
// 将所有属性变为可选
interface IUser {
  id: ID;
  name: string;
  email: Email;
}

// 使用 Partial
type IPartialUser = Partial<IUser>;

const partialUser: IPartialUser = {
  name: 'John Doe'
};
```

### 2. Required

```typescript
// 将所有属性变为必填
interface IUser {
  id: ID;
  name: string;
  email?: Email;
}

// 使用 Required
type IRequiredUser = Required<IUser>;

const requiredUser: IRequiredUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
};
```

### 3. Readonly

```typescript
// 将所有属性变为只读
interface IUser {
  id: ID;
  name: string;
  email: Email;
}

// 使用 Readonly
type IReadonlyUser = Readonly<IUser>;

const readonlyUser: IReadonlyUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
};

// readonlyUser.name = 'Jane Doe'; // 错误：无法赋值
```

### 4. Pick

```typescript
// 选择特定属性
interface IUser {
  id: ID;
  name: string;
  email: Email;
  phone?: string;
}

// 使用 Pick
type IUserName = Pick<IUser, 'id' | 'name'>;

const userName: IUserName = {
  id: 'user-123',
  name: 'John Doe'
};
```

### 5. Omit

```typescript
// 排除特定属性
interface IUser {
  id: ID;
  name: string;
  email: Email;
  phone?: string;
}

// 使用 Omit
type ICreateUser = Omit<IUser, 'id'>;

const createUser: ICreateUser = {
  name: 'John Doe',
  email: 'john@example.com'
};
```

### 6. Record

```typescript
// 创建键值对类型
type IUserMap = Record<ID, IUser>;

const userMap: IUserMap = {
  'user-123': {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com'
  }
};
```

---

## 最佳实践

### 1. 使用接口而非类型别名

```typescript
// 推荐：使用接口
interface IUser {
  id: ID;
  name: string;
}

// 不推荐：使用类型别名（除非需要联合类型或交叉类型）
type User = {
  id: ID;
  name: string;
};
```

### 2. 使用枚举而非字符串字面量

```typescript
// 推荐：使用枚举
enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted'
}

// 不推荐：使用字符串字面量
type UserStatus = 'active' | 'inactive' | 'deleted';
```

### 3. 使用类型别名定义常用类型

```typescript
// 推荐：定义常用类型别名
type ID = string;
type Timestamp = string;
type Email = string;
type URL = string;

// 使用类型别名
interface IUser {
  id: ID;
  email: Email;
  avatar?: URL;
  createdAt: Timestamp;
}
```

### 4. 使用泛型提高类型复用性

```typescript
// 推荐：使用泛型
interface IResponse<T> {
  success: boolean;
  data: T;
}

// 不推荐：为每种类型定义单独的接口
interface IUserResponse {
  success: boolean;
  data: IUser;
}

interface IModelResponse {
  success: boolean;
  data: IModel;
}
```

### 5. 使用类型守卫进行运行时类型检查

```typescript
// 推荐：使用类型守卫
function isUser(obj: any): obj is IUser {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

if (isUser(data)) {
  console.log(data.name);
}

// 不推荐：使用类型断言
const user = data as IUser;
console.log(user.name);
```

### 6. 使用可选链和空值合并

```typescript
// 推荐：使用可选链和空值合并
const userName = user?.profile?.name ?? 'Unknown';

// 不推荐：使用嵌套的条件判断
const userName = user && user.profile && user.profile.name ? user.profile.name : 'Unknown';
```

---

## 类型定义示例

### 1. 定义用户类型

```typescript
/**
 * 用户接口
 * @description 定义用户的基本信息
 */
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
   * 用户状态
   */
  status: UserStatus;

  /**
   * 用户角色
   */
  roles: Role[];

  /**
   * 用户元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 创建用户请求接口
 */
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
   * 用户角色
   */
  roles?: ID[];
}

/**
 * 更新用户请求接口
 */
interface IUpdateUserRequest extends Partial<ICreateUserRequest> {
  /**
   * 用户 ID
   */
  id: ID;
}

/**
 * 用户响应接口
 */
interface IUserResponse extends ISuccessResponse<IUser> {}

/**
 * 用户列表响应接口
 */
interface IUserListResponse extends ISuccessResponse<{
  /**
   * 用户列表
   */
  users: IUser[];

  /**
   * 总数
   */
  total: number;

  /**
   * 页码
   */
  page: number;

  /**
   * 每页数量
   */
  pageSize: number;
}> {}
```

### 2. 定义 API 类型

```typescript
/**
 * API 请求接口
 */
interface IApiRequest<T = any> {
  /**
   * 请求路径
   */
  path: string;

  /**
   * 请求方法
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  /**
   * 请求参数
   */
  params?: T;

  /**
   * 请求头
   */
  headers?: Record<string, string>;

  /**
   * 请求超时（毫秒）
   */
  timeout?: number;
}

/**
 * API 响应接口
 */
interface IApiResponse<T = any> {
  /**
   * 响应状态码
   */
  statusCode: number;

  /**
   * 响应数据
   */
  data: T;

  /**
   * 响应头
   */
  headers: Record<string, string>;

  /**
   * 响应时间（毫秒）
   */
  duration: number;
}
```

---

## 类型测试

### 1. 类型测试示例

```typescript
// 测试类型
type Test = Expect<Equal<IUser['id'], string>>;

// 测试类型
type Test2 = Expect<Equal<IUser['email'], string>>;

// 测试类型
type Test3 = Expect<Equal<IUser['avatar'], string | undefined>>;
```

### 2. 类型断言

```typescript
// 类型断言
function assertIsUser(obj: any): asserts obj is IUser {
  if (!obj || typeof obj.id !== 'string' || typeof obj.name !== 'string') {
    throw new Error('Invalid user object');
  }
}

// 使用类型断言
assertIsUser(data);
console.log(data.name);
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
