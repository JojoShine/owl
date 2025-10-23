const statsService = require('./stats.service');
const { success } = require('../../utils/response');

/**
 * 获取首页仪表板统计数据
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await statsService.getDashboardStats();
    return success(res, stats, '获取仪表板统计数据成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户统计数据
 */
const getUserStats = async (req, res, next) => {
  try {
    const stats = await statsService.getUserStats();
    return success(res, stats, '获取用户统计数据成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取角色统计数据
 */
const getRoleStats = async (req, res, next) => {
  try {
    const stats = await statsService.getRoleStats();
    return success(res, stats, '获取角色统计数据成功');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUserStats,
  getRoleStats,
};
