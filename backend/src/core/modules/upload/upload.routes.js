const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');
const uploadStreamController = require('./upload-stream.controller');
const { authenticate } = require('../../../middlewares/auth');
const { uploadSingle } = require('../../../middlewares/upload');
const validate = require('../../../middlewares/validate');
const uploadValidation = require('./upload.validation');

/**
 * @route POST /api/system/upload/file
 * @desc 上传文件到 Minio（不保存到数据库）
 * @access Private - 已认证用户
 */
router.post(
  '/file',
  authenticate,
  uploadSingle('file'),
  validate(uploadValidation.uploadFile),
  uploadController.uploadFile
);

/**
 * @route GET /api/system/upload/stream?path={minioPath}
 * @desc 获取文件流（支持在 img src 中直接使用）
 * @access Public - 无需认证（用于公开显示的文件如 logo、background）
 */
router.get(
  '/stream',
  uploadStreamController.getFileStream
);

module.exports = router;
