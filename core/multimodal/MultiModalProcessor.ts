/**
 * @file MultiModalProcessor.ts
 * @description 多模态处理器 - 处理文本、图像、音频、视频
 * @module core/multimodal
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @modified 2026-01-26
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import EventEmitter from 'eventemitter3';

/**
 * 模态类型
 */
export enum ModalityType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video'
}

/**
 * 文本输入
 */
export interface TextInput {
  type: ModalityType.TEXT;
  content: string;
  language?: string;
  metadata?: Record<string, any>;
}

/**
 * 图像输入
 */
export interface ImageInput {
  type: ModalityType.IMAGE;
  url?: string;
  base64?: string;
  width?: number;
  height?: number;
  format?: string;
  metadata?: Record<string, any>;
}

/**
 * 音频输入
 */
export interface AudioInput {
  type: ModalityType.AUDIO;
  url?: string;
  base64?: string;
  duration?: number;
  format?: string;
  sampleRate?: number;
  metadata?: Record<string, any>;
}

/**
 * 视频输入
 */
export interface VideoInput {
  type: ModalityType.VIDEO;
  url?: string;
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
  fps?: number;
  metadata?: Record<string, any>;
}

/**
 * 多模态输入
 */
export type MultiModalInput = TextInput | ImageInput | AudioInput | VideoInput;

/**
 * 处理结果
 */
export interface ProcessingResult {
  modality: ModalityType;
  type?: ModalityType;  // 别名，用于测试兼容性
  content: any;
  features?: any;
  embeddings?: number[];
  confidence?: number;
  metadata?: Record<string, any>;
}

/**
 * 融合策略
 */
export enum FusionStrategy {
  EARLY = 'early',    // 早期融合
  LATE = 'late',      // 晚期融合
  HYBRID = 'hybrid'   // 混合融合
}

/**
 * 多模态处理器配置
 */
export interface MultiModalConfig {
  fusionStrategy?: FusionStrategy;
  enableCaching?: boolean;
  maxCacheSize?: number;
  enableParallelProcessing?: boolean;
}

/**
 * 多模态处理器
 */
export class MultiModalProcessor extends EventEmitter {
  private config: Required<MultiModalConfig>;
  private cache: Map<string, ProcessingResult> = new Map();
  private processors: Map<ModalityType, any> = new Map();
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private processingQueue: Array<{
    id: string;
    input: MultiModalInput;
    priority: number;
    resolve: (result: ProcessingResult) => void;
    reject: (error: Error) => void;
  }> = [];
  private isProcessing: boolean = false;
  private performanceMetrics: Map<ModalityType, Array<number>> = new Map();
  private modalityPriorities: Map<ModalityType, number> = new Map();

  constructor(config: MultiModalConfig = {}) {
    super();

    this.config = {
      fusionStrategy: config.fusionStrategy || FusionStrategy.HYBRID,
      enableCaching: config.enableCaching !== false,
      maxCacheSize: config.maxCacheSize || 100,
      enableParallelProcessing: config.enableParallelProcessing !== false
    };

    this.initializeProcessors();
  }

  /**
   * 初始化处理器
   */
  private initializeProcessors(): void {
    this.processors.set(ModalityType.TEXT, {
      process: this.processText.bind(this)
    });

    this.processors.set(ModalityType.IMAGE, {
      process: this.processImage.bind(this)
    });

    this.processors.set(ModalityType.AUDIO, {
      process: this.processAudio.bind(this)
    });

    this.processors.set(ModalityType.VIDEO, {
      process: this.processVideo.bind(this)
    });
  }

  /**
   * 处理单个模态
   */
  async processModality(input: MultiModalInput | string, data?: string | any): Promise<ProcessingResult> {
    // 支持两种调用方式：processModality(input) 或 processModality(type, data)
    let modalityInput: MultiModalInput;

    if (typeof input === 'string') {
      // 处理 processModality('text', 'Hello world') 形式的调用
      const type = input as any;
      if (type === 'text' || type === ModalityType.TEXT) {
        modalityInput = {
          type: ModalityType.TEXT,
          content: data || ''
        } as TextInput;
      } else if (type === 'image' || type === ModalityType.IMAGE) {
        modalityInput = {
          type: ModalityType.IMAGE,
          url: typeof data === 'string' ? data : data?.url,
          base64: data?.base64,
          width: data?.width,
          height: data?.height,
          format: data?.format
        } as ImageInput;
      } else if (type === 'audio' || type === ModalityType.AUDIO) {
        modalityInput = {
          type: ModalityType.AUDIO,
          url: typeof data === 'string' ? data : data?.url,
          sampleRate: data?.sampleRate,
          duration: data?.duration
        } as AudioInput;
      } else if (type === 'video' || type === ModalityType.VIDEO) {
        modalityInput = {
          type: ModalityType.VIDEO,
          url: typeof data === 'string' ? data : data?.url,
          width: data?.width,
          height: data?.height,
          duration: data?.duration
        } as VideoInput;
      } else {
        throw new Error(`Unknown modality type: ${type}`);
      }
    } else {
      // 处理 processModality({type: 'text', data: '...'}) 形式的调用
      modalityInput = input;
    }

    const cacheKey = this.getCacheKey(modalityInput);

    // 检查缓存
    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      this.emit('cache:hit', { modality: modalityInput.type });
      return this.cache.get(cacheKey)!;
    }

    const processor = this.processors.get(modalityInput.type);
    if (!processor) {
      throw new Error(`No processor found for modality: ${modalityInput.type}`);
    }

    this.emit('processing:started', { modality: modalityInput.type });

    const result = await processor.process(modalityInput);

    // 缓存结果
    if (this.config.enableCaching) {
      this.cacheResult(cacheKey, result);
    }

    this.emit('processing:completed', { modality: modalityInput.type, result });

    return result;
  }

  /**
   * 处理多个模态
   */
  async processMultiple(inputs: MultiModalInput[]): Promise<ProcessingResult[]> {
    if (this.config.enableParallelProcessing) {
      return Promise.all(inputs.map(input => this.processModality(input)));
    } else {
      const results: ProcessingResult[] = [];
      for (const input of inputs) {
        const result = await this.processModality(input);
        results.push(result);
      }
      return results;
    }
  }

  /**
   * 融合多模态结果
   */
  async fuse(results: ProcessingResult[]): Promise<any> {
    this.emit('fusion:started', { strategy: this.config.fusionStrategy });

    let fusedResult;

    switch (this.config.fusionStrategy) {
      case FusionStrategy.EARLY:
        fusedResult = await this.earlyFusion(results);
        break;
      case FusionStrategy.LATE:
        fusedResult = await this.lateFusion(results);
        break;
      case FusionStrategy.HYBRID:
        fusedResult = await this.hybridFusion(results);
        break;
    }

    this.emit('fusion:completed', { result: fusedResult });

    return fusedResult;
  }

  /**
   * 端到端处理
   */
  async processAndFuse(inputs: MultiModalInput[]): Promise<any> {
    const results = await this.processMultiple(inputs);
    return this.fuse(results);
  }

  /**
   * 处理文本
   */
  private async processText(input: TextInput): Promise<ProcessingResult> {
    // 模拟文本处理
    const embeddings = this.generateEmbeddings(input.content);

    return {
      modality: ModalityType.TEXT,
      type: ModalityType.TEXT,
      content: input.content,
      features: {
        length: input.content.length,
        words: input.content.split(/\s+/).length,
        language: input.language || 'en'
      },
      embeddings,
      confidence: 0.95
    };
  }

  /**
   * 处理图像
   */
  private async processImage(input: ImageInput): Promise<ProcessingResult> {
    // 模拟图像处理
    const embeddings = this.generateEmbeddings('image-features');

    return {
      modality: ModalityType.IMAGE,
      content: input.url || input.base64,
      features: {
        width: input.width || 0,
        height: input.height || 0,
        format: input.format || 'unknown',
        objects: ['person', 'car', 'building'], // 模拟对象检测
        colors: ['red', 'blue', 'green'] // 模拟颜色提取
      },
      embeddings,
      confidence: 0.88
    };
  }

  /**
   * 处理音频
   */
  private async processAudio(input: AudioInput): Promise<ProcessingResult> {
    // 模拟音频处理
    const embeddings = this.generateEmbeddings('audio-features');

    return {
      modality: ModalityType.AUDIO,
      content: input.url || input.base64,
      features: {
        duration: input.duration || 0,
        format: input.format || 'unknown',
        sampleRate: input.sampleRate || 44100,
        transcription: 'Hello, this is a test audio', // 模拟转录
        sentiment: 'positive' // 模拟情感分析
      },
      embeddings,
      confidence: 0.92
    };
  }

  /**
   * 处理视频
   */
  private async processVideo(input: VideoInput): Promise<ProcessingResult> {
    // 模拟视频处理
    const embeddings = this.generateEmbeddings('video-features');

    return {
      modality: ModalityType.VIDEO,
      content: input.url,
      features: {
        duration: input.duration || 0,
        width: input.width || 0,
        height: input.height || 0,
        fps: input.fps || 30,
        scenes: ['indoor', 'outdoor'], // 模拟场景识别
        actions: ['walking', 'talking'] // 模拟动作识别
      },
      embeddings,
      confidence: 0.85
    };
  }

  /**
   * 早期融合
   */
  private async earlyFusion(results: ProcessingResult[]): Promise<any> {
    // 在特征级别融合
    const allEmbeddings = results
      .filter(r => r.embeddings)
      .flatMap(r => r.embeddings!);

    const fusedEmbedding = this.averageEmbeddings(allEmbeddings);

    return {
      strategy: FusionStrategy.EARLY,
      embeddings: fusedEmbedding,
      modalities: results.map(r => r.modality),
      confidence: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
    };
  }

  /**
   * 晚期融合
   */
  private async lateFusion(results: ProcessingResult[]): Promise<any> {
    // 在决策级别融合
    return {
      strategy: FusionStrategy.LATE,
      results: results.map(r => ({
        modality: r.modality,
        features: r.features,
        confidence: r.confidence
      })),
      combinedConfidence: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
    };
  }

  /**
   * 混合融合
   */
  private async hybridFusion(results: ProcessingResult[]): Promise<any> {
    // 结合早期和晚期融合
    const early = await this.earlyFusion(results);
    const late = await this.lateFusion(results);

    return {
      strategy: FusionStrategy.HYBRID,
      earlyFusion: early,
      lateFusion: late,
      confidence: (early.confidence + late.combinedConfidence) / 2
    };
  }

  /**
   * 生成嵌入向量
   */
  private generateEmbeddings(_input: string): number[] {
    return Array.from({ length: 768 }, () => Math.random() * 2 - 1);
  }

  /**
   * 平均嵌入向量
   */
  private averageEmbeddings(embeddings: number[]): number[] {
    if (embeddings.length === 0) return [];

    const dim = 768;
    const result = new Array(dim).fill(0);

    for (let i = 0; i < embeddings.length; i++) {
      result[i % dim] += embeddings[i];
    }

    return result.map(val => val / Math.ceil(embeddings.length / dim));
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(input: MultiModalInput): string {
    return `${input.type}-${JSON.stringify(input).substring(0, 100)}`;
  }

  /**
   * 缓存结果
   */
  private cacheResult(key: string, result: ProcessingResult): void {
    if (this.cache.size >= this.config.maxCacheSize) {
      // 删除最旧的缓存项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, result);
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache:cleared');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? this.cacheHits / total : 0;
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate
    };
  }

  /**
   * 设置模态优先级
   */
  setModalityPriority(modality: ModalityType, priority: number): void {
    this.modalityPriorities.set(modality, priority);
    this.emit('priority:changed', { modality, priority });
  }

  /**
   * 获取模态优先级
   */
  getModalityPriority(modality: ModalityType): number {
    return this.modalityPriorities.get(modality) || 0;
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const item = this.processingQueue.shift()!;

      try {
        const result = await this.processModality(item.input);
        item.resolve(result);
      } catch (error) {
        item.reject(error as Error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(modality?: ModalityType): Record<string, any> {
    if (modality) {
      const metrics = this.performanceMetrics.get(modality) || [];
      return {
        modality,
        avgLatency: metrics.length > 0
          ? metrics.reduce((a, b) => a + b, 0) / metrics.length
          : 0,
        minLatency: metrics.length > 0 ? Math.min(...metrics) : 0,
        maxLatency: metrics.length > 0 ? Math.max(...metrics) : 0,
        count: metrics.length
      };
    }

    const result: Record<string, any> = {};
    for (const [m, metrics] of this.performanceMetrics) {
      result[m] = {
        avgLatency: metrics.length > 0
          ? metrics.reduce((a, b) => a + b, 0) / metrics.length
          : 0,
        minLatency: metrics.length > 0 ? Math.min(...metrics) : 0,
        maxLatency: metrics.length > 0 ? Math.max(...metrics) : 0,
        count: metrics.length
      };
    }
    return result;
  }

  /**
   * 批量处理模态
   */
  async batchProcess(
    inputs: Array<{ input: MultiModalInput; priority?: number }>
  ): Promise<ProcessingResult[]> {
    if (this.config.enableParallelProcessing) {
      return Promise.all(
        inputs.map(({ input }) =>
          this.processModality(input)
        )
      );
    } else {
      const results: ProcessingResult[] = [];
      for (const { input } of inputs) {
        const result = await this.processModality(input);
        results.push(result);
      }
      return results;
    }
  }

  /**
   * 取消处理
   */
  cancelProcessing(): void {
    this.processingQueue = [];
    this.isProcessing = false;
    this.emit('processing:cancelled');
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.performanceMetrics.clear();
    this.emit('stats:reset');
  }

  /**
   * 获取支持的模态
   */
  getSupportedModalities(): ModalityType[] {
    return Array.from(this.processors.keys());
  }

  /**
   * 检查模态是否支持
   */
  isModalitySupported(modality: ModalityType): boolean {
    return this.processors.has(modality);
  }

  /**
   * 预热缓存
   */
  async warmCache(inputs: MultiModalInput[]): Promise<void> {
    for (const input of inputs) {
      await this.processModality(input);
    }
    this.emit('cache:warmed', { count: inputs.length });
  }

  /**
   * 获取缓存键列表
   */
  getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache(maxAge: number = 3600000): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, result] of this.cache) {
      const age = now - (result.metadata?.timestamp || 0);
      if (age > maxAge) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    if (expiredKeys.length > 0) {
      this.emit('cache:cleaned', { count: expiredKeys.length });
    }
  }

  /**
   * 导出缓存
   */
  exportCache(): string {
    const cacheData: Record<string, ProcessingResult> = {};
    for (const [key, result] of this.cache) {
      cacheData[key] = result;
    }
    return JSON.stringify(cacheData, null, 2);
  }

  /**
   * 导入缓存
   */
  importCache(cacheData: string): void {
    const data: Record<string, ProcessingResult> = JSON.parse(cacheData);
    for (const [key, result] of Object.entries(data)) {
      this.cache.set(key, result);
    }
    this.emit('cache:imported', { count: Object.keys(data).length });
  }

  /**
   * 获取处理历史
   */
  getProcessingHistory(limit: number = 100): Array<{
    modality: ModalityType;
    timestamp: number;
    latency: number;
    success: boolean;
  }> {
    const allMetrics: Array<{ modality: ModalityType; latency: number }> = [];

    for (const [modality, metrics] of this.performanceMetrics) {
      for (const latency of metrics) {
        allMetrics.push({ modality, latency });
      }
    }

    allMetrics.sort((a, b) => b.latency - a.latency);

    return allMetrics.slice(0, limit).map(item => ({
      modality: item.modality,
      timestamp: Date.now(),
      latency: item.latency,
      success: true
    }));
  }

  /**
   * 优化性能
   */
  optimizePerformance(): void {
    const metrics = this.getPerformanceMetrics();

    for (const [modalityStr, data] of Object.entries(metrics)) {
      const modality = modalityStr as ModalityType;
      if (data.avgLatency > 1000) {
        this.setModalityPriority(modality, 10);
      } else if (data.avgLatency > 500) {
        this.setModalityPriority(modality, 5);
      } else {
        this.setModalityPriority(modality, 0);
      }
    }

    this.emit('performance:optimized', { metrics });
  }

  /**
   * 生成处理报告
   */
  generateReport(): string {
    const cacheStats = this.getCacheStats();
    const perfMetrics = this.getPerformanceMetrics();
    const supportedModalities = this.getSupportedModalities();

    return `
╔══════════════════════════════════════════════════════════════╗
║          MultiModal Processor Report                        ║
╚══════════════════════════════════════════════════════════════╝

=== 配置 ===
融合策略: ${this.config.fusionStrategy}
并行处理: ${this.config.enableParallelProcessing ? '启用' : '禁用'}
缓存: ${this.config.enableCaching ? '启用' : '禁用'}

=== 缓存统计 ===
缓存大小: ${cacheStats.size}/${cacheStats.maxSize}
命中率: ${(cacheStats.hitRate * 100).toFixed(2)}%
缓存命中: ${this.cacheHits}
缓存未命中: ${this.cacheMisses}

=== 性能指标 ===
${Object.entries(perfMetrics).map(([modality, data]) => `
${modality.toUpperCase()}:
  平均延迟: ${data.avgLatency.toFixed(2)}ms
  最小延迟: ${data.minLatency.toFixed(2)}ms
  最大延迟: ${data.maxLatency.toFixed(2)}ms
  处理次数: ${data.count}
`).join('')}

=== 支持的模态 ===
${supportedModalities.map(m => `✅ ${m.toUpperCase()}`).join('\n')}

=== 队列状态 ===
队列大小: ${this.processingQueue.length}
处理中: ${this.isProcessing ? '是' : '否'}

=== 模态优先级 ===
${Array.from(this.modalityPriorities.entries()).map(([modality, priority]) =>
  `${modality.toUpperCase()}: ${priority}`
).join('\n') || '无设置'}
    `.trim();
  }
}

/**
 * 创建多模态处理器
 */
export function createMultiModalProcessor(config?: MultiModalConfig): MultiModalProcessor {
  return new MultiModalProcessor(config);
}
