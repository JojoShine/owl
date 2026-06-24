const uploadStreamService = require('./upload-stream.service');
const { getMimeType } = require('../../../utils/file');

class UploadStreamController {
  /**
   * 获取文件流
   * GET /api/system/upload/stream?path={minioPath}
   */
  async getFileStream(req, res, next) {
    try {
      const { path } = req.query;

      if (!path) {
        return next(new Error('缺少路径参数'));
      }

      // 获取文件流
      const { stream, objectPath } = await uploadStreamService.getFileStream(path);

      // 获取 MIME 类型
      const mimeType = getMimeType(objectPath);

      // 设置响应头
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline`);

      // 返回文件流
      stream.pipe(res);

      // 错误处理
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: '文件读取失败' });
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadStreamController();
