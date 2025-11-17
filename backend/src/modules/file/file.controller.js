const fileService = require('./file.service');
const { success, paginated } = require('../../utils/response');

class FileController {
  /**
   * 获取文件列表
   * GET /api/files
   */
  async getFiles(req, res, next) {
    try {
      const result = await fileService.getFiles(req.query, req.user.id);
      paginated(res, result.data, result.pagination, '获取文件列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取文件详情
   * GET /api/files/:id
   */
  async getFileById(req, res, next) {
    try {
      const file = await fileService.getFileById(req.params.id, req.user.id);
      success(res, file, '获取文件详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 上传文件
   * POST /api/files/upload
   */
  async uploadFile(req, res, next) {
    try {
      // 单文件上传
      if (req.file) {
        const file = await fileService.uploadFile(
          { ...req.file, body: req.body },
          req.user.id
        );
        success(res, file, '文件上传成功', 201);
      }
      // 多文件上传
      else if (req.files && req.files.length > 0) {
        const result = await fileService.uploadMultipleFiles(
          req.files,
          req.body,
          req.user.id
        );
        success(res, result, '文件批量上传完成', 201);
      } else {
        throw new Error('没有找到上传的文件');
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * 下载文件
   * GET /api/files/:id/download
   */
  async downloadFile(req, res, next) {
    try {
      const { stream, filename, mimeType, size } = await fileService.downloadFile(
        req.params.id,
        req.user.id
      );

      // 设置响应头
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      if (size) {
        res.setHeader('Content-Length', size);
      }

      // 将文件流传输给客户端
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 预览文件
   * GET /api/files/:id/preview
   */
  async previewFile(req, res, next) {
    try {
      const { stream, filename, mimeType, size } = await fileService.downloadFile(
        req.params.id,
        req.user.id
      );

      // 设置响应头（inline 表示预览而非下载）
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      if (size) {
        res.setHeader('Content-Length', size);
      }

      // 将文件流传输给客户端
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新文件信息
   * PUT /api/files/:id
   */
  async updateFile(req, res, next) {
    try {
      const file = await fileService.updateFile(
        req.params.id,
        req.body,
        req.user.id
      );
      success(res, file, '文件更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除文件
   * DELETE /api/files/:id
   */
  async deleteFile(req, res, next) {
    try {
      const result = await fileService.deleteFile(req.params.id, req.user.id);
      success(res, result, '文件删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量删除文件
   * POST /api/files/batch-delete
   */
  async batchDeleteFiles(req, res, next) {
    try {
      const { ids } = req.body;
      const result = await fileService.batchDeleteFiles(ids, req.user.id);
      success(res, result, '批量删除完成');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 移动文件
   * PUT /api/files/:id/move
   */
  async moveFile(req, res, next) {
    try {
      const { folder_id } = req.body;
      const file = await fileService.moveFile(
        req.params.id,
        folder_id,
        req.user.id
      );
      success(res, file, '文件移动成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 复制文件
   * POST /api/files/:id/copy
   */
  async copyFile(req, res, next) {
    try {
      const { folder_id } = req.body;
      const file = await fileService.copyFile(
        req.params.id,
        folder_id,
        req.user.id
      );
      success(res, file, '文件复制成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取存储统计
   * GET /api/files/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await fileService.getStorageStats(req.user.id);
      success(res, stats, '获取存储统计成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();
