'use strict';

const { v4: uuid } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 创建日志管理权限 (只使用AccessControl支持的标准action: create, read, update, delete)
    const permissions = [
      {
        id: uuid(),
        name: '查看日志',
        code: 'log:read',
        resource: 'log',
        action: 'read',
        description: '查看系统日志',
        category: '日志管理',
        created_at: now,
      },
      {
        id: uuid(),
        name: '创建日志',
        code: 'log:create',
        resource: 'log',
        action: 'create',
        description: '创建和导出日志',
        category: '日志管理',
        created_at: now,
      },
      {
        id: uuid(),
        name: '更新日志',
        code: 'log:update',
        resource: 'log',
        action: 'update',
        description: '更新和配置日志设置',
        category: '日志管理',
        created_at: now,
      },
      {
        id: uuid(),
        name: '删除日志',
        code: 'log:delete',
        resource: 'log',
        action: 'delete',
        description: '删除和清理日志',
        category: '日志管理',
        created_at: now,
      },
    ];

    await queryInterface.bulkInsert('permissions', permissions);

    // 将日志权限分配给管理员角色
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE code = 'admin' LIMIT 1`
    );

    if (adminRole && adminRole.length > 0) {
      const roleId = adminRole[0].id;

      const rolePermissions = permissions.map(permission => ({
        id: uuid(),
        role_id: roleId,
        permission_id: permission.id,
        created_at: now,
      }));

      await queryInterface.bulkInsert('role_permissions', rolePermissions);
    }
  },

  async down(queryInterface, Sequelize) {
    // 删除日志权限
    await queryInterface.bulkDelete('permissions', {
      code: {
        [Sequelize.Op.in]: ['log:read', 'log:create', 'log:update', 'log:delete'],
      },
    });
  },
};
