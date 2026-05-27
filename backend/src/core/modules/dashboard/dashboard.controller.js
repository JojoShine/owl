/**
 * Dashboard Controller
 */

const dashboardService = require('./dashboard.service');
const { success } = require('../../../utils/response');
const { logger } = require('../../../config/logger');

class DashboardController {
  /**
   * 获取仪表板完整数据
   */
  async getDashboard(req, res, next) {
    try {
      const data = await dashboardService.getDashboardData();
      success(res, data, '获取仪表板数据成功');
    } catch (error) {
      logger.error('Dashboard错误:', error);
      next(error);
    }
  }

  /**
   * 获取指标数据
   */
  async getMetrics(req, res, next) {
    try {
      const data = await dashboardService.getMetrics();
      success(res, data, '获取指标数据成功');
    } catch (error) {
      logger.error('指标数据获取错误:', error);
      next(error);
    }
  }

  /**
   * 获取最近登录用户
   */
  async getRecentLogins(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const data = await dashboardService.getRecentLoginUsers(limit);
      success(res, data, '获取最近登录用户成功');
    } catch (error) {
      logger.error('最近登录用户获取错误:', error);
      next(error);
    }
  }

  /**
   * 获取在线用户
   */
  async getOnlineUsers(req, res, next) {
    try {
      const data = await dashboardService.getOnlineUsers();
      success(res, data, '获取在线用户成功');
    } catch (error) {
      logger.error('在线用户获取错误:', error);
      next(error);
    }
  }

  /**
   * 获取系统概览
   */
  async getSystemOverview(req, res, next) {
    try {
      const data = await dashboardService.getSystemOverview();
      success(res, data, '获取系统概览成功');
    } catch (error) {
      logger.error('系统概览获取错误:', error);
      next(error);
    }
  }

  /**
   * 获取存储概览
   */
  async getStorageOverview(req, res, next) {
    try {
      const data = await dashboardService.getStorageOverview();
      success(res, data, '获取存储概览成功');
    } catch (error) {
      logger.error('存储概览获取错误:', error);
      next(error);
    }
  }

  /**
   * 获取最近操作
   */
  async getRecentOperations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const data = await dashboardService.getRecentOperations(limit);
      success(res, data, '获取最近操作成功');
    } catch (error) {
      logger.error('最近操作获取错误:', error);
      next(error);
    }
  }

  /**
   * 获取访问趋势
   */
  async getAccessTrend(req, res, next) {
    try {
      const data = await dashboardService.getAccessTrend();
      success(res, data, '获取访问趋势成功');
    } catch (error) {
      logger.error('访问趋势获取错误:', error);
      next(error);
    }
  }
}

module.exports = new DashboardController();