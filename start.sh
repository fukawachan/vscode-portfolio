#!/bin/bash

# 设置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 检查是否在Next.js项目目录中
if [ ! -f "package.json" ]; then
    echo "错误：未找到package.json文件，请确保在Next.js项目根目录中运行此脚本"
    exit 1
fi

# 创建日志文件并添加时间戳
echo "=== Next.js项目部署开始 (${TIMESTAMP}) ===" > "$LOG_FILE"

# 函数：记录日志并显示进度
log_message() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ${message}" | tee -a "$LOG_FILE"
}

# 函数：检查命令执行结果
check_result() {
    if [ $? -eq 0 ]; then
        log_message "✓ $1 完成"
    else
        log_message "✗ $1 失败"
        exit 1
    fi
}

# 在后台运行部署过程
{
    log_message "开始Next.js项目部署流程..."

    # 1. 安装依赖
    log_message "正在安装依赖 (npm install)..."
    npm install >> "$LOG_FILE" 2>&1
    check_result "依赖安装"

    # 2. 构建项目
    log_message "正在构建项目 (npm run build)..."
    npm run build >> "$LOG_FILE" 2>&1
    check_result "项目构建"

    # 3. 启动项目
    log_message "正在启动项目 (npm run start)..."
    log_message "Next.js服务已启动，可以通过浏览器访问项目"
    log_message "查看实时日志: tail -f ${LOG_FILE}"
    npm run start >> "$LOG_FILE" 2>&1

} &

# 获取后台进程的PID
DEPLOY_PID=$!
echo "部署进程已在后台运行，PID: ${DEPLOY_PID}"
echo "日志文件: ${LOG_FILE}"
echo "要停止服务，可以运行: kill ${DEPLOY_PID}"

# 保存PID到文件，便于后续管理
echo $DEPLOY_PID > "${SCRIPT_DIR}/nextjs.pid"
log_message "部署进程PID已保存: ${DEPLOY_PID}"

# 显示如何使用tail命令查看日志
echo ""
echo "要查看实时日志，请运行: tail -f ${LOG_FILE}"
echo "要停止服务，请运行: kill $(cat ${SCRIPT_DIR}/nextjs.pid) && rm ${SCRIPT_DIR}/nextjs.pid"