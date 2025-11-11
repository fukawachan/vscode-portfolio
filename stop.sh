#!/bin/bash

# 检查3000端口占用情况
echo "正在检查3000端口的占用情况..."
result=$(sudo netstat -tulpn 2>/dev/null | grep :3000)

if [ -n "$result" ]; then
    # 提取PID
    pid=$(echo "$result" | awk '{print $7}' | cut -d'/' -f1)

    if [ -n "$pid" ] && [ "$pid" != "-" ]; then
        echo "发现占用3000端口的进程，PID: $pid"
        echo "正在关闭进程..."

        # 杀死进程
        sudo kill -9 "$pid" 2>/dev/null

        # 再次检查是否成功关闭
        sleep 1
        check_again=$(sudo netstat -tulpn 2>/dev/null | grep :3000)

        if [ -z "$check_again" ]; then
            echo "✅ 成功关闭进程，进程号: $pid"
        else
            echo "❌ 关闭进程失败，请手动检查"
        fi
    else
        echo "❌ 无法提取有效的PID"
    fi
else
    echo "✅ 程序未运行，3000端口未被占用"
fi