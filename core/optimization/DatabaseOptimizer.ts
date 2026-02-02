/**
 * @file DatabaseOptimizer.ts
 * @description 数据库优化器 - 自动优化数据库性能
 * @module core/optimization
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import EventEmitter from 'eventemitter3';

/**
 * 查询统计
 */
export interface QueryStats {
  query: string;
  executionCount: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  lastExecuted: Date;
}

/**
 * 索引建议
 */
export interface IndexSuggestion {
  table: string;
  columns: string[];
  reason: string;
  estimatedImprovement: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  type: 'index' | 'query' | 'schema' | 'connection';
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  estimatedImprovement: string;
}

/**
 * 连接池配置
 */
export interface ConnectionPoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  acquireTimeoutMillis: number;
}

/**
 * 优化配置
 */
export interface OptimizerConfig {
  enableAutoIndex?: boolean;
  enableQueryAnalysis?: boolean;
  enableConnectionPoolOptimization?: boolean;
  slowQueryThreshold?: number;
  analysisInterval?: number;
}

/**
 * 数据库优化器
 */
export class DatabaseOptimizer extends EventEmitter {
  private config: Required<OptimizerConfig>;
  private queryStats: Map<string, QueryStats> = new Map();
  private indexSuggestions: IndexSuggestion[] = [];
  private connectionPoolStats = {
    active: 0,
    idle: 0,
    waiting: 0,
    created: 0,
    destroyed: 0
  };
  private analysisTimer?: NodeJS.Timeout;

  constructor(config: OptimizerConfig = {}) {
    super();

    this.config = {
      enableAutoIndex: config.enableAutoIndex !== false,
      enableQueryAnalysis: config.enableQueryAnalysis !== false,
      enableConnectionPoolOptimization: config.enableConnectionPoolOptimization !== false,
      slowQueryThreshold: config.slowQueryThreshold || 100, // 100ms
      analysisInterval: config.analysisInterval || 300000 // 5分钟
    };
  }

  /**
   * 启动优化器
   */
  start(): void {
    this.analysisTimer = setInterval(() => {
      this.analyze();
    }, this.config.analysisInterval);

    this.emit('optimizer:started');
  }

  /**
   * 停止优化器
   */
  stop(): void {
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = undefined;
    }

    this.emit('optimizer:stopped');
  }

  /**
   * 记录查询
   */
  recordQuery(query: string, duration: number): void {
    const normalizedQuery = this.normalizeQuery(query);
    let stats = this.queryStats.get(normalizedQuery);

    if (!stats) {
      stats = {
        query: normalizedQuery,
        executionCount: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        lastExecuted: new Date()
      };
      this.queryStats.set(normalizedQuery, stats);
    }

    stats.executionCount++;
    stats.totalDuration += duration;
    stats.avgDuration = stats.totalDuration / stats.executionCount;
    stats.minDuration = Math.min(stats.minDuration, duration);
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.lastExecuted = new Date();

    // 检测慢查询
    if (duration > this.config.slowQueryThreshold) {
      this.emit('slow:query', { query: normalizedQuery, duration });
    }
  }

  /**
   * 标准化查询（移除参数值）
   */
  private normalizeQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .replace(/=\s*'[^']*'/g, "= '?'")
      .replace(/=\s*\d+/g, '= ?')
      .replace(/IN\s*\([^)]+\)/gi, 'IN (?)')
      .trim();
  }

  /**
   * 执行分析
   */
  private async analyze(): Promise<void> {
    try {
      const suggestions: OptimizationSuggestion[] = [];

      if (this.config.enableQueryAnalysis) {
        suggestions.push(...this.analyzeQueries());
      }

      if (this.config.enableAutoIndex) {
        suggestions.push(...this.analyzeIndexes());
      }

      if (this.config.enableConnectionPoolOptimization) {
        suggestions.push(...this.analyzeConnectionPool());
      }

      if (suggestions.length > 0) {
        this.emit('optimization:suggestions', suggestions);
      }

      this.emit('analysis:completed', {
        timestamp: new Date(),
        suggestionsCount: suggestions.length
      });
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * 分析查询
   */
  private analyzeQueries(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 找出慢查询
    for (const [query, stats] of this.queryStats) {
      if (stats.avgDuration > this.config.slowQueryThreshold) {
        suggestions.push({
          type: 'query',
          description: `慢查询: ${query.substring(0, 100)}...`,
          impact: stats.avgDuration > this.config.slowQueryThreshold * 3 ? 'high' : 'medium',
          recommendation: this.getQueryOptimizationTips(query, stats),
          estimatedImprovement: `预计可提升 ${Math.round((stats.avgDuration - this.config.slowQueryThreshold) / stats.avgDuration * 100)}%`
        });
      }

      // 检测N+1问题
      if (stats.executionCount > 100 && query.includes('WHERE')) {
        suggestions.push({
          type: 'query',
          description: `可能的N+1查询问题: ${query.substring(0, 100)}...`,
          impact: 'high',
          recommendation: '考虑使用JOIN或批量查询来减少查询次数',
          estimatedImprovement: `预计可减少 ${stats.executionCount - 1} 次查询`
        });
      }
    }

    // 检测SELECT *
    for (const [query, _stats] of this.queryStats) {
      if (query.includes('SELECT *')) {
        suggestions.push({
          type: 'query',
          description: `使用SELECT *: ${query.substring(0, 100)}...`,
          impact: 'medium',
          recommendation: '明确指定需要的列，避免传输不必要的数据',
          estimatedImprovement: '预计可减少 20-30% 的数据传输'
        });
      }
    }

    return suggestions;
  }

  /**
   * 获取查询优化建议
   */
  private getQueryOptimizationTips(query: string, stats: QueryStats): string {
    const tips: string[] = [];

    if (query.includes('WHERE')) {
      tips.push('检查WHERE子句的列是否有索引');
    }

    if (query.includes('JOIN')) {
      tips.push('确保JOIN列有适当的索引');
      tips.push('考虑JOIN的顺序和类型');
    }

    if (query.includes('ORDER BY')) {
      tips.push('ORDER BY列应该有索引');
    }

    if (query.includes('LIKE')) {
      tips.push('避免前导通配符 (LIKE "%xxx")');
      tips.push('考虑使用全文搜索索引');
    }

    if (stats.executionCount > 1000) {
      tips.push('高频查询，考虑使用缓存');
    }

    return tips.join('; ');
  }

  /**
   * 分析索引
   */
  private analyzeIndexes(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 基于查询模式生成索引建议
    for (const [query, stats] of this.queryStats) {
      if (stats.avgDuration > this.config.slowQueryThreshold) {
        const indexSuggestion = this.suggestIndex(query, stats);
        
        if (indexSuggestion) {
          this.indexSuggestions.push(indexSuggestion);
          
          suggestions.push({
            type: 'index',
            description: `建议为表 ${indexSuggestion.table} 添加索引`,
            impact: indexSuggestion.priority === 'high' ? 'high' : 'medium',
            recommendation: `CREATE INDEX idx_${indexSuggestion.table}_${indexSuggestion.columns.join('_')} ON ${indexSuggestion.table} (${indexSuggestion.columns.join(', ')})`,
            estimatedImprovement: `预计提升 ${indexSuggestion.estimatedImprovement}%`
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * 建议索引
   */
  private suggestIndex(query: string, stats: QueryStats): IndexSuggestion | null {
    // 简化的索引建议逻辑
    const whereMatch = query.match(/WHERE\s+(\w+)\s*=/i);
    const joinMatch = query.match(/JOIN\s+(\w+)\s+ON\s+\w+\.(\w+)/i);
    const orderByMatch = query.match(/ORDER BY\s+(\w+)/i);

    if (whereMatch) {
      const column = whereMatch[1];
      const table = this.extractTableName(query);
      
      if (table) {
        return {
          table,
          columns: [column],
          reason: '频繁用于WHERE条件',
          estimatedImprovement: Math.min(80, Math.round(stats.avgDuration / this.config.slowQueryThreshold * 50)),
          priority: stats.avgDuration > this.config.slowQueryThreshold * 2 ? 'high' : 'medium'
        };
      }
    }

    if (joinMatch) {
      const table = joinMatch[1];
      const column = joinMatch[2];
      
      return {
        table,
        columns: [column],
        reason: '用于JOIN操作',
        estimatedImprovement: 60,
        priority: 'high'
      };
    }

    if (orderByMatch) {
      const column = orderByMatch[1];
      const table = this.extractTableName(query);
      
      if (table) {
        return {
          table,
          columns: [column],
          reason: '用于ORDER BY排序',
          estimatedImprovement: 40,
          priority: 'medium'
        };
      }
    }

    return null;
  }

  /**
   * 提取表名
   */
  private extractTableName(query: string): string | null {
    const match = query.match(/FROM\s+(\w+)/i);
    return match ? match[1] : null;
  }

  /**
   * 分析连接池
   */
  private analyzeConnectionPool(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const stats = this.connectionPoolStats;

    // 连接池大小不足
    if (stats.waiting > 0) {
      suggestions.push({
        type: 'connection',
        description: '连接池可能不足',
        impact: 'high',
        recommendation: `当前有 ${stats.waiting} 个请求等待连接，建议增加连接池大小`,
        estimatedImprovement: '预计减少 50% 的连接等待时间'
      });
    }

    // 连接池过大
    if (stats.idle > stats.active * 2 && stats.idle > 10) {
      suggestions.push({
        type: 'connection',
        description: '连接池可能过大',
        impact: 'low',
        recommendation: `当前有 ${stats.idle} 个空闲连接，建议减少连接池大小以节省资源`,
        estimatedImprovement: '预计减少 30% 的数据库服务器资源占用'
      });
    }

    // 连接频繁创建和销毁
    if (stats.created > 100 && stats.destroyed > 100) {
      suggestions.push({
        type: 'connection',
        description: '连接频繁创建和销毁',
        impact: 'medium',
        recommendation: '调整连接池配置，增加最小连接数和空闲超时时间',
        estimatedImprovement: '预计减少 40% 的连接创建开销'
      });
    }

    return suggestions;
  }

  /**
   * 优化连接池配置
   */
  optimizeConnectionPool(currentConfig: ConnectionPoolConfig): ConnectionPoolConfig {
    const stats = this.connectionPoolStats;
    const optimized = { ...currentConfig };

    // 根据使用情况调整连接池大小
    if (stats.waiting > 0) {
      optimized.max = Math.min(optimized.max * 1.5, 100);
    }

    if (stats.idle > stats.active * 2) {
      optimized.max = Math.max(optimized.max * 0.8, optimized.min);
    }

    // 调整超时时间
    if (stats.waiting > 10) {
      optimized.acquireTimeoutMillis = Math.min(optimized.acquireTimeoutMillis * 1.2, 30000);
    }

    // 调整空闲超时
    if (stats.idle > optimized.max * 0.8) {
      optimized.idleTimeoutMillis = Math.max(optimized.idleTimeoutMillis * 0.8, 10000);
    }

    return optimized;
  }

  /**
   * 更新连接池统计
   */
  updateConnectionPoolStats(stats: Partial<typeof this.connectionPoolStats>): void {
    Object.assign(this.connectionPoolStats, stats);
  }

  /**
   * 获取查询统计
   */
  getQueryStats(): QueryStats[] {
    return Array.from(this.queryStats.values())
      .sort((a, b) => b.avgDuration - a.avgDuration);
  }

  /**
   * 获取慢查询
   */
  getSlowQueries(limit: number = 10): QueryStats[] {
    return this.getQueryStats()
      .filter(stats => stats.avgDuration > this.config.slowQueryThreshold)
      .slice(0, limit);
  }

  /**
   * 获取索引建议
   */
  getIndexSuggestions(): IndexSuggestion[] {
    return [...this.indexSuggestions]
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  /**
   * 获取连接池统计
   */
  getConnectionPoolStats() {
    return { ...this.connectionPoolStats };
  }

  /**
   * 生成优化报告
   */
  generateReport(): string {
    const lines: string[] = [
      '╔══════════════════════════════════════════════════════════════╗',
      '║          Database Optimization Report                       ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      '=== 查询统计 ===',
      `总查询数: ${this.queryStats.size}`,
      `慢查询数: ${this.getSlowQueries().length}`,
      '',
      '=== Top 5 慢查询 ===',
    ];

    const slowQueries = this.getSlowQueries(5);
    for (const query of slowQueries) {
      lines.push(`Query: ${query.query.substring(0, 80)}...`);
      lines.push(`  执行次数: ${query.executionCount}`);
      lines.push(`  平均耗时: ${query.avgDuration.toFixed(2)}ms`);
      lines.push(`  最大耗时: ${query.maxDuration.toFixed(2)}ms`);
      lines.push('');
    }

    lines.push('=== 索引建议 ===');
    const indexSuggestions = this.getIndexSuggestions();
    if (indexSuggestions.length > 0) {
      for (const suggestion of indexSuggestions) {
        lines.push(`[${suggestion.priority.toUpperCase()}] 表: ${suggestion.table}`);
        lines.push(`  列: ${suggestion.columns.join(', ')}`);
        lines.push(`  原因: ${suggestion.reason}`);
        lines.push(`  预计提升: ${suggestion.estimatedImprovement}%`);
        lines.push('');
      }
    } else {
      lines.push('暂无索引建议');
      lines.push('');
    }

    lines.push('=== 连接池状态 ===');
    const poolStats = this.getConnectionPoolStats();
    lines.push(`活跃连接: ${poolStats.active}`);
    lines.push(`空闲连接: ${poolStats.idle}`);
    lines.push(`等待连接: ${poolStats.waiting}`);
    lines.push(`已创建: ${poolStats.created}`);
    lines.push(`已销毁: ${poolStats.destroyed}`);

    return lines.join('\n');
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.queryStats.clear();
    this.indexSuggestions = [];
    this.connectionPoolStats = {
      active: 0,
      idle: 0,
      waiting: 0,
      created: 0,
      destroyed: 0
    };
  }
}

/**
 * 创建数据库优化器
 */
export function createDatabaseOptimizer(config?: OptimizerConfig): DatabaseOptimizer {
  return new DatabaseOptimizer(config);
}