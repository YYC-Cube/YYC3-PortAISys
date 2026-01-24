/**
 * @file types.ts
 * @description 插件系统类型定义
 * @module core/plugin-system
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-22
 */

/**
 * 插件清单
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  license?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  hooks?: string[];
  permissions?: string[];
  minSystemVersion?: string;
  maxSystemVersion?: string;
}

/**
 * 插件实例
 */
export interface PluginInstance {
  [key: string]: any;
}

/**
 * 插件接口
 */
export interface Plugin {
  id: string;
  manifest: PluginManifest;
  enabled: boolean;
  instance?: PluginInstance;
  config?: Record<string, any>;
  
  onInstall?(): Promise<void>;
  onUninstall?(): Promise<void>;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
  onUpdate?(oldVersion: string, newVersion: string): Promise<void>;
  onConfigChange?(config: Record<string, any>): Promise<void>;
}

/**
 * 插件安装选项
 */
export interface InstallOptions {
  source?: string;
  version?: string;
  manifest?: PluginManifest;
}

/**
 * 插件更新信息
 */
export interface UpdateInfo {
  pluginId: string;
  currentVersion: string;
  latestVersion: string;
}

/**
 * 插件详情
 */
export interface PluginDetails {
  id: string;
  manifest: PluginManifest;
  rating: number;
  downloads: number;
}

/**
 * 发布选项
 */
export interface PublishOptions {
  manifest: PluginManifest;
  source: string;
  publisherId: string;
}

/**
 * 发布结果
 */
export interface PublishResult {
  success: boolean;
  pluginId: string;
}

/**
 * 搜索选项
 */
export interface SearchOptions {
  query?: string;
  category?: string;
  tags?: string[];
  sortBy?: 'relevance' | 'downloads' | 'rating' | 'recent';
  order?: 'asc' | 'desc';
}

/**
 * 评论
 */
export interface Review {
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
}
