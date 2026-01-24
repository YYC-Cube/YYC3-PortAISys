#!/bin/bash

# 快速启动测试脚本
echo "🚀 YYC³ PortAISys - 快速测试启动"
echo ""

# 1. 验证实现
echo "1️⃣  验证实现完整性..."
pnpm tsx scripts/verify-implementation.ts
echo ""

# 检查验证结果
COMPLETION=$(cat test-reports/implementation-verification.json | grep -o '"overallCompletion":[0-9]*' | cut -d':' -f2)
echo "📊 总完成率: ${COMPLETION}%"
echo ""

if [ "$COMPLETION" -lt 85 ]; then
    echo "⚠️  完成率低于85%，建议先补充缺失文件"
    echo ""
fi

# 2. 快速单元测试
echo "2️⃣  运行快速单元测试..."
echo "   - 测试 Phase 1 核心算法"
pnpm vitest run tests/unit/algorithms --reporter=verbose || echo "   ⚠️  部分测试失败"

echo ""
echo "   - 测试 Phase 3 AI Agents"
pnpm vitest run tests/unit/ai --reporter=verbose || echo "   ⚠️  部分测试失败"

# 3. 关键集成测试
echo ""
echo "3️⃣  运行关键集成测试..."
pnpm vitest run tests/integration/ai-engine.test.ts tests/integration/plugin-system.test.ts --reporter=verbose || echo "   ⚠️  部分测试失败"

# 4. 检查测试覆盖率
echo ""
echo "4️⃣  生成测试覆盖率报告..."
pnpm vitest run --coverage --reporter=default || echo "   ⚠️  覆盖率生成失败"

echo ""
echo "✅ 快速测试完成！"
echo ""
echo "📋 后续步骤:"
echo "   - 运行完整测试: pnpm run test:all"
echo "   - 运行性能测试: pnpm run test:performance"
echo "   - 运行安全测试: pnpm run test:security"
echo "   - 运行E2E测试: pnpm run test:e2e"
echo "   - 运行全面测试: ./scripts/run-phase123-tests.sh"