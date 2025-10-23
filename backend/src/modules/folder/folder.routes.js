const express = require('express');
const router = express.Router();
const folderController = require('./folder.controller');
const { authenticate } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const folderValidation = require('./folder.validation');

/**
 * @route GET /api/folders/tree
 * @desc 获取文件夹树
 * @access Private - 已认证用户
 */
router.get(
  '/tree',
  authenticate,
  folderController.getFolderTree
);

/**
 * @route GET /api/folders/:id/contents
 * @desc 获取文件夹内容（子文件夹 + 文件）
 * @access Private - 已认证用户
 */
router.get(
  '/:id/contents',
  authenticate,
  validate(folderValidation.getFolderContents),
  folderController.getFolderContents
);

/**
 * @route GET /api/folders/:id
 * @desc 获取文件夹详情
 * @access Private - 已认证用户
 */
router.get(
  '/:id',
  authenticate,
  validate(folderValidation.getFolderById),
  folderController.getFolderById
);

/**
 * @route GET /api/folders
 * @desc 获取文件夹列表
 * @access Private - 已认证用户
 */
router.get(
  '/',
  authenticate,
  validate(folderValidation.getFolders),
  folderController.getFolders
);

/**
 * @route POST /api/folders
 * @desc 创建文件夹
 * @access Private - 已认证用户
 */
router.post(
  '/',
  authenticate,
  validate(folderValidation.createFolder),
  folderController.createFolder
);

/**
 * @route PUT /api/folders/:id
 * @desc 更新文件夹
 * @access Private - 已认证用户
 */
router.put(
  '/:id',
  authenticate,
  validate(folderValidation.updateFolder),
  folderController.updateFolder
);

/**
 * @route DELETE /api/folders/:id
 * @desc 删除文件夹
 * @access Private - 已认证用户
 */
router.delete(
  '/:id',
  authenticate,
  validate(folderValidation.deleteFolder),
  folderController.deleteFolder
);

module.exports = router;
