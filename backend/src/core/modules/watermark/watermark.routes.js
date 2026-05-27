const express = require('express');
const router = express.Router();
const watermarkController = require('./watermark.controller');
const { authenticate } = require('../../../middlewares/auth');
const { checkPermission } = require('../../../middlewares/permission');
const validate = require('../../../middlewares/validate');
const watermarkValidation = require('./watermark.validation');

/**
 * @route GET /api/watermark
 * @desc 获取水印配置（原始配置）
 * @access Private（所有用户）
 */
router.get(
  '/',
  authenticate,
  validate(watermarkValidation.getWatermark),
  (req, res) => watermarkController.getWatermark(req, res)
);

/**
 * @route GET /api/watermark/rendered
 * @desc 获取渲染后的水印（替换用户变量）
 * @access Private（所有用户）
 */
router.get(
  '/rendered',
  authenticate,
  validate(watermarkValidation.getRenderedWatermark),
  (req, res) => watermarkController.getRenderedWatermark(req, res)
);

/**
 * @route PUT /api/watermark
 * @desc 更新水印配置
 * @access Private（仅管理员：super_admin、admin）
 */
router.put(
  '/',
  authenticate,
  checkPermission('watermark', 'update'),
  validate(watermarkValidation.updateWatermark),
  (req, res) => watermarkController.updateWatermark(req, res)
);

module.exports = router;