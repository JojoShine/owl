const crypto = require('crypto');

/**
 * AES 加密工具
 * 支持 AES-256-CBC 加密和解密
 */
class AESCrypto {
  constructor(secretKey) {
    // 确保密钥长度为32字节（256位）
    if (!secretKey) {
      throw new Error('Secret key is required');
    }

    // 如果密钥长度不足32字节，使用SHA256哈希扩展
    if (secretKey.length < 32) {
      this.key = crypto.createHash('sha256').update(secretKey).digest();
    } else {
      this.key = Buffer.from(secretKey.slice(0, 32));
    }
  }

  /**
   * 加密数据
   * @param {string} plaintext - 明文
   * @returns {string} 加密后的数据（base64编码）
   */
  encrypt(plaintext) {
    try {
      // 生成随机IV（初始化向量）
      const iv = crypto.randomBytes(16);

      // 创建加密器
      const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);

      // 加密数据
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // 将IV和加密数据组合，并转换为base64
      const combined = iv.toString('hex') + ':' + encrypted;
      return Buffer.from(combined).toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * 解密数据
   * @param {string} ciphertext - 密文（base64编码）
   * @returns {string} 解密后的明文
   */
  decrypt(ciphertext) {
    try {
      // 从base64解码
      const combined = Buffer.from(ciphertext, 'base64').toString('hex');
      const [ivHex, encrypted] = combined.split(':');

      if (!ivHex || !encrypted) {
        throw new Error('Invalid ciphertext format');
      }

      // 恢复IV
      const iv = Buffer.from(ivHex, 'hex');

      // 创建解密器
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);

      // 解密数据
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}

module.exports = AESCrypto;
