const systemService = require('./system.service');
const applicationService = require('./application.service');
const databaseService = require('./database.service');
const cacheService = require('./cache.service');
const { success } = require('../../utils/response');

/**
 * 获取系统性能指标
 */
const getSystemMetrics = async (req, res, next) => {
  try {
    const metrics = await systemService.getSystemMetrics();
    return success(res, metrics, '获取系统指标成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取应用指标
 */
const getApplicationMetrics = async (req, res, next) => {
  try {
    const metrics = applicationService.getApplicationMetrics();
    return success(res, metrics, '获取应用指标成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取数据库指标
 */
const getDatabaseMetrics = async (req, res, next) => {
  try {
    const metrics = await databaseService.getDatabaseMetrics();
    return success(res, metrics, '获取数据库指标成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取缓存指标
 */
const getCacheMetrics = async (req, res, next) => {
  try {
    const metrics = await cacheService.getCacheMetrics();
    return success(res, metrics, '获取缓存指标成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有监控指标（综合）
 */
const getAllMetrics = async (req, res, next) => {
  try {
    const [system, application, database, cache] = await Promise.all([
      systemService.getSystemMetrics(),
      Promise.resolve(applicationService.getApplicationMetrics()),
      databaseService.getDatabaseMetrics(),
      cacheService.getCacheMetrics(),
    ]);

    return success(res, {
      system,
      application,
      database,
      cache,
      timestamp: new Date(),
    }, '获取综合指标成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemMetrics,
  getApplicationMetrics,
  getDatabaseMetrics,
  getCacheMetrics,
  getAllMetrics,
};
