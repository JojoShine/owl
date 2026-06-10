# 数据访问权限系统 - 实现规划

## 1. 概述

实现基于 `createdBy` 字段的细粒度数据访问权限控制（DAC - Data Access Control），支持四种权限级别：
- **ALL** (所有数据)
- **DEPARTMENT** (本部门)
- **DEPARTMENT_CHILDREN** (本部门及下级)
- **SELF** (本人数据)

## 2. 简化架构设计

### 2.1 核心思路
```
权限检查流程：
User Request 
  ↓
Route + Permission Check (RBAC - 是否有操作权限)
  ↓
Service Layer + Data Filter (DAC - 基于 createdBy 过滤数据)
  ↓
Database Query
  ↓
Response
```

### 2.2 关键设计
- `created_by` 存储**用户ID**
- `access_level` 绑定到**用户**（not 角色）
- DAC 过滤只比对用户ID，与 RBAC 独立

## 3. 数据库设计

### 3.1 为所有表添加三个审计字段

```sql
created_by uuid,               -- 创建者ID
updated_by uuid,               -- 最后更新者ID
deleted_by uuid,               -- 删除者ID (用于软删除)
```

### 3.2 在 owl_users 表添加 access_level

```sql
ALTER TABLE owl_users ADD COLUMN access_level VARCHAR(50) DEFAULT 'SELF';
-- 可选值：ALL, DEPARTMENT, DEPARTMENT_CHILDREN, SELF
```

## 4. 实现步骤

### Phase 1: 数据库结构优化 (Database) ⏳
- [ ] 创建 migration：为所有表添加 created_by, updated_by, deleted_by 字段
- [ ] 创建 migration：为 owl_users 表添加 access_level 字段
- [ ] 为 created_by 字段添加索引
- [ ] 更新 seeder.sql 初始化脚本，包含新字段

### Phase 2: Sequelize 集成 (Model) ⏳
- [ ] 创建 audit-fields.hook.js Hook 插件
- [ ] 修改 models/index.js 应用 Hook 到所有模型
- [ ] 在所有模型定义中添加字段定义

### Phase 3: DAC 工具实现 (Utilities) ⏳
- [ ] 创建 data-access-control.js 工具类
- [ ] 创建 extract-user-data 中间件
- [ ] 编写单元测试

### Phase 4: Service 层改造 (Service) ⏳
- [ ] 修改所有 Service 的 list/find/detail 方法，添加 DAC 过滤
- [ ] 更新 create/update/destroy 方法，确保 userId 被正确传入
- [ ] 更新相应的 Service 单元测试

### Phase 5: 控制器和路由 (Controller) ⏳
- [ ] 修改所有 Controller 使用 DAC
- [ ] 应用 extract-user-data 中间件
- [ ] 更新相应的 API 文档

### Phase 6: 初始数据配置 (Seeder) ⏳
- [ ] 更新 seeder.sql 为初始用户配置 access_level
- [ ] 为初始数据填充 created_by（使用超级管理员 ID）
- [ ] 测试 npm run db:init 是否成功

## 5. 关键信息

- 超级管理员 ID：`99e2337b-8676-4414-b71e-d5aff2008616` (username: admin)
- Manager ID：`88feb135-7e32-4950-ad65-d6194347d08c` (username: manager)
- User ID：`89093b76-8a32-426c-b5e5-5ca34ec136b9` (username: user)

初始配置：
```sql
UPDATE owl_users SET access_level = 'ALL' WHERE username = 'admin';
UPDATE owl_users SET access_level = 'DEPARTMENT_CHILDREN' WHERE username = 'manager';
UPDATE owl_users SET access_level = 'SELF' WHERE username = 'user';
```

## 实现进度

- [x] Phase 1: 数据库结构优化
  - [x] Migration 添加三个 By 字段到所有表
  - [x] Migration 为 owl_users 添加 access_level 字段
  - [x] Seeder 初始化 created_by 和 access_level
  - [x] 为 created_by 字段创建索引

- [x] Phase 2: Sequelize 集成
  - [x] 在 database.js 中统一配置 timestamps, paranoid, underscored
  - [x] 为所有 Model 添加三个 By 字段定义
  - [x] 为 User 模型添加 access_level 字段定义
  - [x] 创建审计字段 Hook (audit-fields.hook.js)
  - [x] 在 models/index.js 应用 Hook 和全局配置
  - [x] 移除所有 Model 中重复的时间戳配置
  - [x] 标准化所有 Model 表结构

- [ ] Phase 3: DAC 工具实现
- [ ] Phase 4: Service 层改造
- [ ] Phase 5: 控制器和路由
- [ ] Phase 6: 初始数据配置

---

# 第三方密钥模块重构计划

## 目标
将第三方密钥模块从 admin 模块重构为系统级别模块，以保持架构一致性。

## 变更概览
- **移动目录**：从 `backend/src/core/modules/admin/third_party_keys` 到 `backend/src/core/modules/third_party_keys`
- **更新路由前缀**：从 `/api/admin/third-party-keys` 到 `/api/system/third-party-keys`
- **代码逻辑**：保持不变

## 变更项清单

### 第一阶段：目录和文件移动
- [ ] 创建新目录 `backend/src/core/modules/third_party_keys`
- [ ] 复制所有文件到新位置
- [ ] 删除旧目录
- [ ] 删除空的 admin 目录

### 第二阶段：路由注册更新
- [ ] 在 `core.routes.js` 中添加第三方密钥模块路由（引入和挂载）
- [ ] 更新 `third-party-keys.routes.js` 中的文档注释（从 `/api/admin` 改为 `/api/system`）

### 第三阶段：验证和测试
- [ ] 验证目录结构正确
- [ ] 验证所有内部路径引用正确
- [ ] 验证路由注册正确
- [ ] 确保没有遗留引用

## 相关文件位置
- 源目录：`/Users/jojoshine/projects/owl_platform/backend/src/core/modules/admin/third_party_keys/`
- 目标目录：`/Users/jojoshine/projects/owl_platform/backend/src/core/modules/third_party_keys/`
- 路由注册文件：`/Users/jojoshine/projects/owl_platform/backend/src/routes/core.routes.js`

## 审查部分
[待完成后填写]
