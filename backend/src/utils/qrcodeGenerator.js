const QRCode = require('qrcode');
const { logger } = require('../config/logger');

/**
 * 二维码生成工具类
 * 支持生成带logo的二维码
 */
class QRCodeGenerator {
  constructor() {
    // 二维码配置
    this.defaultOptions = {
      errorCorrectionLevel: 'H', // 高容错率（支持logo遮挡）
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300, // 二维码宽度
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    // Logo配置
    this.logoConfig = {
      size: 60, // logo大小
      borderWidth: 4, // logo边框宽度
      borderColor: '#FFFFFF' // logo边框颜色
    };
  }

  /**
   * 生成二维码（不带logo）
   * @param {String} content - 二维码内容
   * @param {Object} options - 配置选项
   * @returns {Promise<String>} Base64编码的图片
   */
  async generate(content, options = {}) {
    try {
      const qrOptions = { ...this.defaultOptions, ...options };
      const base64 = await QRCode.toDataURL(content, qrOptions);
      return base64;
    } catch (error) {
      logger.error('[QRCodeGenerator] Generate QR code failed:', error);
      throw new Error('生成二维码失败');
    }
  }

  /**
   * 生成带logo的二维码
   * 注意：由于移除了 canvas 依赖，此方法现在只返回基础二维码（不带logo）
   * @param {String} content - 二维码内容
   * @param {String} logoPath - logo图片路径（已废弃，保留参数以兼容旧代码）
   * @param {Object} options - 配置选项
   * @returns {Promise<String>} Base64编码的图片
   */
  async generateWithLogo(content, logoPath = null, options = {}) {
    try {
      // 由于移除了 canvas 依赖，直接返回基础二维码
      logger.warn('[QRCodeGenerator] Canvas dependency removed, generating basic QR code without logo');
      return await this.generate(content, options);
    } catch (error) {
      logger.error('[QRCodeGenerator] Generate QR code failed:', error);
      throw new Error('生成二维码失败');
    }
  }

}

// 导出单例
module.exports = new QRCodeGenerator();