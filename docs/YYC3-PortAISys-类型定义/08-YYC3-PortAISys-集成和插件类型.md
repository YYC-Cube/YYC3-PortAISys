# YYC³ PortAISys - 集成和插件类型

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 集成和插件类型定义包含所有第三方集成和插件相关的数据类型和接口。

## 概述

集成和插件类型定义提供了 YYC³ PortAISys 系统中第三方集成、插件管理、Webhook 等相关类型。

---

## 集成类型

### IIntegration

集成接口。

```typescript
interface IIntegration extends INamedEntity {
  /**
   * 集成类型
   */
  type: IntegrationType;

  /**
   * 服务提供商
   */
  provider: string;

  /**
   * 集成状态
   */
  status: IntegrationStatus;

  /**
   * 集成配置
   */
  config?: Record<string, any>;

  /**
   * 认证配置
   */
  auth?: {
    /**
     * 认证类型
     */
    type: 'api-key' | 'oauth2' | 'jwt';

    /**
     * 认证配置
     */
    credentials?: Record<string, any>;
  };

  /**
   * 集成选项
   */
  options?: {
    /**
     * 是否自动同步
     */
    autoSync?: boolean;

    /**
     * 同步间隔（秒）
     */
    syncInterval?: number;

    /**
     * 是否启用加密
     */
    enableEncryption?: boolean;

    /**
     * 加密算法
     */
    encryptionAlgorithm?: 'AES256' | 'AES128';
  };

  /**
   * 集成统计
   */
  stats?: {
    /**
     * 总请求数
     */
    totalRequests?: number;

    /**
     * 成功请求数
     */
    successfulRequests?: number;

    /**
     * 失败请求数
     */
    failedRequests?: number;

    /**
     * 成功率
     */
    successRate?: number;

    /**
     * 最后同步时间
     */
    lastSyncAt?: Timestamp;
  };
}

/**
 * 示例
 */
const integration: IIntegration = {
  id: 'integration-123',
  name: 'AWS S3 集成',
  description: '用于文件存储和备份',
  type: IntegrationType.STORAGE,
  provider: 'aws-s3',
  status: IntegrationStatus.ACTIVE,
  config: {
    region: 'us-east-1',
    bucket: 'yyc3-backup-bucket'
  },
  auth: {
    type: 'api-key',
    credentials: {
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    }
  },
  options: {
    autoSync: true,
    syncInterval: 3600,
    enableEncryption: true,
    encryptionAlgorithm: 'AES256'
  },
  stats: {
    totalRequests: 1250,
    successfulRequests: 1240,
    failedRequests: 10,
    successRate: 0.992,
    lastSyncAt: '2026-02-03T09:00:00.000Z'
  },
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### IntegrationType

集成类型枚举。

```typescript
enum IntegrationType {
  /**
   * 存储集成
   */
  STORAGE = 'storage',

  /**
   * 数据库集成
   */
  DATABASE = 'database',

  /**
   * 消息队列集成
   */
  MESSAGE_QUEUE = 'message-queue',

  /**
   * 监控系统集成
   */
  MONITORING = 'monitoring',

  /**
   * 身份认证集成
   */
  AUTHENTICATION = 'authentication',

  /**
   * 通知服务集成
   */
  NOTIFICATION = 'notification',

  /**
   * AI 服务集成
   */
  AI_SERVICE = 'ai-service',

  /**
   * CI/CD 集成
   */
  CI_CD = 'ci-cd',

  /**
   * 自定义集成
   */
  CUSTOM = 'custom'
}

/**
 * 示例
 */
const integrationType: IntegrationType = IntegrationType.STORAGE;
```

### IntegrationStatus

集成状态枚举。

```typescript
enum IntegrationStatus {
  /**
   * 活跃状态
   */
  ACTIVE = 'active',

  /**
   * 非活跃状态
   */
  INACTIVE = 'inactive',

  /**
   * 配置中
   */
  CONFIGURING = 'configuring',

  /**
   * 同步中
   */
  SYNCING = 'syncing',

  /**
   * 错误状态
   */
  ERROR = 'error',

  /**
   * 已删除
   */
  DELETED = 'deleted'
}

/**
 * 示例
 */
const integrationStatus: IntegrationStatus = IntegrationStatus.ACTIVE;
```

---

## Webhook 类型

### IWebhook

Webhook 接口。

```typescript
interface IWebhook extends INamedEntity {
  /**
   * Webhook URL
   */
  url: URL;

  /**
   * 订阅事件列表
   */
  events: string[];

  /**
   * Webhook 密钥
   */
  secret: string;

  /**
   * Webhook 状态
   */
  active: boolean;

  /**
   * 重试配置
   */
  retryConfig?: {
    /**
     * 最大重试次数
     */
    maxRetries?: number;

    /**
     * 初始重试延迟（毫秒）
     */
    retryDelay?: number;

    /**
     * 退避乘数
     */
    backoffMultiplier?: number;
  };

  /**
   * 超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 自定义请求头
   */
  headers?: Record<string, string>;

  /**
   * Webhook 统计
   */
  stats?: {
    /**
     * 总交付次数
     */
    totalDelivered?: number;

    /**
     * 总失败次数
     */
    totalFailed?: number;

    /**
     * 成功率
     */
    successRate?: number;
  };
}

/**
 * 示例
 */
const webhook: IWebhook = {
  id: 'webhook-123',
  name: 'AI 对话完成通知',
  description: '当 AI 对话完成时发送通知',
  url: 'https://your-app.com/webhooks/yyc3',
  events: ['ai.chat.completed', 'ai.chat.error'],
  secret: 'your-webhook-secret',
  active: true,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  },
  timeout: 10000,
  headers: {
    'X-Custom-Header': 'custom-value'
  },
  stats: {
    totalDelivered: 1250,
    totalFailed: 5,
    successRate: 0.996
  },
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### IWebhookEvent

Webhook 事件接口。

```typescript
interface IWebhookEvent extends IBaseEntity {
  /**
   * 事件 ID
   */
  eventId: ID;

  /**
   * 事件名称
   */
  eventName: string;

  /**
   * 事件来源
   */
  source: string;

  /**
   * 事件数据
   */
  data: any;

  /**
   * 事件时间戳
   */
  timestamp: Timestamp;

  /**
   * 事件元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const webhookEvent: IWebhookEvent = {
  id: 'evt-abc123',
  eventId: 'evt-def456',
  eventName: 'ai.chat.completed',
  source: 'yyc3-ai-service',
  data: {
    chatId: 'chat-xyz789',
    userId: 'user-123',
    model: 'gpt-4',
    message: {
      role: 'assistant',
      content: '这是 AI 的回复内容...'
    }
  },
  timestamp: '2026-02-03T10:00:00.000Z',
  metadata: {
    region: 'us-east-1'
  },
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

---

## 插件类型

### IPlugin

插件接口。

```typescript
interface IPlugin extends INamedEntity {
  /**
   * 插件类型
   */
  type: PluginType;

  /**
   * 插件版本
   */
  version: string;

  /**
   * 插件作者
   */
  author: string;

  /**
   * 插件许可证
   */
  license?: string;

  /**
   * 插件主页
   */
  homepage?: URL;

  /**
   * 插件仓库
   */
  repository?: URL;

  /**
   * 插件状态
   */
  status: PluginStatus;

  /**
   * 插件能力列表
   */
  capabilities: string[];

  /**
   * 插件依赖
   */
  dependencies?: Record<string, string>;

  /**
   * 插件权限列表
   */
  permissions: string[];

  /**
   * 插件配置
   */
  config?: Record<string, any>;

  /**
   * 插件配置模式
   */
  configSchema?: {
    /**
     * 类型
     */
    type: 'object';

    /**
     * 属性
     */
    properties?: Record<string, {
      /**
       * 属性类型
       */
      type: string;

      /**
       * 属性描述
       */
      description?: string;

      /**
       * 枚举值
       */
      enum?: string[];
    }>;

    /**
     * 必填属性
     */
    required?: string[];
  };

  /**
   * 插件元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const plugin: IPlugin = {
  id: 'plugin-123',
  name: '自定义模型插件',
  description: '集成自定义 AI 模型',
  type: PluginType.AI_MODEL,
  version: '1.0.0',
  author: 'YYC³',
  license: 'MIT',
  homepage: 'https://github.com/yyc3/custom-model-plugin',
  repository: 'https://github.com/yyc3/custom-model-plugin.git',
  status: PluginStatus.ENABLED,
  capabilities: ['model.inference', 'model.training'],
  dependencies: {
    'yyc3-core': '>=1.0.0'
  },
  permissions: ['model:read', 'model:write'],
  config: {
    apiKey: 'your-api-key',
    endpoint: 'https://api.example.com'
  },
  configSchema: {
    type: 'object',
    properties: {
      apiKey: {
        type: 'string',
        description: 'API 密钥'
      },
      endpoint: {
        type: 'string',
        description: 'API 端点'
      }
    },
    required: ['apiKey', 'endpoint']
  },
  metadata: {
    category: 'ai',
    language: 'typescript'
  },
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### PluginType

插件类型枚举。

```typescript
enum PluginType {
  /**
   * AI 模型插件
   */
  AI_MODEL = 'ai-model',

  /**
   * 数据源插件
   */
  DATA_SOURCE = 'data-source',

  /**
   * 存储插件
   */
  STORAGE = 'storage',

  /**
   * 通知插件
   */
  NOTIFICATION = 'notification',

  /**
   * 认证插件
   */
  AUTHENTICATION = 'authentication',

  /**
   * 工作流插件
   */
  WORKFLOW = 'workflow',

  /**
   * UI 组件插件
   */
  UI_COMPONENT = 'ui-component',

  /**
   * 分析插件
   */
  ANALYTICS = 'analytics',

  /**
   * 自定义插件
   */
  CUSTOM = 'custom'
}

/**
 * 示例
 */
const pluginType: PluginType = PluginType.AI_MODEL;
```

### PluginStatus

插件状态枚举。

```typescript
enum PluginStatus {
  /**
   * 已安装
   */
  INSTALLED = 'installed',

  /**
   * 已启用
   */
  ENABLED = 'enabled',

  /**
   * 已禁用
   */
  DISABLED = 'disabled',

  /**
   * 已卸载
   */
  UNINSTALLED = 'uninstalled',

  /**
   * 错误状态
   */
  ERROR = 'error',

  /**
   * 更新中
   */
  UPDATING = 'updating'
}

/**
 * 示例
 */
const pluginStatus: PluginStatus = PluginStatus.ENABLED;
```

---

## OAuth 类型

### IOAuthConfig

OAuth 配置接口。

```typescript
interface IOAuthConfig {
  /**
   * OAuth 提供商
   */
  provider: OAuthProvider;

  /**
   * 客户端 ID
   */
  clientId: string;

  /**
   * 客户端密钥
   */
  clientSecret: string;

  /**
   * 重定向 URI
   */
  redirectUri: URL;

  /**
   * 授权范围
   */
  scopes?: string[];

  /**
   * 授权 URL
   */
  authorizationUrl?: URL;

  /**
   * 令牌 URL
   */
  tokenUrl?: URL;

  /**
   * 刷新令牌 URL
   */
  refreshTokenUrl?: URL;
}

/**
 * 示例
 */
const oauthConfig: IOAuthConfig = {
  provider: OAuthProvider.GITHUB,
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://your-app.com/callback',
  scopes: ['repo', 'user'],
  authorizationUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  refreshTokenUrl: 'https://github.com/login/oauth/access_token'
};
```

### OAuthProvider

OAuth 提供商枚举。

```typescript
enum OAuthProvider {
  /**
   * GitHub
   */
  GITHUB = 'github',

  /**
   * GitLab
   */
  GITLAB = 'gitlab',

  /**
   * Google
   */
  GOOGLE = 'google',

  /**
   * Microsoft
   */
  MICROSOFT = 'microsoft',

  /**
   * Salesforce
   */
  SALESFORCE = 'salesforce',

  /**
   * 自定义
   */
  CUSTOM = 'custom'
}

/**
 * 示例
 */
const oauthProvider: OAuthProvider = OAuthProvider.GITHUB;
```

### IOAuthToken

OAuth 令牌接口。

```typescript
interface IOAuthToken {
  /**
   * 访问令牌
   */
  accessToken: string;

  /**
   * 刷新令牌
   */
  refreshToken?: string;

  /**
   * 令牌类型
   */
  tokenType: string;

  /**
   * 过期时间（秒）
   */
  expiresIn: number;

  /**
   * 授权范围
   */
  scope?: string[];

  /**
   * 令牌时间戳
   */
  timestamp: Timestamp;
}

/**
 * 示例
 */
const oauthToken: IOAuthToken = {
  accessToken: 'gho_xxxxxxxxxxxx',
  refreshToken: 'ghr_xxxxxxxxxxxx',
  tokenType: 'Bearer',
  expiresIn: 3600,
  scope: ['repo', 'user'],
  timestamp: '2026-02-03T10:00:00.000Z'
};
```

---

## 使用示例

### 创建集成

```typescript
import { IIntegration, IntegrationType } from '@yyc3/types';

const integration: IIntegration = {
  name: 'AWS S3 集成',
  description: '用于文件存储和备份',
  type: IntegrationType.STORAGE,
  provider: 'aws-s3',
  config: {
    region: 'us-east-1',
    bucket: 'yyc3-backup-bucket'
  },
  auth: {
    type: 'api-key',
    credentials: {
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    }
  },
  options: {
    autoSync: true,
    syncInterval: 3600
  }
};

const result = await integrationService.create(integration);
```

### 创建 Webhook

```typescript
import { IWebhook } from '@yyc3/types';

const webhook: IWebhook = {
  name: 'AI 对话完成通知',
  description: '当 AI 对话完成时发送通知',
  url: 'https://your-app.com/webhooks/yyc3',
  events: ['ai.chat.completed', 'ai.chat.error'],
  secret: 'your-webhook-secret',
  active: true,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  }
};

const result = await webhookService.create(webhook);
```

### 安装插件

```typescript
import { IPlugin, PluginType } from '@yyc3/types';

const plugin: IPlugin = {
  name: '自定义模型插件',
  description: '集成自定义 AI 模型',
  type: PluginType.AI_MODEL,
  version: '1.0.0',
  author: 'YYC³',
  capabilities: ['model.inference', 'model.training'],
  dependencies: {
    'yyc3-core': '>=1.0.0'
  },
  permissions: ['model:read', 'model:write'],
  config: {
    apiKey: 'your-api-key',
    endpoint: 'https://api.example.com'
  }
};

const result = await pluginService.install(plugin);
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
