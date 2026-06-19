# 开始开发

本文档面向基于 Owl Platform 进行业务开发的开发者，介绍项目结构、开发规范和最佳实践。

---

## 项目结构

```
owl_platform/
├── frontend/
│   ├── app/
│   │   ├── (authenticated)/              # 已登录用户访问的页面
│   │   │   ├── dashboard/                # 首页看板
│   │   │   ├── system/                   # 系统管理页面（对应 core 模块）
│   │   │   └── your-biz/                 # 业务页面目录
│   │   │       ├── README.md             # 目录说明
│   │   │       ├── example/              # 示例页面（参考此目录）
│   │   │       └── your-module/          # 你的业务页面
│   │   │           ├── page.js           # 页面入口
│   │   │           └── components/       # 模块私有组件（可选）
│   │   └── login/
│   │
│   ├── components/                       # 公共组件
│   │   ├── ui/                           # shadcn/ui 基础组件
│   │   ├── common/                       # 系统级公共组件
│   │   └── your-biz/                     # 业务公共组件（可选）
│   │
│   └── lib/
│       └── api/
│           ├── system/                   # 系统接口封装
│           └── biz/                      # 业务接口封装
│               ├── README.md             # 目录说明
│               ├── example.api.js        # 示例接口（参考此文件）
│               └── your-module.api.js    # 你的业务接口
│
└── backend/
    └── src/
        ├── core/modules/                 # 系统内置模块，不在此目录添加业务代码
        ├── business/
        │   └── modules/                  # 业务模块目录
        │       ├── example/              # 示例模块（参考此目录）
        │       └── your-module/          # 你的业务模块
        │           ├── your-module.routes.js
        │           ├── your-module.controller.js
        │           ├── your-module.service.js
        │           └── your-module.validation.js
        └── routes/
            ├── core.routes.js            # 系统路由（/api/system/*）
            └── business.routes.js        # 业务路由（/api/biz/*）
```

---

## 新建业务模块

### 后端

1. 复制 `src/business/modules/example/` 目录，重命名为你的模块名
2. 将文件内所有 `example` 替换为模块名
3. 在 `src/routes/business.routes.js` 中注册路由：

```js
const yourModuleRoutes = require('../business/modules/your-module/your-module.routes');
router.use('/your-module', yourModuleRoutes);  // 完整路径：/api/biz/your-module
```

### 前端页面

1. 在 `app/(authenticated)/your-biz/` 下新建页面目录
2. 复制 `your-biz/example/page.js` 作为起点

**组件放置原则**：
- 只在当前页面使用 → `your-module/components/`
- 多个业务模块共用 → `frontend/components/your-biz/` 或 `components/common/`

### 前端接口

复制 `lib/api/biz/example.api.js`，修改路径和方法名。

---

## 后端开发规范

### 响应格式

统一使用 `src/utils/response.js`：

```js
const { success, paginated, created } = require('../../../utils/response');

success(res, data);                                          // 单条数据
created(res, data, '创建成功');                              // 新建成功
paginated(res, rows, { total, page, pageSize });             // 分页列表
```

### 错误处理

```js
const ApiError = require('../../../utils/ApiError');

if (!record) throw new ApiError(404, '记录不存在');
```

### 日志

```js
const { logger } = require('../../../config/logger');

logger.info('操作描述', { userId, data });
logger.error('错误描述', error);
```

### 审计字段

`created_by`、`updated_by`、`deleted_by` 由全局 Hook 自动填充，无需手动处理。

### 数据访问权限（DAC）

业务 list 接口需要数据范围过滤时，从 `req.userContext` 取上下文：

```js
const DataAccessControl = require('../../../utils/data-access-control');

async getList(query, userContext) {
  const dac = new DataAccessControl(userContext.userId, userContext.userDepartmentUsers);
  const dacWhere = dac.getFilterWhere(userContext.accessLevel);
  const where = { ...dacWhere, /* 其他条件 */ };
}
```

---

## 前端开发规范

### API 请求

```js
// lib/api/biz/your-module.api.js
import axios from '../../utils/http-client';

export const yourModuleApi = {
  getList: (params) => axios.get('/biz/your-module', { params }),
  getDetail: (id) => axios.get(`/biz/your-module/${id}`),
  create: (data) => axios.post('/biz/your-module', data),
  update: (id, data) => axios.put(`/biz/your-module/${id}`, data),
  delete: (id) => axios.delete(`/biz/your-module/${id}`),
};
```

UI 组件统一使用 `shadcn/ui`，样式使用 Tailwind CSS，不引入新的 UI 库。

---

## 菜单与权限配置（必读）

### 开发流程

**第一步：维护菜单** → 自动生成权限 → **第二步：按菜单名称规范开发前后端** → 权限自动生效

### 为什么先维护菜单？

- 菜单是权限的基础，系统会自动生成该菜单对应的权限
- 所有权限默认关联到「系统管理员」角色
- **建立统一的命名规范**：菜单名 → 前端路由 → 后端模块 → 数据库表

### 快速开始

#### 1. 创建菜单

「系统管理 → 菜单管理」→ 「新建菜单」

- 菜单名称：`用户反馈`
- 菜单路径：`/business/feedback`
- 菜单图标：`MessageCircle`

点击「自动生成权限」 → 自动创建 `feedback:read/create/update/delete`

#### 2. 按规范命名开发

菜单路径 `/business/feedback` 对应：

- **前端**：`app/(authenticated)/business/feedback/page.js`
- **后端**：`src/business/modules/feedback/feedback.routes.js`
- **接口**：`GET /api/biz/feedback` 等
- **数据表**：`feedback` (不用 owl_ 前缀)

#### 3. 验证权限

「系统管理 → 角色管理」→ 查看「系统管理员」是否包含 `feedback:*` 权限

### 权限自动检查

后端在权限中间件自动检查（无需手动验证），前端通过 `localStorage.user.permissions` 判断按钮权限。

---

## 注意事项

- 业务表命名**不使用 `owl_` 前缀**，避免与系统表冲突
- 业务模块放 `business/modules/`，路由注册到 `business.routes.js`（`/api/biz/*`）
- 系统内置模块在 `core/modules/`，不在此目录添加业务代码
- 敏感字段在「系统管理 → 敏感字段配置」登记，接口响应自动脱敏
- 文件上传统一使用文件管理服务
- 环境变量统一放 `.env.local`
