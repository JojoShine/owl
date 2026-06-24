const { downloadFile } = require('../../../config/minio');
const ApiError = require('../../../utils/ApiError');
const { logger } = require('../../../config/logger');

class FileStreamService {
  /**
   * 从 Minio 读取文件流
   * @param {string} path - 完整的 Minio 路径（包含桶名），格式: bucket/path/to/file
   * @returns {object} - { stream, mimeType, filename, size }
   */
  async getFileStream(path) {
    if (!path) {
      throw ApiError.badRequest('文件路径不能为空');
    }

    // 解析路径：移除桶名，只保留对象路径
    let objectPath = path;
    const pathParts = path.split('/');

    // 如果第一部分是桶名，则移除它
    if (pathParts[0] === 'owl-platform' || pathParts[0] === process.env.MINIO_BUCKET_NAME) {
      objectPath = pathParts.slice(1).join('/');
    }

    try {
      // 从 Minio 下载文件
      const stream = await downloadFile(objectPath);

      logger.info(`File stream retrieved from Minio: ${objectPath}`);

      return {
        stream,
        objectPath,
      };
    } catch (error) {
      logger.error(`Error retrieving file stream from Minio: ${objectPath}`, error);
      throw ApiError.notFound('文件不存在');
    }
  }
}

module.exports = new FileStreamService();
