/**
 * 五维闭环系统核心类
 * @file core/closed-loop/ClosedLoopSystem.ts
 * @description 实现包含价值创造、技术演进、数据驱动、用户体验、业务价值五个维度的闭环系统
 */

import { GoalManagementSystem } from './value-creation/GoalManagementSystem';
import { TechnicalMaturityModel } from './technical-evolution/TechnicalMaturityModel';
import { TechnologyRoadmap } from './technical-evolution/TechnologyRoadmap';

import type { AutonomousAIConfig } from '../autonomous-ai-widget/types';

export class ClosedLoopSystem {
  private config: AutonomousAIConfig;
  private goalManagementSystem!: GoalManagementSystem;
  private technicalMaturityModel!: TechnicalMaturityModel;
  private technologyRoadmap!: TechnologyRoadmap;

  constructor(config: AutonomousAIConfig) {
    this.config = config;
    this.initializeSystems();
  }

  /**
   * 初始化五维闭环系统的各个子系统
   */
  private initializeSystems(): void {
    this.goalManagementSystem = new GoalManagementSystem(this.config);
    this.technicalMaturityModel = new TechnicalMaturityModel(this.config);
    this.technologyRoadmap = new TechnologyRoadmap(this.config);
  }

  /**
   * 运行五维闭环系统
   * @param metrics 闭环系统指标数据
   */
  async runClosedLoop(metrics: any): Promise<void> {
    try {
      // 1. 价值创造维度：目标管理与价值验证
      await this.goalManagementSystem.reviewGoals(metrics);

      // 2. 技术演进维度：技术成熟度评估与技术路线图更新
      await this.technicalMaturityModel.assessMaturity(metrics);
      await this.technologyRoadmap.updateRoadmap(metrics);

    } catch (error) {
      console.error('ClosedLoopSystem: Error running closed loop:', error);
    }
  }

  /**
   * 获取当前闭环系统的状态
   */
  async getSystemStatus(): Promise<{
    valueCreationStatus: any;
    technicalEvolutionStatus: any;
    technologyRoadmapStatus: any;
  }> {
    return {
      valueCreationStatus: await this.goalManagementSystem.getStatus(),
      technicalEvolutionStatus: await this.technicalMaturityModel.getStatus(),
      technologyRoadmapStatus: await this.technologyRoadmap.getStatus()
    };
  }
}