/**
 * @file 用户价值主张系统测试
 * @description 测试用户价值主张系统的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  UserValuePropositionSystem,
  UserValueProposition,
  UserFeedback,
  ValueOptimization,
  UserJourney
} from '../../../core/value/UserValuePropositionSystem';

describe('UserValuePropositionSystem', () => {
  let system: UserValuePropositionSystem;

  beforeEach(() => {
    system = new UserValuePropositionSystem();
  });

  afterEach(() => {
    system.destroy();
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化用户价值主张系统', () => {
      expect(system).toBeDefined();
      expect(system).toBeInstanceOf(UserValuePropositionSystem);
    });

    it('应该初始化默认价值主张', () => {
      const propositions = system.getPropositions();
      expect(propositions.length).toBeGreaterThan(0);
    });

    it('应该包含生产力提升价值主张', () => {
      const proposition = system.getProposition('productivity-boost');
      expect(proposition).toBeDefined();
      expect(proposition?.name).toBe('生产力提升');
    });

    it('应该包含成本降低价值主张', () => {
      const proposition = system.getProposition('cost-reduction');
      expect(proposition).toBeDefined();
      expect(proposition?.name).toBe('成本降低');
    });

    it('应该初始化用户细分', () => {
      const metrics = system.getMetrics();
      expect(metrics.activeSegments).toBeGreaterThan(0);
    });
  });

  describe('价值主张管理', () => {
    it('应该成功注册价值主张', () => {
      const proposition: UserValueProposition = {
        id: 'test-proposition',
        name: 'Test Proposition',
        description: 'Test value proposition',
        category: 'productivity',
        priority: 'high',
        metrics: {
          adoptionRate: 0,
          satisfactionScore: 0,
          retentionRate: 0,
          npsScore: 0,
          timeToValue: 0,
          roi: 0,
          usageFrequency: 0,
          featureUtilization: 0
        },
        targetAudience: ['测试用户'],
        benefits: ['测试收益'],
        painPoints: ['测试痛点'],
        solutions: ['测试方案'],
        differentiation: ['测试差异化']
      };

      system.registerProposition(proposition);

      const retrieved = system.getProposition('test-proposition');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-proposition');
    });

    it('应该成功更新价值主张', () => {
      const proposition = system.getProposition('productivity-boost');
      expect(proposition).toBeDefined();

      system.updateProposition('productivity-boost', {
        description: 'Updated description'
      });

      const updated = system.getProposition('productivity-boost');
      expect(updated?.description).toBe('Updated description');
    });

    it('应该在价值主张不存在时抛出错误', () => {
      expect(() => {
        system.updateProposition('nonexistent', { description: 'test' });
      }).toThrow('Proposition not found');
    });

    it('应该获取所有价值主张', () => {
      const propositions = system.getPropositions();
      expect(propositions.length).toBeGreaterThan(0);
    });

    it('应该按类别获取价值主张', () => {
      const productivityProps = system.getPropositionsByCategory('productivity');
      expect(productivityProps.length).toBeGreaterThan(0);
      expect(productivityProps.every(p => p.category === 'productivity')).toBe(true);
    });
  });

  describe('用户反馈管理', () => {
    it('应该成功添加反馈', () => {
      const feedback: UserFeedback = {
        id: 'feedback-1',
        userId: 'user-1',
        timestamp: new Date(),
        category: 'feature',
        rating: 5,
        sentiment: 'positive',
        feedback: 'Great feature!',
        tags: ['feature', 'positive']
      };

      system.addFeedback(feedback);

      const userFeedback = system.getFeedback('user-1');
      expect(userFeedback.length).toBe(1);
      expect(userFeedback[0].id).toBe('feedback-1');
    });

    it('应该获取所有反馈', () => {
      const feedback1: UserFeedback = {
        id: 'feedback-1',
        userId: 'user-1',
        timestamp: new Date(),
        category: 'feature',
        rating: 5,
        sentiment: 'positive',
        feedback: 'Great!',
        tags: []
      };

      const feedback2: UserFeedback = {
        id: 'feedback-2',
        userId: 'user-2',
        timestamp: new Date(),
        category: 'bug',
        rating: 2,
        sentiment: 'negative',
        feedback: 'Bug found',
        tags: []
      };

      system.addFeedback(feedback1);
      system.addFeedback(feedback2);

      const allFeedback = system.getFeedback();
      expect(allFeedback.length).toBe(2);
    });

    it('应该按类别获取反馈', () => {
      const feedback1: UserFeedback = {
        id: 'feedback-1',
        userId: 'user-1',
        timestamp: new Date(),
        category: 'feature',
        rating: 5,
        sentiment: 'positive',
        feedback: 'Great!',
        tags: []
      };

      const feedback2: UserFeedback = {
        id: 'feedback-2',
        userId: 'user-2',
        timestamp: new Date(),
        category: 'bug',
        rating: 2,
        sentiment: 'negative',
        feedback: 'Bug',
        tags: []
      };

      system.addFeedback(feedback1);
      system.addFeedback(feedback2);

      const featureFeedback = system.getFeedbackByCategory('feature');
      expect(featureFeedback.length).toBe(1);
      expect(featureFeedback[0].category).toBe('feature');
    });

    it('应该更新价值主张指标', () => {
      const proposition = system.getProposition('productivity-boost');
      const initialSatisfaction = proposition?.metrics.satisfactionScore || 0;

      const feedback: UserFeedback = {
        id: 'feedback-1',
        userId: 'user-1',
        timestamp: new Date(),
        category: 'feature',
        rating: 5,
        sentiment: 'positive',
        feedback: 'Great!',
        tags: []
      };

      system.addFeedback(feedback);

      const updatedProposition = system.getProposition('productivity-boost');
      expect(updatedProposition?.metrics.satisfactionScore).toBeGreaterThan(initialSatisfaction);
    });
  });

  describe('优化管理', () => {
    it('应该成功创建优化', () => {
      const optimization: ValueOptimization = {
        id: 'opt-1',
        propositionId: 'productivity-boost',
        type: 'enhancement',
        description: 'Enhance productivity features',
        expectedImpact: {
          adoptionRate: 0.1,
          satisfactionScore: 0.5,
          retentionRate: 0.1,
          npsScore: 10,
          timeToValue: -100,
          roi: 0.2,
          usageFrequency: 0.1,
          featureUtilization: 0.1
        },
        implementationCost: 30,
        priority: 8,
        status: 'proposed'
      };

      system.createOptimization(optimization);

      const retrieved = system.getOptimization('opt-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('opt-1');
    });

    it('应该获取所有优化', () => {
      const optimization: ValueOptimization = {
        id: 'opt-1',
        propositionId: 'productivity-boost',
        type: 'enhancement',
        description: 'Test optimization',
        expectedImpact: {
          adoptionRate: 0,
          satisfactionScore: 0,
          retentionRate: 0,
          npsScore: 0,
          timeToValue: 0,
          roi: 0,
          usageFrequency: 0,
          featureUtilization: 0
        },
        implementationCost: 50,
        priority: 5,
        status: 'proposed'
      };

      system.createOptimization(optimization);

      const optimizations = system.getOptimizations();
      expect(optimizations.length).toBe(1);
    });

    it('应该按状态获取优化', () => {
      const optimization1: ValueOptimization = {
        id: 'opt-1',
        propositionId: 'productivity-boost',
        type: 'enhancement',
        description: 'Test optimization 1',
        expectedImpact: {
          adoptionRate: 0,
          satisfactionScore: 0,
          retentionRate: 0,
          npsScore: 0,
          timeToValue: 0,
          roi: 0,
          usageFrequency: 0,
          featureUtilization: 0
        },
        implementationCost: 50,
        priority: 5,
        status: 'proposed'
      };

      const optimization2: ValueOptimization = {
        id: 'opt-2',
        propositionId: 'productivity-boost',
        type: 'enhancement',
        description: 'Test optimization 2',
        expectedImpact: {
          adoptionRate: 0,
          satisfactionScore: 0,
          retentionRate: 0,
          npsScore: 0,
          timeToValue: 0,
          roi: 0,
          usageFrequency: 0,
          featureUtilization: 0
        },
        implementationCost: 30,
        priority: 8,
        status: 'implemented'
      };

      system.createOptimization(optimization1);
      system.createOptimization(optimization2);

      const proposedOptimizations = system.getOptimizationsByStatus('proposed');
      expect(proposedOptimizations.length).toBe(1);
    });

    it('应该优先排序优化', () => {
      const optimization1: ValueOptimization = {
        id: 'opt-1',
        propositionId: 'productivity-boost',
        type: 'enhancement',
        description: 'Low priority',
        expectedImpact: {
          adoptionRate: 0,
          satisfactionScore: 0.2,
          retentionRate: 0,
          npsScore: 0,
          timeToValue: 0,
          roi: 0,
          usageFrequency: 0,
          featureUtilization: 0
        },
        implementationCost: 80,
        priority: 3,
        status: 'proposed'
      };

      const optimization2: ValueOptimization = {
        id: 'opt-2',
        propositionId: 'productivity-boost',
        type: 'enhancement',
        description: 'High priority',
        expectedImpact: {
          adoptionRate: 0,
          satisfactionScore: 0.8,
          retentionRate: 0,
          npsScore: 0,
          timeToValue: 0,
          roi: 0,
          usageFrequency: 0,
          featureUtilization: 0
        },
        implementationCost: 20,
        priority: 9,
        status: 'proposed'
      };

      system.createOptimization(optimization1);
      system.createOptimization(optimization2);

      const prioritized = system.prioritizeOptimizations();
      expect(prioritized[0].id).toBe('opt-2');
    });
  });

  describe('用户旅程管理', () => {
    it('应该成功创建用户旅程', () => {
      const journey: UserJourney = {
        id: 'journey-1',
        name: 'Onboarding Journey',
        stages: [
          {
            id: 'stage-1',
            name: 'Registration',
            description: 'User registration',
            duration: 120,
            satisfaction: 4.5,
            dropOffRate: 0.1
          }
        ],
        touchpoints: [
          {
            id: 'tp-1',
            name: 'Web App',
            type: 'web',
            satisfaction: 4.5,
            frequency: 50,
            impact: 'high'
          }
        ],
        painPoints: ['Complex registration'],
        opportunities: ['Simplify process'],
        metrics: {
          completionRate: 0.9,
          averageTime: 300,
          satisfaction: 4.5,
          conversionRate: 0.8
        }
      };

      system.createJourney(journey);

      const retrieved = system.getJourney('journey-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Onboarding Journey');
    });

    it('应该获取所有旅程', () => {
      const journey: UserJourney = {
        id: 'journey-1',
        name: 'Test Journey',
        stages: [],
        touchpoints: [],
        painPoints: [],
        opportunities: [],
        metrics: {
          completionRate: 0,
          averageTime: 0,
          satisfaction: 0,
          conversionRate: 0
        }
      };

      system.createJourney(journey);

      const journeys = system.getJourneys();
      expect(journeys.length).toBe(1);
    });

    it('应该分析用户旅程', () => {
      const journey: UserJourney = {
        id: 'journey-1',
        name: 'Onboarding Journey',
        stages: [
          {
            id: 'stage-1',
            name: 'Registration',
            description: 'User registration',
            duration: 120,
            satisfaction: 4.5,
            dropOffRate: 0.1
          },
          {
            id: 'stage-2',
            name: 'Setup',
            description: 'Initial setup',
            duration: 400,
            satisfaction: 2.5,
            dropOffRate: 0.5
          }
        ],
        touchpoints: [
          {
            id: 'tp-1',
            name: 'Web App',
            type: 'web',
            satisfaction: 4.5,
            frequency: 50,
            impact: 'high'
          }
        ],
        painPoints: [],
        opportunities: [],
        metrics: {
          completionRate: 0.5,
          averageTime: 520,
          satisfaction: 3.5,
          conversionRate: 0.4
        }
      };

      system.createJourney(journey);

      const analysis = system.analyzeJourney('journey-1');

      expect(analysis.journeyId).toBe('journey-1');
      expect(analysis.bottlenecks.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('应该在旅程不存在时抛出错误', () => {
      expect(() => {
        system.analyzeJourney('nonexistent');
      }).toThrow('Journey not found');
    });
  });

  describe('报告生成', () => {
    it('应该成功生成报告', () => {
      const period = {
        start: new Date('2026-01-01'),
        end: new Date('2026-01-31')
      };

      const report = system.generateReport(period);

      expect(report).toBeDefined();
      expect(report.period).toEqual(period);
      expect(report.propositions.size).toBeGreaterThan(0);
      expect(report.recommendations).toBeDefined();
    });

    it('应该获取报告', () => {
      const period = {
        start: new Date('2026-01-01'),
        end: new Date('2026-01-31')
      };

      const report = system.generateReport(period);
      const retrieved = system.getReport(report.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(report.id);
    });

    it('应该获取所有报告', () => {
      const period = {
        start: new Date('2026-01-01'),
        end: new Date('2026-01-31')
      };

      system.generateReport(period);

      const reports = system.getReports();
      expect(reports.length).toBe(1);
    });
  });

  describe('用户细分价值', () => {
    it('应该计算用户细分价值', () => {
      const segmentValue = system.calculateUserSegmentValue('enterprise');

      expect(segmentValue).toBeDefined();
      expect(segmentValue.segmentId).toBe('enterprise');
      expect(segmentValue.segmentName).toBe('企业用户');
      expect(segmentValue.relevantPropositions).toBeDefined();
    });

    it('应该获取所有细分价值', () => {
      const segmentValues = system.getAllSegmentValues();

      expect(segmentValues.length).toBeGreaterThan(0);
      expect(segmentValues.every(sv => sv.segmentId)).toBe(true);
    });

    it('应该在细分不存在时抛出错误', () => {
      expect(() => {
        system.calculateUserSegmentValue('nonexistent');
      }).toThrow('Segment not found');
    });
  });

  describe('系统指标', () => {
    it('应该返回系统指标', () => {
      const metrics = system.getMetrics();

      expect(metrics).toHaveProperty('totalPropositions');
      expect(metrics).toHaveProperty('totalFeedback');
      expect(metrics).toHaveProperty('totalOptimizations');
      expect(metrics).toHaveProperty('totalJourneys');
      expect(metrics).toHaveProperty('avgSatisfaction');
      expect(metrics).toHaveProperty('avgNPS');
      expect(metrics).toHaveProperty('activeSegments');
      expect(metrics).toHaveProperty('totalReports');
    });

    it('应该正确计算指标', () => {
      const metrics = system.getMetrics();

      expect(metrics.totalPropositions).toBeGreaterThan(0);
      expect(metrics.activeSegments).toBeGreaterThan(0);
    });
  });

  describe('事件系统', () => {
    it('应该在注册价值主张时发射事件', () => {
      const handler = vi.fn();
      system.on('proposition:registered', handler);

      const proposition: UserValueProposition = {
        id: 'test-proposition',
        name: 'Test',
        description: 'Test',
        category: 'productivity',
        priority: 'high',
        metrics: {
          adoptionRate: 0,
          satisfactionScore: 0,
          retentionRate: 0,
          npsScore: 0,
          timeToValue: 0,
          roi: 0,
          usageFrequency: 0,
          featureUtilization: 0
        },
        targetAudience: [],
        benefits: [],
        painPoints: [],
        solutions: [],
        differentiation: []
      };

      system.registerProposition(proposition);

      expect(handler).toHaveBeenCalledWith(proposition);
    });

    it('应该在添加反馈时发射事件', () => {
      const handler = vi.fn();
      system.on('feedback:added', handler);

      const feedback: UserFeedback = {
        id: 'feedback-1',
        userId: 'user-1',
        timestamp: new Date(),
        category: 'feature',
        rating: 5,
        sentiment: 'positive',
        feedback: 'Great!',
        tags: []
      };

      system.addFeedback(feedback);

      expect(handler).toHaveBeenCalledWith(feedback);
    });

    it('应该在创建优化时发射事件', () => {
      const handler = vi.fn();
      system.on('optimization:created', handler);

      const optimization: ValueOptimization = {
        id: 'opt-1',
        propositionId: 'productivity-boost',
        type: 'enhancement',
        description: 'Test',
        expectedImpact: {
          adoptionRate: 0,
          satisfactionScore: 0,
          retentionRate: 0,
          npsScore: 0,
          timeToValue: 0,
          roi: 0,
          usageFrequency: 0,
          featureUtilization: 0
        },
        implementationCost: 50,
        priority: 5,
        status: 'proposed'
      };

      system.createOptimization(optimization);

      expect(handler).toHaveBeenCalledWith(optimization);
    });
  });

  describe('销毁', () => {
    it('应该成功销毁系统', () => {
      expect(() => {
        system.destroy();
      }).not.toThrow();
    });

    it('应该清理所有资源', () => {
      system.destroy();

      const metrics = system.getMetrics();
      expect(metrics.totalPropositions).toBe(0);
      expect(metrics.activeSegments).toBe(0);
    });
  });
});
