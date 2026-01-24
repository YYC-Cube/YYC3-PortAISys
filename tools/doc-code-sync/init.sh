#!/bin/bash

# YYC³ 文档与代码双向同步工具 - 初始化脚本

set -e

echo "🚀 YYC³ 文档与代码双向同步工具 - 初始化"
echo "========================================"
echo ""

# 进入工具目录
cd "$(dirname "$0")"

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js 18.0.0 或更高版本"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: Node.js 版本过低，当前版本: $(node -v)，要求版本: 18.0.0 或更高"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node -v)"
echo ""

# 安装依赖
echo "📦 正在安装依赖..."
npm install
echo "✅ 依赖安装完成"
echo ""

# 构建项目
echo "🔨 正在构建项目..."
npm run build
echo "✅ 项目构建完成"
echo ""

# 初始化配置
echo "⚙️  正在初始化配置..."

# 检查并创建必要的目录
if [ ! -d "docs" ]; then
    echo "📁 创建 docs 目录..."
    mkdir -p docs
fi

if [ ! -d "core" ]; then
    echo "📁 创建 core 目录..."
    mkdir -p core
fi

node dist/index.js init "$@"
echo ""

echo "✅ 初始化完成！"
echo ""
echo "💡 提示:"
echo "  - 运行 './start.sh' 启动文件监控"
echo "  - 运行 'npm link' 全局安装工具"
echo "  - 运行 'yyc3-doc-sync --help' 查看帮助信息"
