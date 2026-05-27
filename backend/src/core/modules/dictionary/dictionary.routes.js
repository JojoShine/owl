const express = require('express');
const router = express.Router();
const dictionaryController = require('./dictionary.controller');
const { authenticate } = require('../../../middlewares/auth');
const { checkPermission } = require('../../../middlewares/permission');

/**
 * @route GET /api/dictionaries
 * @desc 获取多个字典类型
 * @access Private - 已认证用户
 */
router.get(
  '/',
  authenticate,
  checkPermission('dictionary', 'read'),
  dictionaryController.getDictionaries
);

/**
 * @route GET /api/dictionaries/:type
 * @desc 根据类型获取字典
 * @access Private - 已认证用户
 */
router.get(
  '/:type',
  authenticate,
  checkPermission('dictionary', 'read'),
  dictionaryController.getDictionaryByType
);

module.exports = router;