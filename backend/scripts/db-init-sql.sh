#!/bin/bash

# 数据库完整初始化脚本
# 使用 schema.sql + init-data.sql

set -e  # 遇到错误立即退出

echo "🚀 开始数据库完整初始化..."
echo ""

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ 错误: .env 文件不存在"
    exit 1
fi

# 检查必要的环境变量
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ 错误: 缺少必要的数据库环境变量"
    exit 1
fi

# 1. 执行 schema.sql 创建表结构
echo "📋 步骤 1/2: 执行 schema.sql 创建表结构..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -f schema.sql

if [ $? -eq 0 ]; then
    echo "✅ 表结构创建完成"
    echo ""
else
    echo "❌ 表结构创建失败"
    exit 1
fi

# 2. 执行 init-data.sql 插入初始数据
echo "🌱 步骤 2/2: 执行 init-data.sql 插入初始数据..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -f init-data.sql

if [ $? -eq 0 ]; then
    echo "✅ 初始数据插入完成"
    echo ""
else
    echo "❌ 初始数据插入失败"
    exit 1
fi

# 完成
echo "🎉 数据库初始化完成!"
echo ""
echo "📝 测试账号："
echo "   超级管理员 - 用户名: admin, 密码: admin123"
echo "   管理员     - 用户名: manager, 密码: manager123"
echo "   普通用户   - 用户名: user, 密码: user123"
echo ""
