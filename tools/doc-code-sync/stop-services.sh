#!/bin/bash

# YYC³ 文档同步工具 - 停止监控服务脚本

set -e

echo "🛑 YYC³ 文档同步工具 - 停止监控服务"
echo "==================================="
echo ""

# 进入工具目录
cd "$(dirname "$0")"

# 停止监控服务
if [ -f ".monitor.pid" ]; then
    MONITOR_PID=$(cat .monitor.pid)
    if kill -0 $MONITOR_PID 2>/dev/null; then
        echo "🛑 正在停止监控服务 (PID: $MONITOR_PID)..."
        kill $MONITOR_PID
        
        # 等待进程结束
        for i in {1..10}; do
            if ! kill -0 $MONITOR_PID 2>/dev/null; then
                echo "✅ 监控服务已停止"
                break
            fi
            sleep 1
        done
        
        # 检查是否成功停止
        if kill -0 $MONITOR_PID 2>/dev/null; then
            echo "⚠️ 强制停止监控服务"
            kill -9 $MONITOR_PID
        fi
    else
        echo "⚠️ 监控服务未运行"
    fi
    
    rm -f .monitor.pid
else
    echo "⚠️ 未找到监控服务PID文件"
fi

# 停止仪表板服务
if [ -f ".dashboard.pid" ]; then
    DASHBOARD_PID=$(cat .dashboard.pid)
    if kill -0 $DASHBOARD_PID 2>/dev/null; then
        echo "🛑 正在停止仪表板服务 (PID: $DASHBOARD_PID)..."
        kill $DASHBOARD_PID
        
        # 等待进程结束
        for i in {1..10}; do
            if ! kill -0 $DASHBOARD_PID 2>/dev/null; then
                echo "✅ 仪表板服务已停止"
                break
            fi
            sleep 1
        done
        
        # 检查是否成功停止
        if kill -0 $DASHBOARD_PID 2>/dev/null; then
            echo "⚠️ 强制停止仪表板服务"
            kill -9 $DASHBOARD_PID
        fi
    else
        echo "⚠️ 仪表板服务未运行"
    fi
    
    rm -f .dashboard.pid
else
    echo "⚠️ 未找到仪表板服务PID文件"
fi

echo ""
echo "🏁 所有服务已停止"