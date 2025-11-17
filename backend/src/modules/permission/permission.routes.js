const express = require('express');
const router = express.Router();
const permissionController = require('./permission.controller');
const { authenticate } = require('../../middlewares/auth');
const { checkPermission, isSuperAdmin } = require('../../middlewares/permission');
const validate = require('../../middlewares/validate');
const permissionValidation = require('./permission.validation');

/**
 * @route GET /api/permissions/all
 * @desc 获取所有权限（分组）
 * @access Private - 需要permission:read权限
 */
router.get(
  '/all',
  authenticate,
  checkPermission('permission', 'read'),
  permissionController.getAllPermissions
);

/**
 * @route GET /api/permissions/resources
 * @desc 获取资源列表
 * @access Private - 需要permission:read权限
 */
router.get(
  '/resources',
  authenticate,
  checkPermission('permission', 'read'),
  permissionController.getResources
);

/**
 * @route GET /api/permissions/actions
 * @desc 获取操作类型列表
 * @access Private - 需要permission:read权限
 */
router.get(
  '/actions',
  authenticate,
  checkPermission('permission', 'read'),
  permissionController.getActions
);

/**
 * @route GET /api/permissions/categories
 * @desc 获取分类列表
 * @access Private - 需要permission:read权限
 */
router.get(
  '/categories',
  authenticate,
  checkPermission('permission', 'read'),
  permissionController.getCategories
);

/**
 * @route GET /api/permissions
 * @desc 获取权限列表
 * @access Private - 需要permission:read权限
 */
router.get(
  '/',
  authenticate,
  checkPermission('permission', 'read'),
  validate(permissionValidation.getPermissions),
  permissionController.getPermissions
);

/**
 * @route GET /api/permissions/:id
 * @desc 获取权限详情
 * @access Private - 需要permission:read权限
 */
router.get(
  '/:id',
  authenticate,
  checkPermission('permission', 'read'),
  validate(permissionValidation.getPermissionById),
  permissionController.getPermissionById
);

/**
 * @route POST /api/permissions
 * @desc 创建权限
 * @access Private - 仅超级管理员
 */
router.post(
  '/',
  authenticate,
  isSuperAdmin,
  validate(permissionValidation.createPermission),
  permissionController.createPermission
);

/**
 * @route PUT /api/permissions/:id
 * @desc 更新权限
 * @access Private - 仅超级管理员
 */
router.put(
  '/:id',
  authenticate,
  isSuperAdmin,
  validate(permissionValidation.updatePermission),
  permissionController.updatePermission
);

/**
 * @route DELETE /api/permissions/:id
 * @desc 删除权限
 * @access Private - 仅超级管理员
 */
router.delete(
  '/:id',
  authenticate,
  isSuperAdmin,
  validate(permissionValidation.deletePermission),
  permissionController.deletePermission
);

module.exports = router;