# owl管理系统

一个通用、配置化的管理后台系统，支持快速开发移动端配套管理系统和PC端业务系统。

## 技术栈

### 前端
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- JavaScript

### 后端
- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- Redis
- Winston (日志)

### 其他
- Minio (文件存储)
- Docker & Docker Compose

## 项目结构

```
common-management-platform/
├── frontend/              # 前端应用
├── backend/              # 后端应用
├── shared/               # 共享代码和工具
├── docker/               # Docker配置
├── docs/                 # 文档
└── README.md
```

## 快速开始

### 📖 完整安装指南

**请查看详细的安装手册**: [INSTALLATION.md](./INSTALLATION.md)

安装手册包含：
- ✅ 系统要求说明
- ✅ PostgreSQL、MinIO、Redis、Node.js 安装指南
- ✅ 数据库初始化步骤
- ✅ 应用配置详解
- ✅ 常见问题排查
- ✅ 生产环境部署建议

### 前置要求
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- MinIO (对象存储)
- npm 或 pnpm

### 快速安装步骤

1. **安装依赖软件**（详见 [INSTALLATION.md](./INSTALLATION.md)）
   - PostgreSQL
   - Redis
   - MinIO
   - Node.js

2. **配置数据库**
```bash
# 创建数据库
sudo -u postgres psql
CREATE DATABASE owl_platform;
CREATE USER owl_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE owl_platform TO owl_admin;
\q

# 执行数据库脚本
cd backend
psql -h localhost -U owl_admin -d owl_platform -f sql/schema.sql
psql -h localhost -U owl_admin -d owl_platform -f sql/seeder.sql
```

3. **配置应用**
```bash
# 后端配置
cd backend
npm install
cp .env.example .env
# 编辑 .env 文件，配置数据库、Redis、MinIO 等

# 前端配置
cd ../frontend
npm install
# 创建 .env.local 文件，配置 API 地址
```

4. **启动服务**
```bash
# 启动后端
cd backend
npm run dev

# 启动前端（新终端）
cd frontend
npm run dev
```

5. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:3001
- 默认账号: admin / admin123

## 核心功能

- RBAC权限管理系统
- 文件管理系统 (Minio)
- 定时任务系统
- 数据看板配置系统
- 内容发布系统
- 日志系统 (文件存储)
- 监控系统
- 代码生成模块

## 开发文档

详细文档请查看 [docs](./docs) 目录。

## License

MIT
