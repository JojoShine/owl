const apiMonitorService = require('./api-monitor.service');
const { success } = require('../../utils/response');

/**
 * 获取所有监控配置列表
 */
const getAllMonitors = async (req, res, next) => {
  try {
    const { page, limit, enabled } = req.query;
    const result = await apiMonitorService.getAllMonitors({ page, limit, enabled });
    return success(res, result, '获取监控列表成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 根据 ID 获取监控配置
 */
const getMonitorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const monitor = await apiMonitorService.getMonitorById(id);
    return success(res, monitor, '获取监控配置成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 创建监控配置
 */
const createMonitor = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user.id, // 从认证中间件获取当前用户 ID
    };
    const monitor = await apiMonitorService.createMonitor(data);
    return success(res, monitor, '创建监控配置成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新监控配置
 */
const updateMonitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const monitor = await apiMonitorService.updateMonitor(id, req.body);
    return success(res, monitor, '更新监控配置成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除监控配置
 */
const deleteMonitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await apiMonitorService.deleteMonitor(id);
    return success(res, result, '删除监控配置成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 立即测试接口
 */
const testApi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await apiMonitorService.testApi(id);
    return success(res, log, '接口测试完成');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取监控日志
 */
const getMonitorLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, status, startDate, endDate } = req.query;
    const result = await apiMonitorService.getMonitorLogs(id, {
      page,
      limit,
      status,
      startDate,
      endDate,
    });
    return success(res, result, '获取监控日志成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取监控统计信息
 */
const getMonitorStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;
    const stats = await apiMonitorService.getMonitorStats(id, parseInt(hours));
    return success(res, stats, '获取监控统计成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMonitors,
  getMonitorById,
  createMonitor,
  updateMonitor,
  deleteMonitor,
  testApi,
  getMonitorLogs,
  getMonitorStats,
};
