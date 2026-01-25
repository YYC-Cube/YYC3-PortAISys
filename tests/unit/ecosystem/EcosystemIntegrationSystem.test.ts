/**
 * @file 生态系统集成系统测试
 * @description 测试生态系统集成系统的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EcosystemIntegrationSystem, IntegrationManifest, IntegrationStatus, ConnectionStatus } from '../../../core/ecosystem/EcosystemIntegrationSystem';

describe('EcosystemIntegrationSystem', () => {
  let system: EcosystemIntegrationSystem;

  beforeEach(() => {
    system = new EcosystemIntegrationSystem();
  });

  afterEach(() => {
    system.destroy();
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化生态系统集成系统', () => {
      expect(system).toBeDefined();
      expect(system).toBeInstanceOf(EcosystemIntegrationSystem);
    });

    it('应该初始化默认集成', () => {
      const integrations = system.getIntegrations();
      expect(integrations.length).toBeGreaterThan(0);
    });

    it('应该包含OpenAI集成', () => {
      const openai = system.getIntegration('openai-integration');
      expect(openai).toBeDefined();
      expect(openai?.manifest.name).toBe('OpenAI Integration');
    });

    it('应该包含Slack集成', () => {
      const slack = system.getIntegration('slack-integration');
      expect(slack).toBeDefined();
      expect(slack?.manifest.name).toBe('Slack Integration');
    });

    it('应该包含GitHub集成', () => {
      const github = system.getIntegration('github-integration');
      expect(github).toBeDefined();
      expect(github?.manifest.name).toBe('GitHub Integration');
    });
  });

  describe('集成管理', () => {
    it('应该成功注册集成', () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);

      const integration = system.getIntegration('test-integration');
      expect(integration).toBeDefined();
      expect(integration?.manifest.id).toBe('test-integration');
    });

    it('应该成功注销集成', () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      system.unregisterIntegration('test-integration');

      const integration = system.getIntegration('test-integration');
      expect(integration).toBeUndefined();
    });

    it('应该获取所有集成', () => {
      const integrations = system.getIntegrations();
      expect(integrations.length).toBeGreaterThan(0);
      expect(integrations.every(int => int.manifest.id)).toBe(true);
    });

    it('应该按类别获取集成', () => {
      const aiIntegrations = system.getIntegrationsByCategory('ai');
      expect(aiIntegrations.length).toBeGreaterThan(0);
      expect(aiIntegrations.every(int => int.manifest.category === 'ai')).toBe(true);
    });
  });

  describe('集成启用/禁用', () => {
    it('应该成功启用集成', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      const integration = system.getIntegration('test-integration');
      expect(integration?.status).toBe(IntegrationStatus.ENABLED);
      expect(integration?.metadata.enabledAt).toBeDefined();
    });

    it('应该在启用时更新配置', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration', { apiKey: 'test-key' });

      const integration = system.getIntegration('test-integration');
      expect(integration?.config.apiKey).toBe('test-key');
    });

    it('应该成功禁用集成', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');
      await system.disableIntegration('test-integration');

      const integration = system.getIntegration('test-integration');
      expect(integration?.status).toBe(IntegrationStatus.DISABLED);
    });

    it('应该在集成不存在时抛出错误', async () => {
      await expect(
        system.enableIntegration('nonexistent')
      ).rejects.toThrow('Integration not found');
    });

    it('应该在禁用不存在的集成时抛出错误', async () => {
      await expect(
        system.disableIntegration('nonexistent')
      ).rejects.toThrow('Integration not found');
    });
  });

  describe('连接管理', () => {
    it('应该成功创建连接', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      const connectionId = await system.connect(
        'test-integration',
        'test-connection',
        'outbound',
        { url: 'https://example.com' }
      );

      expect(connectionId).toBeDefined();
      expect(connectionId).toContain('test-integration');
    });

    it('应该在集成未启用时抛出错误', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);

      await expect(
        system.connect('test-integration', 'test-connection', 'outbound', {})
      ).rejects.toThrow('Integration not enabled');
    });

    it('应该成功断开连接', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      const connectionId = await system.connect(
        'test-integration',
        'test-connection',
        'outbound',
        {}
      );

      const connectionBefore = system.getConnection(connectionId);
      expect(connectionBefore?.status).toBe(ConnectionStatus.CONNECTED);

      await system.disconnect(connectionId);

      const connectionAfter = system.getConnection(connectionId);
      expect(connectionAfter).toBeUndefined();
    });

    it('应该获取连接', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      const connectionId = await system.connect(
        'test-integration',
        'test-connection',
        'outbound',
        {}
      );

      const connection = system.getConnection(connectionId);
      expect(connection).toBeDefined();
      expect(connection?.name).toBe('test-connection');
    });

    it('应该获取集成的所有连接', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      await system.connect('test-integration', 'connection1', 'outbound', {});
      await system.connect('test-integration', 'connection2', 'inbound', {});

      const connections = system.getConnections('test-integration');
      expect(connections.length).toBe(2);
    });

    it('应该获取所有连接', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      await system.connect('test-integration', 'connection1', 'outbound', {});

      const connections = system.getConnections();
      expect(connections.length).toBeGreaterThan(0);
    });
  });

  describe('请求执行', () => {
    it('应该成功执行请求', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        endpoints: {
          api: 'https://api.example.com'
        },
        authentication: {
          type: 'api-key',
          apiKey: 'test-key'
        },
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        } as Response)
      );

      const result = await system.executeRequest('test-integration', 'api', 'GET');

      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('应该在集成未启用时抛出错误', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);

      await expect(
        system.executeRequest('test-integration', 'api', 'GET')
      ).rejects.toThrow('Integration not enabled');
    });

    it('应该在请求失败时抛出错误', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        endpoints: {
          api: 'https://api.example.com'
        },
        authentication: {
          type: 'api-key',
          apiKey: 'test-key'
        },
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        } as Response)
      );

      await expect(
        system.executeRequest('test-integration', 'api', 'GET')
      ).rejects.toThrow();
    });
  });

  describe('健康检查', () => {
    it('应该检查集成健康状态', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      const health = await system.checkIntegrationHealth('test-integration');

      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
    });

    it('应该在集成未启用时返回不健康状态', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);

      const health = await system.checkIntegrationHealth('test-integration');

      expect(health.status).toBe('unhealthy');
      expect(health.issues.length).toBeGreaterThan(0);
    });

    it('应该在无活动连接时返回降级状态', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      await system.connect('test-integration', 'connection1', 'outbound', {});
      await system.disconnect(system.getConnections('test-integration')[0].id);

      const health = await system.checkIntegrationHealth('test-integration');

      expect(health.status).toBe('degraded');
    });
  });

  describe('指标管理', () => {
    it('应该返回指标', () => {
      const metrics = system.getMetrics();

      expect(metrics).toHaveProperty('totalIntegrations');
      expect(metrics).toHaveProperty('activeIntegrations');
      expect(metrics).toHaveProperty('totalConnections');
      expect(metrics).toHaveProperty('activeConnections');
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('totalErrors');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('successRate');
    });

    it('应该重置指标', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      system.resetMetrics();

      const metrics = system.getMetrics();
      expect(metrics.totalIntegrations).toBeGreaterThan(0);
    });
  });

  describe('事件系统', () => {
    it('应该在集成注册时发射事件', () => {
      const handler = vi.fn();
      system.on('integration:registered', handler);

      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);

      expect(handler).toHaveBeenCalledWith(manifest);
    });

    it('应该在集成启用时发射事件', async () => {
      const handler = vi.fn();
      system.on('integration:enabled', handler);

      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      expect(handler).toHaveBeenCalled();
    });

    it('应该在连接创建时发射事件', async () => {
      const handler = vi.fn();
      system.on('connection:created', handler);

      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      await system.connect('test-integration', 'test-connection', 'outbound', {});

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('同步功能', () => {
    it('应该成功同步集成', async () => {
      const manifest: IntegrationManifest = {
        id: 'test-integration',
        name: 'Test Integration',
        version: '1.0.0',
        description: 'Test integration',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['test-capability'],
        permissions: ['test:read'],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      };

      system.registerIntegration(manifest);
      await system.enableIntegration('test-integration');

      await system.syncIntegration('test-integration');

      const integration = system.getIntegration('test-integration');
      expect(integration?.metadata.lastSync).toBeDefined();
    });

    it('应该在集成不存在时抛出错误', async () => {
      await expect(
        system.syncIntegration('nonexistent')
      ).rejects.toThrow('Integration not found');
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

      const integrations = system.getIntegrations();
      const connections = system.getConnections();

      expect(integrations.length).toBe(0);
      expect(connections.length).toBe(0);
    });
  });
});
