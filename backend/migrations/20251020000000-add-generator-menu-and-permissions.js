'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 检查并添加代码生成器相关权限（只添加不存在的）
    const permissionCodes = ['generator:read', 'generator:create', 'generator:update', 'generator:delete'];
    const [existingPermissions] = await queryInterface.sequelize.query(
      `SELECT code FROM permissions WHERE code IN ('generator:read', 'generator:create', 'generator:update', 'generator:delete')`
    );

    const existingCodes = existingPermissions.map(p => p.code);

    const permissions = [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'generator:read',
        name: '查看代码生成器',
        resource: 'generator',
        action: 'read',
        description: '查看代码生成器配置和历史',
        category: '代码生成',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'generator:create',
        name: '创建代码',
        resource: 'generator',
        action: 'create',
        description: '初始化配置和生成代码',
        category: '代码生成',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'generator:update',
        name: '更新配置',
        resource: 'generator',
        action: 'update',
        description: '更新模块配置',
        category: '代码生成',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        code: 'generator:delete',
        name: '删除配置',
        resource: 'generator',
        action: 'delete',
        description: '删除模块配置和生成的代码',
        category: '代码生成',
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

    // 3. 检查并添加代码生成器菜单（只添加不存在的）
    const [existingMenus] = await queryInterface.sequelize.query(
      `SELECT path FROM menus WHERE path = '/generator'`
    );

    const existingPaths = existingMenus.map(m => m.path);

    const menus = [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: '代码生成器',
        path: '/generator',
        icon: 'Code',
        type: 'menu',
        parent_id: systemMenuId,
        sort: 90,
        status: 'active',
        visible: true,
        permission_code: 'generator:read',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ].filter(m => !existingPaths.includes(m.path));

    if (menus.length > 0) {
      await queryInterface.bulkInsert('menus', menus);
    }

    // 4. 获取所有权限ID
    const [generatorPermissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code IN ('generator:read', 'generator:create', 'generator:update', 'generator:delete')`
    );

    // 5. 获取管理员角色（只给管理员权限）
    const [adminRoles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE code IN ('admin', 'super_admin')`
    );

    if (adminRoles.length === 0) {
      console.log('警告: 未找到管理员角色，跳过权限分配');
      return;
    }

    // 6. 为管理员角色分配代码生成器权限
    const rolePermissions = [];
    adminRoles.forEach(role => {
      generatorPermissions.forEach(permission => {
        rolePermissions.push({
          id: Sequelize.literal('gen_random_uuid()'),
          role_id: role.id,
          permission_id: permission.id,
          created_at: new Date(),
        });
      });
    });

    if (rolePermissions.length > 0) {
      // 检查是否已存在（避免重复插入）
      for (const rp of rolePermissions) {
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM role_permissions WHERE role_id = '${rp.role_id}' AND permission_id = '${rp.permission_id}'`
        );
        if (existing.length === 0) {
          await queryInterface.bulkInsert('role_permissions', [rp]);
        }
      }
    }

    // 7. 获取代码生成器菜单ID
    const [generatorMenus] = await queryInterface.sequelize.query(
      `SELECT id FROM menus WHERE path = '/generator'`
    );

    // 8. 为管理员角色分配菜单
    const roleMenus = [];
    adminRoles.forEach(role => {
      generatorMenus.forEach(menu => {
        roleMenus.push({
          id: Sequelize.literal('gen_random_uuid()'),
          role_id: role.id,
          menu_id: menu.id,
          created_at: new Date(),
        });
      });
    });

    if (roleMenus.length > 0) {
      // 检查是否已存在（避免重复插入）
      for (const rm of roleMenus) {
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM role_menus WHERE role_id = '${rm.role_id}' AND menu_id = '${rm.menu_id}'`
        );
        if (existing.length === 0) {
          await queryInterface.bulkInsert('role_menus', [rm]);
        }
      }
    }

    console.log('代码生成器菜单和权限添加成功');
  },

  down: async (queryInterface, Sequelize) => {
    // 删除菜单
    await queryInterface.sequelize.query(
      `DELETE FROM menus WHERE path = '/generator'`
    );

    // 删除权限
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE code IN ('generator:read', 'generator:create', 'generator:update', 'generator:delete')`
    );
  }
};
