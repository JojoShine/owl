'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 系统管理父菜单 ID
    const systemParentId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const apiBuilderMenuId = 'dddddddd-eeee-ffff-0000-111111111111';

    // 1. 添加"接口开发"菜单
    await queryInterface.bulkInsert('menus', [{
      id: apiBuilderMenuId,
      parent_id: systemParentId,
      name: '接口开发',
      path: '/setting/api-builder',
      component: null,
      icon: 'Code',
      type: 'menu',
      visible: true,
      sort: 7,
      status: 'active',
      permission_code: 'api-builder:manage',
      created_at: now,
      updated_at: now
    }]);

    // 2. 将"接口开发"菜单分配给所有现有角色
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE status = 'active'`
    );

    if (roles && roles.length > 0) {
      const roleMenus = roles.map(role => ({
        role_id: role.id,
        menu_id: apiBuilderMenuId,
        created_at: now
      }));

      await queryInterface.bulkInsert('role_menus', roleMenus);
    }

    console.log('✅ 已添加接口开发菜单');
  },

  down: async (queryInterface, Sequelize) => {
    const apiBuilderMenuId = 'dddddddd-eeee-ffff-0000-111111111111';

    // 1. 删除角色-菜单关联
    await queryInterface.sequelize.query(
      `DELETE FROM role_menus WHERE menu_id = '${apiBuilderMenuId}'`
    );

    // 2. 删除菜单
    await queryInterface.sequelize.query(
      `DELETE FROM menus WHERE id = '${apiBuilderMenuId}'`
    );

    console.log('✅ 已回滚接口开发菜单');
  }
};