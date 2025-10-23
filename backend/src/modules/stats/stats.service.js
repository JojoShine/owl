const { User, Role, Permission, Menu } = require('../../models');

/**
 * 统计服务
 * 提供各种统计数据查询
 */
class StatsService {
  /**
   * 获取首页仪表板统计数据
   */
  async getDashboardStats() {
    try {
      // 并行查询所有统计数据
      const [totalUsers, totalRoles, totalPermissions, totalMenus] = await Promise.all([
        User.count(),
        Role.count(),
        Permission.count(),
        Menu.count(),
      ]);

      return {
        totalUsers,
        totalRoles,
        totalPermissions,
        totalMenus,
      };
    } catch (error) {
      console.error('[Stats Service] Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * 获取用户统计数据
   */
  async getUserStats() {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { status: 'active' } });
      const inactiveUsers = await User.count({ where: { status: 'inactive' } });

      return {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
      };
    } catch (error) {
      console.error('[Stats Service] Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * 获取角色统计数据
   */
  async getRoleStats() {
    try {
      const totalRoles = await Role.count();
      const systemRoles = await Role.count({ where: { is_system: true } });
      const customRoles = await Role.count({ where: { is_system: false } });

      return {
        total: totalRoles,
        system: systemRoles,
        custom: customRoles,
      };
    } catch (error) {
      console.error('[Stats Service] Error fetching role stats:', error);
      throw error;
    }
  }
}

module.exports = new StatsService();
