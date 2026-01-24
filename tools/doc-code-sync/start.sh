#!/bin/bash

# YYC³ 文档与代码双向同步工具 - 启动脚本

set -e

echo "🚀 YYC³ 文档与代码双向同步工具"
echo "================================"
echo ""

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

# 进入工具目录
cd "$(dirname "$0")"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    echo "✅ 依赖安装完成"
    echo ""
fi

# 检查是否已构建
if [ ! -d "dist" ]; then
    echo "🔨 正在构建项目..."
    npm run build
    echo "✅ 项目构建完成"
    echo ""
fi

# 启动监控
echo "👀 正在启动文件监控..."
echo "按 Ctrl+C 停止监控"
echo ""

node dist/index.js watch "$@"
