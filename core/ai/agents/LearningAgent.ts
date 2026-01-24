/**
 * @file LearningAgent.ts
 * @description 学习Agent - 具备自主学习能力
 * @module core/ai/agents
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { BaseAgent } from '../BaseAgent'
import { AgentConfig } from '../AgentProtocol'

/**
 * 学习样本
 */
export interface LearningSample {
  id: string
  input: any
  output: any
  feedback?: number // -1 to 1
  timestamp: number
  metadata?: Record<string, any>
}

/**
 * 学习模式
 */
export enum LearningMode {
  SUPERVISED = 'supervised',
  UNSUPERVISED = 'unsupervised',
  REINFORCEMENT = 'reinforcement',
  TRANSFER = 'transfer',
  META = 'meta',
}

/**
 * 知识库条目
 */
export interface KnowledgeEntry {
  id: string
  concept: string
  description: string
  examples: any[]
  confidence: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 学习策略
 */
export interface LearningStrategy {
  mode: LearningMode
  learningRate: number
  batchSize: number
  epochs: number
  validationSplit: number
}

/**
 * 学习Agent配置
 */
export interface LearningAgentConfig {
  id?: string
  name?: string
  capabilities?: string[]
  type?: string
  config?: any
  learningStrategy?: Partial<LearningStrategy>
  maxKnowledgeEntries?: number
  enableAdaptiveLearning?: boolean
}

/**
 * 学习Agent
 */
export class LearningAgent extends BaseAgent {
  private samples: LearningSample[] = []
  private knowledgeBase: Map<string, KnowledgeEntry> = new Map()
  private strategy: LearningStrategy
  private maxKnowledgeEntries: number
  private enableAdaptiveLearning: boolean
  private learningMetrics = {
    totalSamples: 0,
    successfulLearning: 0,
    failedLearning: 0,
    avgConfidence: 0,
  }

  constructor(idOrConfig: string | LearningAgentConfig, legacyConfig?: LearningAgentConfig) {
    let finalConfig: LearningAgentConfig

    if (typeof idOrConfig === 'string') {
      // Legacy format: (id, config)
      finalConfig = {
        id: idOrConfig,
        name: idOrConfig,
        ...legacyConfig,
      }
    } else {
      // New format: (config)
      finalConfig = idOrConfig
    }

    const agentConfig: AgentConfig = {
      id: finalConfig.id || 'learning-agent',
      name: finalConfig.name || 'Learning Agent',
      description: `Learning Agent: ${finalConfig.name || 'Unnamed'}`,
      capabilities: (finalConfig.capabilities || []).map((capName: string) => ({
        name: capName,
        description: `Capability: ${capName}`,
        version: '1.0.0',
      })),
      policies: {
        maxConcurrentRequests: 5,
        rateLimit: 50,
        privacyLevel: 'high',
        dataRetention: 604800000,
      },
    }
    super(agentConfig)

    this.strategy = {
      mode: finalConfig.learningStrategy?.mode || LearningMode.REINFORCEMENT,
      learningRate: finalConfig.learningStrategy?.learningRate || 0.01,
      batchSize: finalConfig.learningStrategy?.batchSize || 32,
      epochs: finalConfig.learningStrategy?.epochs || 10,
      validationSplit: finalConfig.learningStrategy?.validationSplit || 0.2,
    }

    this.maxKnowledgeEntries = finalConfig.maxKnowledgeEntries || 1000
    this.enableAdaptiveLearning = finalConfig.enableAdaptiveLearning !== false
  }

  /**
   * 设置学习Agent的能力
   */
  protected setupCapabilities(): void {
    this.capabilities.set('learn', {
      name: 'learn',
      description: 'Machine learning capability',
      version: '1.0.0',
    })
    this.capabilities.set('knowledge', {
      name: 'knowledge',
      description: 'Knowledge base management',
      version: '1.0.0',
    })
    this.capabilities.set('adapt', {
      name: 'adapt',
      description: 'Adaptive learning capability',
      version: '1.0.0',
    })
  }

  /**
   * 设置学习Agent的命令处理器
   */
  protected setupCommandHandlers(): void {
    this.commandHandlers.set('add-sample', async params => {
      this.addSample(params.sample)
      return { success: true }
    })
    this.commandHandlers.set('learn', async params => {
      const result = await this.learn()
      return result
    })
    this.commandHandlers.set('query-knowledge', async params => {
      return this.queryKnowledge(params.concept)
    })
  }

  /**
   * 添加学习样本
   */
  addSample(sample: Omit<LearningSample, 'id' | 'timestamp'>): void {
    const fullSample: LearningSample = {
      id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...sample,
    }

    this.samples.push(fullSample)
    this.learningMetrics.totalSamples++

    this.emit('sample:added', { sample: fullSample })

    // 自动触发学习
    if (this.samples.length >= this.strategy.batchSize) {
      this.learn()
    }
  }

  /**
   * 学习
   */
  async learn(): Promise<void> {
    if (this.samples.length === 0) {
      return
    }

    this.emit('learning:started', { sampleCount: this.samples.length })

    try {
      switch (this.strategy.mode) {
        case LearningMode.SUPERVISED:
          await this.supervisedLearning()
          break
        case LearningMode.UNSUPERVISED:
          await this.unsupervisedLearning()
          break
        case LearningMode.REINFORCEMENT:
          await this.reinforcementLearning()
          break
        case LearningMode.TRANSFER:
          await this.transferLearning()
          break
        case LearningMode.META:
          await this.metaLearning()
          break
      }

      this.learningMetrics.successfulLearning++
      this.emit('learning:completed')
    } catch (error) {
      this.learningMetrics.failedLearning++
      this.emit('learning:error', { error })
    }
  }

  /**
   * 监督学习
   */
  private async supervisedLearning(): Promise<void> {
    const trainingSamples = this.samples.filter(s => s.output)

    for (const sample of trainingSamples) {
      const knowledge = await this.extractKnowledge(sample)
      this.updateKnowledgeBase(knowledge)
    }

    // 清空已处理的样本
    this.samples = []
  }

  /**
   * 非监督学习
   */
  private async unsupervisedLearning(): Promise<void> {
    // 聚类和模式识别
    const patterns = this.identifyPatterns(this.samples)

    for (const pattern of patterns) {
      const knowledge: KnowledgeEntry = {
        id: `knowledge-${Date.now()}`,
        concept: pattern.type,
        description: pattern.description,
        examples: pattern.samples,
        confidence: pattern.confidence,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      this.updateKnowledgeBase(knowledge)
    }

    this.samples = []
  }

  /**
   * 强化学习
   */
  private async reinforcementLearning(): Promise<void> {
    // 基于反馈更新策略
    const samplesWithFeedback = this.samples.filter(s => s.feedback !== undefined)

    for (const sample of samplesWithFeedback) {
      const reward = sample.feedback!

      // 更新策略
      if (reward > 0) {
        // 正反馈：强化当前行为
        const knowledge = await this.extractKnowledge(sample)
        knowledge.confidence = Math.min(
          1.0,
          knowledge.confidence + reward * this.strategy.learningRate
        )
        this.updateKnowledgeBase(knowledge)
      } else if (reward < 0) {
        // 负反馈：削弱当前行为
        const knowledge = await this.extractKnowledge(sample)
        knowledge.confidence = Math.max(
          0.0,
          knowledge.confidence + reward * this.strategy.learningRate
        )
        this.updateKnowledgeBase(knowledge)
      }
    }

    // 自适应调整学习率
    if (this.enableAdaptiveLearning) {
      this.adaptLearningRate()
    }

    this.samples = []
  }

  /**
   * 迁移学习
   */
  private async transferLearning(): Promise<void> {
    // 从已有知识迁移到新任务
    const existingKnowledge = Array.from(this.knowledgeBase.values())

    for (const sample of this.samples) {
      const similarKnowledge = this.findSimilarKnowledge(sample, existingKnowledge)

      if (similarKnowledge) {
        const newKnowledge = this.transferKnowledge(similarKnowledge, sample)
        this.updateKnowledgeBase(newKnowledge)
      } else {
        const knowledge = await this.extractKnowledge(sample)
        this.updateKnowledgeBase(knowledge)
      }
    }

    this.samples = []
  }

  /**
   * 元学习
   */
  private async metaLearning(): Promise<void> {
    // 学习如何学习
    const learningHistory = this.analyzeLearningHistory()

    // 优化学习策略
    if (learningHistory.avgSuccess < 0.7) {
      this.strategy.learningRate *= 0.9
    } else if (learningHistory.avgSuccess > 0.9) {
      this.strategy.learningRate *= 1.1
    }

    // 正常学习
    await this.reinforcementLearning()
  }

  /**
   * 提取知识
   */
  private async extractKnowledge(sample: LearningSample): Promise<KnowledgeEntry> {
    return {
      id: `knowledge-${Date.now()}`,
      concept: this.identifyConcept(sample),
      description: JSON.stringify(sample.input),
      examples: [sample.input],
      confidence: 0.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  /**
   * 识别概念
   */
  private identifyConcept(sample: LearningSample): string {
    // 简化版本：基于输入类型识别概念
    if (typeof sample.input === 'string') {
      return 'text_processing'
    } else if (Array.isArray(sample.input)) {
      return 'array_processing'
    } else if (typeof sample.input === 'object') {
      return 'object_processing'
    }
    return 'unknown'
  }

  /**
   * 识别模式
   */
  private identifyPatterns(samples: LearningSample[]): Array<{
    type: string
    description: string
    samples: any[]
    confidence: number
  }> {
    // 简化版本：基于频率识别模式
    const patterns: Map<string, any[]> = new Map()

    for (const sample of samples) {
      const concept = this.identifyConcept(sample)
      if (!patterns.has(concept)) {
        patterns.set(concept, [])
      }
      patterns.get(concept)!.push(sample.input)
    }

    return Array.from(patterns.entries()).map(([type, samples]) => ({
      type,
      description: `Pattern identified for ${type}`,
      samples,
      confidence: Math.min(1.0, samples.length / 10),
    }))
  }

  /**
   * 查找相似知识
   */
  private findSimilarKnowledge(
    sample: LearningSample,
    existingKnowledge: KnowledgeEntry[]
  ): KnowledgeEntry | undefined {
    const concept = this.identifyConcept(sample)

    return existingKnowledge.find(k => k.concept === concept)
  }

  /**
   * 迁移知识
   */
  private transferKnowledge(source: KnowledgeEntry, sample: LearningSample): KnowledgeEntry {
    return {
      id: `knowledge-${Date.now()}`,
      concept: source.concept,
      description: source.description,
      examples: [...source.examples, sample.input],
      confidence: (source.confidence + 0.5) / 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  /**
   * 更新知识库
   */
  private updateKnowledgeBase(knowledge: KnowledgeEntry): void {
    // 检查是否已存在
    const existing = Array.from(this.knowledgeBase.values()).find(
      k => k.concept === knowledge.concept
    )

    if (existing) {
      // 合并知识
      existing.examples.push(...knowledge.examples)
      existing.confidence = (existing.confidence + knowledge.confidence) / 2
      existing.updatedAt = new Date()
      this.knowledgeBase.set(existing.id, existing)
    } else {
      // 添加新知识
      if (this.knowledgeBase.size >= this.maxKnowledgeEntries) {
        // 删除置信度最低的知识
        const lowestConfidence = Array.from(this.knowledgeBase.values()).sort(
          (a, b) => a.confidence - b.confidence
        )[0]
        this.knowledgeBase.delete(lowestConfidence.id)
      }

      this.knowledgeBase.set(knowledge.id, knowledge)
    }

    // 更新平均置信度
    const totalConfidence = Array.from(this.knowledgeBase.values()).reduce(
      (sum, k) => sum + k.confidence,
      0
    )
    this.learningMetrics.avgConfidence = totalConfidence / this.knowledgeBase.size

    this.emit('knowledge:updated', { knowledge })
  }

  /**
   * 自适应调整学习率
   */
  private adaptLearningRate(): void {
    const recentSamples = this.samples.slice(-100)
    const avgFeedback =
      recentSamples.filter(s => s.feedback !== undefined).reduce((sum, s) => sum + s.feedback!, 0) /
      recentSamples.length

    if (avgFeedback > 0.5) {
      this.strategy.learningRate *= 1.05
    } else if (avgFeedback < -0.5) {
      this.strategy.learningRate *= 0.95
    }

    this.strategy.learningRate = Math.max(0.001, Math.min(0.1, this.strategy.learningRate))
  }

  /**
   * 分析学习历史
   */
  private analyzeLearningHistory(): { avgSuccess: number } {
    const successRate =
      this.learningMetrics.totalSamples > 0
        ? this.learningMetrics.successfulLearning / this.learningMetrics.totalSamples
        : 0

    return { avgSuccess: successRate }
  }

  /**
   * 查询知识
   */
  queryKnowledge(concept: string): KnowledgeEntry | undefined {
    return Array.from(this.knowledgeBase.values()).find(k => k.concept === concept)
  }

  /**
   * 获取所有知识
   */
  getAllKnowledge(): KnowledgeEntry[] {
    return Array.from(this.knowledgeBase.values()).sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 预测
   */
  async predict(input: any): Promise<{ output: any; confidence: number }> {
    const concept = this.identifyConcept({ input } as LearningSample)
    const knowledge = this.queryKnowledge(concept)

    if (!knowledge) {
      return { output: null, confidence: 0 }
    }

    // 基于知识生成预测
    return {
      output: knowledge.examples[0], // 简化版本
      confidence: knowledge.confidence,
    }
  }

  /**
   * 评估
   */
  async evaluate(testSamples: LearningSample[]): Promise<{
    accuracy: number
    avgConfidence: number
    predictions: Array<{ input: any; predicted: any; actual: any; correct: boolean }>
  }> {
    const predictions = []
    let correct = 0
    let totalConfidence = 0

    for (const sample of testSamples) {
      const prediction = await this.predict(sample.input)
      const isCorrect = JSON.stringify(prediction.output) === JSON.stringify(sample.output)

      if (isCorrect) correct++
      totalConfidence += prediction.confidence

      predictions.push({
        input: sample.input,
        predicted: prediction.output,
        actual: sample.output,
        correct: isCorrect,
      })
    }

    return {
      accuracy: correct / testSamples.length,
      avgConfidence: totalConfidence / testSamples.length,
      predictions,
    }
  }

  /**
   * 导出知识
   */
  exportKnowledge(): string {
    return JSON.stringify(Array.from(this.knowledgeBase.values()), null, 2)
  }

  /**
   * 导入知识
   */
  importKnowledge(knowledgeData: string): void {
    const knowledge: KnowledgeEntry[] = JSON.parse(knowledgeData)

    for (const entry of knowledge) {
      this.knowledgeBase.set(entry.id, entry)
    }

    this.emit('knowledge:imported', { count: knowledge.length })
  }

  /**
   * 生成学习报告
   */
  generateLearningReport(): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║            Learning Agent Report                            ║
╚══════════════════════════════════════════════════════════════╝

Agent: ${this.config.name || 'Unnamed Agent'}
ID: ${this.getId()}

=== 学习统计 ===
总样本数: ${this.learningMetrics.totalSamples}
成功学习: ${this.learningMetrics.successfulLearning}
失败学习: ${this.learningMetrics.failedLearning}
成功率: ${((this.learningMetrics.successfulLearning / Math.max(1, this.learningMetrics.totalSamples)) * 100).toFixed(2)}%

=== 知识库 ===
知识条目数: ${this.knowledgeBase.size}
平均置信度: ${this.learningMetrics.avgConfidence.toFixed(2)}

=== 学习策略 ===
模式: ${this.strategy.mode}
学习率: ${this.strategy.learningRate}
批次大小: ${this.strategy.batchSize}
自适应学习: ${this.enableAdaptiveLearning ? '启用' : '禁用'}

=== Top 5 知识条目 ===
${this.getAllKnowledge()
  .slice(0, 5)
  .map((k, i) => `${i + 1}. ${k.concept} (置信度: ${k.confidence.toFixed(2)})`)
  .join('\n')}
    `.trim()
  }
}

/**
 * 创建学习Agent
 */
export function createLearningAgent(config: LearningAgentConfig): LearningAgent {
  return new LearningAgent(config)
}
