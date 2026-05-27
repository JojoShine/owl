const express = require('express');
const router = express.Router();
const filePermissionController = require('./file-permission.controller');
const { authenticate } = require('../../../middlewares/auth');
const { checkPermission } = require('../../../middlewares/permission');

/**
 * @route DELETE /api/file-permissions/:id
 * @desc 删除权限
 * @access Private - 已认证用户（需要资源admin权限）
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('file', 'delete'),
  filePermissionController.deletePermission
);

module.exports = router;
