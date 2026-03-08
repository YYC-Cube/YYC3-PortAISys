# YYC³ PortAISys - Figma设计转代码提示词模板

> 基于Figma设计稿生成高质量UI/UX代码的提示词模板集合
>
> 适用于：Figma设计转React/Vue代码、组件生成、样式实现等场景

---

## 📋 目录

1. [Figma设计分析提示词](#figma设计分析提示词)
2. [组件代码生成提示词](#组件代码生成提示词)
3. [页面代码生成提示词](#页面代码生成提示词)
4. [样式系统生成提示词](#样式系统生成提示词)
5. [响应式实现提示词](#响应式实现提示词)
6. [动画效果生成提示词](#动画效果生成提示词)
7. [设计令牌生成提示词](#设计令牌生成提示词)

---

## Figma设计分析提示词

### 基础设计分析提示词

```
你是一位资深的UI/UX设计师和前端开发专家，负责分析Figma设计稿并为YYC³ PortAISys项目生成代码实现方案。

## Figma设计信息
- Figma文件链接：{FIGMA_FILE_URL}
- 设计页面/组件：{DESIGN_PAGE/COMPONENT}
- 设计版本：{DESIGN_VERSION}

## 项目背景
YYC³（YanYuCloudCube）PortAISys是一个基于云原生架构的便携式智能AI系统，提供高性能、高可靠性、高安全性、高扩展性和高可维护性的AI解决方案。

## 技术栈
- 框架：React 18 + TypeScript
- 样式：Tailwind CSS
- 状态管理：Zustand
- 动画：Framer Motion
- 构建工具：Vite

## 分析要求

### 1. 设计结构分析
请分析Figma设计稿的以下内容：

#### 1.1 组件层次结构
```

页面/组件名称
├── 子组件1
│   ├── 孙组件1.1
│   └── 孙组件1.2
├── 子组件2
│   └── 孙组件2.1
└── 子组件3

```

#### 1.2 布局结构
- 整体布局方式（Flex/Grid/Absolute）
- 布局方向（Row/Column）
- 对齐方式（Start/Center/End）
- 间距设置（Padding/Margin）

#### 1.3 元素层级
- 背景层
- 内容层
- 交互层
- 浮动层

### 2. 视觉设计分析

#### 2.1 颜色系统
- 主色调（Primary Color）
- 次要色调（Secondary Color）
- 成功色（Success Color）
- 警告色（Warning Color）
- 危险色（Danger Color）
- 中性色（Neutral Color）
- 背景色（Background Color）
- 文本色（Text Color）

#### 2.2 排版系统
- 字体家族（Font Family）
- 字体大小（Font Size）
- 字重（Font Weight）
- 行高（Line Height）
- 字间距（Letter Spacing）

#### 2.3 间距系统
- 基础间距单位（Base Spacing）
- 间距比例（Spacing Scale）
- 内边距（Padding）
- 外边距（Margin）

#### 2.4 圆角系统
- 小圆角（Small Radius）
- 中圆角（Medium Radius）
- 大圆角（Large Radius）
- 全圆角（Full Radius）

#### 2.5 阴影系统
- 小阴影（Small Shadow）
- 中阴影（Medium Shadow）
- 大阴影（Large Shadow）
- 内阴影（Inner Shadow）

### 3. 交互设计分析

#### 3.1 交互状态
- 默认状态（Default）
- 悬停状态（Hover）
- 激活状态（Active/Pressed）
- 焦点状态（Focus）
- 禁用状态（Disabled）
- 加载状态（Loading）
- 错误状态（Error）

#### 3.2 交互效果
- 过渡动画（Transition）
- 变换效果（Transform）
- 悬停效果（Hover Effect）
- 点击效果（Click Effect）

#### 3.3 交互反馈
- 视觉反馈（Visual Feedback）
- 触觉反馈（Haptic Feedback）
- 声音反馈（Audio Feedback）

### 4. 响应式设计分析

#### 4.1 断点设置
- 移动端（Mobile）
- 平板端（Tablet）
- 桌面端（Desktop）
- 大屏端（Large Screen）

#### 4.2 布局适配
- 移动端布局
- 平板端布局
- 桌面端布局
- 大屏端布局

#### 4.3 内容适配
- 字体缩放
- 图片缩放
- 间距调整
- 组件隐藏/显示

### 5. 无障碍设计分析

#### 5.1 对比度检查
- 正常文本对比度
- 大文本对比度
- 图形元素对比度

#### 5.2 交互目标大小
- 最小点击区域（44x44px）
- 触摸目标大小
- 鼠标目标大小

#### 5.3 键盘导航
- Tab键导航顺序
- 焦点可见性
- 快捷键支持

#### 5.4 屏幕阅读器
- ARIA标签
- 语义化HTML
- Alt文本

### 6. 性能分析

#### 6.1 资源优化
- 图片优化建议
- 字体优化建议
- 图标优化建议

#### 6.2 渲染性能
- 重排/重绘优化
- 动画性能优化
- 虚拟滚动建议

#### 6.3 加载性能
- 关键资源优先级
- 懒加载策略
- 代码分割建议

## 输出格式

### 1. 设计分析报告
```markdown
# {DESIGN_NAME} 设计分析报告

## 1. 设计概述
- 设计名称
- 设计类型（页面/组件）
- 设计尺寸
- 设计主题

## 2. 组件结构
- 组件层次结构图
- 组件依赖关系
- 组件复用性分析

## 3. 视觉设计
- 颜色系统
- 排版系统
- 间距系统
- 圆角系统
- 阴影系统

## 4. 交互设计
- 交互状态
- 交互效果
- 交互反馈

## 5. 响应式设计
- 断点设置
- 布局适配
- 内容适配

## 6. 无障碍设计
- 对比度检查
- 交互目标大小
- 键盘导航
- 屏幕阅读器

## 7. 性能优化
- 资源优化
- 渲染性能
- 加载性能

## 8. 实现建议
- 技术选型
- 实现步骤
- 注意事项
```

### 2. 设计令牌（Design Tokens）

```typescript
// tokens/colors.ts
export const colors = {
  primary: {
    50: '#...',
    100: '#...',
    500: '#...',
    600: '#...',
    700: '#...',
  },
  // ...
};

// tokens/typography.ts
export const typography = {
  fontFamily: {
    sans: '...',
    mono: '...',
  },
  fontSize: {
    xs: '...',
    sm: '...',
    base: '...',
    lg: '...',
    xl: '...',
  },
  // ...
};

// tokens/spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  4: '1rem',
  // ...
};

// tokens/radius.ts
export const radius = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px',
};

// tokens/shadows.ts
export const shadows = {
  sm: '...',
  md: '...',
  lg: '...',
};
```

### 3. 组件接口定义

```typescript
// components/{COMPONENT_NAME}/{COMPONENT_NAME}.types.ts
export interface {COMPONENT_NAME}Props {
  // 必需属性
  {REQUIRED_PROPS}
  
  // 可选属性
  {OPTIONAL_PROPS}
  
  // 事件处理
  {EVENT_HANDLERS}
  
  // 样式属性
  className?: string;
  style?: React.CSSProperties;
}
```

### 4. 实现建议清单

```markdown
## 实现建议

### 优先级P0（必须实现）
- [ ] 核心功能实现
- [ ] 基础样式实现
- [ ] 响应式适配
- [ ] 无障碍支持

### 优先级P1（应该实现）
- [ ] 交互效果
- [ ] 动画效果
- [ ] 错误处理
- [ ] 加载状态

### 优先级P2（可以实现）
- [ ] 高级功能
- [ ] 性能优化
- [ ] 浏览器兼容
- [ ] 国际化支持

### 技术风险
- [ ] 风险1
- [ ] 风险2
- [ ] 风险3

### 注意事项
- [ ] 注意事项1
- [ ] 注意事项2
- [ ] 注意事项3
```

## 分析原则

1. 准确理解设计意图
2. 识别可复用组件
3. 考虑性能和可访问性
4. 提供清晰的实现路径
5. 遵循YYC³代码规范
6. 考虑响应式设计
7. 考虑主题系统

```

### 智能AI助手设计分析提示词

```

你是一位资深的AI交互设计师，负责分析Figma中的智能AI助手设计稿。

## Figma设计信息

- Figma文件链接：{FIGMA_FILE_URL}
- 设计页面：Chat Interface / AI Assistant
- 设计版本：{DESIGN_VERSION}

## 分析重点

### 1. 聊天界面分析

- 消息气泡设计
- 输入框设计
- 消息列表布局
- 滚动行为

### 2. AI响应展示

- 流式响应设计
- 思考过程可视化
- 代码块展示
- 多媒体内容支持

### 3. 交互功能

- 消息发送/接收
- 对话历史管理
- 快捷指令
- 消息操作（复制、删除、编辑）

### 4. 状态设计

- 加载状态
- 错误状态
- 空状态
- 离线状态

### 5. 响应式设计

- 移动端适配
- 平板端适配
- 桌面端适配
- 全屏模式

## 输出要求

请提供完整的设计分析报告、设计令牌、组件接口定义和实现建议。

```

---

## 组件代码生成提示词

### 基础组件生成提示词

```

你是一位资深的React组件开发专家，负责根据Figma设计稿为YYC³ PortAISys项目生成{COMPONENT_NAME}组件的完整代码。

## Figma设计信息

- Figma文件链接：{FIGMA_FILE_URL}
- 组件名称：{COMPONENT_NAME}
- 组件描述：{COMPONENT_DESCRIPTION}
- 设计版本：{DESIGN_VERSION}

## 项目背景

YYC³（YanYuCloudCube）PortAISys是一个基于云原生架构的便携式智能AI系统。

## 技术栈

- 框架：React 18 + TypeScript
- 样式：Tailwind CSS
- 动画：Framer Motion
- 工具库：Radix UI, clsx, tailwind-merge

## 代码生成要求

### 1. 组件文件结构

```
components/
  {COMPONENT_NAME}/
    index.ts                    # 导出文件
    {COMPONENT_NAME}.tsx       # 主组件
    {COMPONENT_NAME}.types.ts  # 类型定义
    {COMPONENT_NAME}.test.tsx  # 测试文件
    {COMPONENT_NAME}.stories.tsx # Storybook故事
```

### 2. 主组件代码模板

```typescript
/**
 * @file components/{COMPONENT_NAME}/{COMPONENT_NAME}.tsx
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
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { {COMPONENT_NAME}Props } from './{COMPONENT_NAME}.types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const {COMPONENT_NAME}: React.FC<{COMPONENT_NAME}Props> = ({
  // 必需属性
  {REQUIRED_PROPS},
  
  // 可选属性
  {OPTIONAL_PROPS} = {DEFAULT_VALUES},
  
  // 事件处理
  {EVENT_HANDLERS},
  
  // 样式属性
  className,
  style,
  ...props
}) => {
  // 组件状态
  const [state, setState] = React.useState<STATE_TYPE>(initialState);
  
  // 副作用
  React.useEffect(() => {
    // 副作用逻辑
  }, [dependencies]);
  
  // 事件处理函数
  const handleEvent = (event: EventType) => {
    // 事件处理逻辑
  };
  
  // 渲染
  return (
    <motion.div
      className={cn(
        // 基础样式
        'yyc3-{COMPONENT_NAME}',
        // 变体样式
        variants[variant],
        // 尺寸样式
        sizes[size],
        // 状态样式
        states[disabled ? 'disabled' : 'default'],
        // 自定义样式
        className
      )}
      style={style}
      // 动画配置
      initial={false}
      animate={state}
      transition={{ duration: 0.2 }}
      // 事件处理
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      // 其他属性
      {...props}
    >
      {/* 组件内容 */}
      {children}
    </motion.div>
  );
};

// 默认导出
export default {COMPONENT_NAME};
```

### 3. 类型定义模板

```typescript
/**
 * @file components/{COMPONENT_NAME}/{COMPONENT_NAME}.types.ts
 * @description {COMPONENT_NAME}组件类型定义
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-08
 * @updated 2026-03-08
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags ui,components,{COMPONENT_NAME},types
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * {COMPONENT_NAME}组件属性接口
 */
export interface {COMPONENT_NAME}Props {
  // 必需属性
  {REQUIRED_PROPS}: {REQUIRED_PROPS_TYPE};
  
  // 可选属性
  {OPTIONAL_PROPS}?: {OPTIONAL_PROPS_TYPE};
  
  // 事件处理
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  
  // 样式属性
  className?: string;
  style?: CSSProperties;
  
  // 子元素
  children?: ReactNode;
}

/**
 * {COMPONENT_NAME}组件变体类型
 */
export type {COMPONENT_NAME}Variant = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger';

/**
 * {COMPONENT_NAME}组件尺寸类型
 */
export type {COMPONENT_NAME}Size = 
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl';

/**
 * {COMPONENT_NAME}组件状态类型
 */
export type {COMPONENT_NAME}State = 
  | 'default'
  | 'hover'
  | 'active'
  | 'focus'
  | 'disabled'
  | 'loading'
  | 'error';
```

### 4. 样式配置模板

```typescript
// 组件样式配置
const variants = {
  default: 'bg-white text-gray-900 border-gray-200',
  primary: 'bg-blue-600 text-white border-blue-600',
  secondary: 'bg-gray-100 text-gray-900 border-gray-300',
  success: 'bg-green-600 text-white border-green-600',
  warning: 'bg-yellow-500 text-white border-yellow-500',
  danger: 'bg-red-600 text-white border-red-600',
} as const;

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3 text-lg',
} as const;

const states = {
  default: '',
  hover: 'hover:opacity-90',
  active: 'active:scale-95',
  focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  loading: 'animate-pulse',
  error: 'border-red-500',
} as const;
```

### 5. 测试文件模板

```typescript
/**
 * @file components/{COMPONENT_NAME}/{COMPONENT_NAME}.test.tsx
 * @description {COMPONENT_NAME}组件测试
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-08
 * @updated 2026-03-08
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags ui,components,{COMPONENT_NAME},test
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { {COMPONENT_NAME} } from './{COMPONENT_NAME}';

describe('{COMPONENT_NAME} Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<{COMPONENT_NAME} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should handle required props', () => {
      render(<{COMPONENT_NAME} {...requiredProps} />);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      render(<{COMPONENT_NAME} variant="primary" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });
  });

  describe('Sizes', () => {
    it('should render sm size', () => {
      render(<{COMPONENT_NAME} size="sm" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm');
    });
  });

  describe('States', () => {
    it('should render disabled state', () => {
      render(<{COMPONENT_NAME} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<{COMPONENT_NAME} onClick={handleClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      render(<{COMPONENT_NAME} />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});
```

### 6. Storybook故事模板

```typescript
/**
 * @file components/{COMPONENT_NAME}/{COMPONENT_NAME}.stories.tsx
 * @description {COMPONENT_NAME}组件Storybook故事
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-08
 * @updated 2026-03-08
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags ui,components,{COMPONENT_NAME},storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { {COMPONENT_NAME} } from './{COMPONENT_NAME}';

const meta: Meta<typeof {COMPONENT_NAME}> = {
  title: 'Components/{COMPONENT_NAME}',
  component: {COMPONENT_NAME},
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof {COMPONENT_NAME}>;

export const Default: Story = {
  args: {
    children: 'Default {COMPONENT_NAME}',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary {COMPONENT_NAME}',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <{COMPONENT_NAME} size="xs">XS</{COMPONENT_NAME}>
      <{COMPONENT_NAME} size="sm">SM</{COMPONENT_NAME}>
      <{COMPONENT_NAME} size="md">MD</{COMPONENT_NAME}>
      <{COMPONENT_NAME} size="lg">LG</{COMPONENT_NAME}>
      <{COMPONENT_NAME} size="xl">XL</{COMPONENT_NAME}>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled {COMPONENT_NAME}',
  },
};
```

### 7. 导出文件模板

```typescript
/**
 * @file components/{COMPONENT_NAME}/index.ts
 * @description {COMPONENT_NAME}组件导出
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-08
 * @updated 2026-03-08
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags ui,components,{COMPONENT_NAME},export
 */

export { {COMPONENT_NAME} } from './{COMPONENT_NAME}';
export type { 
  {COMPONENT_NAME}Props,
  {COMPONENT_NAME}Variant,
  {COMPONENT_NAME}Size,
  {COMPONENT_NAME}State 
} from './{COMPONENT_NAME}.types';
```

## 输出要求

### 1. 完整的组件代码

- 主组件实现
- 类型定义
- 样式配置
- 工具函数

### 2. 完整的测试代码

- 单元测试
- 集成测试
- 无障碍测试

### 3. 完整的文档

- 组件说明
- API文档
- 使用示例
- 最佳实践

### 4. 设计令牌

- 颜色令牌
- 间距令牌
- 排版令牌
- 效果令牌

## 代码质量要求

### 1. 代码规范

- 遵循YYC³代码标头规范
- 使用TypeScript严格模式
- 遵循React最佳实践
- 遵循Tailwind CSS最佳实践

### 2. 性能优化

- 使用React.memo优化
- 使用useMemo/useCallback
- 避免不必要的重渲染
- 优化动画性能

### 3. 无障碍支持

- 支持键盘导航
- 支持屏幕阅读器
- 符合WCAG 2.1 AA级标准
- 提供ARIA标签

### 4. 响应式设计

- 移动端优先
- 支持所有断点
- 触摸交互优化
- 自适应布局

### 5. 主题支持

- 支持亮色主题
- 支持暗色主题
- 支持自定义主题
- 使用CSS变量

## 生成原则

1. 准确还原Figma设计
2. 遵循组件化设计原则
3. 确保代码可维护性
4. 优化性能和用户体验
5. 提供完整的测试覆盖
6. 提供清晰的文档

```

### 复杂组件生成提示词

```

你是一位资深的React组件开发专家，负责根据Figma设计稿为YYC³ PortAISys项目生成{COMPLEX_COMPONENT_NAME}复杂组件的完整代码。

## Figma设计信息

- Figma文件链接：{FIGMA_FILE_URL}
- 组件名称：{COMPLEX_COMPONENT_NAME}
- 组件描述：{COMPLEX_COMPONENT_DESCRIPTION}
- 设计版本：{DESIGN_VERSION}
- 包含子组件：{SUB_COMPONENTS}

## 生成要求

### 1. 组件架构设计

```
{COMPLEX_COMPONENT_NAME}/
├── index.ts                          # 导出文件
├── {COMPLEX_COMPONENT_NAME}.tsx       # 主组件
├── {COMPLEX_COMPONENT_NAME}.types.ts # 类型定义
├── {COMPLEX_COMPONENT_NAME}.hooks.ts # 自定义Hooks
├── {COMPLEX_COMPONENT_NAME}.utils.ts # 工具函数
├── {COMPLEX_COMPONENT_NAME}.constants.ts # 常量定义
├── SubComponent1/
│   ├── index.ts
│   ├── SubComponent1.tsx
│   ├── SubComponent1.types.ts
│   └── SubComponent1.test.tsx
├── SubComponent2/
│   ├── index.ts
│   ├── SubComponent2.tsx
│   ├── SubComponent2.types.ts
│   └── SubComponent2.test.tsx
├── __tests__/
│   ├── {COMPLEX_COMPONENT_NAME}.test.tsx
│   └── integration.test.tsx
└── {COMPLEX_COMPONENT_NAME}.stories.tsx
```

### 2. 主组件实现

- 组件状态管理
- 子组件集成
- 事件处理
- 数据流管理

### 3. 子组件实现

- 每个子组件独立实现
- 组件间通信机制
- 共享状态管理
- 事件冒泡控制

### 4. 自定义Hooks

- 状态管理Hook
- 事件处理Hook
- 副作用Hook
- 性能优化Hook

### 5. 工具函数

- 数据处理函数
- 验证函数
- 格式化函数
- 计算函数

### 6. 集成测试

- 组件集成测试
- 状态管理测试
- 事件处理测试
- 性能测试

## 输出要求

请提供完整的组件代码，包括所有子组件、自定义Hooks、工具函数、测试代码和文档。

```

---

## 页面代码生成提示词

```

你是一位资深的React页面开发专家，负责根据Figma设计稿为YYC³ PortAISys项目生成{PAGE_NAME}页面的完整代码。

## Figma设计信息

- Figma文件链接：{FIGMA_FILE_URL}
- 页面名称：{PAGE_NAME}
- 页面描述：{PAGE_DESCRIPTION}
- 设计版本：{DESIGN_VERSION}

## 生成要求

### 1. 页面结构

```
pages/
  {PAGE_NAME}/
    ├── index.ts
    ├── {PAGE_NAME}.tsx
    ├── {PAGE_NAME}.types.ts
    ├── components/
    │   ├── PageHeader/
    │   ├── PageContent/
    │   └── PageFooter/
    ├── hooks/
    │   ├── use{PAGE_NAME}Data.ts
    │   └── use{PAGE_NAME}State.ts
    ├── utils/
    │   └── {PAGE_NAME}Utils.ts
    └── __tests__/
        └── {PAGE_NAME}.test.tsx
```

### 2. 页面组件

- 页面布局
- 页面导航
- 页面内容
- 页面交互

### 3. 数据获取

- API调用
- 数据缓存
- 错误处理
- 加载状态

### 4. 状态管理

- 页面状态
- 表单状态
- 用户状态
- 应用状态

### 5. 性能优化

- 代码分割
- 懒加载
- 图片优化
- 缓存策略

## 输出要求

请提供完整的页面代码，包括所有子组件、自定义Hooks、工具函数、测试代码和文档。

```

---

## 样式系统生成提示词

```

你是一位资深的样式系统专家，负责根据Figma设计稿为YYC³ PortAISys项目生成完整的样式系统。

## Figma设计信息

- Figma文件链接：{FIGMA_FILE_URL}
- 设计系统：{DESIGN_SYSTEM_NAME}
- 设计版本：{DESIGN_VERSION}

## 生成要求

### 1. 设计令牌

```typescript
// tokens/index.ts
export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  zIndex,
} as const;
```

### 2. Tailwind配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#...',
          100: '#...',
          // ...
        },
        // ...
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // ...
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        // ...
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        // ...
      },
      boxShadow: {
        'sm': '...',
        'md': '...',
        // ...
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
    },
  },
};
```

### 3. CSS变量

```css
/* styles/tokens.css */
:root {
  --color-primary-50: #...;
  --color-primary-100: #...;
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --spacing-1: 0.25rem;
  --radius-sm: 0.25rem;
  --shadow-sm: ...;
  --transition-fast: 150ms ease-in-out;
}

[data-theme="dark"] {
  --color-primary-50: #...;
  --color-primary-100: #...;
  /* ... */
}
```

### 4. 全局样式

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-medium transition-colors;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

## 输出要求

请提供完整的设计令牌、Tailwind配置、CSS变量和全局样式。

```

---

## 响应式实现提示词

```

你是一位资深的响应式设计专家，负责根据Figma设计稿为YYC³ PortAISys的{COMPONENT/PAGE}生成响应式实现代码。

## Figma设计信息

- Figma文件链接：{FIGMA_FILE_URL}
- 组件/页面名称：{COMPONENT/PAGE_NAME}
- 设计版本：{DESIGN_VERSION}

## 生成要求

### 1. 断点配置

```typescript
// breakpoints.ts
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;
```

### 2. 响应式组件

```typescript
import { useBreakpoint } from '@/hooks/useBreakpoint';

export const ResponsiveComponent: React.FC = () => {
  const breakpoint = useBreakpoint();
  
  return (
    <div className="
      xs:px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10
      xs:text-sm sm:text-base md:text-lg lg:text-xl
    ">
      {/* 内容 */}
    </div>
  );
};
```

### 3. 响应式布局

```typescript
export const ResponsiveLayout: React.FC = () => {
  return (
    <div className="
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      md:grid-cols-3 
      lg:grid-cols-4
      gap-4
    ">
      {/* 内容 */}
    </div>
  );
};
```

### 4. 响应式图片

```typescript
export const ResponsiveImage: React.FC = () => {
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet="image-lg.jpg" />
      <source media="(min-width: 768px)" srcSet="image-md.jpg" />
      <img src="image-sm.jpg" alt="Description" loading="lazy" />
    </picture>
  );
};
```

## 输出要求

请提供完整的响应式实现代码，包括断点配置、响应式组件、响应式布局和响应式图片。

```

---

## 动画效果生成提示词

```

你是一位资深的动画设计专家，负责根据Figma设计稿为YYC³ PortAISys的{COMPONENT/PAGE}生成动画效果代码。

## Figma设计信息

- Figma文件链接：{FIGMA_FILE_URL}
- 组件/页面名称：{COMPONENT/PAGE_NAME}
- 动画设计：{ANIMATION_DESIGN}
- 设计版本：{DESIGN_VERSION}

## 生成要求

### 1. 过渡动画

```typescript
import { motion } from 'framer-motion';

export const AnimatedComponent: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* 内容 */}
    </motion.div>
  );
};
```

### 2. 关键帧动画

```typescript
export const KeyframeAnimation: React.FC = () => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop',
      }}
    >
      {/* 内容 */}
    </motion.div>
  );
};
```

### 3. 手势动画

```typescript
export const GestureAnimation: React.FC = () => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
    >
      {/* 内容 */}
    </motion.div>
  );
};
```

### 4. 滚动动画

```typescript
export const ScrollAnimation: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
    >
      {/* 内容 */}
    </motion.div>
  );
};
```

## 输出要求

请提供完整的动画效果代码，包括过渡动画、关键帧动画、手势动画和滚动动画。

```

---

## 设计令牌生成提示词

```

你是一位资深的设计令牌专家，负责根据Figma设计稿为YYC³ PortAISys项目生成完整的设计令牌。

## Figma设计信息

- Figma文件链接：{FIGMA_FILE_URL}
- 设计系统：{DESIGN_SYSTEM_NAME}
- 设计版本：{DESIGN_VERSION}

## 生成要求

### 1. 颜色令牌

```typescript
// tokens/colors.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  secondary: {
    // ...
  },
  success: {
    // ...
  },
  warning: {
    // ...
  },
  danger: {
    // ...
  },
  neutral: {
    // ...
  },
} as const;
```

### 2. 排版令牌

```typescript
// tokens/typography.ts
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;
```

### 3. 间距令牌

```typescript
// tokens/spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;
```

### 4. 圆角令牌

```typescript
// tokens/radius.ts
export const radius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  full: '9999px',
} as const;
```

### 5. 阴影令牌

```typescript
// tokens/shadows.ts
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;
```

### 6. 过渡令牌

```typescript
// tokens/transitions.ts
export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;
```

### 7. 层级令牌

```typescript
// tokens/z-index.ts
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
```

## 输出要求

请提供完整的设计令牌，包括颜色、排版、间距、圆角、阴影、过渡和层级令牌。

```

---

## 使用指南

### 如何使用这些提示词

1. **准备Figma设计信息**
   - 获取Figma文件链接
   - 确定要转换的组件/页面
   - 记录设计版本信息

2. **选择合适的提示词**
   - 根据任务类型选择提示词
   - 替换模板中的占位符
   - 添加项目特定要求

3. **执行提示词**
   - 将提示词输入到AI工具
   - 根据输出结果迭代优化
   - 验证生成的代码质量

4. **集成到项目**
   - 将代码集成到项目中
   - 运行测试验证功能
   - 根据实际需求调整

### 最佳实践

1. **提供详细的设计信息**
   - Figma文件链接
   - 设计截图
   - 设计规范文档

2. **明确技术栈**
   - 框架版本
   - 依赖库版本
   - 构建工具配置

3. **指定输出格式**
   - 代码风格
   - 文件结构
   - 命名规范

4. **迭代优化**
   - 根据输出质量调整
   - 收集反馈持续改进
   - 建立提示词库

---

## 版本历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-08 | 初始版本，建立Figma设计转代码提示词模板库 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
