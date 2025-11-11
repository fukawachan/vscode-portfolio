#!/bin/bash

# Next.js Production Stop Script
# 停止生产环境脚本

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="vscode-portfolio"
PID_FILE=".next/server.pid"
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/app.log"

# 停止应用
stop_app() {
    echo -e "${YELLOW}正在停止 $PROJECT_NAME...${NC}"

    if [ ! -f "$PID_FILE" ]; then
        echo -e "${RED}PID文件不存在，应用可能未运行${NC}"
        echo -e "${YELLOW}尝试查找相关进程...${NC}"

        # 尝试查找npm start进程
        PIDS=$(ps aux | grep "npm start" | grep -v grep | awk '{print $2}')
        if [ -n "$PIDS" ]; then
            echo -e "${YELLOW}找到相关进程，正在停止...${NC}"
            echo "$PIDS" | xargs kill -TERM
            sleep 2

            # 强制杀死仍在运行的进程
            PIDS=$(ps aux | grep "npm start" | grep -v grep | awk '{print $2}')
            if [ -n "$PIDS" ]; then
                echo -e "${YELLOW}强制停止残留进程...${NC}"
                echo "$PIDS" | xargs kill -9
            fi
            echo -e "${GREEN}应用已停止${NC}"
        else
            echo -e "${RED}未找到相关进程${NC}"
        fi
        return 1
    fi

    PID=$(cat "$PID_FILE")

    # 检查进程是否存在
    if ! ps -p $PID > /dev/null 2>&1; then
        echo -e "${RED}进程 (PID: $PID) 不存在${NC}"
        rm -f "$PID_FILE"
        return 1
    fi

    # 发送TERM信号优雅停止
    echo -e "${YELLOW}发送停止信号到进程 $PID...${NC}"
    kill -TERM $PID

    # 等待进程停止
    echo -e "${YELLOW}等待进程停止...${NC}"
    for i in {1..10}; do
        if ! ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 应用已成功停止${NC}"
            rm -f "$PID_FILE"

            # 记录停止日志
            TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
            if [ -f "$LOG_FILE" ]; then
                echo "[$TIMESTAMP] 应用已停止 (PID: $PID)" >> "$LOG_FILE"
            fi
            return 0
        fi
        sleep 1
        echo -n "."
    done
    echo ""

    # 如果进程仍在运行，强制停止
    echo -e "${YELLOW}进程未响应TERM信号，强制停止...${NC}"
    kill -9 $PID

    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${RED}❌ 无法停止进程 $PID${NC}"
        return 1
    else
        echo -e "${GREEN}✅ 应用已强制停止${NC}"
        rm -f "$PID_FILE"

        # 记录停止日志
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        if [ -f "$LOG_FILE" ]; then
            echo "[$TIMESTAMP] 应用已强制停止 (PID: $PID)" >> "$LOG_FILE"
        fi
        return 0
    fi
}

# 强制停止所有相关进程
force_stop() {
    echo -e "${YELLOW}正在强制停止所有相关进程...${NC}"

    # 查找所有npm start进程
    PIDS=$(ps aux | grep "npm start" | grep -v grep | awk '{print $2}')

    if [ -n "$PIDS" ]; then
        echo -e "${YELLOW}找到进程: $PIDS${NC}"
        echo "$PIDS" | xargs kill -9
        echo -e "${GREEN}已强制停止所有相关进程${NC}"
    else
        echo -e "${YELLOW}未找到相关进程${NC}"
    fi

    # 查找Next.js相关进程
    NEXT_PIDS=$(ps aux | grep "next" | grep -v grep | awk '{print $2}')
    if [ -n "$NEXT_PIDS" ]; then
        echo -e "${YELLOW}找到Next.js进程: $NEXT_PIDS${NC}"
        echo "$NEXT_PIDS" | xargs kill -9
        echo -e "${GREEN}已强制停止所有Next.js进程${NC}"
    fi

    # 清理PID文件
    rm -f "$PID_FILE"

    echo -e "${GREEN}✅ 强制停止完成${NC}"
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  stop       正常停止应用 (默认)"
    echo "  force      强制停止所有相关进程"
    echo "  help       显示此帮助信息"
    echo ""
    echo "相关脚本:"
    echo "  ./start.sh   启动应用"
    echo "  ./status.sh  查看应用状态"
}

# 主程序
main() {
    case "${1:-stop}" in
        "stop")
            stop_app
            ;;
        "force")
            force_stop
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