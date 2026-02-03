# 插件 API 文档

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 插件 API 提供强大的扩展能力，允许开发者创建自定义插件来扩展系统功能。

## 概述

插件 API 提供了一套完整的插件开发框架，支持插件的生命周期管理、配置、权限控制和与其他插件的交互。

### 核心特性

- **插件生命周期管理**：安装、启用、禁用、卸载
- **事件系统**：插件间事件通信
- **依赖管理**：插件依赖关系管理
- **权限控制**：细粒度的插件权限控制
- **配置管理**：插件配置和参数管理
- **热加载**：无需重启系统即可加载/卸载插件
- **沙箱隔离**：插件运行在隔离环境中

### 插件类型

| 类型 | 描述 | 示例 |
|-----|------|------|
| AI Model | AI 模型插件 | 自定义模型集成 |
| Data Source | 数据源插件 | 数据库连接器 |
| Storage | 存储插件 | 云存储集成 |
| Notification | 通知插件 | 邮件、短信通知 |
| Authentication | 认证插件 | OAuth、LDAP |
| Workflow | 工作流插件 | 自定义工作流节点 |
| UI Component | UI 组件插件 | 自定义界面组件 |
| Analytics | 分析插件 | 数据分析工具 |

---

## 插件管理

### 安装插件

安装新的插件。

**请求**

- **方法**: `POST`
- **路径**: `/v1/plugins/install`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:install`

**请求体**

```json
{
  "pluginId": "yyc3-plugin-custom-model",
  "version": "1.0.0",
  "source": {
    "type": "registry",
    "url": "https://registry.yyc3.com/plugins/yyc3-plugin-custom-model-1.0.0.tgz"
  },
  "config": {
    "apiKey": "your-api-key",
    "endpoint": "https://api.example.com"
  },
  "options": {
    "autoEnable": true,
    "overwrite": false
  }
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |
| version | string | 是 | 插件版本 |
| source | object | 是 | 插件来源 |
| source.type | string | 是 | 来源类型 (registry/git/file/url) |
| source.url | string | 否 | 插件 URL |
| config | object | 否 | 插件配置 |
| options | object | 否 | 安装选项 |
| options.autoEnable | boolean | 否 | 安装后自动启用，默认 false |
| options.overwrite | boolean | 否 | 覆盖已安装的插件，默认 false |

**响应**

- **成功 (201)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "version": "1.0.0",
    "status": "installed",
    "enabled": true,
    "installedAt": "2026-02-03T10:00:00.000Z",
    "config": {
      "apiKey": "your-api-key",
      "endpoint": "https://api.example.com"
    }
  }
}
```

- **错误 (400)**

```json
{
  "success": false,
  "error": {
    "code": "PLUGIN_ALREADY_INSTALLED",
    "message": "插件已安装",
    "details": {
      "pluginId": "yyc3-plugin-custom-model",
      "version": "1.0.0"
    }
  }
}
```

### 获取插件列表

获取所有已安装的插件。

**请求**

- **方法**: `GET`
- **路径**: `/v1/plugins`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:read`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| type | string | 否 | 按插件类型过滤 |
| status | string | 否 | 按状态过滤 (enabled/disabled) |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "plugins": [
      {
        "pluginId": "yyc3-plugin-custom-model",
        "name": "自定义模型插件",
        "version": "1.0.0",
        "type": "AI Model",
        "description": "集成自定义 AI 模型",
        "author": "YYC³",
        "status": "enabled",
        "enabled": true,
        "installedAt": "2026-02-03T10:00:00.000Z",
        "updatedAt": "2026-02-03T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 获取插件详情

获取指定插件的详细信息。

**请求**

- **方法**: `GET`
- **路径**: `/v1/plugins/{pluginId}`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:read`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "name": "自定义模型插件",
    "version": "1.0.0",
    "type": "AI Model",
    "description": "集成自定义 AI 模型",
    "author": "YYC³",
    "license": "MIT",
    "homepage": "https://github.com/yyc3/custom-model-plugin",
    "repository": "https://github.com/yyc3/custom-model-plugin.git",
    "status": "enabled",
    "enabled": true,
    "config": {
      "apiKey": "your-api-key",
      "endpoint": "https://api.example.com"
    },
    "capabilities": [
      "model.inference",
      "model.training"
    ],
    "dependencies": {
      "yyc3-core": ">=1.0.0"
    },
    "permissions": [
      "model:read",
      "model:write"
    ],
    "installedAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

### 启用插件

启用已安装的插件。

**请求**

- **方法**: `POST`
- **路径**: `/v1/plugins/{pluginId}/enable`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:manage`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "status": "enabled",
    "enabled": true,
    "enabledAt": "2026-02-03T11:00:00.000Z"
  }
}
```

### 禁用插件

禁用已启用的插件。

**请求**

- **方法**: `POST`
- **路径**: `/v1/plugins/{pluginId}/disable`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:manage`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "status": "disabled",
    "enabled": false,
    "disabledAt": "2026-02-03T12:00:00.000Z"
  }
}
```

### 卸载插件

卸载已安装的插件。

**请求**

- **方法**: `DELETE`
- **路径**: `/v1/plugins/{pluginId}`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:manage`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| keepConfig | boolean | 否 | 保留配置，默认 false |

**响应**

- **成功 (204)**

无响应体

---

## 插件配置

### 更新插件配置

更新插件的配置。

**请求**

- **方法**: `PATCH`
- **路径**: `/v1/plugins/{pluginId}/config`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:manage`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**请求体**

```json
{
  "config": {
    "apiKey": "new-api-key",
    "endpoint": "https://api.example.com/v2",
    "timeout": 30000
  }
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "config": {
      "apiKey": "new-api-key",
      "endpoint": "https://api.example.com/v2",
      "timeout": 30000
    },
    "updatedAt": "2026-02-03T13:00:00.000Z"
  }
}
```

### 获取插件配置

获取插件的当前配置。

**请求**

- **方法**: `GET`
- **路径**: `/v1/plugins/{pluginId}/config`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:read`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "config": {
      "apiKey": "new-api-key",
      "endpoint": "https://api.example.com/v2",
      "timeout": 30000
    }
  }
}
```

### 重置插件配置

重置插件配置为默认值。

**请求**

- **方法**: `POST`
- **路径**: `/v1/plugins/{pluginId}/config/reset`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:manage`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "config": {
      "apiKey": "",
      "endpoint": "https://api.example.com",
      "timeout": 10000
    },
    "resetAt": "2026-02-03T14:00:00.000Z"
  }
}
```

---

## 插件事件

### 发布事件

向插件系统发布事件。

**请求**

- **方法**: `POST`
- **路径**: `/v1/plugins/events`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:event:publish`

**请求体**

```json
{
  "eventName": "model.inference.completed",
  "source": "yyc3-plugin-custom-model",
  "data": {
    "modelId": "model-abc123",
    "inferenceId": "infer-xyz789",
    "result": {
      "prediction": "positive",
      "confidence": 0.95
    },
    "latency": 1250
  },
  "timestamp": "2026-02-03T10:00:00.000Z"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| eventName | string | 是 | 事件名称 |
| source | string | 是 | 事件来源 |
| data | object | 是 | 事件数据 |
| timestamp | string | 否 | 事件时间戳 |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "eventId": "evt-abc123",
    "eventName": "model.inference.completed",
    "deliveredTo": [
      "yyc3-plugin-analytics",
      "yyc3-plugin-logging"
    ],
    "deliveredAt": "2026-02-03T10:00:00.000Z"
  }
}
```

### 订阅事件

订阅插件事件。

**请求**

- **方法**: `POST`
- **路径**: `/v1/plugins/{pluginId}/subscriptions`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:event:subscribe`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**请求体**

```json
{
  "eventName": "model.inference.completed",
  "handler": "handleInferenceCompleted",
  "filter": {
    "modelId": "model-abc123"
  },
  "options": {
    "async": true,
    "priority": "high"
  }
}
```

**响应**

- **成功 (201)**

```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub-abc123",
    "pluginId": "yyc3-plugin-analytics",
    "eventName": "model.inference.completed",
    "handler": "handleInferenceCompleted",
    "filter": {
      "modelId": "model-abc123"
    },
    "options": {
      "async": true,
      "priority": "high"
    },
    "createdAt": "2026-02-03T10:00:00.000Z"
  }
}
```

### 取消订阅

取消事件订阅。

**请求**

- **方法**: `DELETE`
- **路径**: `/v1/plugins/{pluginId}/subscriptions/{subscriptionId}`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:event:subscribe`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |
| subscriptionId | string | 是 | 订阅 ID |

**响应**

- **成功 (204)**

无响应体

---

## 插件权限

### 授予权限

授予插件权限。

**请求**

- **方法**: `POST`
- **路径**: `/v1/plugins/{pluginId}/permissions`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:permission:manage`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**请求体**

```json
{
  "permissions": [
    "model:read",
    "model:write",
    "data:read"
  ]
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "permissions": [
      "model:read",
      "model:write",
      "data:read"
    ],
    "grantedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

### 撤销权限

撤销插件权限。

**请求**

- **方法**: `DELETE`
- **路径**: `/v1/plugins/{pluginId}/permissions`
- **认证**: Bearer Token (API Key)
- **权限**: `plugin:permission:manage`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**请求体**

```json
{
  "permissions": [
    "model:write"
  ]
}
```

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "permissions": [
      "model:read",
      "data:read"
    ],
    "revokedAt": "2026-02-03T11:00:00.000Z"
  }
}
```

---

## 插件开发

### 插件清单

插件必须包含 `plugin.json` 清单文件。

```json
{
  "name": "yyc3-plugin-custom-model",
  "version": "1.0.0",
  "displayName": "自定义模型插件",
  "description": "集成自定义 AI 模型",
  "type": "AI Model",
  "author": "YYC³",
  "license": "MIT",
  "homepage": "https://github.com/yyc3/custom-model-plugin",
  "repository": "https://github.com/yyc3/custom-model-plugin.git",
  "main": "dist/index.js",
  "entry": "src/index.ts",
  "capabilities": [
    "model.inference",
    "model.training"
  ],
  "dependencies": {
    "yyc3-core": ">=1.0.0"
  },
  "permissions": [
    "model:read",
    "model:write"
  ],
  "configSchema": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "description": "API 密钥"
      },
      "endpoint": {
        "type": "string",
        "description": "API 端点"
      }
    },
    "required": ["apiKey", "endpoint"]
  }
}
```

### 插件入口

插件主入口文件示例。

```typescript
import { Plugin, PluginContext } from '@yyc3/plugin-sdk';

export default class CustomModelPlugin implements Plugin {
  private context: PluginContext;
  private config: any;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.config = context.config;
    
    // 订阅事件
    context.events.on('model.inference.request', this.handleInferenceRequest.bind(this));
    
    // 注册能力
    context.capabilities.register('model.inference', this.inference.bind(this));
  }

  async activate(): Promise<void> {
    this.context.logger.info('Custom Model Plugin activated');
  }

  async deactivate(): Promise<void> {
    this.context.logger.info('Custom Model Plugin deactivated');
  }

  private async handleInferenceRequest(data: any): Promise<void> {
    const result = await this.inference(data);
    this.context.events.emit('model.inference.completed', result);
  }

  private async inference(data: any): Promise<any> {
    // 实现推理逻辑
    return {
      prediction: 'positive',
      confidence: 0.95
    };
  }
}
```

### 插件 SDK

使用插件 SDK 开发插件。

```typescript
import { Plugin, PluginContext, PluginSDK } from '@yyc3/plugin-sdk';

const sdk = new PluginSDK({
  pluginId: 'yyc3-plugin-custom-model',
  version: '1.0.0'
});

// 注册插件
sdk.registerPlugin(CustomModelPlugin);

// 导出
export default sdk;
```

---

## 插件市场

### 搜索插件

搜索可用的插件。

**请求**

- **方法**: `GET`
- **路径**: `/v1/plugins/marketplace/search`
- **认证**: Bearer Token (API Key)

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| query | string | 否 | 搜索关键词 |
| type | string | 否 | 按类型过滤 |
| category | string | 否 | 按分类过滤 |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "plugins": [
      {
        "pluginId": "yyc3-plugin-custom-model",
        "name": "自定义模型插件",
        "version": "1.0.0",
        "type": "AI Model",
        "description": "集成自定义 AI 模型",
        "author": "YYC³",
        "rating": 4.5,
        "downloads": 1250,
        "tags": ["ai", "model", "custom"]
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 获取插件详情

获取市场插件的详细信息。

**请求**

- **方法**: `GET`
- **路径**: `/v1/plugins/marketplace/{pluginId}`
- **认证**: Bearer Token (API Key)

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| pluginId | string | 是 | 插件 ID |

**响应**

- **成功 (200)**

```json
{
  "success": true,
  "data": {
    "pluginId": "yyc3-plugin-custom-model",
    "name": "自定义模型插件",
    "version": "1.0.0",
    "type": "AI Model",
    "description": "集成自定义 AI 模型",
    "author": "YYC³",
    "license": "MIT",
    "homepage": "https://github.com/yyc3/custom-model-plugin",
    "repository": "https://github.com/yyc3/custom-model-plugin.git",
    "rating": 4.5,
    "downloads": 1250,
    "tags": ["ai", "model", "custom"],
    "screenshots": [
      "https://example.com/screenshot1.png"
    ],
    "changelog": [
      {
        "version": "1.0.0",
        "date": "2026-02-03",
        "changes": [
          "初始版本发布"
        ]
      }
    ],
    "compatibility": {
      "minCoreVersion": "1.0.0",
      "maxCoreVersion": "2.0.0"
    }
  }
}
```

---

## 最佳实践

### 1. 错误处理

妥善处理插件中的错误。

```typescript
async inference(data: any): Promise<any> {
  try {
    // 实现推理逻辑
    const result = await this.callAPI(data);
    return result;
  } catch (error) {
    this.context.logger.error('Inference failed:', error);
    throw new Error('Inference failed');
  }
}
```

### 2. 资源管理

正确管理插件资源。

```typescript
async activate(): Promise<void> {
  // 初始化资源
  this.connection = await this.createConnection();
}

async deactivate(): Promise<void> {
  // 清理资源
  if (this.connection) {
    await this.connection.close();
  }
}
```

### 3. 事件处理

高效处理事件。

```typescript
async handleInferenceRequest(data: any): Promise<void> {
  // 验证数据
  if (!this.validateData(data)) {
    throw new Error('Invalid data');
  }
  
  // 异步处理
  setImmediate(async () => {
    try {
      const result = await this.inference(data);
      this.context.events.emit('model.inference.completed', result);
    } catch (error) {
      this.context.events.emit('model.inference.failed', { error });
    }
  });
}
```

### 4. 配置验证

验证插件配置。

```typescript
async initialize(context: PluginContext): Promise<void> {
  this.context = context;
  this.config = context.config;
  
  // 验证配置
  if (!this.config.apiKey) {
    throw new Error('API key is required');
  }
}
```

---

## 常见问题

### Q: 如何调试插件？

A: 使用插件 SDK 的调试工具和日志功能。

### Q: 插件可以访问系统资源吗？

A: 插件只能访问被授权的资源，遵循最小权限原则。

### Q: 如何更新插件？

A: 卸载旧版本并安装新版本，或使用更新 API。

### Q: 插件之间如何通信？

A: 使用插件事件系统进行通信。

### Q: 如何发布插件到市场？

A: 联系 YYC³ 团队进行插件审核和发布。

---

## 支持与反馈

如有问题或建议，请联系：

- **邮箱**: plugins@yyc3.com
- **文档**: https://docs.yyc3.com/plugins
- **GitHub**: https://github.com/yyc3/plugin-sdk

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
