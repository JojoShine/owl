# Owl Platform

一个前后端一体的通用管理后台基础框架，帮助快速开发业务系统的管理后台。

## 项目定位

Owl Platform 是一个**面向业务系统的通用管理后台基础框架**。新建项目时，管理后台的基础能力开箱即用，开发者只需专注在业务逻辑本身。

与现有方案（如 vue-element-admin、AntD Pro）不同，Owl Platform 不是纯前端模板，而是从数据库到页面的**完整前后端框架**，包含日志、权限、文件管理、代码生成等开箱即用的核心能力。

详见 [项目总览](./docs/01-overview.md)。

## 技术栈

**前端**
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui

**后端**
- Node.js + Express
- PostgreSQL + Sequelize ORM
- Redis
- Winston (日志)

**存储与部署**
- MinIO (文件对象存储)
- Docker Compose / PM2

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- MinIO

### 安装与初始化

详见 [系统初始化指南](./docs/02-initialization.md)，包含：

- 依赖安装（推荐使用 ant-eyes 工具）
- 环境配置（开发/生产环境分离）
- 数据库初始化
- 本地启动与生产部署

快速启动：

```bash
# 克隆项目
git clone https://github.com/JojoShine/owl owl_platform
cd owl_platform

# 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 配置环境变量
cd ../backend && cp .env.example .env.local
# 编辑 .env.local，填写数据库、Redis、MinIO 等信息

# 初始化数据库
npm run db:init

# 启动服务
cd backend && npm run dev   # 后端 3001
cd frontend && npm run dev  # 前端 3000
```

访问 http://localhost:3000 进行登录（初始账号密码见 [系统初始化指南](./docs/02-initialization.md)）。

## 核心功能

### 系统管理
- 用户、角色、权限管理（RBAC）
- 菜单管理与权限自动生成
- 部门、数据字典、系统配置

### 数据安全
- 数据访问权限控制（ALL / 部门 / 本人）
- 数据脱敏（敏感字段自动隐藏）
- 敏感数据访问日志

### 业务能力
- 代码生成器（基于表结构一键生成 CRUD 模块）
- 看板（支持 SQL 自定义）
- 日志（接口/审计/监控日志）
- 监控与告警

### 开发者工具
- 接口开发平台（快速配置数据接口）
- 第三方接入（API Key + 签名验证）
- 文件管理（MinIO 集成）
- 邮件/短信通知

### 用户体验
- 短信验证码登录
- 登录页布局自定义
- 水印（防截图分享）

详见 [功能文档](./docs/features/)。

## 亮点特性

- **开箱即用**：完整的权限、日志、文件、通知体系
- **代码生成**：从数据表一键生成完整 CRUD 模块
- **数据权限**：用户级别的业务数据隐私控制
- **灵活接口**：快速配置数据接口，无需编码
- **第三方对接**：安全的 API Key 签名机制
- **可视化配置**：登录页、看板、水印等运行时配置

## 文档

| 文档 | 说明 |
|------|------|
| [项目总览](./docs/01-overview.md) | 项目背景、定位与核心模块 |
| [系统初始化](./docs/02-initialization.md) | 安装、部署、环境配置指南 |
| [开发指南](./docs/03-development-guide.md) | 开发规范与最佳实践 |
| [功能文档](./docs/features/) | 各核心功能详细说明 |

## 项目结构

```
owl_platform/
├── frontend/              # 前端应用 (Next.js)
│   ├── app/              # 页面与路由
│   ├── components/       # React 组件
│   ├── lib/             # 工具与 API 客户端
│   └── deploy/          # 部署脚本
├── backend/              # 后端应用 (Express)
│   ├── src/             # 源代码
│   ├── migrations/      # 数据库迁移
│   ├── seeders/         # 初始化数据
│   ├── deploy/          # 部署脚本
│   └── docs/            # API 文档
├── nginx/               # Nginx 配置示例
├── docs/                # 项目文档
└── README.md
```

## 部署

### 生产环境

使用 PM2 或 Docker Compose 部署。详见 [系统初始化指南](./docs/02-initialization.md) 的生产部署章节。

**Nginx 配置**

项目提供两份 Nginx 配置示例：

- `nginx/owl-http.conf.example` - HTTP 80 端口（开发/测试环境）
- `nginx/owl.conf.example` - HTTPS 443 端口（生产环境）

## 常见问题

详见 [系统初始化指南](./docs/02-initialization.md) 的常见问题章节。

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request。

## 联系方式

如有问题或建议，请提交 GitHub Issue。
