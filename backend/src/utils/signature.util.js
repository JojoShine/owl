const crypto = require('crypto');

/**
 * 签名工具函数
 * 使用HMAC-SHA256进行签名验证
 * 符合行业最佳实践标准
 */

/**
 * 生成HMAC-SHA256签名
 * @param {Object} params - 请求参数（不含sign字段）
 * @param {String} apiSecret - API密钥（由平台分配）
 * @returns {String} 十六进制签名字符串
 */
function generateSignature(params, apiSecret) {
  // 递归函数：将嵌套对象展平为签名字符串
  function flattenToSignString(obj, prefix = '') {
    const parts = [];

    if (Array.isArray(obj)) {
      // 数组处理
      obj.forEach((item, index) => {
        const itemPrefix = prefix ? `${prefix}[${index}]` : `[${index}]`;
        parts.push(...flattenToSignString(item, itemPrefix));
      });
    } else if (typeof obj === 'object' && obj !== null) {
      // 对象处理
      Object.keys(obj)
        .filter(k => obj[k] !== null && obj[k] !== undefined)
        .sort()
        .forEach(key => {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          if (Array.isArray(obj[key])) {
            parts.push(...flattenToSignString(obj[key], newPrefix));
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            parts.push(...flattenToSignString(obj[key], newPrefix));
          } else {
            parts.push(`${newPrefix}=${obj[key]}`);
          }
        });
    } else {
      // 原始值
      if (prefix) {
        parts.push(`${prefix}=${obj}`);
      }
    }

    return parts;
  }

  // 步骤1: 参数排序（ASCII升序）
  const sortedKeys = Object.keys(params)
    .filter(key => key !== 'sign' && params[key] !== null && params[key] !== undefined)
    .sort();

  // 步骤2: 拼接字符串（处理特殊类型）
  const allParts = [];

  sortedKeys.forEach(key => {
    const value = params[key];
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      allParts.push(...flattenToSignString(value, key));
    } else {
      allParts.push(`${key}=${value}`);
    }
  });

  const signStr = allParts.join('&');

  // 步骤3: 计算HMAC-SHA256
  const sign = crypto
    .createHmac('sha256', apiSecret)
    .update(signStr)
    .digest('hex');

  return sign;
}

/**
 * 验证HMAC-SHA256签名
 * @param {Object} params - 请求参数（含sign字段）
 * @param {String} apiSecret - API密钥
 * @returns {Boolean} 验证结果
 */
function verifySignature(params, apiSecret) {
  if (!params.sign) {
    throw new Error('缺少签名参数');
  }

  const providedSign = params.sign;
  const expectedSign = generateSignature(params, apiSecret);

  return providedSign === expectedSign;
}

/**
 * 验证时间戳
 * @param {Number} timestamp - Unix时间戳（毫秒）
 * @param {Number} maxAgeSeconds - 最大允许时间差（秒，默认300秒=5分钟）
 * @returns {Boolean} 验证结果
 */
function verifyTimestamp(timestamp, maxAgeSeconds = 300) {
  if (!timestamp) {
    throw new Error('缺少时间戳参数');
  }

  const now = Date.now();
  const age = Math.abs(now - timestamp);

  return age <= maxAgeSeconds * 1000;
}

/**
 * 生成32位随机nonce
 * @returns {String} 32位随机字符串
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 验证nonce（防重放攻击）
 * @param {String} nonce - 32位随机字符串
 * @param {Map} nonceCache - nonce缓存（使用Map存储）
 * @returns {Boolean} 验证结果
 */
function verifyNonce(nonce, nonceCache) {
  if (!nonce) {
    throw new Error('缺少nonce参数');
  }

  if (nonceCache.has(nonce)) {
    throw new Error('nonce已被使用，疑似重放攻击');
  }

  return true;
}

/**
 * 缓存nonce（防重放攻击）
 * @param {String} nonce - 32位随机字符串
 * @param {Map} nonceCache - nonce缓存
 * @param {Number} ttlSeconds - 缓存过期时间（秒，默认600秒=10分钟）
 */
function cacheNonce(nonce, nonceCache, ttlSeconds = 600) {
  nonceCache.set(nonce, Date.now());
  // 10分钟后自动过期
  setTimeout(() => nonceCache.delete(nonce), ttlSeconds * 1000);
}

module.exports = {
  generateSignature,
  verifySignature,
  verifyTimestamp,
  generateNonce,
  verifyNonce,
  cacheNonce,
};