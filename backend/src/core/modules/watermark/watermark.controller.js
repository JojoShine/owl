const watermarkService = require('./watermark.service');
const { success, error: errorResponse } = require('../../../utils/response');

/**
 * 水印配置控制器
 */
class WatermarkController {
  /**
   * 获取水印配置（原始配置）
   * GET /api/watermark
   */
  async getWatermark(req, res, next) {
    try {
      const config = await watermarkService.getWatermarkConfig();
      success(res, config, '获取水印配置成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取渲染后的水印（替换用户变量）
   * GET /api/watermark/rendered
   */
  async getRenderedWatermark(req, res, next) {
    try {
      const user = req.user;
      const config = await watermarkService.getRenderedWatermark(user);
      success(res, config, '获取渲染后的水印成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新水印配置
   * PUT /api/watermark
   */
  async updateWatermark(req, res, next) {
    try {
      const updateData = req.body;
      const user = req.user;

      // 验证配置数据
      const validation = watermarkService.validateConfig(updateData);
      if (!validation.valid) {
        return errorResponse(res, validation.errors.join('; '), 400);
      }

      const config = await watermarkService.updateWatermarkConfig(updateData, user);
      success(res, config, '更新水印配置成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WatermarkController();