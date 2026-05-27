const express = require('express');
const router = express.Router();
const fileController = require('./file.controller');
const filePermissionController = require('./file-permission.controller');
const { authenticate } = require('../../../middlewares/auth');
const { checkPermission } = require('../../../middlewares/permission');
const { uploadSingle, uploadMultiple } = require('../../../middlewares/upload');
const validate = require('../../../middlewares/validate');
const fileValidation = require('./file.validation');

/**
 * @route GET /api/files/:id/preview-public
 * @desc 公开预览文件（不需要认证，用于登录/注册页面显示 Logo）
 * @access Public
 */
router.get(
  '/:id/preview-public',
  validate(fileValidation.getFileById),
  fileController.previewFilePublic
);

/**
 * @route GET /api/files/stats
 * @desc 获取存储统计
 * @access Private - 已认证用户
 */
router.get(
  '/stats',
  authenticate,
  checkPermission('file', 'read'),
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
  checkPermission('file', 'create'),
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
  checkPermission('file', 'delete'),
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
  checkPermission('file', 'create'),
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
  checkPermission('file', 'read'),
  validate(fileValidation.getFileById),
  fileController.downloadFile
);

/**
 * @route PUT /api/files/:id/move
 * @desc 移动文件
 * @access Private - 已认证用户
 */
router.put(
  '/:id/move',
  authenticate,
  checkPermission('file', 'update'),
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
  checkPermission('file', 'update'),
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
  checkPermission('file', 'read'),
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
  checkPermission('file', 'read'),
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
  checkPermission('file', 'delete'),
  validate(fileValidation.deleteFile),
  fileController.deleteFile
);

/**
 * @route GET /api/files/:id/permissions
 * @desc 获取文件权限列表
 * @access Private - 已认证用户
 */
router.get(
  '/:id/permissions',
  authenticate,
  checkPermission('file', 'read'),
  filePermissionController.getFilePermissions
);

/**
 * @route POST /api/files/:id/permissions
 * @desc 添加文件权限
 * @access Private - 已认证用户（需要文件admin权限）
 */
router.post(
  '/:id/permissions',
  authenticate,
  checkPermission('file', 'update'),
  filePermissionController.addFilePermission
);

/**
 * @route PUT /api/files/:id/inherit
 * @desc 设置文件权限继承
 * @access Private - 已认证用户（需要文件admin权限）
 */
router.put(
  '/:id/inherit',
  authenticate,
  checkPermission('file', 'update'),
  filePermissionController.setFileInherit
);

module.exports = router;
