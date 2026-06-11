const express = require('express');
const router = express.Router();
const controller = require('./example.controller');
const validation = require('./example.validation');
const validate = require('../../../middlewares/validate');
const { authenticate } = require('../../../middlewares/auth');
const { checkPermission } = require('../../../middlewares/permission');

// 所有路由需要登录
router.use(authenticate);

/**
 * GET /api/biz/example
 * 获取列表
 */
router.get(
  '/',
  checkPermission('example:read'),
  validate(validation.getList),
  controller.getList
);

/**
 * GET /api/biz/example/:id
 * 获取详情
 */
router.get(
  '/:id',
  checkPermission('example:read'),
  validate(validation.idParam),
  controller.getDetail
);

/**
 * POST /api/biz/example
 * 创建
 */
router.post(
  '/',
  checkPermission('example:create'),
  validate(validation.create),
  controller.create
);

/**
 * PUT /api/biz/example/:id
 * 更新
 */
router.put(
  '/:id',
  checkPermission('example:update'),
  validate(validation.update),
  controller.update
);

/**
 * DELETE /api/biz/example/:id
 * 删除
 */
router.delete(
  '/:id',
  checkPermission('example:delete'),
  validate(validation.idParam),
  controller.delete
);

module.exports = router;
