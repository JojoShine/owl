'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. 获取admin和super_admin角色
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, code FROM roles WHERE code IN ('admin', 'super_admin')`
    );

    if (roles.length === 0) {
      console.log('警告: 未找到admin或super_admin角色，跳过权限修复');
      return;
    }

    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.code] = role.id;
    });

    // 2. 首先添加email_template的标准CRUD权限（如果不存在）
    const emailTemplatePermissions = [
      { code: 'email_template:read', name: '查看邮件模板', resource: 'email_template', action: 'read', description: '查看邮件模板列表和详情', category: '邮件管理' },
      { code: 'email_template:create', name: '创建邮件模板', resource: 'email_template', action: 'create', description: '创建新邮件模板', category: '邮件管理' },
      { code: 'email_template:update', name: '更新邮件模板', resource: 'email_template', action: 'update', description: '更新邮件模板', category: '邮件管理' },
      { code: 'email_template:delete', name: '删除邮件模板', resource: 'email_template', action: 'delete', description: '删除邮件模板', category: '邮件管理' },
    ];

    for (const perm of emailTemplatePermissions) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = '${perm.code}'`
      );

      if (existing.length === 0) {
        await queryInterface.sequelize.query(
          `INSERT INTO permissions (id, code, name, resource, action, description, category, created_at, updated_at)
           VALUES (gen_random_uuid(), '${perm.code}', '${perm.name}', '${perm.resource}', '${perm.action}', '${perm.description}', '${perm.category}', NOW(), NOW())`
        );
      }
    }

    // 3. 获取需要修复的权限（日志模块 + 邮件模板模块）
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id, code FROM permissions WHERE code IN (
        'log:read', 'log:export', 'log:backup', 'log:config',
        'email_template:read', 'email_template:create', 'email_template:update', 'email_template:delete'
      )`
    );

    if (permissions.length === 0) {
      console.log('警告: 未找到需要修复的权限，跳过');
      return;
    }

    // 3. 获取现有的role_permissions关联
    const [existingRolePermissions] = await queryInterface.sequelize.query(
      `SELECT role_id, permission_id FROM role_permissions`
    );

    const existingSet = new Set(
      existingRolePermissions.map(rp => `${rp.role_id}_${rp.permission_id}`)
    );

    // 4. 构建需要插入的role_permissions
    const rolePermissionsToInsert = [];

    roles.forEach(role => {
      permissions.forEach(permission => {
        const key = `${role.id}_${permission.id}`;

        // 只插入不存在的关联
        if (!existingSet.has(key)) {
          rolePermissionsToInsert.push({
            id: Sequelize.literal('gen_random_uuid()'),
            role_id: role.id,
            permission_id: permission.id,
            created_at: now,
          });
        }
      });
    });

    // 5. 批量插入
    if (rolePermissionsToInsert.length > 0) {
      await queryInterface.bulkInsert('role_permissions', rolePermissionsToInsert);
      console.log(`成功为admin和super_admin添加了 ${rolePermissionsToInsert.length} 条权限关联`);
    } else {
      console.log('所有权限关联已存在，无需添加');
    }
  },

  async down(queryInterface) {
    // 回滚：删除本次添加的权限关联和新增的权限
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE code IN ('admin', 'super_admin')`
    );

    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code IN (
        'log:read', 'log:export', 'log:backup', 'log:config',
        'email_template:read', 'email_template:create', 'email_template:update', 'email_template:delete'
      )`
    );

    if (roles.length > 0 && permissions.length > 0) {
      const roleIds = roles.map(r => `'${r.id}'`).join(',');
      const permissionIds = permissions.map(p => `'${p.id}'`).join(',');

      await queryInterface.sequelize.query(
        `DELETE FROM role_permissions
         WHERE role_id IN (${roleIds})
         AND permission_id IN (${permissionIds})`
      );

      // 删除本次migration新增的email_template权限
      await queryInterface.sequelize.query(
        `DELETE FROM permissions WHERE code IN (
          'email_template:read', 'email_template:create',
          'email_template:update', 'email_template:delete'
        )`
      );

      console.log('已回滚权限关联和新增的权限');
    }
  }
};
