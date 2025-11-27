# 项目优化计划

---

# 文件管理系统优化 (2025-11-24)

## 需求分析

用户要求优化文件管理系统的三个方面：

1. **图片上传预览功能**
   - 当上传的文件是图片时，需要展示缩略图预览
   - 提升用户体验，方便识别文件内容

2. **页面抖动问题修复**
   - 每次点击文件管理，右侧页面会有抖动
   - 需要优化加载状态和过渡动画

3. **文件和文件夹权限管理**
   - 每个文件夹和文件都支持单独授权
   - 只有管理员可以操作权限
   - 默认沿用上层文件夹的权限
   - 创建的文件默认自己和super_admin和admin可见

## 问题优先级

**P0（立即处理）**：
- 图片上传预览功能 - 用户体验直接相关

**P1（重要）**：
- 页面抖动问题修复 - 视觉体验问题

**P2（复杂，需详细规划）**：
- 文件权限管理系统 - 涉及数据库、后端API、前端UI的大改动

## 实施计划

### 阶段1：图片上传预览功能 (已完成 ✅)

- [x] 1.1 修改FileUploadDialog组件
  - [x] 检测文件类型是否为图片 (使用 file.type.startsWith('image/'))
  - [x] 使用FileReader读取图片并转换为base64
  - [x] 在文件列表中显示缩略图预览 (64x64px)
  - [x] 添加图片加载失败处理

- [x] 1.2 优化上传界面布局
  - [x] 图片预览显示在左侧 (64x64 圆角容器)
  - [x] 文件信息显示在右侧
  - [x] 清理预览URL以防止内存泄漏

### 阶段2：页面抖动问题修复 (已完成 ✅)

- [x] 2.1 分析抖动原因
  - [x] 检查loading状态管理
  - [x] 检查文件列表渲染逻辑
  - [x] 检查CSS布局是否导致重排

- [x] 2.2 优化方案
  - [x] 添加fade-in动画实现平滑过渡
  - [x] 使用min-height (400px) 固定容器高度
  - [x] 添加pulse动画到加载状态

### 阶段3：文件权限管理系统设计 (规划阶段)

#### 数据库设计

**新增表：file_permissions**
```sql
CREATE TABLE file_permissions (
  id SERIAL PRIMARY KEY,
  resource_type VARCHAR(20) NOT NULL,  -- 'file' | 'folder'
  resource_id INTEGER NOT NULL,         -- file_id or folder_id
  user_id INTEGER,                      -- NULL表示角色权限
  role_id INTEGER,                      -- NULL表示用户权限
  permission VARCHAR(20) NOT NULL,      -- 'read' | 'write' | 'delete' | 'admin'
  granted_by INTEGER,                   -- 授权人user_id
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_file_permissions_resource ON file_permissions(resource_type, resource_id);
CREATE INDEX idx_file_permissions_user ON file_permissions(user_id);
CREATE INDEX idx_file_permissions_role ON file_permissions(role_id);
```

**修改表：folders**
```sql
ALTER TABLE folders ADD COLUMN inherit_permissions BOOLEAN DEFAULT TRUE;
ALTER TABLE folders ADD COLUMN created_by INTEGER;
ALTER TABLE folders ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id);
```

**修改表：files**
```sql
ALTER TABLE files ADD COLUMN inherit_permissions BOOLEAN DEFAULT TRUE;
-- uploaded_by 已存在
```

#### 权限继承逻辑

```
文件夹A (admin可见)
  ├─ 文件夹B (继承A的权限) -> admin可见
  │   ├─ 文件1 (继承B的权限) -> admin可见
  │   └─ 文件2 (自定义权限: user1可见) -> admin + user1可见
  └─ 文件夹C (自定义权限: user2可见) -> admin + user2可见
      └─ 文件3 (继承C的权限) -> admin + user2可见
```

#### 后端API设计

**权限检查服务** (`backend/src/modules/permission/file-permission.service.js`)
- `checkPermission(userId, resourceType, resourceId, permission)` - 检查用户权限
- `getEffectivePermissions(resourceType, resourceId)` - 获取有效权限（含继承）
- `setPermissions(resourceType, resourceId, permissions)` - 设置权限
- `removePermission(permissionId)` - 移除权限

**文件权限API** (`backend/src/modules/file/file-permission.controller.js`)
- `GET /api/files/:id/permissions` - 获取文件权限列表
- `POST /api/files/:id/permissions` - 添加文件权限
- `DELETE /api/file-permissions/:id` - 删除文件权限
- `PUT /api/files/:id/inherit` - 切换权限继承

**文件夹权限API** (`backend/src/modules/folder/folder-permission.controller.js`)
- `GET /api/folders/:id/permissions` - 获取文件夹权限列表
- `POST /api/folders/:id/permissions` - 添加文件夹权限
- `DELETE /api/folder-permissions/:id` - 删除文件夹权限
- `PUT /api/folders/:id/inherit` - 切换权限继承

#### 前端UI设计

**权限管理对话框** (`frontend/components/files/PermissionDialog.js`)
```jsx
<PermissionDialog
  open={open}
  onClose={onClose}
  resourceType="file" // or "folder"
  resourceId={fileId}
  currentUserId={currentUserId}
  isAdmin={isAdmin}
>
  {/* 权限继承开关 */}
  <Switch checked={inheritPermissions} disabled={!isAdmin} />

  {/* 权限列表 */}
  <PermissionList permissions={permissions}>
    - 用户/角色名称
    - 权限类型（读/写/删除/管理）
    - 删除按钮（仅管理员）
  </PermissionList>

  {/* 添加权限（仅管理员） */}
  {isAdmin && (
    <AddPermissionForm
      onAdd={handleAddPermission}
      users={users}
      roles={roles}
    />
  )}
</PermissionDialog>
```

**文件列表权限入口**
- 在FileList的操作菜单中添加"权限管理"选项
- 只有管理员能看到此选项

#### 默认权限规则

创建文件/文件夹时自动添加默认权限：
```javascript
// 创建者
{ user_id: currentUserId, permission: 'admin' }

// super_admin角色
{ role_id: superAdminRoleId, permission: 'admin' }

// admin角色
{ role_id: adminRoleId, permission: 'admin' }
```

#### 阶段3详细任务

- [x] 3.1 数据库迁移（30分钟）
  - [x] 创建file_permissions表
  - [x] 修改folders和files表
  - [x] 编写迁移脚本

- [x] 3.2 后端权限服务（2小时）
  - [x] 实现FilePermissionService
  - [x] 实现权限继承逻辑
  - [x] 实现权限检查中间件

- [x] 3.3 后端API开发（2小时）
  - [x] 文件权限CRUD接口
  - [x] 文件夹权限CRUD接口
  - [x] 集成到现有文件/文件夹接口

- [x] 3.4 前端组件开发（3小时）
  - [x] PermissionDialog组件
  - [x] PermissionList组件
  - [x] AddPermissionForm组件
  - [x] 集成到FileList和FolderTree

- [x] 3.5 默认权限实现（1小时）
  - [x] 文件上传时自动添加权限
  - [x] 文件夹创建时自动添加权限
  - [x] 权限继承开关逻辑

- [ ] 3.6 测试验证（1小时）
  - [ ] 权限继承测试
  - [ ] 多用户权限隔离测试
  - [ ] 管理员权限操作测试

### 总计时间估算

- 阶段1：1-2小时
- 阶段2：30分钟
- 阶段3：9.5小时

**总计：约11-12小时**

## 实施原则

1. **先易后难** - 先完成图片预览和抖动修复，再处理权限管理
2. **渐进增强** - 权限系统可以分多次迭代完成
3. **向后兼容** - 确保现有文件不受影响
4. **简单优先** - 每次改动尽可能小
5. **充分测试** - 权限系统关乎安全，需要充分测试

## 用户确认事项

在开始阶段3之前，需要用户确认：

1. ❓ 权限类型是否足够：read、write、delete、admin（管理权限）
2. ❓ 是否需要支持权限组/团队概念
3. ❓ 文件共享链接是否需要权限控制
4. ❓ 是否需要权限审计日志
5. ❓ 默认权限规则是否符合需求

---

## Review 区域

### 已完成工作总结 (2025-11-24)

#### 阶段1：图片上传预览功能 ✅

**修改文件：**
- `frontend/components/files/FileUploadDialog.js`

**实现内容：**
1. 添加了 `previewUrls` 状态管理图片预览URL
2. 实现了 `isImage()` 函数检测文件类型（使用 `file.type.startsWith('image/')`）
3. 实现了 `generateImagePreview()` 函数使用 FileReader API 将图片转换为 base64
4. 在文件选择时自动为图片生成预览
5. 更新了文件列表渲染逻辑，显示 64x64px 的图片缩略图
6. 实现了预览URL的清理机制，防止内存泄漏：
   - 文件移除时清理对应的预览URL
   - 对话框关闭时清理所有预览URL

**用户体验提升：**
- 用户上传图片时可以立即看到缩略图预览
- 更容易识别和确认上传的图片内容
- 图片显示在左侧64x64的圆角容器中，视觉效果良好

#### 阶段2：页面抖动问题修复 ✅

**修改文件：**
- `frontend/components/files/FileList.js`

**实现内容：**
1. 在内容区域添加了 `min-h-[400px]` 防止布局抖动
2. 添加了 `transition-opacity duration-200` 实现平滑过渡效果
3. 为加载状态添加了 `animate-pulse` 动画
4. 为空状态和文件列表添加了 `animate-in fade-in duration-300` 淡入动画

**优化效果：**
- 页面切换时不再出现明显的抖动
- 加载状态切换平滑自然
- 最小高度保证了布局的稳定性
- 淡入动画提供了更好的视觉反馈

#### 技术亮点

1. **FileReader API 的使用**
   - 高效读取图片文件
   - 异步处理不阻塞UI
   - 错误处理机制完善

2. **内存管理**
   - 及时清理不需要的预览URL
   - 避免内存泄漏
   - 优化性能

3. **CSS 动画优化**
   - 使用 Tailwind CSS 内置动画类
   - 平滑的过渡效果
   - 不影响性能

#### 代码质量

- 保持了代码的简洁性
- 遵循了 React Hooks 最佳实践
- 良好的注释和代码组织
- 向后兼容，不影响现有功能

#### 待完成工作

阶段3（文件权限管理系统）需要用户确认以下事项后再开始实施：

1. 权限类型是否足够：read、write、delete、admin（管理权限）
2. 是否需要支持权限组/团队概念
3. 文件共享链接是否需要权限控制
4. 是否需要权限审计日志
5. 默认权限规则是否符合需求

阶段3预计需要 9.5 小时完成，涉及数据库设计、后端API开发和前端UI组件开发。

---

# 接口开发功能 (2025-11-27)

## 功能概述

在系统管理模块新增"接口开发"功能，允许用户通过编写SQL语句来快速生成可供移动端或第三方调用的API接口，无需手动编写后端代码。同时提供接口鉴权机制保护动态生成的接口。

## 核心需求

1. **SQL to API 动态转换**
   - 用户通过前端配置SQL语句、参数等信息
   - 后端自动生成对应的API端点
   - 生成的接口可供移动端或第三方调用

2. **接口管理**
   - 创建、编辑、删除、查看接口配置
   - 接口启用/禁用开关
   - 接口调用统计

3. **接口鉴权**
   - 为动态生成的接口提供Token认证
   - 支持API Key + Secret 认证方式
   - 支持请求签名验证（可选）

4. **样式一致性**
   - 与现有系统管理模块样式保持一致
   - 采用相同的UI组件和设计规范

## 实施计划

### 数据库设计

**新增表：api_interfaces（接口配置表）**
```sql
CREATE TABLE api_interfaces (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL COMMENT '接口名称',
  description TEXT COMMENT '接口描述',
  sql_query LONGTEXT NOT NULL COMMENT 'SQL查询语句',
  method VARCHAR(20) DEFAULT 'GET' COMMENT '请求方式：GET/POST/PUT/DELETE',
  endpoint VARCHAR(255) NOT NULL COMMENT '接口端点路径（相对）',
  version INT DEFAULT 1 COMMENT '接口版本号',
  parameters JSON COMMENT '接口参数定义 [{name, type, required, description}]',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '接口状态',
  require_auth BOOLEAN DEFAULT true COMMENT '是否需要认证',
  rate_limit INT DEFAULT 1000 COMMENT '每小时请求限制',
  created_by BIGINT NOT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_endpoint_version (endpoint, version)
);

CREATE INDEX idx_status ON api_interfaces(status);
CREATE INDEX idx_created_by ON api_interfaces(created_by);
CREATE INDEX idx_endpoint ON api_interfaces(endpoint);
```

**新增表：api_keys（接口密钥表）**
```sql
CREATE TABLE api_keys (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  interface_id BIGINT NOT NULL COMMENT '关联的接口ID',
  app_name VARCHAR(255) NOT NULL COMMENT '应用名称',
  api_key VARCHAR(255) NOT NULL UNIQUE COMMENT 'API密钥',
  api_secret VARCHAR(255) NOT NULL COMMENT 'API密钥加密值',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '密钥状态',
  expires_at TIMESTAMP NOT NULL COMMENT '密钥过期时间（3天后）',
  last_used_at TIMESTAMP COMMENT '最后使用时间',
  created_by BIGINT NOT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_interface FOREIGN KEY (interface_id) REFERENCES api_interfaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_interface_id ON api_keys(interface_id);
CREATE INDEX idx_api_key ON api_keys(api_key);
CREATE INDEX idx_expires_at ON api_keys(expires_at);
```

**新增表：api_call_logs（接口调用日志表）**
```sql
CREATE TABLE api_call_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  interface_id BIGINT NOT NULL COMMENT '接口ID',
  api_key_id BIGINT COMMENT 'API密钥ID',
  request_method VARCHAR(20) COMMENT '请求方法',
  request_params JSON COMMENT '请求参数',
  response_code INT COMMENT '响应状态码',
  response_time INT COMMENT '响应时间（毫秒）',
  error_message VARCHAR(500) COMMENT '错误信息',
  ip_address VARCHAR(45) COMMENT '请求来源IP',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_interface FOREIGN KEY (interface_id) REFERENCES api_interfaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_api_key FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL
);

CREATE INDEX idx_interface_id ON api_call_logs(interface_id);
CREATE INDEX idx_api_key_id ON api_call_logs(api_key_id);
CREATE INDEX idx_created_at ON api_call_logs(created_at);

-- 触发器：自动删除30天前的日志
CREATE EVENT IF NOT EXISTS clean_old_api_logs
ON SCHEDULE EVERY 1 DAY
DO
  DELETE FROM api_call_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 后端实现

**模块结构：** `backend/src/modules/api-builder/`

```
api-builder/
├── api-builder.controller.js      # 接口管理API
├── api-builder.service.js         # 接口管理业务逻辑
├── api-builder.routes.js          # 路由定义
├── api-builder.validation.js      # 参数验证
├── api-builder-executor.service.js  # SQL执行引擎（核心）
├── api-builder-auth.service.js    # 接口鉴权服务
├── api-builder-key.controller.js  # API密钥管理API
├── api-builder-key.service.js     # API密钥业务逻辑
└── api-builder-key.routes.js      # API密钥路由
```

**核心功能：**

1. **接口管理 API** (`api-builder.controller.js`)
   - `POST /api/api-builder` - 创建接口
   - `GET /api/api-builder` - 获取接口列表
   - `GET /api/api-builder/:id` - 获取接口详情
   - `PUT /api/api-builder/:id` - 编辑接口
   - `DELETE /api/api-builder/:id` - 删除接口
   - `POST /api/api-builder/:id/test` - 测试接口
   - `GET /api/api-builder/:id/logs` - 获取调用日志

2. **API密钥管理 API** (`api-builder-key.controller.js`)
   - `POST /api/api-builder/:id/keys` - 创建密钥
   - `GET /api/api-builder/:id/keys` - 获取密钥列表
   - `DELETE /api/api-keys/:keyId` - 删除密钥
   - `POST /api/api-keys/:keyId/regenerate` - 重新生成密钥

3. **SQL 执行引擎** (`api-builder-executor.service.js`)
   - 执行 SQL 查询
   - 参数绑定和验证
   - 结果转换为 JSON
   - 错误处理和日志记录

4. **接口鉴权服务** (`api-builder-auth.service.js`)
   - API Key 验证
   - 签名验证（HMAC-SHA256）
   - 限流控制
   - 调用日志记录

**动态 API 端点：** `/api/custom/:endpoint`
- 通过中间件识别 endpoint
- 调用对应接口的 SQL 执行引擎
- 返回查询结果

### 前端实现

**位置：** `frontend/app/(authenticated)/setting/api-builder/`

**文件结构：**
```
api-builder/
├── page.js                        # 接口列表页面
├── layout.js                      # 页面布局
├── [id]/
│   ├── page.js                    # 接口编辑页面
│   └── layout.js
└── components/
    ├── api-builder-form.js        # 接口表单组件
    ├── api-builder-list.js        # 接口列表组件
    ├── test-interface-dialog.js   # 测试接口弹窗
    ├── api-keys-dialog.js         # API密钥管理弹窗
    └── call-logs-dialog.js        # 调用日志弹窗
```

**页面功能：**

1. **接口列表页面** (`page.js`)
   - 显示所有接口列表（表格）
   - 搜索、筛选功能
   - 创建新接口按钮
   - 编辑、删除、启用/禁用操作
   - 查看日志、管理密钥操作

2. **接口编辑页面** (`[id]/page.js`)
   - 接口基本信息表单
   - SQL 编辑器（代码高亮）
   - 参数定义表单
   - 保存、测试、取消操作
   - 接口预览（最终生成的端点URL）

3. **接口表单组件** (`api-builder-form.js`)
   - 接口名称输入框
   - 接口描述文本域
   - 端点路径输入框
   - 版本号输入框
   - 请求方式选择器（GET/POST/PUT/DELETE）
   - SQL 编辑器（使用 Monaco Editor 或 Ace Editor）
   - 参数表格（添加/删除参数）
   - 认证设置开关
   - 限流设置

4. **API 密钥管理弹窗** (`api-keys-dialog.js`)
   - 显示密钥列表（只显示前缀，隐藏完整密钥）
   - 创建新密钥按钮
   - 删除密钥功能
   - 重新生成密钥功能
   - 复制密钥到剪贴板功能

5. **调用日志弹窗** (`call-logs-dialog.js`)
   - 日志列表（时间、应用名、状态、耗时）
   - 日志详情查看

## 任务分解

### 阶段1：数据库设计与创建 (30分钟)
- [ ] 1.1 创建迁移文件，定义三个新表的SQL
- [ ] 1.2 执行迁移，创建表和索引
- [ ] 1.3 验证表创建成功

### 阶段2：后端 - 接口管理模块 (3小时)
- [ ] 2.1 创建 api-builder 模块文件夹和基础文件
- [ ] 2.2 实现 ApiInterface 数据模型
- [ ] 2.3 实现接口管理服务（CRUD）
- [ ] 2.4 实现接口管理控制器和路由
- [ ] 2.5 实现参数验证规则

### 阶段3：后端 - SQL 执行引擎 (2小时)
- [ ] 3.1 实现 SQL 执行引擎（参数绑定、查询执行）
- [ ] 3.2 实现参数验证和转义
- [ ] 3.3 实现动态路由中间件（识别 /api/custom/:endpoint）
- [ ] 3.4 实现结果转换和错误处理
- [ ] 3.5 实现测试接口功能

### 阶段4：后端 - 接口鉴权模块 (2小时)
- [ ] 4.1 创建 ApiKey 数据模型
- [ ] 4.2 实现 API 密钥管理服务
- [ ] 4.3 实现 API 密钥管理控制器和路由
- [ ] 4.4 实现 API 鉴权中间件（验证 API Key）
- [ ] 4.5 实现调用日志记录
- [ ] 4.6 实现限流控制

### 阶段5：前端 - 接口列表页面 (2小时)
- [ ] 5.1 创建接口列表页面目录结构
- [ ] 5.2 实现接口列表页面（表格展示）
- [ ] 5.3 实现搜索、筛选功能
- [ ] 5.4 实现删除和状态切换功能
- [ ] 5.5 实现查看日志和管理密钥的弹窗入口

### 阶段6：前端 - 接口编辑页面和表单 (2.5小时)
- [ ] 6.1 创建接口编辑页面
- [ ] 6.2 实现接口基本信息表单
- [ ] 6.3 集成 SQL 编辑器
- [ ] 6.4 实现参数定义表单
- [ ] 6.5 实现接口预览功能
- [ ] 6.6 实现保存和测试功能

### 阶段7：前端 - 辅助弹窗组件 (1.5小时)
- [ ] 7.1 实现 API 密钥管理弹窗
- [ ] 7.2 实现测试接口弹窗
- [ ] 7.3 实现调用日志查看弹窗
- [ ] 7.4 样式优化和响应式设计

### 阶段8：集成与测试 (1小时)
- [ ] 8.1 测试完整的接口创建、编辑、删除流程
- [ ] 8.2 测试 SQL 执行和结果返回
- [ ] 8.3 测试 API 鉴权和调用日志
- [ ] 8.4 测试前端与后端的集成

**总计时间估算：约 14 小时**

## 重要设计考虑

### 安全性
- **SQL 注入防护**：使用参数化查询，所有用户输入必须通过参数绑定
- **权限检查**：只有系统管理员可以创建和编辑接口
- **API 鉴权**：所有动态生成的接口默认需要 API Key 认证
- **请求签名**：支持可选的 HMAC-SHA256 签名验证
- **限流保护**：防止接口被滥用

### 性能优化
- **参数缓存**：缓存接口的 SQL 和参数定义，避免重复查询
- **结果缓存**：可选的结果缓存机制（可选功能）
- **连接池**：使用数据库连接池优化查询性能
- **异步日志**：异步记录调用日志，不阻塞主流程

### 可用性
- **SQL 语法高亮**：前端 SQL 编辑器需要语法高亮
- **参数提示**：编辑 SQL 时智能提示参数
- **测试功能**：允许在保存前测试接口
- **调用统计**：展示接口的调用次数和性能指标

## 用户确认事项 ✅ (已确认)

用户已确认以下需求：

1. ✅ API 密钥支持 **3天自动过期**
2. ✅ 支持 **GET、POST、PUT、DELETE** 所有 HTTP 方法
3. ✅ SQL 查询仅支持 **SELECT** 操作
4. ❌ 不需要支持事务控制（多条 SQL 执行）
5. ✅ 调用日志保留 **30天**，过期自动清理
6. ✅ 调用接口不需要支持跨域验证，**默认都支持**
7. ✅ **支持接口版本控制**（通过 version 字段和 endpoint+version 组合唯一性）

---

# 修复和优化：接口开发功能 (2025-11-27)

## 修复：新增接口404错误

### 问题描述

当点击"新增接口"按钮时，前端跳转到 `/setting/api-builder/new`，但出现404错误。

### 根本原因

Next.js 动态路由 `[id]` 和其他路由段可能产生冲突，导致路由解析错误。

### 解决方案

改为使用嵌套路由结构：
- `/setting/api-builder/create` - 创建新接口（静态路由）
- `/setting/api-builder/edit/[id]` - 编辑接口（嵌套动态路由）

这样避免了动态路由 `[id]` 直接在 `api-builder` 下导致的冲突问题。

### 实现内容

1. ✅ 删除了有问题的 `[id]` 和 `new` 目录
2. ✅ 创建了 `edit/[id]/page.js` - 编辑接口页面
3. ✅ 创建了 `create/page.js` - 创建接口页面
4. ✅ 修改列表页路由导航：
   - `handleCreate()` → `/setting/api-builder/create`
   - `handleEdit()` → `/setting/api-builder/edit/${id}`

## 优化：参数识别和界面简化

### 优化1：移除参数定义Tab，自动识别SQL参数

**需求**：
- 不需要手动定义参数
- SQL查询自动识别参数（`:paramName` 格式）
- 根据SQL返回的列自动识别返回参数

**实现**：
- 添加了 `extractSqlParameters()` 函数，从SQL中自动提取所有 `:paramName` 参数
- 使用 `useMemo` 缓存参数识别结果
- 在SQL查询Tab中实时显示识别的参数
- 在确认Tab中展示完整的参数列表
- 保存时使用自动识别的参数替代手动输入

**优化前**：4个Tab（基本信息、SQL查询、参数定义、确认发布）
**优化后**：3个Tab（基本信息、SQL查询、确认发布）

### 优化2：简化列表页新增按钮

**改动**：
- 按钮大小从默认改为 `size="sm"`
- 按钮文本从"新增接口"改为"新增"
- Icon间距从 `mr-2` 改为 `mr-1`

**效果**：按钮更加紧凑，不占用过多空间

### 优化3：优化编辑/创建页面顶部标题

**改动**：
- 标题大小从 `text-3xl` 改为 `text-2xl`
- 副标题和各类文本都使用更合理的字号
- 整体排版更加紧凑平衡

**效果**：页面视觉层级更合理，内容占比更高

## 最终路由结构

```
/setting/api-builder
├── page.js                    # 列表页（管理所有接口）
├── create/
│   └── page.js               # 创建新接口
└── edit/
    └── [id]/
        └── page.js           # 编辑接口详情
```

## 改进对比

| 功能 | 改进前 | 改进后 |
|-----|-------|-------|
| 参数定义 | 手动逐个添加 | 自动从SQL识别 |
| 参数修改 | 需要切换到参数Tab | 编辑SQL时实时显示 |
| 页面Tab数 | 4个 | 3个 |
| 工作流 | 基本→参数→SQL→确认 | 基本→SQL→确认 |
| 新增按钮 | 占用空间较大 | 紧凑简洁 |
| 页面标题 | 过大 | 合理比例 |

## 技术实现亮点

1. **正则表达式参数提取**：使用 `/:(\w+)/g` 正则匹配SQL中所有参数
2. **参数去重**：使用 `Set` 自动去除重复的参数名
3. **性能优化**：使用 `useMemo` 缓存参数识别结果，只在SQL变化时重新计算
4. **实时反馈**：在SQL输入框下方实时显示识别的参数，优化用户体验

---

## 功能迭代：SQL参数值输入支持 (2025-11-27)

### 需求说明

用户需要在SQL查询tab中直接编辑和填写SQL参数值，而不是在单独的tab中。系统应该：
1. 自动识别SQL中的动态参数（`:paramName` 格式）
2. 在SQL tab中显示参数输入字段
3. 验证所有必需参数已填写后才能执行测试
4. 将参数值传递给后端进行SQL执行

### 实现方案

#### 前端实现

**修改文件：**
- `frontend/app/(authenticated)/setting/api-builder/create/page.js`
- `frontend/app/(authenticated)/setting/api-builder/edit/[id]/page.js`

**实现内容：**

1. **参数值状态管理** (formData)
   ```javascript
   parameterValues: {}, // 存储每个参数的值
   ```

2. **参数值变更处理函数**
   ```javascript
   const handleParameterValueChange = (paramName, value) => {
     setFormData({
       ...formData,
       parameterValues: {
         ...formData.parameterValues,
         [paramName]: value,
       },
     });
   };
   ```

3. **参数验证逻辑** (在handleTestSql中)
   - 检查所有提取的参数是否都有非空值
   - 缺少参数时显示错误提示，列出需要填写的参数名
   - 只有所有参数都已填写才允许执行SQL测试

4. **参数输入UI** (在SQL tab中)
   - 在SQL编辑框下方显示参数输入区域
   - 使用蓝色背景的容器突出显示参数区域
   - 网格布局（2列）：左侧是参数名标签，右侧是输入框
   - 必需参数用红色星号标记
   - 参数名末尾附加说明文字："请输入 {paramName} 值"

5. **测试流程**
   - 用户在SQL编辑框输入SQL查询
   - 系统自动识别参数并显示参数输入字段
   - 用户填写所有参数值
   - 点击"测试SQL"按钮
   - 前端验证所有参数已填写
   - 将SQL和参数值一起发送给后端
   - 显示测试结果

#### 后端实现

**修改文件：**
- `backend/src/modules/api-builder/api-builder.service.js`
- `backend/src/modules/api-builder/api-builder.controller.js`
- `backend/src/modules/api-builder/api-builder.routes.js`

**实现内容：**

1. **testSql方法** (service.js)
   ```javascript
   async testSql(sql_query, parameters = {}) {
     // 验证SQL是SELECT语句
     // 使用Sequelize replacements参数绑定
     // 返回列信息、行数和示例数据
   }
   ```

2. **参数处理**
   - 使用Sequelize的`replacements`参数安全地绑定用户提供的参数值
   - 防止SQL注入攻击
   - 参数绑定格式：`:paramName` 对应 `{ paramName: value }`

3. **响应格式**
   ```javascript
   {
     success: true,
     columns: [{ name: 'col1', type: 'string' }, ...],
     rowCount: 10,
     sample: [{...}, {...}]  // 前5条数据
   }
   ```

4. **路由定义** (routes.js)
   - POST `/test-sql` - 执行SQL测试
   - 接收json body：`{ sql_query, parameters }`

#### API接口更新

**文件：** `frontend/lib/api.js`

```javascript
testSql: (sql_query, parameters = {}) =>
  axios.post('/api-builder/test-sql', { sql_query, parameters })
```

### 使用流程示例

1. 用户创建新接口，输入基本信息
2. 在SQL tab输入SQL：`SELECT * FROM users WHERE id = :id AND status = :status`
3. 系统自动识别参数：`id`、`status`
4. 显示参数输入区域：
   ```
   参数值输入：
   ┌─────────────────────┐
   │ id                 │
   │ [输入框] (输入id值)  │
   │ status             │
   │ [输入框] (输入status值) │
   └─────────────────────┘
   ```
5. 用户填写：id=123, status='active'
6. 点击"测试SQL"
7. 后端执行：`SELECT * FROM users WHERE id = 123 AND status = 'active'`
8. 返回测试结果

### 安全性考虑

1. **SQL注入防护** ✅
   - 使用Sequelize参数绑定，用户输入不会直接拼接到SQL语句
   - 所有参数值都通过`replacements`机制传递

2. **类型检查** ✅
   - 前端对参数值进行基本验证（非空检查）
   - 后端对SQL语句进行验证（SELECT only）

3. **权限检查** ✅
   - 所有测试SQL操作都需要管理员权限
   - 通过中间件进行身份验证和权限验证

### 代码对比

| 功能 | 优化前 | 优化后 |
|-----|-------|-------|
| 参数输入位置 | 单独的参数Tab | SQL Tab内直接输入 |
| 参数值管理 | 在formData中分开存储 | 统一在parameterValues对象中 |
| 参数验证 | 无验证 | 在测试前验证所有参数已填写 |
| 测试数据传递 | 无参数传递 | 通过parameters对象传递 |
| 用户体验 | 需要在多个Tab间切换 | 在一个Tab内完成所有操作 |

### 测试验证

✅ 参数提取正确（包括重复参数去重）
✅ 参数输入字段正确显示
✅ 参数值验证工作正常
✅ SQL测试成功执行
✅ 测试结果正确返回
✅ 参数值正确传递给后端
✅ SQL注入防护有效

### 实现结果

此优化使SQL参数输入流程更加直观高效，用户在一个tab内就可以完成参数编辑和SQL测试，无需在多个tab间切换。同时通过使用参数绑定机制确保了SQL执行的安全性。
