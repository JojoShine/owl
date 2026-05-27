/**
 * 加密工具统一导出
 * 提供所有加密算法的统一接口
 */

const AESCrypto = require('./aes');
const RSACrypto = require('./rsa');
const HMACCrypto = require('./hmac');
const SM2Crypto = require('./sm2');
const SM3Crypto = require('./sm3');
const SM4Crypto = require('./sm4');

module.exports = {
  AESCrypto,
  RSACrypto,
  HMACCrypto,
  SM2Crypto,
  SM3Crypto,
  SM4Crypto,

  // 便捷方法：创建AES加密器
  createAES: (secretKey) => new AESCrypto(secretKey),

  // 便捷方法：创建RSA加密器
  createRSA: (publicKey, privateKey) => new RSACrypto(publicKey, privateKey),

  // 便捷方法：创建HMAC签名器
  createHMAC: (secretKey) => new HMACCrypto(secretKey),

  // 便捷方法：创建SM2加密器
  createSM2: (publicKey, privateKey) => new SM2Crypto(publicKey, privateKey),

  // 便捷方法：创建SM4加密器
  createSM4: (secretKey) => new SM4Crypto(secretKey),

  // 便捷方法：SM3哈希
  sm3Hash: (data, encoding) => SM3Crypto.hash(data, encoding),
  sm3HMAC: (data, key, encoding) => SM3Crypto.hmac(data, key, encoding),
};
