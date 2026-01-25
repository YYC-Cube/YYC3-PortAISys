/**
 * @file 用户体验优化系统
 * @description 提供全面的用户体验优化功能，包括响应式设计、可访问性、动画效果等
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { EventEmitter } from 'eventemitter3';

export interface UXTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    lineHeight: number;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface UXAnimation {
  name: string;
  duration: number;
  easing: string;
  delay?: number;
}

export interface UXResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
}

export interface UXAccessibilitySettings {
  screenReader: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
  skipLinks: boolean;
}

export interface UXFeedback {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface UXPerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export class UXOptimizationSystem extends EventEmitter {
  private currentTheme: UXTheme;
  private themes: Map<string, UXTheme> = new Map();
  private currentBreakpoint: UXResponsiveBreakpoint | null = null;
  private breakpoints: UXResponsiveBreakpoint[] = [];
  private accessibilitySettings: UXAccessibilitySettings;
  private performanceMetrics: UXPerformanceMetrics | null = null;
  private animationQueue: Map<string, UXAnimation[]> = new Map();
  private feedbackQueue: UXFeedback[] = [];
  private isOptimizing: boolean = false;

  constructor() {
    super();
    this.currentTheme = this.getDefaultTheme();
    this.accessibilitySettings = this.getDefaultAccessibilitySettings();
    this.initializeThemes();
    this.initializeBreakpoints();
    this.setupEventListeners();
  }

  private getDefaultTheme(): UXTheme {
    return {
      id: 'default',
      name: 'Default Theme',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        background: '#ffffff',
        foreground: '#1e293b',
        accent: '#10b981'
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          small: '14px',
          medium: '16px',
          large: '18px'
        },
        lineHeight: 1.5
      },
      spacing: {
        small: '8px',
        medium: '16px',
        large: '24px'
      }
    };
  }

  private getDefaultAccessibilitySettings(): UXAccessibilitySettings {
    return {
      screenReader: false,
      keyboardNavigation: true,
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      focusVisible: true,
      skipLinks: true
    };
  }

  private initializeThemes(): void {
    const darkTheme: UXTheme = {
      id: 'dark',
      name: 'Dark Theme',
      colors: {
        primary: '#60a5fa',
        secondary: '#94a3b8',
        background: '#0f172a',
        foreground: '#f1f5f9',
        accent: '#34d399'
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          small: '14px',
          medium: '16px',
          large: '18px'
        },
        lineHeight: 1.5
      },
      spacing: {
        small: '8px',
        medium: '16px',
        large: '24px'
      }
    };

    const highContrastTheme: UXTheme = {
      id: 'high-contrast',
      name: 'High Contrast',
      colors: {
        primary: '#000000',
        secondary: '#333333',
        background: '#ffffff',
        foreground: '#000000',
        accent: '#0066cc'
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          small: '16px',
          medium: '18px',
          large: '20px'
        },
        lineHeight: 1.6
      },
      spacing: {
        small: '12px',
        medium: '20px',
        large: '28px'
      }
    };

    this.themes.set('default', this.currentTheme);
    this.themes.set('dark', darkTheme);
    this.themes.set('high-contrast', highContrastTheme);
  }

  private initializeBreakpoints(): void {
    this.breakpoints = [
      { name: 'mobile', minWidth: 0, maxWidth: 640 },
      { name: 'tablet', minWidth: 641, maxWidth: 1024 },
      { name: 'desktop', minWidth: 1025, maxWidth: 1440 },
      { name: 'large-desktop', minWidth: 1441 }
    ];
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize.bind(this));
      window.addEventListener('load', this.handleLoad.bind(this));
      window.addEventListener('DOMContentLoaded', this.handleDOMContentLoaded.bind(this));
    }
  }

  private handleResize(): void {
    const newBreakpoint = this.detectBreakpoint();
    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      this.emit('breakpoint:changed', newBreakpoint);
    }
  }

  private handleLoad(): void {
    this.measurePerformance();
    this.emit('page:loaded');
  }

  private handleDOMContentLoaded(): void {
    this.applyAccessibilitySettings();
    this.emit('page:ready');
  }

  detectBreakpoint(): UXResponsiveBreakpoint | null {
    if (typeof window === 'undefined') return null;

    const width = window.innerWidth;
    for (let i = this.breakpoints.length - 1; i >= 0; i--) {
      const bp = this.breakpoints[i];
      if (width >= bp.minWidth) {
        if (!bp.maxWidth || width <= bp.maxWidth) {
          return bp;
        }
      }
    }
    return this.breakpoints[0];
  }

  getCurrentBreakpoint(): UXResponsiveBreakpoint | null {
    return this.currentBreakpoint;
  }

  getBreakpoints(): UXResponsiveBreakpoint[] {
    return [...this.breakpoints];
  }

  setTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.emit('theme:changed', theme);
  }

  getTheme(themeId: string): UXTheme | undefined {
    return this.themes.get(themeId);
  }

  getCurrentTheme(): UXTheme {
    return this.currentTheme;
  }

  getAvailableThemes(): UXTheme[] {
    return Array.from(this.themes.values());
  }

  private applyTheme(theme: UXTheme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-foreground', theme.colors.foreground);
    root.style.setProperty('--color-accent', theme.colors.accent);

    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-size-small', theme.typography.fontSize.small);
    root.style.setProperty('--font-size-medium', theme.typography.fontSize.medium);
    root.style.setProperty('--font-size-large', theme.typography.fontSize.large);
    root.style.setProperty('--line-height', String(theme.typography.lineHeight));

    root.style.setProperty('--spacing-small', theme.spacing.small);
    root.style.setProperty('--spacing-medium', theme.spacing.medium);
    root.style.setProperty('--spacing-large', theme.spacing.large);
  }

  setAccessibilitySettings(settings: Partial<UXAccessibilitySettings>): void {
    this.accessibilitySettings = { ...this.accessibilitySettings, ...settings };
    this.applyAccessibilitySettings();
    this.emit('accessibility:changed', this.accessibilitySettings);
  }

  getAccessibilitySettings(): UXAccessibilitySettings {
    return { ...this.accessibilitySettings };
  }

  private applyAccessibilitySettings(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (this.accessibilitySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (this.accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[this.accessibilitySettings.fontSize]);

    if (this.accessibilitySettings.screenReader) {
      root.setAttribute('aria-live', 'polite');
    } else {
      root.removeAttribute('aria-live');
    }

    if (this.accessibilitySettings.skipLinks) {
      this.addSkipLinks();
    }
  }

  private addSkipLinks(): void {
    if (typeof document === 'undefined') return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.setAttribute('aria-label', 'Skip to main content');

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  addAnimation(elementId: string, animation: UXAnimation): void {
    if (!this.animationQueue.has(elementId)) {
      this.animationQueue.set(elementId, []);
    }
    this.animationQueue.get(elementId)!.push(animation);
    this.emit('animation:added', { elementId, animation });
  }

  removeAnimation(elementId: string, animationName: string): void {
    const animations = this.animationQueue.get(elementId);
    if (animations) {
      const index = animations.findIndex(a => a.name === animationName);
      if (index !== -1) {
        animations.splice(index, 1);
        this.emit('animation:removed', { elementId, animationName });
      }
    }
  }

  getAnimations(elementId: string): UXAnimation[] {
    return this.animationQueue.get(elementId) || [];
  }

  clearAnimations(elementId: string): void {
    this.animationQueue.delete(elementId);
    this.emit('animations:cleared', elementId);
  }

  showFeedback(feedback: UXFeedback): void {
    this.feedbackQueue.push(feedback);
    this.emit('feedback:shown', feedback);

    if (feedback.duration) {
      setTimeout(() => {
        this.hideFeedback(feedback);
      }, feedback.duration);
    }
  }

  hideFeedback(feedback: UXFeedback): void {
    const index = this.feedbackQueue.indexOf(feedback);
    if (index !== -1) {
      this.feedbackQueue.splice(index, 1);
      this.emit('feedback:hidden', feedback);
    }
  }

  getFeedbackQueue(): UXFeedback[] {
    return [...this.feedbackQueue];
  }

  clearFeedbackQueue(): void {
    this.feedbackQueue = [];
    this.emit('feedback:cleared');
  }

  async optimizePerformance(): Promise<void> {
    if (this.isOptimizing) {
      return;
    }

    this.isOptimizing = true;
    this.emit('optimization:started');

    try {
      await this.optimizeImages();
      await this.optimizeFonts();
      await this.optimizeScripts();
      await this.optimizeStyles();
      await this.measurePerformance();

      this.emit('optimization:completed');
    } catch (error) {
      this.emit('optimization:failed', error);
    } finally {
      this.isOptimizing = false;
    }
  }

  private async optimizeImages(): Promise<void> {
    if (typeof document === 'undefined') return;

    const images = document.querySelectorAll('img');
    const lazyImages = Array.from(images).filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.top > window.innerHeight || rect.left > window.innerWidth;
    });

    lazyImages.forEach(img => {
      img.loading = 'lazy';
    });

    this.emit('images:optimized', { total: images.length, lazy: lazyImages.length });
  }

  private async optimizeFonts(): Promise<void> {
    if (typeof document === 'undefined') return;

    const fontDisplay = 'swap';
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: ${fontDisplay};
      }
    `;
    document.head.appendChild(style);

    this.emit('fonts:optimized');
  }

  private async optimizeScripts(): Promise<void> {
    if (typeof document === 'undefined') return;

    const scripts = document.querySelectorAll('script[defer], script[async]');
    this.emit('scripts:optimized', { count: scripts.length });
  }

  private async optimizeStyles(): Promise<void> {
    if (typeof document === 'undefined') return;

    const criticalCSS = this.getCriticalCSS();
    if (criticalCSS) {
      const style = document.createElement('style');
      style.textContent = criticalCSS;
      document.head.insertBefore(style, document.head.firstChild);
    }

    this.emit('styles:optimized');
  }

  private getCriticalCSS(): string | null {
    return null;
  }

  measurePerformance(): UXPerformanceMetrics | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = window.performance.getEntriesByType('paint');

    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    const largestContentfulPaint = paintEntries.find(entry => entry.name === 'largest-contentful-paint');

    this.performanceMetrics = {
      firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
      largestContentfulPaint: largestContentfulPaint ? largestContentfulPaint.startTime : 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: perfData ? perfData.domInteractive - perfData.startTime : 0
    };

    this.emit('performance:measured', this.performanceMetrics);
    return this.performanceMetrics;
  }

  getPerformanceMetrics(): UXPerformanceMetrics | null {
    return this.performanceMetrics;
  }

  createSmoothScroll(element: HTMLElement, options: ScrollIntoViewOptions = {}): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    });
  }

  createFocusTrap(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }

  createKeyboardShortcuts(shortcuts: Map<string, () => void>): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers: string[] = [];
      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.altKey) modifiers.push('alt');
      if (event.shiftKey) modifiers.push('shift');
      if (event.metaKey) modifiers.push('meta');

      const shortcut = [...modifiers, key].join('+');
      const handler = shortcuts.get(shortcut);

      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }

  createLoadingState(element: HTMLElement): {
    start: () => void;
    stop: () => void;
    isLoading: () => boolean;
  } {
    let loading = false;
    const originalContent = element.innerHTML;

    return {
      start: () => {
        if (loading) return;
        loading = true;
        element.innerHTML = `
          <div class="loading-spinner" role="status" aria-live="polite">
            <div class="spinner"></div>
            <span class="sr-only">Loading...</span>
          </div>
        `;
        element.setAttribute('aria-busy', 'true');
      },
      stop: () => {
        if (!loading) return;
        loading = false;
        element.innerHTML = originalContent;
        element.removeAttribute('aria-busy');
      },
      isLoading: () => loading
    };
  }

  createProgressIndicator(element: HTMLElement, value: number = 0, max: number = 100): {
    setValue: (value: number) => void;
    getValue: () => number;
    setMax: (max: number) => void;
    getMax: () => number;
    getPercentage: () => number;
  } {
    let currentValue = value;
    let currentMax = max;

    const updateProgress = () => {
      const percentage = (currentValue / currentMax) * 100;
      element.setAttribute('role', 'progressbar');
      element.setAttribute('aria-valuenow', String(currentValue));
      element.setAttribute('aria-valuemin', '0');
      element.setAttribute('aria-valuemax', String(currentMax));
      element.setAttribute('aria-valuetext', `${Math.round(percentage)}%`);
      element.style.setProperty('--progress-value', `${percentage}%`);
    };

    updateProgress();

    return {
      setValue: (newValue: number) => {
        currentValue = Math.max(0, Math.min(newValue, currentMax));
        updateProgress();
      },
      getValue: () => currentValue,
      setMax: (newMax: number) => {
        currentMax = newMax;
        updateProgress();
      },
      getMax: () => currentMax,
      getPercentage: () => (currentValue / currentMax) * 100
    };
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize.bind(this));
      window.removeEventListener('load', this.handleLoad.bind(this));
      window.removeEventListener('DOMContentLoaded', this.handleDOMContentLoaded.bind(this));
    }

    this.removeAllListeners();
    this.themes.clear();
    this.breakpoints = [];
    this.animationQueue.clear();
    this.feedbackQueue = [];
  }
}
