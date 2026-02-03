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
import { logger } from '../utils/logger';

/**
 * 主函数：演示tracing集成
 */
async function main() {
  logger.info('🚀 启动 YYC³ AI System with OpenTelemetry Tracing\n', 'tracing-example');

  // 1. 初始化 Tracing（必须在应用启动前）
  logger.info('📊 初始化 OpenTelemetry Tracing...', 'tracing-example');
  await initializeTracing({
    serviceName: 'yyc3-portable-ai-system',
    serviceVersion: '1.0.0',
    endpoint: 'http://localhost:4318/v1/traces', // AI Toolkit OTLP endpoint
    enableConsoleLogging: true,
    enabled: true,
  });
  logger.info('✅ Tracing 初始化完成\n', 'tracing-example');

  // 2. 创建并初始化引擎
  logger.info('🔧 创建 AI 引擎...', 'tracing-example');
  const engineConfig: EngineConfig = {
    version: '1.0.0',
    environment: 'development',
    messageConfig: {
      maxQueueSize: 1000,
      retryPolicy: {
        maxRetries: 3,
        backoffFactor: 2
      }
    },
    taskConfig: {
      maxConcurrentTasks: 10,
      timeoutMs: 30000,
      priorityLevels: 3
    },
    stateConfig: {
      autoPersist: true,
      persistInterval: 60000,
      maxHistory: 1000
    },
    logConfig: {
      level: 'info',
      format: 'text'
    }
  };

  const engine = new AutonomousAIEngine(engineConfig);

  try {
    // 3. 在自定义 span 中初始化引擎
    await withSpan('app.initialize', async (span) => {
      span.setAttribute('app.name', 'yyc3-example');
      span.setAttribute('app.version', '1.0.0');

      await engine.initialize();
      await engine.start();

      logger.info('✅ AI 引擎启动成功\n', 'tracing-example');
    });

    // 4. 处理一些示例消息
    logger.info('📨 处理示例消息...', 'tracing-example');

    await withSpan('app.process_messages', async () => {
      // 注册一个简单的消息处理器
      engine.registerMessageHandler(MessageType.USER_MESSAGE, async (message: any) => {
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
        { id: '1', type: MessageType.USER_MESSAGE, content: '你好，YYC³！', timestamp: new Date() },
        { id: '2', type: MessageType.USER_MESSAGE, content: '介绍一下五维闭环系统', timestamp: new Date() },
        { id: '3', type: MessageType.USER_MESSAGE, content: '展示AI能力', timestamp: new Date() },
      ];

      for (const message of testMessages) {
        const response = await engine.processMessage(message);
        logger.info(`  ✓ 消息 ${message.id}: ${response.success ? '成功' : '失败'}`, 'tracing-example');
      }
    });

    logger.info('✅ 消息处理完成\n', 'tracing-example');

    // 5. 模拟一些错误场景（演示错误追踪）
    logger.info('⚠️  测试错误追踪...', 'tracing-example');
    try {
      await withSpan('app.error_test', async (span) => {
        span.setAttribute('test.type', 'error_handling');
        throw new Error('这是一个测试错误');
      });
    } catch (error) {
      logger.info('  ✓ 错误已被捕获并记录到 trace\n', 'tracing-example');
    }

    // 6. 显示引擎状态
    logger.info('📊 引擎状态:', 'tracing-example');
    logger.info(`  状态: ${engine.getStatus()}`, 'tracing-example');
    const metrics = engine.getMetrics();
    logger.info(`  消息吞吐: ${metrics.messageThroughput.toFixed(2)} msg/s`, 'tracing-example');
    logger.info(`  平均处理时间: ${(metrics.responseTimes.average || 0).toFixed(2)}ms`, 'tracing-example');
    logger.info(`  错误率: ${metrics.errorRate.toFixed(2)}%\n`, 'tracing-example');

    // 7. 关闭引擎
    logger.info('🛑 关闭 AI 引擎...', 'tracing-example');
    await engine.shutdown();
    logger.info('✅ AI 引擎已关闭\n', 'tracing-example');

  } catch (error) {
    logger.error('❌ 错误:', 'tracing-example', { error }, error as Error);
  } finally {
    // 8. 关闭 Tracing（确保所有trace数据都被发送）
    logger.info('📊 关闭 Tracing...', 'tracing-example');
    await shutdownTracing();
    logger.info('✅ Tracing 已关闭\n', 'tracing-example');
  }

  logger.info('🎉 示例完成！', 'tracing-example');
  logger.info('\n📊 打开 AI Toolkit 的 Trace Viewer 查看追踪数据:', 'tracing-example');
  logger.info('   VS Code 命令: AI Toolkit: Open Trace Viewer', 'tracing-example');
  logger.info('   或访问: http://localhost:4318\n', 'tracing-example');
}

// 运行示例
if (require.main === module) {
  main().catch((error) => logger.error('Main function error:', 'tracing-example', { error }, error as Error));
}

export { main };
