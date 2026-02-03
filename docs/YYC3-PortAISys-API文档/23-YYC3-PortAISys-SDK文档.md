# SDK 文档

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys SDK 提供了多种编程语言的官方软件开发工具包，简化与 API 的集成过程。

## 概述

YYC³ PortAISys SDK 提供了完整的客户端库，支持多种编程语言和平台，帮助开发者快速集成 YYC³ PortAISys 的各项功能。

### 支持的语言和平台

| 语言/平台 | SDK 名称 | 版本 | 状态 |
|-----------|---------|------|------|
| JavaScript/TypeScript | @yyc3/sdk | 1.0.0 | ✅ 稳定 |
| Python | yyc3-python-sdk | 1.0.0 | ✅ 稳定 |
| Java | yyc3-java-sdk | 1.0.0 | ✅ 稳定 |
| Go | yyc3-go-sdk | 1.0.0 | ✅ 稳定 |
| PHP | yyc3-php-sdk | 0.9.0 | 🚧 Beta |
| Ruby | yyc3-ruby-sdk | 0.9.0 | 🚧 Beta |
| .NET | Yyc3.Sdk | 0.9.0 | 🚧 Beta |
| Swift | Yyc3Sdk | 0.8.0 | 🧪 Alpha |
| Kotlin | yyc3-kotlin-sdk | 0.8.0 | 🧪 Alpha |

### 核心特性

- **类型安全**：完整的类型定义和智能提示
- **异步支持**：原生异步/await 支持
- **错误处理**：统一的错误处理机制
- **重试机制**：自动重试和指数退避
- **日志记录**：内置日志记录功能
- **请求拦截**：请求和响应拦截器
- **流式响应**：支持流式 API 响应
- **文件上传**：简化的文件上传接口

---

## JavaScript/TypeScript SDK

### 安装

```bash
npm install @yyc3/sdk
# 或
yarn add @yyc3/sdk
# 或
pnpm add @yyc3/sdk
```

### 初始化

```typescript
import { YYC3Client } from '@yyc3/sdk';

const client = new YYC3Client({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.yyc3.com',
  timeout: 30000,
  maxRetries: 3,
  logger: {
    level: 'info',
    handler: console.log
  }
});
```

### 认证

```typescript
// 使用 API Key
const client = new YYC3Client({
  apiKey: 'YOUR_API_KEY'
});

// 使用 OAuth Token
const client = new YYC3Client({
  baseURL: 'https://api.yyc3.com',
  auth: {
    type: 'oauth',
    token: 'YOUR_OAUTH_TOKEN'
  }
});

// 使用 JWT
const client = new YYC3Client({
  baseURL: 'https://api.yyc3.com',
  auth: {
    type: 'jwt',
    token: 'YOUR_JWT_TOKEN'
  }
});
```

### AI 对话

```typescript
// 基础对话
const response = await client.ai.chat({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: '你好' }
  ]
});

console.log(response.choices[0].message.content);

// 流式对话
const stream = await client.ai.chat.stream({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: '请写一首诗' }
  ]
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

// 带选项的对话
const response = await client.ai.chat({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: '你是一个专业的翻译助手' },
    { role: 'user', content: '将以下英文翻译成中文：Hello World' }
  ],
  temperature: 0.7,
  maxTokens: 1000,
  topP: 0.9,
  frequencyPenalty: 0.5,
  presencePenalty: 0.5,
  stopSequences: ['\n\n', '###']
});
```

### 工作流

```typescript
// 创建工作流
const workflow = await client.workflows.create({
  name: '数据处理工作流',
  description: '处理用户上传的数据',
  nodes: [
    {
      id: 'node-1',
      type: 'data-processor',
      config: {
        format: 'json',
        validate: true
      }
    },
    {
      id: 'node-2',
      type: 'ai-analyzer',
      config: {
        model: 'gpt-4',
        prompt: '分析数据并生成报告'
      }
    }
  ],
  edges: [
    {
      from: 'node-1',
      to: 'node-2'
    }
  ]
});

// 执行工作流
const execution = await client.workflows.execute(workflow.id, {
  input: {
    fileId: 'file-abc123'
  }
});

// 获取执行状态
const status = await client.workflows.getExecutionStatus(execution.id);
console.log('Status:', status.status);
```

### 文件管理

```typescript
// 上传文件
const file = await client.files.upload({
  file: fs.createReadStream('document.pdf'),
  path: '/documents',
  name: 'document.pdf',
  description: '产品使用手册'
});

// 下载文件
const stream = await client.files.download(file.id);
const writeStream = fs.createWriteStream('downloaded.pdf');
stream.pipe(writeStream);

// 列出文件
const files = await client.files.list({
  path: '/documents',
  limit: 100
});

// 删除文件
await client.files.delete(file.id);
```

### 用户管理

```typescript
// 创建用户
const user = await client.users.create({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

// 获取用户
const user = await client.users.get('user-123');

// 更新用户
const updated = await client.users.update('user-123', {
  name: 'Jane Doe'
});

// 删除用户
await client.users.delete('user-123');
```

### 错误处理

```typescript
try {
  const response = await client.ai.chat({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: '你好' }
    ]
  });
} catch (error) {
  if (error instanceof YYC3ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Details:', error.details);
  } else if (error instanceof YYC3NetworkError) {
    console.error('Network Error:', error.message);
  } else {
    console.error('Unknown Error:', error);
  }
}
```

### 请求拦截器

```typescript
// 添加请求拦截器
client.interceptors.request.use((config) => {
  console.log('Request:', config);
  return config;
});

// 添加响应拦截器
client.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Error:', error);
    return Promise.reject(error);
  }
);
```

### 日志记录

```typescript
// 配置日志
const client = new YYC3Client({
  apiKey: 'YOUR_API_KEY',
  logger: {
    level: 'debug',
    handler: (level, message, context) => {
      console.log(`[${level}] ${message}`, context);
    }
  }
});

// 自定义日志处理器
const client = new YYC3Client({
  apiKey: 'YOUR_API_KEY',
  logger: {
    level: 'info',
    handler: (level, message, context) => {
      // 发送到日志服务
      logService.log(level, message, context);
    }
  }
});
```

---

## Python SDK

### 安装

```bash
pip install yyc3-python-sdk
```

### 初始化

```python
from yyc3 import YYC3Client

client = YYC3Client(
    api_key='YOUR_API_KEY',
    base_url='https://api.yyc3.com',
    timeout=30,
    max_retries=3
)
```

### AI 对话

```python
# 基础对话
response = client.ai.chat(
    model='gpt-4',
    messages=[
        {'role': 'user', 'content': '你好'}
    ]
)

print(response.choices[0].message.content)

# 流式对话
for chunk in client.ai.chat.stream(
    model='gpt-4',
    messages=[
        {'role': 'user', 'content': '请写一首诗'}
    ]
):
    print(chunk.choices[0].delta.content or '', end='', flush=True)
```

### 工作流

```python
# 创建工作流
workflow = client.workflows.create(
    name='数据处理工作流',
    description='处理用户上传的数据',
    nodes=[
        {
            'id': 'node-1',
            'type': 'data-processor',
            'config': {
                'format': 'json',
                'validate': True
            }
        }
    ]
)

# 执行工作流
execution = client.workflows.execute(workflow.id, input={
    'fileId': 'file-abc123'
})
```

### 文件管理

```python
# 上传文件
with open('document.pdf', 'rb') as f:
    file = client.files.upload(
        file=f,
        path='/documents',
        name='document.pdf'
    )

# 下载文件
with open('downloaded.pdf', 'wb') as f:
    client.files.download(file.id, f)
```

### 错误处理

```python
from yyc3.exceptions import YYC3ApiError, YYC3NetworkError

try:
    response = client.ai.chat(
        model='gpt-4',
        messages=[
            {'role': 'user', 'content': '你好'}
        ]
    )
except YYC3ApiError as e:
    print(f'API Error: {e.message}')
    print(f'Status: {e.status}')
    print(f'Code: {e.code}')
except YYC3NetworkError as e:
    print(f'Network Error: {e.message}')
except Exception as e:
    print(f'Unknown Error: {e}')
```

---

## Java SDK

### 安装

Maven:

```xml
<dependency>
    <groupId>com.yyc3</groupId>
    <artifactId>yyc3-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

Gradle:

```gradle
implementation 'com.yyc3:yyc3-java-sdk:1.0.0'
```

### 初始化

```java
import com.yyc3.YYC3Client;
import com.yyc3.config.ClientConfig;

ClientConfig config = ClientConfig.builder()
    .apiKey("YOUR_API_KEY")
    .baseURL("https://api.yyc3.com")
    .timeout(30000)
    .maxRetries(3)
    .build();

YYC3Client client = new YYC3Client(config);
```

### AI 对话

```java
import com.yyc3.models.ChatRequest;
import com.yyc3.models.ChatResponse;
import com.yyc3.models.Message;

ChatRequest request = ChatRequest.builder()
    .model("gpt-4")
    .messages(List.of(
        new Message("user", "你好")
    ))
    .temperature(0.7)
    .maxTokens(1000)
    .build();

ChatResponse response = client.ai().chat(request);
System.out.println(response.getChoices().get(0).getMessage().getContent());
```

### 工作流

```java
import com.yyc3.models.Workflow;
import com.yyc3.models.WorkflowExecution;

Workflow workflow = client.workflows().create(
    Workflow.builder()
        .name("数据处理工作流")
        .description("处理用户上传的数据")
        .nodes(List.of(
            Workflow.Node.builder()
                .id("node-1")
                .type("data-processor")
                .config(Map.of(
                    "format", "json",
                    "validate", true
                ))
                .build()
        ))
        .build()
);

WorkflowExecution execution = client.workflows().execute(
    workflow.getId(),
    Map.of("fileId", "file-abc123")
);
```

### 错误处理

```java
import com.yyc3.exceptions.YYC3ApiException;
import com.yyc3.exceptions.YYC3NetworkException;

try {
    ChatResponse response = client.ai().chat(request);
} catch (YYC3ApiException e) {
    System.err.println("API Error: " + e.getMessage());
    System.err.println("Status: " + e.getStatus());
    System.err.println("Code: " + e.getCode());
} catch (YYC3NetworkException e) {
    System.err.println("Network Error: " + e.getMessage());
} catch (Exception e) {
    System.err.println("Unknown Error: " + e.getMessage());
}
```

---

## Go SDK

### 安装

```bash
go get github.com/yyc3/go-sdk
```

### 初始化

```go
package main

import (
    "github.com/yyc3/go-sdk"
)

func main() {
    client := yyc3.NewClient(&yyc3.ClientConfig{
        APIKey:   "YOUR_API_KEY",
        BaseURL:  "https://api.yyc3.com",
        Timeout:  30000,
        MaxRetries: 3,
    })
}
```

### AI 对话

```go
package main

import (
    "context"
    "fmt"
    "github.com/yyc3/go-sdk"
)

func main() {
    client := yyc3.NewClient(&yyc3.ClientConfig{
        APIKey: "YOUR_API_KEY",
    })

    response, err := client.AI().Chat(context.Background(), &yyc3.ChatRequest{
        Model: "gpt-4",
        Messages: []yyc3.Message{
            {Role: "user", Content: "你好"},
        },
    })

    if err != nil {
        panic(err)
    }

    fmt.Println(response.Choices[0].Message.Content)
}
```

### 工作流

```go
workflow, err := client.Workflows().Create(context.Background(), &yyc3.WorkflowRequest{
    Name:        "数据处理工作流",
    Description: "处理用户上传的数据",
    Nodes: []yyc3.WorkflowNode{
        {
            ID:   "node-1",
            Type: "data-processor",
            Config: map[string]interface{}{
                "format":   "json",
                "validate": true,
            },
        },
    },
})

if err != nil {
    panic(err)
}

execution, err := client.Workflows().Execute(context.Background(), workflow.ID, map[string]interface{}{
    "fileId": "file-abc123",
})

if err != nil {
    panic(err)
}
```

### 错误处理

```go
response, err := client.AI().Chat(context.Background(), request)

if err != nil {
    if apiErr, ok := err.(*yyc3.APIError); ok {
        fmt.Printf("API Error: %s\n", apiErr.Message)
        fmt.Printf("Status: %d\n", apiErr.Status)
        fmt.Printf("Code: %s\n", apiErr.Code)
    } else if netErr, ok := err.(*yyc3.NetworkError); ok {
        fmt.Printf("Network Error: %s\n", netErr.Message)
    } else {
        fmt.Printf("Unknown Error: %s\n", err.Error())
    }
}
```

---

## 最佳实践

### 1. 错误处理

始终处理可能的错误。

```typescript
try {
  const response = await client.ai.chat(request);
} catch (error) {
  if (error instanceof YYC3ApiError) {
    // 处理 API 错误
  } else if (error instanceof YYC3NetworkError) {
    // 处理网络错误
  } else {
    // 处理其他错误
  }
}
```

### 2. 重试机制

使用内置的重试机制或自定义重试逻辑。

```typescript
const client = new YYC3Client({
  apiKey: 'YOUR_API_KEY',
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoff: 2
});
```

### 3. 超时设置

设置适当的超时时间。

```typescript
const client = new YYC3Client({
  apiKey: 'YOUR_API_KEY',
  timeout: 30000
});
```

### 4. 日志记录

配置日志记录以便调试。

```typescript
const client = new YYC3Client({
  apiKey: 'YOUR_API_KEY',
  logger: {
    level: 'debug',
    handler: console.log
  }
});
```

### 5. 流式响应

对于长时间运行的操作，使用流式响应。

```typescript
const stream = await client.ai.chat.stream(request);

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### 6. 并发控制

控制并发请求数量。

```typescript
import pLimit from 'p-limit';

const limit = pLimit(5); // 最多 5 个并发请求

const tasks = requests.map(request => 
  limit(() => client.ai.chat(request))
);

const results = await Promise.all(tasks);
```

---

## 常见问题

### Q: 如何获取 API Key？

A: 登录 YYC³ 控制台，在 API 设置中创建新的 API Key。

### Q: SDK 支持哪些语言？

A: 目前支持 JavaScript/TypeScript、Python、Java、Go、PHP、Ruby、.NET、Swift 和 Kotlin。

### Q: 如何处理流式响应？

A: 使用 SDK 提供的流式 API，通过迭代器或回调处理响应块。

### Q: SDK 如何处理错误？

A: SDK 提供统一的错误类型，包括 API 错误、网络错误等。

### Q: 如何自定义请求？

A: 使用请求拦截器自定义请求头、参数等。

### Q: SDK 是否支持离线模式？

A: SDK 目前不支持离线模式，需要网络连接。

---

## 支持与反馈

如有问题或建议，请联系：

- **邮箱**: sdk@yyc3.com
- **文档**: https://docs.yyc3.com/sdk
- **GitHub**: https://github.com/yyc3/sdk
- **Discord**: https://discord.gg/yyc3

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
