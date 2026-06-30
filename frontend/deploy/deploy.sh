#!/bin/bash

# 前端部署打包脚本
# 用于准备完整的部署文件

set -e

echo "=== 开始打包前端部署文件 ==="

# 回到项目根目录
cd "$(dirname "$0")/.."

# 检查是否已构建
if [ ! -d ".next/standalone" ]; then
    echo "错误: 未找到构建产物，请先运行 npm run build"
    exit 1
fi

# 定位 server.js（standalone 入口）
# Next.js 16+ Turbopack: .next/standalone/server.js
# Next.js 15 及更早: .next/standalone/projects/<path>/server.js
SERVER_JS=$(find .next/standalone -name "server.js" -not -path "*/node_modules/*" 2>/dev/null | head -1)

if [ -z "$SERVER_JS" ]; then
    echo "错误: 无法在 .next/standalone 中找到 server.js"
    exit 1
fi

# STANDALONE_DIR = server.js 所在目录
STANDALONE_DIR=$(dirname "$SERVER_JS")
echo "   找到 server.js: $SERVER_JS"
echo "   standalone 目录: $STANDALONE_DIR"

# 清理旧的部署文件
echo "1. 清理旧文件..."
rm -rf deploy/dist
rm -f deploy/frontend-deploy.tar.gz

# 创建部署目录
echo "2. 创建部署目录..."
mkdir -p deploy/dist

# 复制 standalone 代码（这是 Node.js 服务器的核心代码）
echo "3. 复制 standalone 服务器代码..."
cp -r "$STANDALONE_DIR"/* deploy/dist/
# 复制 .next 目录（如果存在）
if [ -d "$STANDALONE_DIR/.next" ]; then
    cp -r "$STANDALONE_DIR/.next" deploy/dist/
fi

# 关键步骤：复制静态资源到 standalone 的 .next 目录
echo "4. 复制静态资源（关键步骤）..."
cp -r .next/static deploy/dist/.next/

# 复制 public 目录到 standalone 根目录
echo "5. 复制 public 目录..."
if [ -d "public" ]; then
    cp -r public deploy/dist/
else
    echo "   警告: public 目录不存在，跳过"
fi

# 创建启动脚本
echo "6. 创建启动脚本..."
cat > deploy/dist/start.sh << 'EOF'
#!/bin/bash
export PORT=3000
export HOSTNAME=0.0.0.0
export NODE_ENV=production

echo "Starting Next.js server on port $PORT..."
node server.js
EOF

chmod +x deploy/dist/start.sh

# 创建 PM2 配置文件
echo "7. 创建 PM2 配置..."
cat > deploy/dist/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'owl_frontend',
    script: './server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    exec_mode: 'fork',
    max_memory_restart: '500M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    autorestart: true,
    watch: false,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
EOF

# 创建日志目录
echo "8. 创建日志目录..."
mkdir -p deploy/dist/logs

# 验证关键文件
echo "9. 验证文件结构..."
if [ ! -f "deploy/dist/server.js" ]; then
    echo "错误: server.js 不存在"
    exit 1
fi

if [ ! -f "deploy/dist/.next/BUILD_ID" ]; then
    echo "错误: BUILD_ID 不存在"
    exit 1
fi

if [ ! -d "deploy/dist/.next/static" ]; then
    echo "错误: static 目录不存在"
    exit 1
fi

if [ ! -d "deploy/dist/.next/server" ]; then
    echo "错误: server 目录不存在"
    exit 1
fi

echo "   ✓ server.js 存在"
echo "   ✓ BUILD_ID 存在"
echo "   ✓ static 目录存在"
echo "   ✓ server 目录存在"

# 打包
echo "10. 打包文件..."
cd deploy
tar -czf frontend-deploy.tar.gz --exclude='._*' -C dist .
cd ..

# 显示结果
echo ""
echo "=== 打包完成 ==="
echo ""
echo "打包文件: deploy/frontend-deploy.tar.gz"
echo "文件大小: $(du -h deploy/frontend-deploy.tar.gz | cut -f1)"
echo ""
echo "下一步操作:"
echo "1. 上传到服务器: scp deploy/frontend-deploy.tar.gz user@your-server:/tmp/"
echo "2. SSH 登录: ssh user@your-server"
echo "3. 创建目录: mkdir -p /opt/frontend/owl"
echo "4. 解压: cd /opt/frontend/owl && tar -xzf /tmp/frontend-deploy.tar.gz"
echo "5. 启动 PM2: pm2 start ecosystem.config.js"
echo "6. 保存 PM2 进程: pm2 save"
echo ""
echo "前端运行端口: 3000"
echo "后端 API 端口: 3001 (通过 nginx 代理)"
echo ""
