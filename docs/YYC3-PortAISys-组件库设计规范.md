/**
 * @file YYC3-PortAISys-组件库设计规范.md
 * @description YYC³ Portable Intelligent AI System 组件库设计规范文档
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-08
 * @updated 2026-03-08
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags ui,components,design-system
 */

# YYC³ Portable Intelligent AI System - 组件库设计规范

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>

---

## 📋 目录

- [设计原则](#设计原则)
- [组件分类](#组件分类)
- [基础组件](#基础组件)
- [布局组件](#布局组件)
- [反馈组件](#反馈组件)
- [导航组件](#导航组件)
- [数据展示组件](#数据展示组件)
- [表单组件](#表单组件)
- [业务组件](#业务组件)
- [样式系统](#样式系统)
- [主题系统](#主题系统)
- [动画系统](#动画系统)
- [无障碍支持](#无障碍支持)

---

## 设计原则

### 核心原则

| 原则 | 说明 | 实现方式 |
|------|------|----------|
| **一致性** | 统一的视觉和交互语言 | 设计令牌 + 组件规范 |
| **可复用性** | 高度可复用的组件 | 原子组件 → 业务组件 |
| **可访问性** | WCAG 2.1 AA 标准 | ARIA 标签 + 键盘导航 |
| **响应式** | 适配所有设备 | 移动优先 + 媒体查询 |
| **性能** | 快速响应和加载 | 代码分割 + 虚拟滚动 |
| **主题化** | 支持多主题 | CSS 变量 + 主题切换 |
| **国际化** | 多语言支持 | i18n + RTL 支持 |

### 组件设计规范

#### 命名规范

```typescript
// 组件文件名：PascalCase
Button.tsx
Input.tsx
ChatMessage.tsx

// Hook 文件名：use + PascalCase
useButton.ts
useInput.ts
useChat.ts

// 类型文件名：PascalCase + .types.ts
Button.types.ts
Input.types.ts
Chat.types.ts
```

#### 文件结构

```
components/
├── Button/
│   ├── Button.tsx           # 组件实现
│   ├── Button.types.ts      # 类型定义
│   ├── Button.test.tsx     # 单元测试
│   ├── Button.stories.tsx   # Storybook 故事
│   └── index.ts           # 导出
```

---

## 组件分类

### 组件层次结构

```
组件库
├── 基础组件
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Checkbox
│   ├── Radio
│   ├── Switch
│   ├── Slider
│   ├── Progress
│   ├── Spinner
│   ├── Badge
│   ├── Avatar
│   ├── Icon
│   └── Typography
├── 布局组件
│   ├── Container
│   ├── Grid
│   ├── Flex
│   ├── Stack
│   ├── Card
│   ├── Panel
│   ├── Modal
│   ├── Drawer
│   └── SplitView
├── 反馈组件
│   ├── Alert
│   ├── Toast
│   ├── Notification
│   ├── Progress
│   ├── Loading
│   └── EmptyState
├── 导航组件
│   ├── Tabs
│   ├── Breadcrumb
│   ├── Pagination
│   ├── Menu
│   ├── Dropdown
│   └── Stepper
├── 数据展示组件
│   ├── Table
│   ├── List
│   ├── Tree
│   ├── Timeline
│   ├── Calendar
│   └── Kanban
├── 表单组件
│   ├── Form
│   ├── Field
│   ├── DatePicker
│   ├── TimePicker
│   ├── Upload
│   └── RichTextEditor
└── 业务组件
    ├── ChatMessage
    ├── ToolCard
    ├── MetricCard
    ├── WorkflowNode
    ├── InsightCard
    └── UserAvatar
```

---

## 基础组件

### Button 组件

#### 类型定义

```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ButtonRef extends HTMLButtonElement {
  focus: () => void;
  blur: () => void;
}
```

#### 组件实现

```tsx
import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Button = forwardRef<ButtonRef, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      onClick,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors';
    
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    };
    
    const sizeStyles = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-2.5 text-lg',
      xl: 'px-6 py-3 text-xl',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        onClick={onClick}
        style={style}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner size="sm" className="mr-2" />}
        {icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### 使用示例

```tsx
import { Button } from '@/components/Button';

export const Example = () => {
  return (
    <div className="space-y-4">
      <Button variant="primary" onClick={() => console.log('clicked')}>
        主要按钮
      </Button>
      
      <Button variant="secondary" size="sm">
        次要按钮
      </Button>
      
      <Button variant="danger" loading>
        加载中...
      </Button>
      
      <Button variant="success" icon={<Icon name="check" />}>
        成功
      </Button>
    </div>
  );
};
```

### Input 组件

#### 类型定义

```typescript
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onEnter?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface InputRef extends HTMLInputElement {
  focus: () => void;
  blur: () => void;
  select: () => void;
}
```

#### 组件实现

```tsx
import React, { forwardRef, useState } from 'react';
import { cn } from '@/utils/cn';

export const Input = forwardRef<InputRef, InputProps>(
  (
    {
      type = 'text',
      placeholder,
      value,
      defaultValue,
      disabled = false,
      error,
      helperText,
      icon,
      prefix,
      suffix,
      size = 'md',
      fullWidth = false,
      onChange,
      onFocus,
      onBlur,
      onEnter,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    
    const baseStyles = 'border rounded-lg transition-colors';
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-2.5 text-lg',
    };
    
    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : focused
      ? 'border-blue-500 focus:ring-blue-500'
      : 'border-gray-300 focus:ring-blue-500';
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onEnter?.();
      }
    };
    
    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {prefix}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          className={cn(
            baseStyles,
            sizeStyles[size],
            stateStyles,
            disabled && 'bg-gray-100 cursor-not-allowed',
            prefix && 'pl-10',
            suffix && 'pr-10',
            fullWidth && 'w-full',
            className
          )}
          onChange={handleChange}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.();
          }}
          onKeyDown={handleKeyDown}
          style={style}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />
        
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {suffix}
          </div>
        )}
        
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

#### 使用示例

```tsx
import { Input } from '@/components/Input';

export const Example = () => {
  const [value, setValue] = useState('');
  
  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="输入用户名"
        value={value}
        onChange={setValue}
        icon={<Icon name="user" />}
      />
      
      <Input
        type="email"
        placeholder="输入邮箱"
        error="邮箱格式不正确"
        helperText="我们将使用此邮箱发送通知"
      />
      
      <Input
        type="password"
        placeholder="输入密码"
        size="lg"
        fullWidth
        onEnter={() => console.log('Enter pressed')}
      />
    </div>
  );
};
```

### Select 组件

#### 类型定义

```typescript
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  onChange?: (value: string | string[]) => void;
  onSearch?: (query: string) => void;
  className?: string;
  style?: React.CSSProperties;
}
```

#### 使用示例

```tsx
import { Select } from '@/components/Select';

export const Example = () => {
  const options = [
    { value: 'option1', label: '选项 1' },
    { value: 'option2', label: '选项 2' },
    { value: 'option3', label: '选项 3' },
  ];
  
  return (
    <Select
      options={options}
      placeholder="请选择..."
      onChange={(value) => console.log(value)}
    />
  );
};
```

---

## 布局组件

### Card 组件

#### 类型定义

```typescript
export interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  hoverable?: boolean;
  loading?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
```

#### 组件实现

```tsx
import React from 'react';
import { cn } from '@/utils/cn';

export const Card = ({
  title,
  subtitle,
  actions,
  footer,
  variant = 'default',
  hoverable = false,
  loading = false,
  padding = 'md',
  children,
  className,
  style,
}: CardProps) => {
  const baseStyles = 'bg-white rounded-lg overflow-hidden';
  
  const variantStyles = {
    default: 'border border-gray-200',
    elevated: 'shadow-lg',
    outlined: 'border-2 border-gray-300',
  };
  
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hoverable && 'hover:shadow-xl transition-shadow',
        loading && 'opacity-50',
        className
      )}
      style={style}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      
      <div className={padding !== 'none' ? '' : paddingStyles[padding]}>
        {loading ? <Spinner /> : children}
      </div>
      
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
};
```

#### 使用示例

```tsx
import { Card } from '@/components/Card';

export const Example = () => {
  return (
    <Card
      title="AI助手"
      subtitle="智能对话助手"
      actions={<Button>设置</Button>}
      variant="elevated"
      hoverable
    >
      <ChatInterface />
    </Card>
  );
};
```

### Modal 组件

#### 类型定义

```typescript
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
```

#### 使用示例

```tsx
import { Modal } from '@/components/Modal';

export const Example = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开对话框</Button>
      
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="确认操作"
        size="md"
      >
        <p>确定要执行此操作吗？</p>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            确认
          </Button>
        </div>
      </Modal>
    </>
  );
};
```

---

## 反馈组件

### Alert 组件

#### 类型定义

```typescript
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}
```

#### 使用示例

```tsx
import { Alert } from '@/components/Alert';

export const Example = () => {
  return (
    <div className="space-y-4">
      <Alert variant="info" title="提示" description="这是一条提示信息" />
      
      <Alert variant="success" title="成功" description="操作成功完成" />
      
      <Alert variant="warning" title="警告" description="请注意此操作" closable />
      
      <Alert variant="error" title="错误" description="操作失败，请重试" />
    </div>
  );
};
```

### Toast 组件

#### 类型定义

```typescript
export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  variant?: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}
```

#### 使用示例

```tsx
import { toast } from '@/components/Toast';

export const Example = () => {
  const showToast = () => {
    toast.success({
      title: '成功',
      description: '操作成功完成',
      duration: 3000,
    });
  };
  
  return <Button onClick={showToast}>显示通知</Button>;
};
```

---

## 导航组件

### Tabs 组件

#### 类型定义

```typescript
export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### 使用示例

```tsx
import { Tabs } from '@/components/Tabs';

export const Example = () => {
  const tabs = [
    { id: 'chat', label: '聊天', icon: <Icon name="message" /> },
    { id: 'toolbox', label: '工具箱', icon: <Icon name="tool" /> },
    { id: 'insights', label: '洞察', icon: <Icon name="chart" /> },
  ];
  
  const [activeTab, setActiveTab] = useState('chat');
  
  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={setActiveTab}
    >
      {activeTab === 'chat' && <ChatInterface />}
      {activeTab === 'toolbox' && <ToolboxPanel />}
      {activeTab === 'insights' && <InsightsDashboard />}
    </Tabs>
  );
};
```

---

## 数据展示组件

### Table 组件

#### 类型定义

```typescript
export interface Column<T> {
  key: keyof T;
  title: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  className?: string;
}
```

#### 使用示例

```tsx
import { Table } from '@/components/Table';

export const Example = () => {
  const columns = [
    { key: 'name', title: '姓名', sortable: true },
    { key: 'email', title: '邮箱', filterable: true },
    { key: 'status', title: '状态', render: (value) => (
      <Badge variant={value === 'active' ? 'success' : 'warning'}>
        {value}
      </Badge>
    )},
  ];
  
  const data = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
    { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive' },
  ];
  
  return (
    <Table
      columns={columns}
      data={data}
      onRowClick={(row) => console.log(row)}
    />
  );
};
```

---

## 表单组件

### Form 组件

#### 类型定义

```typescript
export interface FieldProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export interface FormProps {
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onValuesChange?: (values: Record<string, any>) => void;
  children: React.ReactNode;
  className?: string;
}
```

#### 使用示例

```tsx
import { Form, Field } from '@/components/Form';

export const Example = () => {
  const handleSubmit = (values) => {
    console.log('Form submitted:', values);
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <Field name="username" label="用户名" required>
        <Input placeholder="输入用户名" />
      </Field>
      
      <Field name="email" label="邮箱" required>
        <Input type="email" placeholder="输入邮箱" />
      </Field>
      
      <Field name="password" label="密码" required>
        <Input type="password" placeholder="输入密码" />
      </Field>
      
      <Button type="submit">提交</Button>
    </Form>
  );
};
```

---

## 业务组件

### ChatMessage 组件

#### 类型定义

```typescript
export interface ChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onReaction?: (emoji: string) => void;
  onReply?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  className?: string;
}
```

#### 使用示例

```tsx
import { ChatMessage } from '@/components/ChatMessage';

export const Example = () => {
  const message = {
    id: '1',
    role: 'assistant' as const,
    content: '你好！我是AI助手，有什么可以帮助你的吗？',
    timestamp: Date.now(),
  };
  
  return (
    <ChatMessage
      message={message}
      onReaction={(emoji) => console.log('Reaction:', emoji)}
      onReply={() => console.log('Reply')}
      onCopy={() => console.log('Copy')}
    />
  );
};
```

### ToolCard 组件

#### 类型定义

```typescript
export interface ToolCardProps {
  tool: Tool;
  onClick?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  className?: string;
}
```

#### 使用示例

```tsx
import { ToolCard } from '@/components/ToolCard';

export const Example = () => {
  const tool = {
    id: 'tool-1',
    name: '数据分析',
    description: '强大的数据分析工具',
    icon: 'chart',
    category: 'analytics',
  };
  
  return (
    <ToolCard
      tool={tool}
      onClick={() => console.log('Tool clicked')}
      onFavorite={() => console.log('Tool favorited')}
    />
  );
};
```

---

## 样式系统

### 设计令牌

```typescript
export const designTokens = {
  colors: {
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
    },
    secondary: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
```

### CSS 变量

```css
:root {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  --border-radius-sm: 0.125rem;
  --border-radius-md: 0.25rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
  --border-radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 主题系统

### 主题定义

```typescript
export const lightTheme = {
  name: 'light',
  mode: 'light' as const,
  colors: {
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#1e293b',
    border: '#e5e7eb',
    primary: '#3b82f6',
    secondary: '#64748b',
  },
};

export const darkTheme = {
  name: 'dark',
  mode: 'dark' as const,
  colors: {
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    border: '#334155',
    primary: '#3b82f6',
    secondary: '#64748b',
  },
};
```

### 主题切换

```typescript
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(lightTheme);
  
  const toggleTheme = () => {
    setTheme(theme.mode === 'light' ? darkTheme : lightTheme);
  };
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.mode);
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);
  
  return { theme, toggleTheme, setTheme };
};
```

---

## 动画系统

### 动画定义

```typescript
export const animations = {
  fadeIn: {
    keyframes: `
      from { opacity: 0; }
      to { opacity: 1; }
    `,
    duration: '200ms',
    timingFunction: 'ease-in-out',
  },
  slideUp: {
    keyframes: `
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    `,
    duration: '300ms',
    timingFunction: 'ease-out',
  },
  scaleIn: {
    keyframes: `
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    `,
    duration: '200ms',
    timingFunction: 'ease-out',
  },
};
```

### 动画 Hook

```typescript
export const useAnimation = (animation: Animation) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const start = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), parseDuration(animation.duration));
  };
  
  return { isAnimating, start };
};
```

---

## 无障碍支持

### ARIA 属性

```typescript
export const useAria = () => {
  const announce = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };
  
  return { announce };
};
```

### 键盘导航

```typescript
export const useKeyboardNavigation = () => {
  const handleKeyDown = (e: KeyboardEvent, handlers: Record<string, () => void>) => {
    const handler = handlers[e.key];
    if (handler) {
      e.preventDefault();
      handler();
    }
  };
  
  return { handleKeyDown };
};
```

---

## 总结

YYC³ Portable Intelligent AI System 组件库设计遵循以下原则：

1. **一致性**：统一的视觉和交互语言
2. **可复用性**：高度可复用的组件
3. **可访问性**：符合 WCAG 2.1 AA 标准
4. **响应式**：适配所有设备尺寸
5. **性能**：快速响应和加载
6. **主题化**：支持多主题切换
7. **类型安全**：完整的 TypeScript 类型定义
8. **测试覆盖**：完整的单元测试和集成测试

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
