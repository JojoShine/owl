# 后端模块架构说明

## 文件夹结构

```
modules/
├── [System Modules] - 系统框架代码
│   ├── auth/              # 认证与授权
│   ├── user/              # 用户管理
│   ├── role/              # 角色管理
│   ├── permission/        # 权限管理
│   ├── menu/              # 菜单管理
│   ├── captcha/           # 验证码服务
│   ├── department/        # 部门组织结构
│   ├── file/              # 文件管理
│   ├── folder/            # 文件夹管理
│   ├── file-share/        # 文件分享
│   ├── dictionary/        # 数据字典
│   ├── log/               # 操作日志
│   ├── api-interface/     # API接口管理
│   ├── datasource/        # 数据源管理
│   └── page-config/       # 页面配置
│
└── business/              # 业务功能代码（后续新增）
    ├── [Your Business Module 1]/
    │   ├── [module-name].controller.js
    │   ├── [module-name].service.js
    │   ├── [module-name].routes.js
    │   ├── [module-name].validation.js
    │   └── [module-name].model.js
    └── [Your Business Module 2]/
        ├── ...
```

## 设计原则

### System Modules（系统模块）
- **定义**：Owl 管理平台的核心框架代码
- **特点**：与平台通用功能紧密相关，任何业务都可能依赖
- **包括**：认证、授权、用户、角色、权限、文件、文件夹等
- **位置**：`modules/` 根目录下的各个模块文件夹

### Business Modules（业务模块）
- **定义**：基于 Owl 平台构建的具体业务功能
- **特点**：专属于某个业务域，不影响其他业务的功能
- **位置**：`modules/business/` 文件夹下
- **示例**：CRM 模块、ERP 模块、工作流引擎等

## 新增业务模块的步骤

1. **创建模块文件夹**
   ```bash
   mkdir -p src/modules/business/[module-name]
   ```

2. **创建标准模块文件**
   ```
   [module-name]/
   ├── [module-name].controller.js      # 控制器 - 处理HTTP请求
   ├── [module-name].service.js         # 服务 - 业务逻辑
   ├── [module-name].routes.js          # 路由 - API端点定义
   ├── [module-name].validation.js      # 验证 - 请求数据验证
   ├── [module-name].model.js           # 模型 - 数据库模型（可选）
   └── README.md                        # 模块说明文档
   ```

3. **注册路由**
   编辑 `src/routes/index.js`，添加业务模块路由：
   ```javascript
   const [moduleName]Routes = require('../modules/business/[module-name]/[module-name].routes');
   router.use('/[module-endpoint]', [moduleName]Routes);
   ```

4. **遵循 Controller-Service 模式**
   - **Controller**：负责 HTTP 请求/响应处理、参数验证调用
   - **Service**：包含业务逻辑、数据库操作、外部服务调用
   - 服务间通过依赖注入或直接引入进行交互

## 模块开发规范

### 文件命名
- 使用 kebab-case（短横线分隔）：`user-profile.service.js`
- 使用 camelCase（驼峰式）的 JavaScript 类名：`UserProfileService`

### 导出模式
每个服务应导出单一实例：
```javascript
module.exports = new UserProfileService();
```

### 错误处理
使用统一的错误处理机制：
```javascript
const { ApiError } = require('../../utils/ApiError');
throw new ApiError(400, 'Error message');
```

### 日志记录
使用项目的日志系统：
```javascript
const { logger } = require('../../config/logger');
logger.info('Operation completed');
logger.error('Error occurred', error);
```

## 系统和业务模块的交互

业务模块可以调用系统模块的服务：

```javascript
// 业务模块中使用系统服务
const userService = require('../../user/user.service');
const authMiddleware = require('../../auth/auth.middleware');

router.post('/custom-action', authMiddleware.protect, async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  // 业务逻辑
});
```

## 版本迭代

- 系统模块的变更需谨慎，可能影响所有业务
- 业务模块的变更相对独立，不影响其他业务
- 定期审查系统模块，提炼通用业务功能上升为系统功能

## 相关文档

- 系统模块详情：见 `BACKEND_MODULES_INDEX.md`
- API 接口规范：见 `API_RESPONSE_FORMAT.md`
- 数据库设计：见数据库迁移文件

