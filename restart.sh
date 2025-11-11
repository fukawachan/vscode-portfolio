#!/bin/bash

# Next.js Production Restart Script
# 重启生产环境脚本

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="vscode-portfolio"

# 重启应用
restart_app() {
    echo -e "${BLUE}=== 重启 $PROJECT_NAME ===${NC}"
    echo ""

    # 停止应用
    echo -e "${YELLOW}正在停止应用...${NC}"
    ./stop.sh
    STOP_EXIT_CODE=$?

    echo ""

    # 等待一下确保完全停止
    sleep 2

    # 启动应用
    echo -e "${YELLOW}正在启动应用...${NC}"
    ./start.sh
    START_EXIT_CODE=$?

    echo ""
    echo -e "${BLUE}=== 重启完成 ===${NC}"

    if [ $STOP_EXIT_CODE -eq 0 ] && [ $START_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ 应用重启成功${NC}"
    else
        echo -e "${RED}❌ 应用重启失败${NC}"
        exit 1
    fi
}

# 快速重启（不重新构建）
quick_restart() {
    echo -e "${BLUE}=== 快速重启 $PROJECT_NAME (跳过构建) ===${NC}"
    echo ""

    # 检查是否存在.next目录
    if [ ! -d ".next" ]; then
        echo -e "${RED}❌ .next目录不存在，无法快速重启${NC}"
        echo -e "${YELLOW}请先运行 './start.sh' 进行完整启动${NC}"
        exit 1
    fi

    # 停止应用
    echo -e "${YELLOW}正在停止应用...${NC}"
    ./stop.sh

    echo ""

    # 等待一下确保完全停止
    sleep 2

    # 直接启动生产服务器（跳过构建）
    echo -e "${YELLOW}正在快速启动生产服务器...${NC}"

    LOG_DIR="logs"
    LOG_FILE="$LOG_DIR/app.log"
    PID_FILE=".next/server.pid"

    # 创建日志目录
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
    fi

    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$TIMESTAMP] ========== 快速重启生产服务器 ==========" >> "$LOG_FILE"

    # 使用nohup在后台启动服务器
    nohup npm start >> "$LOG_FILE" 2>&1 &
    APP_PID=$!

    # 保存PID到文件
    echo $APP_PID > "$PID_FILE"

    # 等待一下确保启动成功
    sleep 3

    if ps -p $APP_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 应用快速重启成功！${NC}"
        echo -e "${GREEN}PID: $APP_PID${NC}"
        echo -e "${GREEN}日志文件: $LOG_FILE${NC}"
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        echo "[$TIMESTAMP] 应用快速重启成功 (PID: $APP_PID)" >> "$LOG_FILE"
    else
        echo -e "${RED}❌ 应用快速重启失败，请查看日志: $LOG_FILE${NC}"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  restart     完整重启应用 (构建+启动) (默认)"
    echo "  quick       快速重启 (跳过构建)"
    echo "  help        显示此帮助信息"
    echo ""
    echo "相关脚本:"
    echo "  ./start.sh   启动应用"
    echo "  ./stop.sh    停止应用"
    echo "  ./status.sh  查看应用状态"
}

# 主程序
main() {
    case "${1:-restart}" in
        "restart")
            restart_app
            ;;
        "quick")
            quick_restart
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