const genericService = require('./generic.service');
const { success, paginated } = require('../../utils/response');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

/**
 * 通用控制器 - 配置驱动
 * 处理所有动态模块的HTTP请求
 * 无需生成代码文件，实现零重启
 */
class GenericController {
  /**
   * 获取列表（分页 + 搜索）
   * GET /api/:modulePath
   */
  async list(req, res, next) {
    try {
      const moduleConfig = req.moduleConfig;

      if (!moduleConfig) {
        throw ApiError.internal('模块配置未加载');
      }

      const result = await genericService.list(moduleConfig, req.query);

      paginated(res, result.data, result.pagination, `获取${moduleConfig.description}列表成功`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取详情
   * GET /api/:modulePath/:id
   */
  async getById(req, res, next) {
    try {
      const moduleConfig = req.moduleConfig;

      if (!moduleConfig) {
        throw ApiError.internal('模块配置未加载');
      }

      const item = await genericService.getById(moduleConfig, req.params.id);

      success(res, item, `获取${moduleConfig.description}详情成功`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建记录
   * POST /api/:modulePath
   */
  async create(req, res, next) {
    try {
      const moduleConfig = req.moduleConfig;

      if (!moduleConfig) {
        throw ApiError.internal('模块配置未加载');
      }

      const item = await genericService.create(moduleConfig, req.body);

      success(res, item, `创建${moduleConfig.description}成功`, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新记录
   * PUT /api/:modulePath/:id
   */
  async update(req, res, next) {
    try {
      const moduleConfig = req.moduleConfig;

      if (!moduleConfig) {
        throw ApiError.internal('模块配置未加载');
      }

      const item = await genericService.update(moduleConfig, req.params.id, req.body);

      success(res, item, `更新${moduleConfig.description}成功`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除记录
   * DELETE /api/:modulePath/:id
   */
  async delete(req, res, next) {
    try {
      const moduleConfig = req.moduleConfig;

      if (!moduleConfig) {
        throw ApiError.internal('模块配置未加载');
      }

      const result = await genericService.delete(moduleConfig, req.params.id);

      success(res, result, `删除${moduleConfig.description}成功`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量删除
   * DELETE /api/:modulePath/batch
   */
  async batchDelete(req, res, next) {
    try {
      const moduleConfig = req.moduleConfig;

      if (!moduleConfig) {
        throw ApiError.internal('模块配置未加载');
      }

      const { ids } = req.body;
      const result = await genericService.batchDelete(moduleConfig, ids);

      success(res, result, `批量删除${moduleConfig.description}成功`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 导出数据
   * GET /api/:modulePath/export
   */
  async export(req, res, next) {
    try {
      const moduleConfig = req.moduleConfig;

      if (!moduleConfig) {
        throw ApiError.internal('模块配置未加载');
      }

      const items = await genericService.export(moduleConfig, req.query);

      success(res, items, `导出${moduleConfig.description}数据成功`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GenericController();
