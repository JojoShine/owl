/**
 * 生成完整 seeder 文件的脚本
 * 基于 data-export.json 生成
 */

const fs = require('fs').promises;
const path = require('path');

// Simple UUID generator
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function generateSeeder() {
  console.log('🚀 开始生成完整 seeder 文件...\n');

  try {
    // 读取导出的数据
    const dataPath = path.join(__dirname, '../data-export.json');
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

    // 生成 seeder 内容
    const seederContent = `'use strict';

const bcrypt = require('bcryptjs');

// Simple UUID generator for CommonJS
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 完整的系统初始化数据
 * 包含所有权限、菜单、角色、部门、邮件模板和测试账号
 *
 * 生成时间: ${new Date().toISOString()}
 * 数据来源: 开发环境导出
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // ==========================================
    // 1. 创建权限 (${data.permissions.length} 条)
    // ==========================================
    const permissions = ${JSON.stringify(data.permissions, null, 6)
      .split('\n')
      .map((line, i) => i === 0 ? line : '    ' + line)
      .join('\n')
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/: "([^"]+)"/g, (match, p1) => {
        // 保持特殊字段为字符串
        if (['code', 'name', 'resource', 'action', 'category', 'description'].some(key => match.includes(key))) {
          return match;
        }
        return match;
      })};

    // 为每个权限添加 ID 和时间戳
    const permissionsWithMeta = permissions.map(p => ({
      id: uuidv4(),
      ...p,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('permissions', permissionsWithMeta);

    // 保存权限ID映射
    const permissionIds = {};
    permissionsWithMeta.forEach(p => {
      permissionIds[p.code] = p.id;
    });

    // ==========================================
    // 2. 创建角色 (${data.roles.length} 条)
    // ==========================================
    const roles = ${JSON.stringify(data.roles, null, 6)
      .split('\n')
      .map((line, i) => i === 0 ? line : '    ' + line)
      .join('\n')};

    const superAdminRoleId = uuidv4();
    const adminRoleId = uuidv4();
    const userRoleId = uuidv4();

    const rolesWithMeta = [
      { id: superAdminRoleId, ...roles.find(r => r.code === 'super_admin'), created_at: now, updated_at: now },
      { id: adminRoleId, ...roles.find(r => r.code === 'admin'), created_at: now, updated_at: now },
      { id: userRoleId, ...roles.find(r => r.code === 'user'), created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('roles', rolesWithMeta);

    // ==========================================
    // 3. 创建菜单 (${data.menus.length} 条)
    // ==========================================

    // 先创建父菜单
    const systemMenuId = uuidv4();
    const monitorMenuId = uuidv4();

    const parentMenus = [
      {
        id: uuidv4(),
        parent_id: null,
        name: '概览',
        path: '/dashboard',
        component: null,
        icon: 'LayoutDashboard',
        type: 'menu',
        visible: true,
        sort: 0,
        status: 'active',
        permission_code: null,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: null,
        name: '文件管理',
        path: '/files',
        component: null,
        icon: 'FolderOpen',
        type: 'menu',
        visible: true,
        sort: 2,
        status: 'active',
        permission_code: 'file:read',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: null,
        name: '日志管理',
        path: '/logs',
        component: null,
        icon: 'FileText',
        type: 'menu',
        visible: true,
        sort: 10,
        status: 'active',
        permission_code: 'log:read',
        created_at: now,
        updated_at: now
      },
      {
        id: monitorMenuId,
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
      },
      {
        id: uuidv4(),
        parent_id: null,
        name: '消息中心',
        path: '/notifications',
        component: null,
        icon: 'Bell',
        type: 'menu',
        visible: true,
        sort: 25,
        status: 'active',
        permission_code: 'notification:read',
        created_at: now,
        updated_at: now
      },
      {
        id: systemMenuId,
        parent_id: null,
        name: '系统管理',
        path: '',
        component: null,
        icon: 'Settings',
        type: 'menu',
        visible: true,
        sort: 99,
        status: 'active',
        permission_code: null,
        created_at: now,
        updated_at: now
      },
    ];

    await queryInterface.bulkInsert('menus', parentMenus);

    // 子菜单
    const childMenus = [
      // 监控系统子菜单
      {
        id: uuidv4(),
        parent_id: monitorMenuId,
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
      },
      {
        id: uuidv4(),
        parent_id: monitorMenuId,
        name: '接口监控',
        path: '/monitor/apis',
        component: null,
        icon: 'Network',
        type: 'menu',
        visible: true,
        sort: 2,
        status: 'active',
        permission_code: 'monitor:manage',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: monitorMenuId,
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
      },
      // 系统管理子菜单
      {
        id: uuidv4(),
        parent_id: systemMenuId,
        name: '用户管理',
        path: '/setting/users',
        component: 'UsersPage',
        icon: 'Users',
        type: 'menu',
        visible: true,
        sort: 1,
        status: 'active',
        permission_code: 'user:read',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: systemMenuId,
        name: '角色管理',
        path: '/setting/roles',
        component: 'RolesPage',
        icon: 'Shield',
        type: 'menu',
        visible: true,
        sort: 2,
        status: 'active',
        permission_code: 'role:read',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: systemMenuId,
        name: '权限管理',
        path: '/setting/permissions',
        component: 'PermissionsPage',
        icon: 'Key',
        type: 'menu',
        visible: true,
        sort: 3,
        status: 'active',
        permission_code: 'permission:read',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: systemMenuId,
        name: '菜单管理',
        path: '/setting/menus',
        component: 'MenusPage',
        icon: 'MenuIcon',
        type: 'menu',
        visible: true,
        sort: 4,
        status: 'active',
        permission_code: 'menu:read',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: systemMenuId,
        name: '部门管理',
        path: '/setting/departments',
        component: 'DepartmentsPage',
        icon: 'Building2',
        type: 'menu',
        visible: true,
        sort: 5,
        status: 'active',
        permission_code: 'department:read',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: systemMenuId,
        name: '邮件模板',
        path: '/setting/email-templates',
        component: null,
        icon: 'Mail',
        type: 'menu',
        visible: true,
        sort: 80,
        status: 'active',
        permission_code: 'email_template:read',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: systemMenuId,
        name: '通知设置',
        path: '/setting/notification-settings',
        component: null,
        icon: 'Settings',
        type: 'menu',
        visible: true,
        sort: 85,
        status: 'active',
        permission_code: null,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        parent_id: systemMenuId,
        name: '代码生成器',
        path: '/generator',
        component: null,
        icon: 'Code',
        type: 'menu',
        visible: true,
        sort: 90,
        status: 'active',
        permission_code: 'generator:read',
        created_at: now,
        updated_at: now
      },
    ];

    await queryInterface.bulkInsert('menus', childMenus);

    const allMenus = [...parentMenus, ...childMenus];

    // ==========================================
    // 4. 创建角色-权限关联
    // ==========================================

    const rolePermissions = [];

    // super_admin 拥有所有权限
    permissionsWithMeta.forEach(p => {
      rolePermissions.push({
        id: uuidv4(),
        role_id: superAdminRoleId,
        permission_id: p.id,
        created_at: now
      });
    });

    // admin 拥有除 permission 管理外的所有权限
    permissionsWithMeta
      .filter(p => !p.code.startsWith('permission:'))
      .forEach(p => {
        rolePermissions.push({
          id: uuidv4(),
          role_id: adminRoleId,
          permission_id: p.id,
          created_at: now
        });
      });

    // user 只有查看权限
    const userPermissionCodes = [
      'user:read', 'role:read', 'permission:read', 'menu:read', 'department:read',
      'monitor:read', 'monitor:manage', 'notification:read', 'notification:manage',
      'email_template:read', 'email_template:create', 'email_template:update', 'email_template:delete',
      'email:send'
    ];
    permissionsWithMeta
      .filter(p => userPermissionCodes.includes(p.code))
      .forEach(p => {
        rolePermissions.push({
          id: uuidv4(),
          role_id: userRoleId,
          permission_id: p.id,
          created_at: now
        });
      });

    await queryInterface.bulkInsert('role_permissions', rolePermissions);

    // ==========================================
    // 5. 创建角色-菜单关联
    // ==========================================

    const roleMenus = [];

    // 所有角色都能看到所有菜单
    [superAdminRoleId, adminRoleId, userRoleId].forEach(roleId => {
      allMenus.forEach(menu => {
        roleMenus.push({
          id: uuidv4(),
          role_id: roleId,
          menu_id: menu.id,
          created_at: now
        });
      });
    });

    await queryInterface.bulkInsert('role_menus', roleMenus);

    // ==========================================
    // 6. 创建部门 (${data.departments.length} 条)
    // ==========================================

    const techDeptId = uuidv4();
    const marketDeptId = uuidv4();

    const departments = [
      {
        id: techDeptId,
        parent_id: null,
        name: '技术部',
        code: 'TECH',
        leader_id: null,
        description: '负责公司技术研发工作',
        sort: 1,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: marketDeptId,
        parent_id: null,
        name: '市场部',
        code: 'MARKET',
        leader_id: null,
        description: '负责市场推广和销售',
        sort: 2,
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('departments', departments);

    // ==========================================
    // 7. 创建用户 (3 个测试账号)
    // ==========================================

    const superAdminUserId = uuidv4();
    const adminUserId = uuidv4();
    const normalUserId = uuidv4();

    const users = [
      {
        id: superAdminUserId,
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        real_name: '超级管理员',
        phone: '13800138000',
        department_id: techDeptId,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: adminUserId,
        username: 'manager',
        email: 'manager@example.com',
        password: await bcrypt.hash('manager123', 10),
        real_name: '管理员',
        phone: '13800138001',
        department_id: techDeptId,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: normalUserId,
        username: 'user',
        email: 'user@example.com',
        password: await bcrypt.hash('user123', 10),
        real_name: '普通用户',
        phone: '13800138002',
        department_id: marketDeptId,
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', users);

    // 更新部门负责人
    await queryInterface.bulkUpdate('departments',
      { leader_id: superAdminUserId },
      { id: techDeptId }
    );

    // ==========================================
    // 8. 创建用户-角色关联
    // ==========================================

    const userRoles = [
      { id: uuidv4(), user_id: superAdminUserId, role_id: superAdminRoleId, created_at: now },
      { id: uuidv4(), user_id: adminUserId, role_id: adminRoleId, created_at: now },
      { id: uuidv4(), user_id: normalUserId, role_id: userRoleId, created_at: now }
    ];

    await queryInterface.bulkInsert('user_roles', userRoles);

    // ==========================================
    // 9. 创建邮件模板 (${data.emailTemplates.length} 条)
    // ==========================================

    const emailTemplates = ${JSON.stringify(data.emailTemplates, null, 6)
      .split('\n')
      .map((line, i) => i === 0 ? line : '    ' + line)
      .join('\n')};

    const emailTemplatesWithMeta = emailTemplates.map(t => ({
      id: uuidv4(),
      ...t,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('email_templates', emailTemplatesWithMeta);

    // ==========================================
    // 完成
    // ==========================================

    console.log('✅ 完整系统数据初始化完成！');
    console.log('');
    console.log('📊 数据统计:');
    console.log(\`   - 权限: \${permissionsWithMeta.length} 条\`);
    console.log(\`   - 角色: \${rolesWithMeta.length} 条\`);
    console.log(\`   - 菜单: \${allMenus.length} 条\`);
    console.log(\`   - 部门: \${departments.length} 条\`);
    console.log(\`   - 用户: \${users.length} 条\`);
    console.log(\`   - 邮件模板: \${emailTemplatesWithMeta.length} 条\`);
    console.log('');
  },

  async down(queryInterface, Sequelize) {
    // 按照外键依赖的反序删除
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('role_menus', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('email_templates', null, {});
    await queryInterface.bulkDelete('departments', null, {});
    await queryInterface.bulkDelete('menus', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
`;

    // 保存 seeder 文件
    const outputPath = path.join(__dirname, '../seeders/99999999999999-init-complete-data.js');
    await fs.writeFile(outputPath, seederContent, 'utf-8');

    console.log(`✅ Seeder 文件已生成: ${outputPath}\n`);
    console.log('📊 包含数据:');
    console.log(`   - 权限: ${data.permissions.length} 条`);
    console.log(`   - 菜单: ${data.menus.length} 条`);
    console.log(`   - 角色: ${data.roles.length} 条`);
    console.log(`   - 部门: ${data.departments.length} 条`);
    console.log(`   - 邮件模板: ${data.emailTemplates.length} 条`);
    console.log('   - 测试账号: 3 个');
    console.log('');
    console.log('🎉 生成完成!\n');

  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

// 执行生成
generateSeeder();
