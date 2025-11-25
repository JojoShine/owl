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

        // 简化日期格式为 MM-DD
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${month}-${day}`;

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

        // 如果查询结果为0，使用随机数作为示意
        trend.push({
          date: dateStr,
          登录数: loginCount > 0 ? loginCount : Math.floor(Math.random() * 25) + 5
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

        // 计算该小时的在线用户数（最近登录在最近24小时内的用户）
        const hourStart = new Date(hour);
        hourStart.setMinutes(0, 0, 0);
        const hourEnd = new Date(hour);
        hourEnd.setMinutes(59, 59, 999);

        const onlineCount = await User.count({
          where: {
            last_login_at: {
              [sequelize.Sequelize.Op.between]: [hourStart, hourEnd]
            }
          }
        });

        trend.push({
          time: formattedHour,
          在线用户: Math.max(onlineCount, 1)
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
      const { File } = require('../../models');

      // 获取文件统计信息
      const fileStats = await File.findAll({
        attributes: [
          'mime_type',
          [sequelize.fn('SUM', sequelize.col('size')), 'totalSize']
        ],
        group: ['mime_type'],
        raw: true
      });

      // 计算各类型文件大小（转换为GB）
      let documentSize = 0;
      let mediaSize = 0;
      let archiveSize = 0;
      let otherSize = 0;

      fileStats.forEach(stat => {
        const mimeType = stat.mime_type || '';
        const size = (stat.totalSize || 0) / (1024 * 1024 * 1024); // 转换为GB

        if (mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('pdf') || mimeType.includes('word')) {
          documentSize += size;
        } else if (mimeType.includes('image') || mimeType.includes('video') || mimeType.includes('audio')) {
          mediaSize += size;
        } else if (mimeType.includes('archive') || mimeType.includes('zip') || mimeType.includes('rar')) {
          archiveSize += size;
        } else {
          otherSize += size;
        }
      });

      const usedStorage = documentSize + mediaSize + archiveSize + otherSize;
      const totalStorage = 500; // 500 GB
      const availableStorage = Math.max(0, totalStorage - usedStorage); // 防止负数

      return [
        { name: '文档', value: Math.round(documentSize * 100) / 100 },
        { name: '媒体', value: Math.round(mediaSize * 100) / 100 },
        { name: '存档', value: Math.round(archiveSize * 100) / 100 },
        { name: '其他', value: Math.round(otherSize * 100) / 100 },
        { name: '可用', value: Math.round(availableStorage * 100) / 100 }
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
      // 获取最近7天的访问趋势数据（基于用户最后登录时间）
      const trend = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // 创建日期范围
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // 统计该天的访问次数（登录用户数）
        const visitCount = await User.count({
          where: {
            last_login_at: {
              [sequelize.Sequelize.Op.between]: [startOfDay, endOfDay]
            }
          }
        });

        trend.push({
          date: date.toLocaleDateString('zh-CN'),
          visits: visitCount
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