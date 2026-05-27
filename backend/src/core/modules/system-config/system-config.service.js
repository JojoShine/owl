const { SystemConfig } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

class SystemConfigService {
  /**
   * 获取系统配置（单例模式）
   */
  async getConfig() {
    let config = await SystemConfig.findOne({ where: { id: 1 } });

    if (!config) {
      // 如果没有配置，创建默认配置
      config = await SystemConfig.create({
        id: 1,
        company_name: 'Owl Platform',
        system_name: 'Owl Platform',
        show_tech_stack: true,
        enable_theme_switch: true,
        theme_mode: 'auto',
        primary_color: 'default',
      });
    }

    return config;
  }

  /**
   * 更新系统配置
   */
  async updateConfig(data, userId) {
    if (!data || typeof data !== 'object') {
      throw ApiError.badRequest('配置数据不合法');
    }

    let config = await this.getConfig();

    // 构建更新数据，排除某些字段
    const updateData = {
      ...data,
      created_by: userId,
    };

    // 不允许修改 id
    delete updateData.id;

    await config.update(updateData);

    return this.getConfig();
  }

  /**
   * 上传 Logo
   */
  async uploadLogo(logoUrl) {
    if (!logoUrl) {
      throw ApiError.badRequest('文件URL不能为空');
    }

    let config = await this.getConfig();
    await config.update({ logo_url: logoUrl });

    return this.getConfig();
  }

  /**
   * 上传登录背景
   */
  async uploadLoginBg(bgUrl) {
    if (!bgUrl) {
      throw ApiError.badRequest('文件URL不能为空');
    }

    let config = await this.getConfig();
    await config.update({ login_bg_url: bgUrl });

    return this.getConfig();
  }
}

module.exports = new SystemConfigService();
