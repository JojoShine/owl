const fileShareService = require('./file-share.service');
const { success, list } = require('../../utils/response');

class FileShareController {
  /**
   * 创建文件分享
   * POST /api/file-shares
   */
  async createShare(req, res, next) {
    try {
      const share = await fileShareService.createShare(req.body, req.user.id);
      success(res, share, '创建分享成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取分享信息（通过分享码）
   * GET /api/file-shares/:shareCode
   */
  async getShareByCode(req, res, next) {
    try {
      const share = await fileShareService.getShareByCode(req.params.shareCode);
      success(res, share, '获取分享信息成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户的所有分享
   * GET /api/file-shares
   */
  async getUserShares(req, res, next) {
    try {
      const shares = await fileShareService.getUserShares(req.user.id);
      list(res, shares, '获取分享列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 下载分享的文件
   * GET /api/file-shares/:shareCode/download
   */
  async downloadSharedFile(req, res, next) {
    try {
      const { stream, filename, mimeType, size } = await fileShareService.downloadSharedFile(
        req.params.shareCode
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
   * 删除分享
   * DELETE /api/file-shares/:id
   */
  async deleteShare(req, res, next) {
    try {
      const result = await fileShareService.deleteShare(req.params.id, req.user.id);
      success(res, result, '删除分享成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileShareController();
