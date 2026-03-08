# YYC³ PortAISys - UI/UX 提示词模板集合

> 基于「五高五标五化」框架的UI/UX开发提示词模板
>
> 适用于：Figma设计转代码、组件库设计、测试用例生成等场景

---

## 📋 目录

1. [UI/UX功能模块设计提示词](#uiux功能模块设计提示词)
2. [组件库设计规范提示词](#组件库设计规范提示词)
3. [单元测试用例生成提示词](#单元测试用例生成提示词)
4. [集成测试生成提示词](#集成测试生成提示词)
5. [响应式设计提示词](#响应式设计提示词)
6. [无障碍设计提示词](#无障碍设计提示词)
7. [性能优化提示词](#性能优化提示词)
8. [主题系统设计提示词](#主题系统设计提示词)

---

## UI/UX功能模块设计提示词

### 基础功能模块设计提示词

```
你是一位资深的UI/UX设计师和前端架构师，负责为YYC³ PortAISys项目设计{MODULE_NAME}功能模块。

## 项目背景
YYC³（YanYuCloudCube）PortAISys是一个基于云原生架构的便携式智能AI系统，提供高性能、高可靠性、高安全性、高扩展性和高可维护性的AI解决方案。

## 设计要求
基于「五高五标五化」框架：
- 五高：高可用性、高性能、高安全性、高扩展性、高可维护性
- 五标：标准化、规范化、自动化、智能化、可视化
- 五化：流程化、文档化、工具化、数字化、生态化

## 功能模块要求
请为{MODULE_NAME}功能模块提供完整的设计方案，包括：

### 1. 功能需求分析
- 核心功能描述
- 用户场景分析
- 功能优先级划分
- 交互流程设计

### 2. UI组件设计
- 组件结构层次
- 组件接口定义（TypeScript）
- 组件状态管理方案
- 组件通信机制

### 3. 用户体验设计
- 用户操作流程
- 交互反馈机制
- 错误处理方案
- 加载状态设计

### 4. 技术实现方案
- 技术栈选择（React/Vue/Angular等）
- 状态管理方案（Zustand/Redux/Pinia等）
- 样式方案（Tailwind CSS/SASS/Styled Components等）
- 动画方案（Framer Motion/GSAP等）

### 5. 性能优化策略
- 渲染性能优化
- 资源加载优化
- 代码分割策略
- 缓存策略

### 6. 无障碍设计
- 键盘导航支持
- 屏幕阅读器支持
- ARIA标签设计
- 对比度标准

### 7. 响应式设计
- 断点策略
- 布局适配方案
- 字体缩放方案
- 触摸交互优化

### 8. 测试策略
- 单元测试覆盖
- 集成测试场景
- E2E测试用例
- 性能测试指标

## 输出格式
请提供以下格式的输出：

```typescript
// 1. 类型定义
interface {MODULE_NAME}Props {
  // 组件属性定义
}

// 2. 组件实现
export const {MODULE_NAME}: React.FC<{MODULE_NAME}Props> = ({ ... }) => {
  // 组件实现
}

// 3. 样式定义
const styles = {
  // 样式定义
}

// 4. 测试用例
describe('{MODULE_NAME}', () => {
  // 测试用例
})
```

## 设计原则

1. 遵循YYC³代码标头规范
2. 使用TypeScript进行类型安全
3. 遵循组件化设计原则
4. 确保可访问性（WCAG 2.1 AA级）
5. 优化性能（首屏加载<2s，交互响应<100ms）
6. 支持主题切换
7. 支持国际化（i18n）

## 参考资源

- Figma设计文件：{FIGMA_LINK}
- YYC³组件库规范：/docs/YYC3-PortAISys-组件库设计规范.md
- YYC³ UI/UX架构：/docs/YYC3-PortAISys-UI-UX-功能模块架构.md

```

### 智能AI助手模块设计提示词

```

你是一位资深的AI交互设计师，负责为YYC³ PortAISys设计智能AI助手功能模块。

## 模块概述

智能AI助手是YYC³ PortAISys的核心功能模块，提供自然语言交互、智能对话、任务执行等能力。

## 设计要求

### 1. 对话界面设计

- 聊天消息展示组件
- 输入框组件
- 消息气泡样式
- 对话历史管理

### 2. AI响应设计

- 流式响应展示
- 思考过程可视化
- 代码块语法高亮
- 多媒体内容支持

### 3. 交互功能设计

- 消息发送/接收
- 对话上下文管理
- 多轮对话支持
- 快捷指令支持

### 4. 性能优化

- 消息虚拟滚动
- 图片懒加载
- 响应缓存
- WebSocket连接管理

### 5. 用户体验

- 打字机效果
- 加载动画
- 错误提示
- 空状态设计

## 技术要求

- 使用React + TypeScript
- 状态管理：Zustand
- 样式：Tailwind CSS
- 动画：Framer Motion
- Markdown渲染：react-markdown
- 代码高亮：prism-react-renderer

## 输出要求

请提供完整的组件实现代码、类型定义、样式定义和测试用例。

```

---

## 组件库设计规范提示词

### 基础组件设计提示词

```

你是一位资深的组件库设计师，负责为YYC³ PortAISys设计{COMPONENT_NAME}组件。

## 组件概述

{COMPONENT_NAME}是一个{COMPONENT_DESCRIPTION}组件，用于{COMPONENT_PURPOSE}。

## 设计要求

### 1. 组件API设计

```typescript
interface {COMPONENT_NAME}Props {
  // 必需属性
  {REQUIRED_PROPS}
  
  // 可选属性
  {OPTIONAL_PROPS}
  
  // 事件处理
  {EVENT_HANDLERS}
  
  // 样式属性
  {STYLE_PROPS}
}
```

### 2. 变体设计

- 默认变体（default）
- 主要变体（primary）
- 次要变体（secondary）
- 成功变体（success）
- 警告变体（warning）
- 危险变体（danger）

### 3. 尺寸规范

- 超小尺寸（xs）
- 小尺寸（sm）
- 中等尺寸（md）
- 大尺寸（lg）
- 超大尺寸（xl）

### 4. 状态设计

- 默认状态
- 悬停状态（hover）
- 激活状态（active）
- 禁用状态（disabled）
- 加载状态（loading）
- 错误状态（error）

### 5. 无障碍设计

- 键盘导航支持
- ARIA标签
- 焦点管理
- 屏幕阅读器支持

### 6. 响应式设计

- 移动端适配
- 平板端适配
- 桌面端适配
- 触摸交互优化

### 7. 主题支持

- 亮色主题
- 暗色主题
- 自定义主题
- CSS变量支持

### 8. 性能优化

- React.memo优化
- 懒加载支持
- 虚拟滚动（如需要）
- 防抖/节流（如需要）

## 实现要求

### 1. 代码结构

```typescript
/**
 * @file components/ui/{COMPONENT_NAME}.tsx
 * @description {COMPONENT_DESCRIPTION}
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-08
 * @updated 2026-03-08
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags ui,components,{COMPONENT_NAME}
 */

import React from 'react';
import { cn } from '@/utils/cn';

export interface {COMPONENT_NAME}Props {
  // 属性定义
}

export const {COMPONENT_NAME}: React.FC<{COMPONENT_NAME}Props> = ({
  // 属性解构
}) => {
  // 组件实现
  return (
    // JSX
  );
};
```

### 2. 样式规范

- 使用Tailwind CSS
- 使用cn工具函数合并类名
- 使用CSS变量定义主题
- 支持自定义className和style

### 3. 测试要求

- 单元测试覆盖率>80%
- 包含渲染测试
- 包含交互测试
- 包含无障碍测试
- 包含边界情况测试

## 输出格式

请提供：

1. 完整的TypeScript组件代码
2. 组件使用示例
3. 完整的测试用例
4. Storybook故事（如适用）
5. 组件文档

## 设计原则

1. 遵循YYC³代码规范
2. 遵循WCAG 2.1 AA级无障碍标准
3. 遵循响应式设计原则
4. 遵循性能优化最佳实践
5. 保持API简洁直观
6. 提供良好的默认值
7. 支持高度自定义

```

### 复杂组件设计提示词

```

你是一位资深的组件库设计师，负责为YYC³ PortAISys设计{COMPLEX_COMPONENT_NAME}复杂组件。

## 组件概述

{COMPLEX_COMPONENT_NAME}是一个{COMPONENT_DESCRIPTION}复杂组件，包含多个子组件和复杂的状态管理。

## 设计要求

### 1. 组件架构

- 主组件设计
- 子组件拆分
- 组件通信机制
- 状态管理方案

### 2. 子组件设计

```typescript
// 子组件1
interface SubComponent1Props { ... }
export const SubComponent1: React.FC<SubComponent1Props> = ({ ... }) => { ... }

// 子组件2
interface SubComponent2Props { ... }
export const SubComponent2: React.FC<SubComponent2Props> = ({ ... }) => { ... }

// 子组件3
interface SubComponent3Props { ... }
export const SubComponent3: React.FC<SubComponent3Props> = ({ ... }) => { ... }
```

### 3. 状态管理

- 本地状态（useState）
- 全局状态（Zustand）
- 表单状态（React Hook Form）
- 服务端状态（React Query）

### 4. 事件处理

- 事件冒泡控制
- 事件委托
- 防抖/节流
- 自定义事件

### 5. 性能优化

- React.memo
- useMemo
- useCallback
- 虚拟滚动
- 代码分割

### 6. 动画效果

- 过渡动画
- 关键帧动画
- 手势动画
- 滚动动画

## 实现要求

### 1. 文件结构

```
components/
  {COMPLEX_COMPONENT_NAME}/
    index.ts
    {COMPLEX_COMPONENT_NAME}.tsx
    {COMPLEX_COMPONENT_NAME}.types.ts
    {COMPLEX_COMPONENT_NAME}.styles.ts
    SubComponent1/
      index.ts
      SubComponent1.tsx
    SubComponent2/
      index.ts
      SubComponent2.tsx
    SubComponent3/
      index.ts
      SubComponent3.tsx
    __tests__/
      {COMPLEX_COMPONENT_NAME}.test.tsx
      SubComponent1.test.tsx
      SubComponent2.test.tsx
      SubComponent3.test.tsx
```

### 2. 类型定义

```typescript
// {COMPLEX_COMPONENT_NAME}.types.ts
export interface {COMPLEX_COMPONENT_NAME}Props {
  // 主组件属性
}

export interface {COMPLEX_COMPONENT_NAME}State {
  // 组件状态
}

export interface SubComponent1Props {
  // 子组件1属性
}

export interface SubComponent2Props {
  // 子组件2属性
}

export interface SubComponent3Props {
  // 子组件3属性
}
```

### 3. 样式定义

```typescript
// {COMPLEX_COMPONENT_NAME}.styles.ts
export const {COMPLEX_COMPONENT_NAME}Styles = {
  container: '...',
  header: '...',
  body: '...',
  footer: '...',
  // ...
} as const;
```

## 输出格式

请提供：

1. 完整的组件代码（包括所有子组件）
2. 类型定义文件
3. 样式定义文件
4. 导出文件（index.ts）
5. 完整的测试用例
6. 使用示例
7. 组件文档

## 设计原则

1. 组件职责单一
2. 高内聚低耦合
3. 可复用性高
4. 易于测试
5. 性能优化
6. 无障碍支持
7. 响应式设计

```

---

## 单元测试用例生成提示词

### 基础组件测试提示词

```

你是一位资深的测试工程师，负责为YYC³ PortAISys的{COMPONENT_NAME}组件编写单元测试用例。

## 组件信息

- 组件名称：{COMPONENT_NAME}
- 组件描述：{COMPONENT_DESCRIPTION}
- 组件类型：{COMPONENT_TYPE}

## 测试框架

- 测试框架：Vitest
- 测试库：@testing-library/react
- 断言库：@testing-library/jest-dom
- Mock库：vitest

## 测试要求

### 1. 测试覆盖范围

- 渲染测试（Rendering）
- 属性测试（Props）
- 变体测试（Variants）
- 尺寸测试（Sizes）
- 状态测试（States）
- 交互测试（Interactions）
- 无障碍测试（Accessibility）
- 边界情况测试（Edge Cases）
- 性能测试（Performance）

### 2. 测试用例模板

```typescript
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { {COMPONENT_NAME} } from '@/components/ui/{COMPONENT_NAME}';

describe('{COMPONENT_NAME} Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<{COMPONENT_NAME} />);
      // 断言
    });

    it('should render with custom props', () => {
      render(<{COMPONENT_NAME} {...props} />);
      // 断言
    });
  });

  describe('Props', () => {
    it('should handle required props', () => {
      render(<{COMPONENT_NAME} {...requiredProps} />);
      // 断言
    });

    it('should handle optional props', () => {
      render(<{COMPONENT_NAME} {...optionalProps} />);
      // 断言
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<{COMPONENT_NAME} variant="default" />);
      // 断言
    });

    it('should render primary variant', () => {
      render(<{COMPONENT_NAME} variant="primary" />);
      // 断言
    });
  });

  describe('Sizes', () => {
    it('should render sm size', () => {
      render(<{COMPONENT_NAME} size="sm" />);
      // 断言
    });

    it('should render md size', () => {
      render(<{COMPONENT_NAME} size="md" />);
      // 断言
    });
  });

  describe('States', () => {
    it('should render disabled state', () => {
      render(<{COMPONENT_NAME} disabled />);
      // 断言
    });

    it('should render loading state', () => {
      render(<{COMPONENT_NAME} loading />);
      // 断言
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<{COMPONENT_NAME} onClick={handleClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<{COMPONENT_NAME} onClick={handleClick} disabled />);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<{COMPONENT_NAME} aria-label="Label" />);
      expect(screen.getByLabelText('Label')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<{COMPONENT_NAME} />);
      const element = screen.getByRole('button');
      element.focus();
      expect(element).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(<{COMPONENT_NAME} />);
      // 断言
    });

    it('should handle null/undefined props', () => {
      render(<{COMPONENT_NAME} prop={null} />);
      // 断言
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderCount = vi.fn();
      const TestComponent = () => {
        renderCount();
        return <{COMPONENT_NAME} />;
      };
      const { rerender } = render(<TestComponent />);
      rerender(<TestComponent />);
      expect(renderCount).toHaveBeenCalledTimes(2);
    });
  });
});
```

### 3. 测试覆盖率要求

- 语句覆盖率：>90%
- 分支覆盖率：>85%
- 函数覆盖率：>95%
- 行覆盖率：>90%

### 4. 测试最佳实践

- 使用describe组织测试套件
- 使用it描述单个测试用例
- 使用beforeEach/afterEach设置/清理
- 使用screen查询元素
- 使用fireEvent模拟用户交互
- 使用waitFor处理异步操作
- 避免测试实现细节
- 测试用户行为而非内部状态

## 输出格式

请提供：

1. 完整的测试文件代码
2. 测试覆盖率报告
3. 测试用例说明文档

## 测试原则

1. 测试应该快速执行
2. 测试应该独立运行
3. 测试应该可重复
4. 测试应该易于理解
5. 测试应该覆盖关键路径
6. 测试应该包含边界情况
7. 测试应该验证无障碍性

```

### 复杂组件测试提示词

```

你是一位资深的测试工程师，负责为YYC³ PortAISys的{COMPLEX_COMPONENT_NAME}复杂组件编写单元测试用例。

## 组件信息

- 组件名称：{COMPLEX_COMPONENT_NAME}
- 组件描述：{COMPONENT_DESCRIPTION}
- 子组件：{SUB_COMPONENTS}

## 测试要求

### 1. 测试结构

```
__tests__/
  {COMPLEX_COMPONENT_NAME}.test.tsx
  SubComponent1.test.tsx
  SubComponent2.test.tsx
  SubComponent3.test.tsx
  integration.test.tsx
```

### 2. 主组件测试

- 渲染测试
- 属性测试
- 状态管理测试
- 子组件集成测试
- 事件处理测试
- 生命周期测试

### 3. 子组件测试

- 每个子组件独立测试
- 子组件属性测试
- 子组件交互测试
- 子组件状态测试

### 4. 集成测试

- 组件间通信测试
- 状态同步测试
- 事件冒泡测试
- 性能测试

### 5. Mock策略

- Mock外部依赖
- Mock API调用
- Mock子组件（如需要）
- Mock Hooks（如需要）

## 输出格式

请提供：

1. 主组件测试文件
2. 所有子组件测试文件
3. 集成测试文件
4. Mock工具函数
5. 测试辅助函数
6. 测试覆盖率报告

## 测试原则

1. 测试应该覆盖所有子组件
2. 测试应该验证组件集成
3. 测试应该模拟真实用户场景
4. 测试应该验证性能指标
5. 测试应该易于维护

```

---

## 集成测试生成提示词

### 功能模块集成测试提示词

```

你是一位资深的测试工程师，负责为YYC³ PortAISys的{MODULE_NAME}功能模块编写集成测试用例。

## 模块信息

- 模块名称：{MODULE_NAME}
- 模块描述：{MODULE_DESCRIPTION}
- 包含组件：{COMPONENTS}
- 依赖服务：{SERVICES}

## 测试框架

- 测试框架：Vitest
- 测试库：@testing-library/react
- E2E测试：Playwright（如需要）
- Mock服务：MSW（Mock Service Worker）

## 测试要求

### 1. 测试场景

- 用户流程测试
- 组件交互测试
- 状态管理测试
- API集成测试
- 错误处理测试
- 性能测试

### 2. 测试用例模板

```typescript
import React from 'react';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { {MODULE_NAME} } from '@/modules/{MODULE_NAME}';

// Mock服务器
const server = setupServer(
  // Mock API端点
  rest.post('/api/endpoint', (req, res, ctx) => {
    return res(ctx.json({ data: 'mocked response' }));
  })
);

describe('{MODULE_NAME} Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('User Flow', () => {
    it('should complete the user flow successfully', async () => {
      render(<{MODULE_NAME} />);
      
      // 步骤1
      fireEvent.click(screen.getByText('Step 1'));
      await waitFor(() => {
        expect(screen.getByText('Step 1 completed')).toBeInTheDocument();
      });
      
      // 步骤2
      fireEvent.click(screen.getByText('Step 2'));
      await waitFor(() => {
        expect(screen.getByText('Step 2 completed')).toBeInTheDocument();
      });
      
      // 步骤3
      fireEvent.click(screen.getByText('Step 3'));
      await waitFor(() => {
        expect(screen.getByText('Flow completed')).toBeInTheDocument();
      });
    });
  });

  describe('Component Interaction', () => {
    it('should handle component interaction correctly', async () => {
      render(<{MODULE_NAME} />);
      
      // 组件1交互
      fireEvent.change(screen.getByLabelText('Input'), { target: { value: 'test' } });
      
      // 验证组件2响应
      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('should manage state correctly across components', async () => {
      render(<{MODULE_NAME} />);
      
      // 更新状态
      fireEvent.click(screen.getByText('Update State'));
      
      // 验证状态同步
      await waitFor(() => {
        expect(screen.getAllByText('Updated')).toHaveLength(3);
      });
    });
  });

  describe('API Integration', () => {
    it('should handle API requests correctly', async () => {
      render(<{MODULE_NAME} />);
      
      // 触发API请求
      fireEvent.click(screen.getByText('Load Data'));
      
      // 验证API响应
      await waitFor(() => {
        expect(screen.getByText('mocked response')).toBeInTheDocument();
      });
    });

    it('should handle API errors correctly', async () => {
      // Mock错误响应
      server.use(
        rest.post('/api/endpoint', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );
      
      render(<{MODULE_NAME} />);
      
      // 触发API请求
      fireEvent.click(screen.getByText('Load Data'));
      
      // 验证错误处理
      await waitFor(() => {
        expect(screen.getByText('Error loading data')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      // Mock网络错误
      server.use(
        rest.post('/api/endpoint', (req, res) => {
          return res.networkError('Failed to connect');
        })
      );
      
      render(<{MODULE_NAME} />);
      
      // 触发请求
      fireEvent.click(screen.getByText('Load Data'));
      
      // 验证错误处理
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle validation errors', async () => {
      render(<{MODULE_NAME} />);
      
      // 提交无效数据
      fireEvent.click(screen.getByText('Submit'));
      
      // 验证验证错误
      expect(screen.getByText('Invalid input')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render within performance budget', () => {
      const startTime = performance.now();
      render(<{MODULE_NAME} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle large datasets efficiently', async () => {
      // Mock大数据集
      server.use(
        rest.get('/api/data', (req, res, ctx) => {
          const largeData = Array(10000).fill({ id: 1, name: 'Item' });
          return res(ctx.json(largeData));
        })
      );
      
      render(<{MODULE_NAME} />);
      
      fireEvent.click(screen.getByText('Load Data'));
      
      await waitFor(() => {
        expect(screen.getByText('Data loaded')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });
});
```

### 3. 测试覆盖率要求

- 集成测试覆盖率：>80%
- 关键路径覆盖率：100%
- 错误场景覆盖率：>70%

### 4. 性能测试指标

- 首次渲染：<100ms
- 交互响应：<50ms
- 大数据集处理：<5s
- 内存泄漏：无

## 输出格式

请提供：

1. 完整的集成测试文件
2. Mock服务器配置
3. 测试辅助函数
4. 测试数据生成器
5. 测试覆盖率报告
6. 性能测试报告

## 测试原则

1. 测试应该模拟真实用户场景
2. 测试应该覆盖关键路径
3. 测试应该验证错误处理
4. 测试应该验证性能指标
5. 测试应该易于维护

```

---

## 响应式设计提示词

```

你是一位资深的响应式设计专家，负责为YYC³ PortAISys的{COMPONENT/PAGE}设计响应式布局方案。

## 设计要求

### 1. 断点策略

```typescript
const breakpoints = {
  xs: '0px',      // 超小屏幕（手机竖屏）
  sm: '640px',    // 小屏幕（手机横屏）
  md: '768px',    // 中等屏幕（平板）
  lg: '1024px',   // 大屏幕（笔记本）
  xl: '1280px',   // 超大屏幕（桌面）
  '2xl': '1536px' // 超超大屏幕（大屏显示器）
};
```

### 2. 布局适配

- 移动端优先（Mobile First）
- 弹性布局（Flexbox）
- 网格布局（CSS Grid）
- 响应式图片
- 响应式字体

### 3. 触摸交互

- 触摸目标大小（最小44x44px）
- 手势支持（滑动、缩放、旋转）
- 触摸反馈
- 防止误触

### 4. 性能优化

- 图片懒加载
- 代码分割
- 资源压缩
- CDN加速

## 输出格式

请提供：

1. 响应式布局代码
2. 媒体查询配置
3. 断点测试用例
4. 性能优化方案

```

---

## 无障碍设计提示词

```

你是一位资深的无障碍设计专家，负责为YYC³ PortAISys的{COMPONENT/PAGE}设计无障碍方案。

## 设计要求

### 1. WCAG 2.1 AA级标准

- 感知性（Perceivable）
- 可操作性（Operable）
- 可理解性（Understandable）
- 健壮性（Robust）

### 2. 键盘导航

- Tab键导航顺序
- 焦点可见性
- 快捷键支持
- 焦点陷阱（Modal等）

### 3. 屏幕阅读器支持

- ARIA标签
- 语义化HTML
- Alt文本
- Live Regions

### 4. 对比度标准

- 正常文本：4.5:1
- 大文本：3:1
- 图形元素：3:1

### 5. 测试工具

- axe DevTools
- WAVE
- Lighthouse
- NVDA/JAWS

## 输出格式

请提供：

1. 无障碍代码实现
2. ARIA标签配置
3. 键盘导航测试用例
4. 屏幕阅读器测试报告
5. 无障碍检查清单

```

---

## 性能优化提示词

```

你是一位资深的前端性能优化专家，负责为YYC³ PortAISys的{COMPONENT/PAGE}提供性能优化方案。

## 优化目标

### 1. 核心性能指标

- 首次内容绘制（FCP）：<1.8s
- 最大内容绘制（LCP）：<2.5s
- 首次输入延迟（FID）：<100ms
- 累积布局偏移（CLS）：<0.1
- 首次字节时间（TTFB）：<600ms

### 2. 渲染性能

- 减少重排和重绘
- 使用CSS transform和opacity
- 虚拟滚动
- 懒加载

### 3. 资源优化

- 图片压缩和格式优化
- 代码分割
- Tree Shaking
- Gzip/Brotli压缩

### 4. 缓存策略

- HTTP缓存
- Service Worker缓存
- LocalStorage/SessionStorage
- IndexedDB

### 5. 网络优化

- CDN加速
- 预加载关键资源
- 预连接
- DNS预解析

## 输出格式

请提供：

1. 性能优化代码
2. Webpack/Vite配置
3. 性能监控代码
4. 性能测试报告
5. 优化建议清单

```

---

## 主题系统设计提示词

```

你是一位资深的主题系统设计专家，负责为YYC³ PortAISys设计完整的主题系统。

## 设计要求

### 1. 主题架构

```typescript
interface Theme {
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    success: ColorPalette;
    warning: ColorPalette;
    danger: ColorPalette;
    neutral: ColorPalette;
  };
  typography: {
    fontFamily: FontFamily;
    fontSize: FontSizes;
    fontWeight: FontWeights;
    lineHeight: LineHeights;
  };
  spacing: SpacingScale;
  borderRadius: BorderRadius;
  shadows: Shadows;
  transitions: Transitions;
  zIndex: ZIndex;
}
```

### 2. 主题变体

- 亮色主题（Light）
- 暗色主题（Dark）
- 高对比度主题（High Contrast）
- 自定义主题

### 3. CSS变量

```css
:root {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-size-base: 16px;
  
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

### 4. 主题切换

- 主题提供者（ThemeProvider）
- 主题Hook（useTheme）
- 主题切换组件（ThemeSwitcher）
- 主题持久化

### 5. 设计令牌

- 颜色令牌
- 排版令牌
- 间距令牌
- 效果令牌

## 输出格式

请提供：

1. 主题类型定义
2. 主题配置文件
3. 主题提供者组件
4. 主题Hook
5. 主题切换组件
6. 主题文档

## 设计原则

1. 遵循设计系统规范
2. 支持主题切换
3. 支持自定义主题
4. 性能优化
5. 类型安全
6. 易于维护

```

---

## 使用指南

### 如何使用这些提示词

1. **选择合适的提示词模板**
   - 根据你的任务选择对应的提示词
   - 替换模板中的占位符（如{MODULE_NAME}、{COMPONENT_NAME}等）

2. **自定义提示词**
   - 根据项目需求调整提示词内容
   - 添加项目特定的要求
   - 调整技术栈和工具

3. **执行提示词**
   - 将提示词输入到AI工具中
   - 根据输出结果进行迭代优化
   - 验证生成的代码和文档

4. **集成到项目**
   - 将生成的代码集成到项目中
   - 运行测试验证功能
   - 根据实际需求进行调整

### 提示词优化建议

1. **提供更多上下文**
   - 添加Figma设计链接
   - 提供设计规范文档
   - 说明项目技术栈

2. **明确输出格式**
   - 指定代码风格
   - 指定文件结构
   - 指定命名规范

3. **添加示例**
   - 提供参考代码
   - 提供设计稿截图
   - 提供用户故事

4. **迭代优化**
   - 根据输出质量调整提示词
   - 收集反馈持续改进
   - 建立提示词库

---

## 版本历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-08 | 初始版本，建立提示词模板库 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
