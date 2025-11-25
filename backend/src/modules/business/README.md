# 业务模块 (Business Modules)

欢迎来到 Owl 管理平台的业务模块目录！

## 📁 文件夹说明

这个文件夹用于存放**基于 Owl 平台构建的具体业务功能**。

### 与系统模块的区别

| 维度 | 系统模块 | 业务模块 |
|------|---------|---------|
| **位置** | `src/modules/` 根目录 | `src/modules/business/` |
| **作用** | 平台框架通用功能 | 特定业务领域功能 |
| **示例** | 用户、角色、权限、文件 | CRM、ERP、工作流等 |
| **生命周期** | 与平台同生同死 | 可独立升级迭代 |

## 🚀 快速开始

### 创建新业务模块

1. **参考模板**：查看 `TEMPLATE.md` 了解标准的模块结构和代码示例

2. **创建文件夹**：
   ```bash
   mkdir -p src/modules/business/[your-module-name]
   ```

3. **添加模块文件**：
   ```
   [your-module-name]/
   ├── [module-name].controller.js
   ├── [module-name].service.js
   ├── [module-name].routes.js
   ├── [module-name].validation.js
   ├── [module-name].model.js       (可选)
   └── README.md
   ```

4. **注册路由**：
   编辑 `src/routes/index.js`，添加路由引入

5. **创建数据库模型**（如需要）：
   在 `src/models/` 创建对应的 Sequelize 模型

## 📋 模块列表

> 当前业务模块：无
>
> （新增业务时，请更新此列表）

| 模块名 | 描述 | 负责人 | 状态 |
|-------|------|--------|------|
| - | - | - | - |

## 📚 架构指南

详细的架构说明和设计原则，请参考：
- `../ARCHITECTURE.md` - 完整的后端架构文档
- `TEMPLATE.md` - 业务模块创建模板

## 💡 开发建议

### 1. 遵循统一的模块结构
```
module-name/
├── controller.js    - HTTP请求处理
├── service.js       - 业务逻辑实现
├── routes.js        - API路由定义
├── validation.js    - 数据验证规则
├── model.js         - 数据库模型（可选）
└── README.md        - 模块文档
```

### 2. 充分利用系统模块
业务模块可以安全地调用系统模块提供的服务：

```javascript
// 使用用户服务
const userService = require('../../user/user.service');

// 使用认证中间件
const { protect } = require('../../auth/auth.middleware');

// 使用日志系统
const { logger } = require('../../config/logger');
```

### 3. 统一的错误处理

```javascript
const { ApiError } = require('../../utils/ApiError');
const { error } = require('../../utils/response');

throw new ApiError(400, '错误消息');
```

### 4. 统一的响应格式

```javascript
const { success } = require('../../utils/response');

success(res, data, '操作成功');
```

## 🔗 关键文件链接

- **系统模块总览**：`../BACKEND_MODULES_INDEX.md`
- **后端架构说明**：`../ARCHITECTURE.md`
- **模块创建模板**：`./TEMPLATE.md`
- **API响应格式**：`../../docs/api-response-format.md`

## 📝 常见问题

### Q: 业务模块和系统模块如何交互？
**A**: 业务模块可以直接引入和使用系统模块的服务，但系统模块不应该依赖业务模块。

### Q: 如何在业务模块中添加新的数据表？
**A**:
1. 在 `src/models/` 创建模型文件
2. 在 `src/models/index.js` 注册模型
3. 创建数据库迁移文件（如果使用迁移）
4. 在 `service.js` 中使用模型

### Q: 业务模块支持中间件吗？
**A**: 支持！可以在 `routes.js` 中使用任何中间件，包括系统提供的和自定义的。

### Q: 如何组织复杂的业务模块？
**A**: 对于复杂的业务模块，可以在模块内部进一步分层：
```
complex-business/
├── controllers/
│   ├── resource1.controller.js
│   └── resource2.controller.js
├── services/
│   ├── resource1.service.js
│   ├── resource2.service.js
│   └── shared.service.js
├── routes.js
├── validation.js
└── README.md
```

## 🤝 协作规范

1. **命名规范**：使用 kebab-case（短横线分隔）
2. **代码风格**：遵循项目现有的 ESLint 规则
3. **文档完整**：每个模块都应有清晰的 README.md
4. **版本控制**：提交前运行测试确保代码质量
5. **文档同步**：新增/修改模块后更新本文件的模块列表

## 📞 需要帮助？

- 查看 `TEMPLATE.md` 了解详细的代码示例
- 参考现有的系统模块实现逻辑
- 查阅项目的完整文档和架构说明

---

**Happy Coding! 🎉**
