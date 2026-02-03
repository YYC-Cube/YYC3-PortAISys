# YYC³ PortAISys 构建流程指南

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| **文档名称** | YYC³ PortAISys 构建流程指南 |
| **文档版本** | v1.0.0 |
| **创建日期** | 2026-02-03 |
| **最后更新** | 2026-02-03 |
| **文档状态** | 📋 正式发布 |
| **作者** | YYC³ Team |

---

## 🎯 概述

本文档详细说明 YYC³ PortAISys 的构建流程，包括前端构建、后端构建、类型检查和优化策略。

---

## 🏗️ 构建架构

### 构建流程图

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   源代码      │───▶│  TypeScript  │───▶│   类型检查    │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   代码检查    │───▶│   单元测试    │───▶│   构建        │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   资源优化    │───▶│   代码分割    │───▶│   输出        │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 📦 构建脚本

### NPM Scripts

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:watch": "vite build --watch",
    "build:analyze": "vite build --mode analyze",
    "build:profile": "vite build --profile",
    "typecheck": "tsc --noEmit",
    "lint": "eslint core --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "clean": "rm -rf dist .next"
  }
}
```

---

## 🔧 TypeScript 构建

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["node"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./core/*"],
      "@tests/*": ["./tests/*"]
    }
  },
  "include": [
    "core/**/*",
    "tests/**/*",
    "scripts/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### 类型检查

```bash
# 类型检查
pnpm typecheck

# 类型检查（监听模式）
tsc --noEmit --watch

# 生成类型声明
tsc --emitDeclarationOnly
```

---

## 🎨 Vite 构建

### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',

    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },

    // 压缩配置
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // 块大小警告限制
    chunkSizeWarningLimit: 1000,
  },

  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './core'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },

  // 开发服务器
  server: {
    port: 3200,
    host: true,
    strictPort: true,
  },

  // 预览服务器
  preview: {
    port: 4173,
    host: true,
  },
});
```

---

## 🚀 Next.js 构建

### Dashboard 构建

```bash
# 进入 Dashboard 目录
cd web-dashboard

# 开发构建
pnpm build

# 生产构建
NODE_ENV=production pnpm build

# 分析构建
ANALYZE=true pnpm build
```

### Next.js 配置优化

```typescript
// web-dashboard/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 输出模式
  output: 'standalone',

  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 压缩
  compress: true,

  // 生产环境优化
  productionBrowserSourceMaps: false,

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 实验性功能
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;
```

---

## 🧪 构建前检查

### 预检查脚本

```bash
#!/bin/bash
# scripts/pre-build.sh

echo "🔍 构建前检查..."

# 1. 类型检查
echo "📝 类型检查..."
pnpm typecheck
if [ $? -ne 0 ]; then
    echo "❌ 类型检查失败"
    exit 1
fi

# 2. 代码检查
echo "🔍 ESLint检查..."
pnpm lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint检查失败"
    exit 1
fi

# 3. 单元测试
echo "🧪 运行单元测试..."
pnpm test:run
if [ $? -ne 0 ]; then
    echo "❌ 单元测试失败"
    exit 1
fi

echo "✅ 构建前检查完成！"
```

---

## 📊 构建分析

### Bundle 分析

```bash
# 安装分析工具
pnpm add -D rollup-plugin-visualizer

# 配置 Vite
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

### 构建统计

```typescript
// scripts/build-stats.ts
import fs from 'fs';
import path from 'path';

interface BuildStats {
  totalSize: number;
  totalFiles: number;
  largestFiles: Array<{ file: string; size: number }>;
}

function getBuildStats(outDir: string): BuildStats {
  let totalSize = 0;
  let totalFiles = 0;
  const files: Array<{ file: string; size: number }> = [];

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        const size = stats.size;
        totalSize += size;
        totalFiles++;
        files.push({ file: fullPath, size });
      }
    }
  }

  walkDir(outDir);

  files.sort((a, b) => b.size - a.size);

  return {
    totalSize,
    totalFiles,
    largestFiles: files.slice(0, 10),
  };
}

const stats = getBuildStats('./dist');
console.log('📊 构建统计:');
console.log(`总大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`总文件数: ${stats.totalFiles}`);
console.log('最大文件:');
stats.largestFiles.forEach(({ file, size }) => {
  console.log(`  ${file}: ${(size / 1024).toFixed(2)} KB`);
});
```

---

## ⚡ 构建优化

### 优化策略

#### 1. Tree Shaking

```typescript
// 确保使用 ES Modules
import { useState } from 'react';  // ✅ 正确
// const React = require('react');  // ❌ 错误

// 导入特定函数
import { debounce } from 'lodash-es';  // ✅ 正确
// import _ from 'lodash';            // ❌ 错误
```

#### 2. 代码分割

```typescript
// 动态导入
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 路由级别分割
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
```

#### 3. 压缩优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      format: {
        comments: false,
      },
    },
  },
});
```

---

## 🔄 增量构建

### 缓存配置

```typescript
// vite.config.ts
export default defineConfig({
  // 文件系统缓存
  cacheDir: '.vite_cache',

  // 构建缓存
  build: {
    // 启用源文件缓存
    cache: true,
  },
});
```

---

## 🚨 构建故障排查

### 常见问题

#### 问题 1: 内存溢出

**症状**: `JavaScript heap out of memory`

**解决方案**:
```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

#### 问题 2: 类型错误

**症状**: TypeScript 编译错误

**解决方案**:
```bash
# 清理缓存后重新构建
rm -rf .next dist node_modules/.vite
pnpm install
pnpm build
```

#### 问题 3: 循环依赖

**症状**: 构建警告或错误

**解决方案**:
```bash
# 使用循环依赖检查工具
pnpm add -D madge

# 检查循环依赖
npx madge --circular --extensions ts,tsx core/
```

---

## ✅ 构建验证

### 验证脚本

```bash
#!/bin/bash
# scripts/verify-build.sh

echo "🔍 验证构建..."

# 1. 检查输出目录
if [ ! -d "dist" ]; then
    echo "❌ 构建输出目录不存在"
    exit 1
fi

# 2. 检查关键文件
REQUIRED_FILES=(
    "dist/index.html"
    "dist/assets/index.js"
    "dist/assets/index.css"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少关键文件: $file"
        exit 1
    fi
done

# 3. 检查文件大小
MAX_SIZE=$((100 * 1024 * 1024))  # 100MB
BUILD_SIZE=$(du -sb dist | cut -f1)

if [ $BUILD_SIZE -gt $MAX_SIZE ]; then
    echo "⚠️  警告: 构建大小超过限制: $(($BUILD_SIZE / 1024 / 1024))MB"
fi

echo "✅ 构建验证完成！"
```

---

## 📚 相关文档

- [05-Docker容器化](./05-Docker容器化.md)
- [10-CI-CD流水线](./10-CI-CD流水线.md)

---

## 📞 联系方式

- **项目主页**: https://github.com/YYC-Cube/YYC3-PortAISys
- **问题反馈**: https://github.com/YYC-Cube/YYC3-PortAISys/issues
- **邮箱**: admin@0379.email

---

> **「万象归元于云枢 | 深栈智启新纪元」**
> **All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence**

Made with ❤️ by YYC³ Team
