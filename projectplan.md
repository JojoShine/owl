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

---

# 多实例 Token 过期问题优化

## 问题描述
当多个 Owl 平台实例同时运行时，它们共享同一个 localStorage，导致：
1. Token 恢复逻辑混乱（多个实例互相覆盖）
2. 一个实例登出会影响其他实例
3. 无法独立管理多个平台的认证状态

## 解决方案

### 方案设计
为每个平台实例使用**独立的 localStorage 命名空间**，通过在 key 前加上平台标识前缀来隔离。

### 实现步骤

#### Phase 1: 平台标识管理
- [ ] 读取或生成平台 ID（从环境变量 `NEXT_PUBLIC_PLATFORM_ID` 或 URL）
- [ ] 创建 `lib/utils/storage-key.js` 工具函数，生成命名空间化的 key

#### Phase 2: 更新 AuthProvider
- [ ] 修改 `lib/utils/auth.js` 中的 localStorage 操作
  - [ ] 将所有 localStorage key 使用 `getStorageKey()` 包装
  - [ ] 保持 API 和逻辑不变

#### Phase 3: 更新工具函数
- [ ] 更新 `getToken()` 函数
- [ ] 更新 `getUser()` 函数

#### Phase 4: 测试
- [ ] 验证单个实例的 token 恢复正常
- [ ] 验证多个实例互不干扰
- [ ] 测试登出时只清除当前实例的 token

## 相关文件
- 主要修改：`/Users/jojoshine/projects/owl_platform/frontend/lib/utils/auth.js`
- 新增文件：`/Users/jojoshine/projects/owl_platform/frontend/lib/utils/storage-key.js`

## 实现进度
- [ ] Phase 1: 平台标识管理
- [ ] Phase 2: 更新 AuthProvider
- [ ] Phase 3: 更新工具函数
- [ ] Phase 4: 测试

## 审查部分
[待完成后填写]

---

# 多实例 Token 过期问题优化

## 问题描述
当多个 Owl 平台实例同时运行时，它们共享同一个 localStorage，导致：
1. Token 恢复逻辑混乱（多个实例互相覆盖）
2. 一个实例登出会影响其他实例
3. 无法独立管理多个平台的认证状态

## 解决方案

### 方案设计
为每个平台实例使用**独立的 localStorage 命名空间**，通过在 key 前加上平台标识前缀来隔离。

### 实现步骤

#### Phase 1: 平台标识管理 ✅
- [x] 创建 `lib/utils/storage-key.js` 工具函数
  - [x] 从环境变量 `NEXT_PUBLIC_PLATFORM_ID` 获取平台 ID
  - [x] 从 URL 端口号生成平台 ID
  - [x] 生成命名空间化的 key（格式：`platformId__keyName`）

#### Phase 2: 更新 AuthProvider ✅
- [x] 修改 `lib/utils/auth.js`
  - [x] 导入 `getStorageKey`
  - [x] 更新初始化逻辑使用命名空间 key
  - [x] 更新登录逻辑使用命名空间 key
  - [x] 更新登出逻辑使用命名空间 key
  - [x] 更新刷新用户逻辑使用命名空间 key
  - [x] 更新 `isAuthenticated()` 使用命名空间 key

#### Phase 3: 更新工具函数 ✅
- [x] 更新 `getToken()` 使用命名空间 key
- [x] 更新 `getUser()` 使用命名空间 key
- [x] 更新 `http-client.js` 中的所有 localStorage 操作
- [x] 更新 `module-client.js` 中的所有 localStorage 操作
- [x] 更新 `SocketContext.jsx` 中的 token 读取
- [x] 更新 `sms-login-form.jsx` 中的 token 保存

#### Phase 4: 测试 ⏳
- [ ] 验证单个实例的 token 恢复正常
- [ ] 验证多个实例互不干扰
- [ ] 测试登出时只清除当前实例的 token

## 相关文件
- 新增文件：`/Users/jojoshine/projects/owl_platform/frontend/lib/utils/storage-key.js`
- 修改文件：
  - `/Users/jojoshine/projects/owl_platform/frontend/lib/utils/auth.js`
  - `/Users/jojoshine/projects/owl_platform/frontend/lib/utils/http-client.js`
  - `/Users/jojoshine/projects/owl_platform/frontend/lib/utils/module-client.js`
  - `/Users/jojoshine/projects/owl_platform/frontend/contexts/SocketContext.jsx`
  - `/Users/jojoshine/projects/owl_platform/frontend/components/auth/sms-login-form.jsx`

## 审查部分

### 改动总结
实现了多实例 localStorage 隔离方案，核心改动：

1. **新增存储 key 工具** (`storage-key.js`)
   - 自动检测平台 ID（优先级：环境变量 > URL 端口 > 生成唯一ID）
   - 所有 localStorage key 使用 `getStorageKey()` 包装，生成 `platformId__keyName` 格式的 key

2. **最小化改动**
   - 所有改动都是将 `localStorage.getItem('token')` 改为 `localStorage.getItem(getStorageKey('token'))`
   - API 和逻辑完全不变，只改变 key 的生成方式

3. **隔离效果**
   - 多个实例运行在不同端口时自动获得不同 platformId（如 `port-3000__token` vs `port-3001__token`）
   - 每个实例只能访问自己命名空间的 token 和用户信息
   - 登出一个实例不会影响其他实例

### 已覆盖的场景
- ✅ 认证初始化和 token 恢复
- ✅ 登录/登出
- ✅ Token 自动刷新（http-client、module-client）
- ✅ WebSocket 连接（SocketContext）
- ✅ 短信登录（sms-login-form）
- ✅ 权限检查和用户信息获取

### 测试建议
1. 本地同时启动两个前端实例（不同端口）
2. 在实例1登录，验证实例2不受影响
3. 在实例2登录，验证实例1的 token 仍然有效
4. 在实例1登出，验证实例2可以正常使用

---

# 三个快速优化项

## 1. 添加阿里云短信服务依赖
- [x] 在 backend/package.json 的 dependencies 中添加 `@alicloud/pop-core`

## 2. 优化数据库初始化脚本
- [x] 修改 backend/migrations/001-initial-schema.js
- [x] 更新表删除逻辑：只删除 owl_ 前缀的表
- [x] 更新 Enum 类型删除逻辑：只删除 enum_owl_ 前缀的类型

## 3. 更新 .gitignore
- [x] 修改 .gitignore 移除对 frontend/.env 和 .env.production 的过滤
- [x] 保留对 .env.local 和 .env.*.local 的过滤（本地配置）

---

## 审查

### 优化 1: 阿里云短信服务依赖
**文件**: `backend/package.json`
- 添加 `@alicloud/pop-core: ^1.9.6` 到 dependencies
- 按字母序排列，保持与其他依赖一致

### 优化 2: 数据库初始化脚本优化
**文件**: `backend/migrations/001-initial-schema.js`
- **up 函数**: 修改表过滤逻辑从 `!t.includes('sequelize')` 改为 `t.startsWith('owl_') && !t.includes('sequelize')`
- **down 函数**: 同样修改表过滤逻辑，只删除 owl_ 前缀的表
- **Enum 类型**: 保持不变，已经只删除 enum_owl_ 前缀的类型
- **效果**: 初始化脚本现在只清理 owl 平台相关的对象，不会影响数据库中其他应用的表

### 优化 3: .gitignore 更新
**文件**: `.gitignore`
- 移除 `.env` 和 `.env.production` 的全局过滤
- 添加 `!frontend/.env`, `!frontend/.env.local`, `!frontend/.env.production` 白名单
- 保留对后端 `.env.example` 的白名单和本地配置的过滤 (`.env.local`, `.env.*.local`)
- **效果**: 前端所有 .env 配置文件都可以提交，后端仍然只提交示例文件

---

# 前端业务页面目录重命名

## 目标
将 `frontend/app/(authenticated)/your-biz` 重命名为 `biz`，保持后续使用的一致性和简洁性。

## 变更项清单

### 第一阶段：重命名目录
- [x] 重命名 `frontend/app/(authenticated)/your-biz` 为 `biz`

### 第二阶段：更新文档
- [x] 更新 `frontend/app/(authenticated)/biz/README.md`
  - [x] 更新标题和路由示例
  - [x] 更新页面路由为 `/biz/your-module`

### 第三阶段：验证
- [x] 验证目录结构正确
- [x] 验证没有硬编码的路由引用

## 审查

### 目录重命名
**文件**: 
- 原: `/frontend/app/(authenticated)/your-biz`
- 新: `/frontend/app/(authenticated)/biz`

**更改**:
1. 目录重命名成功
2. 更新 `README.md` 文档中的目录结构示例（your-biz → biz）
3. 更新 `README.md` 中的路由示例（/your-biz/your-module → /biz/your-module）
4. 更新 `example/page.js` 的路由注释（/your-biz/example → /biz/example）

**效果**: 
- 新用户创建业务模块时无需再修改文件夹名称
- 目录名称与后端 `/api/biz/*` 路由保持一致
- 代码示例与实际使用路径对应

---

# 用户管理 access_level 维护

## 目标
在用户管理模块中添加 access_level 的维护和展示功能。access_level 是数据访问权限级别（ALL、DEPARTMENT、SELF）。

## 变更项清单

### 第一阶段：后端验证和服务层
- [x] 更新 `user.validation.js`：添加 access_level 验证
- [x] 更新 `user.service.js`：创建/更新用户时处理 access_level
- [x] 验证 access_level 的有效值（ALL、DEPARTMENT、SELF）

### 第二阶段：后端路由和控制器
- [x] 确保 access_level 在用户列表中展示
- [x] 确保 access_level 在用户详情中返回

### 第三阶段：前端表单和展示
- [ ] 更新前端用户编辑表单，添加 access_level 字段
- [ ] 在用户列表中展示 access_level
- [ ] 提供 access_level 的下拉选择（ALL、DEPARTMENT、SELF）
