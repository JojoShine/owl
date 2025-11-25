# 业务模块创建模板

## 快速开始

### 1. 创建模块目录结构

```bash
# 创建模块文件夹
mkdir -p src/modules/business/[module-name]

# 创建所需文件
cd src/modules/business/[module-name]
touch [module-name].controller.js
touch [module-name].service.js
touch [module-name].routes.js
touch [module-name].validation.js
touch README.md
```

### 2. 模板文件内容

#### 2.1 routes.js（路由定义）

```javascript
const express = require('express');
const router = express.Router();
const [ModuleName]Controller = require('./[module-name].controller');
const { protect } = require('../../auth/auth.middleware');
const validate = require('./[module-name].validation');

/**
 * [Module] 相关路由
 */

// GET /api/[endpoints]
router.get('/', protect, validate.list, [ModuleName]Controller.list);

// GET /api/[endpoints]/:id
router.get('/:id', protect, validate.getById, [ModuleName]Controller.getById);

// POST /api/[endpoints]
router.post('/', protect, validate.create, [ModuleName]Controller.create);

// PUT /api/[endpoints]/:id
router.put('/:id', protect, validate.update, [ModuleName]Controller.update);

// DELETE /api/[endpoints]/:id
router.delete('/:id', protect, validate.delete, [ModuleName]Controller.delete);

module.exports = router;
```

#### 2.2 controller.js（控制器）

```javascript
const [ModuleName]Service = require('./[module-name].service');
const { success, error } = require('../../utils/response');

class [ModuleName]Controller {
  async list(req, res) {
    try {
      const result = await [ModuleName]Service.list(req.query);
      success(res, result, '[ModuleName] list retrieved successfully');
    } catch (err) {
      error(res, err);
    }
  }

  async getById(req, res) {
    try {
      const result = await [ModuleName]Service.getById(req.params.id);
      success(res, result, '[ModuleName] retrieved successfully');
    } catch (err) {
      error(res, err);
    }
  }

  async create(req, res) {
    try {
      const result = await [ModuleName]Service.create(req.body, req.user);
      success(res, result, '[ModuleName] created successfully');
    } catch (err) {
      error(res, err);
    }
  }

  async update(req, res) {
    try {
      const result = await [ModuleName]Service.update(req.params.id, req.body, req.user);
      success(res, result, '[ModuleName] updated successfully');
    } catch (err) {
      error(res, err);
    }
  }

  async delete(req, res) {
    try {
      await [ModuleName]Service.delete(req.params.id, req.user);
      success(res, null, '[ModuleName] deleted successfully');
    } catch (err) {
      error(res, err);
    }
  }
}

module.exports = new [ModuleName]Controller();
```

#### 2.3 service.js（业务服务）

```javascript
const { [ModuleName] } = require('../../models');
const { ApiError } = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

class [ModuleName]Service {
  async list(query) {
    try {
      const { page = 1, limit = 20, search } = query;
      const offset = (page - 1) * limit;

      let where = {};
      if (search) {
        where = {
          // 添加搜索条件
        };
      }

      const { count, rows } = await [ModuleName].findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        order: [['created_at', 'DESC']],
      });

      return {
        total: count,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error('获取列表失败:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const record = await [ModuleName].findByPk(id);
      if (!record) {
        throw new ApiError(404, '[ModuleName] not found');
      }
      return record;
    } catch (error) {
      logger.error('获取详情失败:', error);
      throw error;
    }
  }

  async create(data, user) {
    try {
      const record = await [ModuleName].create({
        ...data,
        created_by: user.id,
      });
      logger.info(`创建[ModuleName]成功: ${record.id}`);
      return record;
    } catch (error) {
      logger.error('创建[ModuleName]失败:', error);
      throw error;
    }
  }

  async update(id, data, user) {
    try {
      const record = await this.getById(id);
      await record.update({
        ...data,
        updated_by: user.id,
      });
      logger.info(`更新[ModuleName]成功: ${id}`);
      return record;
    } catch (error) {
      logger.error('更新[ModuleName]失败:', error);
      throw error;
    }
  }

  async delete(id, user) {
    try {
      const record = await this.getById(id);
      await record.destroy();
      logger.info(`删除[ModuleName]成功: ${id}`);
    } catch (error) {
      logger.error('删除[ModuleName]失败:', error);
      throw error;
    }
  }
}

module.exports = new [ModuleName]Service();
```

#### 2.4 validation.js（数据验证）

```javascript
const Joi = require('joi');

const list = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().allow(''),
  }),
};

const getById = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

const create = {
  body: Joi.object({
    // 添加字段验证规则
    // name: Joi.string().required(),
  }).required(),
};

const update = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    // 添加字段验证规则
  }).min(1),
};

const deleteRecord = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: deleteRecord,
};
```

### 3. 注册路由

编辑 `src/routes/index.js`，添加你的业务模块路由：

```javascript
// 业务功能路由
const [moduleName]Routes = require('../modules/business/[module-name]/[module-name].routes');
router.use('/[endpoint]', [moduleName]Routes);
```

### 4. 创建数据库模型（可选）

如果需要新的数据表，在 `src/models/` 创建模型：

```javascript
module.exports = (sequelize, DataTypes) => {
  const [ModuleName] = sequelize.define('[ModuleName]', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // 添加其他字段
    created_by: DataTypes.UUID,
    updated_by: DataTypes.UUID,
  }, {
    tableName: '[table_name]',
    timestamps: true,
    underscored: true,
  });

  return [ModuleName];
};
```

然后在 `src/models/index.js` 中注册模型。

### 5. 创建数据库迁移（可选）

```bash
npm run migrate:create -- --name add-[module-name]-table
```

## 常见集成点

### 使用系统中的认证

```javascript
const { protect } = require('../../auth/auth.middleware');

router.post('/action', protect, controller.action);
```

### 使用用户服务

```javascript
const userService = require('../../user/user.service');

const user = await userService.getUserById(userId);
```

### 使用日志

```javascript
const { logger } = require('../../config/logger');

logger.info('业务信息');
logger.error('业务错误', error);
```

### 使用错误处理

```javascript
const { ApiError } = require('../../utils/ApiError');

throw new ApiError(400, '错误信息');
```

### 使用响应工具

```javascript
const { success, error } = require('../../utils/response');

success(res, data, 'message');
error(res, errorObj);
```

## 命名规范示例

| 类型 | 示例 |
|------|------|
| 模块名称 | `order-management` |
| 类名 | `OrderManagementService` |
| 文件名 | `order-management.service.js` |
| 表名 | `order_management_items` |
| API端点 | `/api/order-management` |
