# owl管理系统 - 项目需求与规划

## 项目概述

**项目名称**: owl管理系统 (OWL Management Platform)

**项目定位**: 一个通用、配置化的管理后台系统，支持快速开发移动端配套管理系统和PC端业务系统。

**技术栈**:
- **前端**: Next.js 15 (App Router) + Tailwind CSS + shadcn/ui + JavaScript
- **后端**: Node.js + Express + PostgreSQL + Sequelize ORM + Redis
- **存储**: Minio (对象存储)
- **部署**: Docker & Docker Compose

---

## 已完成模块

### 1. ✅ 基础权限管理系统 (RBAC)

#### 1.1 用户管理
**位置**: `/setting/users`

**功能特性**:
- ✅ 用户列表展示（分页、搜索）
- ✅ 创建/编辑/删除用户
- ✅ 用户状态管理（启用/禁用）
- ✅ 用户角色分配
- ⏳ 用户部门分配
- ✅ 用户信息字段：
  - 用户名 (username)
  - 邮箱 (email)
  - 真实姓名 (real_name)
  - 手机号 (phone)
  - 密码 (加密存储)
  - 状态 (active/inactive)
  - 部门 (department_id)

**数据库表**: `users`

**API端点**:
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

---

#### 1.1.1 部门管理
**位置**: `/setting/departments`

**功能特性**:
- [ ] 部门树形展示
- [ ] 创建/编辑/删除部门
- [ ] 部门排序
- [ ] 部门状态管理
- [ ] 支持多级部门（树形结构）
- [ ] 部门成员管理
- [ ] 部门负责人设置
- [ ] 统计看板（部门总数、成员数量）
- [ ] 部门信息字段：
  - 部门名称 (name)
  - 部门代码 (code)
  - 父部门 (parent_id)
  - 部门负责人 (leader_id)
  - 描述 (description)
  - 排序 (sort)
  - 状态 (status: active/inactive)

**数据库设计**:
```sql
-- 部门表
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE,
  parent_id UUID REFERENCES departments(id),
  leader_id UUID REFERENCES users(id),
  description TEXT,
  sort INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 用户表添加部门字段
ALTER TABLE users ADD COLUMN department_id UUID REFERENCES departments(id);
```

**API端点**:
- `GET /api/departments/tree` - 获取部门树
- `GET /api/departments` - 获取部门列表
- `POST /api/departments` - 创建部门
- `GET /api/departments/:id` - 获取部门详情
- `PUT /api/departments/:id` - 更新部门
- `DELETE /api/departments/:id` - 删除部门
- `GET /api/departments/:id/members` - 获取部门成员列表
- `POST /api/departments/:id/members` - 添加部门成员
- `DELETE /api/departments/:id/members/:userId` - 移除部门成员

**前端组件**:
- 部门树形选择器（用于用户分配部门）
- 部门管理页面（树形展示+CRUD）
- 部门成员列表
- 部门统计卡片

**待开发任务**:
1. [ ] 创建部门管理数据库表
2. [ ] 实现部门管理后端API
3. [ ] 创建部门管理前端页面
4. [ ] 在用户管理中集成部门选择
5. [ ] 实现部门树形组件
6. [ ] 添加部门统计功能

---

#### 1.2 角色管理
**位置**: `/setting/roles`

**功能特性**:
- ✅ 角色列表展示（分页、搜索）
- ✅ 创建/编辑/删除角色
- ✅ 角色状态管理
- ✅ 角色权限分配
- ✅ 角色菜单分配
- ✅ 角色信息字段：
  - 角色名称 (name)
  - 角色代码 (code)
  - 描述 (description)
  - 状态 (active/inactive)
  - 排序 (sort)

**数据库表**: `roles`, `role_permissions`, `role_menus`, `user_roles`

**API端点**:
- `GET /api/roles` - 获取角色列表
- `POST /api/roles` - 创建角色
- `GET /api/roles/:id` - 获取角色详情
- `PUT /api/roles/:id` - 更新角色
- `DELETE /api/roles/:id` - 删除角色
- `POST /api/roles/:id/permissions` - 分配权限
- `POST /api/roles/:id/menus` - 分配菜单

---

#### 1.3 权限管理
**位置**: `/setting/permissions`

**功能特性**:
- ✅ 权限列表展示（分页、搜索）
- ✅ 权限查看（只读模式）
- ✅ 权限分类展示
- ✅ 权限信息字段：
  - 权限名称 (name)
  - 权限代码 (code)
  - 资源 (resource)
  - 操作 (action: create/read/update/delete)
  - 描述 (description)
  - 分类 (category)

**数据库表**: `permissions`

**API端点**:
- `GET /api/permissions` - 获取权限列表
- `GET /api/permissions/:id` - 获取权限详情

**预设权限**:
- 用户管理：`user:read`, `user:create`, `user:update`, `user:delete`
- 角色管理：`role:read`, `role:create`, `role:update`, `role:delete`
- 权限管理：`permission:read`, `permission:create`, `permission:update`, `permission:delete`
- 菜单管理：`menu:read`, `menu:create`, `menu:update`, `menu:delete`

---

#### 1.4 菜单管理
**位置**: `/setting/menus`

**功能特性**:
- ✅ 菜单树形展示
- ✅ 创建/编辑/删除菜单
- ✅ 菜单排序
- ✅ 菜单状态管理
- ✅ 菜单可见性控制
- ✅ 支持多级菜单
- ✅ 菜单权限绑定
- ✅ 统计看板（菜单总数、启用数、隐藏数）
- ✅ 菜单信息字段：
  - 菜单名称 (name)
  - 路径 (path)
  - 图标 (icon)
  - 类型 (type: menu/button/link)
  - 父菜单 (parent_id)
  - 排序 (sort)
  - 状态 (status: active/inactive)
  - 可见性 (visible)
  - 权限代码 (permission_code)

**数据库表**: `menus`

**API端点**:
- `GET /api/menus/tree` - 获取菜单树
- `POST /api/menus` - 创建菜单
- `GET /api/menus/:id` - 获取菜单详情
- `PUT /api/menus/:id` - 更新菜单
- `DELETE /api/menus/:id` - 删除菜单
- `GET /api/menus/user-menus` - 获取用户菜单（根据权限）

---

#### 1.5 认证系统
**位置**: `/login`, `/register`

**功能特性**:
- ✅ 用户登录（JWT Token）
- ✅ 用户注册
- ✅ Token刷新机制
- ✅ 登出功能
- ✅ 会话管理（Redis）
- ✅ 密码加密（bcrypt）

**API端点**:
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新Token
- `GET /api/auth/me` - 获取当前用户信息

---

## 待构建模块

### 2. ⏳ 文件管理系统

**位置**: `/dashboard/files` 或 `/files`

**功能需求**:
- [ ] 文件上传（支持拖拽、批量上传）
- [ ] 文件列表展示（网格视图/列表视图）
- [ ] 文件分类/目录管理
- [ ] 文件预览（图片、PDF、视频等）
- [ ] 文件下载
- [ ] 文件删除（支持批量）
- [ ] 文件搜索（按名称、类型、大小、日期）
- [ ] 文件重命名
- [ ] 文件移动/复制
- [ ] 文件分享（生成临时链接）
- [ ] 存储空间统计
- [ ] 文件类型统计

**数据库设计**:
```sql
-- 文件表
CREATE TABLE files (
  id UUID PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size BIGINT,
  path VARCHAR(500),
  bucket VARCHAR(100),
  folder_id UUID REFERENCES folders(id),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 文件夹表
CREATE TABLE folders (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES folders(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**技术方案**:
- 存储：Minio (已配置)
- 文件处理：`multer` + `sharp` (图片处理)
- 预览：前端使用 `react-pdf-viewer`, `video.js` 等

**API端点设计**:
- `POST /api/files/upload` - 上传文件
- `GET /api/files` - 获取文件列表
- `GET /api/files/:id` - 获取文件详情
- `GET /api/files/:id/download` - 下载文件
- `DELETE /api/files/:id` - 删除文件
- `PUT /api/files/:id` - 更新文件信息
- `POST /api/files/:id/share` - 生成分享链接
- `GET /api/folders` - 获取文件夹列表
- `POST /api/folders` - 创建文件夹

---

### 3. ⏳ 日志系统

**位置**: `/dashboard/logs` 或 `/system/logs`

**功能需求**:
- [ ] 操作日志记录（用户操作轨迹）
- [ ] 系统日志记录（错误、警告、信息）
- [ ] 登录日志记录
- [ ] API访问日志
- [ ] 日志查询（多条件筛选）
- [ ] 日志导出（CSV、JSON）
- [ ] 日志统计分析
- [ ] 日志归档（按时间自动归档）
- [ ] **日志备份到 Minio**（支持设定备份频率）
- [ ] 日志可视化（图表展示）

**日志类型**:
1. **操作日志**: 记录用户的CRUD操作
2. **登录日志**: 记录用户登录/登出
3. **系统日志**: 记录系统错误和警告
4. **API日志**: 记录API请求和响应

**日志存储方案**:
- **不使用数据库表存储日志**
- 日志存储在 `backend/logs/` 文件夹中
- 日志文件按类型和日期分类：
  - `logs/operation/operation-2025-10-15.log`
  - `logs/login/login-2025-10-15.log`
  - `logs/system/system-2025-10-15.log`
  - `logs/api/api-2025-10-15.log`
  - `logs/error/error-2025-10-15.log`

**日志备份到 Minio**:
- 支持定时备份到 Minio 对象存储
- 备份频率可配置：每天、每周、每月
- 备份后可选择删除本地日志文件（释放磁盘空间）
- 备份路径：`logs/{type}/{year}/{month}/{filename}`
- 从 Minio 恢复日志到本地查看

**技术方案**:
- 日志记录：Winston (已配置)
  - 使用 `winston-daily-rotate-file` 实现日志按日期轮转
  - 配置最大文件大小和保留天数
- 日志存储：**文件系统** (不使用数据库)
- 日志备份：Node-cron 定时任务 + Minio SDK
- 日志解析：读取日志文件并解析为JSON格式
- 日志分析：自定义统计 + 可视化图表

**日志配置示例**:
```javascript
// Winston 配置
{
  transports: [
    new winston.transports.DailyRotateFile({
      dirname: 'logs/operation',
      filename: 'operation-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d', // 保留30天
      format: winston.format.json()
    })
  ]
}

// 备份配置
{
  enabled: true,
  frequency: 'daily', // daily/weekly/monthly
  time: '02:00', // 备份时间
  deleteLocal: true, // 备份后删除本地文件
  minioPath: 'logs'
}
```

**API端点设计**:
- `GET /api/logs/operations` - 获取操作日志（从文件读取）
- `GET /api/logs/logins` - 获取登录日志
- `GET /api/logs/system` - 获取系统日志
- `GET /api/logs/api` - 获取API日志
- `GET /api/logs/stats` - 获取日志统计
- `POST /api/logs/export` - 导出日志
- `GET /api/logs/files` - 获取日志文件列表（本地+Minio）
- `POST /api/logs/backup` - 手动备份到Minio
- `POST /api/logs/restore` - 从Minio恢复日志到本地
- `GET /api/logs/config` - 获取日志配置
- `PUT /api/logs/config` - 更新日志配置

---

### 4. ⏳ 监控系统

**位置**: `/dashboard/monitor` 或 `/system/monitor`

**功能需求**:
- [ ] 系统性能监控
  - CPU使用率
  - 内存使用率
  - 磁盘使用率
  - 网络流量
- [ ] 应用监控
  - API响应时间
  - 请求成功率
  - 错误率统计
  - 并发用户数
- [ ] 数据库监控
  - 连接池状态
  - 慢查询日志
  - 数据库大小
- [ ] 缓存监控
  - Redis连接状态
  - 缓存命中率
  - 内存使用情况
- [ ] **接口监控（API健康检查）**
  - 支持 HTTP/HTTPS 接口监控
  - 支持 curl 基础模板测试
  - 请求方法：GET、POST、PUT、DELETE
  - 请求配置：URL、Headers、Body
  - 响应验证：状态码、响应时间、响应内容
  - 定时检测（可配置检测间隔）
  - 监控历史记录
  - 异常告警
- [ ] 实时监控面板
- [ ] 告警配置
- [ ] 历史数据查询
- [ ] 监控报告生成

**数据库设计**:
```sql
-- 监控数据表
CREATE TABLE monitor_metrics (
  id UUID PRIMARY KEY,
  metric_type VARCHAR(50),
  metric_name VARCHAR(100),
  value DECIMAL,
  unit VARCHAR(20),
  tags JSON,
  created_at TIMESTAMP
);

-- 接口监控配置表
CREATE TABLE api_monitors (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  method VARCHAR(10) DEFAULT 'GET',
  headers JSON,
  body TEXT,
  interval INTEGER DEFAULT 60,
  timeout INTEGER DEFAULT 30,
  expect_status INTEGER DEFAULT 200,
  expect_response TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 接口监控历史表
CREATE TABLE api_monitor_logs (
  id UUID PRIMARY KEY,
  monitor_id UUID REFERENCES api_monitors(id),
  status VARCHAR(20),
  status_code INTEGER,
  response_time INTEGER,
  response_body TEXT,
  error_message TEXT,
  created_at TIMESTAMP
);

-- 告警配置表
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  metric_type VARCHAR(50),
  condition VARCHAR(20),
  threshold DECIMAL,
  duration INTEGER,
  enabled BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 告警历史表
CREATE TABLE alert_history (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES alert_rules(id),
  message TEXT,
  level VARCHAR(20),
  status VARCHAR(20),
  created_at TIMESTAMP,
  resolved_at TIMESTAMP
);
```

**技术方案**:
- 系统监控：`systeminformation` npm包
- 接口监控：`axios` + `node-cron` 定时任务
- 实时数据：WebSocket 或 Server-Sent Events
- 数据可视化：Chart.js 或 Recharts
- 告警：邮件 + WebSocket推送

**API端点设计**:
- `GET /api/monitor/system` - 获取系统指标
- `GET /api/monitor/application` - 获取应用指标
- `GET /api/monitor/database` - 获取数据库指标
- `GET /api/monitor/cache` - 获取缓存指标
- `GET /api/monitor/history` - 获取历史数据
- `POST /api/monitor/alerts` - 创建告警规则
- `GET /api/monitor/alerts` - 获取告警规则
- **接口监控相关**:
  - `GET /api/monitor/apis` - 获取接口监控列表
  - `POST /api/monitor/apis` - 创建接口监控
  - `GET /api/monitor/apis/:id` - 获取监控详情
  - `PUT /api/monitor/apis/:id` - 更新监控配置
  - `DELETE /api/monitor/apis/:id` - 删除监控
  - `POST /api/monitor/apis/:id/test` - 立即测试接口
  - `GET /api/monitor/apis/:id/logs` - 获取监控历史记录

**接口监控配置示例**:
```json
{
  "name": "生产环境API健康检查",
  "url": "https://api.example.com/health",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer xxx",
    "Content-Type": "application/json"
  },
  "body": null,
  "interval": 60,
  "timeout": 30,
  "expect_status": 200,
  "expect_response": "{\"status\":\"ok\"}",
  "enabled": true
}
```

**curl 模板转换示例**:
```bash
# 原始 curl 命令
curl -X POST 'https://api.example.com/users' \
  -H 'Authorization: Bearer xxx' \
  -H 'Content-Type: application/json' \
  -d '{"username":"test"}'

# 转换为监控配置
{
  "url": "https://api.example.com/users",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer xxx",
    "Content-Type": "application/json"
  },
  "body": "{\"username\":\"test\"}"
}
```

---

### 5. ⏳ 内容发布系统

**位置**: `/dashboard/content` 或 `/content`

**功能需求**:
- [ ] 文章管理
  - 创建/编辑/删除文章
  - 富文本编辑器（Markdown）
  - 草稿箱
  - 文章分类
  - 标签管理
  - 文章状态（草稿/已发布/已归档）
- [ ] 内容审核流程
  - 提交审核
  - 审核通过/驳回
  - 审核历史
- [ ] 内容排期发布
  - 定时发布
  - 发布计划
- [ ] SEO优化
  - Meta标题/描述
  - 关键词
  - URL slug
- [ ] 内容统计
  - 浏览量
  - 点赞数
  - 评论数

**数据库设计**:
```sql
-- 文章表
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  content TEXT,
  summary TEXT,
  cover_image VARCHAR(500),
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES users(id),
  status VARCHAR(20),
  publish_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  parent_id UUID REFERENCES categories(id),
  sort INTEGER,
  created_at TIMESTAMP
);

-- 标签表
CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE,
  created_at TIMESTAMP
);

-- 文章标签关联表
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id),
  tag_id UUID REFERENCES tags(id),
  PRIMARY KEY (article_id, tag_id)
);
```

**技术方案**:
- 富文本编辑器：`react-markdown-editor-lite` 或 `TipTap`
- 图片上传：集成文件管理系统
- 文件存储：**使用 OSS (对象存储服务)** 存储文章图片、附件等静态资源
  - 支持 Minio (自建 OSS)
  - 支持阿里云 OSS / 腾讯云 COS / AWS S3
  - CDN 加速支持
- 定时发布：Node-cron 定时任务

**API端点设计**:
- `GET /api/articles` - 获取文章列表
- `POST /api/articles` - 创建文章
- `GET /api/articles/:id` - 获取文章详情
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章
- `POST /api/articles/:id/publish` - 发布文章
- `GET /api/categories` - 获取分类列表
- `GET /api/tags` - 获取标签列表

---

### 6. ⏳ 通知服务

**位置**: `/dashboard/notifications` 或 `/notifications`

**功能需求**:
- [ ] 站内消息
  - 系统通知
  - 个人消息
  - 消息已读/未读
  - 消息删除
- [ ] 邮件通知
  - SMTP配置
  - 邮件模板管理
  - 发送记录
- [ ] 短信通知（可选）
  - 短信模板
  - 发送记录
- [ ] WebSocket实时推送
- [ ] 消息中心
  - 消息列表
  - 消息详情
  - 消息设置
- [ ] 通知统计

**数据库设计**:
```sql
-- 通知表
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  content TEXT,
  type VARCHAR(50),
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP
);

-- 邮件记录表
CREATE TABLE email_logs (
  id UUID PRIMARY KEY,
  to_email VARCHAR(255),
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(20),
  error_message TEXT,
  created_at TIMESTAMP
);

-- 通知配置表
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**技术方案**:
- 邮件发送：`nodemailer`
- 实时推送：WebSocket (Socket.io)
- 消息队列：Redis (可选)

**API端点设计**:
- `GET /api/notifications` - 获取通知列表
- `GET /api/notifications/:id` - 获取通知详情
- `PUT /api/notifications/:id/read` - 标记已读
- `DELETE /api/notifications/:id` - 删除通知
- `POST /api/notifications/send` - 发送通知
- `GET /api/notifications/settings` - 获取通知设置
- `PUT /api/notifications/settings` - 更新通知设置

---

### 7. ⏳ 代码生成模块

**位置**: `/dashboard/generator` 或 `/tools/generator`

**功能需求**:
- [ ] 数据库表管理
  - 表结构设计
  - 字段类型配置
  - 索引管理
- [ ] CRUD代码生成
  - 后端代码：Model、Controller、Service、Routes
  - 前端代码：Page、Components、API
  - 数据库迁移文件
- [ ] 模板管理
  - 自定义代码模板
  - 模板变量配置
- [ ] 代码预览
  - 生成前预览
  - 语法高亮
- [ ] 一键生成
  - 下载代码包
  - 直接写入项目
- [ ] 配置管理
  - 项目配置
  - 命名规范
  - 代码风格

**数据库设计**:
```sql
-- 代码模板表
CREATE TABLE code_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(50),
  template TEXT,
  variables JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 表结构配置表
CREATE TABLE table_configs (
  id UUID PRIMARY KEY,
  table_name VARCHAR(100),
  comment VARCHAR(255),
  fields JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**技术方案**:
- 模板引擎：Handlebars 或 EJS
- 代码格式化：Prettier
- 语法高亮：Prism.js
- 文件压缩：JSZip

**API端点设计**:
- `GET /api/generator/templates` - 获取模板列表
- `POST /api/generator/preview` - 预览生成代码
- `POST /api/generator/generate` - 生成代码
- `GET /api/generator/tables` - 获取表配置
- `POST /api/generator/tables` - 保存表配置

**生成示例**:
```javascript
// 输入：表名 users, 字段配置
{
  "tableName": "users",
  "fields": [
    { "name": "username", "type": "string", "required": true },
    { "name": "email", "type": "string", "required": true }
  ]
}

// 输出：
// - backend/src/models/User.js
// - backend/src/controllers/user.controller.js
// - backend/src/services/user.service.js
// - backend/src/routes/user.routes.js
// - frontend/app/dashboard/users/page.js
// - frontend/components/users/user-form-dialog.jsx
```

---

## 开发优先级

### Phase 1: 基础设施（已完成）
- ✅ 项目初始化
- ✅ 前后端架构搭建
- ✅ Docker环境配置
- ✅ 数据库设计
- ✅ RBAC权限系统

### Phase 2: 核心功能（进行中）
- ⏳ 文件管理系统
- ⏳ 日志系统
- ⏳ 监控系统

### Phase 3: 业务功能
- ⏳ 内容发布系统
- ⏳ 通知服务

### Phase 4: 开发工具
- ⏳ 代码生成模块

---

## 技术规范

### 前端开发规范
- 使用 Next.js App Router
- 组件库：shadcn/ui
- 样式：Tailwind CSS
- 状态管理：React Hooks
- API调用：统一封装在 `lib/api.js`
- 路由结构：
  - `/dashboard/*` - 主要功能页面
  - `/setting/*` - 系统设置页面
  - `/login`, `/register` - 认证页面

### 后端开发规范
- RESTful API设计
- 统一响应格式：
  ```json
  {
    "success": true,
    "data": {},
    "message": "Success"
  }
  ```
- 错误处理：统一错误中间件
- 日志记录：Winston
- 数据验证：Joi
- 权限验证：RBAC中间件

### 数据库规范
- 使用 UUID 作为主键
- 统一时间字段：`created_at`, `updated_at`
- 软删除：使用 `deleted_at` 字段
- 命名规范：小写+下划线

---

## 部署架构

### 开发环境
- 前端：Next.js Dev Server (localhost:3000)
- 后端：Express Server (localhost:3001)
- 数据库：PostgreSQL (Docker)
- 缓存：Redis (Docker)
- 存储：Minio (Docker)

### 生产环境
- 前端：Nginx + PM2
- 后端：PM2 (集群模式)
- 数据库：PostgreSQL (独立服务器)
- 缓存：Redis (独立服务器)
- 存储：Minio (独立服务器/云存储)
- 负载均衡：Nginx
- 监控：Prometheus + Grafana

---

## 当前待办任务

1. [ ] 完成路径迁移（dashboard → setting）
2. [ ] 更新数据库菜单路径
3. [ ] 实现文件管理系统
4. [ ] 实现日志系统
5. [ ] 实现监控系统
6. [ ] 实现内容发布系统
7. [ ] 实现通知服务
8. [ ] 实现代码生成模块

---

## 参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Express 文档](https://expressjs.com)
- [Sequelize 文档](https://sequelize.org)
- [PostgreSQL 文档](https://www.postgresql.org/docs)

---

**最后更新**: 2025-10-15
**文档版本**: 1.0.0
