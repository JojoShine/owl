'use strict';

// Simple UUID generator for CommonJS
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. 创建文件管理相关权限
    const filePermissions = [
      // 文件夹管理权限
      { id: uuidv4(), name: '查看文件夹', code: 'folder:read', resource: 'folder', action: 'read', description: '查看文件夹列表和详情', category: '文件管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '创建文件夹', code: 'folder:create', resource: 'folder', action: 'create', description: '创建新文件夹', category: '文件管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '更新文件夹', code: 'folder:update', resource: 'folder', action: 'update', description: '更新文件夹信息', category: '文件管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '删除文件夹', code: 'folder:delete', resource: 'folder', action: 'delete', description: '删除文件夹', category: '文件管理', created_at: now, updated_at: now },

      // 文件管理权限 (使用 AccessControl 支持的标准 CRUD 操作)
      { id: uuidv4(), name: '查看文件', code: 'file:read', resource: 'file', action: 'read', description: '查看、下载和预览文件', category: '文件管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '上传文件', code: 'file:create', resource: 'file', action: 'create', description: '上传和创建文件', category: '文件管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '更新文件', code: 'file:update', resource: 'file', action: 'update', description: '更新文件信息（重命名、移动、复制）', category: '文件管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '删除文件', code: 'file:delete', resource: 'file', action: 'delete', description: '删除文件', category: '文件管理', created_at: now, updated_at: now },

      // 文件分享权限
      { id: uuidv4(), name: '分享文件', code: 'file:share', resource: 'file-share', action: 'create', description: '创建文件分享链接', category: '文件管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '查看分享', code: 'file-share:read', resource: 'file-share', action: 'read', description: '查看文件分享列表', category: '文件管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '删除分享', code: 'file-share:delete', resource: 'file-share', action: 'delete', description: '删除文件分享', category: '文件管理', created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('permissions', filePermissions);

    // 保存权限ID用于后续关联
    const permissionIds = {};
    filePermissions.forEach(p => {
      permissionIds[p.code] = p.id;
    });

    // 2. 创建文件管理菜单
    const fileMenuId = uuidv4();

    const fileMenus = [
      // 一级菜单 - 文件管理
      {
        id: fileMenuId,
        parent_id: null,
        name: '文件管理',
        path: '/files',
        icon: 'FolderOpen',
        type: 'menu',
        visible: true,
        sort: 2, // 排在概览和系统管理之后
        status: 'active',
        permission_code: 'file:read', // 需要有查看文件权限
        created_at: now,
        updated_at: now
      },
    ];

    await queryInterface.bulkInsert('menus', fileMenus);

    // 3. 获取角色ID
    const roles = await queryInterface.sequelize.query(
      `SELECT id, code FROM roles WHERE code IN ('super_admin', 'admin')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const superAdminRole = roles.find(r => r.code === 'super_admin');
    const adminRole = roles.find(r => r.code === 'admin');

    if (!superAdminRole || !adminRole) {
      console.error('❌ 找不到管理员角色，请先运行基础数据初始化脚本');
      return;
    }

    // 4. 为超级管理员分配所有文件管理权限
    const superAdminPermissions = Object.values(permissionIds).map(permissionId => ({
      role_id: superAdminRole.id,
      permission_id: permissionId,
      created_at: now,
    }));

    await queryInterface.bulkInsert('role_permissions', superAdminPermissions);

    // 5. 为管理员分配所有文件管理权限
    const adminPermissions = Object.values(permissionIds).map(permissionId => ({
      role_id: adminRole.id,
      permission_id: permissionId,
      created_at: now,
    }));

    await queryInterface.bulkInsert('role_permissions', adminPermissions);

    // 6. 为所有角色分配文件管理菜单
    const allRoles = await queryInterface.sequelize.query(
      `SELECT id FROM roles`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const roleMenus = allRoles.map(role => ({
      role_id: role.id,
      menu_id: fileMenuId,
      created_at: now,
    }));

    await queryInterface.bulkInsert('role_menus', roleMenus);

    console.log('✅ 文件管理数据初始化完成！');
    console.log('');
    console.log('📁 文件管理权限：');
    console.log('   - 文件夹：查看、创建、更新、删除');
    console.log('   - 文件：查看、上传、下载、预览、更新、删除、移动、复制');
    console.log('   - 分享：创建、查看、删除');
    console.log('');
    console.log('📋 文件管理菜单已添加到导航栏');
    console.log('🔐 超级管理员和管理员已获得所有文件管理权限');
  },

  async down(queryInterface, Sequelize) {
    // 删除文件管理相关的数据
    await queryInterface.sequelize.query(
      `DELETE FROM role_menus WHERE menu_id IN (SELECT id FROM menus WHERE path = '/files')`
    );

    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE category = '文件管理')`
    );

    await queryInterface.sequelize.query(
      `DELETE FROM menus WHERE path = '/files'`
    );

    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE category = '文件管理'`
    );
  }
};
