/**
 * @file unit/ui/ToolboxPanel.test.ts
 * @description Toolbox Panel.test 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,ui
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ToolboxPanel } from '@/ui/ToolboxPanel';
import { Tool, ToolCategory, ToolExecutionResult } from '@/ui/types';

describe('ToolboxPanel', () => {
  let toolboxPanel: ToolboxPanel;

  beforeEach(() => {
    toolboxPanel = new ToolboxPanel();
  });

  afterEach(() => {
    toolboxPanel.removeAllListeners();
  });

  describe('工具注册', () => {
    it('应该成功注册工具', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        execute: async () => ({ success: true, result: 'Test result' })
      };

      toolboxPanel.registerTool(tool);
      const registeredTool = toolboxPanel.getTool('test-tool');
      expect(registeredTool).toBeDefined();
      expect(registeredTool?.id).toBe('test-tool');
    });

    it('应该触发工具注册事件', () => {
      const spy = vi.fn();
      toolboxPanel.on('tool:registered', spy);

      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        execute: async () => ({ success: true, result: 'Test result' })
      };

      toolboxPanel.registerTool(tool);
      expect(spy).toHaveBeenCalledWith(tool);
    });

    it('应该拒绝重复的工具ID', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        execute: async () => ({ success: true, result: 'Test result' })
      };

      toolboxPanel.registerTool(tool);
      expect(() => toolboxPanel.registerTool(tool)).toThrow();
    });

    it('应该自动创建不存在的分类', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'new-category',
        icon: '🧪',
        execute: async () => ({ success: true, result: 'Test result' })
      };

      toolboxPanel.registerTool(tool);
      const category = toolboxPanel.getCategory('new-category');
      expect(category).toBeDefined();
    });
  });

  describe('工具注销', () => {
    beforeEach(() => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        execute: async () => ({ success: true, result: 'Test result' })
      };
      toolboxPanel.registerTool(tool);
    });

    it('应该成功注销工具', () => {
      toolboxPanel.unregisterTool('test-tool');
      const tool = toolboxPanel.getTool('test-tool');
      expect(tool).toBeUndefined();
    });

    it('应该触发工具注销事件', () => {
      const spy = vi.fn();
      toolboxPanel.on('tool:unregistered', spy);
      toolboxPanel.unregisterTool('test-tool');
      expect(spy).toHaveBeenCalledWith('test-tool');
    });

    it('应该从分类中移除工具', () => {
      toolboxPanel.unregisterTool('test-tool');
      const category = toolboxPanel.getCategory('ai');
      expect(category?.tools.find(t => t.id === 'test-tool')).toBeUndefined();
    });

    it('应该拒绝注销不存在的工具', () => {
      expect(() => toolboxPanel.unregisterTool('non-existent')).toThrow();
    });
  });

  describe('工具执行', () => {
    beforeEach(() => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        enabled: true,
        execute: async (params) => ({
          success: true,
          result: `Executed with params: ${JSON.stringify(params)}`
        })
      };
      toolboxPanel.registerTool(tool);
    });

    it('应该成功执行工具', async () => {
      const result = await toolboxPanel.executeTool('test-tool', { param1: 'value1' });
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it('应该传递参数给工具', async () => {
      const params = { param1: 'value1', param2: 42 };
      const result = await toolboxPanel.executeTool('test-tool', params);
      expect(result.result).toContain(JSON.stringify(params));
    });

    it('应该触发工具执行事件', async () => {
      const spy = vi.fn();
      toolboxPanel.on('tool:executed', spy);
      await toolboxPanel.executeTool('test-tool', {});
      expect(spy).toHaveBeenCalled();
    });

    it('应该处理工具执行失败', async () => {
      const errorTool: Tool = {
        id: 'error-tool',
        name: 'Error Tool',
        description: 'A tool that throws errors',
        category: 'ai',
        icon: '❌',
        enabled: true,
        execute: async () => {
          throw new Error('Tool execution failed');
        }
      };
      toolboxPanel.registerTool(errorTool);

      const result = await toolboxPanel.executeTool('error-tool', {});
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该拒绝执行不存在的工具', async () => {
      const result = await toolboxPanel.executeTool('non-existent', {});
      expect(result.success).toBe(false);
    });
  });

  describe('分类管理', () => {
    it('应该成功注册分类', () => {
      const category: ToolCategory = {
        id: 'test-category',
        name: 'Test Category',
        description: 'A test category',
        icon: '📁',
        tools: []
      };
      toolboxPanel.registerCategory(category);
      const registeredCategory = toolboxPanel.getCategory('test-category');
      expect(registeredCategory).toBeDefined();
      expect(registeredCategory?.id).toBe('test-category');
    });

    it('应该获取所有分类', () => {
      const categories = toolboxPanel.getAllCategories();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
    });

    it('应该获取分类中的工具', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        execute: async () => ({ success: true, result: 'Test result' })
      };
      toolboxPanel.registerTool(tool);
      const categoryTools = toolboxPanel.getToolsByCategory('ai');
      expect(categoryTools).toHaveLength(1);
      expect(categoryTools[0].id).toBe('test-tool');
    });

    it('应该删除分类', () => {
      toolboxPanel.registerCategory({
        id: 'test-category',
        name: 'Test Category',
        description: 'A test category',
        icon: '📁',
        tools: []
      });
      toolboxPanel.deleteCategory('test-category');
      const category = toolboxPanel.getCategory('test-category');
      expect(category).toBeUndefined();
    });
  });

  describe('工具搜索', () => {
    beforeEach(() => {
      const tools: Tool[] = [
        {
          id: 'tool-1',
          name: 'Calculator',
          description: 'Perform mathematical calculations',
          category: 'productivity',
          icon: '🧮',
          execute: async () => ({ success: true, result: 'Calculation result' })
        },
        {
          id: 'tool-2',
          name: 'Data Analyzer',
          description: 'Analyze data patterns',
          category: 'data',
          icon: '📊',
          execute: async () => ({ success: true, result: 'Analysis result' })
        },
        {
          id: 'tool-3',
          name: 'AI Assistant',
          description: 'AI-powered assistant',
          category: 'ai',
          icon: '🤖',
          execute: async () => ({ success: true, result: 'AI result' })
        }
      ];
      tools.forEach(tool => toolboxPanel.registerTool(tool));
    });

    it('应该按名称搜索工具', () => {
      const results = toolboxPanel.searchTools('Calculator');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('tool-1');
    });

    it('应该按描述搜索工具', () => {
      const results = toolboxPanel.searchTools('mathematical');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('tool-1');
    });

    it('应该支持大小写不敏感搜索', () => {
      const results = toolboxPanel.searchTools('CALCULATOR');
      expect(results).toHaveLength(1);
    });

    it('应该支持部分匹配', () => {
      const results = toolboxPanel.searchTools('calc');
      expect(results).toHaveLength(1);
    });

    it('应该返回空数组如果没有匹配', () => {
      const results = toolboxPanel.searchTools('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('工具状态', () => {
    beforeEach(() => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        execute: async () => ({ success: true, result: 'Test result' })
      };
      toolboxPanel.registerTool(tool);
    });

    it('应该设置工具状态', () => {
      toolboxPanel.setToolStatus('test-tool', 'disabled');
      const tool = toolboxPanel.getTool('test-tool');
      expect(tool?.status).toBe('disabled');
    });

    it('应该获取工具状态', () => {
      toolboxPanel.setToolStatus('test-tool', 'disabled');
      const status = toolboxPanel.getToolStatus('test-tool');
      expect(status).toBe('disabled');
    });

    it('应该禁用工具', () => {
      toolboxPanel.disableTool('test-tool');
      const status = toolboxPanel.getToolStatus('test-tool');
      expect(status).toBe('disabled');
    });

    it('应该启用工具', () => {
      toolboxPanel.disableTool('test-tool');
      toolboxPanel.enableTool('test-tool');
      const status = toolboxPanel.getToolStatus('test-tool');
      expect(status).toBe('enabled');
    });

    it('应该拒绝执行已禁用的工具', async () => {
      toolboxPanel.disableTool('test-tool');
      const result = await toolboxPanel.executeTool('test-tool', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('disabled');
    });
  });

  describe('工具统计', () => {
    beforeEach(() => {
      const tools: Tool[] = [
        {
          id: 'tool-1',
          name: 'Tool 1',
          description: 'Tool 1',
          category: 'ai',
          icon: '🧪',
          enabled: true,
          execute: async () => ({ success: true, result: 'Result 1' })
        },
        {
          id: 'tool-2',
          name: 'Tool 2',
          description: 'Tool 2',
          category: 'data',
          icon: '📊',
          enabled: true,
          execute: async () => ({ success: true, result: 'Result 2' })
        }
      ];
      tools.forEach(tool => toolboxPanel.registerTool(tool));
    });

    it('应该获取工具总数', () => {
      const count = toolboxPanel.getToolCount();
      expect(count).toBe(2);
    });

    it('应该获取分类工具数', () => {
      const count = toolboxPanel.getToolCountByCategory('ai');
      expect(count).toBe(1);
    });

    it('应该获取工具执行统计', async () => {
      await toolboxPanel.executeTool('tool-1', {});
      await toolboxPanel.executeTool('tool-1', {});
      await toolboxPanel.executeTool('tool-2', {});

      const stats = toolboxPanel.getToolStats();
      expect(stats.totalExecutions).toBe(3);
      expect(stats.toolExecutions['tool-1']).toBe(2);
      expect(stats.toolExecutions['tool-2']).toBe(1);
    });
  });

  describe('可见性管理', () => {
    it('应该显示工具箱', () => {
      toolboxPanel.show();
      expect(toolboxPanel.isVisible()).toBe(true);
    });

    it('应该隐藏工具箱', () => {
      toolboxPanel.hide();
      expect(toolboxPanel.isVisible()).toBe(false);
    });

    it('应该切换可见性', () => {
      toolboxPanel.toggle();
      expect(toolboxPanel.isVisible()).toBe(false);
      toolboxPanel.toggle();
      expect(toolboxPanel.isVisible()).toBe(true);
    });

    it('应该触发可见性变更事件', () => {
      const spy = vi.fn();
      toolboxPanel.on('visibility:changed', spy);
      toolboxPanel.hide();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('工具排序', () => {
    beforeEach(() => {
      const tools: Tool[] = [
        {
          id: 'tool-1',
          name: 'Tool A',
          description: 'Tool A',
          category: 'ai',
          icon: '🧪',
          enabled: true,
          execute: async () => ({ success: true, result: 'Result' })
        },
        {
          id: 'tool-2',
          name: 'Tool B',
          description: 'Tool B',
          category: 'ai',
          icon: '📊',
          enabled: true,
          execute: async () => ({ success: true, result: 'Result' })
        },
        {
          id: 'tool-3',
          name: 'Tool C',
          description: 'Tool C',
          category: 'ai',
          icon: '🤖',
          enabled: true,
          execute: async () => ({ success: true, result: 'Result' })
        }
      ];
      tools.forEach(tool => toolboxPanel.registerTool(tool));
    });

    it('应该按名称排序工具', () => {
      toolboxPanel.sortTools('name', 'asc');
      const tools = toolboxPanel.getAllTools();
      expect(tools[0].name).toBe('Tool A');
      expect(tools[1].name).toBe('Tool B');
      expect(tools[2].name).toBe('Tool C');
    });

    it('应该按使用频率排序工具', async () => {
      await toolboxPanel.executeTool('tool-2', {});
      await toolboxPanel.executeTool('tool-2', {});
      await toolboxPanel.executeTool('tool-1', {});

      toolboxPanel.sortTools('usage', 'desc');
      const tools = toolboxPanel.getAllTools();
      expect(tools[0].id).toBe('tool-2');
      expect(tools[1].id).toBe('tool-1');
    });
  });

  describe('工具验证', () => {
    it('应该验证工具参数', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string' }
          },
          required: ['text']
        },
        execute: async () => ({ success: true, result: 'Result' })
      };
      toolboxPanel.registerTool(tool);

      const validParams = { text: 'Hello' };
      const invalidParams = {};

      expect(toolboxPanel.validateToolParameters('test-tool', validParams)).toBe(true);
      expect(toolboxPanel.validateToolParameters('test-tool', invalidParams)).toBe(false);
    });

    it('应该获取工具参数定义', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string' }
          }
        },
        execute: async () => ({ success: true, result: 'Result' })
      };
      toolboxPanel.registerTool(tool);

      const params = toolboxPanel.getToolParameters('test-tool');
      expect(params).toBeDefined();
      expect(params?.properties.text).toBeDefined();
    });
  });

  describe('批量操作', () => {
    beforeEach(() => {
      const tools: Tool[] = [
        {
          id: 'tool-1',
          name: 'Tool 1',
          description: 'Tool 1',
          category: 'ai',
          icon: '🧪',
          execute: async () => ({ success: true, result: 'Result 1' })
        },
        {
          id: 'tool-2',
          name: 'Tool 2',
          description: 'Tool 2',
          category: 'data',
          icon: '📊',
          execute: async () => ({ success: true, result: 'Result 2' })
        }
      ];
      tools.forEach(tool => toolboxPanel.registerTool(tool));
    });

    it('应该批量注册工具', () => {
      const newTools: Tool[] = [
        {
          id: 'tool-3',
          name: 'Tool 3',
          description: 'Tool 3',
          category: 'ai',
          icon: '🤖',
          execute: async () => ({ success: true, result: 'Result 3' })
        },
        {
          id: 'tool-4',
          name: 'Tool 4',
          description: 'Tool 4',
          category: 'data',
          icon: '📈',
          execute: async () => ({ success: true, result: 'Result 4' })
        }
      ];
      toolboxPanel.registerTools(newTools);
      expect(toolboxPanel.getToolCount()).toBe(4);
    });

    it('应该批量执行工具', async () => {
      const results = await toolboxPanel.executeTools([
        { toolId: 'tool-1', params: {} },
        { toolId: 'tool-2', params: {} }
      ]);
      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('事件系统', () => {
    it('应该支持多个事件监听器', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      toolboxPanel.on('tool:registered', spy1);
      toolboxPanel.on('tool:registered', spy2);

      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        execute: async () => ({ success: true, result: 'Result' })
      };
      toolboxPanel.registerTool(tool);

      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it('应该支持移除事件监听器', () => {
      const spy = vi.fn();
      toolboxPanel.on('tool:registered', spy);
      toolboxPanel.off('tool:registered', spy);

      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'ai',
        icon: '🧪',
        execute: async () => ({ success: true, result: 'Result' })
      };
      toolboxPanel.registerTool(tool);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
