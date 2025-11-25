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
