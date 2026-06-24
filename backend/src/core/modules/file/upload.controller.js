const uploadService = require('./upload.service');
const { success } = require('../../../utils/response');

class UploadController {
  /**
   * 上传文件
   * POST /api/system/upload/file
   */
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return next(new Error('没有找到上传的文件'));
      }

      const { category = 'normal' } = req.body;
      const { buffer, originalname, mimetype } = req.file;
      const userId = req.user?.id;

      // 上传文件到 Minio
      const filePath = await uploadService.uploadFile(
        buffer,
        originalname,
        mimetype,
        category,
        userId
      );

      success(res, { path: filePath }, '文件上传成功', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadController();
