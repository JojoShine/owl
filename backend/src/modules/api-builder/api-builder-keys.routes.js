const express = require('express');
const router = express.Router();
const keysController = require('./api-builder-keys.controller');
const { authenticate } = require('../../middlewares/auth');

/**
 * API密钥管理路由
 * 所有路由都需要用户登录
 */

// 获取当前用户的所有API密钥
router.get('/keys', authenticate, (req, res) =>
  keysController.getAllKeys(req, res)
);

// 创建新的API密钥
router.post('/keys', authenticate, (req, res) =>
  keysController.createKey(req, res)
);

// 更新API密钥信息
router.put('/keys/:id', authenticate, (req, res) =>
  keysController.updateKey(req, res)
);

// 删除API密钥
router.delete('/keys/:id', authenticate, (req, res) =>
  keysController.deleteKey(req, res)
);

module.exports = router;
