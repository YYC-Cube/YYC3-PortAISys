/**
 * @file 响应式管理系统
 * @description 管理widget的响应式行为，包括屏幕尺寸变化检测和自适应布局
 * @module ui/widget/ResponsiveManager
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import EventEmitter from 'eventemitter3';

interface ResponsiveManagerConfig {
  widget: any;
  enableAutoAdjust?: boolean;
  breakpoints?: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

export class ResponsiveManager extends EventEmitter {
  private widget: any;
  private enableAutoAdjust: boolean;
  private breakpoints: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  private currentBreakpoint: string;
  private isMonitoring: boolean;

  constructor(config: ResponsiveManagerConfig) {
    super();
    this.widget = config.widget;
    this.enableAutoAdjust = config.enableAutoAdjust || true;
    this.breakpoints = config.breakpoints || {
      small: 480,
      medium: 768,
      large: 1024,
      xlarge: 1200,
    };
    this.currentBreakpoint = 'medium';
    this.isMonitoring = false;
  }

  startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.checkBreakpoint();

    // 监听窗口 resize 事件（仅在浏览器环境中）
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    // 仅在浏览器环境中移除事件监听器
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', this.handleResize.bind(this));
    }
  }

  private handleResize(): void {
    this.checkBreakpoint();
  }

  private checkBreakpoint(): void {
    if (!this.widget) {
      return;
    }

    const state = this.widget.getState();
    if (!state || !state.size) {
      return;
    }

    const { width } = state.size;
    let newBreakpoint: string;

    if (width < this.breakpoints.small) {
      newBreakpoint = 'small';
    } else if (width < this.breakpoints.medium) {
      newBreakpoint = 'medium';
    } else if (width < this.breakpoints.large) {
      newBreakpoint = 'large';
    } else {
      newBreakpoint = 'xlarge';
    }

    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      this.emit('breakpoint:changed', {
        breakpoint: newBreakpoint,
        width,
        performanceScore: this.calculatePerformanceScore(),
      });
    }

    this.emit('resize:detected', {
      width,
      height: state.size.height,
      breakpoint: this.currentBreakpoint,
    });
  }

  private calculatePerformanceScore(): number {
    // 简单的性能评分计算
    return 0.95; // 默认返回高分数
  }

  getCurrentBreakpoint(): string {
    return this.currentBreakpoint;
  }

  getBreakpoints(): {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  } {
    return { ...this.breakpoints };
  }

  setBreakpoints(breakpoints: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  }): void {
    this.breakpoints = breakpoints;
    this.checkBreakpoint();
  }

  isAutoAdjustEnabled(): boolean {
    return this.enableAutoAdjust;
  }

  setAutoAdjust(enabled: boolean): void {
    this.enableAutoAdjust = enabled;
  }

  destroy(): void {
    this.stopMonitoring();
    this.removeAllListeners();
  }
}

export default ResponsiveManager;