const express = require('express');
const router = express.Router();
const controller = require('./system-config.controller');
const { authenticate } = require('../../../middlewares/auth');
const { isAdmin } = require('../../../middlewares/permission');
const { uploadSingle } = require('../../../middlewares/upload');

// 获取配置（公开接口）
router.get('/', controller.getConfig);

// 更新配置（需要认证）
router.put('/',
  authenticate,
  isAdmin,
  controller.updateConfig
);

// 上传 Logo（需要认证，使用文件管理模块）
router.post('/logo',
  authenticate,
  isAdmin,
  uploadSingle('file'),
  controller.uploadLogo
);

// 上传登录背景（需要认证，使用文件管理模块）
router.post('/login-bg',
  authenticate,
  isAdmin,
  uploadSingle('file'),
  controller.uploadLoginBg
);

module.exports = router;
