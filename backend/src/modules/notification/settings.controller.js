const settingsService = require('./settings.service');
const { success } = require('../../utils/response');

class SettingsController {
  /**
   * 获取当前用户的通知设置
   * GET /api/notifications/settings
   */
  async getSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const settings = await settingsService.getUserSettings(userId);

      success(res, settings, '获取通知设置成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新当前用户的通知设置
   * PUT /api/notifications/settings
   */
  async updateSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const settings = await settingsService.updateUserSettings(userId, req.body);

      success(res, settings, '更新通知设置成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 重置通知设置为默认值
   * POST /api/notifications/settings/reset
   */
  async resetSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const settings = await settingsService.resetUserSettings(userId);

      success(res, settings, '重置通知设置成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingsController();
