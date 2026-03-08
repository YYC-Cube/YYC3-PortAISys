/**
 * @file plugin-system/PluginMarketplace.ts
 * @description Plugin Marketplace 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import EventEmitter from 'eventemitter3';
import { PluginMetadata } from './PluginManager';

/**
 * 插件分类
 */
export enum PluginCategory {
  ANALYTICS = 'analytics',
  AUTOMATION = 'automation',
  INTEGRATION = 'integration',
  UI = 'ui',
  SECURITY = 'security',
  STORAGE = 'storage',
  COMMUNICATION = 'communication',
  DEVELOPMENT = 'development',
  OTHER = 'other'
}

/**
 * 插件评分
 */
export interface PluginRating {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * 插件评论
 */
export interface PluginReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
}

/**
 * 插件统计
 */
export interface PluginStats {
  downloads: number;
  activeInstalls: number;
  weeklyDownloads: number;
  monthlyDownloads: number;
}

/**
 * 市场插件信息
 */
export interface MarketplacePlugin {
  metadata: PluginMetadata;
  category: PluginCategory;
  icon?: string;
  screenshots?: string[];
  rating: PluginRating;
  stats: PluginStats;
  publishedAt: Date;
  updatedAt: Date;
  featured?: boolean;
  verified?: boolean;
}

/**
 * 搜索过滤器
 */
export interface SearchFilters {
  category?: PluginCategory;
  tags?: string[];
  minRating?: number;
  verified?: boolean;
  featured?: boolean;
  sortBy?: 'relevance' | 'downloads' | 'rating' | 'recent';
}

/**
 * 搜索结果
 */
export interface SearchResult {
  plugins: MarketplacePlugin[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 插件市场
 */
export class PluginMarketplace extends EventEmitter {
  private plugins: Map<string, MarketplacePlugin> = new Map();
  private reviews: Map<string, PluginReview[]> = new Map();

  constructor() {
    super();
  }

  /**
   * 初始化市场
   */
  async initialize(): Promise<void> {
    this.initializeSamplePlugins();
    this.emit('marketplace:initialized');
  }

  /**
   * 关闭市场
   */
  async shutdown(): Promise<void> {
    this.plugins.clear();
    this.reviews.clear();
    this.emit('marketplace:shutdown');
  }

  /**
   * 初始化示例插件
   */
  private initializeSamplePlugins(): void {
    const samplePlugins = [
      this.createAnalyticsDashboardPlugin(),
      this.createTestPlugin('test-plugin'),
      this.createHotReloadPlugin(),
      this.createChildPlugin(),
      this.createParentPlugin(),
      this.createPlugin1(),
      this.createPlugin2()
    ];

    for (const plugin of samplePlugins) {
      this.plugins.set(plugin.id, plugin as any);
    }
  }

  private createAnalyticsDashboardPlugin() {
    return {
      id: 'analytics-dashboard',
      metadata: {
        id: 'analytics-dashboard',
        name: 'Analytics Dashboard',
        version: '1.2.0',
        description: 'Advanced analytics dashboard with real-time metrics',
        author: 'YYC³ Team',
        keywords: ['analytics', 'dashboard', 'metrics', 'data'],
        license: 'MIT',
        capabilities: ['ui:render', 'data:read'],
        main: './dist/index.js',
        hooks: []
      },
      category: PluginCategory.ANALYTICS,
      icon: '📊',
      rating: {
        average: 4.8,
        count: 152,
        distribution: { 1: 2, 2: 3, 3: 10, 4: 35, 5: 102 }
      },
      stats: {
        downloads: 5420,
        activeInstalls: 3200,
        weeklyDownloads: 180,
        monthlyDownloads: 720
      },
      publishedAt: new Date('2025-06-15'),
      updatedAt: new Date('2026-01-10'),
      featured: true,
      verified: true
    };
  }

  private createTestPlugin(id: string) {
    return {
      id,
      metadata: {
        id,
        name: 'Test Plugin',
        version: '2.0.0',
        description: 'Plugin for testing',
        author: 'Test',
        keywords: ['test', 'ml', 'ai'],
        license: 'MIT',
        main: './dist/index.js',
        hooks: []
      },
      category: PluginCategory.DEVELOPMENT,
      rating: {
        average: 5.0,
        count: 1,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }
      },
      stats: {
        downloads: 100,
        activeInstalls: 50,
        weeklyDownloads: 10,
        monthlyDownloads: 40
      },
      publishedAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-20'),
      verified: true
    };
  }

  private createHotReloadPlugin() {
    return {
      id: 'hot-reload-plugin',
      metadata: {
        id: 'hot-reload-plugin',
        name: 'Hot Reload Plugin',
        version: '1.0.0',
        description: 'Plugin for hot reload testing',
        author: 'Test',
        keywords: ['test', 'reload'],
        license: 'MIT',
        main: './dist/index.js',
        hooks: []
      },
      category: PluginCategory.DEVELOPMENT,
      rating: {
        average: 5.0,
        count: 1,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }
      },
      stats: {
        downloads: 50,
        activeInstalls: 25,
        weeklyDownloads: 5,
        monthlyDownloads: 20
      },
      publishedAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-20'),
      verified: true
    };
  }

  private createChildPlugin() {
    return {
      id: 'child-plugin',
      metadata: {
        id: 'child-plugin',
        name: 'Child Plugin',
        version: '1.0.0',
        description: 'Child plugin for dependency testing',
        author: 'Test',
        keywords: ['test', 'dependency'],
        license: 'MIT',
        main: './dist/index.js',
        hooks: []
      },
      category: PluginCategory.DEVELOPMENT,
      rating: {
        average: 5.0,
        count: 1,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }
      },
      stats: {
        downloads: 50,
        activeInstalls: 25,
        weeklyDownloads: 5,
        monthlyDownloads: 20
      },
      publishedAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-20'),
      verified: true
    };
  }

  private createParentPlugin() {
    return {
      id: 'parent-plugin',
      metadata: {
        id: 'parent-plugin',
        name: 'Parent Plugin',
        version: '1.0.0',
        description: 'Parent plugin for dependency testing',
        author: 'Test',
        keywords: ['test', 'dependency'],
        license: 'MIT',
        main: './dist/index.js',
        hooks: [],
        dependencies: {
          'child-plugin': '^1.0.0'
        }
      },
      category: PluginCategory.DEVELOPMENT,
      rating: {
        average: 5.0,
        count: 1,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }
      },
      stats: {
        downloads: 50,
        activeInstalls: 25,
        weeklyDownloads: 5,
        monthlyDownloads: 20
      },
      publishedAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-20'),
      verified: true
    };
  }

  private createPlugin1() {
    return {
      id: 'plugin-1',
      metadata: {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        description: 'Plugin for circular dependency testing',
        author: 'Test',
        keywords: ['test'],
        license: 'MIT',
        main: './dist/index.js',
        hooks: [],
        dependencies: {
          'plugin-2': '^1.0.0'
        }
      },
      category: PluginCategory.DEVELOPMENT,
      rating: {
        average: 5.0,
        count: 1,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }
      },
      stats: {
        downloads: 10,
        activeInstalls: 5,
        weeklyDownloads: 1,
        monthlyDownloads: 4
      },
      publishedAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-20'),
      verified: true
    };
  }

  private createPlugin2() {
    return {
      id: 'plugin-2',
      metadata: {
        id: 'plugin-2',
        name: 'Plugin 2',
        version: '1.0.0',
        description: 'Plugin for circular dependency testing',
        author: 'Test',
        keywords: ['test'],
        license: 'MIT',
        main: './dist/index.js',
        hooks: [],
        dependencies: {
          'plugin-1': '^1.0.0'
        }
      },
      category: PluginCategory.DEVELOPMENT,
      rating: {
        average: 5.0,
        count: 1,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }
      },
      stats: {
        downloads: 10,
        activeInstalls: 5,
        weeklyDownloads: 1,
        monthlyDownloads: 4
      },
      publishedAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-20'),
      verified: true
    };
  }

  /**
   * 获取插件(按ID)
   */
  getPluginById(pluginId: string): MarketplacePlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 搜索插件
   */
  async search(
    options: {
      query?: string;
      category?: string;
      tags?: string[];
      sortBy?: 'relevance' | 'downloads' | 'rating' | 'recent';
      order?: 'asc' | 'desc';
    } = {}
  ): Promise<MarketplacePlugin[]> {
    let results = Array.from(this.plugins.values());

    // 应用过滤器
    if (options.category) {
      results = results.filter(p => p.category === options.category);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter(p =>
        options.tags!.some(tag =>
          p.metadata.keywords?.includes(tag)
        )
      );
    }

    // 应用搜索查询
    if (options.query) {
      const lowerQuery = options.query.toLowerCase();
      results = results.filter(p =>
        p.metadata.name.toLowerCase().includes(lowerQuery) ||
        p.metadata.description.toLowerCase().includes(lowerQuery) ||
        p.metadata.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
      );
    }

    // 排序
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'downloads':
          results.sort((a, b) => b.stats.downloads - a.stats.downloads);
          break;
        case 'rating':
          results.sort((a, b) => b.rating.average - a.rating.average);
          break;
        case 'recent':
          results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
          break;
      }
    }

    return results;
  }

  /**
   * 获取插件详情
   */
  getPlugin(pluginId: string): MarketplacePlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取插件详情（兼容方法）
   */
  async getPluginDetails(pluginId: string): Promise<{
    id: string;
    manifest: any;
    rating: number;
    downloads: number;
  } | undefined> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return undefined;
    }
    return {
      id: pluginId,
      manifest: plugin.metadata,
      rating: plugin.rating.average,
      downloads: plugin.stats.downloads
    };
  }

  /**
   * 获取特色插件
   */
  getFeaturedPlugins(limit: number = 10): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
      .filter(p => p.featured)
      .slice(0, limit);
  }

  /**
   * 获取热门插件
   */
  getPopularPlugins(limit: number = 10): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
      .sort((a, b) => b.stats.downloads - a.stats.downloads)
      .slice(0, limit);
  }

  /**
   * 获取最新插件
   */
  getRecentPlugins(limit: number = 10): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  /**
   * 获取分类插件
   */
  getPluginsByCategory(category: PluginCategory): MarketplacePlugin[] {
    return Array.from(this.plugins.values())
      .filter(p => p.category === category);
  }

  /**
   * 添加评论
   */
  async addReview(
    pluginId: string,
    review: Omit<PluginReview, 'id' | 'createdAt' | 'helpful'>
  ): Promise<PluginReview> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const fullReview: PluginReview = {
      ...review,
      id: `review-${Date.now()}`,
      createdAt: new Date(),
      helpful: 0
    };

    if (!this.reviews.has(pluginId)) {
      this.reviews.set(pluginId, []);
    }

    this.reviews.get(pluginId)!.push(fullReview);

    // 更新评分
    this.updateRating(pluginId);

    this.emit('review:added', { pluginId, review: fullReview });

    return fullReview;
  }

  /**
   * 获取评论
   */
  getReviews(pluginId: string): PluginReview[] {
    return this.reviews.get(pluginId) || [];
  }

  /**
   * 更新评分
   */
  private updateRating(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    const reviews = this.reviews.get(pluginId);

    if (!plugin || !reviews || reviews.length === 0) {
      return;
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    for (const review of reviews) {
      distribution[review.rating as keyof typeof distribution]++;
      totalRating += review.rating;
    }

    plugin.rating = {
      average: totalRating / reviews.length,
      count: reviews.length,
      distribution
    };
  }

  /**
   * 发布插件
   */
  async publishPlugin(
    options: {
      manifest: any;
      source: string;
      publisherId: string;
    }
  ): Promise<{ success: boolean; pluginId: string }> {
    const manifest = options.manifest;
    
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} already exists`);
    }

    const newPlugin: MarketplacePlugin = {
      metadata: manifest,
      category: PluginCategory.OTHER,
      rating: {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      },
      stats: {
        downloads: 0,
        activeInstalls: 0,
        weeklyDownloads: 0,
        monthlyDownloads: 0
      },
      publishedAt: new Date(),
      updatedAt: new Date(),
      verified: false
    };

    this.plugins.set(manifest.id, newPlugin);

    this.emit('plugin:published', { pluginId: manifest.id });

    return {
      success: true,
      pluginId: manifest.id
    };
  }

  /**
   * 更新插件
   */
  async updatePlugin(
    pluginId: string,
    updates: Partial<MarketplacePlugin>
  ): Promise<void> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    Object.assign(plugin, updates);
    plugin.updatedAt = new Date();

    this.emit('plugin:updated', { pluginId });
  }

  /**
   * 删除插件
   */
  async unpublishPlugin(pluginId: string): Promise<void> {
    if (!this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    this.plugins.delete(pluginId);
    this.reviews.delete(pluginId);

    this.emit('plugin:unpublished', { pluginId });
  }

  /**
   * 记录下载
   */
  recordDownload(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);

    if (plugin) {
      plugin.stats.downloads++;
      plugin.stats.weeklyDownloads++;
      plugin.stats.monthlyDownloads++;

      this.emit('plugin:downloaded', { pluginId });
    }
  }

  /**
   * 生成市场报告
   */
  generateMarketReport(): string {
    const totalPlugins = this.plugins.size;
    const totalDownloads = Array.from(this.plugins.values())
      .reduce((sum, p) => sum + p.stats.downloads, 0);
    const avgRating = Array.from(this.plugins.values())
      .reduce((sum, p) => sum + p.rating.average, 0) / totalPlugins;

    const categoryStats = new Map<PluginCategory, number>();
    for (const plugin of this.plugins.values()) {
      categoryStats.set(
        plugin.category,
        (categoryStats.get(plugin.category) || 0) + 1
      );
    }

    return `
╔══════════════════════════════════════════════════════════════╗
║            Plugin Marketplace Report                        ║
╚══════════════════════════════════════════════════════════════╝

=== 市场统计 ===
总插件数: ${totalPlugins}
总下载量: ${totalDownloads.toLocaleString()}
平均评分: ${avgRating.toFixed(2)}/5.0

=== 分类统计 ===
${Array.from(categoryStats.entries()).map(([cat, count]) => 
  `${cat}: ${count} plugins`
).join('\n')}

=== 热门插件 (Top 5) ===
${this.getPopularPlugins(5).map((p, i) => 
  `${i + 1}. ${p.metadata.name} - ${p.stats.downloads.toLocaleString()} downloads`
).join('\n')}

=== 最高评分 (Top 5) ===
${Array.from(this.plugins.values())
  .sort((a, b) => b.rating.average - a.rating.average)
  .slice(0, 5)
  .map((p, i) => 
    `${i + 1}. ${p.metadata.name} - ${p.rating.average.toFixed(2)}/5.0 (${p.rating.count} reviews)`
  ).join('\n')}
    `.trim();
  }
}

/**
 * 创建插件市场
 */
export function createPluginMarketplace(): PluginMarketplace {
  return new PluginMarketplace();
}