/**
 * @file 用户价值主张系统
 * @description 提供全面的用户价值主张管理和优化功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { EventEmitter } from 'eventemitter3';

export interface UserValueProposition {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'efficiency' | 'innovation' | 'cost-saving' | 'quality' | 'experience';
  priority: 'high' | 'medium' | 'low';
  metrics: ValueMetrics;
  targetAudience: string[];
  benefits: string[];
  painPoints: string[];
  solutions: string[];
  differentiation: string[];
}

export interface ValueMetrics {
  adoptionRate: number;
  satisfactionScore: number;
  retentionRate: number;
  npsScore: number;
  timeToValue: number;
  roi: number;
  usageFrequency: number;
  featureUtilization: number;
}

export interface UserFeedback {
  id: string;
  userId: string;
  timestamp: Date;
  category: 'feature' | 'bug' | 'improvement' | 'general';
  rating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  feedback: string;
  tags: string[];
  context?: Record<string, any>;
}

export interface ValueOptimization {
  id: string;
  propositionId: string;
  type: 'enhancement' | 'new-feature' | 'removal' | 'modification';
  description: string;
  expectedImpact: ValueMetrics;
  implementationCost: number;
  priority: number;
  status: 'proposed' | 'in-progress' | 'implemented' | 'rejected';
}

export interface UserJourney {
  id: string;
  name: string;
  stages: JourneyStage[];
  touchpoints: Touchpoint[];
  painPoints: string[];
  opportunities: string[];
  metrics: JourneyMetrics;
}

export interface JourneyStage {
  id: string;
  name: string;
  description: string;
  duration: number;
  satisfaction: number;
  dropOffRate: number;
}

export interface Touchpoint {
  id: string;
  name: string;
  type: 'web' | 'mobile' | 'api' | 'support' | 'documentation';
  satisfaction: number;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
}

export interface JourneyMetrics {
  completionRate: number;
  averageTime: number;
  satisfaction: number;
  conversionRate: number;
}

export interface ValueReport {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  propositions: Map<string, ValueMetrics>;
  totalValue: number;
  growthRate: number;
  topPerformers: string[];
  improvementAreas: string[];
  recommendations: string[];
}

export class UserValuePropositionSystem extends EventEmitter {
  private propositions: Map<string, UserValueProposition> = new Map();
  private feedback: Map<string, UserFeedback[]> = new Map();
  private optimizations: Map<string, ValueOptimization> = new Map();
  private journeys: Map<string, UserJourney> = new Map();
  private reports: Map<string, ValueReport> = new Map();
  private userSegments: Map<string, UserSegment> = new Map();

  constructor() {
    super();
    this.initializeDefaultPropositions();
    this.initializeUserSegments();
  }

  private initializeDefaultPropositions(): void {
    const defaultPropositions: UserValueProposition[] = [
      {
        id: 'productivity-boost',
        name: '生产力提升',
        description: '通过智能AI助手提升用户工作效率',
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
        targetAudience: ['知识工作者', '开发者', '分析师', '管理者'],
        benefits: [
          '自动化重复性任务',
          '智能内容生成',
          '快速信息检索',
          '多语言支持',
          '实时协作'
        ],
        painPoints: [
          '信息过载',
          '重复性工作',
          '沟通效率低',
          '知识管理困难',
          '跨语言障碍'
        ],
        solutions: [
          'AI驱动的自动化',
          '智能搜索和推荐',
          '自然语言交互',
          '多模态输入输出',
          '实时翻译'
        ],
        differentiation: [
          '行业领先的AI模型',
          '高度可定制的界面',
          '无缝集成能力',
          '企业级安全保障',
          '持续学习能力'
        ]
      },
      {
        id: 'cost-reduction',
        name: '成本降低',
        description: '通过自动化和优化降低运营成本',
        category: 'cost-saving',
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
        targetAudience: ['中小企业', '初创公司', '自由职业者'],
        benefits: [
          '减少人力成本',
          '降低培训成本',
          '优化资源利用',
          '减少错误成本',
          '提高投资回报'
        ],
        painPoints: [
          '高昂的人力成本',
          '培训周期长',
          '资源浪费',
          '错误率高',
          'ROI不明确'
        ],
        solutions: [
          '自动化工作流程',
          '智能培训系统',
          '资源优化算法',
          '错误检测和预防',
          'ROI分析工具'
        ],
        differentiation: [
          '快速部署',
          '按需付费',
          '透明定价',
          '灵活扩展',
          '详细分析报告'
        ]
      },
      {
        id: 'innovation-enablement',
        name: '创新赋能',
        description: '提供AI能力支持用户创新',
        category: 'innovation',
        priority: 'medium',
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
        targetAudience: ['创新团队', '产品经理', '设计师', '研究人员'],
        benefits: [
          '快速原型开发',
          '创意生成辅助',
          '趋势分析',
          '用户洞察',
          'A/B测试支持'
        ],
        painPoints: [
          '创意瓶颈',
          '开发周期长',
          '市场不确定性',
          '用户反馈收集困难',
          '测试成本高'
        ],
        solutions: [
          'AI辅助设计',
          '快速原型工具',
          '市场趋势分析',
          '用户反馈分析',
          '自动化测试'
        ],
        differentiation: [
          '多模态AI能力',
          '实时协作',
          '版本控制集成',
          '设计系统支持',
          '分析可视化'
        ]
      },
      {
        id: 'quality-improvement',
        name: '质量提升',
        description: '通过AI提升工作质量和准确性',
        category: 'quality',
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
        targetAudience: ['质量控制团队', '内容创作者', '数据分析师', '合规部门'],
        benefits: [
          '提高准确性',
          '减少错误',
          '标准化输出',
          '自动化检查',
          '持续改进'
        ],
        painPoints: [
          '人为错误',
          '质量不一致',
          '检查耗时',
          '标准难以执行',
          '改进缓慢'
        ],
        solutions: [
          'AI质量检查',
          '自动化验证',
          '标准化模板',
          '实时监控',
          '持续学习'
        ],
        differentiation: [
          '高精度AI模型',
          '可配置规则',
          '审计追踪',
          '合规支持',
          '详细报告'
        ]
      },
      {
        id: 'experience-enhancement',
        name: '体验优化',
        description: '提供卓越的用户体验',
        category: 'experience',
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
        targetAudience: ['所有用户'],
        benefits: [
          '直观的界面',
          '快速响应',
          '个性化体验',
          '无缝集成',
          '多设备支持'
        ],
        painPoints: [
          '学习曲线陡峭',
          '响应速度慢',
          '缺乏个性化',
          '集成困难',
          '设备限制'
        ],
        solutions: [
          '简洁的UI设计',
          '性能优化',
          'AI个性化',
          '开放API',
          '响应式设计'
        ],
        differentiation: [
          '自适应界面',
          '智能推荐',
          '上下文感知',
          '流畅动画',
          '无障碍支持'
        ]
      }
    ];

    defaultPropositions.forEach(proposition => {
      this.propositions.set(proposition.id, proposition);
    });
  }

  private initializeUserSegments(): void {
    const segments: UserSegment[] = [
      {
        id: 'enterprise',
        name: '企业用户',
        size: 0,
        characteristics: ['大规模部署', '安全要求高', '需要集成', '预算充足'],
        valueDrivers: ['效率', '安全', '可扩展性', '合规'],
        painPoints: ['部署复杂', '安全风险', '集成困难', '成本控制'],
        preferredChannels: ['api', 'enterprise-support', 'documentation']
      },
      {
        id: 'sme',
        name: '中小企业',
        size: 0,
        characteristics: ['预算有限', '快速部署', '易用性重要', '需要ROI'],
        valueDrivers: ['成本效益', '快速上手', '自动化', '灵活性'],
        painPoints: ['资源有限', '技术能力不足', '成本压力', '竞争激烈'],
        preferredChannels: ['web', 'email', 'chat-support']
      },
      {
        id: 'developer',
        name: '开发者',
        size: 0,
        characteristics: ['技术背景', '需要API', '自定义要求', '社区支持'],
        valueDrivers: ['性能', '文档', 'API质量', '灵活性'],
        painPoints: ['文档不完整', 'API限制', '调试困难', '学习成本'],
        preferredChannels: ['api', 'documentation', 'github', 'community']
      },
      {
        id: 'business-user',
        name: '业务用户',
        size: 0,
        characteristics: ['非技术背景', '关注结果', '需要培训', '移动使用'],
        valueDrivers: ['易用性', '效果', '速度', '可靠性'],
        painPoints: ['技术门槛', '学习困难', '效果不确定', '时间压力'],
        preferredChannels: ['mobile', 'web', 'video-tutorial', 'support']
      }
    ];

    segments.forEach(segment => {
      this.userSegments.set(segment.id, segment);
    });
  }

  registerProposition(proposition: UserValueProposition): void {
    this.propositions.set(proposition.id, proposition);
    this.emit('proposition:registered', proposition);
  }

  updateProposition(id: string, updates: Partial<UserValueProposition>): void {
    const proposition = this.propositions.get(id);
    if (!proposition) {
      throw new Error(`Proposition not found: ${id}`);
    }

    Object.assign(proposition, updates);
    this.emit('proposition:updated', { id, updates });
  }

  getProposition(id: string): UserValueProposition | undefined {
    return this.propositions.get(id);
  }

  getPropositions(): UserValueProposition[] {
    return Array.from(this.propositions.values());
  }

  getPropositionsByCategory(category: UserValueProposition['category']): UserValueProposition[] {
    return Array.from(this.propositions.values()).filter(
      prop => prop.category === category
    );
  }

  addFeedback(feedback: UserFeedback): void {
    if (!this.feedback.has(feedback.userId)) {
      this.feedback.set(feedback.userId, []);
    }

    this.feedback.get(feedback.userId)!.push(feedback);
    this.emit('feedback:added', feedback);
    this.updatePropositionMetrics(feedback);
  }

  getFeedback(userId?: string): UserFeedback[] {
    if (userId) {
      return this.feedback.get(userId) || [];
    }

    return Array.from(this.feedback.values()).flat();
  }

  getFeedbackByCategory(category: UserFeedback['category']): UserFeedback[] {
    return Array.from(this.feedback.values())
      .flat()
      .filter(fb => fb.category === category);
  }

  private updatePropositionMetrics(feedback: UserFeedback): void {
    this.propositions.forEach(proposition => {
      const relevantFeedback = Array.from(this.feedback.values())
        .flat()
        .filter(fb => fb.rating >= 4);

      if (relevantFeedback.length > 0) {
        proposition.metrics.satisfactionScore = relevantFeedback.reduce(
          (sum, fb) => sum + fb.rating,
          0
        ) / relevantFeedback.length;

        const promoters = relevantFeedback.filter(fb => fb.rating >= 9).length;
        const detractors = relevantFeedback.filter(fb => fb.rating <= 6).length;
        const total = relevantFeedback.length;

        proposition.metrics.npsScore = ((promoters - detractors) / total) * 100;
      }
    });
  }

  createOptimization(optimization: ValueOptimization): void {
    this.optimizations.set(optimization.id, optimization);
    this.emit('optimization:created', optimization);
  }

  getOptimization(id: string): ValueOptimization | undefined {
    return this.optimizations.get(id);
  }

  getOptimizations(): ValueOptimization[] {
    return Array.from(this.optimizations.values());
  }

  getOptimizationsByStatus(status: ValueOptimization['status']): ValueOptimization[] {
    return Array.from(this.optimizations.values()).filter(
      opt => opt.status === status
    );
  }

  prioritizeOptimizations(): ValueOptimization[] {
    return Array.from(this.optimizations.values())
      .filter(opt => opt.status === 'proposed')
      .sort((a, b) => {
        const scoreA = this.calculateOptimizationScore(a);
        const scoreB = this.calculateOptimizationScore(b);
        return scoreB - scoreA;
      });
  }

  private calculateOptimizationScore(optimization: ValueOptimization): number {
    const impactScore = optimization.expectedImpact.satisfactionScore * 0.4;
    const costScore = (1 - optimization.implementationCost / 100) * 0.3;
    const priorityScore = optimization.priority * 0.3;

    return impactScore + costScore + priorityScore;
  }

  createJourney(journey: UserJourney): void {
    this.journeys.set(journey.id, journey);
    this.emit('journey:created', journey);
  }

  getJourney(id: string): UserJourney | undefined {
    return this.journeys.get(id);
  }

  getJourneys(): UserJourney[] {
    return Array.from(this.journeys.values());
  }

  analyzeJourney(journeyId: string): JourneyAnalysis {
    const journey = this.journeys.get(journeyId);
    if (!journey) {
      throw new Error(`Journey not found: ${journeyId}`);
    }

    const analysis: JourneyAnalysis = {
      journeyId,
      overallSatisfaction: journey.metrics.satisfaction,
      completionRate: journey.metrics.completionRate,
      averageTime: journey.metrics.averageTime,
      bottlenecks: this.identifyBottlenecks(journey),
      opportunities: this.identifyOpportunities(journey),
      recommendations: this.generateJourneyRecommendations(journey)
    };

    this.emit('journey:analyzed', analysis);

    return analysis;
  }

  private identifyBottlenecks(journey: UserJourney): string[] {
    const bottlenecks: string[] = [];

    journey.stages.forEach(stage => {
      if (stage.dropOffRate > 0.3) {
        bottlenecks.push(`${stage.name}: 高流失率 (${(stage.dropOffRate * 100).toFixed(1)}%)`);
      }

      if (stage.satisfaction < 3) {
        bottlenecks.push(`${stage.name}: 低满意度 (${stage.satisfaction.toFixed(1)})`);
      }

      if (stage.duration > 300) {
        bottlenecks.push(`${stage.name}: 耗时过长 (${(stage.duration / 60).toFixed(1)}分钟)`);
      }
    });

    return bottlenecks;
  }

  private identifyOpportunities(journey: UserJourney): string[] {
    const opportunities: string[] = [];

    journey.touchpoints.forEach(touchpoint => {
      if (touchpoint.satisfaction < 4 && touchpoint.impact === 'high') {
        opportunities.push(`${touchpoint.name}: 高影响低满意度，优先改进`);
      }

      if (touchpoint.frequency < 10) {
        opportunities.push(`${touchpoint.name}: 低频接触点，考虑优化或移除`);
      }
    });

    return opportunities;
  }

  private generateJourneyRecommendations(journey: UserJourney): string[] {
    const recommendations: string[] = [];

    if (journey.metrics.completionRate < 0.7) {
      recommendations.push('优化用户引导流程，提高完成率');
    }

    if (journey.metrics.averageTime > 180) {
      recommendations.push('简化流程步骤，减少用户耗时');
    }

    if (journey.metrics.satisfaction < 4) {
      recommendations.push('收集用户反馈，针对性改进体验');
    }

    return recommendations;
  }

  generateReport(period: { start: Date; end: Date }): ValueReport {
    const reportId = `report-${Date.now()}`;
    const propositionsMetrics = new Map<string, ValueMetrics>();

    this.propositions.forEach((proposition, id) => {
      propositionsMetrics.set(id, { ...proposition.metrics });
    });

    const totalValue = Array.from(propositionsMetrics.values())
      .reduce((sum, metrics) => sum + metrics.satisfactionScore, 0);

    const topPerformers = Array.from(propositionsMetrics.entries())
      .sort((a, b) => b[1].satisfactionScore - a[1].satisfactionScore)
      .slice(0, 5)
      .map(([id]) => id);

    const improvementAreas = Array.from(propositionsMetrics.entries())
      .filter(([_, metrics]) => metrics.satisfactionScore < 4)
      .map(([id]) => id);

    const recommendations = this.generateRecommendations(propositionsMetrics);

    const report: ValueReport = {
      id: reportId,
      period,
      propositions: propositionsMetrics,
      totalValue,
      growthRate: 0,
      topPerformers,
      improvementAreas,
      recommendations
    };

    this.reports.set(reportId, report);
    this.emit('report:generated', report);

    return report;
  }

  private generateRecommendations(metrics: Map<string, ValueMetrics>): string[] {
    const recommendations: string[] = [];

    const avgSatisfaction = Array.from(metrics.values())
      .reduce((sum, m) => sum + m.satisfactionScore, 0) / metrics.size;

    if (avgSatisfaction < 4) {
      recommendations.push('整体满意度偏低，建议进行全面用户体验优化');
    }

    const lowAdoption = Array.from(metrics.entries())
      .filter(([_, m]) => m.adoptionRate < 0.3)
      .map(([id]) => id);

    if (lowAdoption.length > 0) {
      recommendations.push(`以下价值主张采用率偏低: ${lowAdoption.join(', ')}，建议加强推广和培训`);
    }

    const highChurn = Array.from(metrics.entries())
      .filter(([_, m]) => m.retentionRate < 0.7)
      .map(([id]) => id);

    if (highChurn.length > 0) {
      recommendations.push(`以下价值主张留存率偏低: ${highChurn.join(', ')}，建议深入分析流失原因`);
    }

    return recommendations;
  }

  getReport(id: string): ValueReport | undefined {
    return this.reports.get(id);
  }

  getReports(): ValueReport[] {
    return Array.from(this.reports.values());
  }

  calculateUserSegmentValue(segmentId: string): SegmentValue {
    const segment = this.userSegments.get(segmentId);
    if (!segment) {
      throw new Error(`Segment not found: ${segmentId}`);
    }

    const relevantPropositions = Array.from(this.propositions.values()).filter(prop =>
      prop.targetAudience.some(audience =>
        segment.characteristics.some(char => audience.includes(char))
      )
    );

    const avgSatisfaction = relevantPropositions.length > 0
      ? relevantPropositions.reduce((sum, p) => sum + p.metrics.satisfactionScore, 0) / relevantPropositions.length
      : 0;

    const totalPotentialValue = relevantPropositions.length * 100;

    return {
      segmentId,
      segmentName: segment.name,
      relevantPropositions: relevantPropositions.map(p => p.id),
      averageSatisfaction: avgSatisfaction,
      totalPotentialValue,
      realizedValue: avgSatisfaction * relevantPropositions.length,
      valueGap: totalPotentialValue - (avgSatisfaction * relevantPropositions.length)
    };
  }

  getAllSegmentValues(): SegmentValue[] {
    return Array.from(this.userSegments.keys()).map(segmentId =>
      this.calculateUserSegmentValue(segmentId)
    );
  }

  getMetrics(): SystemMetrics {
    const totalPropositions = this.propositions.size;
    const totalFeedback = Array.from(this.feedback.values()).flat().length;
    const totalOptimizations = this.optimizations.size;
    const totalJourneys = this.journeys.size;

    const avgSatisfaction = Array.from(this.propositions.values())
      .reduce((sum, p) => sum + p.metrics.satisfactionScore, 0) / totalPropositions;

    const avgNPS = Array.from(this.propositions.values())
      .reduce((sum, p) => sum + p.metrics.npsScore, 0) / totalPropositions;

    return {
      totalPropositions,
      totalFeedback,
      totalOptimizations,
      totalJourneys,
      avgSatisfaction,
      avgNPS,
      activeSegments: this.userSegments.size,
      totalReports: this.reports.size
    };
  }

  destroy(): void {
    this.propositions.clear();
    this.feedback.clear();
    this.optimizations.clear();
    this.journeys.clear();
    this.reports.clear();
    this.userSegments.clear();
    this.removeAllListeners();
  }
}

export interface UserSegment {
  id: string;
  name: string;
  size: number;
  characteristics: string[];
  valueDrivers: string[];
  painPoints: string[];
  preferredChannels: string[];
}

export interface JourneyAnalysis {
  journeyId: string;
  overallSatisfaction: number;
  completionRate: number;
  averageTime: number;
  bottlenecks: string[];
  opportunities: string[];
  recommendations: string[];
}

export interface SegmentValue {
  segmentId: string;
  segmentName: string;
  relevantPropositions: string[];
  averageSatisfaction: number;
  totalPotentialValue: number;
  realizedValue: number;
  valueGap: number;
}

export interface SystemMetrics {
  totalPropositions: number;
  totalFeedback: number;
  totalOptimizations: number;
  totalJourneys: number;
  avgSatisfaction: number;
  avgNPS: number;
  activeSegments: number;
  totalReports: number;
}
