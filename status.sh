#!/bin/bash

# Next.js Production Status Script
# 查看生产环境状态脚本

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="vscode-portfolio"
PID_FILE=".next/server.pid"
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/app.log"
BUILD_LOG="$LOG_DIR/build.log"

# 检查应用状态
check_status() {
    echo -e "${BLUE}=== $PROJECT_NAME 应用状态 ===${NC}"
    echo ""

    # 检查PID文件
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo -e "${GREEN}PID文件存在: $PID${NC}"

        # 检查进程是否运行
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 应用正在运行 (PID: $PID)${NC}"

            # 显示进程详细信息
            echo ""
            echo -e "${BLUE}进程详细信息:${NC}"
            ps -p $PID -o pid,ppid,cmd,etime,pcpu,pmem --no-headers

            # 检查端口占用情况
            echo ""
            echo -e "${BLUE}端口占用情况:${NC}"
            netstat -tlnp 2>/dev/null | grep ":3000 " || ss -tlnp 2>/dev/null | grep ":3000 "

        else
            echo -e "${RED}❌ 进程不存在 (PID: $PID)${NC}"
            echo -e "${YELLOW}PID文件可能已过期${NC}"
        fi
    else
        echo -e "${RED}❌ PID文件不存在${NC}"
        echo -e "${YELLOW}应用可能未运行${NC}"

        # 尝试查找相关进程
        echo ""
        echo -e "${BLUE}查找相关进程...${NC}"
        PIDS=$(ps aux | grep "npm start" | grep -v grep)
        if [ -n "$PIDS" ]; then
            echo -e "${YELLOW}发现以下相关进程:${NC}"
            echo "$PIDS"
        else
            echo -e "${GREEN}未发现相关进程${NC}"
        fi
    fi

    # 检查日志文件
    echo ""
    echo -e "${BLUE}日志文件状态:${NC}"
    if [ -f "$LOG_FILE" ]; then
        SIZE=$(du -h "$LOG_FILE" | cut -f1)
        MODIFIED=$(stat -c %y "$LOG_FILE" 2>/dev/null || stat -f %Sm "$LOG_FILE" 2>/dev/null)
        echo -e "${GREEN}✅ 应用日志: $LOG_FILE ($SIZE, 修改时间: $MODIFIED)${NC}"

        # 显示最后几行日志
        echo ""
        echo -e "${BLUE}最近5条日志:${NC}"
        tail -5 "$LOG_FILE"
    else
        echo -e "${RED}❌ 应用日志文件不存在: $LOG_FILE${NC}"
    fi

    if [ -f "$BUILD_LOG" ]; then
        SIZE=$(du -h "$BUILD_LOG" | cut -f1)
        MODIFIED=$(stat -c %y "$BUILD_LOG" 2>/dev/null || stat -f %Sm "$BUILD_LOG" 2>/dev/null)
        echo -e "${GREEN}✅ 构建日志: $BUILD_LOG ($SIZE, 修改时间: $MODIFIED)${NC}"
    else
        echo -e "${RED}❌ 构建日志文件不存在: $BUILD_LOG${NC}"
    fi

    # 检查目录结构
    echo ""
    echo -e "${BLUE}项目目录状态:${NC}"
    if [ -d ".next" ]; then
        echo -e "${GREEN}✅ .next 目录存在${NC}"
    else
        echo -e "${RED}❌ .next 目录不存在，项目可能未构建${NC}"
    fi

    if [ -d "$LOG_DIR" ]; then
        echo -e "${GREEN}✅ 日志目录存在: $LOG_DIR${NC}"
    else
        echo -e "${RED}❌ 日志目录不存在: $LOG_DIR${NC}"
    fi

    echo ""
}

# 显示实时日志
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BLUE}显示实时日志 (Ctrl+C 退出):${NC}"
        tail -f "$LOG_FILE"
    else
        echo -e "${RED}日志文件不存在: $LOG_FILE${NC}"
        exit 1
    fi
}

# 显示系统资源使用情况
show_resources() {
    echo -e "${BLUE}=== 系统资源使用情况 ===${NC}"
    echo ""

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${BLUE}进程 $PID 资源使用情况:${NC}"
            ps -p $PID -o pid,pcpu,pmem,rss,vsz --no-headers | awk '{printf "CPU: %.1f%%, 内存: %.1f%%, RSS: %s, VSZ: %s\n", $2, $3, $4, $5}'

            echo ""
            echo -e "${BLUE}详细资源信息:${NC}"
            top -p $PID -b -n 1 | tail -n +8
        else
            echo -e "${RED}进程不存在${NC}"
        fi
    else
        echo -e "${RED}PID文件不存在${NC}"
    fi

    echo ""
    echo -e "${BLUE}系统整体资源:${NC}"
    echo "内存使用:"
    free -h
    echo ""
    echo "磁盘使用:"
    df -h | grep -E "^/dev/" | head -5
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  status     显示应用状态 (默认)"
    echo "  logs       显示实时日志"
    echo "  resources  显示资源使用情况"
    echo "  help       显示此帮助信息"
    echo ""
    echo "相关脚本:"
    echo "  ./start.sh  启动应用"
    echo "  ./stop.sh   停止应用"
}

# 主程序
main() {
    case "${1:-status}" in
        "status")
            check_status
            ;;
        "logs")
            show_logs
            ;;
        "resources")
            show_resources
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"