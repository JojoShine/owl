# Owl Platform

<div align="center">
  <img src="./frontend/public/logo.png" alt="Owl Platform" width="120" height="120">
  <h3>一个完整的前后端一体通用管理后台基础框架</h3>
  <p>快速构建企业级管理系统，开箱即用的权限、日志、文件、通知等核心能力</p>
</div>

---

## 项目简介

Owl Platform 是一个面向业务系统的**完整前后端一体的管理后台基础框架**，从数据库到页面的全链路实现。

### 为什么选择 Owl Platform？

在业务系统开发中，几乎每个项目都需要一套管理后台来处理：
- 用户与权限管理
- 数据审计与操作日志
- 文件上传与存储
- 系统通知与告警
- 第三方系统接入

**Owl Platform 的目标是：** 让这些通用能力开箱即用，开发者只需专注在业务逻辑本身，而不是重复建设基础设施。

这不仅仅是一个前端 UI 框架，而是一个**完整的业务系统框架**，包含：
- 前端：Next.js + React 组件体系
- 后端：Node.js + Express API 服务
- 数据库：PostgreSQL 数据模型与迁移
- 存储：MinIO 文件管理
- 缓存：Redis 会话与缓存
- 日志：Winston 结构化日志

---

## 核心能力

### 权限管理体系
- RBAC 细粒度权限控制（用户 → 角色 → 权限）
- 菜单权限管理与自动生成
- 数据级访问控制（ALL / 部门 / 本人三级权限）
- 敏感数据访问日志记录与审计

[详见文档](./docs/features/12-menu-permission.md)

### 数据安全防护
- **数据脱敏**：自动隐藏敏感字段（身份证、电话、银行卡等），接口返回时自动处理
- **敏感数据访问日志**：记录所有敏感数据的访问操作，可追溯谁、何时、访问了什么数据
- **数据访问权限控制**：用户级别的业务数据隐私控制，防止数据越权访问

[数据脱敏文档](./docs/features/02-data-masking.md) | [数据访问控制文档](./docs/features/03-data-access-control.md)

### 代码生成器
从数据库表结构一键生成完整的 CRUD 模块：
- 自动生成后端 API（增删改查接口、参数验证）
- 自动生成前端页面（列表、表单、编辑等）
- 自动配置权限检查
- 自动生成数据库迁移脚本

大幅提升开发效率，从数小时缩减到数分钟。

[详见文档](./docs/features/04-code-generator.md)

### 接口开发平台
通过 SQL 快速配置数据接口，无需编码：
- 支持 GET/POST/PUT/DELETE 等多种请求方式
- 参数验证、类型转换、默认值处理
- 内置认证与授权支持
- 速率限制与流量控制
- 支持导出接口调用文档（Markdown 格式）

适合快速开发数据接口、报表接口等业务需求。

[详见文档](./docs/features/05-api-builder.md)

### 第三方系统安全接入
为外部系统提供安全的 API 接入机制：
- API Key 生成与管理
- 请求签名验证（防篡改）
- 速率限制与配额控制
- 访问日志与审计
- 完整的接入流程文档

[详见文档](./docs/features/06-third-party-integration.md)

### 完整的日志系统
支持多层次的日志记录与分析：
- **接口访问日志**：记录所有 API 调用，包括参数、返回值、耗时
- **审计日志**：记录所有数据变更操作（谁、何时、改了什么、改成了什么）
- **监控日志**：接口性能指标、异常告警、健康度检查
- 日志级别、按天归档、前端可视化查看

[详见文档](./docs/features/)

### 多渠道认证与登录
- 账号密码登录
- 短信验证码登录开箱即用
- 完整的会话管理与令牌生成
- 支持多种认证方式扩展

[详见文档](./docs/features/01-sms-login.md)

### 可视化配置系统

**登录页定制**
- 支持自定义布局、样式、文案
- 支持品牌 Logo、背景图、主题色配置
- 无需重新编译，即时生效

[详见文档](./docs/features/10-login-customization.md)

**看板配置**
- 支持 SQL 自定义数据源
- 拖拽式组件配置
- 支持多种图表类型（折线图、柱状图、饼图等）
- 数据实时刷新

[详见文档](./docs/features/11-dashboard.md)

**水印防护**
- 可配置的水印方案
- 防止页面截图分享
- 支持文本/图片水印

[详见文档](./docs/features/09-watermark.md)

### 文件管理服务
基于 MinIO 的完整文件服务：
- 文件上传、下载、删除
- 文件预览、缩略图生成
- 文件分享与访问控制
- 大文件分片上传
- 文件安全扫描

[详见文档](./docs/features/08-file-management.md)

### 多渠道通知系统

**邮件通知**
- SMTP 邮件服务集成
- 支持模板配置
- 支持抄送、密送、附件

**短信通知**
- 集成短信网关（支持阿里云、腾讯云等）
- 自定义消息模板
- 发送状态追踪

**系统通知**
- 应用内实时通知
- WebSocket 推送
- 通知中心与消息记录

**监控告警**
- 接口异常自动告警
- 自定义告警规则
- 多渠道告警推送（邮件、短信、系统通知）

[详见文档](./docs/features/07-notification.md)

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js 14 (App Router) | 现代化 React 框架，支持 SSR/SSG |
| 前端 | Tailwind CSS | 原子化 CSS，快速构建 UI |
| 前端 | shadcn/ui | 高质量 React 组件库 |
| 后端 | Node.js 18+ | JavaScript 运行时 |
| 后端 | Express | 轻量级 Web 框架 |
| 后端 | PostgreSQL 12+ | 关系数据库 |
| 后端 | Sequelize | ORM 框架 |
| 缓存 | Redis 6+ | 会话缓存、速率限制 |
| 存储 | MinIO | 兼容 S3 的文件存储 |
| 日志 | Winston | 结构化日志系统 |
| 部署 | Docker / PM2 | 容器化或进程管理 |
| 部署 | Nginx | 反向代理与负载均衡 |

---

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- MinIO

### 安装与初始化

详细安装步骤请查看 [系统初始化指南](./docs/02-initialization.md)，包含：

- 依赖安装（推荐使用 ant-eyes 工具一键安装）
- 环境配置（开发/生产环境分离）
- 数据库初始化与迁移
- 本地启动
- 生产部署

快速启动命令：

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
cd backend && npm run dev       # 后端服务 :3001
cd frontend && npm run dev      # 前端服务 :3000
```

访问 http://localhost:3000 进行登录（初始账号密码见 [系统初始化指南](./docs/02-initialization.md)）。

---

## 项目结构

```
owl_platform/
├── frontend/                   # 前端应用 (Next.js)
│   ├── app/
│   │   ├── (authenticated)/   # 登录后页面
│   │   ├── auth/              # 认证相关页面
│   │   └── api/               # API 路由
│   ├── components/            # React 组件库
│   ├── lib/
│   │   ├── api/              # API 客户端
│   │   └── utils/            # 工具函数
│   ├── public/               # 静态资源
│   └── deploy/               # 部署脚本
├── backend/                   # 后端应用 (Express)
│   ├── src/
│   │   ├── core/            # 核心模块（权限、日志、文件等）
│   │   ├── business/        # 业务模块
│   │   └── middleware/      # Express 中间件
│   ├── migrations/          # 数据库迁移脚本
│   ├── seeders/             # 初始化数据脚本
│   ├── deploy/              # 部署脚本
│   └── docs/                # API 文档
├── nginx/                    # Nginx 配置示例
│   ├── owl.conf.example     # HTTPS 生产配置
│   ├── owl-http.conf.example # HTTP 配置
│   └── owl-dev.conf.example # 本地开发配置
├── docs/                     # 项目文档
│   ├── 01-overview.md       # 项目总览
│   ├── 02-initialization.md # 初始化指南
│   ├── 03-development-guide.md # 开发指南
│   └── features/            # 功能文档
└── README.md
```

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [项目总览](./docs/01-overview.md) | 项目背景、定位与架构设计 |
| [系统初始化](./docs/02-initialization.md) | 完整的安装、配置、部署指南 |
| [开发指南](./docs/03-development-guide.md) | 开发规范、目录结构、最佳实践 |
| [功能文档](./docs/features/) | 各个功能模块的详细说明 |

---

## 部署

### 本地开发
```bash
npm run dev  # 前后端同时启动
```

### 生产环境
推荐使用 PM2 或 Docker Compose 部署，详见 [系统初始化指南](./docs/02-initialization.md)。

**Nginx 配置示例**
- `nginx/owl-http.conf.example` - HTTP 80 端口（开发/测试环境）
- `nginx/owl.conf.example` - HTTPS 443 端口（生产环境）
- `nginx/owl-dev.conf.example` - 本地开发配置

---

## 常见问题

详见 [系统初始化指南](./docs/02-initialization.md) 的常见问题章节。

---

## 贡献

欢迎提交 Issue 反馈问题或建议。

按照 [贡献指南](./CONTRIBUTING.md) 提交 Pull Request。

---

## 开源协议

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE)。

---

## 联系与反馈

- 提交 Issue：https://github.com/JojoShine/owl/issues
- 邮件反馈：tbtparent@163.com

---

<div align="center">
  Made with ❤️ by JojoShine
</div>
