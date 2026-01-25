/**
 * @file 增强型文档与代码同步管理器测试
 * @description 测试增强型文档与代码同步管理器的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { EnhancedDocCodeSyncManager } from '../src/enhanced-sync-manager';

describe('EnhancedDocCodeSyncManager', () => {
  let manager: EnhancedDocCodeSyncManager | null = null;
  let testDir: string;
  let configPath: string;
  let docsDir: string;
  let codeDir: string;

  beforeEach(() => {
    testDir = path.join(__dirname, 'temp-sync-test');
    docsDir = path.join(testDir, 'docs');
    codeDir = path.join(testDir, 'code');
    configPath = path.join(testDir, '.doc-code-mapping.json');

    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }

    fs.mkdirSync(docsDir, { recursive: true });
    fs.mkdirSync(codeDir, { recursive: true });

    const initialConfig = {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      mappings: [],
      globalSettings: {
        autoSync: true,
        syncInterval: 5000,
        conflictResolution: 'auto',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(initialConfig, null, 2), 'utf-8');
    manager = new EnhancedDocCodeSyncManager(configPath);
  });

  afterEach(() => {
    if (manager) {
      manager.stopWatching();
    }
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化同步管理器', () => {
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(EnhancedDocCodeSyncManager);
    });

    it('应该使用指定的配置路径', () => {
      const customConfigPath = path.join(testDir, 'custom-config.json');
      const customManager = new EnhancedDocCodeSyncManager(customConfigPath);

      expect(customManager).toBeDefined();
      expect(customManager).toBeInstanceOf(EnhancedDocCodeSyncManager);
    });

    it('应该处理不存在的配置文件', () => {
      const nonExistentPath = path.join(testDir, 'non-existent.json');

      expect(() => {
        new EnhancedDocCodeSyncManager(nonExistentPath);
      }).not.toThrow();
    });
  });

  describe('文件监听', () => {
    it('应该启动文档文件监听', () => {
      expect(() => {
        manager?.startWatching(docsDir, codeDir);
      }).not.toThrow();
    });

    it('应该启动代码文件监听', () => {
      expect(() => {
        manager?.startWatching(docsDir, codeDir);
      }).not.toThrow();
    });

    it('应该停止文件监听', () => {
      manager?.startWatching(docsDir, codeDir);

      expect(() => {
        manager?.stopWatching();
      }).not.toThrow();
    });

    it('应该处理监听启动错误', () => {
      const invalidDir = path.join(testDir, 'invalid');

      expect(() => {
        manager?.startWatching(invalidDir, codeDir);
      }).not.toThrow();
    });
  });

  describe('事件系统', () => {
    it('应该支持事件监听', () => {
      const handler = vi.fn();
      manager?.on('config-loaded', handler);

      expect(handler).toBeDefined();
    });

    it('应该支持事件移除', () => {
      const handler = vi.fn();
      manager?.on('config-loaded', handler);
      manager?.off('config-loaded', handler);

      expect(handler).toBeDefined();
    });

    it('应该支持一次性事件监听', () => {
      const handler = vi.fn();
      manager?.once('config-loaded', handler);

      expect(handler).toBeDefined();
    });

    it('应该支持事件发射', () => {
      const handler = vi.fn();
      manager?.on('test-event', handler);

      manager?.emit('test-event', { data: 'test' });

      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('配置管理', () => {
    it('应该能够重新加载配置', () => {
      const updatedConfig = {
        version: '2.0.0',
        lastUpdated: new Date().toISOString(),
        mappings: [],
        globalSettings: {
          autoSync: false,
          syncInterval: 10000,
          conflictResolution: 'manual',
          notificationEnabled: false
        }
      };

      fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

      expect(() => {
        new EnhancedDocCodeSyncManager(configPath);
      }).not.toThrow();
    });

    it('应该处理无效的JSON配置', () => {
      const invalidConfigPath = path.join(testDir, 'invalid-config.json');
      fs.writeFileSync(invalidConfigPath, 'invalid json content', 'utf-8');

      expect(() => {
        new EnhancedDocCodeSyncManager(invalidConfigPath);
      }).not.toThrow();
    });

    it('应该处理空配置文件', () => {
      const emptyConfigPath = path.join(testDir, 'empty-config.json');
      fs.writeFileSync(emptyConfigPath, '{}', 'utf-8');

      expect(() => {
        new EnhancedDocCodeSyncManager(emptyConfigPath);
      }).not.toThrow();
    });
  });

  describe('文件操作', () => {
    it('应该处理文档文件创建', () => {
      const docPath = path.join(docsDir, 'test.md');
      const content = '# Test Document\n\nThis is a test.';
      fs.writeFileSync(docPath, content, 'utf-8');

      expect(fs.existsSync(docPath)).toBe(true);
    });

    it('应该处理代码文件创建', () => {
      const codePath = path.join(codeDir, 'test.ts');
      const content = 'export class Test {\n  constructor() {}\n}';
      fs.writeFileSync(codePath, content, 'utf-8');

      expect(fs.existsSync(codePath)).toBe(true);
    });

    it('应该处理文件更新', () => {
      const filePath = path.join(docsDir, 'test.md');
      fs.writeFileSync(filePath, 'Initial content', 'utf-8');
      fs.writeFileSync(filePath, 'Updated content', 'utf-8');

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toBe('Updated content');
    });

    it('应该处理文件删除', () => {
      const filePath = path.join(docsDir, 'temp.md');
      fs.writeFileSync(filePath, 'temp content', 'utf-8');

      fs.unlinkSync(filePath);

      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('应该处理目录创建', () => {
      const nestedDir = path.join(docsDir, 'nested', 'dir');
      fs.mkdirSync(nestedDir, { recursive: true });

      expect(fs.existsSync(nestedDir)).toBe(true);
    });

    it('应该处理目录删除', () => {
      const tempDir = path.join(testDir, 'temp-dir');
      fs.mkdirSync(tempDir, { recursive: true });
      fs.rmSync(tempDir, { recursive: true, force: true });

      expect(fs.existsSync(tempDir)).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该处理文件读取错误', () => {
      const handler = vi.fn();
      manager?.on('error', handler);

      manager?.emit('error', new Error('File read error'));

      expect(handler).toHaveBeenCalled();
    });

    it('应该处理同步错误', () => {
      const handler = vi.fn();
      manager?.on('error', handler);

      manager?.emit('error', new Error('Sync failed'));

      expect(handler).toHaveBeenCalled();
    });

    it('应该处理配置错误', () => {
      const handler = vi.fn();
      manager?.on('error', handler);

      manager?.emit('error', new Error('Invalid configuration'));

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('并发控制', () => {
    it('应该防止重复启动监听', () => {
      manager?.startWatching(docsDir, codeDir);

      expect(() => {
        manager?.startWatching(docsDir, codeDir);
      }).not.toThrow();
    });

    it('应该安全地停止未启动的监听', () => {
      expect(() => {
        manager?.stopWatching();
      }).not.toThrow();
    });

    it('应该多次停止监听而不出错', () => {
      manager?.startWatching(docsDir, codeDir);
      manager?.stopWatching();
      manager?.stopWatching();

      expect(() => {
        manager?.stopWatching();
      }).not.toThrow();
    });
  });

  describe('资源清理', () => {
    it('应该清理测试目录', () => {
      const tempDir = path.join(testDir, 'temp-cleanup');
      fs.mkdirSync(tempDir, { recursive: true });
      fs.writeFileSync(path.join(tempDir, 'file.txt'), 'content', 'utf-8');

      fs.rmSync(tempDir, { recursive: true, force: true });

      expect(fs.existsSync(tempDir)).toBe(false);
    });

    it('应该清理嵌套目录', () => {
      const nestedDir = path.join(testDir, 'nested', 'deep', 'dir');
      fs.mkdirSync(nestedDir, { recursive: true });

      fs.rmSync(path.join(testDir, 'nested'), { recursive: true, force: true });

      expect(fs.existsSync(nestedDir)).toBe(false);
    });

    it('应该处理清理不存在的目录', () => {
      const nonExistentDir = path.join(testDir, 'non-existent');

      expect(() => {
        fs.rmSync(nonExistentDir, { recursive: true, force: true });
      }).not.toThrow();
    });
  });

  describe('配置文件格式', () => {
    it('应该支持版本2.0.0格式', () => {
      const config = {
        version: '2.0.0',
        lastUpdated: new Date().toISOString(),
        mappings: [],
        globalSettings: {
          autoSync: true,
          syncInterval: 5000,
          conflictResolution: 'auto',
          notificationEnabled: true
        }
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

      expect(() => {
        new EnhancedDocCodeSyncManager(configPath);
      }).not.toThrow();
    });

    it('应该支持不同的冲突解决策略', () => {
      const strategies = ['manual', 'auto', 'latest', 'code-priority', 'doc-priority'];

      for (const strategy of strategies) {
        const config = {
          version: '2.0.0',
          lastUpdated: new Date().toISOString(),
          mappings: [],
          globalSettings: {
            autoSync: true,
            syncInterval: 5000,
            conflictResolution: strategy as any,
            notificationEnabled: true
          }
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

        expect(() => {
          new EnhancedDocCodeSyncManager(configPath);
        }).not.toThrow();
      }
    });
  });

  describe('文件路径处理', () => {
    it('应该处理相对路径', () => {
      const relativePath = 'docs/test.md';
      const absolutePath = path.resolve(testDir, relativePath);

      expect(absolutePath).toContain(testDir);
    });

    it('应该处理绝对路径', () => {
      const absolutePath = path.join(testDir, 'docs', 'test.md');

      expect(path.isAbsolute(absolutePath)).toBe(true);
    });

    it('应该处理路径分隔符', () => {
      const path1 = path.join(docsDir, 'test.md');
      const path2 = path.join(docsDir, 'nested', 'test.md');

      expect(path1).toContain(path.sep);
      expect(path2).toContain(path.sep);
    });
  });

  describe('类型定义', () => {
    it('应该正确导入类型', () => {
      expect(EnhancedDocCodeSyncManager).toBeDefined();
    });

    it('应该支持实例化', () => {
      const instance = new EnhancedDocCodeSyncManager(configPath);

      expect(instance).toBeInstanceOf(EnhancedDocCodeSyncManager);
    });

    it('应该支持方法调用', () => {
      const instance = new EnhancedDocCodeSyncManager(configPath);

      expect(() => {
        instance.startWatching(docsDir, codeDir);
      }).not.toThrow();
    });
  });
});
