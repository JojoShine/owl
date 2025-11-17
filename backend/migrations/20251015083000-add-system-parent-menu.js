'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 创建"系统管理"父菜单
    const systemMenuId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // 固定ID便于引用
    const now = new Date();

    await queryInterface.bulkInsert('menus', [{
      id: systemMenuId,
      parent_id: null,
      name: '系统管理',
      path: null, // 父菜单不需要路径
      component: null,
      icon: 'Settings',
      type: 'menu',
      visible: true,
      sort: 10, // 排在其他菜单后面
      status: 'active',
      permission_code: null,
      created_at: now,
      updated_at: now
    }]);

    // 2. 更新现有菜单，将它们设为"系统管理"的子菜单
    // 查找需要更新的菜单（用户管理、角色管理、权限管理、菜单管理）
    const [results] = await queryInterface.sequelize.query(
      `SELECT id, name FROM menus WHERE name IN ('用户管理', '角色管理', '权限管理', '菜单管理')`
    );

    if (results && results.length > 0) {
      const menuIds = results.map(r => `'${r.id}'`).join(',');

      await queryInterface.sequelize.query(
        `UPDATE menus SET parent_id = '${systemMenuId}', updated_at = NOW() WHERE id IN (${menuIds})`
      );
    }

    // 3. 将"系统管理"菜单分配给所有现有角色
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE status = 'active'`
    );

    if (roles && roles.length > 0) {
      const roleMenus = roles.map(role => ({
        role_id: role.id,
        menu_id: systemMenuId,
        created_at: now
      }));

      await queryInterface.bulkInsert('role_menus', roleMenus);
    }

    console.log('✅ 已添加"系统管理"父菜单，并更新子菜单关系');
  },

  down: async (queryInterface, Sequelize) => {
    const systemMenuId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

    // 1. 恢复子菜单的 parent_id 为 null
    await queryInterface.sequelize.query(
      `UPDATE menus SET parent_id = NULL WHERE parent_id = '${systemMenuId}'`
    );

    // 2. 删除角色-菜单关联
    await queryInterface.sequelize.query(
      `DELETE FROM role_menus WHERE menu_id = '${systemMenuId}'`
    );

    // 3. 删除"系统管理"菜单
    await queryInterface.sequelize.query(
      `DELETE FROM menus WHERE id = '${systemMenuId}'`
    );

    console.log('✅ 已回滚"系统管理"父菜单相关更改');
  }
};
