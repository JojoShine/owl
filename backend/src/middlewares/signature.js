const { verifySignature, verifyTimestamp, verifyNonce, cacheNonce } = require('../utils/signature.util');
const ApiError = require('../utils/ApiError');
const { logger } = require('../config/logger');
const db = require('../models');

// Nonce缓存（实际生产环境应使用Redis）
const nonceCache = new Map();

/**
 * 创建签名验证中间件工厂函数
 * @param {Object} options - 配置选项
 * @param {Boolean} options.requireNonce - 是否需要nonce（默认false）
 * @param {Number} options.timestampWindow - 时间戳有效期（秒，默认300秒=5分钟）
 * @returns {Function} Express中间件函数
 */
function createSignatureMiddleware(options = {}) {
  const {
    requireNonce = false,
    timestampWindow = 300,
  } = options;

  return async (req, res, next) => {
    try {
      const { body } = req;

      // 1. 检查必需参数
      if (!body.api_key) {
        throw ApiError.badRequest('缺少必需参数: api_key');
      }

      if (!body.sign) {
        throw ApiError.badRequest('缺少必需参数: sign');
      }

      if (!body.timestamp) {
        throw ApiError.badRequest('缺少必需参数: timestamp');
      }

      // 2. 查询第三方API密钥信息
      const apiConfig = await db.ThirdPartyApiKey?.findOne({
        where: { api_key: body.api_key, status: 'active'}
      });

      if (!apiConfig) {
        logger.warn('Invalid API_KEY attempted', { api_key: body.api_key });
        throw ApiError.forbidden('无效的 API_KEY 或密钥已禁用');
      }

      // 3. 验证时间戳
      if (!verifyTimestamp(body.timestamp, timestampWindow)) {
        throw ApiError.badRequest(
          `请求时间戳过期或无效（允许时间差≤${timestampWindow}秒）`
        );
      }

      // 4. 验证nonce（如果需要）
      if (requireNonce) {
        if (!body.nonce) {
          throw ApiError.badRequest('缺少必需参数: nonce');
        }

        try {
          verifyNonce(body.nonce, nonceCache);
          cacheNonce(body.nonce, nonceCache);
        } catch (error) {
          throw ApiError.badRequest(error.message);
        }
      }

      // 5. 验证签名
      if (!verifySignature(body, apiConfig.api_secret)) {
        logger.warn('Signature verification failed', {
          api_key: body.api_key,
          path: req.path,
        });
        throw ApiError.forbidden('签名验证失败');
      }

      // 验证通过，保存接入方信息到请求对象
      req.apiKey = apiConfig.api_key;
      req.clientName = apiConfig.client_name;

      // 更新最后使用时间
      if (apiConfig.update) {
        await apiConfig.update({ last_used_at: new Date() });
      }

      next();
    } catch (error) {
      if (error.statusCode) {
        return next(error);
      }
      next(ApiError.badRequest('签名验证过程出错: ' + error.message));
    }
  };
}

/**
 * 高敏感接口签名验证中间件
 * - 强制要求nonce
 * - 默认5分钟时间戳窗口
 * 用于：扣款、转账等高敏感操作
 */
const verifyHighSensitiveSignature = createSignatureMiddleware({
  requireNonce: true,
  timestampWindow: 300,
});

/**
 * 普通接口签名验证中间件
 * - 不需要nonce
 * - 默认5分钟时间戳窗口
 * 用于：用户同步、食堂信息同步等普通操作
 */
const verifyNormalSignature = createSignatureMiddleware({
  requireNonce: false,
  timestampWindow: 300,
});

/**
 * 宽松模式签名验证中间件
 * - 不需要nonce
 * - 时间戳窗口30分钟
 * 用于：批量同步等长周期操作
 */
const verifyRelaxedSignature = createSignatureMiddleware({
  requireNonce: false,
  timestampWindow: 1800,
});

module.exports = {
  createSignatureMiddleware,
  verifyHighSensitiveSignature,
  verifyNormalSignature,
  verifyRelaxedSignature,
};