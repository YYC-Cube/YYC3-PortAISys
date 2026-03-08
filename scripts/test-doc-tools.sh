#!/bin/bash

# 文档管理工具测试脚本
# 测试文档同步和合规化功能

echo "🧪 开始测试文档管理工具..."
echo ""

# 检查Node.js版本
echo "📋 检查环境..."
node_version=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js 版本: $node_version"
else
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查npm版本
npm_version=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ npm 版本: $npm_version"
else
    echo "❌ npm 未安装"
    exit 1
fi

echo ""
echo "📁 检查文档目录..."

# 检查docs目录
if [ -d "docs" ]; then
    echo "✅ docs 目录存在"
    doc_count=$(find docs -name "*.md" | wc -l)
    echo "📊 文档数量: $doc_count"
else
    echo "❌ docs 目录不存在"
    exit 1
fi

echo ""
echo "🔍 检查工具脚本..."

# 检查文档同步工具
if [ -f "scripts/doc-sync-tool.ts" ]; then
    echo "✅ 文档同步工具存在: scripts/doc-sync-tool.ts"
else
    echo "❌ 文档同步工具不存在"
    exit 1
fi

# 检查文档合规化工具
if [ -f "scripts/doc-compliance-tool.ts" ]; then
    echo "✅ 文档合规化工具存在: scripts/doc-compliance-tool.ts"
else
    echo "❌ 文档合规化工具不存在"
    exit 1
fi

echo ""
echo "📋 检查package.json脚本..."

# 检查package.json中的脚本
if grep -q "docs:sync" package.json; then
    echo "✅ 文档同步脚本已配置: npm run docs:sync"
else
    echo "❌ 文档同步脚本未配置"
    exit 1
fi

if grep -q "docs:compliance" package.json; then
    echo "✅ 文档合规化脚本已配置: npm run docs:compliance"
else
    echo "❌ 文档合规化脚本未配置"
    exit 1
fi

if grep -q "docs:compliance:check" package.json; then
    echo "✅ 文档合规检查脚本已配置: npm run docs:compliance:check"
else
    echo "❌ 文档合规检查脚本未配置"
    exit 1
fi

if grep -q "docs:compliance:fix" package.json; then
    echo "✅ 文档合规修复脚本已配置: npm run docs:compliance:fix"
else
    echo "❌ 文档合规修复脚本未配置"
    exit 1
fi

echo ""
echo "📚 检查文档索引..."

# 检查文档索引总览
if [ -f "docs/文档索引总览.md" ]; then
    echo "✅ 文档索引总览存在: docs/文档索引总览.md"
else
    echo "❌ 文档索引总览不存在"
    exit 1
fi

# 检查目录映射总结
mapping_count=$(find docs -name "目录映射总结.md" | wc -l)
echo "📊 目录映射总结数量: $mapping_count"

echo ""
echo "📖 检查文档管理工具使用说明..."

if [ -f "docs/文档管理工具使用说明.md" ]; then
    echo "✅ 文档管理工具使用说明存在: docs/文档管理工具使用说明.md"
else
    echo "❌ 文档管理工具使用说明不存在"
    exit 1
fi

echo ""
echo "🔧 检查依赖..."

# 检查tsx依赖
if grep -q '"tsx"' package.json; then
    echo "✅ tsx 依赖已配置"
else
    echo "⚠️  tsx 依赖未配置 (需要安装才能运行工具)"
fi

echo ""
echo "📊 测试总结:"
echo "=========================================="
echo "✅ 环境检查通过"
echo "✅ 文档目录检查通过"
echo "✅ 工具脚本检查通过"
echo "✅ package.json脚本检查通过"
echo "✅ 文档索引检查通过"
echo "✅ 文档管理工具使用说明检查通过"
echo "=========================================="
echo ""
echo "🎉 所有基础检查通过！"
echo ""
echo "📝 使用说明:"
echo "  1. 安装依赖: npm install"
echo "  2. 同步文档: npm run docs:sync"
echo "  3. 检查合规性: npm run docs:compliance:check"
echo "  4. 修复合规性: npm run docs:compliance:fix"
echo ""
echo "📚 详细文档: docs/文档管理工具使用说明.md"
