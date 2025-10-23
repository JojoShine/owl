const express = require('express');
const router = express.Router();
const roleController = require('./role.controller');
const { authenticate } = require('../../middlewares/auth');
const { checkPermission } = require('../../middlewares/permission');
const validate = require('../../middlewares/validate');
const roleValidation = require('./role.validation');

/**
 * @route GET /api/roles/all
 * @desc 获取所有角色（不分页）
 * @access Private - 需要role:read权限
 */
router.get(
  '/all',
  authenticate,
  checkPermission('role', 'read'),
  roleController.getAllRoles
);

/**
 * @route GET /api/roles
 * @desc 获取角色列表
 * @access Private - 需要role:read权限
 */
router.get(
  '/',
  authenticate,
  checkPermission('role', 'read'),
  validate(roleValidation.getRoles),
  roleController.getRoles
);

/**
 * @route GET /api/roles/:id
 * @desc 获取角色详情
 * @access Private - 需要role:read权限
 */
router.get(
  '/:id',
  authenticate,
  checkPermission('role', 'read'),
  validate(roleValidation.getRoleById),
  roleController.getRoleById
);

/**
 * @route POST /api/roles
 * @desc 创建角色
 * @access Private - 需要role:create权限
 */
router.post(
  '/',
  authenticate,
  checkPermission('role', 'create'),
  validate(roleValidation.createRole),
  roleController.createRole
);

/**
 * @route PUT /api/roles/:id
 * @desc 更新角色
 * @access Private - 需要role:update权限
 */
router.put(
  '/:id',
  authenticate,
  checkPermission('role', 'update'),
  validate(roleValidation.updateRole),
  roleController.updateRole
);

/**
 * @route DELETE /api/roles/:id
 * @desc 删除角色
 * @access Private - 需要role:delete权限
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('role', 'delete'),
  validate(roleValidation.deleteRole),
  roleController.deleteRole
);

module.exports = router;