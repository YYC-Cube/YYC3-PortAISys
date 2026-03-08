/**
 * @file tools/ToolRegistry.ts
 * @description Tool Registry 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { NotFoundError, InternalError } from '../error-handler/ErrorTypes';
import type { AIContext } from '../autonomous-ai-widget/types';
import { logger } from '../utils/logger';

// 工具定义
export interface AITool {
  name: string;
  description: string;
  category?: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  execute: (parameters: any) => Promise<ToolResult>;
}

// 工具执行结果
export interface ToolResult {
  success: boolean;
  data?: any;
  insights?: any;
  error?: string;
}

export class ToolRegistry {
  private tools: Map<string, AITool> = new Map();
  private toolGroups: Map<string, string[]> = new Map();
  
  registerTool(tool: AITool): void {
    this.tools.set(tool.name, tool);
    
    // 自动分组
    if (tool.category) {
      if (!this.toolGroups.has(tool.category)) {
        this.toolGroups.set(tool.category, []);
      }
      this.toolGroups.get(tool.category)!.push(tool.name);
    }
  }
  
  async executeTool(toolName: string, parameters: any): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new NotFoundError('tool', toolName, {
        additionalData: { availableTools: Array.from(this.tools.keys()) }
      });
    }
    
    try {
      const result = await tool.execute(parameters);
      
      // 记录工具使用
      await this.recordToolUsage(toolName, parameters, result);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalError(`Tool execution failed: ${errorMessage}`, {
        additionalData: { toolName, parameters, error: errorMessage }
      }, error instanceof Error ? error : undefined);
    }
  }
  
  getToolsByCategory(category: string): AITool[] {
    const toolNames = this.toolGroups.get(category) || [];
    return toolNames.map(name => this.tools.get(name)!);
  }

  getAvailableTools(): AITool[] {
    return Array.from(this.tools.values());
  }

  async suggestTools(context: AIContext): Promise<AITool[]> {
    // 基于上下文推荐相关工具
    const relevantTools: AITool[] = [];
    
    for (const tool of this.tools.values()) {
      const relevance = await this.calculateToolRelevance(tool, context);
      if (relevance > 0.7) { // 阈值可配置
        relevantTools.push(tool);
      }
    }
    
    const toolRelevancePairs = await Promise.all(
      Array.from(this.tools.values()).map(async (tool) => ({
        tool,
        relevance: await this.calculateToolRelevance(tool, context)
      }))
    );
    
    return toolRelevancePairs
      .filter(({ relevance }) => relevance > 0.7)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
      .map(({ tool }) => tool); // 返回前5个最相关的工具
  }
  
  private async recordToolUsage(toolName: string, parameters: any, result: ToolResult): Promise<void> {
    // 实现工具使用记录逻辑
    logger.info(`Tool used: ${toolName}`, 'ToolRegistry', { parameters, result });
  }
  
  private async calculateToolRelevance(_tool: AITool, _context: AIContext): Promise<number> {
    // 实现工具相关性计算逻辑
    return Math.random(); // 临时实现，需要根据实际上下文优化
  }

  /**
   * 获取工具注册表指标
   */
  getMetrics(): {
    totalTools: number;
    totalCategories: number;
    toolsByCategory: Record<string, number>;
  } {
    const toolsByCategory: Record<string, number> = {};
    for (const [category, tools] of this.toolGroups.entries()) {
      toolsByCategory[category] = tools.length;
    }
    
    return {
      totalTools: this.tools.size,
      totalCategories: this.toolGroups.size,
      toolsByCategory,
    };
  }
}