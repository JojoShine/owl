const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../../../utils/ApiError');
const { logger } = require('../../../config/logger');
const { uploadFile, BUCKET_NAME } = require('../../../config/minio');

class UploadService {
  /**
   * 上传文件到 Minio（不保存到数据库）
   * @param {Buffer} buffer - 文件内容
   * @param {string} originalname - 原始文件名
   * @param {string} mimetype - MIME 类型
   * @param {string} category - 分类：logo, background, normal
   * @param {string} userId - 用户ID（normal 类型必需）
   * @returns {string} - 完整的 Minio 路径（包含桶名）
   */
  async uploadFile(buffer, originalname, mimetype, category, userId) {
    // 验证分类
    const validCategories = ['logo', 'background', 'normal'];
    if (!validCategories.includes(category)) {
      throw ApiError.badRequest(`无效的文件分类，支持: ${validCategories.join(', ')}`);
    }

    // normal 类型需要 userId
    if (category === 'normal' && !userId) {
      throw ApiError.badRequest('normal 类型上传需要提供用户ID');
    }

    // 生成唯一文件名
    const ext = path.extname(originalname);
    const filename = `${uuidv4()}${ext}`;

    // 根据分类生成文件路径
    let filePath;
    if (category === 'logo') {
      filePath = `logos/${filename}`;
    } else if (category === 'background') {
      filePath = `backgrounds/${filename}`;
    } else if (category === 'normal') {
      // 按日期分类
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      filePath = `users/${userId}/${year}/${month}/${day}/${filename}`;
    }

    try {
      // 上传到 Minio
      await uploadFile(filePath, buffer, mimetype);

      // 返回完整路径（包含桶名）
      const fullPath = `${BUCKET_NAME}/${filePath}`;

      logger.info(`File uploaded to Minio: ${fullPath} (category: ${category})`);

      return fullPath;
    } catch (error) {
      logger.error('Error uploading file to Minio:', error);
      throw ApiError.internal('文件上传失败');
    }
  }
}

module.exports = new UploadService();
