const express = require('express');
const router = express.Router();
const keysController = require('./api-builder-keys.controller');
const { authenticate } = require('../../../middlewares/auth');
const { checkPermission } = require('../../../middlewares/permission');

/**
 * API密钥管理路由
 * 所有路由都需要用户登录和相应权限
 */

// 获取当前用户的所有API密钥
router.get(
  '/keys',
  authenticate,
  checkPermission('api-key', 'read'),
  (req, res) => keysController.getAllKeys(req, res)
);

// 创建新的API密钥
router.post(
  '/keys',
  authenticate,
  checkPermission('api-key', 'create'),
  (req, res) => keysController.createKey(req, res)
);

// 更新API密钥信息
router.put(
  '/keys/:id',
  authenticate,
  checkPermission('api-key', 'update'),
  (req, res) => keysController.updateKey(req, res)
);

// 删除API密钥
router.delete(
  '/keys/:id',
  authenticate,
  checkPermission('api-key', 'delete'),
  (req, res) => keysController.deleteKey(req, res)
);

module.exports = router;
