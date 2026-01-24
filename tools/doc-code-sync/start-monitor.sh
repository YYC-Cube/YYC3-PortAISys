#!/bin/bash

# YYC³ 文档同步工具 - 监控服务启动脚本

set -e

echo "🚀 YYC³ 文档同步工具 - 监控服务"
echo "=================================="
echo ""

# 进入工具目录
cd "$(dirname "$0")"

# 检查配置文件
CONFIG_FILE="${1:-.doc-code-mapping-enhanced.json}"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 错误: 配置文件不存在: $CONFIG_FILE"
    echo "💡 提示: 运行 './init.sh' 创建配置文件"
    exit 1
fi

echo "✅ 使用配置文件: $CONFIG_FILE"
echo ""

# 创建日志目录
mkdir -p logs

# 启动监控服务
echo "👀 正在启动监控服务..."
echo "📊 监控指标:"
echo "   - 同步成功率 (阈值: 警告 95%, 严重 90%)"
echo "   - 同步延迟 (阈值: 警告 5s, 严重 10s)"
echo "   - 同步吞吐量 (阈值: 警告 50文件/分钟, 严重 30文件/分钟)"
echo "   - 错误率 (阈值: 警告 5%, 严重 10%)"
echo "   - 系统资源 (CPU: 警告 70%, 严重 85%)"
echo "   - 系统资源 (内存: 警告 80%, 严重 90%)"
echo "   - 系统资源 (磁盘: 警告 80%, 严重 90%)"
echo ""
echo "📁 日志文件:"
echo "   - 监控日志: logs/monitor.log"
echo "   - 告警日志: logs/alerts.log"
echo "   - 同步日志: logs/sync.log"
echo ""
echo "按 Ctrl+C 停止监控服务"
echo ""

# 启动监控（后台运行）
nohup node dist/index.js watch --config "$CONFIG_FILE" > logs/monitor.log 2>&1 &
MONITOR_PID=$!

echo "✅ 监控服务已启动 (PID: $MONITOR_PID)"
echo ""

# 保存PID
echo $MONITOR_PID > .monitor.pid

# 等待几秒，检查服务是否正常启动
sleep 3

# 检查进程是否存在
if [ -f ".monitor.pid" ]; then
    CHECK_PID=$(cat .monitor.pid)
    if kill -0 $CHECK_PID 2>/dev/null; then
        echo "✅ 监控服务运行正常"
        echo ""
        echo "📊 实时监控命令:"
        echo "   tail -f logs/monitor.log  # 查看监控日志"
        echo "   tail -f logs/alerts.log   # 查看告警日志"
        echo "   tail -f logs/sync.log     # 查看同步日志"
        echo ""
        echo "🛑 停止监控服务:"
        echo "   kill $CHECK_PID"
        echo "   或运行: ./stop-monitor.sh"
    else
        echo "❌ 监控服务启动失败"
        echo "请查看日志文件: logs/monitor.log"
        rm -f .monitor.pid
        exit 1
    fi
else
    echo "❌ 监控服务启动失败"
    echo "请查看日志文件: logs/monitor.log"
    exit 1
fi
