#!/bin/bash

# YYC³ 综合测试执行脚本
# 依次运行所有测试并生成报告

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  YYC³ 系统综合测试套件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 创建测试报告目录
mkdir -p test-reports

# 1. 单元测试
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🧪 阶段 1/5: 运行单元测试${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pnpm test:unit; then
    echo -e "${GREEN}✅ 单元测试通过${NC}"
else
    echo -e "${RED}❌ 单元测试失败${NC}"
    exit 1
fi
echo ""

# 2. 集成测试
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🔗 阶段 2/5: 运行集成测试${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pnpm test:integration; then
    echo -e "${GREEN}✅ 集成测试通过${NC}"
else
    echo -e "${RED}❌ 集成测试失败${NC}"
    exit 1
fi
echo ""

# 3. 安全测试
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🔒 阶段 3/5: 运行安全测试${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pnpm test:security; then
    echo -e "${GREEN}✅ 安全测试通过${NC}"
else
    echo -e "${RED}❌ 安全测试失败${NC}"
    exit 1
fi
echo ""

# 4. 性能测试
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}⚡ 阶段 4/6: 运行性能测试${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pnpm test:performance; then
    echo -e "${GREEN}✅ 性能测试通过${NC}"
else
    echo -e "${RED}❌ 性能测试失败${NC}"
    exit 1
fi
echo ""

# 5. E2E测试
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}🌐 阶段 5/6: 运行端到端测试${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}💡 提示: 确保开发服务器正在运行或配置了webServer选项${NC}"
if pnpm test:e2e; then
    echo -e "${GREEN}✅ E2E测试通过${NC}"
else
    echo -e "${YELLOW}⚠️  E2E测试失败或跳过（可能需要启动服务器）${NC}"
    # E2E测试失败不中断整体流程
fi
echo ""

# 6. 测试覆盖率
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📊 阶段 6/6: 生成测试覆盖率报告${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pnpm test:coverage; then
    echo -e "${GREEN}✅ 覆盖率报告生成完成${NC}"
else
    echo -e "${YELLOW}⚠️  覆盖率报告生成失败（非致命错误）${NC}"
fi
echo ""

# 6. 生成综合测试报告
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📈 生成综合测试报告${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pnpm test:report; then
    echo -e "${GREEN}✅ 综合测试报告生成完成${NC}"
else
    echo -etest-reports/playwright/ (E2E测试报告)"
echo "   - coverage/index.html"
echo ""
echo "🌐 要查看HTML报告，运行:"
echo "   open test-reports/test-report.html"
echo "   open test-reports/playwright/index
# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 所有测试完成！${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 测试报告已保存在:"
echo "   - test-reports/test-report.json"
echo "   - test-reports/test-report.md"
echo "   - test-reports/test-report.html"
echo "   - coverage/index.html"
echo ""
echo "🌐 要查看HTML报告，运行:"
echo "   open test-reports/test-report.html"
echo "   open coverage/index.html"
echo ""
