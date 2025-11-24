/**
 * Dashboard Controller
 */

const dashboardService = require('./dashboard.service');

class DashboardController {
  /**
   * 获取仪表板完整数据
   */
  async getDashboard(req, res) {
    try {
      const data = await dashboardService.getDashboardData();

      res.json({
        success: true,
        data,
        message: '获取仪表板数据成功'
      });
    } catch (error) {
      console.error('Dashboard错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取仪表板数据失败'
      });
    }
  }

  /**
   * 获取指标数据
   */
  async getMetrics(req, res) {
    try {
      const data = await dashboardService.getMetrics();

      res.json({
        success: true,
        data,
        message: '获取指标数据成功'
      });
    } catch (error) {
      console.error('指标数据获取错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取指标数据失败'
      });
    }
  }

  /**
   * 获取最近登录用户
   */
  async getRecentLogins(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const data = await dashboardService.getRecentLoginUsers(limit);

      res.json({
        success: true,
        data,
        message: '获取最近登录用户成功'
      });
    } catch (error) {
      console.error('最近登录用户获取错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取最近登录用户失败'
      });
    }
  }

  /**
   * 获取在线用户
   */
  async getOnlineUsers(req, res) {
    try {
      const data = await dashboardService.getOnlineUsers();

      res.json({
        success: true,
        data,
        message: '获取在线用户成功'
      });
    } catch (error) {
      console.error('在线用户获取错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取在线用户失败'
      });
    }
  }

  /**
   * 获取系统概览
   */
  async getSystemOverview(req, res) {
    try {
      const data = await dashboardService.getSystemOverview();

      res.json({
        success: true,
        data,
        message: '获取系统概览成功'
      });
    } catch (error) {
      console.error('系统概览获取错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取系统概览失败'
      });
    }
  }

  /**
   * 获取存储概览
   */
  async getStorageOverview(req, res) {
    try {
      const data = await dashboardService.getStorageOverview();

      res.json({
        success: true,
        data,
        message: '获取存储概览成功'
      });
    } catch (error) {
      console.error('存储概览获取错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取存储概览失败'
      });
    }
  }

  /**
   * 获取最近操作
   */
  async getRecentOperations(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const data = await dashboardService.getRecentOperations(limit);

      res.json({
        success: true,
        data,
        message: '获取最近操作成功'
      });
    } catch (error) {
      console.error('最近操作获取错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取最近操作失败'
      });
    }
  }

  /**
   * 获取访问趋势
   */
  async getAccessTrend(req, res) {
    try {
      const data = await dashboardService.getAccessTrend();

      res.json({
        success: true,
        data,
        message: '获取访问趋势成功'
      });
    } catch (error) {
      console.error('访问趋势获取错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取访问趋势失败'
      });
    }
  }
}

module.exports = new DashboardController();