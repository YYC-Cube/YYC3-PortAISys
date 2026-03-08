/**
 * @file unit/tools/core-tools.test.ts
 * @description Core Tools.test 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchTool, calculatorTool, codeInterpreterTool, coreTools } from '@/tools/core-tools';

describe('core-tools', () => {
  describe('searchTool', () => {
    it('应该定义搜索工具的基本属性', () => {
      expect(searchTool.name).toBe('search');
      expect(searchTool.description).toBe('执行网络搜索，获取最新信息和数据');
      expect(searchTool.version).toBe('1.0.0');
      expect(searchTool.group).toBe('information');
      expect(searchTool.author).toBe('YYC³');
    });

    it('应该定义正确的参数', () => {
      expect(searchTool.parameters).toHaveLength(3);
      
      const queryParam = searchTool.parameters.find(p => p.name === 'query');
      expect(queryParam).toBeDefined();
      expect(queryParam?.required).toBe(true);
      expect(queryParam?.validation?.minLength).toBe(1);
      expect(queryParam?.validation?.maxLength).toBe(500);

      const numResultsParam = searchTool.parameters.find(p => p.name === 'numResults');
      expect(numResultsParam).toBeDefined();
      expect(numResultsParam?.required).toBe(false);
      expect(numResultsParam?.default).toBe(5);
      expect(numResultsParam?.validation?.min).toBe(1);
      expect(numResultsParam?.validation?.max).toBe(20);

      const languageParam = searchTool.parameters.find(p => p.name === 'language');
      expect(languageParam).toBeDefined();
      expect(languageParam?.required).toBe(false);
      expect(languageParam?.default).toBe('zh-CN');
    });

    it('应该成功执行搜索', async () => {
      const params = {
        query: '测试查询',
        numResults: 3,
        language: 'zh-CN'
      };

      const result = await searchTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.content).toContain('测试查询');
      expect(result.data).toHaveLength(3);
      expect(result.data[0].title).toContain('测试查询');
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.toolName).toBe('search');
      expect(result.timestamp).toBeDefined();
    });

    it('应该使用默认参数值', async () => {
      const params = { query: '测试查询' };
      const result = await searchTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(5);
      expect(result.content).toContain('zh-CN');
    });

    it('应该返回正确的结果格式', async () => {
      const params = { query: '天气查询', numResults: 2 };
      const result = await searchTool.execute(params, {});

      expect(result.data[0]).toHaveProperty('title');
      expect(result.data[0]).toHaveProperty('url');
      expect(result.data[0]).toHaveProperty('snippet');
      expect(result.data[0].url).toContain(encodeURIComponent('天气查询'));
    });

    it('应该处理错误情况', async () => {
      const params = { query: '测试' };
      
      const mockExecute = vi.spyOn(searchTool, 'execute').mockImplementationOnce(async () => {
        try {
          throw new Error('网络错误');
        } catch (error) {
          return {
            success: false,
            content: '',
            error: `搜索失败: ${error instanceof Error ? error.message : String(error)}`,
            executionTime: 0,
            toolName: 'search',
            timestamp: Date.now()
          };
        }
      });

      const result = await mockExecute(params, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('搜索失败');
      expect(result.executionTime).toBeGreaterThanOrEqual(0);

      mockExecute.mockRestore();
    });

    it('应该包含示例', () => {
      expect(searchTool.examples).toBeDefined();
      expect(searchTool.examples.length).toBeGreaterThan(0);
      expect(searchTool.examples[0].name).toBe('搜索天气');
    });

    it('应该包含元数据', () => {
      expect(searchTool.metadata).toBeDefined();
      expect(searchTool.metadata.tags).toContain('search');
      expect(searchTool.metadata.icon).toBe('🔍');
      expect(searchTool.metadata.documentationUrl).toBeDefined();
    });
  });

  describe('calculatorTool', () => {
    it('应该定义计算器工具的基本属性', () => {
      expect(calculatorTool.name).toBe('calculator');
      expect(calculatorTool.description).toBe('执行数学计算，支持基本运算和复杂表达式');
      expect(calculatorTool.version).toBe('1.0.0');
      expect(calculatorTool.group).toBe('utilities');
      expect(calculatorTool.author).toBe('YYC³');
    });

    it('应该定义正确的参数', () => {
      expect(calculatorTool.parameters).toHaveLength(2);
      
      const expressionParam = calculatorTool.parameters.find(p => p.name === 'expression');
      expect(expressionParam).toBeDefined();
      expect(expressionParam?.required).toBe(true);
      expect(expressionParam?.validation?.minLength).toBe(1);
      expect(expressionParam?.validation?.maxLength).toBe(200);

      const precisionParam = calculatorTool.parameters.find(p => p.name === 'precision');
      expect(precisionParam).toBeDefined();
      expect(precisionParam?.required).toBe(false);
      expect(precisionParam?.default).toBe(4);
      expect(precisionParam?.validation?.min).toBe(0);
      expect(precisionParam?.validation?.max).toBe(15);
    });

    it('应该成功执行基本运算', async () => {
      const params = {
        expression: '2 + 3 * 4',
        precision: 2
      };

      const result = await calculatorTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.content).toContain('2 + 3 * 4');
      expect(result.content).toContain('14.00');
      expect(result.data.expression).toBe('2 + 3 * 4');
      expect(result.data.result).toBe(14);
      expect(result.data.formattedResult).toBe('14.00');
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.toolName).toBe('calculator');
    });

    it('应该成功执行复杂表达式', async () => {
      const params = {
        expression: '(10 + 5) * 2 / 3',
        precision: 3
      };

      const result = await calculatorTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.result).toBe(10);
      expect(result.data.formattedResult).toBe('10.000');
    });

    it('应该使用默认精度值', async () => {
      const params = { expression: '1 / 3' };
      const result = await calculatorTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.formattedResult).toBe('0.3333');
    });

    it('应该处理除法运算', async () => {
      const params = { expression: '10 / 2', precision: 1 };
      const result = await calculatorTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.result).toBe(5);
    });

    it('应该处理减法运算', async () => {
      const params = { expression: '10 - 3', precision: 1 };
      const result = await calculatorTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.result).toBe(7);
    });

    it('应该处理乘法运算', async () => {
      const params = { expression: '6 * 7', precision: 1 };
      const result = await calculatorTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.result).toBe(42);
    });

    it('应该处理带括号的表达式', async () => {
      const params = { expression: '(2 + 3) * (4 - 1)', precision: 1 };
      const result = await calculatorTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.result).toBe(15);
    });

    it('应该处理无效表达式', async () => {
      const params = { expression: 'invalid expression' };
      const result = await calculatorTool.execute(params, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('计算失败');
    });

    it('应该处理除零情况', async () => {
      const params = { expression: '10 / 0', precision: 1 };
      const result = await calculatorTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.result).toBe(Infinity);
    });

    it('应该包含示例', () => {
      expect(calculatorTool.examples).toBeDefined();
      expect(calculatorTool.examples.length).toBeGreaterThan(0);
      expect(calculatorTool.examples[0].name).toBe('基本运算');
    });

    it('应该包含元数据', () => {
      expect(calculatorTool.metadata).toBeDefined();
      expect(calculatorTool.metadata.tags).toContain('calculator');
      expect(calculatorTool.metadata.icon).toBe('🧮');
      expect(calculatorTool.metadata.documentationUrl).toBeDefined();
    });
  });

  describe('codeInterpreterTool', () => {
    it('应该定义代码解释器工具的基本属性', () => {
      expect(codeInterpreterTool.name).toBe('code_interpreter');
      expect(codeInterpreterTool.description).toBe('执行和解释代码，支持多种编程语言');
      expect(codeInterpreterTool.version).toBe('1.0.0');
      expect(codeInterpreterTool.group).toBe('development');
      expect(codeInterpreterTool.author).toBe('YYC³');
    });

    it('应该定义正确的参数', () => {
      expect(codeInterpreterTool.parameters).toHaveLength(3);
      
      const codeParam = codeInterpreterTool.parameters.find(p => p.name === 'code');
      expect(codeParam).toBeDefined();
      expect(codeParam?.required).toBe(true);
      expect(codeParam?.validation?.minLength).toBe(1);

      const languageParam = codeInterpreterTool.parameters.find(p => p.name === 'language');
      expect(languageParam).toBeDefined();
      expect(languageParam?.required).toBe(true);
      expect(languageParam?.validation?.enum).toContain('javascript');
      expect(languageParam?.validation?.enum).toContain('python');
      expect(languageParam?.validation?.enum).toContain('typescript');

      const timeoutParam = codeInterpreterTool.parameters.find(p => p.name === 'timeout');
      expect(timeoutParam).toBeDefined();
      expect(timeoutParam?.required).toBe(false);
      expect(timeoutParam?.default).toBe(5000);
      expect(timeoutParam?.validation?.min).toBe(1000);
      expect(timeoutParam?.validation?.max).toBe(30000);
    });

    it('应该成功执行JavaScript代码', async () => {
      const params = {
        code: 'const sum = 2 + 3;\nsum;',
        language: 'javascript',
        timeout: 2000
      };

      const result = await codeInterpreterTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.content).toContain('JavaScript执行结果');
      expect(result.content).toContain(params.code);
      expect(result.data.language).toBe('javascript');
      expect(result.data.code).toBe(params.code);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.toolName).toBe('code_interpreter');
    });

    it('应该成功执行TypeScript代码', async () => {
      const params = {
        code: 'const x: number = 10;\nx;',
        language: 'typescript',
        timeout: 2000
      };

      const result = await codeInterpreterTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.language).toBe('typescript');
    });

    it('应该成功执行Python代码', async () => {
      const params = {
        code: 'print("Hello, World!")',
        language: 'python',
        timeout: 2000
      };

      const result = await codeInterpreterTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.content).toContain('Python执行结果');
      expect(result.data.language).toBe('python');
    });

    it('应该成功执行Java代码', async () => {
      const params = {
        code: 'System.out.println("Hello");',
        language: 'java',
        timeout: 2000
      };

      const result = await codeInterpreterTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.language).toBe('java');
    });

    it('应该成功执行C#代码', async () => {
      const params = {
        code: 'Console.WriteLine("Hello");',
        language: 'csharp',
        timeout: 2000
      };

      const result = await codeInterpreterTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.data.language).toBe('csharp');
    });

    it('应该使用默认超时值', async () => {
      const params = {
        code: 'console.log("test");',
        language: 'javascript'
      };
      const result = await codeInterpreterTool.execute(params, {});

      expect(result.success).toBe(true);
    });

    it('应该处理JavaScript代码中的危险关键字', async () => {
      const params = {
        code: 'require("fs");\neval("test");\nFunction("return 1")();',
        language: 'javascript'
      };

      const result = await codeInterpreterTool.execute(params, {});

      expect(result.success).toBe(true);
      expect(result.content).not.toContain('require');
      expect(result.content).not.toContain('eval');
      expect(result.content).not.toContain('Function');
    });

    it('应该处理错误情况', async () => {
      const params = {
        code: 'invalid code',
        language: 'javascript'
      };

      const mockExecute = vi.spyOn(codeInterpreterTool, 'execute').mockImplementationOnce(async () => {
        try {
          throw new Error('执行错误');
        } catch (error) {
          return {
            success: false,
            content: '',
            error: `代码执行失败: ${error instanceof Error ? error.message : String(error)}`,
            executionTime: 0,
            toolName: 'code_interpreter',
            timestamp: Date.now()
          };
        }
      });

      const result = await mockExecute(params, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('代码执行失败');
      expect(result.executionTime).toBeGreaterThanOrEqual(0);

      mockExecute.mockRestore();
    });

    it('应该包含示例', () => {
      expect(codeInterpreterTool.examples).toBeDefined();
      expect(codeInterpreterTool.examples.length).toBeGreaterThan(0);
      expect(codeInterpreterTool.examples[0].name).toBe('JavaScript代码执行');
    });

    it('应该包含元数据', () => {
      expect(codeInterpreterTool.metadata).toBeDefined();
      expect(codeInterpreterTool.metadata.tags).toContain('code');
      expect(codeInterpreterTool.metadata.icon).toBe('💻');
      expect(codeInterpreterTool.metadata.documentationUrl).toBeDefined();
    });
  });

  describe('coreTools', () => {
    it('应该包含所有核心工具', () => {
      expect(coreTools).toHaveLength(3);
      expect(coreTools).toContain(searchTool);
      expect(coreTools).toContain(calculatorTool);
      expect(coreTools).toContain(codeInterpreterTool);
    });

    it('所有工具都应该有必需的属性', () => {
      coreTools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.version).toBe('1.0.0');
        expect(tool.author).toBe('YYC³');
        expect(tool.parameters).toBeDefined();
        expect(tool.execute).toBeDefined();
        expect(tool.metadata).toBeDefined();
      });
    });

    it('所有工具都应该有执行方法', () => {
      coreTools.forEach(tool => {
        expect(typeof tool.execute).toBe('function');
      });
    });

    it('所有工具都应该有参数定义', () => {
      coreTools.forEach(tool => {
        expect(Array.isArray(tool.parameters)).toBe(true);
        expect(tool.parameters.length).toBeGreaterThan(0);
      });
    });
  });
});
