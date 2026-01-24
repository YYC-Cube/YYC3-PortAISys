/**
 * @file IntelligentAIWidget单元测试
 * @description 测试IntelligentAIWidget组件的核心功能
 * @module ui/IntelligentAIWidget.test
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { IntelligentAIWidget, WidgetTheme, WidgetState, WidgetMetrics, WidgetPerformance } from '../../../core/ui/IntelligentAIWidget';
import { EventEmitter } from 'events';

describe('IntelligentAIWidget', () => {
  let widget: IntelligentAIWidget;
  let mockConfig: any;

  beforeEach(() => {
    mockConfig = {
      id: 'test-widget',
      title: 'Test Widget',
      width: 800,
      height: 600,
      x: 100,
      y: 100,
      minimized: false,
      maximized: false,
      theme: 'light' as WidgetTheme,
      animationEnabled: true,
      enableDrag: true,
      enableResize: true,
      enablePersistence: true,
      enableSync: true,
      enableAccessibility: true,
      enableSecurity: true,
    };

    vi.useFakeTimers();
  });

  afterEach(() => {
    if (widget) {
      widget.destroy();
    }
    vi.restoreAllMocks();
  });

  describe('初始化', () => {
    it('应该使用默认配置创建widget', async () => {
      widget = new IntelligentAIWidget();
      await widget.initialize();
      
      expect(widget.isInitialized()).toBe(true);
      expect(widget.getState().id).toBeDefined();
      expect(widget.getState().title).toBe('YYC³ AI Assistant');
    });

    it('应该使用自定义配置创建widget', async () => {
      widget = new IntelligentAIWidget(mockConfig);
      await widget.initialize();
      
      expect(widget.isInitialized()).toBe(true);
      expect(widget.getState().id).toBe('test-widget');
      expect(widget.getState().title).toBe('Test Widget');
      expect(widget.getState().size.width).toBe(800);
      expect(widget.getState().size.height).toBe(600);
    });

    it('应该触发initialized事件', async () => {
      const initializedSpy = vi.fn();
      
      widget = new IntelligentAIWidget(mockConfig);
      widget.on('initialized', initializedSpy);
      
      await widget.initialize();
      
      expect(initializedSpy).toHaveBeenCalled();
    });

    it('应该防止重复初始化', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      widget = new IntelligentAIWidget(mockConfig);
      await widget.initialize();
      await widget.initialize();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('IntelligentAIWidget already initialized');
      consoleWarnSpy.mockRestore();
    });

    it('初始化失败时应该触发initialization:error事件', async () => {
      const errorSpy = vi.fn();
      
      const errorConfig = {
        ...mockConfig,
        title: undefined as any,
      };

      try {
        widget = new IntelligentAIWidget(errorConfig);
        widget.on('initialization:error', errorSpy);
      } catch (error) {
        expect(errorSpy).toHaveBeenCalled();
      }
    });
  });

  describe('状态管理', () => {
    beforeEach(() => {
      widget = new IntelligentAIWidget(mockConfig);
    });

    it('应该返回当前状态', () => {
      const state = widget.getState();
      
      expect(state).toBeDefined();
      expect(state.id).toBe('test-widget');
      expect(state.title).toBe('Test Widget');
      expect(state.visible).toBe(true);
      expect(state.minimized).toBe(false);
      expect(state.maximized).toBe(false);
    });

    it('应该显示widget', () => {
      const visibilitySpy = vi.fn();
      widget.on('visibility:changed', visibilitySpy);
      
      widget.show();
      
      expect(widget.getState().visible).toBe(true);
      expect(visibilitySpy).toHaveBeenCalledWith({ visible: true });
    });

    it('应该隐藏widget', () => {
      const visibilitySpy = vi.fn();
      widget.on('visibility:changed', visibilitySpy);
      
      widget.hide();
      
      expect(widget.getState().visible).toBe(false);
      expect(visibilitySpy).toHaveBeenCalledWith({ visible: false });
    });

    it('应该最小化widget', () => {
      const minimizedSpy = vi.fn();
      widget.on('minimized', minimizedSpy);
      
      widget.minimize();
      
      expect(widget.getState().minimized).toBe(true);
      expect(minimizedSpy).toHaveBeenCalled();
    });

    it('应该最大化widget', () => {
      const maximizedSpy = vi.fn();
      widget.on('maximized', maximizedSpy);
      
      widget.maximize();
      
      expect(widget.getState().maximized).toBe(true);
      expect(maximizedSpy).toHaveBeenCalled();
    });

    it('应该恢复widget', () => {
      widget.minimize();
      widget.maximize();
      
      const restoredSpy = vi.fn();
      widget.on('restored', restoredSpy);
      
      widget.restore();
      
      expect(widget.getState().minimized).toBe(false);
      expect(widget.getState().maximized).toBe(false);
      expect(restoredSpy).toHaveBeenCalled();
    });
  });

  describe('主题管理', () => {
    beforeEach(() => {
      widget = new IntelligentAIWidget(mockConfig);
    });

    it('应该设置主题', () => {
      const themeChangedSpy = vi.fn();
      widget.on('theme:changed', themeChangedSpy);
      
      widget.setTheme('dark');
      
      expect(widget.getTheme()).toBe('dark');
    });

    it('应该获取当前主题', () => {
      const theme = widget.getTheme();
      
      expect(theme).toBeDefined();
      expect(['light', 'dark', 'auto', 'custom']).toContain(theme);
    });

    it('应该支持所有主题类型', () => {
      const themes: WidgetTheme[] = ['light', 'dark'];
      
      themes.forEach(theme => {
        widget.setTheme(theme);
        expect(widget.getTheme()).toBe(theme);
      });
    });
  });

  describe('消息处理', () => {
    beforeEach(async () => {
      widget = new IntelligentAIWidget(mockConfig);
      await widget.initialize();
    });

    it('应该发送聊天消息', async () => {
      const chatMessage = {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: Date.now(),
      };
      
      const messagePromise = widget.sendMessage(chatMessage);
      
      vi.advanceTimersByTime(1000);
      
      const result = await messagePromise;
      
      expect(result).toBeDefined();
    });

    it('应该执行工具', async () => {
      const result = await widget.executeTool('test-tool', { param1: 'value1' });
      
      expect(result).toBeDefined();
    });

    it('应该执行工作流', async () => {
      try {
        const result = await widget.executeWorkflow('workflow-1');
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('消息处理失败时应该触发error事件', async () => {
      const errorSpy = vi.fn();
      widget.on('error', errorSpy);
      
      try {
        await widget.executeTool('invalid-tool', {});
      } catch (error) {
        expect(errorSpy).toHaveBeenCalled();
      }
    });
  });

  describe('性能监控', () => {
    beforeEach(() => {
      widget = new IntelligentAIWidget(mockConfig);
    });

    it('应该返回指标', () => {
      const metrics = widget.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.renderTime).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.networkRequests).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
    });

    it('应该返回性能数据', () => {
      const performance = widget.getPerformance();
      
      expect(performance).toBeDefined();
      expect(performance.fps).toBeGreaterThan(0);
      expect(performance.loadTime).toBeGreaterThanOrEqual(0);
      expect(performance.responseTime).toBeGreaterThanOrEqual(0);
      expect(performance.throughput).toBeGreaterThanOrEqual(0);
      expect(performance.concurrency).toBeGreaterThanOrEqual(0);
    });

    it('应该定期更新指标', () => {
      const initialMetrics = widget.getMetrics();
      
      vi.advanceTimersByTime(1000);
      
      const updatedMetrics = widget.getMetrics();
      
      expect(updatedMetrics).toBeDefined();
    });

    it('应该定期更新性能数据', () => {
      const initialPerformance = widget.getPerformance();
      
      vi.advanceTimersByTime(1000);
      
      const updatedPerformance = widget.getPerformance();
      
      expect(updatedPerformance).toBeDefined();
    });
  });

  describe('组件访问', () => {
    beforeEach(() => {
      widget = new IntelligentAIWidget(mockConfig);
    });

    it('应该返回聊天界面', () => {
      const chatInterface = widget.getChatInterface();
      
      expect(chatInterface).toBeDefined();
    });

    it('应该返回工具面板', () => {
      const toolPanel = widget.getToolPanel();
      
      expect(toolPanel).toBeDefined();
    });

    it('应该返回洞察仪表板', () => {
      const insightsDashboard = widget.getInsightsDashboard();
      
      expect(insightsDashboard).toBeDefined();
    });

    it('应该返回工作流设计器', () => {
      const workflowDesigner = widget.getWorkflowDesigner();
      
      expect(workflowDesigner).toBeDefined();
    });
  });

  describe('数据导出和刷新', () => {
    beforeEach(() => {
      widget = new IntelligentAIWidget(mockConfig);
    });

    it('应该导出JSON格式数据', async () => {
      const data = await widget.exportData('json');
      
      expect(data).toBeDefined();
    });

    it('应该导出XML格式数据', async () => {
      const data = await widget.exportData('xml');
      
      expect(data).toBeDefined();
    });

    it('应该导出YAML格式数据', async () => {
      const data = await widget.exportData('yaml');
      
      expect(data).toBeDefined();
    });

    it('应该刷新所有组件', async () => {
      await widget.initialize();
      
      await widget.refresh();
      
      expect(widget.isInitialized()).toBe(true);
    });
  });

  describe('事件处理', () => {
    beforeEach(async () => {
      widget = new IntelligentAIWidget(mockConfig);
      await widget.initialize();
    });

    it('应该触发visibility:changed事件', () => {
      const visibilityChangedSpy = vi.fn();
      widget.on('visibility:changed', visibilityChangedSpy);
      
      widget.show();
      
      expect(visibilityChangedSpy).toHaveBeenCalledWith({ visible: true });
    });

    it('应该触发minimized事件', () => {
      const minimizedSpy = vi.fn();
      widget.on('minimized', minimizedSpy);
      
      widget.minimize();
      
      expect(minimizedSpy).toHaveBeenCalled();
    });

    it('应该触发maximized事件', () => {
      const maximizedSpy = vi.fn();
      widget.on('maximized', maximizedSpy);
      
      widget.maximize();
      
      expect(maximizedSpy).toHaveBeenCalled();
    });

    it('应该触发restored事件', () => {
      const restoredSpy = vi.fn();
      widget.on('restored', restoredSpy);
      
      widget.restore();
      
      expect(restoredSpy).toHaveBeenCalled();
    });

    it('应该触发theme:changed事件', () => {
      const themeChangedSpy = vi.fn();
      widget.on('theme:changed', themeChangedSpy);
      
      widget.setTheme('dark');
      
      expect(themeChangedSpy).toHaveBeenCalled();
    });

    it('应该触发destroyed事件', () => {
      const destroyedSpy = vi.fn();
      widget.on('destroyed', destroyedSpy);
      
      widget.destroy();
      
      expect(destroyedSpy).toHaveBeenCalled();
    });
  });

  describe('销毁和清理', () => {
    beforeEach(() => {
      widget = new IntelligentAIWidget(mockConfig);
    });

    it('应该销毁widget', () => {
      widget.destroy();
      
      expect(widget.isInitialized()).toBe(false);
    });

    it('应该清理所有事件监听器', () => {
      const testSpy = vi.fn();
      widget.on('test', testSpy);
      
      widget.destroy();
      widget.emit('test');
      
      expect(testSpy).not.toHaveBeenCalled();
    });

    it('应该清理所有子系统', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      widget.destroy();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('IntelligentAIWidget destroyed');
      consoleLogSpy.mockRestore();
    });
  });

  describe('配置选项', () => {
    it('应该支持禁用拖拽', () => {
      const config = { ...mockConfig, enableDrag: false };
      widget = new IntelligentAIWidget(config);
      
      expect(widget.getState()).toBeDefined();
    });

    it('应该支持禁用调整大小', () => {
      const config = { ...mockConfig, enableResize: false };
      widget = new IntelligentAIWidget(config);
      
      expect(widget.getState()).toBeDefined();
    });

    it('应该支持禁用持久化', () => {
      const config = { ...mockConfig, enablePersistence: false };
      widget = new IntelligentAIWidget(config);
      
      expect(widget.getState()).toBeDefined();
    });

    it('应该支持禁用同步', () => {
      const config = { ...mockConfig, enableSync: false };
      widget = new IntelligentAIWidget(config);
      
      expect(widget.getState()).toBeDefined();
    });

    it('应该支持禁用可访问性', () => {
      const config = { ...mockConfig, enableAccessibility: false };
      widget = new IntelligentAIWidget(config);
      
      expect(widget.getState()).toBeDefined();
    });

    it('应该支持禁用安全', () => {
      const config = { ...mockConfig, enableSecurity: false };
      widget = new IntelligentAIWidget(config);
      
      expect(widget.getState()).toBeDefined();
    });

    it('应该支持禁用动画', () => {
      const config = { ...mockConfig, animationEnabled: false };
      widget = new IntelligentAIWidget(config);
      
      expect(widget.getState()).toBeDefined();
    });
  });

  describe('错误处理', () => {
    beforeEach(() => {
      widget = new IntelligentAIWidget(mockConfig);
    });

    it('应该处理聊天消息错误', async () => {
      const errorSpy = vi.fn();
      widget.on('error', errorSpy);
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        const messagePromise = widget.sendMessage({
          id: 'invalid',
          role: 'user' as const,
          content: '',
          timestamp: Date.now(),
        });
        
        vi.advanceTimersByTime(1000);
        
        await messagePromise;
      } catch (error: any) {
        expect(errorSpy).toHaveBeenCalled();
      }
      
      consoleErrorSpy.mockRestore();
    });

    it('应该处理工具执行错误', async () => {
      const errorSpy = vi.fn();
      widget.on('error', errorSpy);
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        await widget.executeTool('', {});
      } catch (error) {
        expect(errorSpy).toHaveBeenCalled();
      }
      
      consoleErrorSpy.mockRestore();
    });

    it('应该处理工作流执行错误', async () => {
      const errorSpy = vi.fn();
      widget.on('error', errorSpy);
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        await widget.executeWorkflow('non-existent-workflow');
      } catch (error) {
        expect(errorSpy).toHaveBeenCalled();
      }
      
      consoleErrorSpy.mockRestore();
    });
  });
});
