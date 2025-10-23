#!/bin/bash

# 后端打包脚本
# 用途：打包后端代码用于部署，排除不必要的文件

set -e

# 获取脚本所在目录（backend 目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${BACKEND_DIR}"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 开始打包后端代码...${NC}\n"

# 获取当前日期和时间
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME="owl-backend-v${VERSION}-${TIMESTAMP}.tar.gz"

echo -e "${YELLOW}📋 打包信息:${NC}"
echo "  版本: v${VERSION}"
echo "  时间: ${TIMESTAMP}"
echo "  输出: ${PACKAGE_NAME}"
echo ""

# 创建部署说明文件（临时）
echo -e "${GREEN}📝 创建部署说明...${NC}"
cat > INSTALL.txt << 'EOF'
# owl 管理系统 - 后端部署说明

## 快速开始

1. 解压文件
   tar -xzf owl-backend-*.tar.gz

2. 安装依赖
   npm install --production

3. 配置环境变量
   cp .env.example .env
   # 编辑 .env 文件，配置数据库、Redis 等

4. 初始化数据库
   npm run db:init

5. 启动服务
   npm run pm2:start

6. 查看状态
   npm run pm2:status
   npm run pm2:logs

## 详细文档

请参考 deploy/DEPLOY.md 文件

EOF

# 使用 tar 打包，直接排除不需要的文件和目录
echo -e "${GREEN}🗜️  压缩打包...${NC}"
tar -czf "${PACKAGE_NAME}" \
  --exclude='node_modules' \
  --exclude='docs' \
  --exclude='logs' \
  --exclude='*.tar.gz' \
  --exclude='.git' \
  --exclude='.gitignore' \
  --exclude='*.log' \
  --exclude='test' \
  --exclude='tests' \
  --exclude='__tests__' \
  --exclude='coverage' \
  --exclude='.vscode' \
  --exclude='.idea' \
  --exclude='.DS_Store' \
  --exclude='*.swp' \
  --exclude='*.swo' \
  --exclude='tmp' \
  --exclude='temp' \
  src/ \
  migrations/ \
  seeders/ \
  scripts/ \
  package.json \
  package-lock.json \
  ecosystem.config.js \
  .env \
  .env.example \
  .env.production.example \
  .sequelizerc \
  INSTALL.txt \
  README.md 2>/dev/null || true

# 清理临时文件
rm -f INSTALL.txt

# 输出打包信息
PACKAGE_SIZE=$(du -h "${PACKAGE_NAME}" | cut -f1)
echo ""
echo -e "${GREEN}✅ 打包完成!${NC}"
echo ""
echo -e "${YELLOW}📦 打包文件:${NC}"
echo "  文件名: ${PACKAGE_NAME}"
echo "  大小: ${PACKAGE_SIZE}"
echo "  位置: ${BACKEND_DIR}/${PACKAGE_NAME}"
echo ""
echo -e "${YELLOW}📋 打包内容:${NC}"
echo "  ✓ src/             - 源代码"
echo "  ✓ migrations/      - 数据库迁移"
echo "  ✓ seeders/         - 初始化数据"
echo "  ✓ scripts/         - 部署脚本"
echo "  ✓ package.json     - 项目配置"
echo "  ✓ ecosystem.config.js - PM2 配置"
echo "  ✓ .env.example     - 环境变量示例"
echo ""
echo -e "${YELLOW}🚫 已排除:${NC}"
echo "  ✗ node_modules/    - 依赖包（需在服务器重新安装）"
echo "  ✗ docs/            - 文档"
echo "  ✗ logs/            - 日志文件"
echo "  ✗ .git/            - Git 仓库"
echo ""
echo -e "${YELLOW}📤 部署步骤:${NC}"
echo "  1. 上传到服务器:"
echo "     scp ${PACKAGE_NAME} user@server:/path/to/owl/"
echo ""
echo "  2. 在服务器上解压:"
echo "     cd /path/to/owl"
echo "     tar -xzf ${PACKAGE_NAME}"
echo ""
echo "  3. 按照 INSTALL.txt 说明进行部署"
echo ""