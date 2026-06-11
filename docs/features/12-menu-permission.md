# 菜单与权限自动生成 (Menu & Permission Auto-generation)

## 功能概述

菜单与权限模块提供动态菜单树管理能力。创建菜单时可选择自动生成对应的 CRUD 权限，系统自动将权限写入权限表，形成完整的菜单 → 权限 → 角色三层关联。

## 核心概念

### 1. 菜单类型

菜单分为两类，前端按此分栏展示：

| 类型 | 说明 | 场景 |
|------|------|------|
| `business` | 业务菜单 | 面向业务功能的菜单（如"用户管理"、"报表"） |
| `system` | 系统菜单 | 系统配置相关菜单（如"系统配置"、"权限管理"） |

前端展示时通常将两类菜单分开显示，业务菜单在上，系统菜单在下。

### 2. 菜单树结构

菜单支持多级嵌套，形成树形结构：

```
├─ 业务管理 (business)
│  ├─ 用户管理
│  ├─ 部门管理
│  └─ 报表中心
│     ├─ 销售报表
│     └─ 财务报表
└─ 系统配置 (system)
   ├─ 权限管理
   ├─ 角色管理
   └─ 菜单管理
```

### 3. 权限自动生成

创建菜单时可勾选 `auto_generate_permission: true`，系统会自动生成 4 个权限：

| 权限代码 | 说明 |
|---------|------|
| `{menu_path}-read` | 查看 |
| `{menu_path}-create` | 新增 |
| `{menu_path}-update` | 编辑 |
| `{menu_path}-delete` | 删除 |

其中 `{menu_path}` 是菜单的路径标识。

#### 示例

菜单路径为 `/user-management`，自动生成权限：

```
user-management-read
user-management-create
user-management-update
user-management-delete
```

这些权限随后可绑定到角色，控制用户的菜单访问和操作权限。

## 菜单管理接口

### 1. 菜单列表

```bash
GET /api/system/menus?page=1&limit=10&search=用户&type=business&status=active
```

查询参数：
- `search` — 按菜单名称或路径搜索
- `type` — 菜单类型筛选：`business` / `system`
- `status` — 菜单状态：`active` / `inactive`
- `parentId` — 按父菜单筛选

### 2. 菜单树（全量）

```bash
GET /api/system/menus/tree
```

返回完整菜单树，仅包含 `status: active` 的菜单。

### 3. 用户菜单树

```bash
GET /api/system/menus/tree/user
```

根据当前登录用户的角色权限过滤菜单树，特性：

- **权限过滤**：仅返回用户有权访问的菜单
- **自动补全**：如果子菜单有权限，自动包含其父菜单（防止父菜单灰显）
- **分离显示**：分离出 `business` 和 `system` 两份菜单树

响应格式：

```json
{
  "code": 0,
  "data": {
    "business": [
      {
        "id": 1,
        "name": "用户管理",
        "path": "/user-management",
        "children": [...]
      }
    ],
    "system": [
      {
        "id": 10,
        "name": "系统配置",
        "path": "/system-config",
        "children": [...]
      }
    ]
  }
}
```

### 4. 创建菜单

```bash
POST /api/system/menus
Content-Type: application/json

{
  "name": "用户管理",
  "path": "/user-management",
  "menu_type": "business",
  "parent_id": null,
  "icon": "Users",
  "order": 1,
  "auto_generate_permission": true,
  "status": "active"
}
```

**事务处理**：
1. 创建菜单记录
2. 如 `auto_generate_permission: true`，自动生成 4 个权限并写入 `Permission` 表
3. 原子性保证，任一步失败都会回滚

### 5. 更新菜单

```bash
PUT /api/system/menus/:id
```

支持修改菜单名称、图标、顺序、状态等。如改变 `auto_generate_permission` 可选择重新生成权限。

### 6. 删除菜单

```bash
DELETE /api/system/menus/:id
```

限制：
- 如果菜单有子菜单，拒绝删除
- 删除菜单同时删除 `RoleMenu` 中的关联记录
- 自动生成的权限保留（便于后续恢复）

### 7. 循环引用检测

创建或更新菜单时，系统自动检测是否形成循环引用（如将某菜单设为其子菜单的父菜单）。

```javascript
// 内部实现
isDescendant(parentId, childId) {
  // 递归向上遍历，检查 parentId 是否是 childId 的后代
  // 如果是，则形成循环，拒绝操作
}
```

## 权限绑定

菜单权限通过 `RoleMenu` 中间表与角色关联。

### 权限绑定接口

| 接口 | 说明 |
|------|------|
| `GET /api/system/roles/:roleId/menus` | 获取角色的菜单列表 |
| `POST /api/system/roles/:roleId/menus` | 给角色绑定菜单权限 |
| `DELETE /api/system/roles/:roleId/menus/:menuId` | 撤销角色的菜单权限 |

### 绑定权限

```bash
POST /api/system/roles/admin/menus
Content-Type: application/json

{
  "menuIds": [1, 2, 3, 10, 11, 12]
}
```

系统会自动将这些菜单对应的权限添加到 `admin` 角色。

## 工作流

### 1. 创建菜单并自动生成权限

```bash
POST /api/system/menus
{
  "name": "用户管理",
  "path": "/user-management",
  "auto_generate_permission": true
}
```

系统自动创建：
- `user-management-read`
- `user-management-create`
- `user-management-update`
- `user-management-delete`

### 2. 绑定权限到角色

```bash
POST /api/system/roles/manager/menus
{
  "menuIds": [1]  // 假设菜单 ID 为 1
}
```

`manager` 角色获得 `user-management-*` 四个权限。

### 3. 用户访问

1. 用户登录，系统加载其所有角色
2. 前端调用 `GET /api/system/menus/tree/user`
3. 后端根据用户角色权限过滤菜单树
4. 前端渲染菜单树

## 循环引用检测示例

```
原菜单树：
├─ 父菜单 (ID: 1)
│  └─ 子菜单 (ID: 2)

尝试将菜单 1 的父菜单改为菜单 2 ❌ 拒绝

检测流程：
1. 尝试设置 parent_id(2)
2. 调用 isDescendant(2, 1)
3. 从菜单 1 向上遍历：1 → (无父菜单) → 停止
4. 菜单 2 不是菜单 1 的后代 ✓
5. 不形成循环，允许操作
```

但如果：

```
尝试将菜单 1 的父菜单改为菜单 2，而菜单 2 已是菜单 1 的子菜单 ❌ 拒绝

检测流程：
1. 尝试设置 parent_id(2)
2. 调用 isDescendant(2, 1)
3. 从菜单 1 向上遍历：1 → 2 → ...
4. 发现菜单 2 是菜单 1 的后代 ✗ 形成循环
5. 拒绝操作
```

## 使用建议

- **合理分类**：业务菜单和系统菜单清晰分离
- **权限命名**：权限代码规范化，便于管理和审计
- **定期审查**：定期检查菜单权限配置是否符合安全政策
- **避免过深**：菜单层级不宜过深（建议 ≤ 4 级），影响用户体验
