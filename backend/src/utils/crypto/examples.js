/**
 * 加密工具使用示例
 */

const crypto = require('./index');

// ============ AES 加密示例 ============
console.log('=== AES 加密示例 ===');
const aes = crypto.createAES('my-secret-key-32-chars-long!!!');
const plaintext = 'Hello, World!';
const encrypted = aes.encrypt(plaintext);
console.log('明文:', plaintext);
console.log('密文:', encrypted);
const decrypted = aes.decrypt(encrypted);
console.log('解密:', decrypted);

// ============ RSA 加密示例 ============
console.log('\n=== RSA 加密示例 ===');
const { publicKey, privateKey } = crypto.RSACrypto.generateKeyPair();
const rsa = crypto.createRSA(publicKey, privateKey);
const rsaPlaintext = 'Secret Message';
const rsaEncrypted = rsa.encrypt(rsaPlaintext);
console.log('明文:', rsaPlaintext);
console.log('密文:', rsaEncrypted.substring(0, 50) + '...');
const rsaDecrypted = rsa.decrypt(rsaEncrypted);
console.log('解密:', rsaDecrypted);

// RSA 签名示例
const data = 'Important Data';
const signature = rsa.sign(data);
console.log('签名:', signature.substring(0, 50) + '...');
const isValid = rsa.verify(data, signature);
console.log('签名验证:', isValid);

// ============ HMAC 签名示例 ============
console.log('\n=== HMAC 签名示例 ===');
const hmac = crypto.createHMAC('my-secret-key');
const hmacData = 'Data to sign';
const hmacSignature = hmac.sign(hmacData);
console.log('数据:', hmacData);
console.log('签名:', hmacSignature);
const isHmacValid = hmac.verify(hmacData, hmacSignature);
console.log('签名验证:', isHmacValid);

// API 签名示例
const apiSignature = hmac.generateAPISignature(
  'GET',
  '/api/users',
  { page: 1, limit: 10 },
  '1234567890'
);
console.log('API签名:', apiSignature);

// ============ SM3 哈希示例 ============
console.log('\n=== SM3 哈希示例 ===');
const sm3Data = 'Data to hash';
const sm3Hash = crypto.sm3Hash(sm3Data);
console.log('数据:', sm3Data);
console.log('哈希:', sm3Hash);
const sm3Verified = crypto.SM3Crypto.verify(sm3Data, sm3Hash);
console.log('哈希验证:', sm3Verified);

// ============ SM2 加密示例 ============
console.log('\n=== SM2 加密示例 ===');
const sm2KeyPair = crypto.SM2Crypto.generateKeyPair();
const sm2 = crypto.createSM2(sm2KeyPair.publicKey, sm2KeyPair.privateKey);
const sm2Plaintext = 'SM2 Secret';
const sm2Encrypted = sm2.encrypt(sm2Plaintext);
console.log('明文:', sm2Plaintext);
console.log('密文:', sm2Encrypted);
const sm2Decrypted = sm2.decrypt(sm2Encrypted);
console.log('解密:', sm2Decrypted);

// ============ SM4 加密示例 ============
console.log('\n=== SM4 加密示例 ===');
const sm4 = crypto.createSM4('my-secret-key-16!');
const sm4Plaintext = 'SM4 Secret';
const sm4Encrypted = sm4.encrypt(sm4Plaintext);
console.log('明文:', sm4Plaintext);
console.log('密文:', sm4Encrypted);
const sm4Decrypted = sm4.decrypt(sm4Encrypted);
console.log('解密:', sm4Decrypted);

module.exports = {
  aes,
  rsa,
  hmac,
  sm2,
  sm4,
};