/**
 * @file 提示通知管理系统
 * @description 管理toast通知的显示、隐藏和队列
 * @module ui/widget/ToastManager
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import EventEmitter from 'eventemitter3';

interface ToastManagerConfig {
  widget: any;
  maxToasts?: number;
  defaultDuration?: number;
  enableAnimations?: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
  timestamp: number;
  onClick?: () => void;
}

export class ToastManager extends EventEmitter {
  private widget: any;
  private maxToasts: number;
  private defaultDuration: number;
  private enableAnimations: boolean;
  private toasts: Toast[];
  private toastTimers: Map<string, NodeJS.Timeout>;

  constructor(config: ToastManagerConfig) {
    super();
    this.widget = config.widget;
    this.maxToasts = config.maxToasts || 5;
    this.defaultDuration = config.defaultDuration || 3000;
    this.enableAnimations = config.enableAnimations || true;
    this.toasts = [];
    this.toastTimers = new Map();
  }

  show(message: string, options?: Partial<Pick<Toast, 'type' | 'duration' | 'onClick'>>): string {
    const toast: Toast = {
      id: `toast-${Date.now()}`,
      message,
      type: options?.type || 'info',
      duration: options?.duration || this.defaultDuration,
      timestamp: Date.now(),
      onClick: options?.onClick,
    };

    // 限制最大toast数量
    if (this.toasts.length >= this.maxToasts) {
      this.removeToast(this.toasts[0].id);
    }

    this.toasts.push(toast);
    this.emit('toast:shown', toast);

    // 设置自动隐藏定时器
    const timer = setTimeout(() => {
      this.removeToast(toast.id);
    }, toast.duration);

    this.toastTimers.set(toast.id, timer);

    return toast.id;
  }

  info(message: string, options?: Partial<Pick<Toast, 'duration' | 'onClick'>>): string {
    return this.show(message, { ...options, type: 'info' });
  }

  success(message: string, options?: Partial<Pick<Toast, 'duration' | 'onClick'>>): string {
    return this.show(message, { ...options, type: 'success' });
  }

  warning(message: string, options?: Partial<Pick<Toast, 'duration' | 'onClick'>>): string {
    return this.show(message, { ...options, type: 'warning' });
  }

  error(message: string, options?: Partial<Pick<Toast, 'duration' | 'onClick'>>): string {
    return this.show(message, { ...options, type: 'error', duration: options?.duration || this.defaultDuration * 1.5 });
  }

  removeToast(id: string): void {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index === -1) {
      return;
    }

    const toast = this.toasts[index];
    this.toasts.splice(index, 1);

    // 清除定时器
    const timer = this.toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.toastTimers.delete(id);
    }

    this.emit('toast:hidden', toast);
  }

  removeAllToasts(): void {
    // 清除所有定时器
    for (const [id, timer] of this.toastTimers.entries()) {
      clearTimeout(timer);
    }
    this.toastTimers.clear();

    // 移除所有toast
    for (const toast of this.toasts) {
      this.emit('toast:hidden', toast);
    }
    this.toasts = [];
  }

  getToasts(): Toast[] {
    return [...this.toasts];
  }

  getToastCount(): number {
    return this.toasts.length;
  }

  isAnimationsEnabled(): boolean {
    return this.enableAnimations;
  }

  setAnimationsEnabled(enabled: boolean): void {
    this.enableAnimations = enabled;
  }

  setMaxToasts(max: number): void {
    this.maxToasts = max;
    // 如果当前toast数量超过新的最大值，移除多余的
    while (this.toasts.length > this.maxToasts) {
      this.removeToast(this.toasts[0].id);
    }
  }

  setDefaultDuration(duration: number): void {
    this.defaultDuration = duration;
  }

  destroy(): void {
    this.removeAllToasts();
    this.removeAllListeners();
  }
}

export default ToastManager;