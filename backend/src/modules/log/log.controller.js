const logService = require('./log.service');
const { success } = require('../../utils/response');

class LogController {
  /**
   * 获取操作日志
   * GET /api/logs/operations
   */
  async getOperationLogs(req, res, next) {
    try {
      const result = await logService.getOperationLogs(req.query);
      success(res, result, '获取操作日志成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取登录日志
   * GET /api/logs/logins
   */
  async getLoginLogs(req, res, next) {
    try {
      const result = await logService.getLoginLogs(req.query);
      success(res, result, '获取登录日志成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取系统日志
   * GET /api/logs/system
   */
  async getSystemLogs(req, res, next) {
    try {
      const result = await logService.getSystemLogs(req.query);
      success(res, result, '获取系统日志成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取访问日志
   * GET /api/logs/access
   */
  async getAccessLogs(req, res, next) {
    try {
      const result = await logService.getAccessLogs(req.query);
      success(res, result, '获取访问日志成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取错误日志
   * GET /api/logs/errors
   */
  async getErrorLogs(req, res, next) {
    try {
      const result = await logService.getErrorLogs(req.query);
      success(res, result, '获取错误日志成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取日志统计
   * GET /api/logs/stats
   */
  async getStats(req, res, next) {
    try {
      const { type, startDate, endDate } = req.query;
      const result = await logService.getStats(type, startDate, endDate);
      success(res, result, '获取日志统计成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 导出日志
   * POST /api/logs/export
   */
  async exportLogs(req, res, next) {
    try {
      const { type, format = 'json', ...query } = req.body;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: '请指定日志类型',
        });
      }

      const data = await logService.exportLogs(type, query, format);

      if (format === 'csv') {
        // 返回CSV文件
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=logs-${type}-${Date.now()}.csv`);
        return res.send('\uFEFF' + data); // 添加BOM以支持Excel正确显示中文
      }

      // 返回JSON文件
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=logs-${type}-${Date.now()}.json`);
      return res.send(JSON.stringify(data, null, 2));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LogController();