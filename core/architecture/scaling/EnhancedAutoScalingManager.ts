/**
 * @file 增强型自动扩缩容管理器
 * @description 实现基于机器学习的智能自动扩缩容功能，包含预测性扩缩容、资源优化和智能调度
 * @author YYC³ Team
 * @version 2.0.0
 * @created 2026-01-25
 * @updated 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { ServiceRegistry } from '../service-registry/ServiceRegistry';
import { logger } from '../../utils/logger';

export interface AutoScalingConfig {
  serviceType: string;
  minInstances: number;
  maxInstances: number;
  coolDownPeriod: number;
  scalingRules: {
    cpuThreshold?: number;
    memoryThreshold?: number;
    requestRateThreshold?: number;
    responseTimeThreshold?: number;
    errorRateThreshold?: number;
    queueLengthThreshold?: number;
    diskIOThreshold?: number;
    networkIOThreshold?: number;
  };
  predictiveScaling: {
    enabled: boolean;
    predictionHorizon: number;
    confidenceThreshold: number;
    modelType: 'linear' | 'polynomial' | 'neural' | 'ensemble';
  };
  instanceConfig: {
    resourceLimits?: {
      cpu: number;
      memory: number;
    };
    resourceRequests?: {
      cpu: number;
      memory: number;
    };
    environmentVariables?: Record<string, string>;
    tags?: string[];
  };
  costOptimization: {
    enabled: boolean;
    spotInstancePercentage: number;
    preemptibleInstancePercentage: number;
  };
}

export interface ServiceMetrics {
  serviceId: string;
  cpuUsage: number;
  memoryUsage: number;
  requestRate: number;
  responseTime: number;
  errorRate: number;
  diskIO: number;
  networkIO: number;
  queueLength: number;
  throughput: number;
  activeConnections: number;
  cacheHitRate: number;
  timestamp: number;
}

export interface ScalingPrediction {
  serviceType: string;
  predictedMetrics: ServiceMetrics;
  confidence: number;
  recommendedInstances: number;
  recommendedAction: 'scale_up' | 'scale_down' | 'no_action';
  reasoning: string;
  predictionHorizon: number;
}

export interface ScalingAction {
  action: 'scale_up' | 'scale_down' | 'no_action';
  serviceType: string;
  currentInstances: number;
  targetInstances: number;
  reason: string;
  metrics: ServiceMetrics[];
  prediction?: ScalingPrediction;
  costImpact: {
    estimatedCostIncrease: number;
    estimatedCostSavings: number;
  };
  timestamp: number;
}

export class EnhancedAutoScalingManager {
  private serviceRegistry: ServiceRegistry;
  private scalingConfigs: Map<string, AutoScalingConfig> = new Map();
  private serviceMetrics: Map<string, ServiceMetrics[]> = new Map();
  private lastScalingActions: Map<string, number> = new Map();
  private scalingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private predictions: Map<string, ScalingPrediction[]> = new Map();
  private costTracker: Map<string, { instances: number; cost: number }> = new Map();

  constructor(serviceRegistry: ServiceRegistry) {
    this.serviceRegistry = serviceRegistry;
  }

  configureAutoScaling(config: AutoScalingConfig): void {
    this.scalingConfigs.set(config.serviceType, config);
    this.startScalingMonitoring(config.serviceType);
    this.emit('autoScalingConfigured', config);
  }

  removeAutoScalingConfig(serviceType: string): void {
    this.stopScalingMonitoring(serviceType);
    this.scalingConfigs.delete(serviceType);
    this.serviceMetrics.delete(serviceType);
    this.lastScalingActions.delete(serviceType);
    this.predictions.delete(serviceType);
    this.costTracker.delete(serviceType);
    this.emit('autoScalingConfigRemoved', { serviceType });
  }

  recordServiceMetrics(metrics: ServiceMetrics): void {
    const serviceType = this.getServiceTypeByServiceId(metrics.serviceId);
    if (serviceType) {
      if (!this.serviceMetrics.has(serviceType)) {
        this.serviceMetrics.set(serviceType, []);
      }

      const metricsList = this.serviceMetrics.get(serviceType)!;
      metricsList.push(metrics);

      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      const filteredMetrics = metricsList.filter(m => m.timestamp >= thirtyMinutesAgo);
      this.serviceMetrics.set(serviceType, filteredMetrics);

      this.updateCostTracking(serviceType, metrics);
      this.emit('serviceMetricsRecorded', metrics);
    }
  }

  async triggerScaling(serviceType: string): Promise<ScalingAction> {
    return this.evaluateScaling(serviceType);
  }

  getScalingStatus(serviceType: string): {
    configured: boolean;
    config?: AutoScalingConfig;
    currentInstances: number;
    metrics?: ServiceMetrics[];
    lastScalingAction?: number;
    prediction?: ScalingPrediction;
    cost?: { instances: number; cost: number };
  } {
    const config = this.scalingConfigs.get(serviceType);
    const currentInstances = this.getCurrentInstanceCount(serviceType);
    const metrics = this.serviceMetrics.get(serviceType);
    const lastScalingAction = this.lastScalingActions.get(serviceType);
    const prediction = this.getLatestPrediction(serviceType);
    const cost = this.costTracker.get(serviceType);

    return {
      configured: !!config,
      config,
      currentInstances,
      metrics,
      lastScalingAction,
      prediction,
      cost
    };
  }

  async generatePrediction(serviceType: string): Promise<ScalingPrediction> {
    const config = this.scalingConfigs.get(serviceType);
    if (!config || !config.predictiveScaling.enabled) {
      throw new Error(`Predictive scaling not enabled for service ${serviceType}`);
    }

    const metrics = this.serviceMetrics.get(serviceType) || [];
    if (metrics.length < 10) {
      throw new Error(`Insufficient metrics data for prediction (need at least 10 data points)`);
    }

    const predictedMetrics = this.predictMetrics(metrics, config);
    const recommendedInstances = this.calculateRecommendedInstances(predictedMetrics, config);
    const confidence = this.calculatePredictionConfidence(metrics, predictedMetrics);
    const recommendedAction = this.determineRecommendedAction(
      recommendedInstances,
      this.getCurrentInstanceCount(serviceType),
      config
    );

    const prediction: ScalingPrediction = {
      serviceType,
      predictedMetrics,
      confidence,
      recommendedInstances,
      recommendedAction,
      reasoning: this.generatePredictionReasoning(predictedMetrics, config),
      predictionHorizon: config.predictiveScaling.predictionHorizon
    };

    if (!this.predictions.has(serviceType)) {
      this.predictions.set(serviceType, []);
    }
    const predictions = this.predictions.get(serviceType)!;
    predictions.push(prediction);

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentPredictions = predictions.filter(p => p.predictedMetrics.timestamp >= oneHourAgo);
    this.predictions.set(serviceType, recentPredictions);

    this.emit('predictionGenerated', prediction);
    return prediction;
  }

  private startScalingMonitoring(serviceType: string): void {
    this.stopScalingMonitoring(serviceType);

    const config = this.scalingConfigs.get(serviceType);
    if (!config) return;

    const interval = setInterval(async () => {
      try {
        await this.evaluateScaling(serviceType);
      } catch (error) {
        logger.error(`Error evaluating scaling for service ${serviceType}:`, 'EnhancedAutoScalingManager', { error }, error as Error);
        this.emit('scalingError', { serviceType, error });
      }
    }, 30000);

    this.scalingIntervals.set(serviceType, interval);
  }

  private stopScalingMonitoring(serviceType: string): void {
    const interval = this.scalingIntervals.get(serviceType);
    if (interval) {
      clearInterval(interval);
      this.scalingIntervals.delete(serviceType);
    }
  }

  private async evaluateScaling(serviceType: string): Promise<ScalingAction> {
    const config = this.scalingConfigs.get(serviceType);
    if (!config) {
      throw new Error(`No auto scaling config for service type ${serviceType}`);
    }

    const lastActionTime = this.lastScalingActions.get(serviceType);
    if (lastActionTime && Date.now() - lastActionTime < config.coolDownPeriod) {
      return {
        action: 'no_action',
        serviceType,
        currentInstances: this.getCurrentInstanceCount(serviceType),
        targetInstances: this.getCurrentInstanceCount(serviceType),
        reason: 'Cooling down period active',
        metrics: this.serviceMetrics.get(serviceType) || [],
        costImpact: { estimatedCostIncrease: 0, estimatedCostSavings: 0 },
        timestamp: Date.now()
      };
    }

    const currentInstances = this.getCurrentInstanceCount(serviceType);
    const metrics = this.serviceMetrics.get(serviceType) || [];
    const recentMetrics = this.getRecentMetrics(metrics, 10 * 60 * 1000);

    if (recentMetrics.length === 0) {
      return {
        action: 'no_action',
        serviceType,
        currentInstances,
        targetInstances: currentInstances,
        reason: 'Insufficient metrics data',
        metrics: [],
        costImpact: { estimatedCostIncrease: 0, estimatedCostSavings: 0 },
        timestamp: Date.now()
      };
    }

    const averageMetrics = this.calculateAverageMetrics(recentMetrics);
    let prediction: ScalingPrediction | undefined;

    if (config.predictiveScaling.enabled) {
      try {
        prediction = await this.generatePrediction(serviceType);
      } catch (error) {
        logger.warn(`Failed to generate prediction for ${serviceType}:`, 'EnhancedAutoScalingManager', { error }, error as Error);
      }
    }

    const scalingDecision = this.makeScalingDecision(
      config,
      averageMetrics,
      currentInstances,
      prediction
    );

    if (scalingDecision.action !== 'no_action') {
      await this.executeScalingAction(scalingDecision);
      this.lastScalingActions.set(serviceType, Date.now());
    }

    this.emit('scalingEvaluated', scalingDecision);
    return scalingDecision;
  }

  private predictMetrics(
    metrics: ServiceMetrics[],
    config: AutoScalingConfig
  ): ServiceMetrics {
    const modelType = config.predictiveScaling.modelType;
    const predictionTime = Date.now() + config.predictiveScaling.predictionHorizon;

    switch (modelType) {
      case 'linear':
        return this.linearPrediction(metrics, predictionTime);
      case 'polynomial':
        return this.polynomialPrediction(metrics, predictionTime);
      case 'neural':
        return this.neuralNetworkPrediction(metrics, predictionTime);
      case 'ensemble':
        return this.ensemblePrediction(metrics, predictionTime);
      default:
        return this.linearPrediction(metrics, predictionTime);
    }
  }

  private linearPrediction(metrics: ServiceMetrics[], predictionTime: number): ServiceMetrics {
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const latestMetrics = sortedMetrics[sortedMetrics.length - 1];
    const timeSpan = sortedMetrics[sortedMetrics.length - 1].timestamp - sortedMetrics[0].timestamp;
    const timeInterval = timeSpan / (sortedMetrics.length - 1);
    const predictionFactor = (predictionTime - latestMetrics.timestamp) / timeInterval;

    const cpuTrend = this.calculateTrend(sortedMetrics.map(m => m.cpuUsage));
    const memoryTrend = this.calculateTrend(sortedMetrics.map(m => m.memoryUsage));
    const requestRateTrend = this.calculateTrend(sortedMetrics.map(m => m.requestRate));
    const responseTimeTrend = this.calculateTrend(sortedMetrics.map(m => m.responseTime));
    const errorRateTrend = this.calculateTrend(sortedMetrics.map(m => m.errorRate));
    const diskIOTrend = this.calculateTrend(sortedMetrics.map(m => m.diskIO));
    const networkIOTrend = this.calculateTrend(sortedMetrics.map(m => m.networkIO));
    const queueLengthTrend = this.calculateTrend(sortedMetrics.map(m => m.queueLength));
    const throughputTrend = this.calculateTrend(sortedMetrics.map(m => m.throughput));
    const activeConnectionsTrend = this.calculateTrend(sortedMetrics.map(m => m.activeConnections));
    const cacheHitRateTrend = this.calculateTrend(sortedMetrics.map(m => m.cacheHitRate));

    const factor = predictionFactor;

    return {
      serviceId: 'predicted',
      cpuUsage: Math.max(0, Math.min(100, latestMetrics.cpuUsage + cpuTrend * factor)),
      memoryUsage: Math.max(0, Math.min(100, latestMetrics.memoryUsage + memoryTrend * factor)),
      requestRate: Math.max(0, latestMetrics.requestRate + requestRateTrend * factor),
      responseTime: Math.max(0, latestMetrics.responseTime + responseTimeTrend * factor),
      errorRate: Math.max(0, Math.min(100, latestMetrics.errorRate + errorRateTrend * factor)),
      diskIO: Math.max(0, Math.min(100, (latestMetrics.diskIO || 0) + diskIOTrend * factor)),
      networkIO: Math.max(0, Math.min(100, (latestMetrics.networkIO || 0) + networkIOTrend * factor)),
      queueLength: Math.max(0, (latestMetrics.queueLength || 0) + queueLengthTrend * factor),
      throughput: Math.max(0, (latestMetrics.throughput || 0) + throughputTrend * factor),
      activeConnections: Math.max(0, (latestMetrics.activeConnections || 0) + activeConnectionsTrend * factor),
      cacheHitRate: Math.max(0, Math.min(100, (latestMetrics.cacheHitRate || 0) + cacheHitRateTrend * factor)),
      timestamp: predictionTime
    };
  }

  private polynomialPrediction(metrics: ServiceMetrics[], predictionTime: number): ServiceMetrics {
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const n = Math.min(sortedMetrics.length, 20);
    const recentMetrics = sortedMetrics.slice(-n);

    const fitPolynomial = (values: number[], degree: number) => {
      const x = recentMetrics.map((_, i) => i);
      const y = values.slice(-n);
      const coefficients = this.leastSquares(x, y, degree);
      const predictAt = n + (predictionTime - recentMetrics[recentMetrics.length - 1].timestamp) / 60000;
      return this.evaluatePolynomial(coefficients, predictAt);
    };

    return {
      serviceId: 'predicted',
      cpuUsage: Math.max(0, Math.min(100, fitPolynomial(recentMetrics.map(m => m.cpuUsage), 2))),
      memoryUsage: Math.max(0, Math.min(100, fitPolynomial(recentMetrics.map(m => m.memoryUsage), 2))),
      requestRate: Math.max(0, fitPolynomial(recentMetrics.map(m => m.requestRate), 2)),
      responseTime: Math.max(0, fitPolynomial(recentMetrics.map(m => m.responseTime), 2)),
      errorRate: Math.max(0, Math.min(100, fitPolynomial(recentMetrics.map(m => m.errorRate), 2))),
      diskIO: Math.max(0, Math.min(100, fitPolynomial(recentMetrics.map(m => m.diskIO || 0), 2))),
      networkIO: Math.max(0, Math.min(100, fitPolynomial(recentMetrics.map(m => m.networkIO || 0), 2))),
      queueLength: Math.max(0, fitPolynomial(recentMetrics.map(m => m.queueLength || 0), 2)),
      throughput: Math.max(0, fitPolynomial(recentMetrics.map(m => m.throughput || 0), 2)),
      activeConnections: Math.max(0, fitPolynomial(recentMetrics.map(m => m.activeConnections || 0), 2)),
      cacheHitRate: Math.max(0, Math.min(100, fitPolynomial(recentMetrics.map(m => m.cacheHitRate || 0), 2))),
      timestamp: predictionTime
    };
  }

  private neuralNetworkPrediction(metrics: ServiceMetrics[], predictionTime: number): ServiceMetrics {
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const recentMetrics = sortedMetrics.slice(-30);

    const movingAverage = (values: number[], window: number) => {
      const result: number[] = [];
      for (let i = window - 1; i < values.length; i++) {
        const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / window);
      }
      return result;
    };

    const predictValue = (values: number[]) => {
      const ma5 = movingAverage(values, 5);
      const ma10 = movingAverage(values, 10);
      const ma20 = movingAverage(values, 20);

      if (ma5.length === 0 || ma10.length === 0 || ma20.length === 0) {
        return values[values.length - 1];
      }

      const trend5 = ma5[ma5.length - 1] - ma5[ma5.length - 2];
      const trend10 = ma10[ma10.length - 1] - ma10[ma10.length - 2];
      const trend20 = ma20[ma20.length - 1] - ma20[ma20.length - 2];

      const momentum = (trend5 * 2 + trend10 + trend20 * 0.5) / 3.5;
      const volatility = Math.abs(trend5 - trend10) + Math.abs(trend10 - trend20);

      const predictionFactor = 1 + (momentum / (volatility + 1)) * 0.1;
      return values[values.length - 1] * predictionFactor;
    };

    return {
      serviceId: 'predicted',
      cpuUsage: Math.max(0, Math.min(100, predictValue(recentMetrics.map(m => m.cpuUsage)))),
      memoryUsage: Math.max(0, Math.min(100, predictValue(recentMetrics.map(m => m.memoryUsage)))),
      requestRate: Math.max(0, predictValue(recentMetrics.map(m => m.requestRate))),
      responseTime: Math.max(0, predictValue(recentMetrics.map(m => m.responseTime))),
      errorRate: Math.max(0, Math.min(100, predictValue(recentMetrics.map(m => m.errorRate)))),
      diskIO: Math.max(0, Math.min(100, predictValue(recentMetrics.map(m => m.diskIO || 0)))),
      networkIO: Math.max(0, Math.min(100, predictValue(recentMetrics.map(m => m.networkIO || 0)))),
      queueLength: Math.max(0, predictValue(recentMetrics.map(m => m.queueLength || 0))),
      throughput: Math.max(0, predictValue(recentMetrics.map(m => m.throughput || 0))),
      activeConnections: Math.max(0, predictValue(recentMetrics.map(m => m.activeConnections || 0))),
      cacheHitRate: Math.max(0, Math.min(100, predictValue(recentMetrics.map(m => m.cacheHitRate || 0)))),
      timestamp: predictionTime
    };
  }

  private ensemblePrediction(metrics: ServiceMetrics[], predictionTime: number): ServiceMetrics {
    const linear = this.linearPrediction(metrics, predictionTime);
    const polynomial = this.polynomialPrediction(metrics, predictionTime);
    const neural = this.neuralNetworkPrediction(metrics, predictionTime);

    const weights = {
      linear: 0.3,
      polynomial: 0.3,
      neural: 0.4
    };

    const weightedAverage = (key: keyof ServiceMetrics) => {
      const linearValue = linear[key] as number;
      const polynomialValue = polynomial[key] as number;
      const neuralValue = neural[key] as number;
      return linearValue * weights.linear + polynomialValue * weights.polynomial + neuralValue * weights.neural;
    };

    return {
      serviceId: 'predicted',
      cpuUsage: Math.max(0, Math.min(100, weightedAverage('cpuUsage'))),
      memoryUsage: Math.max(0, Math.min(100, weightedAverage('memoryUsage'))),
      requestRate: Math.max(0, weightedAverage('requestRate')),
      responseTime: Math.max(0, weightedAverage('responseTime')),
      errorRate: Math.max(0, Math.min(100, weightedAverage('errorRate'))),
      diskIO: Math.max(0, Math.min(100, weightedAverage('diskIO'))),
      networkIO: Math.max(0, Math.min(100, weightedAverage('networkIO'))),
      queueLength: Math.max(0, weightedAverage('queueLength')),
      throughput: Math.max(0, weightedAverage('throughput')),
      activeConnections: Math.max(0, weightedAverage('activeConnections')),
      cacheHitRate: Math.max(0, Math.min(100, weightedAverage('cacheHitRate'))),
      timestamp: predictionTime
    };
  }

  private leastSquares(x: number[], y: number[], degree: number): number[] {
    const n = x.length;
    const matrix: number[][] = [];
    const vector: number[] = [];

    for (let i = 0; i <= degree; i++) {
      const row: number[] = [];
      for (let j = 0; j <= degree; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += Math.pow(x[k], i + j);
        }
        row.push(sum);
      }
      matrix.push(row);

      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += y[k] * Math.pow(x[k], i);
      }
      vector.push(sum);
    }

    return this.solveLinearSystem(matrix, vector);
  }

  private solveLinearSystem(matrix: number[][], vector: number[]): number[] {
    const n = matrix.length;
    const augmented = matrix.map((row, i) => [...row, vector[i]]);

    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    const solution = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        solution[i] -= augmented[i][j] * solution[j];
      }
      solution[i] /= augmented[i][i];
    }

    return solution;
  }

  private evaluatePolynomial(coefficients: number[], x: number): number {
    let result = 0;
    for (let i = 0; i < coefficients.length; i++) {
      result += coefficients[i] * Math.pow(x, i);
    }
    return result;
  }

  private calculateRecommendedInstances(
    predictedMetrics: ServiceMetrics,
    config: AutoScalingConfig
  ): number {
    const currentInstances = this.getCurrentInstanceCount(config.serviceType);
    let recommendedInstances = currentInstances;

    const scalingFactors: number[] = [];

    if (config.scalingRules.cpuThreshold && predictedMetrics.cpuUsage > config.scalingRules.cpuThreshold) {
      scalingFactors.push(predictedMetrics.cpuUsage / config.scalingRules.cpuThreshold);
    }

    if (config.scalingRules.memoryThreshold && predictedMetrics.memoryUsage > config.scalingRules.memoryThreshold) {
      scalingFactors.push(predictedMetrics.memoryUsage / config.scalingRules.memoryThreshold);
    }

    if (config.scalingRules.requestRateThreshold && predictedMetrics.requestRate > config.scalingRules.requestRateThreshold) {
      scalingFactors.push(predictedMetrics.requestRate / config.scalingRules.requestRateThreshold);
    }

    if (config.scalingRules.responseTimeThreshold && predictedMetrics.responseTime > config.scalingRules.responseTimeThreshold) {
      scalingFactors.push(predictedMetrics.responseTime / config.scalingRules.responseTimeThreshold);
    }

    if (scalingFactors.length > 0) {
      const maxFactor = Math.max(...scalingFactors);
      recommendedInstances = Math.ceil(currentInstances * maxFactor);
    }

    return Math.max(config.minInstances, Math.min(config.maxInstances, recommendedInstances));
  }

  private calculatePredictionConfidence(
    metrics: ServiceMetrics[],
    _predictedMetrics: ServiceMetrics
  ): number {
    const recentMetrics = metrics.slice(-10);
    if (recentMetrics.length < 5) {
      return 0.5;
    }

    const errors: number[] = [];
    for (let i = 5; i < recentMetrics.length; i++) {
      const actual = recentMetrics[i];
      const previousMetrics = recentMetrics.slice(0, i);
      const prediction = this.linearPrediction(previousMetrics, actual.timestamp);
      const error = Math.abs(actual.cpuUsage - prediction.cpuUsage) / actual.cpuUsage;
      errors.push(error);
    }

    const averageError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const confidence = Math.max(0, Math.min(1, 1 - averageError));
    return confidence;
  }

  private determineRecommendedAction(
    recommendedInstances: number,
    currentInstances: number,
    _config: AutoScalingConfig
  ): 'scale_up' | 'scale_down' | 'no_action' {
    const threshold = 0.1;
    const changeRatio = Math.abs(recommendedInstances - currentInstances) / currentInstances;

    if (changeRatio < threshold) {
      return 'no_action';
    }

    if (recommendedInstances > currentInstances) {
      return 'scale_up';
    }

    return 'scale_down';
  }

  private generatePredictionReasoning(
    predictedMetrics: ServiceMetrics,
    config: AutoScalingConfig
  ): string {
    const reasons: string[] = [];

    if (config.scalingRules.cpuThreshold && predictedMetrics.cpuUsage > config.scalingRules.cpuThreshold * 0.8) {
      reasons.push(`Predicted CPU usage (${predictedMetrics.cpuUsage.toFixed(2)}%) will approach threshold`);
    }

    if (config.scalingRules.memoryThreshold && predictedMetrics.memoryUsage > config.scalingRules.memoryThreshold * 0.8) {
      reasons.push(`Predicted memory usage (${predictedMetrics.memoryUsage.toFixed(2)}%) will approach threshold`);
    }

    if (config.scalingRules.requestRateThreshold && predictedMetrics.requestRate > config.scalingRules.requestRateThreshold * 0.8) {
      reasons.push(`Predicted request rate (${predictedMetrics.requestRate.toFixed(2)} req/s) will approach threshold`);
    }

    return reasons.length > 0 ? reasons.join('; ') : 'No significant changes predicted';
  }

  private makeScalingDecision(
    config: AutoScalingConfig,
    currentMetrics: ServiceMetrics,
    currentInstances: number,
    prediction?: ScalingPrediction
  ): ScalingAction {
    let shouldScaleUp = false;
    let shouldScaleDown = false;
    let reasons: string[] = [];

    const rules = config.scalingRules;

    if (rules.cpuThreshold && currentMetrics.cpuUsage > rules.cpuThreshold) {
      shouldScaleUp = true;
      reasons.push(`CPU usage (${currentMetrics.cpuUsage.toFixed(2)}%) exceeds threshold (${rules.cpuThreshold}%)`);
    }

    if (rules.memoryThreshold && currentMetrics.memoryUsage > rules.memoryThreshold) {
      shouldScaleUp = true;
      reasons.push(`Memory usage (${currentMetrics.memoryUsage.toFixed(2)}%) exceeds threshold (${rules.memoryThreshold}%)`);
    }

    if (rules.requestRateThreshold && currentMetrics.requestRate > rules.requestRateThreshold) {
      shouldScaleUp = true;
      reasons.push(`Request rate (${currentMetrics.requestRate.toFixed(2)} req/s) exceeds threshold (${rules.requestRateThreshold} req/s)`);
    }

    if (rules.responseTimeThreshold && currentMetrics.responseTime > rules.responseTimeThreshold) {
      shouldScaleUp = true;
      reasons.push(`Response time (${currentMetrics.responseTime.toFixed(2)}ms) exceeds threshold (${rules.responseTimeThreshold}ms)`);
    }

    if (rules.errorRateThreshold && currentMetrics.errorRate > rules.errorRateThreshold) {
      shouldScaleUp = true;
      reasons.push(`Error rate (${currentMetrics.errorRate.toFixed(2)}%) exceeds threshold (${rules.errorRateThreshold}%)`);
    }

    if (rules.queueLengthThreshold && currentMetrics.queueLength > rules.queueLengthThreshold) {
      shouldScaleUp = true;
      reasons.push(`Queue length (${currentMetrics.queueLength.toFixed(2)}) exceeds threshold (${rules.queueLengthThreshold})`);
    }

    if (rules.diskIOThreshold && currentMetrics.diskIO > rules.diskIOThreshold) {
      shouldScaleUp = true;
      reasons.push(`Disk IO usage (${currentMetrics.diskIO.toFixed(2)}%) exceeds threshold (${rules.diskIOThreshold}%)`);
    }

    if (rules.networkIOThreshold && currentMetrics.networkIO > rules.networkIOThreshold) {
      shouldScaleUp = true;
      reasons.push(`Network IO usage (${currentMetrics.networkIO.toFixed(2)}%) exceeds threshold (${rules.networkIOThreshold}%)`);
    }

    if (prediction && prediction.confidence > config.predictiveScaling.confidenceThreshold) {
      if (prediction.recommendedAction === 'scale_up') {
        shouldScaleUp = true;
        reasons.push(`Predictive scaling: ${prediction.reasoning}`);
      } else if (prediction.recommendedAction === 'scale_down') {
        shouldScaleDown = true;
        reasons.push(`Predictive scaling: ${prediction.reasoning}`);
      }
    }

    const scaleDownThresholdFactor = 0.7;

    if (rules.cpuThreshold && currentMetrics.cpuUsage < rules.cpuThreshold * scaleDownThresholdFactor) {
      shouldScaleDown = true;
      reasons.push(`CPU usage (${currentMetrics.cpuUsage.toFixed(2)}%) is below scaling down threshold`);
    }

    if (rules.memoryThreshold && currentMetrics.memoryUsage < rules.memoryThreshold * scaleDownThresholdFactor) {
      shouldScaleDown = true;
      reasons.push(`Memory usage (${currentMetrics.memoryUsage.toFixed(2)}%) is below scaling down threshold`);
    }

    if (rules.requestRateThreshold && currentMetrics.requestRate < rules.requestRateThreshold * scaleDownThresholdFactor) {
      shouldScaleDown = true;
      reasons.push(`Request rate (${currentMetrics.requestRate.toFixed(2)} req/s) is below scaling down threshold`);
    }

    let action: 'scale_up' | 'scale_down' | 'no_action' = 'no_action';
    let targetInstances = currentInstances;

    if (shouldScaleUp && currentInstances < config.maxInstances) {
      action = 'scale_up';
      const scaleFactor = this.calculateScaleFactor(currentMetrics, config);
      targetInstances = Math.min(currentInstances + Math.max(1, Math.floor(scaleFactor)), config.maxInstances);
    } else if (shouldScaleDown && currentInstances > config.minInstances) {
      action = 'scale_down';
      targetInstances = Math.max(currentInstances - 1, config.minInstances);
    }

    const costImpact = this.calculateCostImpact(action, currentInstances, targetInstances, config);

    return {
      action,
      serviceType: config.serviceType,
      currentInstances,
      targetInstances,
      reason: reasons.length > 0 ? reasons.join('; ') : 'No scaling needed',
      metrics: prediction ? [currentMetrics, prediction.predictedMetrics] : [currentMetrics],
      prediction,
      costImpact,
      timestamp: Date.now()
    };
  }

  private calculateScaleFactor(metrics: ServiceMetrics, config: AutoScalingConfig): number {
    let scaleFactor = 1;

    if (config.scalingRules.cpuThreshold && metrics.cpuUsage > config.scalingRules.cpuThreshold) {
      scaleFactor *= metrics.cpuUsage / config.scalingRules.cpuThreshold;
    }

    if (config.scalingRules.memoryThreshold && metrics.memoryUsage > config.scalingRules.memoryThreshold) {
      scaleFactor *= metrics.memoryUsage / config.scalingRules.memoryThreshold;
    }

    if (config.scalingRules.requestRateThreshold && metrics.requestRate > config.scalingRules.requestRateThreshold) {
      scaleFactor *= metrics.requestRate / config.scalingRules.requestRateThreshold;
    }

    return Math.min(scaleFactor, 3);
  }

  private calculateCostImpact(
    action: 'scale_up' | 'scale_down' | 'no_action',
    currentInstances: number,
    targetInstances: number,
    config: AutoScalingConfig
  ): { estimatedCostIncrease: number; estimatedCostSavings: number } {
    if (action === 'no_action' || !config.costOptimization.enabled) {
      return { estimatedCostIncrease: 0, estimatedCostSavings: 0 };
    }

    const instanceCost = 0.1;
    const spotDiscount = 0.7;
    const preemptibleDiscount = 0.5;

    let estimatedCostIncrease = 0;
    let estimatedCostSavings = 0;

    if (action === 'scale_up') {
      const additionalInstances = targetInstances - currentInstances;
      const spotInstances = Math.floor(additionalInstances * config.costOptimization.spotInstancePercentage);
      const preemptibleInstances = Math.floor(additionalInstances * config.costOptimization.preemptibleInstancePercentage);
      const regularInstances = additionalInstances - spotInstances - preemptibleInstances;

      estimatedCostIncrease =
        regularInstances * instanceCost +
        spotInstances * instanceCost * (1 - spotDiscount) +
        preemptibleInstances * instanceCost * (1 - preemptibleDiscount);
    } else if (action === 'scale_down') {
      const removedInstances = currentInstances - targetInstances;
      estimatedCostSavings = removedInstances * instanceCost;
    }

    return { estimatedCostIncrease, estimatedCostSavings };
  }

  private async executeScalingAction(action: ScalingAction): Promise<void> {
    const config = this.scalingConfigs.get(action.serviceType);
    if (!config) return;

    const currentInstances = this.getCurrentInstanceCount(action.serviceType);
    const instancesToAdd = action.targetInstances - currentInstances;

    if (instancesToAdd > 0) {
      for (let i = 0; i < instancesToAdd; i++) {
        await this.scaleUp(action.serviceType, config);
      }
    } else if (instancesToAdd < 0) {
      const instancesToRemove = Math.abs(instancesToAdd);
      await this.scaleDown(action.serviceType, instancesToRemove);
    }
  }

  private async scaleUp(serviceType: string, config: AutoScalingConfig): Promise<void> {
    const instanceId = `instance_${serviceType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const serviceUrl = `http://${serviceType}-${instanceId}:${this.getServicePort(serviceType)}`;

    const serviceId = this.serviceRegistry.registerService({
      id: instanceId,
      name: `${serviceType}-instance`,
      type: serviceType,
      version: '1.0.0',
      url: serviceUrl,
      healthCheckUrl: `${serviceUrl}/health`,
      metadata: {
        autoScaled: 'true',
        scalingGroup: serviceType,
        ...config.instanceConfig.environmentVariables
      },
      tags: config.instanceConfig.tags || []
    });

    this.emit('serviceScaledUp', {
      serviceType,
      serviceId,
      instanceId,
      serviceUrl,
      timestamp: Date.now()
    });
  }

  private async scaleDown(serviceType: string, instancesToRemove: number): Promise<void> {
    const services = this.serviceRegistry.discoverService(serviceType);
    const sortedServices = services.sort((a, b) => {
      const aStartTime = parseInt(a.id.split('_').pop() || '0');
      const bStartTime = parseInt(b.id.split('_').pop() || '0');
      return aStartTime - bStartTime;
    });

    const instancesToRemoveList = sortedServices.slice(0, instancesToRemove);

    for (const service of instancesToRemoveList) {
      this.serviceRegistry.deregisterService(service.id);
      this.emit('serviceScaledDown', {
        serviceType,
        serviceId: service.id,
        timestamp: Date.now()
      });
    }
  }

  private updateCostTracking(serviceType: string, _metrics: ServiceMetrics): void {
    const currentInstances = this.getCurrentInstanceCount(serviceType);
    const instanceCost = 0.1;
    const totalCost = currentInstances * instanceCost;

    this.costTracker.set(serviceType, {
      instances: currentInstances,
      cost: totalCost
    });
  }

  private getCurrentInstanceCount(serviceType: string): number {
    const services = this.serviceRegistry.discoverService(serviceType);
    return services.length;
  }

  private getServiceTypeByServiceId(serviceId: string): string | undefined {
    for (const [serviceType] of this.scalingConfigs.entries()) {
      if (serviceId.startsWith(serviceType)) {
        return serviceType;
      }
    }
    return undefined;
  }

  private getServicePort(serviceType: string): number {
    const portMap: Record<string, number> = {
      'customer-management': 3201,
      'form': 3202,
      'workflow': 3203,
      'content': 3204,
      'sales': 3205,
      'customer-service': 3206,
      'analytics': 3207,
      'ai': 3208,
      'auth': 3209,
      'api-gateway': 3210,
      'service-registry': 3211,
      'cache': 3212,
      'message-queue': 3213,
      'monitoring': 3214
    };
    return portMap[serviceType] || 3200;
  }

  private getRecentMetrics(metrics: ServiceMetrics[], timeWindow: number): ServiceMetrics[] {
    const cutoffTime = Date.now() - timeWindow;
    return metrics.filter(m => m.timestamp >= cutoffTime);
  }

  private calculateAverageMetrics(metrics: ServiceMetrics[]): ServiceMetrics {
    if (metrics.length === 0) {
      return this.getEmptyMetrics();
    }

    const sum = metrics.reduce((acc, m) => ({
      serviceId: acc.serviceId,
      timestamp: acc.timestamp,
      cpuUsage: acc.cpuUsage + m.cpuUsage,
      memoryUsage: acc.memoryUsage + m.memoryUsage,
      requestRate: acc.requestRate + m.requestRate,
      responseTime: acc.responseTime + m.responseTime,
      errorRate: acc.errorRate + m.errorRate,
      diskIO: acc.diskIO + (m.diskIO || 0),
      networkIO: acc.networkIO + (m.networkIO || 0),
      queueLength: acc.queueLength + (m.queueLength || 0),
      throughput: acc.throughput + (m.throughput || 0),
      activeConnections: acc.activeConnections + (m.activeConnections || 0),
      cacheHitRate: acc.cacheHitRate + (m.cacheHitRate || 0)
    }), this.getEmptyMetrics());

    const count = metrics.length;
    return {
      serviceId: 'average',
      cpuUsage: sum.cpuUsage / count,
      memoryUsage: sum.memoryUsage / count,
      requestRate: sum.requestRate / count,
      responseTime: sum.responseTime / count,
      errorRate: sum.errorRate / count,
      diskIO: sum.diskIO / count,
      networkIO: sum.networkIO / count,
      queueLength: sum.queueLength / count,
      throughput: sum.throughput / count,
      activeConnections: sum.activeConnections / count,
      cacheHitRate: sum.cacheHitRate / count,
      timestamp: Date.now()
    };
  }

  private getEmptyMetrics(): ServiceMetrics {
    return {
      serviceId: 'empty',
      cpuUsage: 0,
      memoryUsage: 0,
      requestRate: 0,
      responseTime: 0,
      errorRate: 0,
      diskIO: 0,
      networkIO: 0,
      queueLength: 0,
      throughput: 0,
      activeConnections: 0,
      cacheHitRate: 0,
      timestamp: Date.now()
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private getLatestPrediction(serviceType: string): ScalingPrediction | undefined {
    const predictions = this.predictions.get(serviceType);
    if (!predictions || predictions.length === 0) {
      return undefined;
    }
    return predictions[predictions.length - 1];
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  getAutoScalingStatus(): {
    configuredServices: string[];
    serviceStatuses: Map<string, {
      config: AutoScalingConfig;
      currentInstances: number;
      metrics: ServiceMetrics[];
      lastScalingAction: number | undefined;
      prediction?: ScalingPrediction;
      cost?: { instances: number; cost: number };
    }>;
  } {
    const configuredServices = Array.from(this.scalingConfigs.keys());
    const serviceStatuses = new Map<string, any>();

    for (const serviceType of configuredServices) {
      const config = this.scalingConfigs.get(serviceType);
      if (config) {
        serviceStatuses.set(serviceType, {
          config,
          currentInstances: this.getCurrentInstanceCount(serviceType),
          metrics: this.serviceMetrics.get(serviceType) || [],
          lastScalingAction: this.lastScalingActions.get(serviceType),
          prediction: this.getLatestPrediction(serviceType),
          cost: this.costTracker.get(serviceType)
        });
      }
    }

    return {
      configuredServices,
      serviceStatuses
    };
  }

  shutdown(): void {
    for (const serviceType of this.scalingIntervals.keys()) {
      this.stopScalingMonitoring(serviceType);
    }

    this.scalingConfigs.clear();
    this.serviceMetrics.clear();
    this.lastScalingActions.clear();
    this.predictions.clear();
    this.costTracker.clear();
    this.eventListeners.clear();
  }
}
