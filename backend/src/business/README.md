# 业务模块目录

此目录用于存放项目特定的业务代码。所有业务功能都应该在这里开发。

## 目录结构

```
business/
├── modules/        # 业务模块
│   ├── order/     # 示例：订单模块
│   ├── product/   # 示例：产品模块
│   └── customer/  # 示例：客户模块
├── services/       # 业务服务层（跨模块共享）
├── jobs/          # 业务定时任务
├── validators/    # 业务验证器（共享）
└── utils/         # 业务工具函数
```

## 开发规范

### 1. 模块结构

每个业务模块应包含完整的 MVC 结构：

```
modules/order/
├── order.controller.js     # 控制器 - 处理请求响应
├── order.service.js        # 服务层 - 业务逻辑
├── order.routes.js         # 路由 - 定义接口
├── order.validation.js     # 验证器 - 参数验证
└── order.model.js          # 模型 - 数据库模型（可选）
```

### 2. 命名规范

- **文件名**：小写，使用连字符（kebab-case）
  - `order-item.controller.js`
  - `product-category.service.js`

- **类名**：大驼峰（PascalCase）
  - `OrderController`
  - `ProductService`

- **变量/函数**：小驼峰（camelCase）
  - `getOrderList`
  - `createProduct`

- **数据库表**：`biz_` 前缀 + 下划线命名
  - `biz_orders`
  - `biz_products`
  - `biz_order_items`

### 3. 路由规范

业务模块路由直接挂载到 `/api` 下：

```
/api/orders/*       # 订单
/api/products/*     # 产品
/api/customers/*    # 客户
```

### 4. 权限规范

业务权限使用模块名作为前缀：

```
order:read
order:create
order:update
order:delete
product:manage
customer:view
```

### 5. 使用核心功能

业务模块可以使用所有核心系统功能：

```javascript
// 使用核心工具
const { success, paginated } = require('../../utils/response');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

// 使用核心中间件
const { authenticate } = require('../../middlewares/auth');
const { checkPermission } = require('../../middlewares/permission');

// 使用核心服务
const userService = require('../../core/modules/user/user.service');
const notificationService = require('../../core/modules/notification/notification.service');
```

## 快速开始

### 创建新模块

1. 创建模块目录：
```bash
mkdir -p src/business/modules/order
```

2. 复制模板文件（参考 `BUSINESS_MODULE_TEMPLATE.md`）

3. 在 `routes/business.routes.js` 中注册路由：
```javascript
const orderRoutes = require('../business/modules/order/order.routes');
router.use('/orders', orderRoutes);
```

4. 创建数据库表（使用 `biz_` 前缀）

5. 添加权限配置

### 示例代码

查看 `BUSINESS_MODULE_TEMPLATE.md` 获取完整的代码模板。

## 数据库迁移

业务模块的数据库迁移文件放在：

```
migrations/business/
├── 20240101000000-create-biz-orders.js
├── 20240101000001-create-biz-products.js
└── 20240101000002-create-biz-customers.js
```

## 测试

业务模块的测试文件放在：

```
tests/business/
├── order.test.js
├── product.test.js
└── customer.test.js
```

运行测试：
```bash
npm run test:business
```

## 最佳实践

1. **保持模块独立**：每个模块应该是自包含的，减少模块间依赖

2. **使用服务层**：复杂的业务逻辑放在 Service 层，Controller 只负责请求响应

3. **统一错误处理**：使用 `ApiError` 类抛出错误，由全局错误处理中间件统一处理

4. **参数验证**：使用 express-validator 验证所有输入参数

5. **日志记录**：记录关键操作和错误信息

6. **权限控制**：所有接口都应该有权限检查

7. **代码复用**：共享的业务逻辑放在 `business/services/` 目录

8. **文档完善**：每个模块都应该有清晰的注释和 API 文档

## 注意事项

- ❌ 不要修改核心模块代码
- ❌ 不要在业务模块中使用 `sys_` 表前缀
- ❌ 不要在业务路由中使用 `/system` 前缀
- ✅ 使用核心系统提供的工具和中间件
- ✅ 遵循统一的代码风格和结构
- ✅ 编写单元测试和集成测试

## 技术支持

如有问题，请查看：
- 核心系统文档：`src/core/README.md`
- 模块开发模板：`BUSINESS_MODULE_TEMPLATE.md`
- 代码分离方案：`CODE_SEPARATION_PLAN.md`
