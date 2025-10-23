const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');
const moduleConfigService = require('../modules/generator/module-config.service');
const genericController = require('../modules/generator/generic.controller');

/**
 * 配置驱动的动态路由
 * 无需生成代码文件，实现零重启
 *
 * 架构：
 * 1. 从数据库加载模块配置
 * 2. 注入配置到 req.moduleConfig
 * 3. 转发到通用控制器处理
 */

/**
 * 中间件：加载模块配置
 */
async function loadModuleConfig(req, res, next) {
  try {
    const modulePath = req.params.modulePath;

    // 从数据库加载模块配置
    const moduleConfig = await moduleConfigService.getModuleConfigByPath(modulePath);

    // 注入配置到 req 对象
    req.moduleConfig = moduleConfig;

    // 设置权限前缀（用于权限检查）
    req.permissionPrefix = moduleConfig.permission_prefix || modulePath;

    logger.debug(`Module config loaded for: ${modulePath}`);

    next();
  } catch (error) {
    // 如果找不到配置，传递给下一个中间件（会触发404）
    if (error.statusCode === 404) {
      return next();
    }

    // 其他错误直接传递
    next(error);
  }
}

/**
 * 动态模块路由
 *
 * 路由模式：
 * GET    /api/:modulePath          - 列表查询
 * GET    /api/:modulePath/export   - 导出数据
 * GET    /api/:modulePath/:id      - 详情查询
 * POST   /api/:modulePath          - 创建记录
 * PUT    /api/:modulePath/:id      - 更新记录
 * DELETE /api/:modulePath/:id      - 删除记录
 * DELETE /api/:modulePath/batch    - 批量删除
 */

// 所有动态路由都需要认证
router.use('/:modulePath', authenticate);

// 加载模块配置中间件
router.use('/:modulePath', loadModuleConfig);

/**
 * 导出数据（需要放在 /:id 之前，避免 export 被当作 id）
 */
router.get(
  '/:modulePath/export',
  (req, res, next) => checkPermission(`${req.permissionPrefix}:read`)(req, res, next),
  genericController.export.bind(genericController)
);

/**
 * 批量删除（需要放在 /:id 之前，避免 batch 被当作 id）
 */
router.delete(
  '/:modulePath/batch',
  (req, res, next) => checkPermission(`${req.permissionPrefix}:delete`)(req, res, next),
  genericController.batchDelete.bind(genericController)
);

/**
 * 列表查询
 */
router.get(
  '/:modulePath',
  (req, res, next) => checkPermission(`${req.permissionPrefix}:read`)(req, res, next),
  genericController.list.bind(genericController)
);

/**
 * 详情查询
 */
router.get(
  '/:modulePath/:id',
  (req, res, next) => checkPermission(`${req.permissionPrefix}:read`)(req, res, next),
  genericController.getById.bind(genericController)
);

/**
 * 创建记录
 */
router.post(
  '/:modulePath',
  (req, res, next) => checkPermission(`${req.permissionPrefix}:create`)(req, res, next),
  genericController.create.bind(genericController)
);

/**
 * 更新记录
 */
router.put(
  '/:modulePath/:id',
  (req, res, next) => checkPermission(`${req.permissionPrefix}:update`)(req, res, next),
  genericController.update.bind(genericController)
);

/**
 * 删除记录
 */
router.delete(
  '/:modulePath/:id',
  (req, res, next) => checkPermission(`${req.permissionPrefix}:delete`)(req, res, next),
  genericController.delete.bind(genericController)
);

logger.info('Dynamic routes initialized (config-driven, zero-restart)');

module.exports = router;
