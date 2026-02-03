/**
 * @file 智能AI浮窗组件
 * @description 提供可拖拽、可调整大小的智能AI交互界面，集成多模块功能
 * @module ui/IntelligentAIWidget
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import EventEmitter from 'eventemitter3';
import { ChatInterface } from './ChatInterface';
import { ToolboxPanel } from './ToolboxPanel';
import { InsightsDashboard } from './InsightsDashboard';
import { WorkflowDesigner } from './WorkflowDesigner';
import { UISystem } from './UISystem';
import { WidgetManager } from './widget/WidgetManager';
import { AdvancedDragSystem } from './widget/AdvancedDragSystem';
import { ResizeSystem } from './widget/ResizeSystem';
import { ThemeSystem } from './widget/ThemeSystem';
import { AnimationSystem } from './widget/AnimationSystem';
import { StatePersistence } from './widget/StatePersistence';
import { StateSyncManager } from './widget/StateSyncManager';
import { WebSocketManager } from './widget/WebSocketManager';
import { MessageQueue } from './widget/MessageQueue';
import { EventBus } from './widget/EventBus';
import { RenderOptimizer } from './widget/RenderOptimizer';
import { MemoryManager } from './widget/MemoryManager';
import { LazyLoader } from './widget/LazyLoader';
import { AccessibilityManager } from './widget/AccessibilityManager';
import { ScreenReaderSupport } from './widget/ScreenReaderSupport';
import { KeyboardNavigation } from './widget/KeyboardNavigation';
import { WidgetSandbox } from './widget/WidgetSandbox';
import { PermissionManager } from './widget/PermissionManager';
import { ContentSecurity } from './widget/ContentSecurity';
import { logger } from '../utils/logger';
import {
  ChatMessage,
} from './types';

export interface WidgetConfig {
  id?: string;
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minimized?: boolean;
  maximized?: boolean;
  theme?: WidgetTheme;
  animationEnabled?: boolean;
  enableDrag?: boolean;
  enableResize?: boolean;
  enablePersistence?: boolean;
  enableSync?: boolean;
  enableAccessibility?: boolean;
  enableSecurity?: boolean;
  enableResponsive?: boolean;
  enableFeedback?: boolean;
  enablePerformanceOptimization?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableToastNotifications?: boolean;
}

export interface WidgetState {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimized: boolean;
  maximized: boolean;
  theme: WidgetTheme;
  visible: boolean;
  zIndex: number;
  activeModule: string;
  modules: Record<string, any>;
  metadata: Record<string, any>;
}

export type WidgetTheme = 'light' | 'dark' | 'auto' | 'custom';

export interface WidgetMetrics {
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  cacheHitRate: number;
  errorCount: number;
  warningCount: number;
  responsiveAdjustments: number;
  feedbackCount: number;
}

export interface WidgetPerformance {
  fps: number;
  loadTime: number;
  responseTime: number;
  throughput: number;
  concurrency: number;
  animationSmoothness: number;
  responsivePerformance: number;
}

export class IntelligentAIWidget extends EventEmitter {
  private widgetManager: WidgetManager;
  private dragSystem: AdvancedDragSystem;
  private resizeSystem: ResizeSystem;
  private themeSystem: ThemeSystem;
  private animationSystem: AnimationSystem;

  private chatInterface: ChatInterface;
  private toolPanel: ToolboxPanel;
  private workflowDesigner: WorkflowDesigner;
  private knowledgeViewer: any;
  private insightsDashboard: InsightsDashboard;

  private state: WidgetState;
  private persistence: StatePersistence;
  private syncManager: StateSyncManager;

  private websocketManager: WebSocketManager;
  private messageQueue: MessageQueue;
  private eventBus: EventBus;

  private renderOptimizer: RenderOptimizer;
  private memoryManager: MemoryManager;
  private lazyLoader: LazyLoader;

  private a11yManager: AccessibilityManager;
  private screenReader: ScreenReaderSupport;
  private keyboardNav: KeyboardNavigation;

  private sandbox: WidgetSandbox;
  private permissionManager: PermissionManager;
  private contentSecurity: ContentSecurity;

  private uiSystem: UISystem;
  private config: WidgetConfig;
  private initialized: boolean;
  private metrics: WidgetMetrics;
  private performance: WidgetPerformance;

  // 新增系统
  private responsiveManager: any;
  private feedbackManager: any;
  private toastManager: any;
  private keyboardShortcutManager: any;

  constructor(config: WidgetConfig = {}) {
    super();

    this.config = {
      id: `widget-${Date.now()}`,
      title: 'YYC³ AI Assistant',
      width: 800,
      height: 600,
      x: 100,
      y: 100,
      minimized: false,
      maximized: false,
      theme: 'auto',
      animationEnabled: true,
      enableDrag: true,
      enableResize: true,
      enablePersistence: true,
      enableSync: true,
      enableAccessibility: true,
      enableSecurity: true,
      enableResponsive: true,
      enableFeedback: true,
      enablePerformanceOptimization: true,
      enableKeyboardShortcuts: true,
      enableToastNotifications: true,
      ...config,
    };

    this.state = {
      id: this.config.id!,
      title: this.config.title!,
      position: { x: this.config.x!, y: this.config.y! },
      size: { width: this.config.width!, height: this.config.height! },
      minimized: this.config.minimized!,
      maximized: this.config.maximized!,
      theme: this.config.theme!,
      visible: true,
      zIndex: 1000,
      activeModule: 'chat',
      modules: {},
      metadata: {},
    };

    this.widgetManager = new WidgetManager(this.state);
    this.dragSystem = new AdvancedDragSystem();
    this.resizeSystem = new ResizeSystem();
    this.themeSystem = new ThemeSystem({
      defaultTheme: this.config.theme!,
      enableAutoMode: this.config.theme === 'auto',
      enableTransitions: true,
      enablePersistence: true,
    });
    this.animationSystem = new AnimationSystem(this.config.animationEnabled!);

    this.uiSystem = new UISystem({
      enableChatInterface: true,
      enableToolboxPanel: true,
      enableWorkflowDesigner: true,
      enableInsightsDashboard: true,
      autoInitialize: false,
    });

    this.chatInterface = null;
    this.toolPanel = null;
    this.insightsDashboard = null;
    this.workflowDesigner = null;

    this.persistence = new StatePersistence(this.state);
    this.syncManager = new StateSyncManager(this.state);
    this.websocketManager = new WebSocketManager();
    this.messageQueue = new MessageQueue();
    this.eventBus = new EventBus();

    this.renderOptimizer = new RenderOptimizer();
    this.memoryManager = new MemoryManager();
    this.lazyLoader = new LazyLoader();

    this.a11yManager = new AccessibilityManager();
    this.screenReader = new ScreenReaderSupport();
    this.keyboardNav = new KeyboardNavigation();

    this.sandbox = new WidgetSandbox();
    this.permissionManager = new PermissionManager();
    this.contentSecurity = new ContentSecurity();

    // 新增系统
    this.responsiveManager = null;
    this.feedbackManager = null;
    this.toastManager = null;
    this.keyboardShortcutManager = null;

    this.initialized = false;
    this.metrics = {
      renderTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkRequests: 0,
      cacheHitRate: 0,
      errorCount: 0,
      warningCount: 0,
      responsiveAdjustments: 0,
      feedbackCount: 0,
    };
    this.performance = {
      fps: 60,
      loadTime: 0,
      responseTime: 0,
      throughput: 0,
      concurrency: 0,
      animationSmoothness: 1.0,
      responsivePerformance: 1.0,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('IntelligentAIWidget already initialized', 'IntelligentAIWidget');
      return;
    }

    const initializationStartTime = Date.now();

    try {
      this.emit('initializing', { startTime: initializationStartTime });

      // 并行初始化核心系统以提高启动速度
      await Promise.all([
        this.uiSystem.initialize(),
        this.setupPerformanceMonitoring(),
      ]);
      
      this.chatInterface = this.uiSystem.getChatInterface()!;
      this.toolPanel = this.uiSystem.getToolboxPanel()!;
      this.insightsDashboard = this.uiSystem.getInsightsDashboard()!;
      this.workflowDesigner = this.uiSystem.getWorkflowDesigner()!;

      // 初始化新增系统
      if (this.config.enableResponsive) {
        this.responsiveManager = new (await import('./widget/ResponsiveManager')).default({
          widget: this,
          enableAutoAdjust: true,
          breakpoints: {
            small: 480,
            medium: 768,
            large: 1024,
            xlarge: 1200,
          },
        });
      }

      if (this.config.enableFeedback) {
        this.feedbackManager = new (await import('./widget/FeedbackManager')).default({
          widget: this,
          enableRating: true,
          enableComments: true,
          enableAnalytics: true,
        });
      }

      if (this.config.enableToastNotifications) {
        this.toastManager = new (await import('./widget/ToastManager')).default({
          widget: this,
          maxToasts: 5,
          defaultDuration: 3000,
          enableAnimations: true,
        });
      }

      if (this.config.enableKeyboardShortcuts) {
        this.keyboardShortcutManager = new (await import('./widget/KeyboardShortcutManager')).default({
          widget: this,
          enableDefaultShortcuts: true,
          enableCustomShortcuts: true,
        });
      }

      // 设置各个子系统
      const setupPromises = [
        this.setupWidgetManager(),
        this.setupDragSystem(),
        this.setupResizeSystem(),
        this.setupThemeSystem(),
        this.setupAnimationSystem(),
        this.setupPersistence(),
        this.setupSyncManager(),
        this.setupEventBus(),
        this.setupAccessibility(),
        this.setupSecurity(),
        this.setupResponsiveManager(),
        this.setupFeedbackManager(),
        this.setupToastManager(),
        this.setupKeyboardShortcutManager(),
      ];

      await Promise.all(setupPromises);

      this.initialized = true;
      const initializationTime = Date.now() - initializationStartTime;
      this.performance.loadTime = initializationTime;
      
      this.emit('initialized', { initializationTime });
      logger.info(`IntelligentAIWidget initialized successfully in ${initializationTime}ms`, 'IntelligentAIWidget');
    } catch (error) {
      const errorTime = Date.now() - initializationStartTime;
      logger.error(`Failed to initialize IntelligentAIWidget in ${errorTime}ms:`, 'IntelligentAIWidget', { error }, error as Error);
      this.emit('initialization:error', { error, timeElapsed: errorTime });
      throw error;
    }
  }

  private setupResponsiveManager(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableResponsive || !this.responsiveManager) {
        resolve();
        return;
      }

      this.responsiveManager.on('resize:detected', (data: any) => {
        this.emit('responsive:resize', data);
        this.metrics.responsiveAdjustments++;
      });

      this.responsiveManager.on('breakpoint:changed', (data: any) => {
        this.emit('responsive:breakpoint', data);
        this.performance.responsivePerformance = data.performanceScore;
      });

      this.responsiveManager.startMonitoring();
      resolve();
    });
  }

  private setupFeedbackManager(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableFeedback || !this.feedbackManager) {
        resolve();
        return;
      }

      this.feedbackManager.on('feedback:submitted', (data: any) => {
        this.emit('feedback:submitted', data);
        this.metrics.feedbackCount++;
      });

      this.feedbackManager.on('rating:changed', (data: any) => {
        this.emit('feedback:rating', data);
      });

      resolve();
    });
  }

  private setupToastManager(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableToastNotifications || !this.toastManager) {
        resolve();
        return;
      }

      this.toastManager.on('toast:shown', (data: any) => {
        this.emit('notification:shown', data);
      });

      this.toastManager.on('toast:hidden', (data: any) => {
        this.emit('notification:hidden', data);
      });

      resolve();
    });
  }

  private setupKeyboardShortcutManager(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableKeyboardShortcuts || !this.keyboardShortcutManager) {
        resolve();
        return;
      }

      this.keyboardShortcutManager.on('shortcut:triggered', (data: any) => {
        this.emit('keyboard:shortcut', data);
        this.handleKeyboardShortcut(data);
      });

      this.keyboardShortcutManager.registerDefaultShortcuts();
      resolve();
    });
  }

  private setupWidgetManager(): Promise<void> {
    return new Promise((resolve) => {
      this.widgetManager.on('state:changed', (newState: WidgetState) => {
        this.state = newState;
        this.emit('state:changed', newState);
      });

      this.widgetManager.on('module:activated', (moduleId: string) => {
        this.state.activeModule = moduleId;
        this.emit('module:activated', moduleId);
      });

      this.widgetManager.on('module:deactivated', (moduleId: string) => {
        this.emit('module:deactivated', moduleId);
      });

      resolve();
    });
  }

  private setupDragSystem(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableDrag) {
        resolve();
        return;
      }

      this.dragSystem.on('drag:start', (data) => {
        this.emit('drag:start', data);
      });

      this.dragSystem.on('drag:move', (data) => {
        this.state.position = { x: data.x, y: data.y };
        this.emit('drag:move', data);
      });

      this.dragSystem.on('drag:end', (data) => {
        this.emit('drag:end', data);
        this.persistence.save();
      });

      resolve();
    });
  }

  private setupResizeSystem(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableResize) {
        resolve();
        return;
      }

      this.resizeSystem.on('resize:start', (data) => {
        this.emit('resize:start', data);
      });

      this.resizeSystem.on('resize:move', (data) => {
        this.state.size = { width: data.width, height: data.height };
        this.emit('resize:move', data);
      });

      this.resizeSystem.on('resize:end', (data) => {
        this.emit('resize:end', data);
        this.persistence.save();
      });

      resolve();
    });
  }

  private setupThemeSystem(): Promise<void> {
    return new Promise((resolve) => {
      this.themeSystem.on('theme:change', (data: any) => {
        this.state.theme = data.theme.mode as WidgetTheme;
        this.emit('theme:changed', data.theme);
      });

      this.themeSystem.on('auto:mode:change', (enabled: boolean) => {
        this.state.theme = enabled ? 'auto' : this.themeSystem.getCurrentTheme().mode as WidgetTheme;
        this.emit('auto:mode:changed', enabled);
      });

      resolve();
    });
  }

  private setupAnimationSystem(): Promise<void> {
    return new Promise((resolve) => {
      this.animationSystem.on('animation:started', (animationId: string) => {
        this.emit('animation:started', animationId);
      });

      this.animationSystem.on('animation:completed', (animationId: string) => {
        this.emit('animation:completed', animationId);
      });

      resolve();
    });
  }

  private setupPersistence(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enablePersistence) {
        resolve();
        return;
      }

      this.persistence.on('state:saved', (state: WidgetState) => {
        this.emit('state:saved', state);
      });

      this.persistence.on('state:loaded', (state: WidgetState) => {
        this.state = state;
        this.emit('state:loaded', state);
      });

      this.persistence.load();
      resolve();
    });
  }

  private setupSyncManager(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableSync) {
        resolve();
        return;
      }

      this.syncManager.on('sync:started', () => {
        this.emit('sync:started');
      });

      this.syncManager.on('sync:completed', (state: WidgetState) => {
        this.state = state;
        this.emit('sync:completed', state);
      });

      this.syncManager.on('sync:error', (error: Error) => {
        this.emit('sync:error', error);
      });

      resolve();
    });
  }

  private setupEventBus(): Promise<void> {
    return new Promise((resolve) => {
      this.eventBus.on('message:received', (message: any) => {
        this.handleMessage(message);
      });

      this.eventBus.on('event:triggered', (event: any) => {
        this.handleEvent(event);
      });

      resolve();
    });
  }

  private setupAccessibility(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableAccessibility) {
        resolve();
        return;
      }

      this.a11yManager.on('a11y:enabled', () => {
        this.emit('a11y:enabled');
      });

      this.a11yManager.on('a11y:disabled', () => {
        this.emit('a11y:disabled');
      });

      this.keyboardNav.on('keyboard:navigation', (action: string) => {
        this.handleKeyboardNavigation(action);
      });

      resolve();
    });
  }

  private setupSecurity(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableSecurity) {
        resolve();
        return;
      }

      this.sandbox.on('sandbox:violation', (violation: any) => {
        this.emit('security:violation', violation);
      });

      this.permissionManager.on('permission:requested', (permission: string) => {
        this.emit('permission:requested', permission);
      });

      this.contentSecurity.on('csp:violation', (violation: any) => {
        this.emit('security:violation', violation);
      });

      resolve();
    });
  }

  private setupPerformanceMonitoring(): void {
    setInterval(() => {
      this.updateMetrics();
      this.updatePerformance();
    }, 1000);
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'chat':
        this.handleChatMessage(message.data);
        break;
      case 'tool':
        this.handleToolMessage(message.data);
        break;
      case 'workflow':
        this.handleWorkflowMessage(message.data);
        break;
      default:
        logger.warn('Unknown message type:', 'IntelligentAIWidget', { type: message.type });
    }
  }

  private handleEvent(event: any): void {
    this.emit('event:received', event);
  }

  private handleKeyboardNavigation(action: string): void {
    this.emit('keyboard:navigation', action);
  }

  private handleKeyboardShortcut(data: any): void {
    switch (data.shortcut) {
      case 'toggle-chat':
        this.switchModule('chat');
        break;
      case 'toggle-tools':
        this.switchModule('tools');
        break;
      case 'toggle-insights':
        this.switchModule('insights');
        break;
      case 'toggle-workflow':
        this.switchModule('workflow');
        break;
      case 'toggle-minimize':
        this.state.minimized ? this.restore() : this.minimize();
        break;
      case 'toggle-maximize':
        this.state.maximized ? this.restore() : this.maximize();
        break;
      case 'toggle-theme':
        this.toggleTheme();
        break;
      case 'close':
        this.hide();
        break;
      default:
        logger.info('Unhandled keyboard shortcut:', 'IntelligentAIWidget', { shortcut: data.shortcut });
    }
  }

  private switchModule(moduleId: string): void {
    this.widgetManager.activateModule(moduleId);
  }

  private toggleTheme(): void {
    const currentTheme = this.getTheme();
    let newTheme: WidgetTheme;
    
    switch (currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'auto';
        break;
      case 'auto':
        newTheme = 'light';
        break;
      default:
        newTheme = 'light';
    }
    
    this.setTheme(newTheme);
  }

  private async handleChatMessage(data: any): Promise<void> {
    try {
      const message: ChatMessage = {
        id: data.id,
        role: data.role,
        content: data.content,
        timestamp: data.timestamp || Date.now(),
        metadata: data.metadata,
      };

      await this.chatInterface.sendMessage(message);
    } catch (error) {
      logger.error('Failed to handle chat message:', 'IntelligentAIWidget', { error }, error as Error);
      this.emit('error', error);
    }
  }

  private async handleToolMessage(data: any): Promise<void> {
    try {
      await this.toolPanel.executeTool(data.toolId, data.params);
    } catch (error) {
      logger.error('Failed to handle tool message:', 'IntelligentAIWidget', { error }, error as Error);
      this.emit('error', error);
    }
  }

  private async handleWorkflowMessage(data: any): Promise<void> {
    try {
      const workflow = this.workflowDesigner.loadWorkflow(data.workflowId);
      await this.workflowDesigner.executeWorkflow(workflow);
    } catch (error) {
      logger.error('Failed to handle workflow message:', 'IntelligentAIWidget', { error }, error as Error);
      this.emit('error', error);
    }
  }

  private updateMetrics(): void {
    this.metrics = {
      renderTime: this.renderOptimizer.getRenderTime(),
      memoryUsage: this.memoryManager.getMemoryUsage(),
      cpuUsage: this.memoryManager.getCPUUsage(),
      networkRequests: this.websocketManager.getRequestCount(),
      cacheHitRate: this.renderOptimizer.getCacheHitRate(),
      errorCount: this.metrics.errorCount,
      warningCount: this.metrics.warningCount,
      responsiveAdjustments: this.metrics.responsiveAdjustments,
      feedbackCount: this.metrics.feedbackCount,
    };
  }

  private updatePerformance(): void {
    this.performance = {
      fps: this.renderOptimizer.getFPS(),
      loadTime: this.performance.loadTime,
      responseTime: this.performance.responseTime,
      throughput: this.messageQueue.getThroughput(),
      concurrency: this.messageQueue.getConcurrency(),
      animationSmoothness: this.animationSystem.getSmoothnessScore(),
      responsivePerformance: this.performance.responsivePerformance,
    };
  }

  async sendMessage(message: ChatMessage): Promise<string> {
    try {
      return this.chatInterface.sendMessage(message);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async executeTool(toolId: string, params: any): Promise<any> {
    try {
      return this.toolPanel.executeTool(toolId, params);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId: string): Promise<any> {
    try {
      const workflow = this.workflowDesigner.loadWorkflow(workflowId);
      return this.workflowDesigner.executeWorkflow(workflow);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  show(): void {
    this.state.visible = true;
    this.emit('visibility:changed', { visible: true });
  }

  hide(): void {
    this.state.visible = false;
    this.emit('visibility:changed', { visible: false });
  }

  minimize(): void {
    this.state.minimized = true;
    this.emit('minimized');
  }

  maximize(): void {
    this.state.maximized = true;
    this.emit('maximized');
  }

  restore(): void {
    this.state.minimized = false;
    this.state.maximized = false;
    this.emit('restored');
  }

  setTheme(theme: WidgetTheme): void {
    this.themeSystem.setTheme(theme);
  }

  getTheme(): WidgetTheme {
    return this.themeSystem.getCurrentTheme().mode as WidgetTheme;
  }

  getState(): WidgetState {
    return { ...this.state };
  }

  getMetrics(): WidgetMetrics {
    return { ...this.metrics };
  }

  getPerformance(): WidgetPerformance {
    return { ...this.performance };
  }

  getChatInterface(): ChatInterface {
    return this.chatInterface;
  }

  getToolPanel(): ToolboxPanel {
    return this.toolPanel;
  }

  getInsightsDashboard(): InsightsDashboard {
    return this.insightsDashboard;
  }

  getWorkflowDesigner(): WorkflowDesigner {
    return this.workflowDesigner;
  }

  async exportData(_format: 'json' | 'xml' | 'yaml' = 'json'): Promise<any> {
    return this.uiSystem.exportAllData();
  }

  async refresh(): Promise<void> {
    await this.uiSystem.refreshAll();
  }

  destroy(): void {
    this.emit('destroyed');

    this.widgetManager.destroy();
    this.dragSystem.destroy();
    this.resizeSystem.destroy();
    this.themeSystem.destroy();
    this.animationSystem.destroy();
    this.persistence.destroy();
    this.syncManager.destroy();
    this.websocketManager.destroy();
    this.messageQueue.destroy();
    this.eventBus.destroy();
    this.renderOptimizer.destroy();
    this.memoryManager.destroy();
    this.lazyLoader.destroy();
    this.a11yManager.destroy();
    this.screenReader.destroy();
    this.keyboardNav.destroy();
    this.sandbox.destroy();
    this.permissionManager.destroy();
    this.contentSecurity.destroy();

    // 清理新增系统
    if (this.responsiveManager) {
      this.responsiveManager.destroy();
    }
    if (this.feedbackManager) {
      this.feedbackManager.destroy();
    }
    if (this.toastManager) {
      this.toastManager.destroy();
    }
    if (this.keyboardShortcutManager) {
      this.keyboardShortcutManager.destroy();
    }

    this.uiSystem.destroy();

    this.removeAllListeners();
    this.initialized = false;

    logger.info('IntelligentAIWidget destroyed', 'IntelligentAIWidget');
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
