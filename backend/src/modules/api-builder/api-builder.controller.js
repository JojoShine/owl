const apiBuilderService = require('./api-builder.service');
const { logger } = require('../../config/logger');
const { success, created, paginated } = require('../../utils/response');

class ApiBuilderController {
  /**
   * 创建接口
   */
  async createInterface(req, res, next) {
    try {
      const data = req.body;
      const userId = req.user.id;

      const interface_ = await apiBuilderService.createInterface(data, userId);
      created(res, interface_.get({ plain: true }), '接口创建成功');
    } catch (error) {
      logger.error('Error creating interface:', error);
      next(error);
    }
  }

  /**
   * 获取接口列表
   */
  async getInterfaces(req, res, next) {
    try {
      const result = await apiBuilderService.getInterfaces(req.query);
      paginated(res, result.items, result.pagination, '获取接口列表成功');
    } catch (error) {
      logger.error('Error getting interfaces:', error);
      next(error);
    }
  }

  /**
   * 获取接口详情
   */
  async getInterface(req, res, next) {
    try {
      const { id } = req.params;
      const interface_ = await apiBuilderService.getInterfaceById(id);
      success(res, interface_.get({ plain: true }), '获取接口详情成功');
    } catch (error) {
      logger.error('Error getting interface:', error);
      next(error);
    }
  }

  /**
   * 更新接口
   */
  async updateInterface(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const interface_ = await apiBuilderService.updateInterface(id, data);
      success(res, interface_.get({ plain: true }), '接口更新成功');
    } catch (error) {
      logger.error('Error updating interface:', error);
      next(error);
    }
  }

  /**
   * 删除接口
   */
  async deleteInterface(req, res, next) {
    try {
      const { id } = req.params;
      const result = await apiBuilderService.deleteInterface(id);
      success(res, result, result.message);
    } catch (error) {
      logger.error('Error deleting interface:', error);
      next(error);
    }
  }

  /**
   * 创建API密钥
   */
  async createApiKey(req, res, next) {
    try {
      const { id } = req.params;
      const { app_name } = req.body;
      const userId = req.user.id;

      const key = await apiBuilderService.createApiKey(id, app_name, userId);
      created(res, key.get({ plain: true }), 'API密钥创建成功（3天有效期）');
    } catch (error) {
      logger.error('Error creating API key:', error);
      next(error);
    }
  }

  /**
   * 获取接口的密钥列表
   */
  async getInterfaceKeys(req, res, next) {
    try {
      const { id } = req.params;
      const keys = await apiBuilderService.getInterfaceKeys(id);
      success(res, keys.map(k => k.get({ plain: true })), '获取密钥列表成功');
    } catch (error) {
      logger.error('Error getting interface keys:', error);
      next(error);
    }
  }

  /**
   * 删除API密钥
   */
  async deleteApiKey(req, res, next) {
    try {
      const { keyId } = req.params;
      const result = await apiBuilderService.deleteApiKey(keyId);
      success(res, result, result.message);
    } catch (error) {
      logger.error('Error deleting API key:', error);
      next(error);
    }
  }

  /**
   * 重新生成API密钥
   */
  async regenerateApiKey(req, res, next) {
    try {
      const { keyId } = req.params;
      const key = await apiBuilderService.regenerateApiKey(keyId);
      success(res, key.get({ plain: true }), 'API密钥已重新生成（3天有效期）');
    } catch (error) {
      logger.error('Error regenerating API key:', error);
      next(error);
    }
  }

  /**
   * 测试SQL查询
   */
  async testSql(req, res) {
    try {
      const { sql_query, parameters } = req.body;

      if (!sql_query) {
        return res.status(400).json({
          success: false,
          message: '请输入SQL查询语句',
        });
      }

      const result = await apiBuilderService.testSql(sql_query, parameters || {});

      res.json({
        success: true,
        message: 'SQL查询成功',
        data: result,
      });
    } catch (error) {
      logger.error('Error testing SQL:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'SQL查询失败',
      });
    }
  }

  /**
   * 执行SQL查询（实际执行自定义API）
   */
  async executeSql(req, res) {
    try {
      const { sql_query, parameters } = req.body;

      if (!sql_query) {
        return res.status(400).json({
          success: false,
          message: '请输入SQL查询语句',
        });
      }

      const result = await apiBuilderService.executeSql(sql_query, parameters || {});

      res.json({
        success: true,
        message: '执行成功',
        data: result,
      });
    } catch (error) {
      logger.error('Error executing SQL:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'SQL执行失败',
      });
    }
  }
}

module.exports = new ApiBuilderController();
