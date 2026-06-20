# 系统初始化

本文档说明如何从零开始完成 Owl Platform 的安装与初始化。

---

## 前置依赖

### 开发环境

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 18+ | 运行后端服务 |
| PostgreSQL | 12+ | 主数据库 |
| Redis | 6+ | Session 缓存 |
| MinIO | 最新稳定版 | 文件对象存储 |

### 生产环境（额外）

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Nginx | 1.20+ | 反向代理与静态文件服务 |

### 快速安装依赖

建议使用 [ant-eyes](https://www.npmjs.com/package/ant-eyes) 运维工具包快速安装所有依赖：

```bash
npm install -g ant-eyes
ant-eyes install  # 交互式安装 PostgreSQL、Redis、MinIO 等
```

或手动安装：

**macOS**（使用 Homebrew）
```bash
brew install postgresql redis minio
```

**Ubuntu/Debian**
```bash
sudo apt-get install postgresql redis-server
# MinIO 需从官网下载：https://dl.min.io/server/minio/release/linux-amd64/minio
```

---

## 快速启动

### 1. 克隆项目

```bash
git clone https://github.com/JojoShine/owl owl_platform
cd owl_platform
```

### 2. 一键启动（推荐）

前提条件：
1. PostgreSQL 服务已启动
2. Redis 服务已启动
3. MinIO 服务已启动
4. `backend/.env.local` 已正确配置
5. `frontend/.env.local` 已正确配置

进入后端目录执行：

```bash
cd backend
node scripts/setup.js
```

脚本自动完成：依赖检查 → 安装依赖 → 初始化数据库 → 启动服务

后端：http://localhost:3001 | 前端：http://localhost:3000

---

## 详细初始化步骤

### 1. 克隆项目

```bash
git clone https://github.com/JojoShine/owl owl_platform
cd owl_platform
```

### 2. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 3. 配置环境变量

本项目使用分离的环境配置文件：

- `.env.local` — 本地开发环境配置
- `.env.production` — 生产环境配置

**本地开发环境**

```bash
cd backend
cp .env.example .env.local
```

编辑 `.env.local`：

```bash
# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_NAME=owl
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT（使用以下命令生成随机密钥）
JWT_SECRET=your_random_secret_key_here
JWT_REFRESH_SECRET=your_random_refresh_key_here

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=owl
MINIO_USE_SSL=false

# 短信（可选，仅在启用短信登录时配置）
SMS_ACCESS_KEY_ID=
SMS_ACCESS_KEY_SECRET=
SMS_SIGN_NAME=
SMS_TEMPLATE_CODE=

# 邮件（可选，仅在启用邮件通知时配置）
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASSWORD=

# 应用配置
APP_ENV=development
APP_DEBUG=true
```

**生产环境配置**

```bash
cp .env.example .env.production
```

编辑 `.env.production`，填写生产环境的完整配置：

```bash
# 应用环境
APP_ENV=production
APP_DEBUG=false
NODE_ENV=production

# 数据库 - 生产环境配置
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=owl_prod
DB_USER=owl_db_user
DB_PASSWORD=strong_database_password_here

# Redis - 生产环境配置
REDIS_HOST=your_production_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=strong_redis_password_here

# JWT - 使用强随机密钥
JWT_SECRET=<生成的32位随机十六进制字符串>
JWT_REFRESH_SECRET=<生成的32位随机十六进制字符串>

# MinIO - 生产环境配置
MINIO_ENDPOINT=your_minio_server_domain
MINIO_PORT=9000
MINIO_ACCESS_KEY=production_access_key
MINIO_SECRET_KEY=production_secret_key
MINIO_BUCKET=owl-prod
MINIO_USE_SSL=true

# 短信服务（如启用）
SMS_ACCESS_KEY_ID=your_sms_key_id
SMS_ACCESS_KEY_SECRET=your_sms_key_secret
SMS_SIGN_NAME=your_sms_sign_name
SMS_TEMPLATE_CODE=your_sms_template_code

# 邮件服务（如启用）
SMTP_HOST=your_smtp_host
SMTP_PORT=465
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_smtp_password
```

各配置项说明：
- `DB_*` — PostgreSQL 生产数据库连接信息
- `REDIS_*` — Redis 生产服务器信息
- `JWT_*` — JWT 签名密钥，必须使用强随机值
- `MINIO_*` — MinIO 生产服务器信息，需启用 SSL
- `SMS_*` — 短信服务商配置（如使用）
- `SMTP_*` — 邮件服务配置（如使用）

**生成强随机密钥**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 获取初始账号密码

首次初始化时，系统会创建超级管理员和其他测试账号。

**账号信息查询**

初始化的账号信息存储在 `backend/seeders/sql/seeder.sql` 文件中，可从该文件查找：

```bash
# 查看所有初始账号信息
grep "INSERT INTO.*owl_users" backend/seeders/sql/seeder.sql -A 3
```

输出示例：

```
VALUES ('99e2337b-8676-4414-b71e-d5aff2008616', 'admin', 'admin@example.com',
        '$2a$10$5YMppYUHBWVvENnqLQwWcOksGfUvcbH25Lp6IBUnm9LHAqqUfMSMC', ...
VALUES ('88feb135-7e32-4950-ad65-d6194347d08c', 'manager', 'manager@example.com',
        '$2a$10$QjH97YvOX6PcJyCaXTcLm.xfp.RR4ZLRRWGfbM77E.AEAsv5fjqnC', ...
```

其中第二个值是用户名，第四个值是密码哈希（bcrypt 加密）。

**密码信息**

密码使用 bcrypt 算法加密存储，如需了解原始密码，请联系项目管理员。


### 4. 初始化数据库

**首次初始化（推荐）**

```bash
cd backend

# 完整初始化：删除旧表 → 建立新表 → 导入初始数据
npm run db:reset
```

**更新现有数据库**

如果已有数据库且只需要运行新的迁移/seeder：

```bash
# 仅运行未执行过的迁移和 seeder
npm run db:init
```

> **注意**：`npm run db:reset` 会清空所有数据，添加新的 SQL 文件后首次初始化必须使用此命令，确保新表被正确创建。

### 5. 启动服务

**手动启动**（如不使用一键脚本）

```bash
# 后端（新终端）
cd backend
npm run dev

# 前端（新终端）
cd frontend
npm run dev
```

访问 http://localhost:3000，使用初始化输出的账号密码登录。

---

## 数据库命令说明

| 命令 | 说明 | 场景 |
|------|------|------|
| `npm run db:reset` | **完整重置** — 删表 → 建表 → 导入数据 | ✅ 首次初始化、添加新 SQL 后、完全重置 |
| `npm run db:init` | 建表 + 导入初始数据（仅运行未执行的迁移/seeder） | 表已存在，只需更新代码后的迁移/seeder |
| `npm run db:migrate` | 仅执行建表 migration | 不需要初始数据 |
| `npm run db:seed` | 仅导入初始数据 | 表已存在 |
| `npm run db:migrate:undo` | 回滚表结构 | 需要重新创建表 |
| `npm run db:seed:undo` | 回滚初始数据 | 清空初始数据但保留表结构 |

**重要提示**：
- 🔴 **新开发者拿到项目**：使用 `npm run db:reset`（完整初始化）
- 🟡 **添加了新的 SQL 文件后**：如果 001 migration 已执行过，必须使用 `npm run db:reset`，否则新表不会被创建
- 🟢 **只是更新代码中的 migration/seeder**：可以使用 `npm run db:init`

---

## 生产环境部署

### 前端构建与部署

**构建打包**

```bash
cd frontend
npm run build  # 生成 .next 产物
```

**自动化部署**

```bash
# 执行部署脚本，自动打包并生成压缩包
./deploy.sh

# 脚本会输出压缩包路径，用于上传到生产服务器
# 示例输出：deployment/frontend-20240115-143022.tar.gz
```

**部署到服务器**

```bash
# 1. 上传压缩包到生产服务器
scp deployment/frontend-*.tar.gz user@production-server:/opt/owl/

# 2. 服务器端解压和启动
cd /opt/owl
tar -xzf frontend-*.tar.gz
npm start
# 或使用 PM2
pm2 start npm --name "owl-frontend" -- start
```

### 后端构建与部署

**自动化部署**

```bash
cd backend/deploy
./deploy.sh

# 脚本会构建 Node.js 应用并生成可部署的产物
```

**使用 PM2 在生产环境启动**

```bash
# 安装 PM2（全局）
npm install -g pm2

# 启动后端应用
cd /opt/owl/backend
pm2 start ecosystem.config.js --env production

# 查看运行状态
pm2 status
pm2 logs owl-backend

# 配置开机自启
pm2 startup
pm2 save
```

### Nginx 反向代理配置

项目提供两份 Nginx 配置示例供选择：

#### 方案一：HTTP 80 端口（开发/测试环境）

创建 `/etc/nginx/sites-available/owl-http.conf`：

```bash
# 使用项目提供的示例配置
sudo cp nginx/owl-http.conf.example /etc/nginx/sites-available/owl-http.conf
```

编辑配置，修改 `server_name`：

```bash
sudo vi /etc/nginx/sites-available/owl-http.conf
```

启用配置：

```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/owl-http.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# macOS
sudo nginx -t
sudo nginx -s reload
```

#### 方案二：HTTPS + SSL（生产环境）

创建 `/etc/nginx/sites-available/owl.conf`：

```bash
# 使用项目提供的示例配置
sudo cp nginx/owl.conf.example /etc/nginx/sites-available/owl.conf
```

编辑配置，修改以下内容：

```bash
sudo vi /etc/nginx/sites-available/owl.conf
```

**需要修改的内容**

1. 修改 `server_name`（你的域名）：
```nginx
server_name your-domain.com www.your-domain.com;
```

2. 修改 SSL 证书路径：
```nginx
ssl_certificate /etc/ssl/certs/your-domain.crt;
ssl_certificate_key /etc/ssl/private/your-domain.key;
```

3. 修改日志路径（可选）：
```nginx
access_log /var/log/nginx/owl-access.log;
error_log /var/log/nginx/owl-error.log;
```

启用配置：

```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/owl.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# macOS
sudo nginx -t
sudo nginx -s reload
```

### 完整 Nginx 配置说明

两份配置都包含以下核心功能：

- **API 后端代理**（`/api/*`）— 转发到后端服务 3001 端口
- **WebSocket 支持**（`/socket.io`）— 实时通知需要
- **前端代理**（`/`）— 转发到前端服务 3000 端口
- **请求体大小限制** — 最大 100M（支持大文件上传）
- **超时配置** — 连接/发送/读取各 60 秒

HTTPS 方案额外提供：
- HTTP 自动重定向至 HTTPS
- TLS 1.2+ 加密
- 静态资源缓存
- 安全加固

### 生产环境安全建议

- **修改默认密码**：登录后立即修改管理员密码
- **强化 JWT 密钥**：使用 32 位随机十六进制字符串，永不泄露
- **数据库安全**：
  - 使用强密码
  - 限制数据库访问 IP
  - 启用 SSL 连接
- **Redis 安全**：
  - 设置访问密码
  - 限制访问 IP
  - 不使用默认端口
- **MinIO 安全**：
  - 修改默认 access key / secret key
  - 启用 HTTPS
  - 限制访问 IP
- **Nginx 安全**：
  - 启用 HTTPS 和 TLS 1.2+
  - 配置速率限制（可选）
  - 隐藏服务器版本号
  - 定期检查和更新

---

## 常见问题

**数据库连接失败**

检查 `.env.local` 中 DB 配置是否正确，并确认 PostgreSQL 服务已启动：
```bash
sudo systemctl status postgresql
```

**Redis 连接失败**

```bash
redis-cli ping  # 应返回 PONG
```

**MinIO bucket 不存在**

登录 MinIO 控制台（http://localhost:9001），手动创建名为 `owl` 的 bucket。

**端口冲突**

```bash
lsof -i :3000  # 查看占用进程
kill -9 <PID>
```
