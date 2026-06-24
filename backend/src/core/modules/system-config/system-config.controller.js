const systemConfigService = require('./system-config.service');
const uploadService = require('../upload/upload.service');
const { success } = require('../../../utils/response');
const { logger } = require('../../../config/logger');

class SystemConfigController {
  /**
   * 获取系统配置
   */
  async getConfig(req, res, next) {
    try {
      const config = await systemConfigService.getConfig();
      success(res, config, '获取系统配置成功');
    } catch (error) {
      logger.error('获取系统配置失败:', error);
      next(error);
    }
  }

  /**
   * 更新系统配置
   */
  async updateConfig(req, res, next) {
    try {
      const config = await systemConfigService.updateConfig(req.body, req.user.id);
      success(res, config, '更新系统配置成功');
    } catch (error) {
      logger.error('更新系统配置失败:', error);
      next(error);
    }
  }

  /**
   * 上传 Logo
   */
  async uploadLogo(req, res, next) {
    try {
      if (!req.file) {
        return next(new Error('没有找到上传的文件'));
      }

      const { buffer, originalname, mimetype } = req.file;

      // 调用通用上传服务，上传到 Minio
      const filePath = await uploadService.uploadFile(
        buffer,
        originalname,
        mimetype,
        'logo',
        null
      );

      // 保存 Minio 路径到系统配置
      const config = await systemConfigService.uploadLogo(filePath);

      success(res, { url: filePath }, 'Logo 上传成功', 201);
    } catch (error) {
      logger.error('上传 Logo 失败:', error);
      next(error);
    }
  }

  /**
   * 上传登录背景
   */
  async uploadLoginBg(req, res, next) {
    try {
      if (!req.file) {
        return next(new Error('没有找到上传的文件'));
      }

      const { buffer, originalname, mimetype } = req.file;

      // 调用通用上传服务，上传到 Minio
      const filePath = await uploadService.uploadFile(
        buffer,
        originalname,
        mimetype,
        'background',
        null
      );

      // 保存 Minio 路径到系统配置
      const config = await systemConfigService.uploadLoginBg(filePath);

      success(res, { url: filePath }, '登录背景上传成功', 201);
    } catch (error) {
      logger.error('上传登录背景失败:', error);
      next(error);
    }
  }

}

module.exports = new SystemConfigController();