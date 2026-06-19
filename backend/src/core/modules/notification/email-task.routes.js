const express = require('express');
const router = express.Router();
const controller = require('./email-task.controller');
const validation = require('./email-task.validation');
const validate = require('../../../middlewares/validate');
const { authenticate } = require('../../../middlewares/auth');
const { checkPermission } = require('../../../middlewares/permission');

// 所有路由都需要认证
router.use(authenticate);

/**
 * GET /api/system/email-tasks
 * 获取邮件任务列表
 */
router.get(
  '/',
  checkPermission('email-task:read'),
  validate(validation.listTasks),
  controller.getTasks
);

/**
 * GET /api/system/email-tasks/:id
 * 获取邮件任务详情
 */
router.get(
  '/:id',
  checkPermission('email-task:read'),
  controller.getTaskById
);

/**
 * POST /api/system/email-tasks
 * 创建邮件任务
 */
router.post(
  '/',
  checkPermission('email-task:create'),
  validate(validation.createTask),
  controller.createTask
);

/**
 * PUT /api/system/email-tasks/:id
 * 更新邮件任务
 */
router.put(
  '/:id',
  checkPermission('email-task:update'),
  validate(validation.updateTask),
  controller.updateTask
);

/**
 * DELETE /api/system/email-tasks/:id
 * 删除邮件任务
 */
router.delete(
  '/:id',
  checkPermission('email-task:delete'),
  controller.deleteTask
);

/**
 * PATCH /api/system/email-tasks/:id/enable
 * 启用邮件任务
 */
router.patch(
  '/:id/enable',
  checkPermission('email-task:update'),
  controller.enableTask
);

/**
 * PATCH /api/system/email-tasks/:id/disable
 * 禁用邮件任务
 */
router.patch(
  '/:id/disable',
  checkPermission('email-task:update'),
  controller.disableTask
);

/**
 * POST /api/system/email-tasks/:id/execute
 * 手动执行邮件任务
 */
router.post(
  '/:id/execute',
  checkPermission('email-task:update'),
  controller.manualExecuteTask
);

module.exports = router;
