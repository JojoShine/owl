const crypto = require('crypto');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

class ApiBuilderKeysController {
  /**
   * 获取所有API密钥列表
   * GET /api-builder/keys
   */
  async getAllKeys(req, res) {
    try {
      const db = require('../../models');
      const userId = req.user.id;

      logger.info('Fetching API keys for user:', userId);
      logger.info('db.ApiKey exists:', !!db.ApiKey);

      const keys = await db.ApiKey.findAll({
        where: {
          created_by: userId,
        },
        attributes: ['id', 'app_name', 'api_key', 'status', 'expires_at', 'last_used_at', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']],
        raw: true,
      });

      logger.info('Found keys:', keys.length);

      res.json({
        success: true,
        data: keys,
      });
    } catch (error) {
      logger.error('Error fetching API keys:', error.message);
      logger.error('Error stack:', error.stack);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '获取密钥列表失败',
      });
    }
  }

  /**
   * 创建新的API密钥
   * POST /api-builder/keys
   */
  async createKey(req, res) {
    try {
      const db = require('../../models');
      const { app_name } = req.body;
      const userId = req.user.id;

      if (!app_name || !app_name.trim()) {
        throw ApiError.badRequest('应用名称不能为空');
      }

      // 生成app_id (UUID)和app_key (随机字符串)
      const appId = crypto.randomUUID();
      const appKey = crypto.randomBytes(32).toString('hex');

      // 生成api_secret (HMAC-SHA256哈希)
      const apiSecret = crypto
        .createHmac('sha256', process.env.API_SECRET_KEY || 'your-secret-key')
        .update(appKey)
        .digest('hex');

      // 计算3天后的过期时间
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);

      const key = await db.ApiKey.create({
        id: appId,
        app_name: app_name.trim(),
        api_key: appKey,
        api_secret: apiSecret,
        expires_at: expiresAt,
        created_by: userId,
        interface_id: null, // 不关联特定接口
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: '密钥已创建',
        data: {
          id: key.id,
          app_name: key.app_name,
          api_key: key.api_key, // 只在创建时返回一次明文
          created_at: key.created_at,
        },
      });
    } catch (error) {
      logger.error('Error creating API key:', error.message, error.stack);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '创建密钥失败',
      });
    }
  }

  /**
   * 更新API密钥信息
   * PUT /api-builder/keys/:id
   */
  async updateKey(req, res) {
    try {
      const db = require('../../models');
      const { id } = req.params;
      const { app_name } = req.body;
      const userId = req.user.id;

      if (!app_name || !app_name.trim()) {
        throw ApiError.badRequest('应用名称不能为空');
      }

      const key = await db.ApiKey.findOne({
        where: {
          id,
          created_by: userId,
        },
      });

      if (!key) {
        throw ApiError.notFound('密钥不存在');
      }

      key.app_name = app_name.trim();
      await key.save();

      res.json({
        success: true,
        message: '密钥已更新',
        data: key,
      });
    } catch (error) {
      logger.error('Error updating API key:', error.message, error.stack);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '更新密钥失败',
      });
    }
  }

  /**
   * 删除API密钥
   * DELETE /api-builder/keys/:id
   */
  async deleteKey(req, res) {
    try {
      const db = require('../../models');
      const { id } = req.params;
      const userId = req.user.id;

      const key = await db.ApiKey.findOne({
        where: {
          id,
          created_by: userId,
        },
      });

      if (!key) {
        throw ApiError.notFound('密钥不存在');
      }

      await key.destroy();

      res.json({
        success: true,
        message: '密钥已删除',
      });
    } catch (error) {
      logger.error('Error deleting API key:', error.message, error.stack);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '删除密钥失败',
      });
    }
  }
}

module.exports = new ApiBuilderKeysController();