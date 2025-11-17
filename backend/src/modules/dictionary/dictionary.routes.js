const express = require('express');
const router = express.Router();
const dictionaryController = require('./dictionary.controller');
const { authenticate } = require('../../middlewares/auth');

/**
 * @route GET /api/dictionaries
 * @desc 获取多个字典类型
 * @access Private - 已认证用户
 */
router.get(
  '/',
  authenticate,
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
  dictionaryController.getDictionaryByType
);

module.exports = router;