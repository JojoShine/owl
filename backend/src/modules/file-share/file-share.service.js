const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');
const { downloadFile } = require('../../config/minio');

class FileShareService {
  /**
   * 创建文件分享
   */
  async createShare(shareData, userId) {
    const { file_id, expires_in_hours } = shareData;

    // 检查文件是否存在且属于当前用户
    const file = await db.File.findOne({
      where: {
        id: file_id,
        uploaded_by: userId,
      },
    });

    if (!file) {
      throw ApiError.notFound('文件不存在');
    }

    // 生成分享码
    const shareCode = db.FileShare.generateShareCode();

    // 计算过期时间
    let expiresAt = null;
    if (expires_in_hours) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expires_in_hours);
    }

    // 创建分享记录
    const share = await db.FileShare.create({
      file_id,
      share_code: shareCode,
      expires_at: expiresAt,
      created_by: userId,
    });

    logger.info(`File share created: ${shareCode} for file ${file.original_name} by user ${userId}`);

    return this.getShareById(share.id, userId);
  }

  /**
   * 获取分享详情（通过分享码）
   */
  async getShareByCode(shareCode) {
    const share = await db.FileShare.findOne({
      where: { share_code: shareCode },
      include: [
        {
          model: db.File,
          as: 'file',
          attributes: ['id', 'original_name', 'mime_type', 'size', 'path'],
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'real_name'],
        },
      ],
    });

    if (!share) {
      throw ApiError.notFound('分享不存在');
    }

    // 检查是否过期
    if (share.isExpired()) {
      throw ApiError.badRequest('分享已过期');
    }

    return share;
  }

  /**
   * 获取分享详情（通过ID）
   */
  async getShareById(id, userId) {
    const share = await db.FileShare.findOne({
      where: {
        id,
        created_by: userId,
      },
      include: [
        {
          model: db.File,
          as: 'file',
        },
      ],
    });

    if (!share) {
      throw ApiError.notFound('分享不存在');
    }

    return share;
  }

  /**
   * 获取用户的所有分享
   */
  async getUserShares(userId) {
    const shares = await db.FileShare.findAll({
      where: { created_by: userId },
      include: [
        {
          model: db.File,
          as: 'file',
          attributes: ['id', 'original_name', 'mime_type', 'size'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return shares;
  }

  /**
   * 下载分享的文件
   */
  async downloadSharedFile(shareCode) {
    const share = await this.getShareByCode(shareCode);

    try {
      // 从 Minio 获取文件流
      const stream = await downloadFile(share.file.path);

      return {
        stream,
        filename: share.file.original_name,
        mimeType: share.file.mime_type,
        size: share.file.size,
      };
    } catch (error) {
      logger.error('Error downloading shared file from Minio:', error);
      throw ApiError.internal('文件下载失败');
    }
  }

  /**
   * 删除分享
   */
  async deleteShare(id, userId) {
    const share = await db.FileShare.findOne({
      where: {
        id,
        created_by: userId,
      },
    });

    if (!share) {
      throw ApiError.notFound('分享不存在');
    }

    await share.destroy();

    logger.info(`File share deleted: ${share.share_code} by user ${userId}`);

    return { message: '分享删除成功' };
  }
}

module.exports = new FileShareService();
