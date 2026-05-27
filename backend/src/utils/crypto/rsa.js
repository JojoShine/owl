const crypto = require('crypto');

/**
 * RSA 加密工具
 * 支持 RSA-2048 公钥加密和私钥解密
 */
class RSACrypto {
  constructor(publicKey, privateKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  /**
   * 生成RSA密钥对
   * @returns {object} { publicKey, privateKey }
   */
  static generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { publicKey, privateKey };
  }

  /**
   * 使用公钥加密数据
   * @param {string} plaintext - 明文
   * @returns {string} 加密后的数据（base64编码）
   */
  encrypt(plaintext) {
    try {
      if (!this.publicKey) {
        throw new Error('Public key is not set');
      }

      const encrypted = crypto.publicEncrypt(
        {
          key: this.publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(plaintext, 'utf8')
      );

      return encrypted.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * 使用私钥解密数据
   * @param {string} ciphertext - 密文（base64编码）
   * @returns {string} 解密后的明文
   */
  decrypt(ciphertext) {
    try {
      if (!this.privateKey) {
        throw new Error('Private key is not set');
      }

      const decrypted = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(ciphertext, 'base64')
      );

      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * 使用私钥签名数据
   * @param {string} data - 要签名的数据
   * @returns {string} 签名（base64编码）
   */
  sign(data) {
    try {
      if (!this.privateKey) {
        throw new Error('Private key is not set');
      }

      const sign = crypto.createSign('sha256');
      sign.update(data);
      const signature = sign.sign(this.privateKey);

      return signature.toString('base64');
    } catch (error) {
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  /**
   * 使用公钥验证签名
   * @param {string} data - 原始数据
   * @param {string} signature - 签名（base64编码）
   * @returns {boolean} 验证结果
   */
  verify(data, signature) {
    try {
      if (!this.publicKey) {
        throw new Error('Public key is not set');
      }

      const verify = crypto.createVerify('sha256');
      verify.update(data);

      return verify.verify(this.publicKey, Buffer.from(signature, 'base64'));
    } catch (error) {
      throw new Error(`Verification failed: ${error.message}`);
    }
  }
}

module.exports = RSACrypto;
