const express = require('express');
const router = express.Router();
const fileController = require('./file.controller');
const { authenticate } = require('../../middlewares/auth');
const { uploadSingle, uploadMultiple } = require('../../middlewares/upload');
const validate = require('../../middlewares/validate');
const fileValidation = require('./file.validation');

/**
 * @route GET /api/files/stats
 * @desc 获取存储统计
 * @access Private - 已认证用户
 */
router.get(
  '/stats',
  authenticate,
  fileController.getStats
);

/**
 * @route POST /api/files/upload
 * @desc 上传文件（支持单个或多个）
 * @access Private - 已认证用户
 */
router.post(
  '/upload',
  authenticate,
  uploadMultiple('files', 10), // 最多10个文件
  fileController.uploadFile
);

/**
 * @route POST /api/files/batch-delete
 * @desc 批量删除文件
 * @access Private - 已认证用户
 */
router.post(
  '/batch-delete',
  authenticate,
  validate(fileValidation.batchDeleteFiles),
  fileController.batchDeleteFiles
);

/**
 * @route POST /api/files/:id/copy
 * @desc 复制文件
 * @access Private - 已认证用户
 */
router.post(
  '/:id/copy',
  authenticate,
  validate(fileValidation.copyFile),
  fileController.copyFile
);

/**
 * @route GET /api/files/:id/download
 * @desc 下载文件
 * @access Private - 已认证用户
 */
router.get(
  '/:id/download',
  authenticate,
  validate(fileValidation.getFileById),
  fileController.downloadFile
);

/**
 * @route GET /api/files/:id/preview
 * @desc 预览文件
 * @access Private - 已认证用户
 */
router.get(
  '/:id/preview',
  authenticate,
  validate(fileValidation.getFileById),
  fileController.previewFile
);

/**
 * @route PUT /api/files/:id/move
 * @desc 移动文件
 * @access Private - 已认证用户
 */
router.put(
  '/:id/move',
  authenticate,
  validate(fileValidation.moveFile),
  fileController.moveFile
);

/**
 * @route PUT /api/files/:id
 * @desc 更新文件信息
 * @access Private - 已认证用户
 */
router.put(
  '/:id',
  authenticate,
  validate(fileValidation.updateFile),
  fileController.updateFile
);

/**
 * @route GET /api/files/:id
 * @desc 获取文件详情
 * @access Private - 已认证用户
 */
router.get(
  '/:id',
  authenticate,
  validate(fileValidation.getFileById),
  fileController.getFileById
);

/**
 * @route GET /api/files
 * @desc 获取文件列表
 * @access Private - 已认证用户
 */
router.get(
  '/',
  authenticate,
  validate(fileValidation.getFiles),
  fileController.getFiles
);

/**
 * @route DELETE /api/files/:id
 * @desc 删除文件
 * @access Private - 已认证用户
 */
router.delete(
  '/:id',
  authenticate,
  validate(fileValidation.deleteFile),
  fileController.deleteFile
);

module.exports = router;
