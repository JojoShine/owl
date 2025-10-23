'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 监控系统父菜单 ID（与之前的迁移保持一致）
    const monitorParentId = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
    const alertMenuId = 'cccccccc-dddd-eeee-ffff-000000000003';

    // 1. 添加"告警管理"子菜单
    await queryInterface.bulkInsert('menus', [{
      id: alertMenuId,
      parent_id: monitorParentId,
      name: '告警管理',
      path: '/monitor/alerts',
      component: null,
      icon: 'Bell',
      type: 'menu',
      visible: true,
      sort: 3,
      status: 'active',
      permission_code: 'monitor:manage',
      created_at: now,
      updated_at: now
    }]);

    // 2. 将"告警管理"菜单分配给所有现有角色
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE status = 'active'`
    );

    if (roles && roles.length > 0) {
      const roleMenus = roles.map(role => ({
        role_id: role.id,
        menu_id: alertMenuId,
        created_at: now
      }));

      await queryInterface.bulkInsert('role_menus', roleMenus);
    }

    console.log('✅ 已添加告警管理菜单');
  },

  down: async (queryInterface, Sequelize) => {
    const alertMenuId = 'cccccccc-dddd-eeee-ffff-000000000003';

    // 1. 删除角色-菜单关联
    await queryInterface.sequelize.query(
      `DELETE FROM role_menus WHERE menu_id = '${alertMenuId}'`
    );

    // 2. 删除菜单
    await queryInterface.sequelize.query(
      `DELETE FROM menus WHERE id = '${alertMenuId}'`
    );

    console.log('✅ 已回滚告警管理菜单');
  }
};
