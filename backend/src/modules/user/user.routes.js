const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate } = require('../../middlewares/auth');
const { checkPermission } = require('../../middlewares/permission');
const validate = require('../../middlewares/validate');
const userValidation = require('./user.validation');

/**
 * @route GET /api/users
 * @desc 获取用户列表
 * @access Private - 需要user:read权限
 */
router.get(
  '/',
  authenticate,
  checkPermission('user', 'read'),
  validate(userValidation.getUsers),
  userController.getUsers
);

/**
 * @route GET /api/users/:id
 * @desc 获取用户详情
 * @access Private - 需要user:read权限
 */
router.get(
  '/:id',
  authenticate,
  checkPermission('user', 'read'),
  validate(userValidation.getUserById),
  userController.getUserById
);

/**
 * @route POST /api/users
 * @desc 创建用户
 * @access Private - 需要user:create权限
 */
router.post(
  '/',
  authenticate,
  checkPermission('user', 'create'),
  validate(userValidation.createUser),
  userController.createUser
);

/**
 * @route PUT /api/users/:id
 * @desc 更新用户
 * @access Private - 需要user:update权限
 */
router.put(
  '/:id',
  authenticate,
  checkPermission('user', 'update'),
  validate(userValidation.updateUser),
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc 删除用户
 * @access Private - 需要user:delete权限
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('user', 'delete'),
  validate(userValidation.deleteUser),
  userController.deleteUser
);

/**
 * @route POST /api/users/:id/reset-password
 * @desc 重置用户密码
 * @access Private - 需要user:update权限
 */
router.post(
  '/:id/reset-password',
  authenticate,
  checkPermission('user', 'update'),
  validate(userValidation.resetPassword),
  userController.resetPassword
);

module.exports = router;