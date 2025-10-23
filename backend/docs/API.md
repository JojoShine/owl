# Common Management Platform API 文档

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **Version**: 1.0.0
- **认证方式**: JWT Bearer Token

## 认证说明

除了注册和登录接口，其他所有接口都需要在请求头中携带JWT Token：

```
Authorization: Bearer {your_jwt_token}
```

## 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

### 分页响应
```json
{
  "success": true,
  "message": "获取列表成功",
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

---

## 1. 认证模块 (Auth)

### 1.1 用户注册
- **接口**: `POST /auth/register`
- **权限**: 公开
- **请求体**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "real_name": "测试用户",
  "phone": "13800138000"
}
```

### 1.2 用户登录
- **接口**: `POST /auth/login`
- **权限**: 公开
- **请求体**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "roles": []
    }
  }
}
```

### 1.3 获取当前用户信息
- **接口**: `GET /auth/me`
- **权限**: 需要认证

### 1.4 修改密码
- **接口**: `POST /auth/change-password`
- **权限**: 需要认证
- **请求体**:
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

### 1.5 刷新Token
- **接口**: `POST /auth/refresh-token`
- **权限**: 需要认证

### 1.6 登出
- **接口**: `POST /auth/logout`
- **权限**: 需要认证

---

## 2. 用户管理模块 (Users)

### 2.1 获取用户列表
- **接口**: `GET /users`
- **权限**: `user:read`
- **查询参数**:
  - `page`: 页码 (默认: 1)
  - `limit`: 每页数量 (默认: 10)
  - `search`: 搜索关键词
  - `status`: 用户状态 (active/inactive/banned)
  - `role_id`: 角色ID
  - `sort`: 排序字段 (created_at/username/email)
  - `order`: 排序方向 (ASC/DESC)

### 2.2 获取用户详情
- **接口**: `GET /users/:id`
- **权限**: `user:read`

### 2.3 创建用户
- **接口**: `POST /users`
- **权限**: `user:create`
- **请求体**:
```json
{
  "username": "newuser",
  "email": "new@example.com",
  "password": "password123",
  "real_name": "新用户",
  "phone": "13900139000",
  "status": "active",
  "role_ids": ["role-uuid-1", "role-uuid-2"]
}
```

### 2.4 更新用户
- **接口**: `PUT /users/:id`
- **权限**: `user:update`
- **请求体**:
```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "real_name": "更新用户",
  "status": "active",
  "role_ids": ["role-uuid-1"]
}
```

### 2.5 删除用户
- **接口**: `DELETE /users/:id`
- **权限**: `user:delete`

### 2.6 重置用户密码
- **接口**: `POST /users/:id/reset-password`
- **权限**: `user:update`
- **请求体**:
```json
{
  "password": "newpassword123"
}
```

---

## 3. 角色管理模块 (Roles)

### 3.1 获取角色列表
- **接口**: `GET /roles`
- **权限**: `role:read`
- **查询参数**:
  - `page`, `limit`, `search`, `status`, `sort`, `order`

### 3.2 获取所有角色（不分页）
- **接口**: `GET /roles/all`
- **权限**: `role:read`

### 3.3 获取角色详情
- **接口**: `GET /roles/:id`
- **权限**: `role:read`

### 3.4 创建角色
- **接口**: `POST /roles`
- **权限**: `role:create`
- **请求体**:
```json
{
  "name": "编辑",
  "code": "editor",
  "description": "内容编辑人员",
  "status": "active",
  "sort": 10,
  "permission_ids": ["perm-uuid-1", "perm-uuid-2"],
  "menu_ids": ["menu-uuid-1", "menu-uuid-2"]
}
```

### 3.5 更新角色
- **接口**: `PUT /roles/:id`
- **权限**: `role:update`

### 3.6 删除角色
- **接口**: `DELETE /roles/:id`
- **权限**: `role:delete`

---

## 4. 权限管理模块 (Permissions)

### 4.1 获取权限列表
- **接口**: `GET /permissions`
- **权限**: `permission:read`
- **查询参数**:
  - `page`, `limit`, `search`, `resource`, `action`, `category`, `sort`, `order`

### 4.2 获取所有权限（分组）
- **接口**: `GET /permissions/all`
- **权限**: `permission:read`

### 4.3 获取权限详情
- **接口**: `GET /permissions/:id`
- **权限**: `permission:read`

### 4.4 创建权限
- **接口**: `POST /permissions`
- **权限**: 仅超级管理员
- **请求体**:
```json
{
  "name": "创建文章",
  "code": "article:create",
  "resource": "article",
  "action": "create",
  "description": "创建文章权限",
  "category": "内容管理"
}
```

### 4.5 更新权限
- **接口**: `PUT /permissions/:id`
- **权限**: 仅超级管理员

### 4.6 删除权限
- **接口**: `DELETE /permissions/:id`
- **权限**: 仅超级管理员

### 4.7 获取资源列表
- **接口**: `GET /permissions/resources`
- **权限**: `permission:read`

### 4.8 获取操作类型列表
- **接口**: `GET /permissions/actions`
- **权限**: `permission:read`

### 4.9 获取分类列表
- **接口**: `GET /permissions/categories`
- **权限**: `permission:read`

---

## 5. 菜单管理模块 (Menus)

### 5.1 获取菜单列表
- **接口**: `GET /menus`
- **权限**: `menu:read`
- **查询参数**:
  - `page`, `limit`, `search`, `type`, `status`, `parent_id`, `sort`, `order`

### 5.2 获取菜单树
- **接口**: `GET /menus/tree`
- **权限**: `menu:read`

### 5.3 获取当前用户菜单树
- **接口**: `GET /menus/user-tree`
- **权限**: 需要认证

### 5.4 获取菜单详情
- **接口**: `GET /menus/:id`
- **权限**: `menu:read`

### 5.5 创建菜单
- **接口**: `POST /menus`
- **权限**: `menu:create`
- **请求体**:
```json
{
  "parent_id": null,
  "name": "系统管理",
  "path": "/system",
  "component": "Layout",
  "icon": "Settings",
  "type": "menu",
  "visible": true,
  "sort": 1,
  "status": "active",
  "permission_code": null
}
```

### 5.6 更新菜单
- **接口**: `PUT /menus/:id`
- **权限**: `menu:update`

### 5.7 删除菜单
- **接口**: `DELETE /menus/:id`
- **权限**: `menu:delete`

---

## 状态码说明

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 无权限
- `404`: 资源不存在
- `422`: 验证失败
- `500`: 服务器错误

## 权限代码说明

权限代码格式：`resource:action`

**资源 (resource)**:
- `user`: 用户
- `role`: 角色
- `permission`: 权限
- `menu`: 菜单
- `file`: 文件
- `config`: 配置
- `log`: 日志
- `job`: 定时任务
- `dashboard`: 仪表盘

**操作 (action)**:
- `create`: 创建
- `read`: 读取
- `update`: 更新
- `delete`: 删除