const crypto = require('crypto');

/**
 * HMAC 加密工具
 * 支持多种哈希算法的HMAC签名
 */
class HMACCrypto {
  constructor(secretKey) {
    if (!secretKey) {
      throw new Error('Secret key is required');
    }
    this.secretKey = secretKey;
  }

  /**
   * 生成HMAC签名
   * @param {string} data - 要签名的数据
   * @param {string} algorithm - 哈希算法（默认sha256）
   * @returns {string} 签名（hex编码）
   */
  sign(data, algorithm = 'sha256') {
    try {
      const hmac = crypto.createHmac(algorithm, this.secretKey);
      hmac.update(data);
      return hmac.digest('hex');
    } catch (error) {
      throw new Error(`HMAC signing failed: ${error.message}`);
    }
  }

  /**
   * 生成HMAC签名（base64编码）
   * @param {string} data - 要签名的数据
   * @param {string} algorithm - 哈希算法（默认sha256）
   * @returns {string} 签名（base64编码）
   */
  signBase64(data, algorithm = 'sha256') {
    try {
      const hmac = crypto.createHmac(algorithm, this.secretKey);
      hmac.update(data);
      return hmac.digest('base64');
    } catch (error) {
      throw new Error(`HMAC signing failed: ${error.message}`);
    }
  }

  /**
   * 验证HMAC签名
   * @param {string} data - 原始数据
   * @param {string} signature - 签名（hex编码）
   * @param {string} algorithm - 哈希算法（默认sha256）
   * @returns {boolean} 验证结果
   */
  verify(data, signature, algorithm = 'sha256') {
    try {
      const computed = this.sign(data, algorithm);
      // 使用恒定时间比较防止时序攻击
      return crypto.timingSafeEqual(
        Buffer.from(computed),
        Buffer.from(signature)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * 验证HMAC签名（base64编码）
   * @param {string} data - 原始数据
   * @param {string} signature - 签名（base64编码）
   * @param {string} algorithm - 哈希算法（默认sha256）
   * @returns {boolean} 验证结果
   */
  verifyBase64(data, signature, algorithm = 'sha256') {
    try {
      const computed = this.signBase64(data, algorithm);
      // 使用恒定时间比较防止时序攻击
      return crypto.timingSafeEqual(
        Buffer.from(computed),
        Buffer.from(signature)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * 生成API签名（用于API认证）
   * @param {string} method - HTTP方法
   * @param {string} path - 请求路径
   * @param {object} params - 请求参数
   * @param {string} timestamp - 时间戳
   * @returns {string} API签名
   */
  generateAPISignature(method, path, params, timestamp) {
    try {
      // 构建签名字符串
      const paramStr = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');

      const signStr = `${method}\n${path}\n${paramStr}\n${timestamp}`;
      return this.sign(signStr);
    } catch (error) {
      throw new Error(`API signature generation failed: ${error.message}`);
    }
  }

  /**
   * 验证API签名
   * @param {string} method - HTTP方法
   * @param {string} path - 请求路径
   * @param {object} params - 请求参数
   * @param {string} timestamp - 时间戳
   * @param {string} signature - 签名
   * @returns {boolean} 验证结果
   */
  verifyAPISignature(method, path, params, timestamp, signature) {
    try {
      const computed = this.generateAPISignature(method, path, params, timestamp);
      return this.verify(
        `${method}\n${path}\n${Object.keys(params)
          .sort()
          .map(key => `${key}=${params[key]}`)
          .join('&')}\n${timestamp}`,
        signature
      );
    } catch (error) {
      return false;
    }
  }
}

module.exports = HMACCrypto;
