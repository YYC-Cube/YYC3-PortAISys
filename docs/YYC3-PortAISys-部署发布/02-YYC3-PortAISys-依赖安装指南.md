# YYC³ PortAISys 依赖安装指南

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| **文档名称** | YYC³ PortAISys 依赖安装指南 |
| **文档版本** | v1.0.0 |
| **创建日期** | 2026-02-03 |
| **最后更新** | 2026-02-03 |
| **文档状态** | 📋 正式发布 |
| **作者** | YYC³ Team |

---

## 🎯 概述

本文档详细说明 YYC³ PortAISys 的所有依赖项安装方法，包括系统依赖、NPM 依赖和开发依赖。

---

## 📦 项目依赖结构

```
yyc3-Portable-Intelligent-AI-System/
├── package.json              # 主项目依赖
├── pnpm-lock.yaml            # 依赖锁定文件
├── web-dashboard/
│   ├── package.json          # Web Dashboard依赖
│   └── pnpm-lock.yaml        # Dashboard依赖锁定
└── tools/
    └── doc-code-sync/
        └── package.json      # 文档同步工具依赖
```

---

## 🔧 系统依赖

### 必需系统依赖

| 依赖 | 版本要求 | 安装命令 | 用途 |
|------|----------|----------|------|
| **Node.js** | >= 20.19.0 | 见环境准备指南 | 运行时环境 |
| **pnpm** | >= 8.0.0 | `npm install -g pnpm` | 包管理器 |
| **PostgreSQL** | >= 15.0 | 见环境准备指南 | 数据库 |
| **Redis** | >= 7.0 | 见环境准备指南 | 缓存 |

### 可选系统依赖

| 依赖 | 版本要求 | 安装命令 | 用途 |
|------|----------|----------|------|
| **Docker** | Latest | 见环境准备指南 | 容器化部署 |
| **Git** | >= 2.30 | 系统包管理器 | 版本控制 |
| **Make** | Latest | 系统包管理器 | 构建工具 |

---

## 📥 NPM 依赖安装

### 主项目依赖

```bash
# 1. 进入项目根目录
cd /path/to/yyc3-Portable-Intelligent-AI-System

# 2. 安装所有依赖（推荐）
pnpm install

# 3. 或者分别安装各部分依赖
pnpm install                  # 主项目依赖
cd web-dashboard && pnpm install  # Dashboard依赖
cd ../tools/doc-code-sync && pnpm install  # 工具依赖
```

### 依赖分类

#### 生产依赖

```json
{
  "dependencies": {
    // OpenTelemetry - 可观测性
    "@opentelemetry/api": "^1.9.0",
    "@opentelemetry/auto-instrumentations-node": "^0.69.0",
    "@opentelemetry/exporter-trace-otlp-http": "^0.211.0",
    "@opentelemetry/resources": "^2.5.0",
    "@opentelemetry/sdk-node": "^0.211.0",
    "@opentelemetry/semantic-conventions": "^1.39.0",

    // 数据库
    "@prisma/client": "^7.0.0",

    // UI 组件
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-slot": "^1.0.2",

    // 认证与加密
    "bcrypt": "^5.1.1",

    // 缓存
    "ioredis": "^5.3.2",
    "redis": "^4.6.0",

    // 框架
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",

    // 工具
    "tailwindcss": "^4.0.0",
    "tsx": "^4.21.0",
    "typescript": "^5.3.2"
  }
}
```

#### Web Dashboard 依赖

```json
{
  "dependencies": {
    // 表单处理
    "@hookform/resolvers": "^5.2.2",
    "react-hook-form": "^7.71.1",

    // 数据库
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "^7.2.0",

    // UI 组件
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toast": "^1.2.15",
    "@radix-ui/react-tooltip": "^1.2.8",

    // 认证
    "bcryptjs": "^3.0.3",
    "next-auth": "5.0.0-beta.30",

    // 样式
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",

    // 工具
    "lucide-react": "^0.562.0",
    "recharts": "^3.6.0",
    "swr": "^2.3.8",
    "zod": "^4.3.5",
    "zustand": "^5.0.10"
  }
}
```

#### 开发依赖

```json
{
  "devDependencies": {
    // 测试框架
    "@playwright/test": "^1.40.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "vitest": "^1.0.0",
    "jsdom": "^27.4.0",

    // 代码质量
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    "prettier": "^3.1.0",

    // 构建工具
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",

    // 类型定义
    "@types/bcrypt": "^5.0.2",
    "@types/glob": "^9.0.0",
    "@types/node": "^20.10.0",
    "@types/uuid": "^9.0.7",

    // Prisma
    "prisma": "^7.0.0",

    // 其他
    "glob": "^13.0.0"
  }
}
```

---

## 🔄 依赖管理

### 更新依赖

```bash
# 检查过期依赖
pnpm outdated

# 更新所有依赖（交互式）
pnpm update -i

# 更新特定依赖
pnpm update package-name

# 更新到最新版本
pnpm update package-name@latest

# 更新主版本
pnpm update package-name@major
```

### 清理依赖

```bash
# 清理未使用的依赖
pnpm prune

# 删除 node_modules 和重新安装
rm -rf node_modules
pnpm install

# 清理所有项目的 node_modules
pnpm -r exec rm -rf node_modules
pnpm install
```

### 查看依赖

```bash
# 列出所有依赖
pnpm list

# 列出顶层依赖
pnpm list --depth=0

# 查看特定依赖信息
pnpm info package-name

# 查看依赖树
pnpm list --depth=Infinity
```

---

## 🔐 安全依赖

### 依赖安全扫描

```bash
# 使用 Snyk 扫描（需要先安装）
npm install -g snyk
snyk auth
snyk test
snyk monitor

# 使用 npm audit
pnpm audit

# 修复漏洞
pnpm audit fix

# 强制修复（可能破坏兼容性）
pnpm audit fix --force
```

### Dependabot 配置

```yaml
# .github/dependabot.yml
version: 2
dependencies:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "yyc3-team"
    labels:
      - "dependencies"
      - "security"

  - package-ecosystem: "npm"
    directory: "/web-dashboard"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

---

## 🐛 常见问题

### 问题 1: 依赖安装失败

**症状**: `pnpm install` 执行失败

**解决方案**:
```bash
# 1. 清理缓存
pnpm store prune

# 2. 删除 lock 文件重新安装
rm pnpm-lock.yaml
pnpm install

# 3. 使用镜像源
pnpm config set registry https://registry.npmmirror.com
```

### 问题 2: Node.js 版本不兼容

**症状**: 运行时报错 "Unsupported engine"

**解决方案**:
```bash
# 使用 nvm 切换 Node.js 版本
nvm install 20
nvm use 20

# 验证版本
node -v
```

### 问题 3: Peer依赖警告

**症状**: 安装时出现 peer dependency 警告

**解决方案**:
```bash
# 自动安装 peer dependencies
pnpm install --strict-peer-dependencies=false

# 或手动安装缺失的 peer dependencies
pnpm add missing-package
```

### 问题 4: 权限错误

**症状**: EACCES 权限错误

**解决方案**:
```bash
# macOS/Linux: 修复 npm 全局目录权限
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# 或使用 sudo（不推荐）
sudo pnpm install
```

---

## 📊 依赖分析

### 依赖大小分析

```bash
# 安装分析工具
pnpm add -D cost-of-modules

# 分析依赖大小
pnpm cost

# 或者使用 npx
npx cost
```

### 依赖关系图

```bash
# 安装依赖关系分析工具
pnpm add -D depcheck

# 检查未使用的依赖
npx depcheck

# 检查重复依赖
pnpm list --depth=Infinity | grep -E "^\S+.*\d{1,}.*\d{1,}"
```

---

## ✅ 安装验证

### 验证脚本

```bash
#!/bin/bash
# verify-dependencies.sh

echo "🔍 验证依赖安装..."

# 检查 node_modules
if [ -d "node_modules" ]; then
    echo "✅ node_modules 存在"
else
    echo "❌ node_modules 不存在"
    exit 1
fi

# 检查关键依赖
check_dependency() {
    if pnpm list $1 > /dev/null 2>&1; then
        echo "✅ $1 已安装"
    else
        echo "❌ $1 未安装"
        exit 1
    fi
}

check_dependency "next"
check_dependency "react"
check_dependency "@prisma/client"
check_dependency "typescript"

# 尝试构建
echo "🔨 尝试构建..."
pnpm build
if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

echo "🎉 依赖验证完成！"
```

---

## 📚 相关文档

- [01-环境准备指南](./01-环境准备指南.md)
- [03-配置管理指南](./03-配置管理指南)

---

## 📞 联系方式

- **项目主页**: https://github.com/YYC-Cube/YYC3-PortAISys
- **问题反馈**: https://github.com/YYC-Cube/YYC3-PortAISys/issues
- **邮箱**: admin@0379.email

---

> **「万象归元于云枢 | 深栈智启新纪元」**
> **All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence**

Made with ❤️ by YYC³ Team
