const { WatermarkConfig, User } = require('../../../models');
const VariableReplacementUtil = require('./variable-replacement.util');

/**
 * 水印服务
 * 负责水印配置的管理、获取和渲染
 */
class WatermarkService {
  /**
   * 获取水印配置（原始配置，未替换变量）
   * @returns {Promise<object>} 水印配置对象
   */
  async getWatermarkConfig() {
    try {
      // 由于watermark_config是全局单例配置，直接获取第一条记录
      const config = await WatermarkConfig.findOne();

      if (!config) {
        // 如果不存在则返回默认配置
        return this.getDefaultConfig();
      }

      return config.toJSON();
    } catch (error) {
      throw new Error(`获取水印配置失败: ${error.message}`);
    }
  }

  /**
   * 获取渲染后的水印（已替换用户变量）
   * @param {object} user - 用户对象（包含username, realName, email等字段）
   * @returns {Promise<object>} 渲染后的水印配置
   */
  async getRenderedWatermark(user) {
    try {
      const config = await this.getWatermarkConfig();

      if (!config.enabled) {
        return {
          ...config,
          lines: []
        };
      }

      // 替换lines中的变量
      const renderedLines = VariableReplacementUtil.renderLines(
        config.lines || [],
        user,
        config.masking_rules || {}
      );

      return {
        ...config,
        lines: renderedLines
      };
    } catch (error) {
      throw new Error(`渲染水印失败: ${error.message}`);
    }
  }

  /**
   * 更新水印配置
   * @param {object} updateData - 更新的数据
   * @param {object} user - 当前操作的用户（用于记录created_by）
   * @returns {Promise<object>} 更新后的配置
   */
  async updateWatermarkConfig(updateData, user) {
    try {
      let config = await WatermarkConfig.findOne();

      if (!config) {
        // 如果不存在则创建新的配置
        config = await WatermarkConfig.create({
          ...updateData,
          created_by: user.id
        });
      } else {
        // 更新现有配置
        config = await config.update({
          ...updateData,
          created_by: user.id // 记录最后修改者
        });
      }

      return config.toJSON();
    } catch (error) {
      throw new Error(`更新水印配置失败: ${error.message}`);
    }
  }

  /**
   * 验证水印配置数据
   * @param {object} configData - 配置数据
   * @returns {object} {valid, errors}
   */
  validateConfig(configData) {
    const errors = [];

    // 验证lines
    if (configData.lines) {
      const validation = VariableReplacementUtil.validateLines(configData.lines);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    // 验证fontSize
    if (configData.font_size) {
      const fontSize = parseInt(configData.font_size);
      if (fontSize < 12 || fontSize > 48) {
        errors.push('font_size must be between 12 and 48');
      }
    }

    // 验证fontWeight
    if (configData.font_weight) {
      const validWeights = [300, 400, 700];
      if (!validWeights.includes(parseInt(configData.font_weight))) {
        errors.push('font_weight must be one of: 300, 400, 700');
      }
    }

    // 验证color
    if (configData.color) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(configData.color)) {
        errors.push('color must be a valid hex color code (e.g., #000000)');
      }
    }

    // 验证opacity
    if (configData.opacity !== undefined) {
      const opacity = parseFloat(configData.opacity);
      if (opacity < 0.05 || opacity > 0.5) {
        errors.push('opacity must be between 0.05 and 0.5');
      }
    }

    // 验证rotation
    if (configData.rotation !== undefined) {
      const rotation = parseInt(configData.rotation);
      if (rotation < 0 || rotation > 360) {
        errors.push('rotation must be between 0 and 360');
      }
    }

    // 验证spacing
    if (configData.spacing) {
      const spacing = parseInt(configData.spacing);
      if (spacing < 50 || spacing > 300) {
        errors.push('spacing must be between 50 and 300');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取默认配置
   * @returns {object} 默认水印配置
   */
  getDefaultConfig() {
    return {
      enabled: true,
      lines: [
        '账号: {{user:username|mask:hide:3}}',
        '部门: {{user:department}}',
        '姓名: {{user:realName}}'
      ],
      font_size: 24,
      font_weight: 400,
      color: '#000000',
      opacity: 0.15,
      rotation: 45,
      spacing: 150,
      masking_rules: {
        username: { type: 'hide', hideCount: 3 },
        email: { type: 'mask_middle', showCount: 2 },
        phone: { type: 'hide_last', hideCount: 4 }
      }
    };
  }
}

module.exports = new WatermarkService();