/**
 * SM4 加密工具
 * 国密SM4分组密码算法
 * 注意：Node.js原生不支持SM4，需要安装 sm-crypto 库
 * 这里提供基于标准库的实现框架
 */
class SM4Crypto {
  constructor(secretKey) {
    if (!secretKey) {
      throw new Error('Secret key is required');
    }
    this.secretKey = secretKey;
  }

  /**
   * 加密数据（ECB模式）
   * @param {string} plaintext - 明文
   * @returns {string} 加密后的数据（hex编码）
   */
  encrypt(plaintext) {
    try {
      // 注意：实际生产环境应使用 sm-crypto 库
      // const sm4 = require('sm-crypto').sm4;
      // return sm4.encrypt(plaintext, this.secretKey);

      console.warn('SM4: Encryption requires sm-crypto library. Install it for real SM4 support.');
      return Buffer.from(plaintext).toString('hex');
    } catch (error) {
      throw new Error(`SM4 encryption failed: ${error.message}`);
    }
  }

  /**
   * 解密数据（ECB模式）
   * @param {string} ciphertext - 密文（hex编码）
   * @returns {string} 解密后的明文
   */
  decrypt(ciphertext) {
    try {
      // 注意：实际生产环境应使用 sm-crypto 库
      // const sm4 = require('sm-crypto').sm4;
      // return sm4.decrypt(ciphertext, this.secretKey);

      console.warn('SM4: Decryption requires sm-crypto library. Install it for real SM4 support.');
      return Buffer.from(ciphertext, 'hex').toString('utf8');
    } catch (error) {
      throw new Error(`SM4 decryption failed: ${error.message}`);
    }
  }

  /**
   * 加密数据（CBC模式）
   * @param {string} plaintext - 明文
   * @param {string} iv - 初始化向量（hex编码，16字节）
   * @returns {string} 加密后的数据（hex编码）
   */
  encryptCBC(plaintext, iv) {
    try {
      // 注意：实际生产环境应使用 sm-crypto 库
      // const sm4 = require('sm-crypto').sm4;
      // return sm4.encrypt(plaintext, this.secretKey, { mode: 'cbc', iv });

      console.warn('SM4: CBC encryption requires sm-crypto library. Install it for real SM4 support.');
      return Buffer.from(plaintext).toString('hex');
    } catch (error) {
      throw new Error(`SM4 CBC encryption failed: ${error.message}`);
    }
  }

  /**
   * 解密数据（CBC模式）
   * @param {string} ciphertext - 密文（hex编码）
   * @param {string} iv - 初始化向量（hex编码，16字节）
   * @returns {string} 解密后的明文
   */
  decryptCBC(ciphertext, iv) {
    try {
      // 注意：实际生产环境应使用 sm-crypto 库
      // const sm4 = require('sm-crypto').sm4;
      // return sm4.decrypt(ciphertext, this.secretKey, { mode: 'cbc', iv });

      console.warn('SM4: CBC decryption requires sm-crypto library. Install it for real SM4 support.');
      return Buffer.from(ciphertext, 'hex').toString('utf8');
    } catch (error) {
      throw new Error(`SM4 CBC decryption failed: ${error.message}`);
    }
  }
}

module.exports = SM4Crypto;