'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 检查并添加通知相关权限（只添加不存在的）
    const permissionCodes = [
      'notification:read', 'notification:manage', 'email:send',
      'email_template:read', 'email_template:create', 'email_template:update', 'email_template:delete'
    ];
    const [existingPermissions] = await queryInterface.sequelize.query(
      `SELECT code FROM permissions WHERE code IN (${permissionCodes.map(c => `'${c}'`).join(', ')})`
    );

    const existingCodes = existingPermissions.map(p => p.code);

    const permissions = [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'notification:read',
        name: '查看通知',
        resource: 'notification',
        action: 'read',
        description: '查看站内通知',
        category: '通知管理',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'notification:manage',
        name: '管理通知',
        resource: 'notification',
        action: 'manage',
        description: '发送和管理通知',
        category: '通知管理',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'email:send',
        name: '发送邮件',
        resource: 'email',
        action: 'send',
        description: '发送邮件和查看邮件日志',
        category: '邮件管理',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'email_template:read',
        name: '查看邮件模板',
        resource: 'email_template',
        action: 'read',
        description: '查看邮件模板列表和详情',
        category: '邮件管理',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'email_template:create',
        name: '创建邮件模板',
        resource: 'email_template',
        action: 'create',
        description: '创建新邮件模板',
        category: '邮件管理',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'email_template:update',
        name: '更新邮件模板',
        resource: 'email_template',
        action: 'update',
        description: '更新邮件模板信息',
        category: '邮件管理',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'email_template:delete',
        name: '删除邮件模板',
        resource: 'email_template',
        action: 'delete',
        description: '删除邮件模板',
        category: '邮件管理',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ].filter(p => !existingCodes.includes(p.code));

    if (permissions.length > 0) {
      await queryInterface.bulkInsert('permissions', permissions);
    }

    // 2. 查询系统一级菜单ID
    const [systemMenus] = await queryInterface.sequelize.query(
      `SELECT id FROM menus WHERE name = '系统管理' AND parent_id IS NULL LIMIT 1`
    );

    if (systemMenus.length === 0) {
      console.log('警告: 未找到"系统管理"菜单，跳过菜单创建');
      return;
    }

    const systemMenuId = systemMenus[0].id;

    // 3. 检查并添加通知相关菜单（只添加不存在的）
    const [existingMenus] = await queryInterface.sequelize.query(
      `SELECT path FROM menus WHERE path IN ('/notifications', '/setting/email-templates', '/setting/notification-settings')`
    );

    const existingPaths = existingMenus.map(m => m.path);

    const menus = [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: '消息中心',
        path: '/notifications',
        icon: 'Bell',
        type: 'menu',
        parent_id: null,
        sort: 25,
        status: 'active',
        visible: true,
        permission_code: 'notification:read',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: '邮件模板',
        path: '/setting/email-templates',
        icon: 'Mail',
        type: 'menu',
        parent_id: systemMenuId,
        sort: 80,
        status: 'active',
        visible: true,
        permission_code: 'email_template:read',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: '通知设置',
        path: '/setting/notification-settings',
        icon: 'Settings',
        type: 'menu',
        parent_id: systemMenuId,
        sort: 85,
        status: 'active',
        visible: true,
        permission_code: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ].filter(m => !existingPaths.includes(m.path));

    if (menus.length > 0) {
      await queryInterface.bulkInsert('menus', menus);
    }

    // 4. 获取所有权限ID
    const [notificationPermissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code IN (${permissionCodes.map(c => `'${c}'`).join(', ')})`
    );

    // 5. 获取所有角色
    const [roles] = await queryInterface.sequelize.query(`SELECT id FROM roles`);

    // 6. 为所有角色分配通知权限
    const rolePermissions = [];
    roles.forEach(role => {
      notificationPermissions.forEach(permission => {
        rolePermissions.push({
          id: Sequelize.literal('gen_random_uuid()'),
          role_id: role.id,
          permission_id: permission.id,
          created_at: new Date(),
        });
      });
    });

    if (rolePermissions.length > 0) {
      await queryInterface.bulkInsert('role_permissions', rolePermissions);
    }

    // 7. 获取所有菜单ID（消息中心、邮件模板、通知设置）
    const [notificationMenus] = await queryInterface.sequelize.query(
      `SELECT id FROM menus WHERE path IN ('/notifications', '/setting/email-templates', '/setting/notification-settings')`
    );

    // 8. 为所有角色分配菜单
    const roleMenus = [];
    roles.forEach(role => {
      notificationMenus.forEach(menu => {
        roleMenus.push({
          id: Sequelize.literal('gen_random_uuid()'),
          role_id: role.id,
          menu_id: menu.id,
          created_at: new Date(),
        });
      });
    });

    if (roleMenus.length > 0) {
      await queryInterface.bulkInsert('role_menus', roleMenus);
    }

    console.log('通知系统菜单和权限添加成功');
  },

  down: async (queryInterface, Sequelize) => {
    // 删除菜单
    await queryInterface.sequelize.query(
      `DELETE FROM menus WHERE path IN ('/notifications', '/setting/email-templates', '/setting/notification-settings')`
    );

    // 删除权限
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE code IN ('notification:read', 'notification:manage', 'email:send', 'email_template:read', 'email_template:create', 'email_template:update', 'email_template:delete')`
    );
  }
};
