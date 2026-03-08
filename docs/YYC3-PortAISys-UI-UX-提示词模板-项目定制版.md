# YYC³ PortAISys - UI/UX 提示词模板（项目定制版）

> 基于「五高五标五化」框架的UI/UX开发提示词模板
>
> 适用于：YYC³ PortAISys项目的UI/UX开发、组件库设计、测试用例生成等场景

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

### ChatInterface功能模块设计提示词

```
你是一位资深的UI/UX设计师和前端架构师，负责为YYC³ PortAISys项目设计ChatInterface功能模块。

## 项目背景
YYC³（YanYuCloudCube）PortAISys是一个基于云原生架构的便携式智能AI系统，提供高性能、高可靠性、高安全性、高扩展性和高可维护性的AI解决方案。

## 设计要求
基于「五高五标五化」框架：
- 五高：高可用性、高性能、高安全性、高扩展性、高可维护性
- 五标：标准化、规范化、自动化、智能化、可视化
- 五化：流程化、文档化、工具化、数字化、生态化

## 功能模块要求
请为ChatInterface功能模块提供完整的设计方案，包括：

### 1. 功能需求分析
- 核心功能描述：提供AI对话交互界面，支持自然语言输入、流式响应展示、多轮对话管理
- 用户场景分析：用户通过聊天界面与AI助手进行交互，获取智能回答和任务执行
- 功能优先级划分：
  - P0：消息发送/接收、流式响应、对话历史
  - P1：代码高亮、Markdown渲染、快捷指令
  - P2：语音输入、消息搜索、导出功能
- 交互流程设计：输入消息 → 发送请求 → 接收响应 → 展示结果

### 2. UI组件设计
- 组件结构层次：
  ```

  ChatInterface
  ├── ChatHeader（对话头部）
  ├── ChatMessages（消息列表）
  │   ├── UserMessage（用户消息）
  │   ├── AIMessage（AI消息）
  │   └── SystemMessage（系统消息）
  ├── ChatInput（输入框）
  │   ├── TextInput（文本输入）
  │   ├── SendButton（发送按钮）
  │   └── AttachmentButton（附件按钮）
  └── ChatActions（操作按钮）

  ```
- 组件接口定义（TypeScript）：
  ```typescript
  interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
    theme?: 'light' | 'dark';
    className?: string;
  }
  
  interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }
  ```

- 组件状态管理方案：使用Zustand管理对话状态
- 组件通信机制：通过EventBus进行组件间通信

### 3. 用户体验设计

- 用户操作流程：
  1. 用户输入消息
  2. 点击发送或按Enter键
  3. 显示加载状态
  4. 流式展示AI响应
  5. 完成后更新对话历史
- 交互反馈机制：
  - 发送成功：消息上移到对话列表
  - 发送失败：显示错误提示
  - AI响应中：显示打字机效果
  - 响应完成：显示完成标记
- 错误处理方案：
  - 网络错误：显示重试按钮
  - API错误：显示错误消息
  - 超时错误：显示超时提示
- 加载状态设计：
  - 输入框禁用
  - 发送按钮显示加载动画
  - 消息气泡显示思考动画

### 4. 技术实现方案

- 技术栈选择：React 18 + TypeScript
- 状态管理方案：Zustand
- 样式方案：Tailwind CSS
- 动画方案：Framer Motion
- Markdown渲染：react-markdown
- 代码高亮：prism-react-renderer
- 虚拟滚动：react-window

### 5. 性能优化策略

- 渲染性能优化：
  - 使用虚拟滚动处理长对话历史
  - 使用React.memo优化消息组件
  - 使用useMemo缓存计算结果
- 资源加载优化：
  - 代码分割：按需加载组件
  - 图片懒加载：延迟加载附件图片
  - 字体优化：使用系统字体
- 代码分割策略：
  - 路由级别分割
  - 组件级别分割
- 缓存策略：
  - 对话历史缓存：LocalStorage
  - API响应缓存：Zustand persist
  - 图片缓存：Service Worker

### 6. 无障碍设计

- 键盘导航支持：
  - Tab键导航焦点
  - Enter键发送消息
  - Escape键关闭对话框
- 屏幕阅读器支持：
  - ARIA标签：role="log"
  - Live Regions：aria-live="polite"
  - 语义化HTML
- ARIA标签设计：
  - 消息列表：role="log" aria-live="polite"
  - 输入框：aria-label="输入消息"
  - 发送按钮：aria-label="发送消息"
- 对比度标准：符合WCAG 2.1 AA级标准

### 7. 响应式设计

- 断点策略：
  - 移动端：<768px
  - 平板端：768px-1024px
  - 桌面端：>1024px
- 布局适配方案：
  - 移动端：全屏显示，底部输入框
  - 平板端：侧边栏+主内容
  - 桌面端：三栏布局
- 字体缩放方案：使用rem单位，支持系统字体缩放
- 触摸交互优化：
  - 最小点击区域：44x44px
  - 触摸反馈：视觉+触觉
  - 手势支持：滑动查看历史

### 8. 测试策略

- 单元测试覆盖：
  - 组件渲染测试
  - 事件处理测试
  - 状态管理测试
  - 工具函数测试
- 集成测试场景：
  - 消息发送流程
  - 流式响应展示
  - 对话历史管理
  - 错误处理流程
- E2E测试用例：
  - 完整对话流程
  - 多轮对话场景
  - 错误恢复场景
- 性能测试指标：
  - 首次渲染：<100ms
  - 消息发送：<50ms
  - 流式响应延迟：<100ms
  - 虚拟滚动FPS：>60

## 输出格式

请提供以下格式的输出：

```typescript
// 1. 类型定义
interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

// 2. 组件实现
export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  theme = 'light',
  className 
}) => {
  // 组件实现
}

// 3. 样式定义
const styles = {
  container: 'flex flex-col h-full bg-white dark:bg-gray-900',
  header: 'flex items-center justify-between p-4 border-b',
  messages: 'flex-1 overflow-y-auto p-4',
  input: 'p-4 border-t',
}

// 4. 测试用例
describe('ChatInterface', () => {
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

- YYC³组件库规范：/docs/YYC3-PortAISys-组件库设计规范.md
- YYC³ UI/UX架构：/docs/YYC3-PortAISys-UI-UX-功能模块架构.md
- 现有UI组件：/core/ui/ChatInterface.ts
- Widget系统：/core/ui/widget/

```

### IntelligentAIWidget功能模块设计提示词

```

你是一位资深的UI/UX设计师和前端架构师，负责为YYC³ PortAISys项目设计IntelligentAIWidget功能模块。

## 项目背景

YYC³（YanYuCloudCube）PortAISys是一个基于云原生架构的便携式智能AI系统，提供高性能、高可靠性、高安全性、高扩展性和高可维护性的AI解决方案。

## 设计要求

基于「五高五标五化」框架：

- 五高：高可用性、高性能、高安全性、高扩展性、高可维护性
- 五标：标准化、规范化、自动化、智能化、可视化
- 五化：流程化、文档化、工具化、数字化、生态化

## 功能模块要求

请为IntelligentAIWidget功能模块提供完整的设计方案，包括：

### 1. 功能需求分析

- 核心功能描述：提供可拖拽、可调整大小的智能AI助手窗口，支持多模块切换和自定义布局
- 用户场景分析：用户可以在任意位置打开AI助手窗口，快速访问聊天、工具箱、洞察等功能
- 功能优先级划分：
  - P0：拖拽、调整大小、模块切换
  - P1：最小化/最大化、主题切换、位置记忆
  - P2：多窗口支持、快捷键、自定义主题
- 交互流程设计：点击打开 → 拖拽定位 → 调整大小 → 切换模块 → 最小化/关闭

### 2. UI组件设计

- 组件结构层次：

  ```
  IntelligentAIWidget
  ├── WidgetHeader（窗口头部）
  │   ├── DragHandle（拖拽手柄）
  │   ├── ModuleTabs（模块标签）
  │   ├── MinimizeButton（最小化按钮）
  │   └── CloseButton（关闭按钮）
  ├── WidgetContent（窗口内容）
  │   ├── ChatModule（聊天模块）
  │   ├── ToolboxModule（工具箱模块）
  │   ├── InsightsModule（洞察模块）
  │   └── WorkflowModule（工作流模块）
  └── WidgetFooter（窗口底部）
  ```

- 组件接口定义（TypeScript）：

  ```typescript
  interface IntelligentAIWidgetProps {
    isOpen: boolean;
    onClose: () => void;
    activeModule: 'chat' | 'toolbox' | 'insights' | 'workflow';
    onModuleChange: (module: ModuleType) => void;
    position: { x: number; y: number };
    size: { width: number; height: number };
    onPositionChange: (position: { x: number; y: number }) => void;
    onSizeChange: (size: { width: number; height: number }) => void;
    theme?: 'light' | 'dark';
  }
  ```

- 组件状态管理方案：使用Zustand管理Widget状态
- 组件通信机制：通过EventBus进行组件间通信

### 3. 用户体验设计

- 用户操作流程：
  1. 点击触发按钮打开Widget
  2. 拖拽Widget到合适位置
  3. 调整Widget大小
  4. 切换到需要的模块
  5. 使用完成后最小化或关闭
- 交互反馈机制：
  - 拖拽时：显示阴影和半透明效果
  - 调整大小时：显示尺寸提示
  - 模块切换时：显示过渡动画
  - 最小化时：显示到任务栏
- 错误处理方案：
  - 拖拽边界限制：防止拖出屏幕
  - 大小限制：最小/最大尺寸限制
  - 状态恢复：异常关闭后恢复状态
- 加载状态设计：
  - 模块切换时：显示加载动画
  - 内容加载时：显示骨架屏

### 4. 技术实现方案

- 技术栈选择：React 18 + TypeScript
- 状态管理方案：Zustand
- 样式方案：Tailwind CSS
- 动画方案：Framer Motion
- 拖拽库：react-dnd或@dnd-kit/core
- 调整大小库：react-resizable

### 5. 性能优化策略

- 渲染性能优化：
  - 使用React.memo优化组件
  - 使用useCallback缓存事件处理
  - 使用useMemo缓存计算结果
- 资源加载优化：
  - 模块懒加载：按需加载模块
  - 图片懒加载：延迟加载图片
- 代码分割策略：
  - 模块级别分割
  - 路由级别分割
- 缓存策略：
  - Widget状态缓存：LocalStorage
  - 模块数据缓存：IndexedDB

### 6. 无障碍设计

- 键盘导航支持：
  - Tab键导航焦点
  - Escape键关闭Widget
  - 方向键调整大小
- 屏幕阅读器支持：
  - ARIA标签：role="dialog"
  - 语义化HTML
- ARIA标签设计：
  - Widget：role="dialog" aria-modal="false"
  - 拖拽手柄：aria-label="拖拽窗口"
  - 模块标签：role="tablist"
- 对比度标准：符合WCAG 2.1 AA级标准

### 7. 响应式设计

- 断点策略：
  - 移动端：<768px
  - 平板端：768px-1024px
  - 桌面端：>1024px
- 布局适配方案：
  - 移动端：全屏显示，底部导航
  - 平板端：浮动窗口，侧边导航
  - 桌面端：浮动窗口，顶部导航
- 字体缩放方案：使用rem单位，支持系统字体缩放
- 触摸交互优化：
  - 最小点击区域：44x44px
  - 触摸反馈：视觉+触觉
  - 手势支持：拖拽、缩放

### 8. 测试策略

- 单元测试覆盖：
  - 组件渲染测试
  - 拖拽功能测试
  - 调整大小测试
  - 状态管理测试
- 集成测试场景：
  - 模块切换流程
  - 状态持久化测试
  - 边界限制测试
- E2E测试用例：
  - 完整Widget使用流程
  - 多模块切换场景
  - 错误恢复场景
- 性能测试指标：
  - 首次渲染：<100ms
  - 拖拽响应：<16ms
  - 模块切换：<50ms
  - 动画FPS：>60

## 输出格式

请提供以下格式的输出：

```typescript
// 1. 类型定义
interface IntelligentAIWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: 'chat' | 'toolbox' | 'insights' | 'workflow';
  onModuleChange: (module: ModuleType) => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  theme?: 'light' | 'dark';
}

// 2. 组件实现
export const IntelligentAIWidget: React.FC<IntelligentAIWidgetProps> = ({ 
  isOpen,
  onClose,
  activeModule,
  onModuleChange,
  position,
  size,
  onPositionChange,
  onSizeChange,
  theme = 'light'
}) => {
  // 组件实现
}

// 3. 样式定义
const styles = {
  widget: 'fixed bg-white dark:bg-gray-900 shadow-2xl rounded-lg',
  header: 'flex items-center justify-between p-4 border-b cursor-move',
  content: 'p-4 overflow-y-auto',
  footer: 'flex items-center justify-between p-4 border-t',
}

// 4. 测试用例
describe('IntelligentAIWidget', () => {
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

- YYC³组件库规范：/docs/YYC3-PortAISys-组件库设计规范.md
- YYC³ UI/UX架构：/docs/YYC3-PortAISys-UI-UX-功能模块架构.md
- 现有UI组件：/core/ui/IntelligentAIWidget.ts
- Widget系统：/core/ui/widget/

```

---

## 组件库设计规范提示词

### Button组件设计提示词

```

你是一位资深的组件库设计师，负责为YYC³ PortAISys设计Button组件。

## 组件概述

Button是一个基础按钮组件，用于触发操作、提交表单、导航等交互场景。

## 设计要求

### 1. 组件API设计

```typescript
interface ButtonProps {
  // 必需属性
  children: React.ReactNode;
  
  // 可选属性
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  
  // 事件处理
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  
  // 样式属性
  className?: string;
  style?: React.CSSProperties;
}
```

### 2. 变体设计

- 默认变体（default）：灰色背景，用于次要操作
- 主要变体（primary）：蓝色背景，用于主要操作
- 次要变体（secondary）：浅灰色背景，用于辅助操作
- 成功变体（success）：绿色背景，用于成功操作
- 警告变体（warning）：黄色背景，用于警告操作
- 危险变体（danger）：红色背景，用于危险操作

### 3. 尺寸规范

- 超小尺寸（xs）：高度24px，字体12px
- 小尺寸（sm）：高度32px，字体14px
- 中等尺寸（md）：高度40px，字体14px
- 大尺寸（lg）：高度48px，字体16px
- 超大尺寸（xl）：高度56px，字体18px

### 4. 状态设计

- 默认状态：正常显示
- 悬停状态（hover）：背景色加深
- 激活状态（active）：轻微缩小
- 焦点状态（focus）：显示焦点环
- 禁用状态（disabled）：半透明，不可点击
- 加载状态（loading）：显示加载动画

### 5. 无障碍设计

- 键盘导航支持：Tab键导航，Enter/Space键触发
- ARIA标签：aria-label、aria-disabled
- 焦点管理：focus-visible样式
- 屏幕阅读器支持：语义化button元素

### 6. 响应式设计

- 移动端适配：最小点击区域44x44px
- 平板端适配：中等尺寸
- 桌面端适配：所有尺寸
- 触摸交互优化：触摸反馈

### 7. 主题支持

- 亮色主题：浅色背景，深色文字
- 暗色主题：深色背景，浅色文字
- 自定义主题：支持自定义颜色
- CSS变量支持：使用CSS变量定义颜色

### 8. 性能优化

- React.memo优化：避免不必要的重渲染
- 懒加载支持：按需加载图标
- 防抖/节流：如需要，使用防抖处理点击事件

## 实现要求

### 1. 代码结构

```typescript
/**
 * @file components/ui/Button/Button.tsx
 * @description 基础按钮组件，提供多种变体和尺寸
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-08
 * @updated 2026-03-08
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags ui,components,button
 */

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ButtonProps } from './Button.types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  className,
  style,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };

  return (
    <motion.button
      className={cn(
        // 基础样式
        'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        // 变体样式
        variants[variant],
        // 尺寸样式
        sizes[size],
        // 状态样式
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        fullWidth && 'w-full',
        // 自定义样式
        className
      )}
      style={style}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      // 动画配置
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </motion.button>
  );
};

// 变体样式
const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
} as const;

// 尺寸样式
const sizes = {
  xs: 'px-2 py-1 text-xs h-6',
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-5 py-2.5 text-base h-12',
  xl: 'px-6 py-3 text-lg h-14',
} as const;

// 加载动画组件
const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4 text-current"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default Button;
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

---

## 单元测试用例生成提示词

### Button组件测试提示词

```

你是一位资深的测试工程师，负责为YYC³ PortAISys的Button组件编写单元测试用例。

## 组件信息

- 组件名称：Button
- 组件描述：基础按钮组件，提供多种变体和尺寸
- 组件类型：基础UI组件

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

### 2. 测试用例

```typescript
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render with custom text', () => {
      render(<Button>Custom Text</Button>);
      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      render(
        <Button icon={<span data-testid="icon">📦</span>}>
          With Icon
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('should render danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });

    it('should render success variant', () => {
      render(<Button variant="success">Success</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600');
    });
  });

  describe('Sizes', () => {
    it('should render xs size', () => {
      render(<Button size="xs">XS</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-6', 'text-xs');
    });

    it('should render sm size', () => {
      render(<Button size="sm">SM</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'text-sm');
    });

    it('should render md size', () => {
      render(<Button size="md">MD</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'text-sm');
    });

    it('should render lg size', () => {
      render(<Button size="lg">LG</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'text-base');
    });

    it('should render xl size', () => {
      render(<Button size="xl">XL</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-14', 'text-lg');
    });
  });

  describe('States', () => {
    it('should render disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should render loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('cursor-wait');
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} loading>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onMouseEnter when hovered', () => {
      const handleMouseEnter = vi.fn();
      render(<Button onMouseEnter={handleMouseEnter}>Hover</Button>);
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('should call onMouseLeave when unhovered', () => {
      const handleMouseLeave = vi.fn();
      render(<Button onMouseLeave={handleMouseLeave}>Hover</Button>);
      fireEvent.mouseLeave(screen.getByRole('button'));
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should call onFocus when focused', () => {
      const handleFocus = vi.fn();
      render(<Button onFocus={handleFocus}>Focus</Button>);
      fireEvent.focus(screen.getByRole('button'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', () => {
      const handleBlur = vi.fn();
      render(<Button onBlur={handleBlur}>Blur</Button>);
      fireEvent.blur(screen.getByRole('button'));
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct role', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support ARIA attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle null children', () => {
      render(<Button>{null}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000);
      render(<Button>{longText}</Button>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderCount = vi.fn();
      const TestComponent = () => {
        renderCount();
        return <Button>Button</Button>;
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

---

## 集成测试生成提示词

### ChatInterface集成测试提示词

```

你是一位资深的测试工程师，负责为YYC³ PortAISys的ChatInterface功能模块编写集成测试用例。

## 模块信息

- 模块名称：ChatInterface
- 模块描述：AI对话交互界面，支持消息发送、流式响应、对话历史管理
- 包含组件：ChatHeader, ChatMessages, ChatInput, UserMessage, AIMessage, SystemMessage
- 依赖服务：WebSocket服务、API服务、状态管理服务

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
- WebSocket集成测试
- 错误处理测试
- 性能测试

### 2. 测试用例

```typescript
import React from 'react';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { ChatInterface } from '@/core/ui/ChatInterface';

// Mock服务器
const server = setupServer(
  // Mock API端点
  rest.post('/api/chat', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'msg-1',
        role: 'assistant',
        content: 'Hello! How can I help you?',
        timestamp: new Date().toISOString(),
      })
    );
  }),
  
  // Mock WebSocket
  rest.get('/api/ws', (req, res) => {
    return res(ctx.status(200));
  })
);

describe('ChatInterface Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('User Flow', () => {
    it('should complete message sending flow successfully', async () => {
      render(<ChatInterface />);
      
      // 输入消息
      const input = screen.getByPlaceholderText(/输入消息/i);
      fireEvent.change(input, { target: { value: 'Hello AI' } });
      
      // 点击发送
      const sendButton = screen.getByText(/发送/i);
      fireEvent.click(sendButton);
      
      // 验证用户消息显示
      await waitFor(() => {
        expect(screen.getByText('Hello AI')).toBeInTheDocument();
      });
      
      // 验证AI响应显示
      await waitFor(() => {
        expect(screen.getByText(/Hello! How can I help you?/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle multiple messages in conversation', async () => {
      render(<ChatInterface />);
      
      // 发送第一条消息
      fireEvent.change(screen.getByPlaceholderText(/输入消息/i), { 
        target: { value: 'First message' } 
      });
      fireEvent.click(screen.getByText(/发送/i));
      
      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument();
      });
      
      // 发送第二条消息
      fireEvent.change(screen.getByPlaceholderText(/输入消息/i), { 
        target: { value: 'Second message' } 
      });
      fireEvent.click(screen.getByText(/发送/i));
      
      await waitFor(() => {
        expect(screen.getByText('Second message')).toBeInTheDocument();
      });
      
      // 验证所有消息都显示
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
    });
  });

  describe('Component Interaction', () => {
    it('should handle input and send button interaction', async () => {
      render(<ChatInterface />);
      
      const input = screen.getByPlaceholderText(/输入消息/i);
      const sendButton = screen.getByText(/发送/i);
      
      // 初始状态：发送按钮禁用
      expect(sendButton).toBeDisabled();
      
      // 输入内容后：发送按钮启用
      fireEvent.change(input, { target: { value: 'Test' } });
      expect(sendButton).not.toBeDisabled();
      
      // 清空内容后：发送按钮禁用
      fireEvent.change(input, { target: { value: '' } });
      expect(sendButton).toBeDisabled();
    });

    it('should handle Enter key to send message', async () => {
      render(<ChatInterface />);
      
      const input = screen.getByPlaceholderText(/输入消息/i);
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('should manage conversation state correctly', async () => {
      render(<ChatInterface />);
      
      // 发送消息
      fireEvent.change(screen.getByPlaceholderText(/输入消息/i), { 
        target: { value: 'Message 1' } 
      });
      fireEvent.click(screen.getByText(/发送/i));
      
      await waitFor(() => {
        expect(screen.getByText('Message 1')).toBeInTheDocument();
      });
      
      // 验证消息数量
      const messages = screen.getAllByRole('log');
      expect(messages).toHaveLength(1);
    });
  });

  describe('API Integration', () => {
    it('should handle API requests correctly', async () => {
      render(<ChatInterface />);
      
      // 触发API请求
      fireEvent.change(screen.getByPlaceholderText(/输入消息/i), { 
        target: { value: 'Test' } 
      });
      fireEvent.click(screen.getByText(/发送/i));
      
      // 验证API响应
      await waitFor(() => {
        expect(screen.getByText(/Hello! How can I help you?/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle API errors correctly', async () => {
      // Mock错误响应
      server.use(
        rest.post('/api/chat', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );
      
      render(<ChatInterface />);
      
      // 触发API请求
      fireEvent.change(screen.getByPlaceholderText(/输入消息/i), { 
        target: { value: 'Test' } 
      });
      fireEvent.click(screen.getByText(/发送/i));
      
      // 验证错误处理
      await waitFor(() => {
        expect(screen.getByText(/发送失败/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      // Mock网络错误
      server.use(
        rest.post('/api/chat', (req, res) => {
          return res.networkError('Failed to connect');
        })
      );
      
      render(<ChatInterface />);
      
      // 触发请求
      fireEvent.change(screen.getByPlaceholderText(/输入消息/i), { 
        target: { value: 'Test' } 
      });
      fireEvent.click(screen.getByText(/发送/i));
      
      // 验证错误处理
      await waitFor(() => {
        expect(screen.getByText(/网络错误/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle timeout errors', async () => {
      // Mock超时
      server.use(
        rest.post('/api/chat', async (req, res) => {
          await new Promise(resolve => setTimeout(resolve, 10000));
          return res(ctx.json({}));
        })
      );
      
      render(<ChatInterface />);
      
      // 触发请求
      fireEvent.change(screen.getByPlaceholderText(/输入消息/i), { 
        target: { value: 'Test' } 
      });
      fireEvent.click(screen.getByText(/发送/i));
      
      // 验证超时处理
      await waitFor(() => {
        expect(screen.getByText(/请求超时/i)).toBeInTheDocument();
      }, { timeout: 6000 });
    });
  });

  describe('Performance', () => {
    it('should render within performance budget', () => {
      const startTime = performance.now();
      render(<ChatInterface />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle large conversation efficiently', async () => {
      // Mock大数据集
      const largeMessages = Array(100).fill(null).map((_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: new Date().toISOString(),
      }));
      
      server.use(
        rest.get('/api/messages', (req, res, ctx) => {
          return res(ctx.json(largeMessages));
        })
      );
      
      render(<ChatInterface />);
      
      await waitFor(() => {
        expect(screen.getByText('Message 99')).toBeInTheDocument();
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
- 消息发送：<50ms
- 流式响应延迟：<100ms
- 大数据集处理：<5s

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

你是一位资深的响应式设计专家，负责为YYC³ PortAISys的ChatInterface组件设计响应式布局方案。

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

你是一位资深的无障碍设计专家，负责为YYC³ PortAISys的ChatInterface组件设计无障碍方案。

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

你是一位资深的前端性能优化专家，负责为YYC³ PortAISys的ChatInterface组件提供性能优化方案。

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
   - 提示词已经针对YYC³ PortAISys项目进行了定制

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
| v1.0.0 | 2026-03-08 | 初始版本，建立针对YYC³ PortAISys项目的提示词模板库 | YanYuCloudCube Team |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
