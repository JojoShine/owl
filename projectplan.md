# 用户管理角色分配功能添加

## 问题描述

用户管理页面的表单中缺少角色分配功能，无法为用户分配角色。

**当前情况**:
- ✅ 后端API已支持 `role_ids` 参数
- ❌ 前端表单缺少角色选择组件

**影响文件**:
- `frontend/components/users/user-form-dialog.jsx` - 用户表单对话框，需要添加角色选择

## 待办事项

- [x] 1. 在 user-form-dialog.jsx 中添加角色多选组件
- [x] 2. 从 API 获取角色列表
- [x] 3. 在表单提交时包含 role_ids 参数
- [x] 4. 编辑用户时回显已分配的角色

## 解决方案

### 添加角色多选功能

在 `user-form-dialog.jsx` 中添加：
1. 获取角色列表（使用 roleApi.getRoles）
2. 添加多选组件（使用 Checkbox 或 Multi-Select）
3. 表单验证规则中添加 role_ids 字段
4. 提交时将选中的角色 ID 数组发送给后端

---

## 实施步骤

### 已完成的修改

**文件**: `frontend/components/users/user-form-dialog.jsx`

**修改内容**:

1. **导入依赖**
   - 添加 `Checkbox` 组件
   - 导入 `roleApi`

2. **表单验证**
   - 在 schema 中添加 `role_ids: z.array(z.string()).optional()`
   - 在 defaultValues 中添加 `role_ids: []`

3. **状态管理**
   - 添加 `roles` 状态存储角色列表
   - 添加 `roleIdsValue` watch 当前选中的角色

4. **数据获取**
   - 在 `useEffect` 中添加 `fetchRoles` 函数
   - 调用 `roleApi.getRoles()` 获取所有角色

5. **表单回显**
   - 编辑用户时，从 `user.roles` 提取角色ID
   - 转换为字符串数组并设置到表单

6. **UI组件**
   - 添加角色多选区域（Checkbox列表）
   - 支持滚动（max-h-40）
   - 显示角色名称和描述

7. **提交逻辑**
   - 将 role_ids 从字符串数组转换为数字数组
   - 发送给后端API

---

## Review

### 功能说明

用户管理表单现在支持角色分配功能：

1. **创建用户**: 可以勾选一个或多个角色
2. **编辑用户**: 显示已分配的角色，可以修改
3. **角色展示**: 显示角色名称和描述（如果有）
4. **滚动列表**: 角色多时支持滚动

### 实现细节

- 使用 Checkbox 组件实现多选
- 角色ID在表单中以字符串形式存储，提交时转换为数字
- 角色列表通过 API 动态获取
- 编辑时自动回显已分配的角色

### 建议测试项

1. ✅ 创建新用户并分配角色
2. ✅ 编辑用户修改角色
3. ✅ 查看用户详情是否显示角色信息
4. ✅ 取消所有角色（role_ids为空数组）
