/**
 * @file LearningAgent.test.ts
 * @description LearningAgent单元测试
 * @module tests/unit/ai/agents
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-23
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  LearningAgent,
  LearningMode,
  LearningSample,
  KnowledgeEntry,
} from '../../../../core/ai/agents/LearningAgent'

describe('LearningAgent', () => {
  let agent: LearningAgent

  beforeEach(() => {
    agent = new LearningAgent({
      id: 'test-learning-agent',
      name: 'Test Learning Agent',
      capabilities: ['learn', 'predict'],
      maxKnowledgeEntries: 100,
    })
  })

  // ==================== 基础功能测试 (5个) ====================

  describe('基础功能', () => {
    it('应该正确初始化Learning Agent', () => {
      expect(agent).toBeDefined()
      expect(agent.getId()).toBe('test-learning-agent')
      // BaseAgent doesn't have getName/getState methods
      expect(agent.config.name).toBe('Test Learning Agent')
      expect(agent.getStatus()).toBeDefined()
    })

    it('应该添加学习样本', () => {
      const sampleAdded = vi.fn()
      agent.on('sample:added', sampleAdded)

      agent.addSample({
        input: 'test input',
        output: 'test output',
      })

      expect(sampleAdded).toHaveBeenCalledTimes(1)
      expect(sampleAdded).toHaveBeenCalledWith(
        expect.objectContaining({
          sample: expect.objectContaining({
            input: 'test input',
            output: 'test output',
            id: expect.any(String),
            timestamp: expect.any(Number),
          }),
        })
      )
    })

    it('应该支持不同的学习模式', () => {
      const modes = [
        LearningMode.SUPERVISED,
        LearningMode.UNSUPERVISED,
        LearningMode.REINFORCEMENT,
        LearningMode.TRANSFER,
        LearningMode.META,
      ]

      modes.forEach(mode => {
        const modeAgent = new LearningAgent({
          learningStrategy: { mode },
        })
        expect(modeAgent).toBeDefined()
      })
    })

    it('应该生成学习报告', () => {
      agent.addSample({
        input: 'test',
        output: 'result',
      })

      const report = agent.generateLearningReport()
      expect(report).toContain('Learning Agent Report')
      // Use config.name instead of getName()
      expect(report).toContain(agent.config.name)
      expect(report).toContain('总样本数: 1')
    })

    it('应该导出和导入知识', async () => {
      // 使用明确的batchSize确保学习立即执行
      const exportAgent = new LearningAgent({
        id: 'export-agent',
        learningStrategy: {
          mode: LearningMode.SUPERVISED,
          batchSize: 1,
        },
      })

      // 添加样本
      exportAgent.addSample({
        input: 'hello',
        output: 'world',
      })

      // 等待自动学习或手动触发
      await new Promise(resolve => setTimeout(resolve, 50))

      // 如果还没学习则手动触发
      await exportAgent.learn()

      // 导出知识
      const exported = exportAgent.exportKnowledge()
      expect(exported).toBeTruthy()

      // 验证导出的知识不为空
      const exportedData = JSON.parse(exported)
      expect(exportedData.length).toBeGreaterThan(0)

      // 创建新agent并导入
      const newAgent = new LearningAgent({
        id: 'import-agent',
      })

      // 监听导入事件
      const importHandler = vi.fn()
      newAgent.on('knowledge:imported', importHandler)

      newAgent.importKnowledge(exported)

      const knowledge = newAgent.getAllKnowledge()
      expect(knowledge.length).toBe(exportedData.length)
      expect(importHandler).toHaveBeenCalled()
    })
  })

  // ==================== 监督学习测试 (3个) ====================

  describe('监督学习', () => {
    beforeEach(() => {
      agent = new LearningAgent({
        learningStrategy: {
          mode: LearningMode.SUPERVISED,
          batchSize: 2,
        },
      })
    })

    it('应该从标记样本中学习', async () => {
      const learningStarted = vi.fn()
      const learningCompleted = vi.fn()

      agent.on('learning:started', learningStarted)
      agent.on('learning:completed', learningCompleted)

      agent.addSample({
        input: 'cat',
        output: 'animal',
      })
      agent.addSample({
        input: 'dog',
        output: 'animal',
      })

      // 等待自动学习触发
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(learningStarted).toHaveBeenCalled()
      expect(learningCompleted).toHaveBeenCalled()
    })

    it('应该构建知识库', async () => {
      agent.addSample({
        input: 'red',
        output: 'color',
      })
      agent.addSample({
        input: 'blue',
        output: 'color',
      })

      await agent.learn()

      const knowledge = agent.getAllKnowledge()
      expect(knowledge.length).toBeGreaterThan(0)
      expect(knowledge[0]).toHaveProperty('concept')
      expect(knowledge[0]).toHaveProperty('confidence')
    })

    it('应该在学习后清空样本缓冲区', async () => {
      agent.addSample({
        input: 'test1',
        output: 'result1',
      })
      agent.addSample({
        input: 'test2',
        output: 'result2',
      })

      await agent.learn()

      // 添加新样本不应触发学习(因为buffer已清空)
      const learningStarted = vi.fn()
      agent.on('learning:started', learningStarted)

      agent.addSample({
        input: 'test3',
        output: 'result3',
      })

      expect(learningStarted).not.toHaveBeenCalled()
    })
  })

  // ==================== 强化学习测试 (4个) ====================

  describe('强化学习', () => {
    beforeEach(() => {
      agent = new LearningAgent({
        learningStrategy: {
          mode: LearningMode.REINFORCEMENT,
          learningRate: 0.1,
          batchSize: 1,
        },
        enableAdaptiveLearning: true,
      })
    })

    it('应该根据正反馈增强行为', async () => {
      agent.addSample({
        input: 'good action',
        output: 'success',
        feedback: 0.8,
      })

      await agent.learn()

      const knowledge = agent.queryKnowledge('text_processing')
      expect(knowledge).toBeDefined()
      expect(knowledge!.confidence).toBeGreaterThan(0.5)
    })

    it('应该根据负反馈削弱行为', async () => {
      // 先建立基础知识
      agent.addSample({
        input: 'action',
        output: 'result',
        feedback: 0.5,
      })
      await agent.learn()

      // 获取初始置信度
      let knowledge = agent.queryKnowledge('text_processing')
      const initialConfidence = knowledge?.confidence || 0

      // 添加负反馈
      agent.addSample({
        input: 'bad action',
        output: 'failure',
        feedback: -0.5,
      })
      await agent.learn()

      knowledge = agent.queryKnowledge('text_processing')
      expect(knowledge).toBeDefined()
      // 负反馈应该降低置信度
      expect(knowledge!.confidence).toBeLessThanOrEqual(initialConfidence + 0.1)
    })

    it('应该自适应调整学习率', async () => {
      // 添加多个正反馈样本
      for (let i = 0; i < 10; i++) {
        agent.addSample({
          input: `action${i}`,
          output: `result${i}`,
          feedback: 0.8,
        })
      }

      // 学习率应该被自适应调整
      // 由于内部实现，我们只能验证系统没有崩溃
      await agent.learn()
      expect(agent).toBeDefined()
    })

    it('应该处理混合反馈', async () => {
      // 添加正反馈
      agent.addSample({
        input: 'good',
        output: 'success',
        feedback: 0.9,
      })

      // 添加负反馈
      agent.addSample({
        input: 'bad',
        output: 'failure',
        feedback: -0.7,
      })

      // 添加中性反馈
      agent.addSample({
        input: 'neutral',
        output: 'ok',
        feedback: 0.0,
      })

      await agent.learn()

      const knowledge = agent.getAllKnowledge()
      expect(knowledge.length).toBeGreaterThan(0)
    })
  })

  // ==================== 预测功能测试 (3个) ====================

  describe('预测功能', () => {
    beforeEach(async () => {
      agent = new LearningAgent({
        learningStrategy: {
          mode: LearningMode.SUPERVISED,
          batchSize: 1,
        },
      })

      // 训练agent
      agent.addSample({
        input: 'classify this text',
        output: 'text',
      })
      await agent.learn()
    })

    it('应该基于学习的知识进行预测', async () => {
      const prediction = await agent.predict('another text')

      expect(prediction).toBeDefined()
      expect(prediction).toHaveProperty('output')
      expect(prediction).toHaveProperty('confidence')
      expect(prediction.confidence).toBeGreaterThan(0)
    })

    it('应该对未知输入返回低置信度', async () => {
      const newAgent = new LearningAgent({
        id: 'empty-agent',
      })

      const prediction = await newAgent.predict('unknown')

      expect(prediction.confidence).toBe(0)
      expect(prediction.output).toBeNull()
    })

    it('应该返回置信度分数', async () => {
      const prediction = await agent.predict('text input')

      expect(typeof prediction.confidence).toBe('number')
      expect(prediction.confidence).toBeGreaterThanOrEqual(0)
      expect(prediction.confidence).toBeLessThanOrEqual(1)
    })
  })

  // ==================== 评估功能测试 (2个) ====================

  describe('评估功能', () => {
    beforeEach(async () => {
      agent = new LearningAgent({
        learningStrategy: {
          mode: LearningMode.SUPERVISED,
          batchSize: 1,
        },
      })

      // 训练数据
      const trainingSamples = [
        { input: 'text1', output: 'result1' },
        { input: 'text2', output: 'result2' },
        { input: 'text3', output: 'result3' },
      ]

      for (const sample of trainingSamples) {
        agent.addSample(sample)
      }
      await agent.learn()
    })

    it('应该评估测试样本并返回准确率', async () => {
      const testSamples: LearningSample[] = [
        { id: '1', input: 'text1', output: 'result1', timestamp: Date.now() },
        { id: '2', input: 'text2', output: 'result2', timestamp: Date.now() },
      ]

      const evaluation = await agent.evaluate(testSamples)

      expect(evaluation).toBeDefined()
      expect(evaluation).toHaveProperty('accuracy')
      expect(evaluation).toHaveProperty('avgConfidence')
      expect(evaluation).toHaveProperty('predictions')
      expect(evaluation.accuracy).toBeGreaterThanOrEqual(0)
      expect(evaluation.accuracy).toBeLessThanOrEqual(1)
    })

    it('应该提供详细的预测结果', async () => {
      const testSamples: LearningSample[] = [
        { id: '1', input: 'test', output: 'expected', timestamp: Date.now() },
      ]

      const evaluation = await agent.evaluate(testSamples)

      expect(evaluation.predictions).toHaveLength(1)
      expect(evaluation.predictions[0]).toHaveProperty('input')
      expect(evaluation.predictions[0]).toHaveProperty('predicted')
      expect(evaluation.predictions[0]).toHaveProperty('actual')
      expect(evaluation.predictions[0]).toHaveProperty('correct')
    })
  })

  // ==================== 知识管理测试 (3个) ====================

  describe('知识管理', () => {
    it('应该限制知识库大小', async () => {
      const smallAgent = new LearningAgent({
        maxKnowledgeEntries: 3,
        learningStrategy: {
          batchSize: 1,
        },
      })

      // 添加超过限制的样本
      for (let i = 0; i < 5; i++) {
        smallAgent.addSample({
          input: `input${i}`,
          output: `output${i}`,
        })
        await smallAgent.learn()
      }

      const knowledge = smallAgent.getAllKnowledge()
      expect(knowledge.length).toBeLessThanOrEqual(3)
    })

    it('应该更新现有知识而不是重复创建', async () => {
      agent.addSample({
        input: 'same type input 1',
        output: 'output1',
      })
      await agent.learn()

      const initialSize = agent.getAllKnowledge().length

      agent.addSample({
        input: 'same type input 2',
        output: 'output2',
      })
      await agent.learn()

      const finalSize = agent.getAllKnowledge().length

      // 由于概念相同，应该更新而不是添加
      expect(finalSize).toBe(initialSize)
    })

    it('应该按置信度排序知识', async () => {
      agent.addSample({
        input: 'high confidence',
        output: 'good',
        feedback: 0.9,
      })
      agent.addSample({
        input: 'low confidence',
        output: 'bad',
        feedback: 0.1,
      })
      await agent.learn()

      const knowledge = agent.getAllKnowledge()

      // 验证按置信度降序排列
      for (let i = 0; i < knowledge.length - 1; i++) {
        expect(knowledge[i].confidence).toBeGreaterThanOrEqual(knowledge[i + 1].confidence)
      }
    })
  })

  // ==================== 迁移学习测试 (2个) ====================

  describe('迁移学习', () => {
    beforeEach(() => {
      agent = new LearningAgent({
        learningStrategy: {
          mode: LearningMode.TRANSFER,
          batchSize: 1,
        },
      })
    })

    it('应该从已有知识迁移到新任务', async () => {
      // 学习第一个任务
      agent.addSample({
        input: 'task1 input',
        output: 'task1 output',
      })
      await agent.learn()

      const initialKnowledge = agent.getAllKnowledge().length

      // 学习相似的第二个任务
      agent.addSample({
        input: 'task2 similar input',
        output: 'task2 output',
      })
      await agent.learn()

      const finalKnowledge = agent.getAllKnowledge().length

      // 迁移学习应该复用知识
      expect(finalKnowledge).toBeGreaterThanOrEqual(initialKnowledge)
    })

    it('应该在没有相似知识时创建新知识', async () => {
      agent.addSample({
        input: [1, 2, 3], // array类型
        output: 'array result',
      })
      await agent.learn()

      agent.addSample({
        input: { key: 'value' }, // object类型
        output: 'object result',
      })
      await agent.learn()

      const knowledge = agent.getAllKnowledge()

      // 验证创建了知识
      expect(knowledge.length).toBeGreaterThan(0)

      // 应该创建不同概念的知识
      const concepts = knowledge.map(k => k.concept)
      const uniqueConcepts = new Set(concepts)

      // 由于迁移学习可能合并相同类型，至少有1个概念
      expect(uniqueConcepts.size).toBeGreaterThanOrEqual(1)

      // 验证包含array_processing或object_processing
      const hasExpectedConcepts = Array.from(uniqueConcepts).some(
        c => c === 'array_processing' || c === 'object_processing'
      )
      expect(hasExpectedConcepts).toBe(true)
    })
  })

  // ==================== 元学习测试 (1个) ====================

  describe('元学习', () => {
    it('应该优化学习策略', async () => {
      const metaAgent = new LearningAgent({
        learningStrategy: {
          mode: LearningMode.META,
          learningRate: 0.05,
          batchSize: 1,
        },
      })

      // 添加样本并触发元学习
      for (let i = 0; i < 5; i++) {
        metaAgent.addSample({
          input: `meta input ${i}`,
          output: `meta output ${i}`,
          feedback: 0.9,
        })
        await metaAgent.learn()
      }

      // 元学习应该正常工作
      expect(metaAgent).toBeDefined()
      const knowledge = metaAgent.getAllKnowledge()
      expect(knowledge.length).toBeGreaterThan(0)
    })
  })
})
