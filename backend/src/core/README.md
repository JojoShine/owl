# 核心系统模块

此目录包含系统的核心功能模块，这些是平台的基础功能，适用于所有项目。

## 模块列表

### 认证与授权
- **auth** - 用户认证（登录、注册、Token管理）
- **user** - 用户管理
- **role** - 角色管理
- **permission** - 权限管理
- **menu** - 菜单管理
- **department** - 部门管理

### 文件管理
- **file** - 文件管理（上传、下载、预览）
- **folder** - 文件夹管理
- **file-share** - 文件分享

### 系统功能
- **log** - 日志管理（操作日志、访问日志）
- **monitor** - 系统监控（性能、健康检查、告警）
- **notification** - 通知系统（站内信、邮件、WebSocket）
- **system-config** - 系统配置
- **watermark** - 水印管理
- **captcha** - 验证码
- **dictionary** - 数据字典
- **dashboard** - 仪表板

### 开发工具
- **api-builder** - API构建器（动态API生成）
- **generator** - 代码生成器

## 路由前缀

所有核心模块的路由都使用 `/api/system` 前缀：

```
/api/system/auth/*
/api/system/users/*
/api/system/roles/*
/api/system/permissions/*
/api/system/menus/*
/api/system/departments/*
/api/system/files/*
/api/system/logs/*
/api/system/monitor/*
/api/system/notifications/*
/api/system/config/*
/api/system/dashboard/*
```

## 模块结构

每个核心模块包含：

```
module-name/
├── module-name.controller.js   # 控制器
├── module-name.service.js      # 服务层
├── module-name.routes.js       # 路由
├── module-name.validation.js   # 验证器
└── module-name.model.js        # 模型（可选）
```

## 开发规范

1. **不要修改核心模块**：核心模块是系统基础，除非是bug修复或功能增强，否则不要修改
2. **扩展而非修改**：如果需要自定义功能，在业务模块中扩展
3. **保持一致性**：所有核心模块遵循相同的代码风格和结构
4. **文档完善**：每个模块都应有清晰的注释和文档

## 数据库表

核心模块的数据库表使用 `sys_` 前缀：

```sql
sys_users
sys_roles
sys_permissions
sys_menus
sys_departments
sys_files
sys_logs
sys_notifications
```

## 权限控制

核心模块的权限使用 `system:` 前缀：

```
system:user:read
system:user:create
system:user:update
system:user:delete
system:role:manage
system:permission:manage
```

## 升级和维护

- 核心模块可以独立升级
- 升级前请备份数据库
- 查看 CHANGELOG.md 了解版本变更
- 运行测试确保功能正常

## 技术栈

- Node.js + Express
- Sequelize ORM
- PostgreSQL
- Redis（可选）
- MinIO（文件存储）
- Socket.io（实时通信）

## 许可证

MIT License
