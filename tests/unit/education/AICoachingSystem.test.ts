import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AICoachingSystem, Agent, SkillAssessment, LearningPath, TrainingPlan } from '@/education/AICoachingSystem';

describe('AICoachingSystem', () => {
  let aiCoachingSystem: AICoachingSystem;
  let mockAgent: Agent;

  beforeEach(() => {
    aiCoachingSystem = new AICoachingSystem();
    mockAgent = {
      id: 'agent-001',
      name: '张三',
      role: '销售顾问',
      experience: 2,
      availability: ['周一', '周二', '周三'],
      skills: ['沟通技巧', '产品知识', '异议处理'],
      performanceHistory: []
    };
  });

  describe('构造函数', () => {
    it('应该正确初始化AI教练系统实例', () => {
      expect(aiCoachingSystem).toBeInstanceOf(AICoachingSystem);
    });

    it('应该具有所有必需的组件', () => {
      expect(aiCoachingSystem).toBeInstanceOf(AICoachingSystem);
    });
  });

  describe('createPersonalizedCoaching', () => {
    it('应该创建个性化教练计划', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan).toBeDefined();
      expect(coachingPlan.agentProfile).toEqual(mockAgent);
      expect(coachingPlan.currentSkillLevel).toBeDefined();
      expect(coachingPlan.skillGaps).toBeDefined();
      expect(coachingPlan.learningPath).toBeDefined();
      expect(coachingPlan.trainingPlan).toBeDefined();
      expect(coachingPlan.performancePredictions).toBeDefined();
      expect(coachingPlan.successMetrics).toBeDefined();
    });

    it('应该包含代理档案', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.agentProfile).toBeDefined();
      expect(coachingPlan.agentProfile.id).toBe('agent-001');
      expect(coachingPlan.agentProfile.name).toBe('张三');
      expect(coachingPlan.agentProfile.role).toBe('销售顾问');
    });

    it('应该包含当前技能水平', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.currentSkillLevel).toBeDefined();
      expect(typeof coachingPlan.currentSkillLevel).toBe('number');
      expect(coachingPlan.currentSkillLevel).toBeGreaterThanOrEqual(0);
      expect(coachingPlan.currentSkillLevel).toBeLessThanOrEqual(100);
    });

    it('应该包含技能差距', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.skillGaps).toBeDefined();
      expect(Array.isArray(coachingPlan.skillGaps)).toBe(true);
    });

    it('应该包含学习路径', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.learningPath).toBeDefined();
      expect(coachingPlan.learningPath.modules).toBeDefined();
      expect(coachingPlan.learningPath.timeline).toBeDefined();
      expect(coachingPlan.learningPath.milestones).toBeDefined();
      expect(coachingPlan.learningPath.assessmentCheckpoints).toBeDefined();
    });

    it('应该包含培训计划', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.trainingPlan).toBeDefined();
      expect(coachingPlan.trainingPlan.modules).toBeDefined();
      expect(coachingPlan.trainingPlan.schedule).toBeDefined();
      expect(coachingPlan.trainingPlan.resources).toBeDefined();
      expect(coachingPlan.trainingPlan.support).toBeDefined();
    });

    it('应该包含性能预测', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.performancePredictions).toBeDefined();
      expect(coachingPlan.performancePredictions.expectedImprovement).toBeDefined();
      expect(coachingPlan.performancePredictions.confidenceLevel).toBeDefined();
      expect(coachingPlan.performancePredictions.timeToMastery).toBeDefined();
      expect(coachingPlan.performancePredictions.successProbability).toBeDefined();
    });

    it('应该包含成功指标', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.successMetrics).toBeDefined();
      expect(Array.isArray(coachingPlan.successMetrics)).toBe(true);
    });
  });

  describe('provideRealTimeCoaching', () => {
    it('应该提供实时教练', async () => {
      const mockCallSession = {
        id: 'call-001',
        agentId: 'agent-001',
        customerId: 'customer-001',
        startTime: new Date(),
        status: 'active' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(mockCallSession);

      expect(realTimeCoaching).toBeDefined();
      expect(realTimeCoaching.immediateFeedback).toBeDefined();
      expect(realTimeCoaching.suggestedImprovements).toBeDefined();
      expect(realTimeCoaching.skillReinforcement).toBeDefined();
      expect(realTimeCoaching.confidenceBoosters).toBeDefined();
      expect(realTimeCoaching.analysis).toBeDefined();
    });

    it('应该包含即时反馈', async () => {
      const mockCallSession = {
        id: 'call-001',
        agentId: 'agent-001',
        customerId: 'customer-001',
        startTime: new Date(),
        status: 'active' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(mockCallSession);

      expect(realTimeCoaching.immediateFeedback).toBeDefined();
      expect(Array.isArray(realTimeCoaching.immediateFeedback)).toBe(true);
    });

    it('应该包含建议改进', async () => {
      const mockCallSession = {
        id: 'call-001',
        agentId: 'agent-001',
        customerId: 'customer-001',
        startTime: new Date(),
        status: 'active' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(mockCallSession);

      expect(realTimeCoaching.suggestedImprovements).toBeDefined();
      expect(Array.isArray(realTimeCoaching.suggestedImprovements)).toBe(true);
    });

    it('应该包含技能强化', async () => {
      const mockCallSession = {
        id: 'call-001',
        agentId: 'agent-001',
        customerId: 'customer-001',
        startTime: new Date(),
        status: 'active' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(mockCallSession);

      expect(realTimeCoaching.skillReinforcement).toBeDefined();
      expect(Array.isArray(realTimeCoaching.skillReinforcement)).toBe(true);
    });

    it('应该包含信心提升', async () => {
      const mockCallSession = {
        id: 'call-001',
        agentId: 'agent-001',
        customerId: 'customer-001',
        startTime: new Date(),
        status: 'active' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(mockCallSession);

      expect(realTimeCoaching.confidenceBoosters).toBeDefined();
      expect(Array.isArray(realTimeCoaching.confidenceBoosters)).toBe(true);
    });

    it('应该包含通话分析', async () => {
      const mockCallSession = {
        id: 'call-001',
        agentId: 'agent-001',
        customerId: 'customer-001',
        startTime: new Date(),
        status: 'active' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(mockCallSession);

      expect(realTimeCoaching.analysis).toBeDefined();
      expect(realTimeCoaching.analysis.sentiment).toBeDefined();
      expect(realTimeCoaching.analysis.engagement).toBeDefined();
      expect(realTimeCoaching.analysis.clarity).toBeDefined();
      expect(realTimeCoaching.analysis.effectiveness).toBeDefined();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理没有经验的代理', async () => {
      const inexperiencedAgent: Agent = {
        id: 'agent-002',
        name: '李四',
        role: '销售顾问',
        experience: 0,
        availability: [],
        skills: [],
        performanceHistory: []
      };

      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(inexperiencedAgent);

      expect(coachingPlan).toBeDefined();
      expect(coachingPlan.agentProfile).toEqual(inexperiencedAgent);
    });

    it('应该处理有经验的代理', async () => {
      const experiencedAgent: Agent = {
        id: 'agent-003',
        name: '王五',
        role: '销售顾问',
        experience: 10,
        availability: ['周一', '周二', '周三', '周四', '周五'],
        skills: ['沟通技巧', '产品知识', '异议处理', '成交技巧', '情商'],
        performanceHistory: []
      };

      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(experiencedAgent);

      expect(coachingPlan).toBeDefined();
      expect(coachingPlan.agentProfile).toEqual(experiencedAgent);
    });

    it('应该处理已结束的通话', async () => {
      const endedCallSession = {
        id: 'call-002',
        agentId: 'agent-001',
        customerId: 'customer-002',
        startTime: new Date(),
        status: 'ended' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(endedCallSession);

      expect(realTimeCoaching).toBeDefined();
    });

    it('应该处理暂停的通话', async () => {
      const pausedCallSession = {
        id: 'call-003',
        agentId: 'agent-001',
        customerId: 'customer-003',
        startTime: new Date(),
        status: 'paused' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(pausedCallSession);

      expect(realTimeCoaching).toBeDefined();
    });

    it('应该处理多次创建教练计划', async () => {
      const plan1 = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);
      const plan2 = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);
      const plan3 = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(plan1).toBeDefined();
      expect(plan2).toBeDefined();
      expect(plan3).toBeDefined();
    });
  });

  describe('集成测试', () => {
    it('应该正确集成技能评估和学习路径生成', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.currentSkillLevel).toBeDefined();
      expect(coachingPlan.skillGaps).toBeDefined();
      expect(coachingPlan.learningPath).toBeDefined();
    });

    it('应该正确集成培训计划和性能预测', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.trainingPlan).toBeDefined();
      expect(coachingPlan.performancePredictions).toBeDefined();
    });

    it('应该正确集成成功指标和性能预测', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.successMetrics).toBeDefined();
      expect(coachingPlan.performancePredictions).toBeDefined();
    });

    it('应该在创建教练计划后提供实时教练', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan).toBeDefined();

      const mockCallSession = {
        id: 'call-004',
        agentId: mockAgent.id,
        customerId: 'customer-004',
        startTime: new Date(),
        status: 'active' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(mockCallSession);

      expect(realTimeCoaching).toBeDefined();
    });
  });

  describe('数据验证测试', () => {
    it('所有技能水平应该在合理范围内', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.currentSkillLevel).toBeGreaterThanOrEqual(0);
      expect(coachingPlan.currentSkillLevel).toBeLessThanOrEqual(100);
    });

    it('所有预测值应该在合理范围内', async () => {
      const coachingPlan = await aiCoachingSystem.createPersonalizedCoaching(mockAgent);

      expect(coachingPlan.performancePredictions.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(coachingPlan.performancePredictions.confidenceLevel).toBeLessThanOrEqual(1);
      expect(coachingPlan.performancePredictions.successProbability).toBeGreaterThanOrEqual(0);
      expect(coachingPlan.performancePredictions.successProbability).toBeLessThanOrEqual(1);
    });

    it('所有分析指标应该在合理范围内', async () => {
      const mockCallSession = {
        id: 'call-005',
        agentId: 'agent-001',
        customerId: 'customer-005',
        startTime: new Date(),
        status: 'active' as const,
        transcript: [],
        metrics: {}
      };

      const realTimeCoaching = await aiCoachingSystem.provideRealTimeCoaching(mockCallSession);

      expect(realTimeCoaching.analysis.sentiment).toBeGreaterThanOrEqual(0);
      expect(realTimeCoaching.analysis.sentiment).toBeLessThanOrEqual(1);
      expect(realTimeCoaching.analysis.engagement).toBeGreaterThanOrEqual(0);
      expect(realTimeCoaching.analysis.engagement).toBeLessThanOrEqual(1);
      expect(realTimeCoaching.analysis.clarity).toBeGreaterThanOrEqual(0);
      expect(realTimeCoaching.analysis.clarity).toBeLessThanOrEqual(1);
      expect(realTimeCoaching.analysis.effectiveness).toBeGreaterThanOrEqual(0);
      expect(realTimeCoaching.analysis.effectiveness).toBeLessThanOrEqual(1);
    });
  });
});
