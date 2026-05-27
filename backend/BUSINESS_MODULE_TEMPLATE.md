# 业务模块开发模板

## 目录结构

每个业务模块应包含以下文件：

```
business/modules/[module-name]/
├── [module-name].controller.js     # 控制器
├── [module-name].service.js        # 服务层
├── [module-name].routes.js         # 路由
├── [module-name].validation.js     # 验证器
└── [module-name].model.js          # 模型（可选）
```

## 文件模板

### 1. Controller 模板

```javascript
/**
 * @module business/[module-name]
 * @category Business
 * @description [模块描述]
 */

const service = require('./[module-name].service');
const { success, created, paginated } = require('../../../utils/response');
const { logger } = require('../../../config/logger');

class [ModuleName]Controller {
  /**
   * 获取列表
   */
  async getList(req, res, next) {
    try {
      const result = await service.getList(req.query);
      paginated(res, result.items, result.pagination, '获取列表成功');
    } catch (error) {
      logger.error('Error getting list:', error);
      next(error);
    }
  }

  /**
   * 获取详情
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await service.getById(id);
      success(res, data, '获取详情成功');
    } catch (error) {
      logger.error('Error getting detail:', error);
      next(error);
    }
  }

  /**
   * 创建
   */
  async create(req, res, next) {
    try {
      const data = await service.create(req.body, req.user.id);
      created(res, data, '创建成功');
    } catch (error) {
      logger.error('Error creating:', error);
      next(error);
    }
  }

  /**
   * 更新
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = await service.update(id, req.body);
      success(res, data, '更新成功');
    } catch (error) {
      logger.error('Error updating:', error);
      next(error);
    }
  }

  /**
   * 删除
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await service.delete(id);
      success(res, null, '删除成功');
    } catch (error) {
      logger.error('Error deleting:', error);
      next(error);
    }
  }
}

module.exports = new [ModuleName]Controller();
```

### 2. Service 模板

```javascript
/**
 * @module business/[module-name]
 * @category Business
 * @description [模块描述] - 服务层
 */

const db = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { logger } = require('../../../config/logger');

class [ModuleName]Service {
  /**
   * 获取列表
   */
  async getList(query) {
    const { page = 1, pageSize = 10, keyword, status } = query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where.name = { [db.Sequelize.Op.like]: `%${keyword}%` };
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await db.[ModelName].findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      items: rows.map(r => r.get({ plain: true })),
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      }
    };
  }

  /**
   * 根据ID获取
   */
  async getById(id) {
    const data = await db.[ModelName].findByPk(id);
    if (!data) {
      throw ApiError.notFound('数据不存在');
    }
    return data.get({ plain: true });
  }

  /**
   * 创建
   */
  async create(data, userId) {
    // 业务逻辑验证
    // ...

    const result = await db.[ModelName].create({
      ...data,
      created_by: userId,
    });

    return result.get({ plain: true });
  }

  /**
   * 更新
   */
  async update(id, data) {
    const record = await db.[ModelName].findByPk(id);
    if (!record) {
      throw ApiError.notFound('数据不存在');
    }

    await record.update(data);
    return record.get({ plain: true });
  }

  /**
   * 删除
   */
  async delete(id) {
    const record = await db.[ModelName].findByPk(id);
    if (!record) {
      throw ApiError.notFound('数据不存在');
    }

    await record.destroy();
    return { message: '删除成功' };
  }
}

module.exports = new [ModuleName]Service();
```

### 3. Routes 模板

```javascript
/**
 * @module business/[module-name]
 * @category Business
 * @description [模块描述] - 路由
 */

const express = require('express');
const router = express.Router();
const controller = require('./[module-name].controller');
const { authenticate } = require('../../../middlewares/auth');
const { checkPermission } = require('../../../middlewares/permission');
const {
  createRules,
  updateRules,
  handleValidationErrors,
} = require('./[module-name].validation');

// 获取列表
router.get('/',
  authenticate,
  checkPermission('[module-name]:read'),
  controller.getList
);

// 获取详情
router.get('/:id',
  authenticate,
  checkPermission('[module-name]:read'),
  controller.getById
);

// 创建
router.post('/',
  authenticate,
  checkPermission('[module-name]:create'),
  createRules(),
  handleValidationErrors,
  controller.create
);

// 更新
router.put('/:id',
  authenticate,
  checkPermission('[module-name]:update'),
  updateRules(),
  handleValidationErrors,
  controller.update
);

// 删除
router.delete('/:id',
  authenticate,
  checkPermission('[module-name]:delete'),
  controller.delete
);

module.exports = router;
```

### 4. Validation 模板

```javascript
/**
 * @module business/[module-name]
 * @category Business
 * @description [模块描述] - 验证器
 */

const { body, query, validationResult } = require('express-validator');
const ApiError = require('../../../utils/ApiError');

const createRules = () => [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('名称不能为空')
    .isLength({ max: 100 })
    .withMessage('名称最多100个字符'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述最多500个字符'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('状态只能是 active 或 inactive'),
];

const updateRules = () => [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('名称不能为空')
    .isLength({ max: 100 })
    .withMessage('名称最多100个字符'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('描述最多500个字符'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('状态只能是 active 或 inactive'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));
    throw ApiError.validationError('参数验证失败', errorDetails);
  }
  next();
};

module.exports = {
  createRules,
  updateRules,
  handleValidationErrors,
};
```

### 5. Model 模板（可选）

```javascript
/**
 * @module business/[module-name]
 * @category Business
 * @description [模块描述] - 数据模型
 */

module.exports = (sequelize, DataTypes) => {
  const [ModelName] = sequelize.define('[ModelName]', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'biz_[table_name]',  // 使用 biz_ 前缀
    timestamps: true,
    underscored: true,
  });

  // 关联关系
  [ModelName].associate = (models) => {
    // 示例：关联用户
    [ModelName].belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
  };

  return [ModelName];
};
```

## 快速创建脚本

使用以下命令快速创建新模块：

```bash
# 创建模块目录
mkdir -p src/business/modules/[module-name]

# 复制模板文件
cp templates/controller.template.js src/business/modules/[module-name]/[module-name].controller.js
cp templates/service.template.js src/business/modules/[module-name]/[module-name].service.js
cp templates/routes.template.js src/business/modules/[module-name]/[module-name].routes.js
cp templates/validation.template.js src/business/modules/[module-name]/[module-name].validation.js

# 替换模板变量
# 使用 sed 或手动替换 [module-name] 和 [ModuleName]
```

## 注册路由

在 `routes/business.routes.js` 中注册新模块：

```javascript
const express = require('express');
const router = express.Router();

// 导入业务模块路由
const orderRoutes = require('../business/modules/order/order.routes');
const productRoutes = require('../business/modules/product/product.routes');
const [moduleName]Routes = require('../business/modules/[module-name]/[module-name].routes');

// 注册路由
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/[module-name]', [moduleName]Routes);

module.exports = router;
```

## 开发规范

1. **命名规范**
   - 文件名：小写，使用连字符（kebab-case）
   - 类名：大驼峰（PascalCase）
   - 变量/函数：小驼峰（camelCase）
   - 数据库表：`biz_` 前缀 + 下划线命名

2. **错误处理**
   - 使用 `ApiError` 类抛出错误
   - 所有异步函数使用 try-catch
   - 错误传递给 `next(error)`

3. **日志记录**
   - 使用 `logger` 记录关键操作
   - 错误日志包含完整堆栈信息

4. **权限控制**
   - 所有路由都需要认证（`authenticate`）
   - 根据操作类型检查权限（`checkPermission`）

5. **数据验证**
   - 使用 express-validator 验证输入
   - 提供清晰的错误提示

6. **响应格式**
   - 使用统一的响应工具（`utils/response.js`）
   - 保持响应格式一致

## 测试

为每个模块编写测试：

```javascript
// tests/business/[module-name].test.js
describe('[ModuleName] Module', () => {
  describe('GET /api/[module-name]', () => {
    it('should return list', async () => {
      // 测试代码
    });
  });

  describe('POST /api/[module-name]', () => {
    it('should create new record', async () => {
      // 测试代码
    });
  });
});
```
