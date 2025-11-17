'use strict';

const { v4: uuid } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 创建日志管理一级菜单
    const logMenuId = uuid();
    const logMenu = {
      id: logMenuId,
      parent_id: null,
      name: '日志管理',
      path: '/logs',
      icon: 'FileText',
      type: 'menu',
      visible: true,
      sort: 10,
      status: 'active',
      permission_code: 'log:read',
      created_at: now,
      updated_at: now
    };

    await queryInterface.bulkInsert('menus', [logMenu]);

    // 将菜单分配给所有角色
    const [roles] = await queryInterface.sequelize.query(
      'SELECT id FROM roles'
    );

    if (roles && roles.length > 0) {
      const roleMenus = roles.map(role => ({
        id: uuid(),
        role_id: role.id,
        menu_id: logMenuId,
        created_at: now,
      }));

      await queryInterface.bulkInsert('role_menus', roleMenus);
    }

    console.log('✅ 日志管理菜单添加完成！');
  },

  async down(queryInterface, Sequelize) {
    // 删除日志管理菜单
    await queryInterface.bulkDelete('menus', {
      path: '/logs',
    });
  },
};
