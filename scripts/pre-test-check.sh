#!/bin/bash

echo "🔍 测试前检查..."
echo ""

# 1. 检查文件位置
echo "1️⃣  检查测试文件位置..."

if [ -f "tests/multi-model.test.ts" ]; then
    echo "   ⚠️  发现文件位置错误: tests/multi-model.test.ts"
    echo "   正在移动到正确位置..."
    mv tests/multi-model.test.ts tests/integration/multi-model.test.ts
    echo "   ✅ 已移动到: tests/integration/multi-model.test.ts"
fi

# 2. 验证所有必需文件存在
echo ""
echo "2️⃣  验证测试文件完整性..."

REQUIRED_FILES=(
    "tests/unit/adapters/OpenAIModelAdapter.test.ts"
    "tests/unit/adapters/OpenAIModelAdapter.stream.test.ts"
    "tests/unit/ai/AgentOrchestrator.test.ts"
    "tests/integration/ai-engine.test.ts"
    "tests/integration/multimodal.test.ts"
    "tests/integration/multi-model.test.ts"
    "tests/e2e/user-journey.test.ts"
)

MISSING_COUNT=0

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (缺失)"
        MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
done

echo ""
if [ $MISSING_COUNT -eq 0 ]; then
    echo "✅ 所有测试文件已就位！"
else
    echo "⚠️  发现 $MISSING_COUNT 个缺失文件"
    exit 1
fi

# 3. 检查依赖
echo ""
echo "3️⃣  检查测试依赖..."

if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules 不存在，正在安装..."
    pnpm install
fi

echo "   ✅ 依赖已安装"

# 4. 验证实现
echo ""
echo "4️⃣  验证实现完整性..."
pnpm tsx scripts/verify-implementation.ts

echo ""
echo "✅ 测试前检查完成！可以开始运行测试。"
echo ""
echo "📋 运行测试命令:"
echo "   pnpm run quick-test          # 快速测试"
echo "   pnpm run test:phase1         # Phase 1 测试"
echo "   pnpm run test:phase2         # Phase 2 测试"
echo "   pnpm run test:phase3         # Phase 3 测试"
echo "   pnpm run test:full           # 完整测试"