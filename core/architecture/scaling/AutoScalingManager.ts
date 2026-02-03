/**
 * @file 自动扩缩容管理器
 * @description 实现基于负载的自动扩缩容功能，优化系统在高并发场景下的性能
 * @author YYC³ Team
 * @version 1.0.0
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
  coolDownPeriod: number; // 冷却期（毫秒）
  scalingRules: {
    cpuThreshold?: number; // CPU使用率阈值（百分比）
    memoryThreshold?: number; // 内存使用率阈值（百分比）
    requestRateThreshold?: number; // 请求率阈值（请求/秒）
    responseTimeThreshold?: number; // 响应时间阈值（毫秒）
    errorRateThreshold?: number; // 错误率阈值（百分比）
  };
  instanceConfig: {
    resourceLimits?: {
      cpu: number;
      memory: number;
    };
    environmentVariables?: Record<string, string>;
    tags?: string[];
  };
}

export interface ServiceMetrics {
  serviceId: string;
  cpuUsage: number; // CPU使用率（百分比）
  memoryUsage: number; // 内存使用率（百分比）
  requestRate: number; // 请求率（请求/秒）
  responseTime: number; // 平均响应时间（毫秒）
  errorRate: number; // 错误率（百分比）
  diskIO: number; // 磁盘IO使用率（百分比）
  networkIO: number; // 网络IO使用率（百分比）
  queueLength: number; // 请求队列长度
  throughput: number; // 吞吐量（请求/秒）
  timestamp: number;
}

export interface ScalingAction {
  action: 'scale_up' | 'scale_down' | 'no_action';
  serviceType: string;
  currentInstances: number;
  targetInstances: number;
  reason: string;
  metrics: ServiceMetrics[];
  timestamp: number;
}

export class AutoScalingManager {
  private serviceRegistry: ServiceRegistry;
  private scalingConfigs: Map<string, AutoScalingConfig> = new Map();
  private serviceMetrics: Map<string, ServiceMetrics[]> = new Map();
  private lastScalingActions: Map<string, number> = new Map();
  private scalingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor(serviceRegistry: ServiceRegistry) {
    this.serviceRegistry = serviceRegistry;
  }

  /**
   * 配置服务的自动扩缩容
   */
  configureAutoScaling(config: AutoScalingConfig): void {
    this.scalingConfigs.set(config.serviceType, config);
    this.startScalingMonitoring(config.serviceType);
    this.emit('autoScalingConfigured', config);
  }

  /**
   * 移除服务的自动扩缩容配置
   */
  removeAutoScalingConfig(serviceType: string): void {
    this.stopScalingMonitoring(serviceType);
    this.scalingConfigs.delete(serviceType);
    this.serviceMetrics.delete(serviceType);
    this.lastScalingActions.delete(serviceType);
    this.emit('autoScalingConfigRemoved', { serviceType });
  }

  /**
   * 记录服务指标
   */
  recordServiceMetrics(metrics: ServiceMetrics): void {
    const serviceType = this.getServiceTypeByServiceId(metrics.serviceId);
    if (serviceType) {
      if (!this.serviceMetrics.has(serviceType)) {
        this.serviceMetrics.set(serviceType, []);
      }

      const metricsList = this.serviceMetrics.get(serviceType)!;
      metricsList.push(metrics);

      // 只保留最近10分钟的指标
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      const filteredMetrics = metricsList.filter(m => m.timestamp >= tenMinutesAgo);
      this.serviceMetrics.set(serviceType, filteredMetrics);

      this.emit('serviceMetricsRecorded', metrics);
    }
  }

  /**
   * 手动触发扩缩容
   */
  async triggerScaling(serviceType: string): Promise<ScalingAction> {
    return this.evaluateScaling(serviceType);
  }

  /**
   * 获取服务的当前扩缩容状态
   */
  getScalingStatus(serviceType: string): {
    configured: boolean;
    config?: AutoScalingConfig;
    currentInstances: number;
    metrics?: ServiceMetrics[];
    lastScalingAction?: number;
  } {
    const config = this.scalingConfigs.get(serviceType);
    const currentInstances = this.getCurrentInstanceCount(serviceType);
    const metrics = this.serviceMetrics.get(serviceType);
    const lastScalingAction = this.lastScalingActions.get(serviceType);

    return {
      configured: !!config,
      config,
      currentInstances,
      metrics,
      lastScalingAction
    };
  }

  /**
   * 开始监控服务的扩缩容
   */
  private startScalingMonitoring(serviceType: string): void {
    this.stopScalingMonitoring(serviceType);

    const interval = setInterval(async () => {
      try {
        await this.evaluateScaling(serviceType);
      } catch (error) {
        logger.error(`Error evaluating scaling for service ${serviceType}:`, 'AutoScalingManager', { error }, error as Error);
      }
    }, 30000); // 每30秒评估一次

    this.scalingIntervals.set(serviceType, interval);
  }

  /**
   * 停止监控服务的扩缩容
   */
  private stopScalingMonitoring(serviceType: string): void {
    const interval = this.scalingIntervals.get(serviceType);
    if (interval) {
      clearInterval(interval);
      this.scalingIntervals.delete(serviceType);
    }
  }

  /**
   * 评估服务的扩缩容需求
   */
  private async evaluateScaling(serviceType: string): Promise<ScalingAction> {
    const config = this.scalingConfigs.get(serviceType);
    if (!config) {
      throw new Error(`No auto scaling config for service type ${serviceType}`);
    }

    // 检查冷却期
    const lastActionTime = this.lastScalingActions.get(serviceType);
    if (lastActionTime && Date.now() - lastActionTime < config.coolDownPeriod) {
      return {
        action: 'no_action',
        serviceType,
        currentInstances: this.getCurrentInstanceCount(serviceType),
        targetInstances: this.getCurrentInstanceCount(serviceType),
        reason: 'Cooling down period active',
        metrics: this.serviceMetrics.get(serviceType) || [],
        timestamp: Date.now()
      };
    }

    // 获取当前实例数
    const currentInstances = this.getCurrentInstanceCount(serviceType);

    // 获取服务指标
    const metrics = this.serviceMetrics.get(serviceType) || [];
    const recentMetrics = this.getRecentMetrics(metrics, 5 * 60 * 1000); // 最近5分钟的指标

    if (recentMetrics.length === 0) {
      return {
        action: 'no_action',
        serviceType,
        currentInstances,
        targetInstances: currentInstances,
        reason: 'Insufficient metrics data',
        metrics: [],
        timestamp: Date.now()
      };
    }

    // 计算平均指标
    const averageMetrics = this.calculateAverageMetrics(recentMetrics);

    // 预测未来指标
    const predictedMetrics = this.predictFutureMetrics(recentMetrics);

    // 评估是否需要扩缩容
    let scalingDecision = this.makeScalingDecision(config, averageMetrics, currentInstances, predictedMetrics);

    // 执行扩缩容操作
    if (scalingDecision.action !== 'no_action') {
      await this.executeScalingAction(scalingDecision);
      this.lastScalingActions.set(serviceType, Date.now());
    }

    this.emit('scalingEvaluated', scalingDecision);
    return scalingDecision;
  }

  /**
   * 预测未来指标
   */
  private predictFutureMetrics(metrics: ServiceMetrics[]): ServiceMetrics {
    if (metrics.length < 3) {
      // 数据不足，返回当前平均值
      return this.calculateAverageMetrics(metrics);
    }

    // 简单的线性预测
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);

    // 计算趋势
    const cpuTrend = this.calculateTrend(sortedMetrics.map(m => m.cpuUsage));
    const memoryTrend = this.calculateTrend(sortedMetrics.map(m => m.memoryUsage));
    const requestRateTrend = this.calculateTrend(sortedMetrics.map(m => m.requestRate));
    const responseTimeTrend = this.calculateTrend(sortedMetrics.map(m => m.responseTime));
    const errorRateTrend = this.calculateTrend(sortedMetrics.map(m => m.errorRate));
    const diskIOTrend = this.calculateTrend(sortedMetrics.map(m => m.diskIO || 0));
    const networkIOTrend = this.calculateTrend(sortedMetrics.map(m => m.networkIO || 0));
    const queueLengthTrend = this.calculateTrend(sortedMetrics.map(m => m.queueLength || 0));
    const throughputTrend = this.calculateTrend(sortedMetrics.map(m => m.throughput || 0));

    // 获取最新指标
    const latestMetrics = sortedMetrics[sortedMetrics.length - 1];

    // 预测未来5分钟的指标
    const predictionTime = 5 * 60 * 1000;
    const timeInterval = sortedMetrics.length > 1
      ? sortedMetrics[sortedMetrics.length - 1].timestamp - sortedMetrics[0].timestamp
      : 60000;
    const predictionFactor = predictionTime / timeInterval;

    return {
      serviceId: 'predicted',
      cpuUsage: Math.max(0, Math.min(100, latestMetrics.cpuUsage + cpuTrend * predictionFactor)),
      memoryUsage: Math.max(0, Math.min(100, latestMetrics.memoryUsage + memoryTrend * predictionFactor)),
      requestRate: Math.max(0, latestMetrics.requestRate + requestRateTrend * predictionFactor),
      responseTime: Math.max(0, latestMetrics.responseTime + responseTimeTrend * predictionFactor),
      errorRate: Math.max(0, Math.min(100, latestMetrics.errorRate + errorRateTrend * predictionFactor)),
      diskIO: Math.max(0, Math.min(100, (latestMetrics.diskIO || 0) + diskIOTrend * predictionFactor)),
      networkIO: Math.max(0, Math.min(100, (latestMetrics.networkIO || 0) + networkIOTrend * predictionFactor)),
      queueLength: Math.max(0, (latestMetrics.queueLength || 0) + queueLengthTrend * predictionFactor),
      throughput: Math.max(0, (latestMetrics.throughput || 0) + throughputTrend * predictionFactor),
      timestamp: Date.now() + predictionTime
    };
  }

  /**
   * 计算趋势
   */
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

  /**
   * 执行扩缩容操作
   */
  private async executeScalingAction(action: ScalingAction): Promise<void> {
    const config = this.scalingConfigs.get(action.serviceType);
    if (!config) return;

    const currentInstances = this.getCurrentInstanceCount(action.serviceType);
    const instancesToAdd = action.targetInstances - currentInstances;

    if (instancesToAdd > 0) {
      // 扩容
      for (let i = 0; i < instancesToAdd; i++) {
        await this.scaleUp(action.serviceType, config);
      }
    } else if (instancesToAdd < 0) {
      // 缩容
      const instancesToRemove = Math.abs(instancesToAdd);
      await this.scaleDown(action.serviceType, instancesToRemove);
    }
  }

  /**
   * 扩容服务
   */
  private async scaleUp(serviceType: string, config: AutoScalingConfig): Promise<void> {
    const instanceId = `instance_${serviceType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const serviceUrl = `http://${serviceType}-${instanceId}:${this.getServicePort(serviceType)}`;

    // 注册新服务实例
    const serviceId = this.serviceRegistry.registerService({
      id: instanceId,
      name: `${serviceType}-instance`,
      type: serviceType,
      version: '1.0.0',
      url: serviceUrl,
      healthCheckUrl: `${serviceUrl}${config.instanceConfig?.tags?.includes('health-check') ? '/health' : '/'}`,
      metadata: {
        autoScaled: 'true',
        scalingGroup: serviceType,
        ...config.instanceConfig?.environmentVariables
      },
      tags: config.instanceConfig?.tags || []
    });

    this.emit('serviceScaledUp', {
      serviceType,
      serviceId,
      instanceId,
      serviceUrl,
      timestamp: Date.now()
    });
  }

  /**
   * 缩容服务
   */
  private async scaleDown(serviceType: string, instancesToRemove: number): Promise<void> {
    // 获取服务实例
    const services = this.serviceRegistry.discoverService(serviceType);

    // 按照启动时间排序，优先移除最早启动的实例
    const sortedServices = services.sort((a, b) => {
      const aStartTime = parseInt(a.id.split('_').pop() || '0');
      const bStartTime = parseInt(b.id.split('_').pop() || '0');
      return aStartTime - bStartTime;
    });

    // 移除指定数量的实例
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

  /**
   * 做出扩缩容决策
   */
  private makeScalingDecision(
    config: AutoScalingConfig,
    currentMetrics: ServiceMetrics,
    currentInstances: number,
    predictedMetrics?: ServiceMetrics
  ): ScalingAction {
    const reasons: string[] = [];
    const shouldScaleUp = this.checkScaleUpConditions(currentMetrics, predictedMetrics, config, reasons);
    const shouldScaleDown = this.checkScaleDownConditions(currentMetrics, predictedMetrics, config, reasons);

    const action = this.determineScalingAction(shouldScaleUp, shouldScaleDown, currentInstances, config);
    const targetInstances = this.calculateTargetInstances(action, currentInstances, config, currentMetrics);
    const metrics = predictedMetrics ? [currentMetrics, predictedMetrics] : [currentMetrics];

    return {
      action,
      serviceType: config.serviceType,
      currentInstances,
      targetInstances,
      reason: reasons.length > 0 ? reasons.join('; ') : 'No scaling needed',
      metrics,
      timestamp: Date.now()
    };
  }

  private checkScaleUpConditions(
    currentMetrics: ServiceMetrics,
    predictedMetrics?: ServiceMetrics,
    config?: AutoScalingConfig,
    reasons?: string[]
  ): boolean {
    let shouldScaleUp = this.checkConfigThresholds(currentMetrics, config, reasons);
    shouldScaleUp = this.checkAdditionalMetrics(currentMetrics, reasons) || shouldScaleUp;

    if (predictedMetrics && config) {
      shouldScaleUp = this.checkPredictiveScaleUpConditions(predictedMetrics, config, reasons) || shouldScaleUp;
    }

    return shouldScaleUp;
  }

  private checkConfigThresholds(
    metrics: ServiceMetrics,
    config?: AutoScalingConfig,
    reasons?: string[]
  ): boolean {
    let shouldScaleUp = false;
    const rules = config?.scalingRules;

    if (rules?.cpuThreshold && metrics.cpuUsage > rules.cpuThreshold) {
      shouldScaleUp = true;
      reasons?.push(`CPU usage (${metrics.cpuUsage.toFixed(2)}%) exceeds threshold`);
    }

    if (rules?.memoryThreshold && metrics.memoryUsage > rules.memoryThreshold) {
      shouldScaleUp = true;
      reasons?.push(`Memory usage exceeds threshold`);
    }

    if (rules?.requestRateThreshold && metrics.requestRate > rules.requestRateThreshold) {
      shouldScaleUp = true;
      reasons?.push(`Request rate exceeds threshold`);
    }

    if (rules?.responseTimeThreshold && metrics.responseTime > rules.responseTimeThreshold) {
      shouldScaleUp = true;
      reasons?.push(`Response time exceeds threshold`);
    }

    if (rules?.errorRateThreshold && metrics.errorRate > rules.errorRateThreshold) {
      shouldScaleUp = true;
      reasons?.push(`Error rate exceeds threshold`);
    }

    return shouldScaleUp;
  }

  private checkAdditionalMetrics(
    metrics: ServiceMetrics,
    reasons?: string[]
  ): boolean {
    let shouldScaleUp = false;

    if (metrics.diskIO > 80) {
      shouldScaleUp = true;
      reasons?.push(`Disk IO usage exceeds 80%`);
    }

    if (metrics.networkIO > 80) {
      shouldScaleUp = true;
      reasons?.push(`Network IO usage exceeds 80%`);
    }

    if (metrics.queueLength > 100) {
      shouldScaleUp = true;
      reasons?.push(`Queue length exceeds 100`);
    }

    return shouldScaleUp;
  }

  private checkPredictiveScaleUpConditions(
    predictedMetrics: ServiceMetrics,
    config: AutoScalingConfig,
    reasons?: string[]
  ): boolean {
    let shouldScaleUp = false;

    if (config.scalingRules.cpuThreshold && predictedMetrics.cpuUsage > config.scalingRules.cpuThreshold * 0.8) {
      shouldScaleUp = true;
      reasons?.push(`Predicted CPU usage (${predictedMetrics.cpuUsage.toFixed(2)}%) will exceed threshold soon`);
    }

    if (config.scalingRules.requestRateThreshold && predictedMetrics.requestRate > config.scalingRules.requestRateThreshold * 0.8) {
      shouldScaleUp = true;
      reasons?.push(`Predicted request rate (${predictedMetrics.requestRate.toFixed(2)} req/s) will exceed threshold soon`);
    }

    if (predictedMetrics.diskIO > 70) {
      shouldScaleUp = true;
      reasons?.push(`Predicted disk IO usage (${predictedMetrics.diskIO.toFixed(2)}%) will exceed threshold soon`);
    }

    if (predictedMetrics.networkIO > 70) {
      shouldScaleUp = true;
      reasons?.push(`Predicted network IO usage (${predictedMetrics.networkIO.toFixed(2)}%) will exceed threshold soon`);
    }

    if (predictedMetrics.queueLength > 80) {
      shouldScaleUp = true;
      reasons?.push(`Predicted queue length (${predictedMetrics.queueLength.toFixed(2)}) will exceed threshold soon`);
    }

    return shouldScaleUp;
  }

  private checkScaleDownConditions(
    currentMetrics: ServiceMetrics,
    predictedMetrics?: ServiceMetrics,
    config?: AutoScalingConfig,
    reasons?: string[]
  ): boolean {
    let shouldScaleDown = false;
    const scaleDownThresholdFactor = 0.7;
    const rules = config?.scalingRules;

    if (rules?.cpuThreshold && currentMetrics.cpuUsage < rules.cpuThreshold * scaleDownThresholdFactor) {
      shouldScaleDown = true;
      reasons?.push(`CPU usage (${currentMetrics.cpuUsage.toFixed(2)}%) is below scaling down threshold`);
    }

    if (rules?.memoryThreshold && currentMetrics.memoryUsage < rules.memoryThreshold * scaleDownThresholdFactor) {
      shouldScaleDown = true;
      reasons?.push(`Memory usage (${currentMetrics.memoryUsage.toFixed(2)}%) is below scaling down threshold`);
    }

    if (rules?.requestRateThreshold && currentMetrics.requestRate < rules.requestRateThreshold * scaleDownThresholdFactor) {
      shouldScaleDown = true;
      reasons?.push(`Request rate (${currentMetrics.requestRate.toFixed(2)} req/s) is below scaling down threshold`);
    }

    if (currentMetrics.diskIO < 30 && currentMetrics.networkIO < 30 && currentMetrics.queueLength < 20) {
      shouldScaleDown = true;
      reasons?.push(`System resources usage is low`);
    }

    if (predictedMetrics && config) {
      shouldScaleDown = this.checkPredictiveScaleDownConditions(predictedMetrics, config, reasons) || shouldScaleDown;
    }

    return shouldScaleDown;
  }

  private checkPredictiveScaleDownConditions(
    predictedMetrics: ServiceMetrics,
    config: AutoScalingConfig,
    reasons?: string[]
  ): boolean {
    let shouldScaleDown = false;
    const scaleDownThresholdFactor = 0.7;

    if (config.scalingRules.cpuThreshold && predictedMetrics.cpuUsage < config.scalingRules.cpuThreshold * scaleDownThresholdFactor * 0.8) {
      shouldScaleDown = true;
      reasons?.push(`Predicted CPU usage (${predictedMetrics.cpuUsage.toFixed(2)}%) will remain low`);
    }

    if (config.scalingRules.requestRateThreshold && predictedMetrics.requestRate < config.scalingRules.requestRateThreshold * scaleDownThresholdFactor * 0.8) {
      shouldScaleDown = true;
      reasons?.push(`Predicted request rate (${predictedMetrics.requestRate.toFixed(2)} req/s) will remain low`);
    }

    if (predictedMetrics.diskIO < 25 && predictedMetrics.networkIO < 25 && predictedMetrics.queueLength < 15) {
      shouldScaleDown = true;
      reasons?.push(`Predicted system resources usage will remain low`);
    }

    return shouldScaleDown;
  }

  private determineScalingAction(
    shouldScaleUp: boolean,
    shouldScaleDown: boolean,
    currentInstances: number,
    config: AutoScalingConfig
  ): 'scale_up' | 'scale_down' | 'no_action' {
    if (shouldScaleUp && currentInstances < config.maxInstances) {
      return 'scale_up';
    }
    if (shouldScaleDown && currentInstances > config.minInstances) {
      return 'scale_down';
    }
    return 'no_action';
  }

  private calculateTargetInstances(
    action: 'scale_up' | 'scale_down' | 'no_action',
    currentInstances: number,
    config: AutoScalingConfig,
    currentMetrics: ServiceMetrics
  ): number {
    if (action === 'scale_up') {
      const scaleFactor = this.calculateScaleFactor(currentMetrics, config);
      return Math.min(currentInstances + Math.max(1, Math.floor(scaleFactor)), config.maxInstances);
    }
    if (action === 'scale_down') {
      return Math.max(currentInstances - 1, config.minInstances);
    }
    return currentInstances;
  }

  /**
   * 计算扩容因子
   */
  private calculateScaleFactor(metrics: ServiceMetrics, config: AutoScalingConfig): number {
    let scaleFactor = 1;

    // 基于CPU使用率计算
    if (config.scalingRules.cpuThreshold && metrics.cpuUsage > config.scalingRules.cpuThreshold) {
      const cpuRatio = metrics.cpuUsage / config.scalingRules.cpuThreshold;
      scaleFactor = Math.max(scaleFactor, Math.ceil(cpuRatio * 0.5));
    }

    // 基于请求率计算
    if (config.scalingRules.requestRateThreshold && metrics.requestRate > config.scalingRules.requestRateThreshold) {
      const requestRatio = metrics.requestRate / config.scalingRules.requestRateThreshold;
      scaleFactor = Math.max(scaleFactor, Math.ceil(requestRatio * 0.5));
    }

    return Math.min(scaleFactor, 3); // 最多一次扩容3个实例
  }

  /**
   * 获取当前服务实例数
   */
  private getCurrentInstanceCount(serviceType: string): number {
    return this.serviceRegistry.discoverService(serviceType).length;
  }

  /**
   * 根据服务ID获取服务类型
   */
  private getServiceTypeByServiceId(serviceId: string): string | undefined {
    const service = this.serviceRegistry.getService(serviceId);
    return service?.type;
  }

  /**
   * 获取最近的指标
   */
  private getRecentMetrics(metrics: ServiceMetrics[], timeWindow: number): ServiceMetrics[] {
    const now = Date.now();
    return metrics.filter(m => now - m.timestamp <= timeWindow);
  }

  /**
   * 计算平均指标
   */
  private calculateAverageMetrics(metrics: ServiceMetrics[]): ServiceMetrics {
    if (metrics.length === 0) {
      return {
        serviceId: 'average',
        cpuUsage: 0,
        memoryUsage: 0,
        requestRate: 0,
        responseTime: 0,
        errorRate: 0,
        diskIO: 0,
        networkIO: 0,
        queueLength: 0,
        throughput: 0,
        timestamp: Date.now()
      };
    }

    const sum = metrics.reduce((acc, m) => {
      return {
        cpuUsage: acc.cpuUsage + m.cpuUsage,
        memoryUsage: acc.memoryUsage + m.memoryUsage,
        requestRate: acc.requestRate + m.requestRate,
        responseTime: acc.responseTime + m.responseTime,
        errorRate: acc.errorRate + m.errorRate,
        diskIO: acc.diskIO + (m.diskIO || 0),
        networkIO: acc.networkIO + (m.networkIO || 0),
        queueLength: acc.queueLength + (m.queueLength || 0),
        throughput: acc.throughput + (m.throughput || 0)
      };
    }, { cpuUsage: 0, memoryUsage: 0, requestRate: 0, responseTime: 0, errorRate: 0, diskIO: 0, networkIO: 0, queueLength: 0, throughput: 0 });

    return {
      serviceId: 'average',
      cpuUsage: sum.cpuUsage / metrics.length,
      memoryUsage: sum.memoryUsage / metrics.length,
      requestRate: sum.requestRate / metrics.length,
      responseTime: sum.responseTime / metrics.length,
      errorRate: sum.errorRate / metrics.length,
      diskIO: sum.diskIO / metrics.length,
      networkIO: sum.networkIO / metrics.length,
      queueLength: sum.queueLength / metrics.length,
      throughput: sum.throughput / metrics.length,
      timestamp: Date.now()
    };
  }

  /**
   * 获取服务端口
   */
  private getServicePort(serviceType: string): number {
    // 根据服务类型返回对应的端口
    const portMap: Record<string, number> = {
      'customer-management': 3200,
      'form': 3201,
      'workflow': 3202,
      'content': 3203,
      'sales': 3204,
      'customer-service': 3205,
      'analytics': 3206,
      'ai': 3207,
      'auth': 3208,
      'api-gateway': 3209,
      'service-registry': 3210
    };

    return portMap[serviceType] || 3200 + Math.floor(Math.random() * 100);
  }



  /**
   * 订阅事件
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(listener);
  }

  /**
   * 取消订阅
   */
  off(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          logger.error(`Error in event listener for ${event}:`, 'AutoScalingManager', { error }, error as Error);
        }
      });
    }
  }

  /**
   * 关闭自动扩缩容管理器
   */
  shutdown(): void {
    // 停止所有监控间隔
    for (const serviceType of this.scalingIntervals.keys()) {
      this.stopScalingMonitoring(serviceType);
    }

    // 清空数据
    this.scalingConfigs.clear();
    this.serviceMetrics.clear();
    this.lastScalingActions.clear();
    this.eventListeners.clear();
  }

  /**
   * 获取自动扩缩容状态
   */
  getAutoScalingStatus(): {
    configuredServices: string[];
    serviceStatuses: Map<string, {
      config: AutoScalingConfig;
      currentInstances: number;
      metrics: ServiceMetrics[];
      lastScalingAction: number | undefined;
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
          lastScalingAction: this.lastScalingActions.get(serviceType)
        });
      }
    }

    return {
      configuredServices,
      serviceStatuses
    };
  }
}
