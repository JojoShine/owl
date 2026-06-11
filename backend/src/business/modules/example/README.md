# 业务模块示例 (example)

此目录为业务模块的示例，开发新业务模块时复制此目录并替换 `example` 为你的模块名。

## 文件说明

| 文件 | 职责 |
|------|------|
| `example.routes.js` | 路由定义，挂载认证和权限中间件 |
| `example.controller.js` | 接收请求，调用 service，返回响应 |
| `example.service.js` | 业务逻辑，数据库操作 |
| `example.validation.js` | 入参校验规则（Joi） |

## 注册路由

在 `src/routes/business.routes.js` 中添加：

```js
const exampleRoutes = require('../business/modules/example/example.routes');
router.use('/example', exampleRoutes);  // /api/biz/example
```

## 权限标识

权限遵循 `模块名:操作` 格式，在菜单管理中自动生成：

```
example:read
example:create
example:update
example:delete
```
