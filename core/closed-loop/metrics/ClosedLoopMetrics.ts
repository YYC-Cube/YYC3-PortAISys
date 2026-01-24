// closed-loop/metrics/ClosedLoopMetrics.ts
export class ClosedLoopMetrics {
  async assessClosedLoopEffectiveness(project: AIProject): Promise<ClosedLoopEffectiveness> {
    const cycleMetrics = await this.analyzeCycleMetrics(project);
    const improvementMetrics = await this.measureImprovementMetrics(project);
    const learningMetrics = await this.assessLearningEfficiency(project);
    
    return {
      cycleEfficiency: {
        cycleDuration: cycleMetrics.averageDuration,
        cycleFrequency: cycleMetrics.frequency,
        resourceUtilization: cycleMetrics.resourceEfficiency,
        throughput: cycleMetrics.throughput
      },
      improvementImpact: {
        qualityImprovement: improvementMetrics.qualityGains,
        performanceImprovement: improvementMetrics.performanceGains,
        costReduction: improvementMetrics.costSavings,
        valueCreation: improvementMetrics.valueAdded
      },
      learningVelocity: {
        knowledgeAccumulation: learningMetrics.knowledgeGrowth,
        problemSolvingSpeed: learningMetrics.solutionVelocity,
        adaptationRate: learningMetrics.adaptationSpeed,
        innovationRate: learningMetrics.innovationFrequency
      },
      overallEffectiveness: this.calculateOverallEffectiveness(
        cycleMetrics, 
        improvementMetrics, 
        learningMetrics
      )
    };
  }
}