const apiBuilderService = require('./api-builder.service');
const { logger } = require('../../config/logger');

class ApiBuilderController {
  /**
   * 创建接口
   */
  async createInterface(req, res) {
    try {
      const data = req.body;
      const userId = req.user.id;

      const interface_ = await apiBuilderService.createInterface(data, userId);

      res.status(201).json({
        success: true,
        message: '接口创建成功',
        data: interface_,
      });
    } catch (error) {
      logger.error('Error creating interface:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '创建接口失败',
      });
    }
  }

  /**
   * 获取接口列表
   */
  async getInterfaces(req, res) {
    try {
      const result = await apiBuilderService.getInterfaces(req.query);

      res.json({
        success: true,
        message: '获取接口列表成功',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error getting interfaces:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '获取接口列表失败',
      });
    }
  }

  /**
   * 获取接口详情
   */
  async getInterface(req, res) {
    try {
      const { id } = req.params;
      const interface_ = await apiBuilderService.getInterfaceById(id);

      res.json({
        success: true,
        message: '获取接口详情成功',
        data: interface_,
      });
    } catch (error) {
      logger.error('Error getting interface:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '获取接口详情失败',
      });
    }
  }

  /**
   * 更新接口
   */
  async updateInterface(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const interface_ = await apiBuilderService.updateInterface(id, data);

      res.json({
        success: true,
        message: '接口更新成功',
        data: interface_,
      });
    } catch (error) {
      logger.error('Error updating interface:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '更新接口失败',
      });
    }
  }

  /**
   * 删除接口
   */
  async deleteInterface(req, res) {
    try {
      const { id } = req.params;
      const result = await apiBuilderService.deleteInterface(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error deleting interface:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '删除接口失败',
      });
    }
  }

  /**
   * 创建API密钥
   */
  async createApiKey(req, res) {
    try {
      const { id } = req.params;
      const { app_name } = req.body;
      const userId = req.user.id;

      const key = await apiBuilderService.createApiKey(id, app_name, userId);

      res.status(201).json({
        success: true,
        message: 'API密钥创建成功（3天有效期）',
        data: key,
      });
    } catch (error) {
      logger.error('Error creating API key:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '创建API密钥失败',
      });
    }
  }

  /**
   * 获取接口的密钥列表
   */
  async getInterfaceKeys(req, res) {
    try {
      const { id } = req.params;
      const keys = await apiBuilderService.getInterfaceKeys(id);

      res.json({
        success: true,
        message: '获取密钥列表成功',
        data: keys,
      });
    } catch (error) {
      logger.error('Error getting interface keys:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '获取密钥列表失败',
      });
    }
  }

  /**
   * 删除API密钥
   */
  async deleteApiKey(req, res) {
    try {
      const { keyId } = req.params;
      const result = await apiBuilderService.deleteApiKey(keyId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error deleting API key:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '删除API密钥失败',
      });
    }
  }

  /**
   * 重新生成API密钥
   */
  async regenerateApiKey(req, res) {
    try {
      const { keyId } = req.params;
      const key = await apiBuilderService.regenerateApiKey(keyId);

      res.json({
        success: true,
        message: 'API密钥已重新生成（3天有效期）',
        data: key,
      });
    } catch (error) {
      logger.error('Error regenerating API key:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '重新生成API密钥失败',
      });
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
}

module.exports = new ApiBuilderController();
