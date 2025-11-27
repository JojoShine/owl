const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');
const crypto = require('crypto');

class ApiBuilderService {
  /**
   * 创建接口
   */
  async createInterface(data, userId) {
    const { name, description, sql_query, method, endpoint, version, parameters, require_auth, rate_limit } = data;

    try {
      const interface_ = await db.ApiInterface.create({
        name,
        description,
        sql_query,
        method: method || 'GET',
        endpoint,
        version: version || 1,
        parameters: parameters || null,
        require_auth: require_auth !== false,
        rate_limit: rate_limit || 1000,
        created_by: userId,
      });

      logger.info(`Interface created: ${interface_.id} by user ${userId}`);
      return interface_;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw ApiError.badRequest(`接口端点 ${endpoint} 版本 ${version || 1} 已存在`);
      }
      throw error;
    }
  }

  /**
   * 获取接口列表
   */
  async getInterfaces(query) {
    const { page = 1, limit = 10, search, status } = query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.$or = [
        { name: { $iLike: `%${search}%` } },
        { endpoint: { $iLike: `%${search}%` } },
      ];
    }

    const { count, rows } = await db.ApiInterface.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'real_name'],
        },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    return {
      items: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * 获取接口详情
   */
  async getInterfaceById(id) {
    const interface_ = await db.ApiInterface.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'real_name'],
        },
        {
          model: db.ApiKey,
          as: 'keys',
          attributes: ['id', 'app_name', 'api_key', 'status', 'expires_at', 'created_at'],
        },
      ],
    });

    if (!interface_) {
      throw ApiError.notFound('接口不存在');
    }

    return interface_;
  }

  /**
   * 更新接口
   */
  async updateInterface(id, data) {
    const interface_ = await this.getInterfaceById(id);

    const { name, description, sql_query, method, endpoint, version, parameters, status, require_auth, rate_limit } = data;

    try {
      await interface_.update({
        name: name !== undefined ? name : interface_.name,
        description: description !== undefined ? description : interface_.description,
        sql_query: sql_query !== undefined ? sql_query : interface_.sql_query,
        method: method !== undefined ? method : interface_.method,
        endpoint: endpoint !== undefined ? endpoint : interface_.endpoint,
        version: version !== undefined ? version : interface_.version,
        parameters: parameters !== undefined ? parameters : interface_.parameters,
        status: status !== undefined ? status : interface_.status,
        require_auth: require_auth !== undefined ? require_auth : interface_.require_auth,
        rate_limit: rate_limit !== undefined ? rate_limit : interface_.rate_limit,
      });

      logger.info(`Interface updated: ${id}`);
      return interface_;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw ApiError.badRequest(`接口端点 ${endpoint} 版本 ${version} 已存在`);
      }
      throw error;
    }
  }

  /**
   * 删除接口
   */
  async deleteInterface(id) {
    const interface_ = await this.getInterfaceById(id);
    await interface_.destroy();

    logger.info(`Interface deleted: ${id}`);
    return { message: '接口已删除' };
  }

  /**
   * 创建API密钥（3天过期）
   */
  async createApiKey(interfaceId, appName, userId) {
    const interface_ = await this.getInterfaceById(interfaceId);

    // 生成API Key和Secret
    const apiKey = this.generateApiKey();
    const apiSecret = crypto
      .createHmac('sha256', process.env.API_SECRET_KEY || 'your-secret-key')
      .update(apiKey)
      .digest('hex');

    // 3天后过期
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const key = await db.ApiKey.create({
      interface_id: interfaceId,
      app_name: appName,
      api_key: apiKey,
      api_secret: apiSecret,
      expires_at: expiresAt,
      created_by: userId,
    });

    logger.info(`API key created for interface ${interfaceId}`);
    return key;
  }

  /**
   * 获取接口的密钥列表
   */
  async getInterfaceKeys(interfaceId) {
    await this.getInterfaceById(interfaceId);

    const keys = await db.ApiKey.findAll({
      where: { interface_id: interfaceId },
      attributes: ['id', 'app_name', 'api_key', 'status', 'expires_at', 'last_used_at', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    return keys;
  }

  /**
   * 删除API密钥
   */
  async deleteApiKey(keyId) {
    const key = await db.ApiKey.findByPk(keyId);
    if (!key) {
      throw ApiError.notFound('API密钥不存在');
    }

    await key.destroy();
    logger.info(`API key deleted: ${keyId}`);
    return { message: 'API密钥已删除' };
  }

  /**
   * 重新生成API密钥
   */
  async regenerateApiKey(keyId) {
    const key = await db.ApiKey.findByPk(keyId);
    if (!key) {
      throw ApiError.notFound('API密钥不存在');
    }

    const apiKey = this.generateApiKey();
    const apiSecret = crypto
      .createHmac('sha256', process.env.API_SECRET_KEY || 'your-secret-key')
      .update(apiKey)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await key.update({
      api_key: apiKey,
      api_secret: apiSecret,
      expires_at: expiresAt,
    });

    logger.info(`API key regenerated: ${keyId}`);
    return key;
  }

  /**
   * 验证API密钥
   */
  async verifyApiKey(apiKey) {
    const key = await db.ApiKey.findOne({
      where: { api_key: apiKey },
      include: [
        {
          model: db.ApiInterface,
          as: 'interface',
          attributes: ['id', 'endpoint', 'method', 'sql_query', 'parameters', 'require_auth', 'rate_limit'],
        },
      ],
    });

    if (!key) {
      throw ApiError.unauthorized('无效的API密钥');
    }

    if (key.status === 'inactive') {
      throw ApiError.forbidden('API密钥已禁用');
    }

    // 检查过期时间
    if (key.expires_at < new Date()) {
      await key.update({ status: 'inactive' });
      throw ApiError.forbidden('API密钥已过期');
    }

    // 更新最后使用时间
    await key.update({ last_used_at: new Date() });

    return key;
  }

  /**
   * 生成随机API密钥
   */
  generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 测试SQL查询
   */
  async testSql(sql_query, parameters = {}) {
    try {
      // 验证SQL是否为SELECT语句
      const trimmedSql = sql_query.trim().toUpperCase();
      if (!trimmedSql.startsWith('SELECT')) {
        throw ApiError.badRequest('仅支持SELECT查询');
      }

      // 使用原始SQL执行查询（Sequelize通过sequelize.query）
      const sequelize = db.sequelize;
      const results = await sequelize.query(sql_query, {
        replacements: parameters,
        type: require('sequelize').QueryTypes.SELECT,
      });

      // 提取列名信息
      const columns = results && results.length > 0
        ? Object.keys(results[0]).map(key => ({
            name: key,
            type: typeof results[0][key],
          }))
        : [];

      return {
        success: true,
        columns,
        rowCount: results ? results.length : 0,
        sample: results ? results.slice(0, 5) : [], // 返回前5条数据作为示例
      };
    } catch (error) {
      logger.error('Error testing SQL:', error);
      if (error.statusCode) {
        throw error;
      }
      throw ApiError.badRequest(`SQL执行失败: ${error.message}`);
    }
  }
}

module.exports = new ApiBuilderService();
