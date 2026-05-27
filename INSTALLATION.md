# Owl Platform 安装手册

欢迎使用 Owl Platform！本手册将指导您完成从零开始的完整安装过程。

## 📑 目录

1. [系统要求](#系统要求)
2. [安装步骤](#安装步骤)
   - [2.1 安装PostgreSQL](#21-安装postgresql)
   - [2.2 安装MinIO](#22-安装minio)
   - [2.3 安装Redis](#23-安装redis)
   - [2.4 安装Node.js](#24-安装nodejs)
   - [2.5 配置数据库](#25-配置数据库)
   - [2.6 配置应用](#26-配置应用)
   - [2.7 启动服务](#27-启动服务)
3. [验证安装](#验证安装)
4. [常见问题](#常见问题)
5. [下一步](#下一步)

---

## 系统要求

### 硬件要求
- **CPU**: 2核心或以上
- **内存**: 4GB RAM 或以上（推荐 8GB）
- **磁盘**: 20GB 可用空间或以上

### 软件要求
- **操作系统**:
  - Linux (Ubuntu 20.04+, CentOS 7+, Debian 10+)
  - macOS 11+
  - Windows 10/11 (WSL2 推荐)
- **Node.js**: 18.x 或以上
- **PostgreSQL**: 12.x 或以上
- **Redis**: 6.x 或以上
- **MinIO**: 最新稳定版

---

## 安装步骤

### 2.1 安装PostgreSQL

#### Ubuntu/Debian
```bash
# 更新包列表
sudo apt update

# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 检查状态
sudo systemctl status postgresql
```

#### CentOS/RHEL
```bash
# 安装 PostgreSQL 仓库
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# 安装 PostgreSQL
sudo yum install -y postgresql14-server postgresql14

# 初始化数据库
sudo /usr/pgsql-14/bin/postgresql-14-setup initdb

# 启动服务
sudo systemctl start postgresql-14
sudo systemctl enable postgresql-14
```

#### macOS
```bash
# 使用 Homebrew 安装
brew install postgresql@14

# 启动服务
brew services start postgresql@14
```

#### Windows
1. 下载安装程序: https://www.postgresql.org/download/windows/
2. 运行安装程序并按照向导完成安装
3. 记住设置的超级用户密码

---

### 2.2 安装MinIO

#### Linux
```bash
# 下载 MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# 创建数据目录
sudo mkdir -p /data/minio

# 创建 systemd 服务文件
sudo tee /etc/systemd/system/minio.service > /dev/null <<EOF
[Unit]
Description=MinIO
Documentation=https://docs.min.io
Wants=network-online.target
After=network-online.target

[Service]
User=root
Group=root
Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=minioadmin"
ExecStart=/usr/local/bin/minio server /data/minio --console-address ":9001"
Restart=always
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl start minio
sudo systemctl enable minio

# 检查状态
sudo systemctl status minio
```

#### macOS
```bash
# 使用 Homebrew 安装
brew install minio/stable/minio

# 启动服务（在终端中运行）
minio server /data/minio --console-address ":9001"

# 或者在后台运行
nohup minio server /data/minio --console-address ":9001" > /tmp/minio.log 2>&1 &
```

#### Windows
1. 下载: https://dl.min.io/server/minio/release/windows-amd64/minio.exe
2. 创建数据目录: `C:\minio\data`
3. 创建启动脚本 `start-minio.bat`:
```bat
@echo off
set MINIO_ROOT_USER=minioadmin
set MINIO_ROOT_PASSWORD=minioadmin
minio.exe server C:\minio\data --console-address ":9001"
```
4. 双击运行 `start-minio.bat`

#### 访问 MinIO 控制台
- URL: http://localhost:9001
- 默认用户名: `minioadmin`
- 默认密码: `minioadmin`

**重要**: 登录后创建一个名为 `owl` 的 bucket（存储桶）

---

### 2.3 安装Redis

#### Ubuntu/Debian
```bash
# 安装 Redis
sudo apt update
sudo apt install redis-server -y

# 启动服务
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 检查状态
sudo systemctl status redis-server

# 测试连接
redis-cli ping
# 应该返回: PONG
```

#### CentOS/RHEL
```bash
# 安装 Redis
sudo yum install redis -y

# 启动服务
sudo systemctl start redis
sudo systemctl enable redis

# 测试连接
redis-cli ping
```

#### macOS
```bash
# 使用 Homebrew 安装
brew install redis

# 启动服务
brew services start redis

# 测试连接
redis-cli ping
```

#### Windows
1. 下载 Redis for Windows: https://github.com/microsoftarchive/redis/releases
2. 解压到目录（如 `C:\Redis`）
3. 运行 `redis-server.exe`

#### 配置 Redis 密码（推荐）
```bash
# 编辑配置文件
sudo nano /etc/redis/redis.conf

# 找到并修改以下行（取消注释并设置密码）
requirepass your_strong_password

# 重启 Redis
sudo systemctl restart redis-server
```

---

### 2.4 安装Node.js

#### 使用 nvm (推荐 - 适用于 Linux/macOS)
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc  # 或 source ~/.zshrc

# 安装 Node.js 18
nvm install 18
nvm use 18

# 验证安装
node --version
npm --version
```

#### Ubuntu/Debian
```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装 Node.js
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

#### CentOS/RHEL
```bash
# 添加 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# 安装 Node.js
sudo yum install -y nodejs

# 验证安装
node --version
npm --version
```

#### macOS
```bash
# 使用 Homebrew 安装
brew install node@18

# 验证安装
node --version
npm --version
```

#### Windows
1. 下载安装程序: https://nodejs.org/
2. 运行安装程序并按照向导完成安装
3. 打开命令提示符验证: `node --version`

---

### 2.5 配置数据库

#### 1. 创建数据库和用户
```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 psql 中执行以下命令
CREATE DATABASE owl_platform;
CREATE USER owl_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE owl_platform TO owl_admin;

# 授予 schema 权限（PostgreSQL 15+ 需要）
\c owl_platform
GRANT ALL ON SCHEMA public TO owl_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO owl_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO owl_admin;

# 退出
\q
```

#### 2. 克隆项目
```bash
# 克隆项目到本地
git clone <repository-url> owl_platform
cd owl_platform
```

#### 3. 执行数据库脚本

进入后端目录：
```bash
cd backend
```

**执行 schema.sql（创建表结构）**：
```bash
psql -h localhost -U owl_admin -d owl_platform -f sql/schema.sql
```

**执行 seeder.sql（导入初始数据）**：
```bash
psql -h localhost -U owl_admin -d owl_platform -f sql/seeder.sql
```

如果提示输入密码，输入您在步骤1中设置的密码。

#### 4. 验证数据库
```bash
# 连接数据库
psql -h localhost -U owl_admin -d owl_platform

# 查看表列表
\dt

# 查看用户数据
SELECT id, username, email FROM users LIMIT 5;

# 退出
\q
```

您应该能看到多个表，包括 users, roles, menus 等。

---

### 2.6 配置应用

#### 1. 配置后端

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
nano .env  # 或使用其他编辑器
```

**配置 `.env` 文件**：
```bash
# 服务配置
NODE_ENV=development
PORT=3001

# 数据库配置（修改为您的实际配置）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=owl_platform
DB_USER=owl_admin
DB_PASSWORD=your_secure_password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=  # 如果设置了密码，填写在这里

# JWT密钥（请生成随机字符串）
JWT_SECRET=your_random_jwt_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_random_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# MinIO配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=owl

# CORS配置
CORS_ORIGIN=*

# 应用路径前缀（如果需要部署在子路径下）
APP_PATH_PREFIX=

# SMTP 邮件配置（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
SMTP_FROM_NAME=Owl Platform
SMTP_FROM_EMAIL=your_email@example.com
```

**生成随机密钥**：
```bash
# 生成 JWT 密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制生成的字符串，分别用于 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`。

#### 2. 配置前端

```bash
# 进入前端目录
cd ../frontend

# 安装依赖
npm install

# 创建环境配置文件
nano .env.local  # 或使用其他编辑器
```

**配置 `.env.local` 文件**：
```bash
# API 地址
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# 应用名称
NEXT_PUBLIC_APP_NAME=Owl Platform
```

---

### 2.7 启动服务

#### 开发模式（推荐用于测试）

**启动后端**：
```bash
cd backend
npm run dev
```

您应该看到类似输出：
```
Server is running on port 3001
Database connected successfully
Redis connected successfully
```

**启动前端**（打开新终端）：
```bash
cd frontend
npm run dev
```

您应该看到类似输出：
```
  ▲ Next.js 15.5.7
  - Local:        http://localhost:3000
```

#### 生产模式

**使用 PM2 管理后端**：
```bash
# 安装 PM2
npm install -g pm2

# 进入后端目录
cd backend

# 启动后端
pm2 start ecosystem.config.js --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs owl-backend

# 设置开机自启
pm2 startup
pm2 save
```

**构建并启动前端**：
```bash
cd frontend

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 或使用 PM2
pm2 start npm --name "owl-frontend" -- start
```

---

## 验证安装

### 1. 检查服务状态

**检查后端**：
```bash
# 健康检查
curl http://localhost:3001/api/health

# 预期返回
{
  "success": true,
  "data": { "status": "ok" },
  "message": "Server is running"
}
```

**检查数据库连接**：
```bash
psql -h localhost -U owl_admin -d owl_platform -c "SELECT COUNT(*) FROM users;"
```

**检查 Redis**：
```bash
redis-cli ping
# 返回: PONG
```

**检查 MinIO**：
访问 http://localhost:9001 并登录，确认 `owl` bucket 已创建。

### 2. 登录系统

1. 打开浏览器访问: http://localhost:3000
2. 使用默认管理员账号登录：
   - 用户名: `admin`
   - 密码: `admin123`

### 3. 验证功能

登录后检查以下功能：
- ✅ 用户管理
- ✅ 角色管理
- ✅ 菜单管理
- ✅ 部门管理
- ✅ 文件上传（测试 MinIO）
- ✅ 系统日志

---

## 常见问题

### 1. 数据库连接失败

**错误**: `ECONNREFUSED` 或 `password authentication failed`

**解决方案**：
```bash
# 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 检查配置文件中的数据库信息
cat backend/.env | grep DB_

# 测试数据库连接
psql -h localhost -U owl_admin -d owl_platform

# 如果密码错误，重置密码
sudo -u postgres psql
ALTER USER owl_admin WITH PASSWORD 'new_password';
\q
```

### 2. Redis 连接失败

**错误**: `Error: Redis connection to localhost:6379 failed`

**解决方案**：
```bash
# 检查 Redis 是否运行
sudo systemctl status redis-server

# 启动 Redis
sudo systemctl start redis-server

# 测试连接
redis-cli ping

# 如果设置了密码，使用
redis-cli -a your_password ping
```

### 3. MinIO 连接失败

**错误**: `MinIO connection failed` 或 `Bucket does not exist`

**解决方案**：
```bash
# 检查 MinIO 是否运行
sudo systemctl status minio

# 检查端口是否被占用
netstat -tlnp | grep 9000

# 访问 MinIO 控制台
# http://localhost:9001
# 登录后手动创建名为 "owl" 的 bucket
```

### 4. 端口被占用

**错误**: `Port 3000 is already in use` 或 `Port 3001 is already in use`

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :3001

# 或使用
netstat -tlnp | grep 3000

# 杀死进程
kill -9 <PID>

# 或修改配置使用其他端口
# 后端: 修改 backend/.env 中的 PORT
# 前端: 运行 PORT=3002 npm run dev
```

### 5. npm install 失败

**错误**: 依赖安装失败或网络超时

**解决方案**：
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 使用国内镜像（中国用户）
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install

# 如果还是失败，尝试使用 yarn
npm install -g yarn
yarn install
```

### 6. 数据库脚本执行失败

**错误**: `syntax error` 或 `permission denied`

**解决方案**：
```bash
# 确保使用正确的用户和数据库
psql -h localhost -U owl_admin -d owl_platform

# 授予所有权限
sudo -u postgres psql owl_platform
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO owl_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO owl_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO owl_admin;
\q

# 重新执行脚本
cd backend
psql -h localhost -U owl_admin -d owl_platform -f sql/schema.sql
psql -h localhost -U owl_admin -d owl_platform -f sql/seeder.sql
```

### 7. 前端页面空白或报错

**解决方案**：
```bash
# 检查浏览器控制台错误（F12）

# 检查 API 地址配置
cat frontend/.env.local

# 确保后端正在运行
curl http://localhost:3001/api/health

# 清理并重新构建前端
cd frontend
rm -rf .next
npm run dev
```

### 8. 文件上传失败

**错误**: 上传文件时报错

**解决方案**：
```bash
# 1. 确认 MinIO 正在运行
curl http://localhost:9000/minio/health/live

# 2. 登录 MinIO 控制台 (http://localhost:9001)
#    确认 bucket "owl" 已创建

# 3. 检查 backend/.env 中的 MinIO 配置
cat backend/.env | grep MINIO

# 4. 重启后端服务
pm2 restart owl-backend
# 或在开发模式下 Ctrl+C 后重新运行 npm run dev
```

---

## 下一步

恭喜！您已成功安装 Owl Platform。以下是一些建议的后续步骤：

### 1. 安全配置

- 🔒 **修改默认管理员密码**: 登录后立即在用户管理中修改
- 🔒 **更新 JWT 密钥**: 使用强随机字符串
- 🔒 **配置 Redis 密码**: 在生产环境中必须设置
- 🔒 **配置 MinIO 访问密钥**: 修改默认的 minioadmin
- 🔒 **配置防火墙规则**: 只开放必要的端口

### 2. 生产环境配置

- 🚀 **配置 Nginx 反向代理**: 统一入口，提供负载均衡
- 🚀 **配置 SSL 证书**: 使用 Let's Encrypt 免费证书
- 🚀 **配置日志轮转**: 防止日志文件过大
- 🚀 **配置数据库备份**: 定期备份数据
- 🚀 **配置监控告警**: 及时发现问题

### 3. 学习使用

- 📚 阅读 [API 文档](./backend/docs/API.md)
- 📚 查看 [项目结构](./backend/src/PROJECT_STRUCTURE.md)
- 📚 了解 [权限系统](./backend/docs/permission-mapping.md)
- 📚 查看 [部署文档](./backend/deploy/DEPLOY.md)

### 4. 定制开发

- 💻 查看 [后端架构](./backend/src/modules/ARCHITECTURE.md)
- 💻 查看 [数据模型](./backend/src/models/MODELS_STRUCTURE.md)
- 💻 了解模块化开发方式
- 💻 根据业务需求定制功能

---

## 获取帮助

如果您遇到问题：

1. 查看本文档的[常见问题](#常见问题)部分
2. 查看项目的 GitHub Issues
3. 查看详细的日志文件：
   - 后端日志: `backend/logs/`
   - PM2 日志: `pm2 logs owl-backend`
   - PostgreSQL 日志: `/var/log/postgresql/`
   - Redis 日志: `/var/log/redis/`

---

## 许可证

MIT License

---

**祝您使用愉快！** 🎉
