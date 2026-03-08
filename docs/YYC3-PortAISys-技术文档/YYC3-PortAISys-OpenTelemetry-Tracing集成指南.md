---
@file: YYC3-PortAISys-OpenTelemetry-Tracing集成指南.md
@description: YYC3-PortAISys-OpenTelemetry-Tracing集成指南 文档
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: technical,code,documentation,zh-CN
@category: technical
@language: zh-CN
@audience: developers
@complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# OpenTelemetry Tracing 集成指南

YYC³ Portable Intelligent AI System 现已集成 OpenTelemetry 分布式追踪功能，可以帮助你：

- 🔍 **可视化请求流程**：查看请求在系统各组件间的流转路径
- ⏱️ **性能分析**：识别性能瓶颈和慢查询
- 🐛 **问题诊断**：快速定位错误和异常
- 📊 **系统洞察**：理解系统行为和依赖关系

## 🚀 快速开始

### 1. 安装依赖

依赖已自动安装，包括：

```json
{
  "@opentelemetry/api": "^1.x",
  "@opentelemetry/sdk-node": "^0.x",
  "@opentelemetry/auto-instrumentations-node": "^0.x",
  "@opentelemetry/exporter-trace-otlp-http": "^0.x"
}
```

### 2. 初始化 Tracing

在应用启动时初始化 tracing：

```typescript
import { initializeTracing } from './core/tracing';

// 初始化 tracing
await initializeTracing({
  serviceName: 'yyc3-portable-ai-system',
  serviceVersion: '1.0.0',
  endpoint: 'http://localhost:4318/v1/traces', // AI Toolkit endpoint
  enableConsoleLogging: true, // 开发环境启用
  enabled: true,
});
```

### 3. 使用 Tracing

#### 自动 Instrumentation

核心引擎的关键方法已自动添加 tracing：

- `AutonomousAIEngine.initialize()`
- `AutonomousAIEngine.start()`
- `AutonomousAIEngine.processMessage()`

这些方法会自动创建 span 并记录：
- 执行时间
- 输入参数
- 返回结果
- 错误信息

#### 手动创建 Span

```typescript
import { withSpan, setSpanAttribute } from './core/tracing';

// 异步函数
await withSpan('my-operation', async (span) => {
  // 添加自定义属性
  setSpanAttribute('user.id', userId);
  setSpanAttribute('operation.type', 'query');
  
  // 你的业务逻辑
  const result = await doSomething();
  
  return result;
});

// 同步函数
import { withSpanSync } from './core/tracing';

const result = withSpanSync('sync-operation', (span) => {
  span.setAttribute('key', 'value');
  return compute();
});
```

#### 添加事件和属性

```typescript
import { addSpanEvent, setSpanAttributes } from './core/tracing';

// 添加事件
addSpanEvent('user-action', { action: 'click', target: 'button' });

// 批量设置属性
setSpanAttributes({
  'request.method': 'POST',
  'request.url': '/api/chat',
  'request.size': 1024,
});
```

#### 记录异常

```typescript
import { recordSpanException } from './core/tracing';

try {
  await riskyOperation();
} catch (error) {
  recordSpanException(error as Error);
  throw error;
}
```

#### 使用装饰器（实验性）

```typescript
import { TraceMethod } from './core/tracing';

class MyService {
  @TraceMethod('MyService.processData')
  async processData(data: any) {
    // 自动创建 span
    return await process(data);
  }
}
```

## 📊 查看 Traces

### 使用 AI Toolkit Trace Viewer

1. **启动 Trace Collector**：
   - VS Code 命令面板：`AI Toolkit: Open Trace Viewer`
   - 或者运行示例时会自动打开

2. **查看追踪数据**：
   - 打开 AI Toolkit 扩展
   - 点击 "Traces" 标签
   - 浏览时间线和 span 详情

3. **OTLP Endpoint**：
   - HTTP: `http://localhost:4318`
   - gRPC: `http://localhost:4317`

## 📝 示例代码

### 运行完整示例

```bash
# 运行 tracing 示例
npm run example:tracing

# 或使用 tsx 直接运行
npx tsx core/examples/tracing-example.ts
```

示例展示：
- ✅ 初始化 tracing
- ✅ 启动 AI 引擎
- ✅ 处理消息（带追踪）
- ✅ 错误处理和异常追踪
- ✅ 性能指标收集
- ✅ 优雅关闭

### 集成到现有代码

```typescript
// 在 main.ts 或 index.ts 中
import { initializeTracing, shutdownTracing } from './core/tracing';
import { AutonomousAIEngine } from './core/AutonomousAIEngine';

async function bootstrap() {
  // 1. 初始化 tracing（必须在所有操作之前）
  await initializeTracing({
    serviceName: 'my-ai-app',
    endpoint: 'http://localhost:4318/v1/traces',
  });

  // 2. 初始化应用
  const engine = new AutonomousAIEngine(config);
  await engine.initialize();
  await engine.start();

  // 3. 应用逻辑...
  
  // 4. 清理
  process.on('SIGINT', async () => {
    await engine.shutdown();
    await shutdownTracing(); // 确保 traces 被发送
    process.exit(0);
  });
}

bootstrap().catch(console.error);
```

## 🔧 配置选项

### TracingOptions

```typescript
interface TracingOptions {
  // 服务名称（必需）
  serviceName?: string;
  
  // 服务版本
  serviceVersion?: string;
  
  // OTLP 导出端点
  endpoint?: string;
  
  // 启用控制台日志（开发环境）
  enableConsoleLogging?: boolean;
  
  // 是否启用 tracing
  enabled?: boolean;
}
```

### 环境变量

```bash
# 禁用 tracing（生产环境可选）
export OTEL_SDK_DISABLED=true

# 自定义服务名称
export OTEL_SERVICE_NAME=my-service

# 自定义导出端点
export OTEL_EXPORTER_OTLP_ENDPOINT=http://my-collector:4318
```

## 🎯 最佳实践

### 1. Span 命名规范

使用清晰、一致的命名：

```typescript
// ✅ 好的命名
'AutonomousAIEngine.processMessage'
'OpenAIAdapter.chat'
'CacheLayer.get'

// ❌ 避免
'process'
'do_stuff'
'function123'
```

### 2. 添加有意义的属性

```typescript
// ✅ 有用的属性
setSpanAttributes({
  'message.type': 'USER_INPUT',
  'message.id': messageId,
  'user.id': userId,
  'model.name': 'gpt-4',
  'response.tokens': 150,
});

// ❌ 过于详细或无意义
setSpanAttribute('debug.random', Math.random());
```

### 3. 控制 Span 粒度

```typescript
// ✅ 适当的粒度
await withSpan('user-request', async () => {
  await withSpan('validate-input', async () => { ... });
  await withSpan('process-ai', async () => { ... });
  await withSpan('format-response', async () => { ... });
});

// ❌ 过细（每个函数调用都创建 span）
// ❌ 过粗（整个应用一个 span）
```

### 4. 错误处理

始终记录异常：

```typescript
try {
  await operation();
} catch (error) {
  recordSpanException(error as Error);
  // 继续处理错误
  throw error;
}
```

### 5. 生产环境配置

```typescript
const isProduction = process.env.NODE_ENV === 'production';

await initializeTracing({
  serviceName: 'yyc3-ai-system',
  endpoint: isProduction 
    ? 'https://otlp-collector.example.com/v1/traces'
    : 'http://localhost:4318/v1/traces',
  enableConsoleLogging: !isProduction,
  enabled: true,
});
```

## 🧪 测试

Tracing 不会影响测试：

```typescript
// 测试环境禁用 tracing
await initializeTracing({
  enabled: process.env.NODE_ENV !== 'test',
});
```

## 🔗 集成其他后端

### Jaeger

```typescript
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const exporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
});
```

### Zipkin

```typescript
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const exporter = new ZipkinExporter({
  url: 'http://localhost:9411/api/v2/spans',
});
```

### Azure Monitor

```typescript
import { AzureMonitorTraceExporter } from '@azure/monitor-opentelemetry-exporter';

const exporter = new AzureMonitorTraceExporter({
  connectionString: 'InstrumentationKey=...',
});
```

## 📚 更多资源

- [OpenTelemetry 官方文档](https://opentelemetry.io/docs/)
- [OpenTelemetry JavaScript SDK](https://github.com/open-telemetry/opentelemetry-js)
- [AI Toolkit Tracing 文档](https://github.com/microsoft/vscode-ai-toolkit)

## 🐛 故障排查

### Traces 未显示

1. 检查 AI Toolkit Trace Viewer 是否已启动
2. 验证端点配置：`http://localhost:4318/v1/traces`
3. 启用控制台日志查看详细信息：
   ```typescript
   enableConsoleLogging: true
   ```

### 性能影响

- Tracing 开销通常 < 5%
- 生产环境可以使用采样：
  ```typescript
  import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
  
  // 采样 10% 的请求
  sampler: new TraceIdRatioBasedSampler(0.1)
  ```

### 内存占用

- SDK 自动批处理和导出
- 默认配置已优化
- 可调整批处理大小：
  ```typescript
  batchSpanProcessor: {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
  }
  ```

## 📞 支持

如有问题，请：
1. 查看 [故障排查](#故障排查) 部分
2. 查阅 OpenTelemetry 文档
3. 提交 GitHub Issue

---

**版本**: 1.0.0  
**更新日期**: 2026-01-24  
**作者**: YYC³ Team

---
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
