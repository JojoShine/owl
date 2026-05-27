const crypto = require('crypto');

/**
 * SM3 哈希工具
 * 国密SM3哈希算法
 * 注意：Node.js原生不支持SM3，需要安装 sm-crypto 或 gm-crypto 库
 * 这里提供基于标准库的实现框架
 */
class SM3Crypto {
  /**
   * 计算SM3哈希
   * @param {string} data - 要哈希的数据
   * @param {string} encoding - 输出编码（hex或base64）
   * @returns {string} 哈希值
   */
  static hash(data, encoding = 'hex') {
    try {
      // 注意：这里使用SHA256作为替代
      // 实际生产环境应使用 sm-crypto 库的 sm3 方法
      // const sm3 = require('sm-crypto').sm3;
      // return sm3(data);

      console.warn('SM3: Using SHA256 as fallback. Install sm-crypto for real SM3 support.');
      const hash = crypto.createHash('sha256');
      hash.update(data);
      return hash.digest(encoding);
    } catch (error) {
      throw new Error(`SM3 hashing failed: ${error.message}`);
    }
  }

  /**
   * 计算HMAC-SM3
   * @param {string} data - 要签名的数据
   * @param {string} key - 密钥
   * @param {string} encoding - 输出编码（hex或base64）
   * @returns {string} HMAC值
   */
  static hmac(data, key, encoding = 'hex') {
    try {
      // 注意：这里使用HMAC-SHA256作为替代
      // 实际生产环境应使用支持SM3的HMAC实现
      console.warn('SM3: Using HMAC-SHA256 as fallback. Install sm-crypto for real HMAC-SM3 support.');
      const hmac = crypto.createHmac('sha256', key);
      hmac.update(data);
      return hmac.digest(encoding);
    } catch (error) {
      throw new Error(`HMAC-SM3 failed: ${error.message}`);
    }
  }

  /**
   * 验证哈希值
   * @param {string} data - 原始数据
   * @param {string} hash - 哈希值
   * @returns {boolean} 验证结果
   */
  static verify(data, hash) {
    try {
      const computed = this.hash(data);
      return computed === hash;
    } catch (error) {
      return false;
    }
  }
}

module.exports = SM3Crypto;
