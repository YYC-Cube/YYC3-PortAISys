/**
 * @file 自动化部署和监控系统测试
 * @description 测试自动化部署和监控系统的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AutomatedDeploymentManager,
  DeploymentConfig,
  DeploymentPipeline,
  DeploymentResult,
  EnvironmentConfig,
  MonitoringIntegration
} from '../../../core/deployment/AutomatedDeploymentManager';

describe('AutomatedDeploymentManager', () => {
  let manager: AutomatedDeploymentManager;

  beforeEach(() => {
    manager = new AutomatedDeploymentManager({
      enabled: true,
      provider: 'prometheus',
      config: {},
      metrics: {
        cpu: true,
        memory: true,
        requests: true,
        errors: true,
        latency: true
      },
      alerts: {
        enabled: true,
        thresholds: {
          errorRate: 5,
          latency: 1000,
          cpu: 80,
          memory: 85
        }
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化部署管理器', () => {
      expect(manager).toBeDefined();
      const monitoring = manager.getMonitoringIntegration();
      expect(monitoring.enabled).toBe(true);
    });

    it('应该初始化默认环境', () => {
      const environments = manager.getEnvironments();

      expect(environments.length).toBe(3);
      expect(environments.some(e => e.name === 'development')).toBe(true);
      expect(environments.some(e => e.name === 'staging')).toBe(true);
      expect(environments.some(e => e.name === 'production')).toBe(true);
    });

    it('应该使用默认监控配置', () => {
      const defaultManager = new AutomatedDeploymentManager();
      const monitoring = defaultManager.getMonitoringIntegration();

      expect(monitoring.enabled).toBe(true);
      expect(monitoring.provider).toBe('prometheus');
      expect(monitoring.metrics.cpu).toBe(true);
    });
  });

  describe('流水线管理', () => {
    it('应该成功创建流水线', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Test',
          type: 'test' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');

      expect(pipelineId).toBeDefined();
      expect(pipelineId).toMatch(/^pipeline-\d+-[a-z0-9]+$/);

      const pipeline = manager.getPipeline(pipelineId);
      expect(pipeline).toBeDefined();
      expect(pipeline?.name).toBe('Test Pipeline');
      expect(pipeline?.stages.length).toBe(3);
    });

    it('应该成功执行流水线', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Test',
          type: 'test' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      const result = await manager.executePipeline(pipelineId);

      expect(result.status).toBe('success');
      expect(result.version).toBeDefined();
      expect(result.environment).toBe('development');

      const pipeline = manager.getPipeline(pipelineId);
      expect(pipeline?.status).toBe('succeeded');
    });

    it('应该记录流水线执行历史', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      await manager.createPipeline('Pipeline 1', stages, trigger, 'development');
      await manager.createPipeline('Pipeline 2', stages, trigger, 'development');

      const pipelines = manager.getPipelines('development');
      expect(pipelines.length).toBe(2);
    });

    it('应该取消正在运行的流水线', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      
      await manager.cancelPipeline(pipelineId);

      const pipeline = manager.getPipeline(pipelineId);
      expect(pipeline?.status).toBe('cancelled');
    });

    it('应该防止重复执行流水线', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      
      const executionPromise = manager.executePipeline(pipelineId);
      
      await expect(manager.executePipeline(pipelineId)).rejects.toThrow('already running');
      
      await executionPromise;
    });
  });

  describe('阶段执行', () => {
    it('应该成功执行构建阶段', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      const pipeline = manager.getPipeline(pipelineId);
      const stageId = pipeline?.stages[0].id || '';

      await manager.executeStage(pipelineId, stageId, {
        environment: 'development',
        strategy: 'rolling',
        autoRollback: true,
        healthCheckEnabled: true,
        monitoringEnabled: true,
        notificationChannels: [],
        timeout: 1800000
      });

      const updatedPipeline = manager.getPipeline(pipelineId);
      const stage = updatedPipeline?.stages.find(s => s.type === 'build');
      expect(stage?.status).toBe('succeeded');
      expect(stage?.logs.length).toBeGreaterThan(0);
    });

    it('应该成功执行测试阶段', async () => {
      const stages = [
        {
          name: 'Test',
          type: 'test' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      const pipeline = manager.getPipeline(pipelineId);
      const stageId = pipeline?.stages[0].id || '';

      await manager.executeStage(pipelineId, stageId, {
        environment: 'development',
        strategy: 'rolling',
        autoRollback: true,
        healthCheckEnabled: true,
        monitoringEnabled: true,
        notificationChannels: [],
        timeout: 1800000
      });

      const updatedPipeline = manager.getPipeline(pipelineId);
      const stage = updatedPipeline?.stages.find(s => s.type === 'test');
      expect(stage?.status).toBe('succeeded');
    });

    it('应该成功执行部署阶段', async () => {
      const stages = [
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      const pipeline = manager.getPipeline(pipelineId);
      const stageId = pipeline?.stages[0].id || '';

      await manager.executeStage(pipelineId, stageId, {
        environment: 'development',
        strategy: 'rolling',
        autoRollback: true,
        healthCheckEnabled: true,
        monitoringEnabled: true,
        notificationChannels: [],
        timeout: 1800000
      });

      const updatedPipeline = manager.getPipeline(pipelineId);
      const stage = updatedPipeline?.stages.find(s => s.type === 'deploy');
      expect(stage?.status).toBe('succeeded');
    });
  });

  describe('回滚功能', () => {
    it('应该成功回滚部署', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      await manager.executePipeline(pipelineId);

      const result = await manager.rollbackDeployment(pipelineId, new Error('Deployment failed'));

      expect(result.status).toBe('rolled_back');
      expect(result.rollbackInfo).toBeDefined();
      expect(result.rollbackInfo?.reason).toBe('Deployment failed');
    });

    it('应该在失败时自动回滚', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      await manager.executePipeline(pipelineId);

      const stagesWithFailure = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const pipelineId2 = await manager.createPipeline('Test Pipeline 2', stagesWithFailure, trigger, 'development');
      
      const result = await manager.executePipeline(pipelineId2, {
        environment: 'development',
        strategy: 'rolling',
        autoRollback: true,
        healthCheckEnabled: true,
        monitoringEnabled: true,
        notificationChannels: [],
        timeout: 1800000
      });

      expect(result.status).toBe('success');
    });
  });

  describe('环境管理', () => {
    it('应该成功添加环境', () => {
      manager.addEnvironment('custom', {
        type: 'development',
        variables: { ENV: 'custom' },
        resources: {
          cpu: '100m',
          memory: '128Mi',
          replicas: 1
        },
        healthCheck: {
          enabled: true,
          endpoint: '/health',
          interval: 30,
          timeout: 5,
          retries: 3
        },
        monitoring: {
          enabled: true,
          metrics: ['cpu'],
          alerts: ['error-rate']
        }
      });

      const environment = manager.getEnvironment('custom');
      expect(environment).toBeDefined();
      expect(environment?.type).toBe('development');
    });

    it('应该成功更新环境', () => {
      manager.updateEnvironment('development', {
        resources: {
          cpu: '1000m',
          memory: '1Gi',
          replicas: 2
        }
      });

      const environment = manager.getEnvironment('development');
      expect(environment?.resources.cpu).toBe('1000m');
      expect(environment?.resources.replicas).toBe(2);
    });

    it('应该返回所有环境', () => {
      const environments = manager.getEnvironments();

      expect(environments.length).toBeGreaterThanOrEqual(3);
      expect(environments.some(e => e.name === 'development')).toBe(true);
    });
  });

  describe('监控集成', () => {
    it('应该成功更新监控配置', () => {
      manager.updateMonitoringIntegration({
        provider: 'datadog',
        metrics: {
          cpu: true,
          memory: true,
          requests: false,
          errors: true,
          latency: false
        }
      });

      const monitoring = manager.getMonitoringIntegration();
      expect(monitoring.provider).toBe('datadog');
      expect(monitoring.metrics.requests).toBe(false);
    });

    it('应该返回监控配置', () => {
      const monitoring = manager.getMonitoringIntegration();

      expect(monitoring).toBeDefined();
      expect(monitoring.enabled).toBe(true);
      expect(monitoring.provider).toBeDefined();
      expect(monitoring.metrics).toBeDefined();
    });
  });

  describe('部署指标', () => {
    it('应该正确计算部署指标', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId1 = await manager.createPipeline('Pipeline 1', stages, trigger, 'development');
      await manager.executePipeline(pipelineId1);
      
      const pipelineId2 = await manager.createPipeline('Pipeline 2', stages, trigger, 'development');
      await manager.executePipeline(pipelineId2);

      const metrics = manager.getDeploymentMetrics();

      expect(metrics.totalTime).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBe(100);
    });

    it('应该计算回滚次数', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      await manager.executePipeline(pipelineId);

      await manager.rollbackDeployment(pipelineId, new Error('Test rollback'));

      const metrics = manager.getDeploymentMetrics();
      expect(metrics.rollbackCount).toBe(1);
    });
  });

  describe('部署历史', () => {
    it('应该记录部署历史', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId1 = await manager.createPipeline('Pipeline 1', stages, trigger, 'development');
      await manager.executePipeline(pipelineId1);
      
      const pipelineId2 = await manager.createPipeline('Pipeline 2', stages, trigger, 'development');
      await manager.executePipeline(pipelineId2);

      const history = manager.getDeploymentHistory();
      expect(history.length).toBe(2);
    });

    it('应该限制返回的历史记录数量', async () => {
      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId1 = await manager.createPipeline('Pipeline 1', stages, trigger, 'development');
      await manager.executePipeline(pipelineId1);
      
      const pipelineId2 = await manager.createPipeline('Pipeline 2', stages, trigger, 'development');
      await manager.executePipeline(pipelineId2);
      
      const pipelineId3 = await manager.createPipeline('Pipeline 3', stages, trigger, 'development');
      await manager.executePipeline(pipelineId3);

      const history = manager.getDeploymentHistory(2);
      expect(history.length).toBe(2);
    }, 20000);
  });

  describe('事件发射', () => {
    it('应该在创建流水线时发射事件', async () => {
      const handler = vi.fn();
      manager.on('pipeline-created', handler);

      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      await manager.createPipeline('Test Pipeline', stages, trigger, 'development');

      expect(handler).toHaveBeenCalled();
    });

    it('应该在流水线开始时发射事件', async () => {
      const handler = vi.fn();
      manager.on('pipeline-started', handler);

      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      await manager.executePipeline(pipelineId);

      expect(handler).toHaveBeenCalled();
    });

    it('应该在流水线完成时发射事件', async () => {
      const handler = vi.fn();
      manager.on('pipeline-completed', handler);

      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      await manager.executePipeline(pipelineId);

      expect(handler).toHaveBeenCalled();
    });

    it('应该在阶段开始时发射事件', async () => {
      const handler = vi.fn();
      manager.on('stage-started', handler);

      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      const pipeline = manager.getPipeline(pipelineId);
      const stageId = pipeline?.stages[0].id || '';

      await manager.executeStage(pipelineId, stageId, {
        environment: 'development',
        strategy: 'rolling',
        autoRollback: true,
        healthCheckEnabled: true,
        monitoringEnabled: true,
        notificationChannels: [],
        timeout: 1800000
      });

      expect(handler).toHaveBeenCalled();
    });

    it('应该在回滚时发射事件', async () => {
      const handler = vi.fn();
      manager.on('rollback-initiated', handler);

      const stages = [
        {
          name: 'Build',
          type: 'build' as const,
          dependencies: []
        },
        {
          name: 'Deploy',
          type: 'deploy' as const,
          dependencies: []
        }
      ];

      const trigger = {
        type: 'manual' as const,
        source: 'user'
      };

      const pipelineId = await manager.createPipeline('Test Pipeline', stages, trigger, 'development');
      await manager.executePipeline(pipelineId);

      await manager.rollbackDeployment(pipelineId, new Error('Test rollback'));

      expect(handler).toHaveBeenCalled();
    });
  });
});
