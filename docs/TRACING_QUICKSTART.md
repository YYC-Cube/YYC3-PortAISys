# 🎯 Tracing 快速开始指南

## ⚡ 5分钟快速上手

### 1️⃣ 打开 AI Toolkit Trace Viewer

在 VS Code 中：
- 按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
- 输入 "AI Toolkit: Open Trace Viewer"
- 回车

或者，Trace Viewer 已经自动打开了！

### 2️⃣ 运行示例应用

```bash
npm run example:tracing
```

### 3️⃣ 查看追踪数据

示例运行后：
1. 在 VS Code 侧边栏找到 AI Toolkit 扩展
2. 点击 "Traces" 标签
3. 你会看到：
   - `app.initialize` - 应用初始化
   - `AutonomousAIEngine.initialize` - 引擎初始化
   - `AutonomousAIEngine.start` - 引擎启动
   - `app.process_messages` - 消息处理
   - `AutonomousAIEngine.processMessage` - 单个消息处理

### 4️⃣ 探索 Span 详情

点击任何 span 查看：
- ⏱️ **执行时间**：精确到毫秒
- 🏷️ **属性**：自定义元数据
- 📊 **事件**：关键时间点
- ❌ **错误**：异常堆栈跟踪

---

## 🔧 集成到你的代码

### 最小集成（3行代码）

```typescript
import { initializeTracing } from './core/tracing';

// 在应用启动时
await initializeTracing();

// ... 你的应用代码
// 核心引擎方法已自动追踪！

// 应用退出时
await shutdownTracing();
```

### 添加自定义追踪

```typescript
import { withSpan } from './core/tracing';

async function myFunction() {
  return withSpan('myFunction', async (span) => {
    span.setAttribute('user.id', '123');
    span.setAttribute('operation', 'data-processing');
    
    // 你的逻辑
    const result = await processData();
    
    return result;
  });
}
```

---

## 📊 查看实时追踪

### Trace Viewer 功能

- **时间线视图**：可视化请求流程
- **Span详情**：查看执行时间和属性
- **过滤搜索**：快速定位问题
- **错误高亮**：一目了然的错误状态

### 示例输出

```
🚀 启动 YYC³ AI System with OpenTelemetry Tracing

📊 初始化 OpenTelemetry Tracing...
✅ Tracing 初始化完成

🔧 创建 AI 引擎...
✅ AI 引擎启动成功

📨 处理示例消息...
  ✓ 消息 1: 成功
  ✓ 消息 2: 成功
  ✓ 消息 3: 成功
✅ 消息处理完成

📊 引擎状态:
  状态: RUNNING
  处理消息数: 3
  平均处理时间: 12.34ms
  错误数: 0

🎉 示例完成！

📊 打开 AI Toolkit 的 Trace Viewer 查看追踪数据
```

---

## 🎓 下一步

- 📖 阅读[完整文档](./TRACING.md)
- 🔍 探索 [OpenTelemetry 概念](https://opentelemetry.io/docs/concepts/)
- 🧪 查看[更多示例](../core/examples/)
- 🛠️ 自定义你的 tracing 配置

---

## 🆘 需要帮助？

**Traces 未显示？**
1. 确保 AI Toolkit Trace Viewer 已启动
2. 检查端点：`http://localhost:4318/v1/traces`
3. 运行示例查看是否有输出

**性能问题？**
- Tracing 开销通常 < 5%
- 可以在生产环境禁用或采样

**更多问题？**
- 查看[故障排查](./TRACING.md#故障排查)
- 提交 GitHub Issue

---

**准备好了？运行示例吧！** 🚀

```bash
npm run example:tracing
```
