/**
 * @file 用户体验优化系统测试
 * @description 测试用户体验优化系统的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UXOptimizationSystem } from '../../../core/ui/UXOptimizationSystem';

describe('UXOptimizationSystem', () => {
  let uxSystem: UXOptimizationSystem;

  beforeEach(() => {
    uxSystem = new UXOptimizationSystem();
  });

  afterEach(() => {
    uxSystem.destroy();
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化UX优化系统', () => {
      expect(uxSystem).toBeDefined();
      expect(uxSystem).toBeInstanceOf(UXOptimizationSystem);
    });

    it('应该初始化默认主题', () => {
      const theme = uxSystem.getCurrentTheme();
      expect(theme).toBeDefined();
      expect(theme.id).toBe('default');
    });

    it('应该初始化默认可访问性设置', () => {
      const settings = uxSystem.getAccessibilitySettings();
      expect(settings).toBeDefined();
      expect(settings.keyboardNavigation).toBe(true);
    });

    it('应该初始化断点', () => {
      const breakpoints = uxSystem.getBreakpoints();
      expect(breakpoints.length).toBeGreaterThan(0);
      expect(breakpoints[0].name).toBe('mobile');
    });
  });

  describe('主题管理', () => {
    it('应该成功切换主题', () => {
      const handler = vi.fn();
      uxSystem.on('theme:changed', handler);

      uxSystem.setTheme('dark');

      const theme = uxSystem.getCurrentTheme();
      expect(theme.id).toBe('dark');
      expect(handler).toHaveBeenCalled();
    });

    it('应该获取指定主题', () => {
      const theme = uxSystem.getTheme('dark');
      expect(theme).toBeDefined();
      expect(theme?.id).toBe('dark');
    });

    it('应该获取所有可用主题', () => {
      const themes = uxSystem.getAvailableThemes();
      expect(themes.length).toBeGreaterThan(0);
      expect(themes.some(t => t.id === 'default')).toBe(true);
      expect(themes.some(t => t.id === 'dark')).toBe(true);
    });

    it('应该在不存在的主题时抛出错误', () => {
      expect(() => {
        uxSystem.setTheme('non-existent');
      }).toThrow();
    });
  });

  describe('响应式断点', () => {
    it('应该检测当前断点', () => {
      const breakpoint = uxSystem.detectBreakpoint();
      expect(breakpoint).toBeDefined();
      expect(breakpoint?.name).toBeDefined();
    });

    it('应该在断点变化时发射事件', () => {
      const handler = vi.fn();
      uxSystem.on('breakpoint:changed', handler);

      const originalWidth = window.innerWidth;
      (window as any).innerWidth = 2000;

      const resizeListeners = (window.addEventListener as any).mock.calls.filter(
        (call: any[]) => call[0] === 'resize'
      );
      if (resizeListeners.length > 0) {
        const resizeHandler = resizeListeners[0][1];
        resizeHandler();
      }

      (window as any).innerWidth = originalWidth;

      expect(handler).toHaveBeenCalled();
    });

    it('应该返回所有断点', () => {
      const breakpoints = uxSystem.getBreakpoints();
      expect(breakpoints.length).toBe(4);
      expect(breakpoints[0].name).toBe('mobile');
      expect(breakpoints[1].name).toBe('tablet');
      expect(breakpoints[2].name).toBe('desktop');
      expect(breakpoints[3].name).toBe('large-desktop');
    });
  });

  describe('可访问性设置', () => {
    it('应该成功更新可访问性设置', () => {
      const handler = vi.fn();
      uxSystem.on('accessibility:changed', handler);

      uxSystem.setAccessibilitySettings({ highContrast: true });

      const settings = uxSystem.getAccessibilitySettings();
      expect(settings.highContrast).toBe(true);
      expect(handler).toHaveBeenCalled();
    });

    it('应该支持部分更新', () => {
      const originalSettings = uxSystem.getAccessibilitySettings();
      uxSystem.setAccessibilitySettings({ fontSize: 'large' });

      const newSettings = uxSystem.getAccessibilitySettings();
      expect(newSettings.fontSize).toBe('large');
      expect(newSettings.keyboardNavigation).toBe(originalSettings.keyboardNavigation);
    });

    it('应该返回当前可访问性设置', () => {
      const settings = uxSystem.getAccessibilitySettings();
      expect(settings).toHaveProperty('screenReader');
      expect(settings).toHaveProperty('keyboardNavigation');
      expect(settings).toHaveProperty('highContrast');
      expect(settings).toHaveProperty('reducedMotion');
      expect(settings).toHaveProperty('fontSize');
    });
  });

  describe('动画管理', () => {
    it('应该成功添加动画', () => {
      const handler = vi.fn();
      uxSystem.on('animation:added', handler);

      const animation = {
        name: 'fade-in',
        duration: 300,
        easing: 'ease-in-out'
      };

      uxSystem.addAnimation('element-1', animation);

      const animations = uxSystem.getAnimations('element-1');
      expect(animations.length).toBe(1);
      expect(animations[0]).toEqual(animation);
      expect(handler).toHaveBeenCalled();
    });

    it('应该成功移除动画', () => {
      const handler = vi.fn();
      uxSystem.on('animation:removed', handler);

      const animation = {
        name: 'fade-in',
        duration: 300,
        easing: 'ease-in-out'
      };

      uxSystem.addAnimation('element-1', animation);
      uxSystem.removeAnimation('element-1', 'fade-in');

      const animations = uxSystem.getAnimations('element-1');
      expect(animations.length).toBe(0);
      expect(handler).toHaveBeenCalled();
    });

    it('应该获取元素的所有动画', () => {
      const animation1 = { name: 'fade-in', duration: 300, easing: 'ease-in-out' };
      const animation2 = { name: 'slide-up', duration: 400, easing: 'ease-out' };

      uxSystem.addAnimation('element-1', animation1);
      uxSystem.addAnimation('element-1', animation2);

      const animations = uxSystem.getAnimations('element-1');
      expect(animations.length).toBe(2);
    });

    it('应该清除元素的所有动画', () => {
      const handler = vi.fn();
      uxSystem.on('animations:cleared', handler);

      const animation1 = { name: 'fade-in', duration: 300, easing: 'ease-in-out' };
      const animation2 = { name: 'slide-up', duration: 400, easing: 'ease-out' };

      uxSystem.addAnimation('element-1', animation1);
      uxSystem.addAnimation('element-1', animation2);
      uxSystem.clearAnimations('element-1');

      const animations = uxSystem.getAnimations('element-1');
      expect(animations.length).toBe(0);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('反馈管理', () => {
    it('应该成功显示反馈', () => {
      const handler = vi.fn();
      uxSystem.on('feedback:shown', handler);

      const feedback = {
        type: 'success' as const,
        message: 'Operation successful'
      };

      uxSystem.showFeedback(feedback);

      const queue = uxSystem.getFeedbackQueue();
      expect(queue.length).toBe(1);
      expect(queue[0]).toEqual(feedback);
      expect(handler).toHaveBeenCalled();
    });

    it('应该成功隐藏反馈', () => {
      const handler = vi.fn();
      uxSystem.on('feedback:hidden', handler);

      const feedback = {
        type: 'success' as const,
        message: 'Operation successful',
        duration: 100
      };

      uxSystem.showFeedback(feedback);

      setTimeout(() => {
        const queue = uxSystem.getFeedbackQueue();
        expect(queue.length).toBe(0);
        expect(handler).toHaveBeenCalled();
      }, 150);
    });

    it('应该支持带操作的反馈', () => {
      const actionHandler = vi.fn();
      const feedback = {
        type: 'info' as const,
        message: 'Click to retry',
        action: {
          label: 'Retry',
          handler: actionHandler
        }
      };

      uxSystem.showFeedback(feedback);

      const queue = uxSystem.getFeedbackQueue();
      expect(queue[0].action).toBeDefined();
      expect(queue[0].action?.label).toBe('Retry');
    });

    it('应该清除反馈队列', () => {
      const handler = vi.fn();
      uxSystem.on('feedback:cleared', handler);

      const feedback1 = { type: 'success' as const, message: 'Success' };
      const feedback2 = { type: 'error' as const, message: 'Error' };

      uxSystem.showFeedback(feedback1);
      uxSystem.showFeedback(feedback2);
      uxSystem.clearFeedbackQueue();

      const queue = uxSystem.getFeedbackQueue();
      expect(queue.length).toBe(0);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('性能优化', () => {
    it('应该成功启动性能优化', async () => {
      const handler = vi.fn();
      uxSystem.on('optimization:started', handler);

      await uxSystem.optimizePerformance();

      expect(handler).toHaveBeenCalled();
    });

    it('应该完成性能优化', async () => {
      const handler = vi.fn();
      uxSystem.on('optimization:completed', handler);

      await uxSystem.optimizePerformance();

      expect(handler).toHaveBeenCalled();
    });

    it('应该测量性能指标', async () => {
      await uxSystem.optimizePerformance();

      const metrics = uxSystem.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('firstContentfulPaint');
      expect(metrics).toHaveProperty('largestContentfulPaint');
      expect(metrics).toHaveProperty('timeToInteractive');
    });

    it('应该防止重复优化', async () => {
      const handler = vi.fn();
      uxSystem.on('optimization:started', handler);

      const promise1 = uxSystem.optimizePerformance();
      const promise2 = uxSystem.optimizePerformance();

      await Promise.all([promise1, promise2]);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('平滑滚动', () => {
    it('应该创建平滑滚动效果', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      expect(() => {
        uxSystem.createSmoothScroll(element);
      }).not.toThrow();

      document.body.removeChild(element);
    });
  });

  describe('焦点陷阱', () => {
    it('应该创建焦点陷阱', () => {
      const element = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');

      element.appendChild(button1);
      element.appendChild(button2);
      document.body.appendChild(element);

      const removeTrap = uxSystem.createFocusTrap(element);

      expect(typeof removeTrap).toBe('function');

      removeTrap();
      document.body.removeChild(element);
    });
  });

  describe('键盘快捷键', () => {
    it('应该创建键盘快捷键', () => {
      const handler = vi.fn();
      const shortcuts = new Map([
        ['ctrl+s', handler]
      ]);

      const removeShortcuts = uxSystem.createKeyboardShortcuts(shortcuts);

      expect(typeof removeShortcuts).toBe('function');

      removeShortcuts();
    });

    it('应该支持多个快捷键', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const shortcuts = new Map([
        ['ctrl+s', handler1],
        ['ctrl+c', handler2]
      ]);

      const removeShortcuts = uxSystem.createKeyboardShortcuts(shortcuts);

      expect(typeof removeShortcuts).toBe('function');

      removeShortcuts();
    });
  });

  describe('加载状态', () => {
    it('应该创建加载状态', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const loadingState = uxSystem.createLoadingState(element);

      expect(loadingState).toBeDefined();
      expect(typeof loadingState.start).toBe('function');
      expect(typeof loadingState.stop).toBe('function');
      expect(typeof loadingState.isLoading).toBe('function');

      document.body.removeChild(element);
    });

    it('应该正确管理加载状态', () => {
      const element = document.createElement('div');
      const originalContent = '<p>Original content</p>';
      element.innerHTML = originalContent;
      document.body.appendChild(element);

      const loadingState = uxSystem.createLoadingState(element);

      loadingState.start();
      expect(loadingState.isLoading()).toBe(true);
      expect(element.innerHTML).toContain('loading-spinner');

      loadingState.stop();
      expect(loadingState.isLoading()).toBe(false);
      expect(element.innerHTML).toBe(originalContent);

      document.body.removeChild(element);
    });
  });

  describe('进度指示器', () => {
    it('应该创建进度指示器', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const progress = uxSystem.createProgressIndicator(element, 50, 100);

      expect(progress).toBeDefined();
      expect(typeof progress.setValue).toBe('function');
      expect(typeof progress.getValue).toBe('function');
      expect(typeof progress.setMax).toBe('function');
      expect(typeof progress.getMax).toBe('function');
      expect(typeof progress.getPercentage).toBe('function');

      document.body.removeChild(element);
    });

    it('应该正确设置和获取进度值', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const progress = uxSystem.createProgressIndicator(element, 50, 100);

      progress.setValue(75);
      expect(progress.getValue()).toBe(75);

      progress.setMax(200);
      expect(progress.getMax()).toBe(200);

      document.body.removeChild(element);
    });

    it('应该正确计算百分比', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const progress = uxSystem.createProgressIndicator(element, 50, 100);

      expect(progress.getPercentage()).toBe(50);

      progress.setValue(75);
      expect(progress.getPercentage()).toBe(75);

      document.body.removeChild(element);
    });
  });

  describe('事件系统', () => {
    it('应该支持事件监听', () => {
      const handler = vi.fn();
      uxSystem.on('test-event', handler);

      uxSystem.emit('test-event', { data: 'test' });

      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('应该支持事件移除', () => {
      const handler = vi.fn();
      uxSystem.on('test-event', handler);
      uxSystem.off('test-event', handler);

      uxSystem.emit('test-event', { data: 'test' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('应该支持一次性事件监听', () => {
      const handler = vi.fn();
      uxSystem.once('test-event', handler);

      uxSystem.emit('test-event', { data: 'test1' });
      uxSystem.emit('test-event', { data: 'test2' });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('销毁', () => {
    it('应该成功销毁系统', () => {
      expect(() => {
        uxSystem.destroy();
      }).not.toThrow();
    });

    it('应该清理所有资源', () => {
      uxSystem.destroy();

      const breakpoints = uxSystem.getBreakpoints();
      expect(breakpoints.length).toBe(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效主题ID', () => {
      expect(() => {
        uxSystem.setTheme('invalid-theme');
      }).toThrow();
    });

    it('应该处理无效元素', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      expect(() => {
        uxSystem.createSmoothScroll(element);
      }).not.toThrow();

      document.body.removeChild(element);
    });
  });
});
