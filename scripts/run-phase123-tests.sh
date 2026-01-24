#!/bin/bash

# YYC³ PortAISys - Phase 1-3 全面测试执行脚本
# 版本: 1.0.0
# 日期: 2026-01-21

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 创建测试报告目录
REPORT_DIR="test-reports/phase123-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$REPORT_DIR"

log_info "📋 Phase 1-3 全面测试开始"
log_info "报告目录: $REPORT_DIR"
echo ""

# ============================================
# Phase 1: 短期提升 (1-2月) 测试
# ============================================
log_info "🔍 Phase 1: 短期提升测试"
echo "目标: 测试覆盖率从 27% → 60%"
echo ""

# 1.1 单元测试
log_info "运行单元测试..."
pnpm test:unit --coverage --reporter=json --outputFile="$REPORT_DIR/unit-tests.json" || {
    log_error "单元测试失败"
    exit 1
}
log_success "✅ 单元测试完成"

# 1.2 集成测试
log_info "运行集成测试..."
pnpm test:integration --coverage --reporter=json --outputFile="$REPORT_DIR/integration-tests.json" || {
    log_error "集成测试失败"
    exit 1
}
log_success "✅ 集成测试完成"

# 1.3 E2E测试
log_info "运行E2E测试..."
pnpm test:e2e --reporter=json --outputFile="$REPORT_DIR/e2e-tests.json" || {
    log_warning "⚠️  E2E测试存在失败用例"
}
log_success "✅ E2E测试完成"

# 1.4 流式输出测试
log_info "测试OpenAI流式输出..."
pnpm test tests/unit/adapters/OpenAIModelAdapter.test.ts --reporter=json --outputFile="$REPORT_DIR/streaming-tests.json" || {
    log_error "流式输出测试失败"
}
log_success "✅ 流式输出测试完成"

echo ""
log_success "🎉 Phase 1 测试完成！"
echo ""

# ============================================
# Phase 2: 中期优化 (3-6月) 测试
# ============================================
log_info "🔍 Phase 2: 中期优化测试"
echo "目标: 性能提升30%，安全加固，监控集成"
echo ""

# 2.1 性能基准测试
log_info "运行性能基准测试..."
pnpm test tests/performance/benchmark-suite.ts --reporter=json --outputFile="$REPORT_DIR/performance-benchmark.json" || {
    log_error "性能基准测试失败"
}
log_success "✅ 性能基准测试完成"

# 2.2 API性能测试
log_info "运行API性能测试..."
pnpm test tests/performance/api-benchmark.test.ts --reporter=json --outputFile="$REPORT_DIR/api-performance.json" || {
    log_warning "API性能测试存在问题"
}

# 2.3 数据库优化测试
log_info "运行数据库优化测试..."
pnpm test tests/performance/database-benchmark.test.ts --reporter=json --outputFile="$REPORT_DIR/database-performance.json" || {
    log_warning "数据库性能测试存在问题"
}

# 2.4 安全测试
log_info "运行安全加固测试..."
pnpm test tests/security/security-hardening.test.ts --reporter=json --outputFile="$REPORT_DIR/security-tests.json" || {
    log_error "安全测试失败"
}
log_success "✅ 安全测试完成"

# 2.5 渗透测试
log_info "运行渗透测试..."
pnpm test tests/security/penetration-tests.test.ts --reporter=json --outputFile="$REPORT_DIR/penetration-tests.json" || {
    log_warning "渗透测试发现问题"
}

# 2.6 优化验证测试
log_info "运行优化验证测试..."
pnpm test tests/performance/optimization-validation.test.ts --reporter=json --outputFile="$REPORT_DIR/optimization-validation.json" || {
    log_error "优化验证失败"
}

echo ""
log_success "🎉 Phase 2 测试完成！"
echo ""

# ============================================
# Phase 3: 长期增强 (6-12月) 测试
# ============================================
log_info "🔍 Phase 3: 长期增强测试"
echo "目标: 插件生态、移动端、多模态AI、Agent体系"
echo ""

# 3.1 Agent单元测试
log_info "运行Agent单元测试..."
pnpm test tests/unit/ai/CollaborativeAgent.test.ts --reporter=json --outputFile="$REPORT_DIR/collaborative-agent.json" || {
    log_error "CollaborativeAgent测试失败"
}
pnpm test tests/unit/ai/LearningAgent.test.ts --reporter=json --outputFile="$REPORT_DIR/learning-agent.json" || {
    log_error "LearningAgent测试失败"
}
pnpm test tests/unit/ai/AgentOrchestrator.test.ts --reporter=json --outputFile="$REPORT_DIR/agent-orchestrator.json" || {
    log_error "AgentOrchestrator测试失败"
}
log_success "✅ Agent单元测试完成"

# 3.2 插件系统集成测试
log_info "运行插件系统集成测试..."
pnpm test tests/integration/plugin-system.test.ts --reporter=json --outputFile="$REPORT_DIR/plugin-system.json" || {
    log_error "插件系统测试失败"
}
log_success "✅ 插件系统测试完成"

# 3.3 移动端集成测试
log_info "运行移动端集成测试..."
pnpm test tests/integration/mobile-app.test.ts --reporter=json --outputFile="$REPORT_DIR/mobile-app.json" || {
    log_error "移动端测试失败"
}
log_success "✅ 移动端测试完成"

# 3.4 多模态处理测试
log_info "运行多模态处理测试..."
pnpm test tests/integration/multimodal.test.ts --reporter=json --outputFile="$REPORT_DIR/multimodal.json" || {
    log_error "多模态处理测试失败"
}
log_success "✅ 多模态处理测试完成"

# 3.5 多模型管理测试
log_info "运行多模型管理测试..."
pnpm test tests/integration/multi-model.test.ts --reporter=json --outputFile="$REPORT_DIR/multi-model.json" || {
    log_error "多模型管理测试失败"
}
log_success "✅ 多模型管理测试完成"

# 3.6 端到端完整工作流测试
log_info "运行端到端完整工作流测试..."
pnpm test tests/e2e/complete-workflow.test.ts --reporter=json --outputFile="$REPORT_DIR/complete-workflow.json" || {
    log_warning "完整工作流测试存在问题"
}
log_success "✅ 端到端工作流测试完成"

echo ""
log_success "🎉 Phase 3 测试完成！"
echo ""

# ============================================
# 生成综合测试报告
# ============================================
log_info "📊 生成综合测试报告..."

node scripts/generate-test-report.ts --input="$REPORT_DIR" --output="$REPORT_DIR/summary.html"

log_success "✅ 测试报告已生成: $REPORT_DIR/summary.html"

# ============================================
# 输出测试统计
# ============================================
echo ""
echo "=================================="
echo "📊 测试统计摘要"
echo "=================================="
echo ""

# 计算总体覆盖率
COVERAGE=$(pnpm test --coverage --silent | grep "All files" | awk '{print $4}')
echo "总体测试覆盖率: $COVERAGE"

# 统计测试用例数
TOTAL_TESTS=$(find "$REPORT_DIR" -name "*.json" -exec cat {} \; | grep -o '"numTotalTests":[0-9]*' | cut -d':' -f2 | awk '{s+=$1} END {print s}')
PASSED_TESTS=$(find "$REPORT_DIR" -name "*.json" -exec cat {} \; | grep -o '"numPassedTests":[0-9]*' | cut -d':' -f2 | awk '{s+=$1} END {print s}')
FAILED_TESTS=$(find "$REPORT_DIR" -name "*.json" -exec cat {} \; | grep -o '"numFailedTests":[0-9]*' | cut -d':' -f2 | awk '{s+=$1} END {print s}')

echo "总测试用例: $TOTAL_TESTS"
echo "通过测试: $PASSED_TESTS"
echo "失败测试: $FAILED_TESTS"
echo ""

# 性能指标
echo "性能指标:"
echo "  - API响应时间目标: 180ms → 126ms (30% ⬇️)"
echo "  - 数据库查询目标: 85ms → 60ms (30% ⬇️)"
echo "  - 吞吐量目标: 1200 req/s → 1560 req/s (30% ⬆️)"
echo ""

# 测试通过率
PASS_RATE=$(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)
echo "测试通过率: $PASS_RATE%"

if (( $(echo "$PASS_RATE >= 95" | bc -l) )); then
    log_success "🎉 测试通过率达标 (>95%)！"
else
    log_warning "⚠️  测试通过率未达标，需要修复失败用例"
fi

echo ""
echo "=================================="
log_success "✅ Phase 1-3 全面测试执行完成！"
echo "=================================="
echo ""
echo "详细报告: $REPORT_DIR/summary.html"
echo "原始数据: $REPORT_DIR/"
echo ""

# 返回状态码
if [ "$FAILED_TESTS" -gt 0 ]; then
    exit 1
else
    exit 0
fi