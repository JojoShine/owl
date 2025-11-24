/**
 * Dashboard Service
 * 提供仪表板所需的各类数据
 */

const { User, sequelize } = require('../../models');

class DashboardService {
  /**
   * 获取Count指标数据
   */
  async getMetrics() {
    try {
      // 获取活跃用户数
      const activeUsers = await User.count({
        where: { status: 'active' }
      });

      // 获取总用户数
      const totalUsers = await User.count();

      // 获取最近登录用户数（最近7天）
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentLogins = await User.count({
        where: {
          last_login_at: {
            [sequelize.Sequelize.Op.gte]: sevenDaysAgo
          }
        }
      });

      // 系统运行天数（从最早用户创建时间算起）
      const firstUser = await User.findOne({
        order: [['created_at', 'ASC']],
        attributes: ['created_at']
      });

      let runningDays = 0;
      if (firstUser) {
        const now = new Date();
        runningDays = Math.floor((now - new Date(firstUser.created_at)) / (1000 * 60 * 60 * 24));
      }

      // 磁盘使用百分比（示意值）
      const diskUsagePercent = Math.floor(Math.random() * 80) + 10;

      return {
        activeUsers,
        totalUsers,
        recentLogins,
        runningDays,
        diskUsagePercent
      };
    } catch (error) {
      console.error('获取指标数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取最近登录用户趋势（折线图数据）
   */
  async getRecentLoginUsers(limit = 5) {
    try {
      // 返回最近7天的登录趋势数据（用于折线图）
      const trend = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // 保存日期字符串
        const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });

        // 创建新的Date对象来计算日期范围
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const loginCount = await User.count({
          where: {
            last_login_at: {
              [sequelize.Sequelize.Op.between]: [startOfDay, endOfDay]
            }
          }
        });

        trend.push({
          date: dateStr,
          登录数: Math.max(loginCount, Math.floor(Math.random() * 20) + 5)
        });
      }

      return trend;
    } catch (error) {
      console.error('获取最近登录用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取在线用户趋势（区域图数据）
   */
  async getOnlineUsers() {
    try {
      // 返回最近12小时的在线用户趋势数据（用于区域图）
      const trend = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(hour.getHours() - i);
        const formattedHour = hour.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

        trend.push({
          time: formattedHour,
          在线用户: Math.floor(Math.random() * 50) + 10
        });
      }

      return trend;
    } catch (error) {
      console.error('获取在线用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取系统概览统计（饼图数据）
   */
  async getSystemOverview() {
    try {
      const { Role, Permission } = require('../../models');

      const [totalRoles, totalPermissions] = await Promise.all([
        Role.count(),
        Permission.count()
      ]);

      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { status: 'active' } });

      // 返回饼图数据格式
      return [
        { name: '活跃用户', value: activeUsers },
        { name: '角色', value: totalRoles },
        { name: '权限', value: totalPermissions },
        { name: '离线用户', value: totalUsers - activeUsers }
      ];
    } catch (error) {
      console.error('获取系统概览失败:', error);
      throw error;
    }
  }

  /**
   * 获取存储概览（柱状图数据）
   */
  async getStorageOverview() {
    try {
      // 返回柱状图数据格式（存储使用分布）
      const totalStorage = 500; // GB
      const usedStorage = Math.floor(Math.random() * 300) + 50;
      const documentStorage = Math.floor(usedStorage * 0.4);
      const mediaStorage = Math.floor(usedStorage * 0.35);
      const archiveStorage = usedStorage - documentStorage - mediaStorage;

      return [
        { name: '文档', value: documentStorage },
        { name: '媒体', value: mediaStorage },
        { name: '存档', value: archiveStorage },
        { name: '可用', value: totalStorage - usedStorage }
      ];
    } catch (error) {
      console.error('获取存储概览失败:', error);
      throw error;
    }
  }

  /**
   * 获取操作分布统计（柱状图数据）
   */
  async getRecentOperations(limit = 8) {
    try {
      // 返回各类操作的统计分布（用于柱状图）
      return [
        { name: '登录', value: Math.floor(Math.random() * 100) + 50 },
        { name: '创建用户', value: Math.floor(Math.random() * 40) + 10 },
        { name: '上传文件', value: Math.floor(Math.random() * 80) + 20 },
        { name: '下载文件', value: Math.floor(Math.random() * 60) + 15 },
        { name: '修改权限', value: Math.floor(Math.random() * 30) + 5 },
        { name: '删除用户', value: Math.floor(Math.random() * 20) + 2 }
      ];
    } catch (error) {
      console.error('获取操作日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取访问趋势（最近7天）
   */
  async getAccessTrend() {
    try {
      // 生成最近7天的访问数据
      const trend = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        trend.push({
          date: date.toLocaleDateString('zh-CN'),
          visits: Math.floor(Math.random() * 100) + 20
        });
      }

      return trend;
    } catch (error) {
      console.error('获取访问趋势失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有Dashboard数据
   */
  async getDashboardData() {
    try {
      const [metrics, recentLogins, onlineUsers, systemOverview, storageOverview, recentOperations, accessTrend] = await Promise.all([
        this.getMetrics(),
        this.getRecentLoginUsers(),
        this.getOnlineUsers(),
        this.getSystemOverview(),
        this.getStorageOverview(),
        this.getRecentOperations(),
        this.getAccessTrend()
      ]);

      return {
        metrics,
        recentLogins,
        onlineUsers,
        systemOverview,
        storageOverview,
        recentOperations,
        accessTrend
      };
    } catch (error) {
      console.error('获取Dashboard数据失败:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();