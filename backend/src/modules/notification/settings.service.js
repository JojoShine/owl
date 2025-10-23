const { NotificationSettings } = require('../../models');

/**
 * 通知设置服务
 * 负责用户通知偏好设置的管理
 */
class SettingsService {
  /**
   * 获取用户的通知设置
   * 如果不存在，则创建默认设置
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 通知设置
   */
  async getUserSettings(userId) {
    try {
      let settings = await NotificationSettings.findOne({
        where: { user_id: userId },
      });

      // 如果不存在，创建默认设置
      if (!settings) {
        settings = await this.createDefaultSettings(userId);
      }

      return settings;
    } catch (error) {
      throw new Error(`获取通知设置失败: ${error.message}`);
    }
  }

  /**
   * 创建默认通知设置
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 创建的设置
   */
  async createDefaultSettings(userId) {
    try {
      const settings = await NotificationSettings.create({
        user_id: userId,
        email_enabled: true,
        push_enabled: true,
        system_notification: true,
        warning_notification: true,
        error_notification: true,
      });

      return settings;
    } catch (error) {
      throw new Error(`创建默认设置失败: ${error.message}`);
    }
  }

  /**
   * 更新用户的通知设置
   * @param {String} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @param {Boolean} updateData.email_enabled - 是否启用邮件通知
   * @param {Boolean} updateData.push_enabled - 是否启用推送通知
   * @param {Boolean} updateData.system_notification - 是否接收系统通知
   * @param {Boolean} updateData.warning_notification - 是否接收警告通知
   * @param {Boolean} updateData.error_notification - 是否接收错误通知
   * @returns {Promise<Object>} 更新后的设置
   */
  async updateUserSettings(userId, updateData) {
    try {
      // 获取或创建设置
      let settings = await NotificationSettings.findOne({
        where: { user_id: userId },
      });

      if (!settings) {
        settings = await this.createDefaultSettings(userId);
      }

      // 只更新允许的字段
      const allowedFields = [
        'email_enabled',
        'push_enabled',
        'system_notification',
        'warning_notification',
        'error_notification',
      ];

      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData.hasOwnProperty(field)) {
          filteredData[field] = updateData[field];
        }
      });

      // 更新设置
      await settings.update(filteredData);

      return settings;
    } catch (error) {
      throw new Error(`更新通知设置失败: ${error.message}`);
    }
  }

  /**
   * 检查用户是否允许接收某类通知
   * @param {String} userId - 用户ID
   * @param {String} notificationType - 通知类型 (system/warning/error)
   * @returns {Promise<Boolean>} 是否允许接收
   */
  async isNotificationEnabled(userId, notificationType) {
    try {
      const settings = await this.getUserSettings(userId);

      // 检查推送是否启用
      if (!settings.push_enabled) {
        return false;
      }

      // 根据通知类型检查对应的设置
      switch (notificationType) {
        case 'system':
          return settings.system_notification;
        case 'warning':
          return settings.warning_notification;
        case 'error':
          return settings.error_notification;
        case 'info':
        case 'success':
          return true; // 默认允许
        default:
          return true;
      }
    } catch (error) {
      throw new Error(`检查通知设置失败: ${error.message}`);
    }
  }

  /**
   * 检查用户是否启用了邮件通知
   * @param {String} userId - 用户ID
   * @returns {Promise<Boolean>} 是否启用邮件通知
   */
  async isEmailEnabled(userId) {
    try {
      const settings = await this.getUserSettings(userId);
      return settings.email_enabled;
    } catch (error) {
      throw new Error(`检查邮件通知设置失败: ${error.message}`);
    }
  }

  /**
   * 检查用户是否启用了推送通知
   * @param {String} userId - 用户ID
   * @returns {Promise<Boolean>} 是否启用推送通知
   */
  async isPushEnabled(userId) {
    try {
      const settings = await this.getUserSettings(userId);
      return settings.push_enabled;
    } catch (error) {
      throw new Error(`检查推送通知设置失败: ${error.message}`);
    }
  }

  /**
   * 重置用户设置为默认值
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 重置后的设置
   */
  async resetUserSettings(userId) {
    try {
      const settings = await NotificationSettings.findOne({
        where: { user_id: userId },
      });

      if (!settings) {
        return await this.createDefaultSettings(userId);
      }

      // 重置为默认值
      await settings.update({
        email_enabled: true,
        push_enabled: true,
        system_notification: true,
        warning_notification: true,
        error_notification: true,
      });

      return settings;
    } catch (error) {
      throw new Error(`重置通知设置失败: ${error.message}`);
    }
  }

  /**
   * 批量获取多个用户的通知设置
   * @param {Array<String>} userIds - 用户ID数组
   * @returns {Promise<Map>} userId -> settings 的映射
   */
  async getBatchUserSettings(userIds) {
    try {
      const settingsList = await NotificationSettings.findAll({
        where: {
          user_id: userIds,
        },
      });

      // 转换为Map
      const settingsMap = new Map();
      settingsList.forEach(settings => {
        settingsMap.set(settings.user_id, settings);
      });

      // 为没有设置的用户创建默认设置
      for (const userId of userIds) {
        if (!settingsMap.has(userId)) {
          const defaultSettings = await this.createDefaultSettings(userId);
          settingsMap.set(userId, defaultSettings);
        }
      }

      return settingsMap;
    } catch (error) {
      throw new Error(`批量获取通知设置失败: ${error.message}`);
    }
  }
}

module.exports = new SettingsService();
