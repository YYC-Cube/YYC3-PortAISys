/**
 * @file Tracing示例应用
 * @description 演示如何在YYC³系统中使用OpenTelemetry tracing
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-24
 */

import { AutonomousAIEngine } from '../AutonomousAIEngine';
import { initializeTracing, shutdownTracing, withSpan } from '../tracing';
import { EngineConfig, MessageType } from '../types/engine.types';

/**
 * 主函数：演示tracing集成
 */
async function main() {
  console.log('🚀 启动 YYC³ AI System with OpenTelemetry Tracing\n');

  // 1. 初始化 Tracing（必须在应用启动前）
  console.log('📊 初始化 OpenTelemetry Tracing...');
  await initializeTracing({
    serviceName: 'yyc3-portable-ai-system',
    serviceVersion: '1.0.0',
    endpoint: 'http://localhost:4318/v1/traces', // AI Toolkit OTLP endpoint
    enableConsoleLogging: true,
    enabled: true,
  });
  console.log('✅ Tracing 初始化完成\n');

  // 2. 创建并初始化引擎
  console.log('🔧 创建 AI 引擎...');
  const engineConfig: EngineConfig = {
    version: '1.0.0',
    environment: 'development',
  };

  const engine = new AutonomousAIEngine(engineConfig);

  try {
    // 3. 在自定义 span 中初始化引擎
    await withSpan('app.initialize', async (span) => {
      span.setAttribute('app.name', 'yyc3-example');
      span.setAttribute('app.version', '1.0.0');

      await engine.initialize();
      await engine.start();

      console.log('✅ AI 引擎启动成功\n');
    });

    // 4. 处理一些示例消息
    console.log('📨 处理示例消息...');

    await withSpan('app.process_messages', async () => {
      // 注册一个简单的消息处理器
      engine.registerMessageHandler(MessageType.USER_INPUT, async (message: any) => {
        return {
          success: true,
          content: `处理消息: ${message.content}`,
          metadata: {
            timestamp: new Date(),
          },
        };
      });

      // 发送测试消息
      const testMessages = [
        { id: '1', type: MessageType.USER_INPUT, content: '你好，YYC³！', timestamp: new Date() },
        { id: '2', type: MessageType.USER_INPUT, content: '介绍一下五维闭环系统', timestamp: new Date() },
        { id: '3', type: MessageType.USER_INPUT, content: '展示AI能力', timestamp: new Date() },
      ];

      for (const message of testMessages) {
        const response = await engine.processMessage(message);
        console.log(`  ✓ 消息 ${message.id}: ${response.success ? '成功' : '失败'}`);
      }
    });

    console.log('✅ 消息处理完成\n');

    // 5. 模拟一些错误场景（演示错误追踪）
    console.log('⚠️  测试错误追踪...');
    try {
      await withSpan('app.error_test', async (span) => {
        span.setAttribute('test.type', 'error_handling');
        throw new Error('这是一个测试错误');
      });
    } catch (error) {
      console.log('  ✓ 错误已被捕获并记录到 trace\n');
    }

    // 6. 显示引擎状态
    console.log('📊 引擎状态:');
    console.log(`  状态: ${engine.getStatus()}`);
    const metrics = engine.getMetrics();
    console.log(`  消息吞吐: ${metrics.messageThroughput.toFixed(2)} msg/s`);
    console.log(`  平均处理时间: ${(metrics.responseTimes.average || 0).toFixed(2)}ms`);
    console.log(`  错误率: ${metrics.errorRate.toFixed(2)}%\n`);

    // 7. 关闭引擎
    console.log('🛑 关闭 AI 引擎...');
    await engine.shutdown();
    console.log('✅ AI 引擎已关闭\n');

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    // 8. 关闭 Tracing（确保所有trace数据都被发送）
    console.log('📊 关闭 Tracing...');
    await shutdownTracing();
    console.log('✅ Tracing 已关闭\n');
  }

  console.log('🎉 示例完成！');
  console.log('\n📊 打开 AI Toolkit 的 Trace Viewer 查看追踪数据:');
  console.log('   VS Code 命令: AI Toolkit: Open Trace Viewer');
  console.log('   或访问: http://localhost:4318\n');
}

// 运行示例
if (require.main === module) {
  main().catch(console.error);
}

export { main };
