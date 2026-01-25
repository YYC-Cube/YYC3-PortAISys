/**
 * @file 多环境配置管理系统测试
 * @description 测试多环境配置管理系统的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiEnvironmentConfigManager } from '../../../core/config/MultiEnvironmentConfigManager';
import * as fs from 'fs';
import * as path from 'path';

describe('MultiEnvironmentConfigManager', () => {
  let manager: MultiEnvironmentConfigManager;
  let testConfigDir: string;
  let testSecretsDir: string;

  beforeEach(() => {
    testConfigDir = path.join(__dirname, 'temp-config');
    testSecretsDir = path.join(__dirname, 'temp-secrets');

    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true, force: true });
    }

    if (fs.existsSync(testSecretsDir)) {
      fs.rmSync(testSecretsDir, { recursive: true, force: true });
    }

    fs.mkdirSync(testConfigDir, { recursive: true });
    fs.mkdirSync(testSecretsDir, { recursive: true });

    manager = new MultiEnvironmentConfigManager(testConfigDir, testSecretsDir);
  });

  afterEach(() => {
    manager.destroy();

    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true, force: true });
    }

    if (fs.existsSync(testSecretsDir)) {
      fs.rmSync(testSecretsDir, { recursive: true, force: true });
    }

    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化配置管理器', () => {
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(MultiEnvironmentConfigManager);
    });

    it('应该检测当前环境', () => {
      const currentEnv = manager.getCurrentEnvironment();
      expect(['development', 'staging', 'production', 'test']).toContain(currentEnv);
    });

    it('应该初始化验证规则', () => {
      const config = manager.createTemplate('development');
      expect(config).toBeDefined();
      expect(config.environment).toBe('development');
    });
  });

  describe('配置加载', () => {
    it('应该成功加载配置', async () => {
      const configData = {
        name: 'Test Environment',
        version: '1.0.0',
        description: 'Test configuration',
        variables: { PORT: 3000 },
        features: { feature1: true },
        services: { api: { host: 'localhost', port: 3000 } },
        database: { host: 'localhost', port: 5432, database: 'test', username: 'user' },
        cache: { host: 'localhost', port: 6379 },
        logging: { level: 'info' },
        monitoring: { enabled: true },
        security: { encryptionEnabled: true }
      };

      const secretsData = {
        database: { password: 'secret' },
        cache: { password: 'cache-secret' }
      };

      fs.writeFileSync(
        path.join(testConfigDir, 'development.json'),
        JSON.stringify(configData, null, 2)
      );

      fs.writeFileSync(
        path.join(testSecretsDir, 'development.secrets.json'),
        JSON.stringify(secretsData, null, 2)
      );

      await manager.loadConfig('development');

      const config = manager.getConfig('development');
      expect(config).toBeDefined();
      expect(config?.name).toBe('Test Environment');
      expect(config?.variables.get('PORT')).toBe(3000);
    });

    it('应该在配置文件不存在时使用默认值', async () => {
      await manager.loadConfig('development');

      const config = manager.getConfig('development');
      expect(config).toBeDefined();
      expect(config?.environment).toBe('development');
    });

    it('应该加载所有环境的配置', async () => {
      const configData = {
        name: 'Test Environment',
        variables: { PORT: 3000 },
        features: {},
        services: {},
        database: { host: 'localhost', port: 5432, database: 'test', username: 'user' },
        cache: { host: 'localhost', port: 6379 },
        logging: { level: 'info' },
        monitoring: {},
        security: {}
      };

      const secretsData = {};

      ['development', 'staging', 'production'].forEach(env => {
        fs.writeFileSync(
          path.join(testConfigDir, `${env}.json`),
          JSON.stringify(configData, null, 2)
        );

        fs.writeFileSync(
          path.join(testSecretsDir, `${env}.secrets.json`),
          JSON.stringify(secretsData, null, 2)
        );
      });

      await manager.loadAllConfigs();

      expect(manager.getConfig('development')).toBeDefined();
      expect(manager.getConfig('staging')).toBeDefined();
      expect(manager.getConfig('production')).toBeDefined();
    });
  });

  describe('配置保存', () => {
    it('应该成功保存配置', async () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      await manager.saveConfig('development');

      const configPath = path.join(testConfigDir, 'development.json');
      const secretsPath = path.join(testSecretsDir, 'development.secrets.json');

      expect(fs.existsSync(configPath)).toBe(true);
      expect(fs.existsSync(secretsPath)).toBe(true);

      const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(savedConfig.name).toBe('development Template');
    });

    it('应该在配置不存在时抛出错误', async () => {
      await expect(manager.saveConfig('nonexistent')).rejects.toThrow();
    });
  });

  describe('环境切换', () => {
    it('应该成功切换环境', async () => {
      await manager.loadConfig('development');
      await manager.loadConfig('staging');

      manager.switchEnvironment('staging');

      expect(manager.getCurrentEnvironment()).toBe('staging');
    });

    it('应该在切换到相同环境时不执行操作', async () => {
      await manager.loadConfig('development');
      const currentEnv = manager.getCurrentEnvironment();

      manager.switchEnvironment(currentEnv);

      expect(manager.getCurrentEnvironment()).toBe(currentEnv);
    });

    it('应该在环境不存在时抛出错误', () => {
      expect(() => {
        manager.switchEnvironment('nonexistent');
      }).toThrow();
    });
  });

  describe('变量管理', () => {
    it('应该获取变量', async () => {
      const config = manager.createTemplate('development');
      config.variables.set('TEST_VAR', 'test-value');
      manager['configs'].set('development', config);

      const value = manager.getVariable('TEST_VAR', 'development');
      expect(value).toBe('test-value');
    });

    it('应该设置变量', async () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      manager.setVariable('NEW_VAR', 'new-value', 'development');

      const value = manager.getVariable('NEW_VAR', 'development');
      expect(value).toBe('new-value');
    });

    it('应该在配置不存在时抛出错误', () => {
      expect(() => {
        manager.setVariable('TEST', 'value', 'nonexistent');
      }).toThrow();
    });
  });

  describe('密钥管理', () => {
    it('应该获取密钥', async () => {
      const config = manager.createTemplate('development');
      config.secrets.set('SECRET_KEY', 'secret-value');
      manager['configs'].set('development', config);

      const value = manager.getSecret('SECRET_KEY', 'development');
      expect(value).toBe('secret-value');
    });

    it('应该设置密钥', async () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      manager.setSecret('NEW_SECRET', 'new-secret', 'development');

      const value = manager.getSecret('NEW_SECRET', 'development');
      expect(value).toBe('new-secret');
    });
  });

  describe('功能开关', () => {
    it('应该检查功能是否启用', async () => {
      const config = manager.createTemplate('development');
      config.features.set('feature1', true);
      manager['configs'].set('development', config);

      const isEnabled = manager.isFeatureEnabled('feature1', 'development');
      expect(isEnabled).toBe(true);
    });

    it('应该启用功能', async () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      manager.enableFeature('new-feature', 'development');

      const isEnabled = manager.isFeatureEnabled('new-feature', 'development');
      expect(isEnabled).toBe(true);
    });

    it('应该禁用功能', async () => {
      const config = manager.createTemplate('development');
      config.features.set('feature1', true);
      manager['configs'].set('development', config);

      manager.disableFeature('feature1', 'development');

      const isEnabled = manager.isFeatureEnabled('feature1', 'development');
      expect(isEnabled).toBe(false);
    });
  });

  describe('服务配置', () => {
    it('应该获取服务配置', async () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      const service = manager.getService('api', 'development');
      expect(service).toBeDefined();
      expect(service?.host).toBe('localhost');
      expect(service?.port).toBe(3000);
    });

    it('应该在服务不存在时返回undefined', async () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      const service = manager.getService('nonexistent', 'development');
      expect(service).toBeUndefined();
    });
  });

  describe('配置验证', () => {
    it('应该验证有效配置', async () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      const result = manager.validateConfig('development');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('应该在配置无效时返回错误', async () => {
      const config = manager.createTemplate('development');
      config.database.port = 99999;
      manager['configs'].set('development', config);

      const result = manager.validateConfig('development');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('应该在生产环境中返回警告', async () => {
      const config = manager.createTemplate('production');
      config.security.encryptionEnabled = false;
      config.security.allowedOrigins = ['*'];
      manager['configs'].set('production', config);

      const result = manager.validateConfig('production');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('应该在配置不存在时返回错误', () => {
      const result = manager.validateConfig('nonexistent');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('环境比较', () => {
    it('应该比较两个环境的配置', async () => {
      const config1 = manager.createTemplate('development');
      config1.variables.set('VAR1', 'value1');
      manager['configs'].set('development', config1);

      const config2 = manager.createTemplate('staging');
      config2.variables.set('VAR1', 'value2');
      manager['configs'].set('staging', config2);

      const differences = manager.compareEnvironments('development', 'staging');
      expect(differences.size).toBeGreaterThan(0);
    });

    it('应该在配置不存在时抛出错误', () => {
      expect(() => {
        manager.compareEnvironments('development', 'nonexistent');
      }).toThrow();
    });
  });

  describe('配置导出', () => {
    it('应该导出JSON格式配置', async () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      const exported = manager.exportConfig('development', 'json');
      const parsed = JSON.parse(exported);

      expect(parsed.name).toBe('development Template');
      expect(parsed.environment).toBe('development');
    });

    it('应该导出ENV格式配置', async () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      const exported = manager.exportConfig('development', 'env');

      expect(exported).toContain('NODE_ENV=development');
      expect(exported).toContain('PORT=3000');
    });

    it('应该在配置不存在时抛出错误', () => {
      expect(() => {
        manager.exportConfig('nonexistent');
      }).toThrow();
    });
  });

  describe('配置导入', () => {
    it('应该成功导入配置', async () => {
      const configData = JSON.stringify({
        name: 'Imported Config',
        version: '2.0.0',
        description: 'Imported configuration',
        variables: { IMPORTED_VAR: 'imported-value' },
        features: {},
        services: {},
        database: { host: 'localhost', port: 5432, database: 'test', username: 'user' },
        cache: { host: 'localhost', port: 6379 },
        logging: { level: 'info' },
        monitoring: {},
        security: {}
      });

      await manager.importConfig('imported', configData);

      const config = manager.getConfig('imported');
      expect(config).toBeDefined();
      expect(config?.name).toBe('Imported Config');
    });

    it('应该在JSON无效时抛出错误', async () => {
      await expect(
        manager.importConfig('invalid', 'invalid json')
      ).rejects.toThrow();
    });
  });

  describe('配置模板', () => {
    it('应该创建配置模板', () => {
      const template = manager.createTemplate('development');

      expect(template).toBeDefined();
      expect(template.environment).toBe('development');
      expect(template.variables.size).toBeGreaterThan(0);
      expect(template.features.size).toBeGreaterThan(0);
      expect(template.services.size).toBeGreaterThan(0);
    });

    it('应该创建不同环境的模板', () => {
      const devTemplate = manager.createTemplate('development');
      const prodTemplate = manager.createTemplate('production');

      expect(devTemplate.environment).toBe('development');
      expect(prodTemplate.environment).toBe('production');
    });
  });

  describe('事件系统', () => {
    it('应该在配置加载时发射事件', async () => {
      const handler = vi.fn();
      manager.on('config:loaded', handler);

      const configData = {
        name: 'Test Environment',
        variables: {},
        features: {},
        services: {},
        database: { host: 'localhost', port: 5432, database: 'test', username: 'user' },
        cache: { host: 'localhost', port: 6379 },
        logging: { level: 'info' },
        monitoring: {},
        security: {}
      };

      fs.writeFileSync(
        path.join(testConfigDir, 'development.json'),
        JSON.stringify(configData, null, 2)
      );

      fs.writeFileSync(
        path.join(testSecretsDir, 'development.secrets.json'),
        JSON.stringify({}, null, 2)
      );

      await manager.loadConfig('development');

      expect(handler).toHaveBeenCalled();
    });

    it('应该在环境切换时发射事件', async () => {
      const handler = vi.fn();
      manager.on('environment:switched', handler);

      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      const config2 = manager.createTemplate('staging');
      manager['configs'].set('staging', config2);

      manager.switchEnvironment('staging');

      expect(handler).toHaveBeenCalled();
    });

    it('应该在变量更新时发射事件', () => {
      const handler = vi.fn();
      manager.on('variable:updated', handler);

      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      manager.setVariable('TEST', 'value', 'development');

      expect(handler).toHaveBeenCalled();
    });

    it('应该在功能启用时发射事件', () => {
      const handler = vi.fn();
      manager.on('feature:enabled', handler);

      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      manager.enableFeature('new-feature', 'development');

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('销毁', () => {
    it('应该成功销毁管理器', () => {
      expect(() => {
        manager.destroy();
      }).not.toThrow();
    });

    it('应该清理所有资源', () => {
      const config = manager.createTemplate('development');
      manager['configs'].set('development', config);

      manager.destroy();

      const retrievedConfig = manager.getConfig('development');
      expect(retrievedConfig).toBeUndefined();
    });
  });

  describe('加载状态', () => {
    it('应该返回加载状态', () => {
      const isLoaded = manager.isLoaded();
      expect(typeof isLoaded).toBe('boolean');
    });

    it('应该在加载配置后更新状态', async () => {
      const configData = {
        name: 'Test Environment',
        variables: {},
        features: {},
        services: {},
        database: { host: 'localhost', port: 5432, database: 'test', username: 'user' },
        cache: { host: 'localhost', port: 6379 },
        logging: { level: 'info' },
        monitoring: {},
        security: {}
      };

      fs.writeFileSync(
        path.join(testConfigDir, 'development.json'),
        JSON.stringify(configData, null, 2)
      );

      fs.writeFileSync(
        path.join(testSecretsDir, 'development.secrets.json'),
        JSON.stringify({}, null, 2)
      );

      await manager.loadConfig('development');

      expect(manager.isLoaded()).toBe(true);
    });
  });

  describe('获取所有配置', () => {
    it('应该返回所有配置', async () => {
      const configData = {
        name: 'Test Environment',
        variables: {},
        features: {},
        services: {},
        database: { host: 'localhost', port: 5432, database: 'test', username: 'user' },
        cache: { host: 'localhost', port: 6379 },
        logging: { level: 'info' },
        monitoring: {},
        security: {}
      };

      ['development', 'staging'].forEach(env => {
        fs.writeFileSync(
          path.join(testConfigDir, `${env}.json`),
          JSON.stringify(configData, null, 2)
        );

        fs.writeFileSync(
          path.join(testSecretsDir, `${env}.secrets.json`),
          JSON.stringify({}, null, 2)
        );
      });

      await manager.loadAllConfigs();

      const allConfigs = manager.getAllConfigs();
      expect(allConfigs.size).toBeGreaterThanOrEqual(2);
    });
  });
});
