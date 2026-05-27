const systemConfigService = require('./system-config.service');
const fileService = require('../file/file.service');
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

      // req.file.filename 是 multer 保存的文件名
      // 不添加路径前缀，让前端的 basePath 来处理
      const fileUrl = `/uploads/${req.file.filename}`;

      // 保存文件路径到系统配置
      const config = await systemConfigService.uploadLogo(fileUrl);

      success(res, { url: fileUrl }, 'Logo 上传成功', 201);
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

      // req.file.filename 是 multer 保存的文件名
      // 不添加路径前缀，让前端的 basePath 来处理
      const fileUrl = `/uploads/${req.file.filename}`;

      // 保存文件路径到系统配置
      const config = await systemConfigService.uploadLoginBg(fileUrl);

      success(res, { url: fileUrl }, '登录背景上传成功', 201);
    } catch (error) {
      logger.error('上传登录背景失败:', error);
      next(error);
    }
  }

}

module.exports = new SystemConfigController();