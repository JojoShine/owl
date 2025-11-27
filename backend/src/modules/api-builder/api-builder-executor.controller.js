const apiBuilderService = require('./api-builder.service');
const apiBuilderAuthService = require('./api-builder-auth.service');
const apiBuilderExecutorService = require('./api-builder-executor.service');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

class ApiBuilderExecutorController {
  /**
   * 测试接口
   * POST /api/api-builder/:id/test
   */
  async testInterface(req, res) {
    try {
      const { id } = req.params;
      const params = req.body.params || {};
      const userId = req.user.id;

      // 获取接口配置
      const interface_ = await apiBuilderService.getInterfaceById(id);

      // 执行测试
      const result = await apiBuilderExecutorService.testInterface(
        interface_,
        params,
        req.ip,
        null
      );

      res.json({
        success: true,
        message: '接口测试成功',
        data: {
          rows: result,
          rowCount: Array.isArray(result) ? result.length : 0,
        },
      });
    } catch (error) {
      logger.error('Error testing interface:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '接口测试失败',
      });
    }
  }

  /**
   * 执行动态API接口
   * GET/POST/PUT/DELETE /api/custom/:endpoint?version=1
   */
  async executeCustomApi(req, res) {
    try {
      const { endpoint } = req.params;
      const version = parseInt(req.query.version) || 1;
      const method = req.method;

      // 获取API密钥
      let apiKey = null;
      let apiKeyRecord = null;

      // 从认证中间件获取验证信息
      if (req.apiKey) {
        apiKey = req.apiKey;
        apiKeyRecord = req.apiKeyRecord;
      } else if (!req.user) {
        // 如果接口需要认证但没有认证信息，返回错误
        const interface_ = await this.findInterface(endpoint, version);
        if (interface_.require_auth) {
          throw ApiError.unauthorized('接口需要API密钥认证');
        }
      }

      // 查找接口配置
      const interface_ = await this.findInterface(endpoint, version, method);

      // 如果接口需要认证但没有提供密钥，返回错误
      if (interface_.require_auth && !apiKeyRecord) {
        throw ApiError.unauthorized('此接口需要有效的API密钥');
      }

      // 检查限流
      if (apiKeyRecord) {
        await apiBuilderExecutorService.checkRateLimit(interface_.id, apiKeyRecord.id);
      }

      // 收集参数（支持GET和POST）
      const params = {
        ...req.query,
        ...req.body,
      };

      // 移除内部参数
      delete params.version;
      delete params.api_key;

      // 执行接口
      const result = await apiBuilderExecutorService.executeInterface(
        interface_,
        params,
        req.ip
      );

      // 记录调用
      if (apiKeyRecord) {
        await apiKeyRecord.update({
          last_used_at: new Date(),
        });
      }

      res.json({
        success: true,
        message: '接口调用成功',
        data: result,
        meta: {
          endpoint: interface_.endpoint,
          version: interface_.version,
          rowCount: Array.isArray(result) ? result.length : 0,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error executing custom API:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '接口调用失败',
      });
    }
  }

  /**
   * 根据端点和版本查找接口
   */
  async findInterface(endpoint, version = 1, method = 'GET') {
    const db = require('../../models');
    const interface_ = await db.ApiInterface.findOne({
      where: {
        endpoint,
        version,
        status: 'active',
      },
    });

    if (!interface_) {
      throw ApiError.notFound(`接口不存在: ${endpoint} v${version}`);
    }

    // 检查请求方法是否匹配
    if (interface_.method !== method) {
      throw ApiError.badRequest(`接口不支持 ${method} 方法，仅支持 ${interface_.method}`);
    }

    return interface_;
  }
}

module.exports = new ApiBuilderExecutorController();
