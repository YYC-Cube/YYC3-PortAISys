/**
 * @file Tracing配置模块
 * @description 使用OpenTelemetry配置分布式追踪
 * @module tracing/TracingConfig
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-24
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

export interface TracingOptions {
  serviceName?: string;
  serviceVersion?: string;
  endpoint?: string;
  enableConsoleLogging?: boolean;
  enabled?: boolean;
  isTestEnvironment?: boolean; // 测试环境标志
}

/**
 * Tracing配置管理器
 */
export class TracingConfig {
  private sdk?: NodeSDK;
  private isInitialized: boolean = false;
  private options: Required<TracingOptions>;

  constructor(options: TracingOptions = {}) {
    this.options = {
      serviceName: options.serviceName || 'yyc3-portable-ai-system',
      serviceVersion: options.serviceVersion || '1.0.0',
      endpoint: options.endpoint || 'http://localhost:4318/v1/traces',
      enableConsoleLogging: options.enableConsoleLogging ?? false,
      enabled: options.enabled ?? true,
      isTestEnvironment: options.isTestEnvironment ?? false,
    };
  }

  /**
   * 初始化 OpenTelemetry tracing
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[Tracing] Already initialized');
      return;
    }

    if (!this.options.enabled) {
      console.info('[Tracing] Tracing is disabled');
      return;
    }

    try {
      // 启用OpenTelemetry诊断日志（开发模式）
      if (this.options.enableConsoleLogging) {
        diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
      }

      // 测试环境：跳过实际的OTLP连接，只做基本初始化
      if (this.options.isTestEnvironment) {
        console.info('[Tracing] Test environment detected - skipping full initialization');
        this.isInitialized = true;
        return;
      }

      // 配置OTLP导出器
      const traceExporter = new OTLPTraceExporter({
        url: this.options.endpoint,
        headers: {},
      });

      // 配置资源信息
      const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: this.options.serviceName,
        [ATTR_SERVICE_VERSION]: this.options.serviceVersion,
      });

      // 初始化NodeSDK with自动instrumentation
      this.sdk = new NodeSDK({
        resource,
        traceExporter,
        instrumentations: [
          getNodeAutoInstrumentations({
            // 自动instrument所有支持的库
            '@opentelemetry/instrumentation-fs': {
              enabled: true,
            },
            '@opentelemetry/instrumentation-http': {
              enabled: true,
            },
            '@opentelemetry/instrumentation-express': {
              enabled: true,
            },
            '@opentelemetry/instrumentation-dns': {
              enabled: false, // 减少噪音
            },
            '@opentelemetry/instrumentation-net': {
              enabled: false, // 减少噪音
            },
          }),
        ],
      });

      // 启动SDK
      await this.sdk.start();
      this.isInitialized = true;

      console.info('[Tracing] OpenTelemetry initialized successfully', {
        serviceName: this.options.serviceName,
        endpoint: this.options.endpoint,
      });
    } catch (error) {
      console.error('[Tracing] Failed to initialize OpenTelemetry:', error);
      // 在测试环境中，即使初始化失败也标记为已初始化，以避免测试超时
      if (this.options.isTestEnvironment) {
        console.info('[Tracing] Test environment - marking as initialized despite error');
        this.isInitialized = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * 关闭tracing
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    // 测试环境：跳过实际的关闭操作
    if (this.options.isTestEnvironment) {
      console.info('[Tracing] Test environment detected - skipping full shutdown');
      this.isInitialized = false;
      return;
    }

    if (!this.sdk) {
      return;
    }

    try {
      await this.sdk.shutdown();
      this.isInitialized = false;
      console.info('[Tracing] OpenTelemetry shut down successfully');
    } catch (error) {
      console.error('[Tracing] Error shutting down OpenTelemetry:', error);
      // 在测试环境中，即使关闭失败也标记为未初始化，以避免测试超时
      if (this.options.isTestEnvironment) {
        console.info('[Tracing] Test environment - marking as uninitialized despite error');
        this.isInitialized = false;
      } else {
        throw error;
      }
    }
  }

  /**
   * 获取初始化状态
   */
  getInitializedStatus(): boolean {
    return this.isInitialized;
  }

  /**
   * 获取配置信息
   */
  getOptions(): Required<TracingOptions> {
    return { ...this.options };
  }
}

// 单例实例
let globalTracingConfig: TracingConfig | null = null;

/**
 * 初始化全局tracing配置
 */
export async function initializeTracing(options?: TracingOptions): Promise<TracingConfig> {
  if (!globalTracingConfig) {
    globalTracingConfig = new TracingConfig(options);
    await globalTracingConfig.initialize();
  }
  return globalTracingConfig;
}

/**
 * 获取全局tracing配置
 */
export function getTracingConfig(): TracingConfig | null {
  return globalTracingConfig;
}

/**
 * 关闭全局tracing
 */
export async function shutdownTracing(): Promise<void> {
  if (globalTracingConfig) {
    await globalTracingConfig.shutdown();
    globalTracingConfig = null;
  }
}
