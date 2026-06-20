#!/bin/bash

################################################################################
# Owl Platform - 一键快速启动脚本
# 用于快速初始化和启动整个项目
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

################################################################################
# 检查前置条件
################################################################################

check_prerequisites() {
    log_info "检查前置条件..."

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js >= 16.x"
        exit 1
    fi
    log_success "Node.js 已安装 ($(node -v))"

    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    log_success "npm 已安装 ($(npm -v))"

    # 检查 PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_warning "PostgreSQL 未安装或未加入 PATH，请确保 PostgreSQL 服务已启动"
    else
        log_success "PostgreSQL 已安装 ($(psql --version))"
    fi

    # 检查 Redis
    if ! command -v redis-cli &> /dev/null; then
        log_warning "Redis 未安装或未加入 PATH，请确保 Redis 服务已启动"
    else
        log_success "Redis 已安装"
    fi
}

################################################################################
# 检查数据库连接
################################################################################

check_database() {
    log_info "检查数据库连接..."

    # 读取 .env 文件中的数据库配置
    if [ ! -f backend/.env ]; then
        log_error "后端 .env 文件不存在，请先配置 backend/.env"
        exit 1
    fi

    DB_HOST=$(grep "DB_HOST" backend/.env | cut -d '=' -f 2 | tr -d ' ')
    DB_PORT=$(grep "DB_PORT" backend/.env | cut -d '=' -f 2 | tr -d ' ')
    DB_USER=$(grep "DB_USER" backend/.env | cut -d '=' -f 2 | tr -d ' ')
    DB_PASSWORD=$(grep "DB_PASSWORD" backend/.env | cut -d '=' -f 2 | tr -d ' ')
    DB_NAME=$(grep "DB_NAME" backend/.env | cut -d '=' -f 2 | tr -d ' ')

    if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
        log_warning "数据库配置不完整，请检查 backend/.env"
        return 1
    fi

    log_success "数据库配置完整"
    return 0
}

################################################################################
# 设置后端
################################################################################

setup_backend() {
    log_info "设置后端..."

    cd backend

    # 检查 .env 文件
    if [ ! -f .env ]; then
        log_warning ".env 文件不存在，创建示例文件..."
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warning "已创建 .env 文件，请编辑 backend/.env 配置数据库等信息"
            log_warning "配置完成后，重新运行此脚本"
            cd ..
            return 1
        else
            log_error ".env.example 文件不存在"
            cd ..
            return 1
        fi
    fi

    log_info "安装后端依赖..."
    npm install --legacy-peer-deps
    log_success "后端依赖安装完成"

    cd ..
}

################################################################################
# 设置前端
################################################################################

setup_frontend() {
    log_info "设置前端..."

    cd frontend

    # 检查 .env.local 文件
    if [ ! -f .env.local ]; then
        log_warning ".env.local 文件不存在，创建默认配置..."
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Owl Platform
EOF
        log_success "已创建 .env.local 文件"
    fi

    log_info "安装前端依赖..."
    npm install --legacy-peer-deps
    log_success "前端依赖安装完成"

    cd ..
}

################################################################################
# 初始化数据库
################################################################################

init_database() {
    log_info "初始化数据库..."

    cd backend

    npm run db:reset 2>&1 | tail -20

    if [ $? -eq 0 ]; then
        log_success "数据库初始化完成"
        log_info "默认用户凭证："
        log_info "  用户名: admin  密码: Admin@123"
        log_info "  用户名: manager  密码: Manager@123"
        log_info "  用户名: user  密码: User@123"
    else
        log_error "数据库初始化失败"
        cd ..
        return 1
    fi

    cd ..
}

################################################################################
# 启动服务
################################################################################

start_services() {
    log_info "启动服务..."
    log_info "后端将启动在: http://localhost:3001"
    log_info "前端将启动在: http://localhost:3000"
    log_warning "按 Ctrl+C 停止服务"

    # 后台启动后端
    cd backend
    log_info "启动后端服务..."
    npm run dev &
    BACKEND_PID=$!
    cd ..

    # 等待后端启动
    sleep 3

    # 前台启动前端
    cd frontend
    log_info "启动前端服务..."
    npm run dev
    cd ..
}

################################################################################
# 清理函数
################################################################################

cleanup() {
    log_warning "正在停止服务..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    log_info "服务已停止"
}

# 捕获中断信号
trap cleanup EXIT INT TERM

################################################################################
# 主程序
################################################################################

main() {
    clear

    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════════════════════╗"
    echo "║                 Owl Platform - 一键快速启动脚本                            ║"
    echo "║                                                                            ║"
    echo "║  本脚本将自动：                                                             ║"
    echo "║  1. 检查依赖环境                                                            ║"
    echo "║  2. 安装项目依赖                                                            ║"
    echo "║  3. 初始化数据库                                                            ║"
    echo "║  4. 启动后端和前端服务                                                     ║"
    echo "╚════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    # 检查前置条件
    check_prerequisites

    # 检查数据库配置
    if ! check_database; then
        log_error "数据库配置检查失败"
        log_warning "请编辑 backend/.env 文件，配置以下内容："
        log_warning "  DB_HOST=localhost"
        log_warning "  DB_PORT=5432"
        log_warning "  DB_NAME=owl_platform"
        log_warning "  DB_USER=postgres"
        log_warning "  DB_PASSWORD=your_password"
        exit 1
    fi

    echo ""
    read -p "是否继续安装依赖并初始化数据库? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "已取消"
        exit 0
    fi

    echo ""

    # 设置后端
    if ! setup_backend; then
        exit 1
    fi

    # 设置前端
    setup_frontend

    echo ""

    # 初始化数据库
    if ! init_database; then
        exit 1
    fi

    echo ""
    log_success "所有准备工作完成！"
    echo ""

    # 启动服务
    start_services
}

# 运行主程序
main "$@"
