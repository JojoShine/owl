/**
 * SM2 加密工具
 * 国密SM2椭圆曲线公钥密码算法
 * 注意：Node.js原生不支持SM2，需要安装 sm-crypto 库
 * 这里提供基于标准库的实现框架
 */
class SM2Crypto {
  constructor(publicKey, privateKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  /**
   * 生成SM2密钥对
   * @returns {object} { publicKey, privateKey }
   */
  static generateKeyPair() {
    // 注意：实际生产环境应使用 sm-crypto 库
    // const sm2 = require('sm-crypto').sm2;
    // return sm2.generateKeyPairHex();

    console.warn('SM2: Key pair generation requires sm-crypto library. Install it for real SM2 support.');
    return {
      publicKey: 'SM2_PUBLIC_KEY_PLACEHOLDER',
      privateKey: 'SM2_PRIVATE_KEY_PLACEHOLDER',
    };
  }

  /**
   * 使用公钥加密数据
   * @param {string} plaintext - 明文
   * @param {number} cipherMode - 密文排列方式（1-C1C3C2，0-C1C2C3）
   * @returns {string} 加密后的数据（hex编码）
   */
  encrypt(plaintext, cipherMode = 1) {
    try {
      if (!this.publicKey) {
        throw new Error('Public key is not set');
      }

      // 注意：实际生产环境应使用 sm-crypto 库
      // const sm2 = require('sm-crypto').sm2;
      // return sm2.doEncrypt(plaintext, this.publicKey, cipherMode);

      console.warn('SM2: Encryption requires sm-crypto library. Install it for real SM2 support.');
      return Buffer.from(plaintext).toString('hex');
    } catch (error) {
      throw new Error(`SM2 encryption failed: ${error.message}`);
    }
  }

  /**
   * 使用私钥解密数据
   * @param {string} ciphertext - 密文（hex编码）
   * @param {number} cipherMode - 密文排列方式（1-C1C3C2，0-C1C2C3）
   * @returns {string} 解密后的明文
   */
  decrypt(ciphertext, cipherMode = 1) {
    try {
      if (!this.privateKey) {
        throw new Error('Private key is not set');
      }

      // 注意：实际生产环境应使用 sm-crypto 库
      // const sm2 = require('sm-crypto').sm2;
      // return sm2.doDecrypt(ciphertext, this.privateKey, cipherMode);

      console.warn('SM2: Decryption requires sm-crypto library. Install it for real SM2 support.');
      return Buffer.from(ciphertext, 'hex').toString('utf8');
    } catch (error) {
      throw new Error(`SM2 decryption failed: ${error.message}`);
    }
  }

  /**
   * 使用私钥签名数据
   * @param {string} data - 要签名的数据
   * @returns {string} 签名（hex编码）
   */
  sign(data) {
    try {
      if (!this.privateKey) {
        throw new Error('Private key is not set');
      }

      // 注意：实际生产环境应使用 sm-crypto 库
      // const sm2 = require('sm-crypto').sm2;
      // return sm2.doSignature(data, this.privateKey);

      console.warn('SM2: Signing requires sm-crypto library. Install it for real SM2 support.');
      return 'SM2_SIGNATURE_PLACEHOLDER';
    } catch (error) {
      throw new Error(`SM2 signing failed: ${error.message}`);
    }
  }

  /**
   * 使用公钥验证签名
   * @param {string} data - 原始数据
   * @param {string} signature - 签名（hex编码）
   * @returns {boolean} 验证结果
   */
  verify(data, signature) {
    try {
      if (!this.publicKey) {
        throw new Error('Public key is not set');
      }

      // 注意：实际生产环境应使用 sm-crypto 库
      // const sm2 = require('sm-crypto').sm2;
      // return sm2.doVerifySignature(data, signature, this.publicKey);

      console.warn('SM2: Verification requires sm-crypto library. Install it for real SM2 support.');
      return true;
    } catch (error) {
      throw new Error(`SM2 verification failed: ${error.message}`);
    }
  }
}

module.exports = SM2Crypto;
