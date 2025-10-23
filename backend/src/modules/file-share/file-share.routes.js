const express = require('express');
const router = express.Router();
const fileShareController = require('./file-share.controller');
const { authenticate } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const Joi = require('joi');

// 验证规则
const createShareSchema = {
  body: Joi.object({
    file_id: Joi.string().uuid().required(),
    expires_in_hours: Joi.number().integer().min(1).max(720).allow(null), // 最多30天
  }),
};

const getShareByCodeSchema = {
  params: Joi.object({
    shareCode: Joi.string().required(),
  }),
};

const deleteShareSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

/**
 * @route GET /api/file-shares/:shareCode/download
 * @desc 下载分享的文件
 * @access Public - 无需认证
 */
router.get(
  '/:shareCode/download',
  validate(getShareByCodeSchema),
  fileShareController.downloadSharedFile
);

/**
 * @route GET /api/file-shares/:shareCode
 * @desc 获取分享信息
 * @access Public - 无需认证
 */
router.get(
  '/:shareCode',
  validate(getShareByCodeSchema),
  fileShareController.getShareByCode
);

/**
 * @route GET /api/file-shares
 * @desc 获取用户的所有分享
 * @access Private - 已认证用户
 */
router.get(
  '/',
  authenticate,
  fileShareController.getUserShares
);

/**
 * @route POST /api/file-shares
 * @desc 创建文件分享
 * @access Private - 已认证用户
 */
router.post(
  '/',
  authenticate,
  validate(createShareSchema),
  fileShareController.createShare
);

/**
 * @route DELETE /api/file-shares/:id
 * @desc 删除分享
 * @access Private - 已认证用户
 */
router.delete(
  '/:id',
  authenticate,
  validate(deleteShareSchema),
  fileShareController.deleteShare
);

module.exports = router;
