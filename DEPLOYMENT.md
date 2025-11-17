# owl管理系统 - 部署文档

本文档提供完整的项目部署指南。

## 目录

- [前置要求](#前置要求)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [环境配置详解](#环境配置详解)
- [常见问题](#常见问题)
- [运维命令速查](#运维命令速查)

---

## 前置要求

### 软件环境

确保以下服务已安装并正常运行：

| 软件 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | 18+ | 前后端运行环境 |
| PostgreSQL | 14+ | 数据库 |
| Redis | 4+ | 缓存（可选，无 Redis 时功能降级） |
| MinIO | Latest | 文件存储 |

### 生产环境额外要求

| 软件 | 用途 |
|------|------|
| PM2 | 进程管理 |
| Nginx | 反向代理 |

---

## 开发环境部署

### 步骤 1: 下载并解压项目

```bash
# 解压项目到目标目录
unzip owl_platform.zip -d ~/projects/
cd ~/projects/counttech_owl_platform
```

### 步骤 2: 创建数据库

连接到 PostgreSQL 创建数据库：

```bash
# 连接 PostgreSQL
psql -U postgres

# 或使用其他数据库管理工具
```

执行以下 SQL：

```sql
-- 创建数据库
CREATE DATABASE owl_management;

-- 退出
\q
```

### 步骤 3: 导入数据库脚本

按顺序执行项目提供的 SQL 脚本：

```bash
cd backend

# 1. 导入表结构
psql -U postgres -d owl_management -f sql/schema-complete.sql

# 2. 导入初始数据（权限、角色、菜单、管理员账号等）
psql -U postgres -d owl_management -f sql/init-data.sql
```

**说明：**
- `schema-complete.sql` - 创建所有数据表、枚举类型、触发器
- `init-data.sql` - 导入系统初始数据（管理员账号: admin/admin123）

### 步骤 4: 配置 MinIO

登录 MinIO 控制台（默认 http://localhost:9001），创建存储桶：

1. 登录（用户名/密码：minioadmin/minioadmin）
2. 创建存储桶，名称：`owl`
3. 设置访问权限（可选）

### 步骤 5: 配置后端环境变量

创建并编辑 `.env` 文件：

```bash
cd backend
nano .env  # 或使用其他编辑器
```

**基本配置：**

```bash
# 服务器配置
NODE_ENV=development
PORT=3001

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=owl_management
DB_USER=postgres
DB_PASSWORD=your_password

# Redis 配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 密钥（运行下面命令生成）
JWT_SECRET=生成的密钥
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=生成的密钥
JWT_REFRESH_EXPIRES_IN=7d

# MinIO 配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=owl

# CORS 配置
CORS_ORIGIN=*

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**生成 JWT 密钥：**
```bash
# 生成 JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成 JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤 6: 安装后端依赖并启动

```bash
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

后端服务启动在 `http://localhost:3001`

**验证后端：**
```bash
curl http://localhost:3001/api/health
```

### 步骤 7: 安装前端依赖并启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务启动在 `http://localhost:3000`

### 步骤 8: 访问系统

浏览器访问：http://localhost:3000

**默认账号：**
- 用户名：`admin`
- 密码：`admin123`

---

## 生产环境部署

### 部署架构

```
Internet
   ↓
Nginx (80/443)
   ↓
   ├─→ Frontend (Next.js) :3000
   └─→ Backend (PM2) :5002
        ↓
        ├─→ PostgreSQL :5432
        ├─→ Redis :6379
        └─→ MinIO :9000
```

### 1. 上传项目文件

```bash
# 方式 1: scp 上传
scp owl_platform.zip user@server:/tmp/
ssh user@server
cd /var/www
sudo unzip /tmp/owl_platform.zip
sudo mv counttech_owl_platform owl_platform
sudo chown -R $USER:$USER owl_platform

# 方式 2: rsync 同步
rsync -avz ./counttech_owl_platform/ user@server:/var/www/owl_platform/
```

### 2. 初始化生产数据库

```bash
cd /var/www/owl_platform/backend

# 创建生产数据库
psql -U postgres -c "CREATE DATABASE owl_management_prod;"

# 导入 SQL 脚本
psql -U postgres -d owl_management_prod -f sql/schema-complete.sql
psql -U postgres -d owl_management_prod -f sql/init-data.sql
```

### 3. 配置生产环境变量

```bash
cd /var/www/owl_platform/backend
nano .env
```

**生产配置：**

```bash
# 服务器配置
NODE_ENV=production
PORT=5002

# 数据库配置（使用生产数据库）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=owl_management_prod
DB_USER=postgres
DB_PASSWORD=强密码

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 密钥（必须使用强密钥）
JWT_SECRET=生产环境强密钥
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=生产环境刷新密钥
JWT_REFRESH_EXPIRES_IN=7d

# MinIO 配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your_key
MINIO_SECRET_KEY=your_secret
MINIO_BUCKET=owl

# CORS 配置（重要：改为实际域名）
CORS_ORIGIN=https://yourdomain.com

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4. 部署后端（PM2）

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 安装依赖
cd /var/www/owl_platform/backend
npm install --production

# 使用 PM2 启动
pm2 start ecosystem.config.js --env production

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs owl-backend
```

### 5. 部署前端

```bash
cd /var/www/owl_platform/frontend

# 安装依赖
npm install

# 生产构建
npm run build

# 使用 PM2 启动
cd .next/standalone
pm2 start server.js --name owl-frontend
pm2 save
```

### 6. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/owl`：

```nginx
upstream backend {
    server 127.0.0.1:5002;
    keepalive 64;
}

upstream frontend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com;

    # 日志
    access_log /var/log/nginx/owl_access.log;
    error_log /var/log/nginx/owl_error.log;

    # 上传大小限制
    client_max_body_size 100M;

    # 根路径重定向
    location = / {
        return 301 /owl;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # WebSocket 支持
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_read_timeout 86400;
    }

    # 前端应用（/owl 路径）
    location /owl/ {
        proxy_pass http://frontend/owl/;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_cache_bypass $http_upgrade;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/owl /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载
sudo systemctl reload nginx
```

### 7. 配置 HTTPS（可选）

```bash
# 使用 Certbot
sudo certbot --nginx -d yourdomain.com

# 测试自动续期
sudo certbot renew --dry-run
```

---

## 环境配置详解

### .env 配置项说明

```bash
# ==================== 服务器配置 ====================
NODE_ENV                 # 环境模式：development | production
PORT                     # 后端端口（开发：3001，生产：5002）

# ==================== 数据库配置 ====================
DB_HOST                  # 数据库地址
DB_PORT                  # 数据库端口（默认 5432）
DB_NAME                  # 数据库名称
DB_USER                  # 数据库用户
DB_PASSWORD              # 数据库密码

# ==================== Redis 配置 ====================
REDIS_HOST               # Redis 地址
REDIS_PORT               # Redis 端口（默认 6379）
REDIS_PASSWORD           # Redis 密码（可选）

# 注意：无 Redis 时系统会降级，核心功能不受影响

# ==================== JWT 配置 ====================
JWT_SECRET               # 访问令牌密钥（32字节十六进制）
JWT_EXPIRES_IN           # 访问令牌有效期（如：24h、7d）
JWT_REFRESH_SECRET       # 刷新令牌密钥
JWT_REFRESH_EXPIRES_IN   # 刷新令牌有效期

# ==================== MinIO 配置 ====================
MINIO_ENDPOINT           # MinIO 地址
MINIO_PORT               # MinIO 端口（默认 9000）
MINIO_USE_SSL            # 是否使用 SSL
MINIO_ACCESS_KEY         # Access Key
MINIO_SECRET_KEY         # Secret Key
MINIO_BUCKET             # 存储桶名称

# ==================== CORS 配置 ====================
CORS_ORIGIN              # 允许的跨域源
                         # 开发：* （所有源）
                         # 生产：https://yourdomain.com

# ==================== 限流配置 ====================
RATE_LIMIT_WINDOW_MS     # 时间窗口（毫秒）
RATE_LIMIT_MAX           # 窗口内最大请求数
```

---

## 常见问题

### 1. 数据库连接失败

**问题：** 提示无法连接数据库

**解决：**

1. 检查数据库是否运行
2. 验证 `.env` 中的数据库配置
3. 测试连接：
   ```bash
   psql -U postgres -h localhost -d owl_management
   ```

### 2. SQL 脚本导入失败

**问题：** 运行 SQL 脚本时出错

**解决：**

1. 确保按顺序执行：先 `schema-complete.sql`，后 `init-data.sql`
2. 如果数据库已有数据，先清空：
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
3. 查看错误日志：
   ```bash
   psql -U postgres -d owl_management -f sql/schema-complete.sql 2>&1 | tee error.log
   ```

### 3. 端口被占用

**问题：** 启动时提示端口占用

**解决：**

```bash
# 查找占用进程
lsof -i :3001
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或修改 .env 中的 PORT
```

### 4. MinIO 文件上传失败

**问题：** 上传文件报错

**解决：**

1. 确认 MinIO 运行正常
2. 验证存储桶 `owl` 是否存在
3. 检查 `.env` 中的 MinIO 配置
4. 检查存储桶权限设置

### 5. 前端构建失败

**问题：** `npm run build` 失败

**解决：**

```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build

# 检查 Node.js 版本
node --version  # 应为 v18+
```

### 6. PM2 进程异常

**问题：** PM2 进程频繁重启

**解决：**

```bash
# 查看日志
pm2 logs owl-backend --lines 50

# 检查内存
pm2 monit

# 检查 .env 配置
```

### 7. Nginx 502 错误

**问题：** 访问网站返回 502

**解决：**

```bash
# 检查后端和前端服务
pm2 status

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/owl_error.log

# 重启服务
pm2 restart all
sudo systemctl restart nginx
```

---

## 运维命令速查

### 后端服务

```bash
# 开发环境
npm run dev              # 启动开发服务器

# 生产环境
pm2 start ecosystem.config.js --env production  # 启动
pm2 restart owl-backend  # 重启
pm2 stop owl-backend     # 停止
pm2 logs owl-backend     # 查看日志
pm2 monit                # 监控
```

### 前端服务

```bash
# 开发环境
npm run dev              # 启动开发服务器

# 生产环境
npm run build            # 构建
npm start                # 启动
```

### 数据库管理

```bash
# 导入 SQL 脚本
psql -U postgres -d owl_management -f sql/schema-complete.sql
psql -U postgres -d owl_management -f sql/init-data.sql

# 备份数据库
pg_dump -U postgres owl_management > backup_$(date +%Y%m%d).sql

# 恢复数据库
psql -U postgres owl_management < backup.sql

# 查看所有表
psql -U postgres -d owl_management -c "\dt"
```

### PM2 管理

```bash
pm2 list                 # 查看所有进程
pm2 start <app>          # 启动
pm2 stop <app>           # 停止
pm2 restart <app>        # 重启
pm2 delete <app>         # 删除
pm2 logs <app>           # 查看日志
pm2 logs <app> --lines 100  # 查看最近 100 行
pm2 monit                # 实时监控
pm2 save                 # 保存进程列表
pm2 startup              # 设置开机自启
```

### Nginx 管理

```bash
sudo nginx -t                    # 测试配置
sudo systemctl reload nginx      # 重新加载配置
sudo systemctl restart nginx     # 重启
sudo systemctl status nginx      # 查看状态

# 查看日志
sudo tail -f /var/log/nginx/owl_access.log
sudo tail -f /var/log/nginx/owl_error.log
```

### 系统日志

```bash
# 后端日志
tail -f backend/logs/system/system-*.log
tail -f backend/logs/error/error-*.log

# PM2 日志
pm2 logs owl-backend

# Nginx 日志
sudo tail -f /var/log/nginx/owl_error.log
```

---

## 默认账号说明

系统初始化后会创建默认管理员账号：

- **用户名**: `admin`
- **密码**: `admin123`
- **角色**: 超级管理员
- **权限**: 所有系统权限

**重要：生产环境部署后请立即修改默认密码！**

---

## 安全建议

1. **修改默认密码** - 首次登录后立即修改
2. **使用强密钥** - JWT 密钥使用 32 字节随机字符串
3. **配置 HTTPS** - 生产环境启用 SSL/TLS
4. **限制 CORS** - 生产环境指定具体域名
5. **定期备份** - 数据库和文件定期备份
6. **更新依赖** - 定期运行 `npm audit`

---

## 性能优化

1. **启用 Redis** - 提升缓存性能
2. **数据库索引** - 为常用查询添加索引
3. **定期清理日志** - 避免日志文件过大
4. **Nginx 缓存** - 配置静态资源缓存
5. **PM2 集群模式** - 多核 CPU 负载均衡

---

## 技术支持

详细信息请查看：
- [README.md](./README.md) - 项目概览
- [项目计划](./projectplan.md) - 开发记录

---

**最后更新**: 2025-11-14
