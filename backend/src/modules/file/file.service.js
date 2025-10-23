const { Op } = require('sequelize');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');
const {
  uploadFile,
  downloadFile,
  deleteFile,
  copyFile,
  BUCKET_NAME
} = require('../../config/minio');
const {
  generateUniqueFilename,
  generateFilePath,
  getFileCategory,
} = require('../../utils/file');

class FileService {
  /**
   * 获取文件列表（分页）
   */
  async getFiles(query, userId) {
    const {
      page = 1,
      limit = 20,
      search,
      folder_id,
      mime_type,
      category,
      sort = 'created_at',
      order = 'DESC',
    } = query;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const where = {
      uploaded_by: userId, // 只能查看自己的文件
    };

    if (search) {
      where.original_name = { [Op.iLike]: `%${search}%` };
    }

    if (folder_id !== undefined) {
      where.folder_id = folder_id === 'null' ? null : folder_id;
    }

    if (mime_type) {
      where.mime_type = { [Op.iLike]: `%${mime_type}%` };
    }

    // 按文件类别过滤
    if (category) {
      const categoryMimeTypes = this.getCategoryMimeTypes(category);
      where.mime_type = { [Op.in]: categoryMimeTypes };
    }

    const { count, rows } = await db.File.findAndCountAll({
      where,
      include: [
        {
          model: db.Folder,
          as: 'folder',
          attributes: ['id', 'name'],
        },
        {
          model: db.User,
          as: 'uploader',
          attributes: ['id', 'username', 'real_name'],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [[sort, order.toUpperCase()]],
    });

    // 为每个文件添加格式化信息
    const files = rows.map(file => file.toSafeJSON());

    return {
      data: files,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * 获取单个文件详情
   */
  async getFileById(id, userId) {
    const file = await db.File.findOne({
      where: {
        id,
        uploaded_by: userId, // 只能查看自己的文件
      },
      include: [
        {
          model: db.Folder,
          as: 'folder',
          attributes: ['id', 'name'],
        },
        {
          model: db.User,
          as: 'uploader',
          attributes: ['id', 'username', 'real_name'],
        },
      ],
    });

    if (!file) {
      throw ApiError.notFound('文件不存在');
    }

    return file.toSafeJSON();
  }

  /**
   * 上传文件
   */
  async uploadFile(fileData, userId) {
    const { buffer, originalname, mimetype, size } = fileData;
    const { folder_id } = fileData.body || {};

    // 如果指定了文件夹，验证文件夹是否存在
    if (folder_id) {
      const folder = await db.Folder.findOne({
        where: {
          id: folder_id,
          created_by: userId,
        },
      });

      if (!folder) {
        throw ApiError.notFound('文件夹不存在');
      }
    }

    // 生成唯一文件名
    const filename = generateUniqueFilename(originalname);

    // 生成文件路径
    const path = generateFilePath(userId, filename);

    try {
      // 上传到 Minio
      await uploadFile(path, buffer, mimetype);

      // 保存文件信息到数据库
      const file = await db.File.create({
        filename,
        original_name: originalname,
        mime_type: mimetype,
        size,
        path,
        bucket: BUCKET_NAME,
        folder_id: folder_id || null,
        uploaded_by: userId,
      });

      logger.info(`File uploaded: ${originalname} by user ${userId}`);

      return this.getFileById(file.id, userId);
    } catch (error) {
      logger.error('Error uploading file to Minio:', error);
      throw ApiError.internal('文件上传失败');
    }
  }

  /**
   * 批量上传文件
   */
  async uploadMultipleFiles(files, body, userId) {
    const { folder_id } = body;

    // 如果指定了文件夹，验证文件夹是否存在
    if (folder_id) {
      const folder = await db.Folder.findOne({
        where: {
          id: folder_id,
          created_by: userId,
        },
      });

      if (!folder) {
        throw ApiError.notFound('文件夹不存在');
      }
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        const uploadedFile = await this.uploadFile(
          { ...file, body: { folder_id } },
          userId
        );
        uploadedFiles.push(uploadedFile);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    return {
      uploaded: uploadedFiles,
      errors,
      total: files.length,
      success: uploadedFiles.length,
      failed: errors.length,
    };
  }

  /**
   * 下载文件
   */
  async downloadFile(id, userId) {
    const file = await db.File.findOne({
      where: {
        id,
        uploaded_by: userId,
      },
    });

    if (!file) {
      throw ApiError.notFound('文件不存在');
    }

    try {
      // 从 Minio 获取文件流
      const stream = await downloadFile(file.path);

      return {
        stream,
        filename: file.original_name,
        mimeType: file.mime_type,
        size: file.size,
      };
    } catch (error) {
      logger.error('Error downloading file from Minio:', error);
      throw ApiError.internal('文件下载失败');
    }
  }

  /**
   * 更新文件信息（重命名）
   */
  async updateFile(id, updateData, userId) {
    const file = await db.File.findOne({
      where: {
        id,
        uploaded_by: userId,
      },
    });

    if (!file) {
      throw ApiError.notFound('文件不存在');
    }

    const { original_name } = updateData;

    // 更新文件信息
    await file.update({
      original_name: original_name || file.original_name,
    });

    logger.info(`File updated: ${file.original_name} by user ${userId}`);

    return this.getFileById(id, userId);
  }

  /**
   * 删除文件
   */
  async deleteFile(id, userId) {
    const file = await db.File.findOne({
      where: {
        id,
        uploaded_by: userId,
      },
    });

    if (!file) {
      throw ApiError.notFound('文件不存在');
    }

    try {
      // 从 Minio 删除文件
      await deleteFile(file.path);

      // 删除文件分享记录
      await db.FileShare.destroy({ where: { file_id: id } });

      // 从数据库删除文件记录
      await file.destroy();

      logger.info(`File deleted: ${file.original_name} by user ${userId}`);

      return { message: '文件删除成功' };
    } catch (error) {
      logger.error('Error deleting file from Minio:', error);
      throw ApiError.internal('文件删除失败');
    }
  }

  /**
   * 批量删除文件
   */
  async batchDeleteFiles(ids, userId) {
    const files = await db.File.findAll({
      where: {
        id: { [Op.in]: ids },
        uploaded_by: userId,
      },
    });

    if (files.length === 0) {
      throw ApiError.notFound('未找到可删除的文件');
    }

    const deleted = [];
    const errors = [];

    for (const file of files) {
      try {
        await deleteFile(file.path);
        await db.FileShare.destroy({ where: { file_id: file.id } });
        await file.destroy();
        deleted.push(file.id);
        logger.info(`File deleted: ${file.original_name} by user ${userId}`);
      } catch (error) {
        errors.push({
          id: file.id,
          filename: file.original_name,
          error: error.message,
        });
      }
    }

    return {
      deleted,
      errors,
      total: ids.length,
      success: deleted.length,
      failed: errors.length,
    };
  }

  /**
   * 移动文件到其他文件夹
   */
  async moveFile(id, folderId, userId) {
    const file = await db.File.findOne({
      where: {
        id,
        uploaded_by: userId,
      },
    });

    if (!file) {
      throw ApiError.notFound('文件不存在');
    }

    // 如果指定了文件夹，验证文件夹是否存在
    if (folderId && folderId !== 'null') {
      const folder = await db.Folder.findOne({
        where: {
          id: folderId,
          created_by: userId,
        },
      });

      if (!folder) {
        throw ApiError.notFound('目标文件夹不存在');
      }
    }

    // 更新文件的文件夹
    await file.update({
      folder_id: folderId === 'null' ? null : folderId,
    });

    logger.info(`File moved: ${file.original_name} to folder ${folderId} by user ${userId}`);

    return this.getFileById(id, userId);
  }

  /**
   * 复制文件
   */
  async copyFile(id, folderId, userId) {
    const file = await db.File.findOne({
      where: {
        id,
        uploaded_by: userId,
      },
    });

    if (!file) {
      throw ApiError.notFound('文件不存在');
    }

    // 如果指定了文件夹，验证文件夹是否存在
    if (folderId && folderId !== 'null') {
      const folder = await db.Folder.findOne({
        where: {
          id: folderId,
          created_by: userId,
        },
      });

      if (!folder) {
        throw ApiError.notFound('目标文件夹不存在');
      }
    }

    // 生成新的文件名
    const newFilename = generateUniqueFilename(file.original_name);
    const newPath = generateFilePath(userId, newFilename);

    try {
      // 在 Minio 中复制文件
      await copyFile(file.path, newPath);

      // 创建新的文件记录
      const newFile = await db.File.create({
        filename: newFilename,
        original_name: `${file.original_name} (副本)`,
        mime_type: file.mime_type,
        size: file.size,
        path: newPath,
        bucket: BUCKET_NAME,
        folder_id: folderId === 'null' ? null : folderId,
        uploaded_by: userId,
      });

      logger.info(`File copied: ${file.original_name} by user ${userId}`);

      return this.getFileById(newFile.id, userId);
    } catch (error) {
      logger.error('Error copying file in Minio:', error);
      throw ApiError.internal('文件复制失败');
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(userId) {
    // 文件总数
    const totalFiles = await db.File.count({
      where: { uploaded_by: userId },
    });

    // 总存储大小
    const totalSize = await db.File.sum('size', {
      where: { uploaded_by: userId },
    }) || 0;

    // 按类型统计
    const files = await db.File.findAll({
      where: { uploaded_by: userId },
      attributes: ['mime_type', 'size'],
    });

    const categoryStats = {};
    files.forEach(file => {
      const category = getFileCategory(file.mime_type);
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          size: 0,
        };
      }
      categoryStats[category].count += 1;
      categoryStats[category].size += file.size || 0;
    });

    // 文件夹数量
    const totalFolders = await db.Folder.count({
      where: { created_by: userId },
    });

    return {
      totalFiles,
      totalFolders,
      totalSize,
      categoryStats,
    };
  }

  /**
   * 根据类别获取 MIME 类型列表
   */
  getCategoryMimeTypes(category) {
    const categoryMap = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
      video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-flv', 'video/webm', 'video/x-matroska'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'],
      archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'],
      text: ['text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript'],
    };

    return categoryMap[category] || [];
  }
}

module.exports = new FileService();
