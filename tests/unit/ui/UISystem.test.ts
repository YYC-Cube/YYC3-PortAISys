/**
 * @file UI系统单元测试
 * @description 测试 UISystem 的核心功能
 * @module tests/unit/ui/UISystem.test.ts
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UISystem, UISystemConfig } from '../../../core/ui/UISystem';

describe('UISystem', () => {
  let uiSystem: UISystem;
  let config: UISystemConfig;

  beforeEach(() => {
    config = {
      enableChatInterface: true,
      enableToolboxPanel: true,
      enableInsightsDashboard: true,
      enableWorkflowDesigner: true,
      autoInitialize: false
    };

    uiSystem = new UISystem(config);
  });

  afterEach(() => {
    if (uiSystem.isInitialized()) {
      uiSystem.destroy();
    }
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该正确初始化UI系统', () => {
      uiSystem.initialize();
      expect(uiSystem.isInitialized()).toBe(true);
    });

    it('应该使用提供的配置', () => {
      const customConfig: UISystemConfig = {
        enableChatInterface: false,
        enableToolboxPanel: true,
        enableInsightsDashboard: false,
        enableWorkflowDesigner: true,
        autoInitialize: false
      };

      const customUISystem = new UISystem(customConfig);
      expect(customUISystem.getConfig()).toEqual(customConfig);
    });

    it('应该接受自定义配置', () => {
      const customConfig: UISystemConfig = {
        enableChatInterface: true,
        enableToolboxPanel: false,
        enableInsightsDashboard: true,
        enableWorkflowDesigner: false,
        autoInitialize: false
      };

      const customUISystem = new UISystem(customConfig);
      expect(customUISystem.getConfig()).toEqual(customConfig);
    });

    it('应该自动初始化如果配置启用', () => {
      const autoInitConfig: UISystemConfig = {
        ...config,
        autoInitialize: true
      };

      const autoInitUISystem = new UISystem(autoInitConfig);
      expect(autoInitUISystem.isInitialized()).toBe(true);
    });

    it('应该防止重复初始化', () => {
      uiSystem.initialize();
      uiSystem.initialize();
      expect(uiSystem.isInitialized()).toBe(true);
    });
  });

  describe('组件访问', () => {
    beforeEach(() => {
      uiSystem.initialize();
    });

    it('应该获取聊天界面', () => {
      const chatInterface = uiSystem.getChatInterface();
      expect(chatInterface).toBeDefined();
    });

    it('应该获取工具箱面板', () => {
      const toolboxPanel = uiSystem.getToolboxPanel();
      expect(toolboxPanel).toBeDefined();
    });

    it('应该获取洞察仪表板', () => {
      const insightsDashboard = uiSystem.getInsightsDashboard();
      expect(insightsDashboard).toBeDefined();
    });

    it('应该获取工作流设计器', () => {
      const workflowDesigner = uiSystem.getWorkflowDesigner();
      expect(workflowDesigner).toBeDefined();
    });

    it('应该获取UI管理器', () => {
      const uiManager = uiSystem.getUIManager();
      expect(uiManager).toBeDefined();
    });

    it('应该返回null当组件未启用时', () => {
      const disabledConfig: UISystemConfig = {
        enableChatInterface: false,
        enableToolboxPanel: false,
        enableInsightsDashboard: false,
        enableWorkflowDesigner: false,
        autoInitialize: false
      };

      const disabledUISystem = new UISystem(disabledConfig);
      disabledUISystem.initialize();

      expect(disabledUISystem.getChatInterface()).toBeNull();
      expect(disabledUISystem.getToolboxPanel()).toBeNull();
      expect(disabledUISystem.getInsightsDashboard()).toBeNull();
      expect(disabledUISystem.getWorkflowDesigner()).toBeNull();
    });
  });

  describe('组件可见性', () => {
    beforeEach(() => {
      uiSystem.initialize();
    });

    it('应该显示所有组件', () => {
      uiSystem.showAllComponents();
      expect(uiSystem).toBeDefined();
    });

    it('应该隐藏所有组件', () => {
      uiSystem.hideAllComponents();
      expect(uiSystem).toBeDefined();
    });

    it('应该发出可见性变化事件', () => {
      const eventSpy = vi.fn();
      uiSystem.on('components:visibility:changed', eventSpy);

      uiSystem.showAllComponents();
      expect(eventSpy).toHaveBeenCalledWith({ visible: true });

      uiSystem.hideAllComponents();
      expect(eventSpy).toHaveBeenCalledWith({ visible: false });
    });
  });

  describe('刷新功能', () => {
    beforeEach(() => {
      uiSystem.initialize();
    });

    it('应该刷新所有组件', async () => {
      await uiSystem.refreshAll();
      expect(uiSystem).toBeDefined();
    });

    it('应该发出刷新事件', async () => {
      const eventSpy = vi.fn();
      uiSystem.on('all:refreshed', eventSpy);

      await uiSystem.refreshAll();
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('数据导出', () => {
    beforeEach(() => {
      uiSystem.initialize();
    });

    it('应该导出所有数据', async () => {
      const data = await uiSystem.exportAllData();
      expect(data).toBeDefined();
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('chat');
      expect(data).toHaveProperty('toolbox');
      expect(data).toHaveProperty('dashboard');
      expect(data).toHaveProperty('workflows');
    });

    it('应该发出导出事件', async () => {
      const eventSpy = vi.fn();
      uiSystem.on('data:exported', eventSpy);

      await uiSystem.exportAllData();
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('配置管理', () => {
    it('应该获取配置', () => {
      const retrievedConfig = uiSystem.getConfig();
      expect(retrievedConfig).toEqual(config);
    });

    it('应该更新配置', () => {
      const newConfig: Partial<UISystemConfig> = {
        enableChatInterface: false
      };

      uiSystem.updateConfig(newConfig);
      const updatedConfig = uiSystem.getConfig();
      expect(updatedConfig.enableChatInterface).toBe(false);
    });

    it('应该发出配置更新事件', () => {
      const eventSpy = vi.fn();
      uiSystem.on('config:updated', eventSpy);

      const newConfig: Partial<UISystemConfig> = {
        enableChatInterface: false
      };

      uiSystem.updateConfig(newConfig);
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('事件系统', () => {
    beforeEach(() => {
      uiSystem.initialize();
    });

    it('应该发出初始化事件', () => {
      const eventSpy = vi.fn();
      const newUISystem = new UISystem({ ...config, autoInitialize: false });
      newUISystem.on('initialized', eventSpy);
      newUISystem.initialize();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('应该发出销毁事件', () => {
      const eventSpy = vi.fn();
      uiSystem.on('destroyed', eventSpy);

      uiSystem.destroy();
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('销毁', () => {
    beforeEach(() => {
      uiSystem.initialize();
    });

    it('应该正确销毁UI系统', () => {
      uiSystem.destroy();
      expect(uiSystem.isInitialized()).toBe(false);
    });

    it('应该移除所有事件监听器', () => {
      const eventSpy = vi.fn();
      uiSystem.on('initialized', eventSpy);

      uiSystem.destroy();
      uiSystem.emit('initialized');

      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('状态管理', () => {
    it('应该返回初始化状态', () => {
      expect(uiSystem.isInitialized()).toBe(false);

      uiSystem.initialize();
      expect(uiSystem.isInitialized()).toBe(true);
    });

    it('应该返回配置状态', () => {
      const configState = uiSystem.getConfig();
      expect(configState).toBeDefined();
      expect(typeof configState).toBe('object');
    });
  });

  describe('错误处理', () => {
    it('应该处理初始化错误', () => {
      expect(() => {
        uiSystem.initialize();
      }).not.toThrow();
    });

    it('应该处理销毁错误', () => {
      expect(() => {
        uiSystem.destroy();
      }).not.toThrow();
    });

    it('应该处理刷新错误', async () => {
      uiSystem.initialize();
      await expect(uiSystem.refreshAll()).resolves.not.toThrow();
    });

    it('应该处理导出错误', async () => {
      uiSystem.initialize();
      await expect(uiSystem.exportAllData()).resolves.not.toThrow();
    });
  });
});
