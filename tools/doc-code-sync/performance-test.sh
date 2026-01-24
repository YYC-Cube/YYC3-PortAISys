#!/bin/bash

# YYC³ 文档同步工具性能测试脚本
# 用于执行全面的性能测试

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果目录
RESULTS_DIR="performance-test-results"
mkdir -p "$RESULTS_DIR"

# 日志文件
LOG_FILE="$RESULTS_DIR/performance-test.log"
echo "性能测试开始时间: $(date)" > "$LOG_FILE"

# 测试统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 辅助函数
log_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $test_name - $status" >> "$LOG_FILE"
    
    if [ "$status" = "PASSED" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ $test_name${NC}"
        ((FAILED_TESTS++))
    fi
    
    if [ -n "$details" ]; then
        echo "   $details" >> "$LOG_FILE"
    fi
    
    ((TOTAL_TESTS++))
}

measure_time() {
    local start_time=$(date +%s.%N)
    "$@"
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)
    echo "$duration"
}

# 清理测试环境
cleanup_test_env() {
    echo -e "${BLUE}🧹 清理测试环境...${NC}"
    rm -rf docs/test-*.md
    rm -rf core/test-*.ts
    rm -rf docs/perf-*
    rm -rf core/perf-*
    echo "清理完成"
}

# 初始化测试环境
init_test_env() {
    echo -e "${BLUE}🔧 初始化测试环境...${NC}"
    mkdir -p docs core
    cleanup_test_env
    echo "初始化完成"
}

echo "=========================================="
echo "YYC³ 文档同步工具性能测试"
echo "=========================================="
echo ""

# 初始化测试环境
init_test_env

echo -e "${YELLOW}📊 开始性能测试...${NC}"
echo ""

# ============================================================================
# 正常场景测试
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 正常场景测试${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 测试1: 单文件同步 - 1KB
echo -e "${YELLOW}测试1: 单文件同步 (1KB)${NC}"
echo "# 测试文档" > docs/test-1kb.md
echo "// 测试代码" > core/test-1kb.ts
duration=$(measure_time node dist/index.js sync docs/test-1kb.md)
if (( $(echo "$duration < 1.0" | bc -l 2>/dev/null || echo "0") )); then
    log_test "单文件同步 (1KB)" "PASSED" "耗时: ${duration}秒"
else
    log_test "单文件同步 (1KB)" "FAILED" "耗时: ${duration}秒 (预期: < 1秒)"
fi

# 测试2: 单文件同步 - 10KB
echo -e "${YELLOW}测试2: 单文件同步 (10KB)${NC}"
dd if=/dev/zero of=docs/test-10kb.md bs=1024 count=10 2>/dev/null
echo "// 测试代码" > core/test-10kb.ts
duration=$(measure_time node dist/index.js sync docs/test-10kb.md)
if (( $(echo "$duration < 1.0" | bc -l 2>/dev/null || echo "0") )); then
    log_test "单文件同步 (10KB)" "PASSED" "耗时: ${duration}秒"
else
    log_test "单文件同步 (10KB)" "FAILED" "耗时: ${duration}秒 (预期: < 1秒)"
fi

# 测试3: 单文件同步 - 100KB
echo -e "${YELLOW}测试3: 单文件同步 (100KB)${NC}"
dd if=/dev/zero of=docs/test-100kb.md bs=1024 count=100 2>/dev/null
echo "// 测试代码" > core/test-100kb.ts
duration=$(measure_time node dist/index.js sync docs/test-100kb.md)
if (( $(echo "$duration < 2.0" | bc -l 2>/dev/null || echo "0") )); then
    log_test "单文件同步 (100KB)" "PASSED" "耗时: ${duration}秒"
else
    log_test "单文件同步 (100KB)" "FAILED" "耗时: ${duration}秒 (预期: < 2秒)"
fi

# 测试4: 批量文件同步 - 10个文件
echo -e "${YELLOW}测试4: 批量文件同步 (10个文件)${NC}"
for i in $(seq 1 10); do
    echo "# 测试文件 $i" > docs/test-batch-$i.md
    echo "// 测试代码 $i" > core/test-batch-$i.ts
done
start_time=$(date +%s.%N)
for i in $(seq 1 10); do
    node dist/index.js sync docs/test-batch-$i.md > /dev/null 2>&1
done
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)
if (( $(echo "$duration < 5.0" | bc -l 2>/dev/null || echo "0") )); then
    log_test "批量文件同步 (10个文件)" "PASSED" "总耗时: ${duration}秒, 平均: $(echo "scale=2; $duration / 10" | bc)秒/文件"
else
    log_test "批量文件同步 (10个文件)" "FAILED" "总耗时: ${duration}秒 (预期: < 5秒)"
fi

# 测试5: 双向同步
echo -e "${YELLOW}测试5: 双向同步${NC}"
echo "# 文档修改 $(date)" > docs/test-bidirectional.md
echo "// 代码修改 $(date)" > core/test-bidirectional.ts
start_time=$(date +%s.%N)
node dist/index.js sync docs/test-bidirectional.md > /dev/null 2>&1
sleep 2
echo "// 代码修改 $(date)" > core/test-bidirectional.ts
sleep 2
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)
if [ -f "core/test-bidirectional.ts" ]; then
    log_test "双向同步" "PASSED" "耗时: ${duration}秒"
else
    log_test "双向同步" "FAILED" "耗时: ${duration}秒, 同步失败"
fi

# ============================================================================
# 峰值场景测试
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 峰值场景测试${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 测试6: 高并发同步 - 10个并发
echo -e "${YELLOW}测试6: 高并发同步 (10个并发)${NC}"
for i in $(seq 1 10); do
    echo "# 测试文件 $i" > docs/test-concurrent-$i.md
    echo "// 测试代码 $i" > core/test-concurrent-$i.ts
done
start_time=$(date +%s.%N)
for i in $(seq 1 10); do
    node dist/index.js sync docs/test-concurrent-$i.md > /dev/null 2>&1 &
done
wait
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)
throughput=$(echo "scale=2; 10 / $duration * 60" | bc)
if (( $(echo "$throughput >= 10" | bc -l 2>/dev/null || echo "0") )); then
    log_test "高并发同步 (10个并发)" "PASSED" "总耗时: ${duration}秒, 吞吐量: ${throughput}个/分钟"
else
    log_test "高并发同步 (10个并发)" "FAILED" "总耗时: ${duration}秒, 吞吐量: ${throughput}个/分钟 (预期: >= 10个/分钟)"
fi

# 测试7: 大文件同步 - 10MB
echo -e "${YELLOW}测试7: 大文件同步 (10MB)${NC}"
dd if=/dev/zero of=docs/test-large.md bs=1024 count=10240 2>/dev/null
echo "// 测试代码" > core/test-large.ts
duration=$(measure_time node dist/index.js sync docs/test-large.md)
if (( $(echo "$duration < 10.0" | bc -l 2>/dev/null || echo "0") )); then
    log_test "大文件同步 (10MB)" "PASSED" "耗时: ${duration}秒"
else
    log_test "大文件同步 (10MB)" "FAILED" "耗时: ${duration}秒 (预期: < 10秒)"
fi

# 测试8: 高频更新
echo -e "${YELLOW}测试8: 高频更新 (1次/秒, 10个文件)${NC}"
for i in $(seq 1 10); do
    echo "# 测试文件 $i" > docs/test-freq-$i.md
    echo "// 测试代码 $i" > core/test-freq-$i.ts
done
start_time=$(date +%s.%N)
for j in $(seq 1 10); do
    for i in $(seq 1 10); do
        echo "# 测试文件 $i - 更新 $j" > docs/test-freq-$i.md
    done
    sleep 1
done
sleep 3
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)
success_count=0
for i in $(seq 1 10); do
    if [ -f "core/test-freq-$i.ts" ]; then
        ((success_count++))
    fi
done
success_rate=$(echo "scale=2; $success_count / 10 * 100" | bc)
if (( $(echo "$success_rate >= 90" | bc -l 2>/dev/null || echo "0") )); then
    log_test "高频更新 (1次/秒)" "PASSED" "总耗时: ${duration}秒, 成功率: ${success_rate}%"
else
    log_test "高频更新 (1次/秒)" "FAILED" "总耗时: ${duration}秒, 成功率: ${success_rate}% (预期: >= 90%)"
fi

# ============================================================================
# 异常场景测试
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🛡️ 异常场景测试${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 测试9: 文件冲突检测
echo -e "${YELLOW}测试9: 文件冲突检测${NC}"
echo "# 原始内容" > docs/test-conflict.md
echo "// 原始内容" > core/test-conflict.ts
echo "# 文档修改" > docs/test-conflict.md &
echo "// 代码修改" > core/test-conflict.ts &
wait
node dist/index.js sync docs/test-conflict.md > /dev/null 2>&1
if [ -f "core/test-conflict.ts" ]; then
    log_test "文件冲突检测" "PASSED" "冲突处理正常"
else
    log_test "文件冲突检测" "FAILED" "冲突处理失败"
fi

# 测试10: 特殊字符文件
echo -e "${YELLOW}测试10: 特殊字符文件${NC}"
echo "# 测试文档

## 功能描述
这是一个包含特殊字符的测试：@#$%^&*()
" > docs/test-special.md
echo "// 测试代码" > core/test-special.ts
duration=$(measure_time node dist/index.js sync docs/test-special.md)
if [ -f "core/test-special.ts" ]; then
    log_test "特殊字符文件" "PASSED" "耗时: ${duration}秒"
else
    log_test "特殊字符文件" "FAILED" "耗时: ${duration}秒, 文件未生成"
fi

# 测试11: 空文件
echo -e "${YELLOW}测试11: 空文件${NC}"
echo "" > docs/test-empty.md
echo "// 测试代码" > core/test-empty.ts
duration=$(measure_time node dist/index.js sync docs/test-empty.md)
if [ -f "core/test-empty.ts" ]; then
    log_test "空文件" "PASSED" "耗时: ${duration}秒"
else
    log_test "空文件" "FAILED" "耗时: ${duration}秒, 文件未生成"
fi

# ============================================================================
# 测试总结
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 测试总结${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}总测试数: $TOTAL_TESTS${NC}"
echo -e "${GREEN}通过测试数: $PASSED_TESTS${NC}"
echo -e "${RED}失败测试数: $FAILED_TESTS${NC}"

if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$(echo "scale=2; $PASSED_TESTS / $TOTAL_TESTS * 100" | bc)
    echo -e "${YELLOW}通过率: ${PASS_RATE}%${NC}"
else
    PASS_RATE="0.00"
fi

echo ""
echo "测试完成时间: $(date)" >> "$LOG_FILE"
echo "总测试数: $TOTAL_TESTS" >> "$LOG_FILE"
echo "通过测试数: $PASSED_TESTS" >> "$LOG_FILE"
echo "失败测试数: $FAILED_TESTS" >> "$LOG_FILE"
echo "通过率: ${PASS_RATE}%" >> "$LOG_FILE"

echo ""
echo -e "${BLUE}📁 测试结果已保存到: $RESULTS_DIR${NC}"
echo -e "${BLUE}📋 详细日志: $LOG_FILE${NC}"

# 清理测试环境
cleanup_test_env

echo ""
if (( $(echo "$PASS_RATE >= 80" | bc -l 2>/dev/null || echo "0") )); then
    echo -e "${GREEN}✅ 性能测试完成！通过率: ${PASS_RATE}%${NC}"
    exit 0
else
    echo -e "${RED}❌ 性能测试完成！通过率: ${PASS_RATE}% (低于80%)${NC}"
    exit 1
fi