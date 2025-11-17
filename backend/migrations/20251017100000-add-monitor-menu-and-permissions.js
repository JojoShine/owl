'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 固定ID便于引用
    const monitorParentId = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
    const monitorOverviewId = 'cccccccc-dddd-eeee-ffff-000000000001';

    // 1. 创建"监控系统"父菜单
    await queryInterface.bulkInsert('menus', [{
      id: monitorParentId,
      parent_id: null,
      name: '监控系统',
      path: null,
      component: null,
      icon: 'Activity',
      type: 'menu',
      visible: true,
      sort: 20,
      status: 'active',
      permission_code: null,
      created_at: now,
      updated_at: now
    }]);

    // 2. 创建"监控概览"子菜单
    await queryInterface.bulkInsert('menus', [{
      id: monitorOverviewId,
      parent_id: monitorParentId,
      name: '监控概览',
      path: '/monitor',
      component: null,
      icon: 'BarChart3',
      type: 'menu',
      visible: true,
      sort: 1,
      status: 'active',
      permission_code: 'monitor:read',
      created_at: now,
      updated_at: now
    }]);

    // 3. 添加监控相关权限
    const permissions = [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: '查看监控',
        code: 'monitor:read',
        resource: 'monitor',
        action: 'read',
        description: '查看系统监控数据',
        category: 'monitor',
        created_at: now,
        updated_at: now
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: '管理监控',
        code: 'monitor:manage',
        resource: 'monitor',
        action: 'manage',
        description: '管理监控配置和告警规则',
        category: 'monitor',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('permissions', permissions);

    // 4. 将"监控系统"菜单分配给所有现有角色
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE status = 'active'`
    );

    if (roles && roles.length > 0) {
      const roleMenus = [];

      roles.forEach(role => {
        // 添加父菜单
        roleMenus.push({
          role_id: role.id,
          menu_id: monitorParentId,
          created_at: now
        });

        // 添加子菜单
        roleMenus.push({
          role_id: role.id,
          menu_id: monitorOverviewId,
          created_at: now
        });
      });

      await queryInterface.bulkInsert('role_menus', roleMenus);
    }

    // 5. 将监控权限分配给所有现有角色
    const [monitorPermissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code IN ('monitor:read', 'monitor:manage')`
    );

    if (roles && roles.length > 0 && monitorPermissions && monitorPermissions.length > 0) {
      const rolePermissions = [];

      roles.forEach(role => {
        monitorPermissions.forEach(permission => {
          rolePermissions.push({
            role_id: role.id,
            permission_id: permission.id,
            created_at: now
          });
        });
      });

      await queryInterface.bulkInsert('role_permissions', rolePermissions);
    }

    console.log('✅ 已添加监控系统菜单和权限');
  },

  down: async (queryInterface, Sequelize) => {
    const monitorParentId = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
    const monitorOverviewId = 'cccccccc-dddd-eeee-ffff-000000000001';

    // 1. 删除角色-权限关联
    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions WHERE permission_id IN (
        SELECT id FROM permissions WHERE code IN ('monitor:read', 'monitor:manage')
      )`
    );

    // 2. 删除权限
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE code IN ('monitor:read', 'monitor:manage')`
    );

    // 3. 删除角色-菜单关联
    await queryInterface.sequelize.query(
      `DELETE FROM role_menus WHERE menu_id IN ('${monitorParentId}', '${monitorOverviewId}')`
    );

    // 4. 删除子菜单
    await queryInterface.sequelize.query(
      `DELETE FROM menus WHERE id = '${monitorOverviewId}'`
    );

    // 5. 删除父菜单
    await queryInterface.sequelize.query(
      `DELETE FROM menus WHERE id = '${monitorParentId}'`
    );

    console.log('✅ 已回滚监控系统菜单和权限');
  }
};
