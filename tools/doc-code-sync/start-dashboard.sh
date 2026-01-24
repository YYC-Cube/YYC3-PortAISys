#!/bin/bash

# YYC³ 文档同步工具 - 监控仪表板启动脚本

set -e

echo "🚀 YYC³ 文档同步工具 - 监控仪表板"
echo "======================================"
echo ""

# 进入工具目录
cd "$(dirname "$0")"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    exit 1
fi

# 创建日志目录
mkdir -p logs

# 启动监控仪表板
echo "📊 正在启动监控仪表板..."
echo ""
echo "仪表板功能:"
echo "  - 实时同步状态监控"
echo "  - 关键指标可视化"
echo "  - 告警信息展示"
echo "  - 历史数据查询"
echo ""
echo "📁 日志文件:"
echo "  - 仪表板日志: logs/dashboard.log"
echo ""
echo "🌐 访问地址:"
echo "  http://localhost:3101"
echo ""
echo "按 Ctrl+C 停止仪表板"
echo ""

# 启动仪表板（后台运行）
nohup node dist/index.js dashboard > logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!

# 保存PID
echo $DASHBOARD_PID > .dashboard.pid

# 等待几秒
sleep 3

# 检查服务是否正常启动
if [ -f ".dashboard.pid" ]; then
    CHECK_PID=$(cat .dashboard.pid)
    if kill -0 $CHECK_PID 2>/dev/null; then
        echo "✅ 监控仪表板已启动 (PID: $CHECK_PID)"
        echo ""
        echo "💡 提示:"
        echo "  - 在浏览器中访问 http://localhost:3101"
        echo "  - 查看日志: tail -f logs/dashboard.log"
        echo "  - 停止服务: kill $CHECK_PID 或 ./stop-dashboard.sh"
    else
        echo "❌ 监控仪表板启动失败"
        echo "请查看日志文件: logs/dashboard.log"
        rm -f .dashboard.pid
        exit 1
    fi
else
    echo "❌ 监控仪表板启动失败"
    exit 1
fi
