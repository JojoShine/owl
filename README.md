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

### 前置要求
- Node.js 18+
- Docker & Docker Compose
- pnpm (推荐) 或 npm

### 安装依赖
```bash
pnpm install
```

### 启动开发环境
```bash
# 启动Docker服务（PostgreSQL、Redis、Minio）
docker-compose up -d

# 启动前端开发服务器
cd frontend
pnpm dev

# 启动后端开发服务器
cd backend
pnpm dev
```

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
