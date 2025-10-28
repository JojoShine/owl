# 数据对比分析报告

## 开发环境数据统计

- **权限**: 52条
- **菜单**: 17条
- **角色**: 3条
- **部门**: 2条
- **邮件模板**: 3条

## 现有 Seeders 数据统计

### 20251015060501-init-basic-data.js (基础数据)
- **权限**: 20条 (仅基础CRUD权限)
- **菜单**: 7条 (仅基础系统管理菜单)
- **角色**: 3条 ✅
- **部门**: 4条 (包含子部门)

### 其他 Seeders
- 20251016000000-add-file-management-data.js - 文件管理相关
- 20251016044741-add-log-permissions.js - 日志权限
- 20251016050000-add-log-menu.js - 日志菜单
- 20251023000000-fix-non-crud-permissions.js - 修复非CRUD权限

## 缺失的数据

### 1. 权限缺失 (52 - 20 = 32条)

**文件管理权限** (缺失):
- folder:create, folder:read, folder:update, folder:delete
- file:upload, file:read, file:update, file:delete
- file:download, file:preview, file:copy, file:move, file:share
- file-share:read, file-share:delete

**监控系统权限** (缺失):
- monitor:read, monitor:manage

**代码生成权限** (缺失):
- generator:read, generator:create, generator:update, generator:delete

**日志管理权限** (部分):
- log:read, log:export, log:backup, log:config

**通知管理权限** (缺失):
- notification:read, notification:manage

**邮件管理权限** (缺失):
- email:send
- email_template:read, email_template:create, email_template:update, email_template:delete

### 2. 菜单缺失 (17 - 7 = 10条)

**缺失的菜单**:
- 文件管理 (/files)
- 日志管理 (/logs)
- 监控系统 (父菜单)
  - 监控概览 (/monitor)
  - 接口监控 (/monitor/apis)
  - 告警管理 (/monitor/alerts)
- 消息中心 (/notifications)
- 邮件模板 (/setting/email-templates)
- 通知设置 (/setting/notification-settings)
- 代码生成器 (/generator)

### 3. 邮件模板缺失 (3条)

**完全缺失**:
1. 接口异常告警模版 (API_MONITOR_ALERT)
2. CPU使用率告警模版 (SYSTEM_ALERT)
3. 内存使用率告警模版 (SYSTEM_ALERT)

## 问题总结

1. **init-basic-data.js 过时**
   - 只包含最基础的20个权限
   - 缺少文件、监控、代码生成、通知等模块的权限
   - 缺少大量菜单

2. **数据散落在多个 seeder 中**
   - 难以追踪和维护
   - 容易遗漏

3. **缺少邮件模板初始化**
   - 没有任何 seeder 创建邮件模板数据

4. **角色-权限关联不完整**
   - super_admin 应该有所有52个权限
   - admin 应该有除 permission 管理外的所有权限
   - user 当前有过多权限,需要调整

## 建议

创建一个全新的完整 seeder 文件,包含:
- 所有52个权限
- 所有17个菜单(含正确的层级关系)
- 3个角色及完整的权限关联
- 2个基础部门
- 3个邮件模板
- 默认的超级管理员账号
