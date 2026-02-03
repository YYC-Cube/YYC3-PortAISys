/**
 * @file PluginManager.ts
 * @description 插件管理器 - 管理插件生命周期
 * @module core/plugin-system
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import EventEmitter from 'eventemitter3';
import type { Plugin, InstallOptions, UpdateInfo } from './types';
import { PluginMarketplace } from './PluginMarketplace';
import { logger } from '../utils/logger';

/**
 * 插件状态
 */
export enum PluginStatus {
  UNINSTALLED = 'uninstalled',
  INSTALLED = 'installed',
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  ERROR = 'error'
}

/**
 * 插件元数据
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  license?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  capabilities?: string[];
  permissions?: string[];
  minSystemVersion?: string;
  maxSystemVersion?: string;
}

/**
 * 插件配置
 */
export interface PluginConfig {
  [key: string]: any;
}

/**
 * 插件接口
 */
export interface IPlugin {
  metadata: PluginMetadata;
  config?: PluginConfig;
  
  onInstall?(): Promise<void>;
  onUninstall?(): Promise<void>;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
  onUpdate?(oldVersion: string, newVersion: string): Promise<void>;
  onConfigChange?(config: PluginConfig): Promise<void>;
}

/**
 * 插件注册信息
 */
export interface PluginRegistration {
  plugin: IPlugin;
  status: PluginStatus;
  installedAt?: Date;
  enabledAt?: Date;
  lastError?: Error;
}

/**
 * 插件市场配置
 */
export interface PluginMarketplaceConfig {
  registryUrl?: string;
  cacheDir?: string;
  autoUpdate?: boolean;
  checkUpdateInterval?: number;
}

/**
 * 插件管理器
 */
export class PluginManager extends EventEmitter {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, Set<Function>> = new Map();
  private config: Required<PluginMarketplaceConfig>;
  private updateInterval?: NodeJS.Timeout;
  private marketplace: PluginMarketplace;

  constructor(config: PluginMarketplaceConfig = {}, marketplace?: PluginMarketplace) {
    super();

    this.marketplace = marketplace || new PluginMarketplace();
    this.config = {
      registryUrl: config.registryUrl || 'https://plugins.yyc3.io',
      cacheDir: config.cacheDir || '.plugins',
      autoUpdate: config.autoUpdate !== false,
      checkUpdateInterval: config.checkUpdateInterval || 86400000 // 24小时
    };
  }

  /**
   * 初始化插件管理器
   */
  async initialize(): Promise<void> {
    if (this.config.autoUpdate) {
      this.startAutoUpdateCheck();
    }
    this.emit('manager:initialized');
  }

  /**
   * 关闭插件管理器
   */
  async shutdown(): Promise<void> {
    // 停止自动更新检查
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }

    // 禁用所有插件
    for (const [pluginId, registration] of this.plugins.entries()) {
      if (registration.status === PluginStatus.ENABLED) {
        try {
          await this.disable(pluginId);
        } catch (error) {
          logger.error(`Failed to disable plugin ${pluginId} during shutdown:`, 'PluginManager', { error }, error as Error);
        }
      }
    }

    this.emit('manager:shutdown');
  }

  /**
   * 注册插件
   */
  async register(plugin: Plugin): Promise<void> {
    const { id, version } = plugin.manifest;

    if (this.plugins.has(id)) {
      throw new Error(`Plugin ${id} is already registered`);
    }

    // 验证插件
    this.validatePlugin(plugin);

    // 检查依赖
    await this.checkDependencies(plugin);

    // 注册插件
    this.plugins.set(id, plugin);

    // 自动注册hooks
    if (plugin.manifest.hooks && plugin.instance) {
      for (const hookName of plugin.manifest.hooks) {
        if (typeof plugin.instance.handleHook === 'function') {
          this.registerHook(hookName, async (data: any) => {
            return await plugin.instance!.handleHook(data);
          });
        }
      }
    }

    // 执行安装回调
    if (plugin.onInstall) {
      try {
        await plugin.onInstall();
      } catch (error) {
        this.plugins.delete(id);
        throw new Error(`Failed to install plugin ${id}: ${error}`);
      }
    }

    this.emit('plugin:registered', { id, version });
  }

  /**
   * 注销插件
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    // 如果插件已启用，先禁用
    if (plugin.enabled) {
      await this.disable(pluginId);
    }

    // 执行卸载回调
    if (plugin.onUninstall) {
      await plugin.onUninstall();
    }

    // 移除插件
    this.plugins.delete(pluginId);

    this.emit('plugin:unregistered', { id: pluginId });
  }

  /**
   * 安装插件
   */
  async install(pluginId: string, options: InstallOptions = {}): Promise<boolean> {
    try {
      // 如果提供了manifest，直接注册
      if (options.manifest) {
        const plugin: Plugin = {
          id: pluginId,
          manifest: options.manifest,
          enabled: false
        };
        await this.register(plugin);
        return true;
      }

      // 从市场下载并安装
      const marketplacePlugin = this.marketplace.getPlugin(pluginId);
      if (!marketplacePlugin) {
        throw new Error(`Plugin ${pluginId} not found in marketplace`);
      }

      // 如果指定了版本，使用指定的版本
      const manifest: any = { ...marketplacePlugin.metadata };
      if (options.version) {
        manifest.version = options.version;
      }

      if (!manifest.main) {
        manifest.main = 'index.js';
      }

      const plugin: Plugin = {
        id: pluginId,
        manifest: manifest as any,
        enabled: false
      };
      
      await this.register(plugin);
      this.marketplace.recordDownload(pluginId);
      
      return true;
    } catch (error) {
      this.emit('plugin:install:error', { pluginId, error });
      throw error;
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(pluginId: string): Promise<void> {
    await this.unregister(pluginId);
  }

  /**
   * 重载插件
   */
  async reload(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const wasEnabled = plugin.enabled;

    // 禁用插件
    if (wasEnabled) {
      await this.disable(pluginId);
    }

    // 重新启用
    if (wasEnabled) {
      await this.enable(pluginId);
    }

    this.emit('plugin:reloaded', { pluginId });
  }

  /**
   * 检查更新
   */
  async checkUpdates(): Promise<UpdateInfo[]> {
    const updates: UpdateInfo[] = [];
    
    for (const [pluginId, plugin] of this.plugins.entries()) {
      const marketplacePlugin = this.marketplace.getPlugin(pluginId);
      if (marketplacePlugin && marketplacePlugin.metadata.version !== plugin.manifest.version) {
        updates.push({
          pluginId,
          currentVersion: plugin.manifest.version,
          latestVersion: marketplacePlugin.metadata.version
        });
      }
    }

    return updates;
  }

  /**
   * 更新插件
   */
  async update(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const marketplacePlugin = this.marketplace.getPlugin(pluginId);
    if (!marketplacePlugin) {
      throw new Error(`Plugin ${pluginId} not found in marketplace`);
    }

    const oldVersion = plugin.manifest.version;
    const newVersion = marketplacePlugin.metadata.version;

    if (oldVersion === newVersion) {
      return;
    }

    // 更新manifest
    plugin.manifest = marketplacePlugin.metadata;

    // 执行更新回调
    if (plugin.onUpdate) {
      await plugin.onUpdate(oldVersion, newVersion);
    }

    this.emit('plugin:updated', { pluginId, oldVersion, newVersion });
  }

  /**
   * 获取市场
   */
  getMarketplace(): PluginMarketplace {
    return this.marketplace;
  }

  /**
   * 获取已安装的插件列表
   */
  getInstalledPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 启用插件
   */
  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    if (plugin.enabled) {
      return;
    }

    // 检查依赖是否已启用
    await this.checkEnabledDependencies(plugin);

    // 执行启用回调
    if (plugin.onEnable) {
      try {
        await plugin.onEnable();
      } catch (error) {
        throw error;
      }
    }

    plugin.enabled = true;

    this.emit('plugin:enabled', { id: pluginId });
  }

  /**
   * 禁用插件
   */
  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    if (!plugin.enabled) {
      return;
    }

    // 检查是否有其他插件依赖此插件
    this.checkDependents(pluginId);

    // 执行禁用回调
    if (plugin.onDisable) {
      await plugin.onDisable();
    }

    plugin.enabled = false;

    this.emit('plugin:disabled', { id: pluginId });
  }

  /**
   * 更新插件配置
   */
  async updateConfig(pluginId: string, config: PluginConfig): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    plugin.config = config;

    if (plugin.onConfigChange) {
      await plugin.onConfigChange(config);
    }

    this.emit('plugin:config:updated', { id: pluginId, config });
  }

  /**
   * 获取插件
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取已启用的插件
   */
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.enabled);
  }

  /**
   * 获取插件状态
   */
  getPluginStatus(pluginId: string): PluginStatus | undefined {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return undefined;
    return plugin.enabled ? PluginStatus.ENABLED : PluginStatus.DISABLED;
  }

  /**
   * 检查插件是否已启用
   */
  isEnabled(pluginId: string): boolean {
    return this.plugins.get(pluginId)?.enabled || false;
  }

  /**
   * 注册钩子
   */
  registerHook(hookName: string, handler: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, new Set());
    }
    this.hooks.get(hookName)!.add(handler);
  }

  /**
   * 注销钩子
   */
  unregisterHook(hookName: string, handler: Function): void {
    const hooks = this.hooks.get(hookName);
    if (hooks) {
      hooks.delete(handler);
    }
  }

  /**
   * 执行钩子
   */
  async executeHook(hookName: string, data: any): Promise<any> {
    const hooks = this.hooks.get(hookName);
    if (!hooks || hooks.size === 0) {
      return undefined;
    }

    const results = [];
    for (const handler of hooks) {
      try {
        const result = await handler(data);
        results.push(result);
      } catch (error) {
        this.emit('hook:error', { hookName, error });
        
        // 找到并禁用崩溃的插件
        for (const [pluginId, plugin] of this.plugins.entries()) {
          if (plugin.enabled && plugin.manifest.hooks?.includes(hookName)) {
            plugin.enabled = false;
            this.emit('plugin:crashed', { pluginId, error });
            break;
          }
        }
        // 不抛出错误，继续执行其他hook
      }
    }

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * 验证插件
   */
  private validatePlugin(plugin: Plugin): void {
    const { id, name, version } = plugin.manifest;

    if (!id || !name || !version) {
      throw new Error('Plugin metadata is incomplete');
    }

    // 验证版本格式
    if (!/^\d+\.\d+\.\d+/.test(version)) {
      throw new Error(`Invalid version format: ${version}`);
    }

    // 验证权限
    if (plugin.manifest.permissions) {
      for (const permission of plugin.manifest.permissions) {
        if (!this.isValidPermission(permission)) {
          throw new Error(`Invalid permission: ${permission}`);
        }
      }
    }
  }

  /**
   * 检查依赖
   */
  private async checkDependencies(plugin: Plugin, visited: Set<string> = new Set()): Promise<void> {
    const dependencies = plugin.manifest.dependencies;
    
    if (!dependencies) {
      return;
    }

    // 检查循环依赖
    if (visited.has(plugin.manifest.id)) {
      throw new Error('Circular dependency detected');
    }
    visited.add(plugin.manifest.id);

    for (const [depId, depVersion] of Object.entries(dependencies)) {
      let depPlugin = this.getPlugin(depId);
      
      if (!depPlugin) {
        // 尝试从市场获取插件元数据
        const marketplacePlugin = this.marketplace.getPlugin(depId);
        if (marketplacePlugin) {
          // 检查依赖的依赖是否会造成循环
          const depManifest = marketplacePlugin.metadata;
          if (depManifest.dependencies && Object.keys(depManifest.dependencies).includes(plugin.manifest.id)) {
            throw new Error('Circular dependency detected');
          }
          // 自动安装依赖
          await this.install(depId);
          depPlugin = this.getPlugin(depId);
        } else {
          throw new Error(`Missing dependency: ${depId}@${depVersion}`);
        }
      }

      if (depPlugin) {
        if (!this.isVersionCompatible(depPlugin.manifest.version, depVersion)) {
          throw new Error(
            `Incompatible dependency version: ${depId}@${depPlugin.manifest.version} (required: ${depVersion})`
          );
        }
        // 递归检查依赖的依赖
        await this.checkDependencies(depPlugin, new Set(visited));
      }
    }
  }

  /**
   * 检查已启用的依赖
   */
  private async checkEnabledDependencies(plugin: Plugin): Promise<void> {
    const dependencies = plugin.manifest.dependencies;
    
    if (!dependencies) {
      return;
    }

    for (const depId of Object.keys(dependencies)) {
      if (!this.isEnabled(depId)) {
        throw new Error(`Dependency ${depId} is not enabled`);
      }
    }
  }

  /**
   * 检查依赖者
   */
  private checkDependents(pluginId: string): void {
    const dependents = this.getAllPlugins().filter(plugin => {
      const deps = plugin.manifest.dependencies;
      return deps && Object.keys(deps).includes(pluginId) && this.isEnabled(plugin.manifest.id);
    });

    if (dependents.length > 0) {
      const names = dependents.map(p => p.manifest.name).join(', ');
      // 不阻止禁用，只记录警告
      this.emit('plugin:dependents:warning', { pluginId, dependents: names });
    }
  }

  /**
   * 版本兼容性检查
   */
  private isVersionCompatible(current: string, required: string): boolean {
    // 移除^等符号
    const cleanRequired = required.replace(/[^\d.]/g, '');
    const cleanCurrent = current.replace(/[^\d.]/g, '');
    
    // 简化版本检查: 只检查主版本号相同
    const currentParts = cleanCurrent.split('.');
    const requiredParts = cleanRequired.split('.');
    
    // 主版本号必须相同，次版本号current>=required
    return currentParts[0] === requiredParts[0] && 
           (parseInt(currentParts[1] || '0') >= parseInt(requiredParts[1] || '0'));
  }

  /**
   * 验证权限
   */
  private isValidPermission(permission: string): boolean {
    const validPermissions = [
      'file:read',
      'file:write',
      'network:fetch',
      'storage:read',
      'storage:write',
      'ui:render',
      'system:execute'
    ];
    
    return validPermissions.includes(permission);
  }

  /**
   * 启动自动更新检查
   */
  private startAutoUpdateCheck(): void {
    this.updateInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.config.checkUpdateInterval);
  }

  /**
   * 检查更新
   */
  private async checkForUpdates(): Promise<void> {
    for (const [id, registration] of this.plugins) {
      try {
        const latestVersion = await this.fetchLatestVersion(id);
        const currentVersion = registration.plugin.metadata.version;

        if (latestVersion > currentVersion) {
          this.emit('plugin:update:available', {
            id,
            currentVersion,
            latestVersion
          });
        }
      } catch (error) {
        this.emit('plugin:update:check:error', { id, error });
      }
    }
  }

  /**
   * 获取最新版本
   */
  private async fetchLatestVersion(_pluginId: string): Promise<string> {
    // 模拟API调用
    return '1.0.0';
  }

  /**
   * 搜索插件
   */
  async searchPlugins(_query: string, _filters?: {
    category?: string;
    tags?: string[];
    minRating?: number;
  }): Promise<PluginMetadata[]> {
    // 模拟市场搜索
    return [];
  }

  /**
   * 从市场安装插件
   */
  async installFromMarketplace(pluginId: string): Promise<void> {
    // 1. 从市场下载插件
    // 2. 验证插件签名
    // 3. 注册插件
    this.emit('plugin:marketplace:install:started', { id: pluginId });
    
    // 模拟安装
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.emit('plugin:marketplace:install:completed', { id: pluginId });
  }

  /**
   * 发布插件到市场
   */
  async publishToMarketplace(plugin: IPlugin): Promise<void> {
    // 1. 验证插件
    this.validatePlugin(plugin);
    
    // 2. 打包插件
    // 3. 上传到市场
    // 4. 生成签名
    
    this.emit('plugin:marketplace:publish:started', { id: plugin.metadata.id });
    
    // 模拟发布
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.emit('plugin:marketplace:publish:completed', { id: plugin.metadata.id });
  }

  /**
   * 生成插件统计报告
   */
  generateReport(): string {
    const total = this.plugins.size;
    const enabled = Array.from(this.plugins.values()).filter(
      plugin => plugin.enabled
    ).length;
    const disabled = total - enabled;

    return `
╔══════════════════════════════════════════════════════════════╗
║              Plugin System Report                           ║
╚══════════════════════════════════════════════════════════════╝

=== 插件统计 ===
总插件数: ${total}
已启用: ${enabled}
已禁用: ${disabled}

=== 已安装插件 ===
${Array.from(this.plugins.values()).map(plugin => {
  const p = plugin.manifest;
  return `${p.name} v${p.version} [${plugin.enabled ? 'enabled' : 'disabled'}]`;
}).join('\n')}

=== 钩子统计 ===
注册的钩子数: ${this.hooks.size}
    `.trim();
  }
}

/**
 * 创建插件管理器
 */
export function createPluginManager(config?: PluginMarketplaceConfig): PluginManager {
  return new PluginManager(config);
}