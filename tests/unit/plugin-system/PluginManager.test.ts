/**
 * @file unit/plugin-system/PluginManager.test.ts
 * @description Plugin Manager.test 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PluginManager } from '../../../core/plugin-system/PluginManager';
import type { Plugin } from '../../../core/plugin-system/types';

function createMockPlugin(id: string, extra?: Partial<Plugin>): Plugin {
  return {
    id,
    manifest: {
      id,
      name: id,
      version: '1.0.0',
      description: 'Test plugin',
      author: 'test',
    },
    enabled: false,
    ...extra,
  };
}

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager({ autoUpdate: false });
  });

  afterEach(async () => {
    await manager.shutdown();
  });

  describe('initialize', () => {
    it('应该成功初始化', async () => {
      await manager.initialize();
      expect(manager).toBeDefined();
    });
  });

  describe('register + getAllPlugins', () => {
    it('应该成功注册插件', async () => {
      const plugin = createMockPlugin('test-plugin');
      await manager.register(plugin);
      const all = manager.getAllPlugins();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('test-plugin');
    });

    it('应该拒绝重复注册', async () => {
      const plugin = createMockPlugin('dup-plugin');
      await manager.register(plugin);
      await expect(manager.register(plugin)).rejects.toThrow();
    });
  });

  describe('getPlugin', () => {
    it('应该返回已注册的插件', async () => {
      const plugin = createMockPlugin('get-test');
      await manager.register(plugin);
      const found = manager.getPlugin('get-test');
      expect(found).toBeDefined();
      expect(found!.id).toBe('get-test');
    });

    it('应该返回 undefined 当插件不存在', () => {
      expect(manager.getPlugin('nonexistent')).toBeUndefined();
    });
  });

  describe('unregister', () => {
    it('应该成功注销插件', async () => {
      const plugin = createMockPlugin('unreg-test');
      await manager.register(plugin);
      await manager.unregister('unreg-test');
      expect(manager.getAllPlugins()).toHaveLength(0);
    });

    it('应该抛出异常当注销不存在的插件', async () => {
      await expect(manager.unregister('nonexistent')).rejects.toThrow();
    });
  });

  describe('shutdown', () => {
    it('应该成功关闭', async () => {
      await manager.initialize();
      await manager.shutdown();
      expect(true).toBe(true);
    });
  });
});
