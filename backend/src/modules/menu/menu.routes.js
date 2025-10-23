const express = require('express');
const router = express.Router();
const menuController = require('./menu.controller');
const { authenticate } = require('../../middlewares/auth');
const { checkPermission } = require('../../middlewares/permission');
const validate = require('../../middlewares/validate');
const menuValidation = require('./menu.validation');

/**
 * @route GET /api/menus/tree
 * @desc 获取菜单树
 * @access Private - 需要menu:read权限
 */
router.get(
  '/tree',
  authenticate,
  checkPermission('menu', 'read'),
  menuController.getMenuTree
);

/**
 * @route GET /api/menus/user-tree
 * @desc 获取当前用户的菜单树
 * @access Private - 已认证用户
 */
router.get(
  '/user-tree',
  authenticate,
  menuController.getUserMenuTree
);

/**
 * @route GET /api/menus
 * @desc 获取菜单列表
 * @access Private - 需要menu:read权限
 */
router.get(
  '/',
  authenticate,
  checkPermission('menu', 'read'),
  validate(menuValidation.getMenus),
  menuController.getMenus
);

/**
 * @route GET /api/menus/:id
 * @desc 获取菜单详情
 * @access Private - 需要menu:read权限
 */
router.get(
  '/:id',
  authenticate,
  checkPermission('menu', 'read'),
  validate(menuValidation.getMenuById),
  menuController.getMenuById
);

/**
 * @route POST /api/menus
 * @desc 创建菜单
 * @access Private - 需要menu:create权限
 */
router.post(
  '/',
  authenticate,
  checkPermission('menu', 'create'),
  validate(menuValidation.createMenu),
  menuController.createMenu
);

/**
 * @route PUT /api/menus/:id
 * @desc 更新菜单
 * @access Private - 需要menu:update权限
 */
router.put(
  '/:id',
  authenticate,
  checkPermission('menu', 'update'),
  validate(menuValidation.updateMenu),
  menuController.updateMenu
);

/**
 * @route DELETE /api/menus/:id
 * @desc 删除菜单
 * @access Private - 需要menu:delete权限
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('menu', 'delete'),
  validate(menuValidation.deleteMenu),
  menuController.deleteMenu
);

module.exports = router;
