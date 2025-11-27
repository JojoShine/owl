const apiBuilderService = require('./api-builder.service');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

class ApiBuilderAuthService {
  /**
   * 验证API密钥并获取接口信息
   */
  async authenticate(apiKey) {
    if (!apiKey) {
      throw ApiError.unauthorized('缺少API密钥');
    }

    try {
      const key = await apiBuilderService.verifyApiKey(apiKey);
      return key;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 检查请求频率限制
   */
  async checkRateLimit(interfaceId, apiKeyId) {
    // 这里可以使用Redis来实现限流
    // 目前仅返回true表示通过
    return true;
  }

  /**
   * 从请求头中获取API密钥
   * 支持格式：
   * - Authorization: Bearer YOUR_API_KEY
   * - X-API-Key: YOUR_API_KEY
   */
  extractApiKey(req) {
    // 从Authorization header中获取
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 从X-API-Key header中获取
    const apiKey = req.get('X-API-Key');
    if (apiKey) {
      return apiKey;
    }

    // 从查询参数中获取
    if (req.query.api_key) {
      return req.query.api_key;
    }

    return null;
  }
}

module.exports = new ApiBuilderAuthService();