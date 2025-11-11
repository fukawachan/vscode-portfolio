#!/bin/bash

# Next.js Production Startup Script
# 启动生产环境脚本

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
BUILD_LOG="$LOG_DIR/build.log"

# 默认端口，如果环境中未设置PORT，则使用 3344
DEFAULT_PORT=3344
PORT="${PORT:-$DEFAULT_PORT}"
export PORT

# 检查是否已经运行check_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}应用已在运行 (PID: $PID)${NC}"
            return 0
        else
            # PID文件存在但进程不存在，删除PID文件
            rm -f "$PID_FILE"
        fi
    fi
    return 1
}

# 创建日志目录
create_log_dir() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        echo -e "${GREEN}创建日志目录: $LOG_DIR${NC}"
    fi
}

# 启动应用
start_app() {
    echo -e "${GREEN}开始启动$PROJECT_NAME 生产环境...${NC}"

    # 检查是否已经运行    if check_running; then
        echo -e "${RED}启动失败：应用已在运�?{NC}"
        exit 1
    fi

    # 创建日志目录
    create_log_dir

    # 获取当前时间    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[$TIMESTAMP] ========== 开始构建项目==========" >> "$BUILD_LOG"

    # 构建项目
    echo -e "${YELLOW}正在构建项目...${NC}"
    if npm run build >> "$BUILD_LOG" 2>&1; then
        echo -e "${GREEN}项目构建成功${NC}"
        echo "[$TIMESTAMP] 构建成功" >> "$BUILD_LOG"
    else
        echo -e "${RED}项目构建失败，请查看构建日志: $BUILD_LOG${NC}"
        echo "[$TIMESTAMP] 构建失败" >> "$BUILD_LOG"
        exit 1
    fi

    # 启动生产服务    echo -e "${YELLOW}正在启动生产服务..${NC}"
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$TIMESTAMP] ========== 启动生产服务�?==========" >> "$LOG_FILE"

    # 使用nohup在后台启动服务器，并保存PID
    echo -e "${YELLOW}正在 绘刷 $PORT...${NC}"
    nohup PORT="$PORT" npm start >> "$LOG_FILE" 2>&1 &
    APP_PID=$!

    # 保存PID到文件    echo $APP_PID > "$PID_FILE"

    # 等待一下确保启动成功    sleep 3

    if ps -p $APP_PID > /dev/null 2>&1; then
        echo -e "${GREEN}应用启动成功{NC}"
        echo -e "${GREEN}PID: $APP_PID${NC}"
        echo -e "${GREEN}日志文件: $LOG_FILE${NC}"
        echo -e "${GREEN}构建日志: $BUILD_LOG${NC}"
        echo -e "${YELLOW}使用 './stop.sh' 停止应用${NC}"
        echo -e "${YELLOW}使用 './status.sh' 查看状态{NC}"

        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        echo "[$TIMESTAMP] 应用启动成功 (PID: $APP_PID)" >> "$LOG_FILE"
    else
        echo -e "${RED}应用启动失败，请查看日志: $LOG_FILE${NC}"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  start     启动应用 (默认)"
    echo "  help      显示此帮助信息
    echo ""
    echo "相关脚本:"
    echo "  ./stop.sh    停止应用"
    echo "  ./status.sh  查看应用状态
}

# 主程序main() {
    case "${1:-start}" in
        "start")
            start_app
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


