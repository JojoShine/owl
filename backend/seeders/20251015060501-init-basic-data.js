'use strict';

const bcrypt = require('bcryptjs');

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

    // 1. 创建权限
    const permissions = [
      // 用户管理权限
      { id: uuidv4(), name: '查看用户', code: 'user:read', resource: 'user', action: 'read', description: '查看用户列表和详情', category: '用户管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '创建用户', code: 'user:create', resource: 'user', action: 'create', description: '创建新用户', category: '用户管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '更新用户', code: 'user:update', resource: 'user', action: 'update', description: '更新用户信息', category: '用户管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '删除用户', code: 'user:delete', resource: 'user', action: 'delete', description: '删除用户', category: '用户管理', created_at: now, updated_at: now },

      // 角色管理权限
      { id: uuidv4(), name: '查看角色', code: 'role:read', resource: 'role', action: 'read', description: '查看角色列表和详情', category: '角色管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '创建角色', code: 'role:create', resource: 'role', action: 'create', description: '创建新角色', category: '角色管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '更新角色', code: 'role:update', resource: 'role', action: 'update', description: '更新角色信息', category: '角色管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '删除角色', code: 'role:delete', resource: 'role', action: 'delete', description: '删除角色', category: '角色管理', created_at: now, updated_at: now },

      // 权限管理权限
      { id: uuidv4(), name: '查看权限', code: 'permission:read', resource: 'permission', action: 'read', description: '查看权限列表和详情', category: '权限管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '创建权限', code: 'permission:create', resource: 'permission', action: 'create', description: '创建新权限', category: '权限管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '更新权限', code: 'permission:update', resource: 'permission', action: 'update', description: '更新权限信息', category: '权限管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '删除权限', code: 'permission:delete', resource: 'permission', action: 'delete', description: '删除权限', category: '权限管理', created_at: now, updated_at: now },

      // 菜单管理权限
      { id: uuidv4(), name: '查看菜单', code: 'menu:read', resource: 'menu', action: 'read', description: '查看菜单列表和详情', category: '菜单管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '创建菜单', code: 'menu:create', resource: 'menu', action: 'create', description: '创建新菜单', category: '菜单管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '更新菜单', code: 'menu:update', resource: 'menu', action: 'update', description: '更新菜单信息', category: '菜单管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '删除菜单', code: 'menu:delete', resource: 'menu', action: 'delete', description: '删除菜单', category: '菜单管理', created_at: now, updated_at: now },

      // 部门管理权限
      { id: uuidv4(), name: '查看部门', code: 'department:read', resource: 'department', action: 'read', description: '查看部门列表和详情', category: '部门管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '创建部门', code: 'department:create', resource: 'department', action: 'create', description: '创建新部门', category: '部门管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '更新部门', code: 'department:update', resource: 'department', action: 'update', description: '更新部门信息', category: '部门管理', created_at: now, updated_at: now },
      { id: uuidv4(), name: '删除部门', code: 'department:delete', resource: 'department', action: 'delete', description: '删除部门', category: '部门管理', created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('permissions', permissions);

    // 保存权限ID用于后续关联
    const permissionIds = {
      'user:read': permissions.find(p => p.code === 'user:read').id,
      'user:create': permissions.find(p => p.code === 'user:create').id,
      'user:update': permissions.find(p => p.code === 'user:update').id,
      'user:delete': permissions.find(p => p.code === 'user:delete').id,
      'role:read': permissions.find(p => p.code === 'role:read').id,
      'role:create': permissions.find(p => p.code === 'role:create').id,
      'role:update': permissions.find(p => p.code === 'role:update').id,
      'role:delete': permissions.find(p => p.code === 'role:delete').id,
      'permission:read': permissions.find(p => p.code === 'permission:read').id,
      'permission:create': permissions.find(p => p.code === 'permission:create').id,
      'permission:update': permissions.find(p => p.code === 'permission:update').id,
      'permission:delete': permissions.find(p => p.code === 'permission:delete').id,
      'menu:read': permissions.find(p => p.code === 'menu:read').id,
      'menu:create': permissions.find(p => p.code === 'menu:create').id,
      'menu:update': permissions.find(p => p.code === 'menu:update').id,
      'menu:delete': permissions.find(p => p.code === 'menu:delete').id,
      'department:read': permissions.find(p => p.code === 'department:read').id,
      'department:create': permissions.find(p => p.code === 'department:create').id,
      'department:update': permissions.find(p => p.code === 'department:update').id,
      'department:delete': permissions.find(p => p.code === 'department:delete').id,
    };

    // 2. 创建菜单
    const systemMenuId = uuidv4();

    const menus = [
      // 一级菜单 - 概览（所有用户可见）
      {
        id: uuidv4(),
        parent_id: null,
        name: '概览',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        type: 'menu',
        visible: true,
        sort: 0,
        status: 'active',
        permission_code: null, // 所有登录用户都可访问
        created_at: now,
        updated_at: now
      },

      // 一级菜单 - 系统管理
      {
        id: systemMenuId,
        parent_id: null,
        name: '系统管理',
        path: '/setting',
        icon: 'Settings',
        type: 'menu',
        visible: true,
        sort: 99,
        status: 'active',
        permission_code: null, // 有任何子菜单权限即可访问
        created_at: now,
        updated_at: now
      },

      // 二级菜单 - 用户管理
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

      // 二级菜单 - 角色管理
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

      // 二级菜单 - 权限管理
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

      // 二级菜单 - 菜单管理
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

      // 二级菜单 - 部门管理
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
    ];

    await queryInterface.bulkInsert('menus', menus);

    const menuIds = menus.map(m => m.id);

    // 3. 创建角色
    const superAdminRoleId = uuidv4();
    const adminRoleId = uuidv4();
    const userRoleId = uuidv4();

    const roles = [
      {
        id: superAdminRoleId,
        name: '超级管理员',
        code: 'super_admin',
        description: '拥有系统所有权限',
        status: 'active',
        sort: 1,
        created_at: now,
        updated_at: now
      },
      {
        id: adminRoleId,
        name: '管理员',
        code: 'admin',
        description: '拥有大部分管理权限',
        status: 'active',
        sort: 2,
        created_at: now,
        updated_at: now
      },
      {
        id: userRoleId,
        name: '普通用户',
        code: 'user',
        description: '普通用户角色，只有查看权限',
        status: 'active',
        sort: 3,
        created_at: now,
        updated_at: now
      },
    ];

    await queryInterface.bulkInsert('roles', roles);

    // 4. 创建角色-权限关联（超级管理员拥有所有权限）
    const superAdminPermissions = Object.values(permissionIds).map(permissionId => ({
      role_id: superAdminRoleId,
      permission_id: permissionId,
      created_at: now,
    }));

    // 管理员拥有除权限管理外的所有权限
    const adminPermissions = [
      'user:read', 'user:create', 'user:update', 'user:delete',
      'role:read', 'role:create', 'role:update', 'role:delete',
      'menu:read', 'menu:create', 'menu:update', 'menu:delete',
      'department:read', 'department:create', 'department:update', 'department:delete',
    ].map(code => ({
      role_id: adminRoleId,
      permission_id: permissionIds[code],
      created_at: now,
    }));

    // 普通用户只有查看权限
    const userPermissions = [
      'user:read', 'role:read', 'permission:read', 'menu:read', 'department:read'
    ].map(code => ({
      role_id: userRoleId,
      permission_id: permissionIds[code],
      created_at: now,
    }));

    await queryInterface.bulkInsert('role_permissions', [
      ...superAdminPermissions,
      ...adminPermissions,
      ...userPermissions,
    ]);

    // 5. 创建角色-菜单关联（所有角色都能看到所有菜单）
    const roleMenus = [];
    [superAdminRoleId, adminRoleId, userRoleId].forEach(roleId => {
      menuIds.forEach(menuId => {
        roleMenus.push({
          role_id: roleId,
          menu_id: menuId,
          created_at: now,
        });
      });
    });

    await queryInterface.bulkInsert('role_menus', roleMenus);

    // 6. 创建用户
    const superAdminUserId = uuidv4();
    const adminUserId = uuidv4();
    const normalUserId = uuidv4();

    // 7. 创建初始部门（先创建，用于用户关联）
    const techDeptId = uuidv4();
    const devDeptId = uuidv4();
    const qaDeptId = uuidv4();
    const marketDeptId = uuidv4();

    const departments = [
      {
        id: techDeptId,
        parent_id: null,
        name: '技术部',
        code: 'TECH',
        leader_id: null, // 先设置为null，稍后更新
        description: '负责公司技术研发工作',
        sort: 1,
        status: 'active',
        created_at: now,
        updated_at: now,
      },
      {
        id: devDeptId,
        parent_id: techDeptId,
        name: '研发部',
        code: 'DEV',
        leader_id: null, // 先设置为null，稍后更新
        description: '负责产品开发和维护',
        sort: 1,
        status: 'active',
        created_at: now,
        updated_at: now,
      },
      {
        id: qaDeptId,
        parent_id: techDeptId,
        name: '测试部',
        code: 'QA',
        leader_id: null,
        description: '负责产品质量保证',
        sort: 2,
        status: 'active',
        created_at: now,
        updated_at: now,
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
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('departments', departments);

    // 8. 创建用户（关联到部门）
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
        updated_at: now,
      },
      {
        id: adminUserId,
        username: 'manager',
        email: 'manager@example.com',
        password: await bcrypt.hash('manager123', 10),
        real_name: '管理员',
        phone: '13800138001',
        department_id: devDeptId,
        status: 'active',
        created_at: now,
        updated_at: now,
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
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('users', users);

    // 9. 更新部门负责人
    await queryInterface.bulkUpdate('departments',
      { leader_id: superAdminUserId },
      { id: techDeptId }
    );
    await queryInterface.bulkUpdate('departments',
      { leader_id: adminUserId },
      { id: devDeptId }
    );

    // 10. 创建用户-角色关联
    const userRoles = [
      { user_id: superAdminUserId, role_id: superAdminRoleId, created_at: now },
      { user_id: adminUserId, role_id: adminRoleId, created_at: now },
      { user_id: normalUserId, role_id: userRoleId, created_at: now },
    ];

    await queryInterface.bulkInsert('user_roles', userRoles);

    console.log('✅ 基础数据初始化完成！');
    console.log('');
    console.log('📝 测试账号：');
    console.log('   超级管理员 - 用户名: admin, 密码: admin123');
    console.log('   管理员     - 用户名: manager, 密码: manager123');
    console.log('   普通用户   - 用户名: user, 密码: user123');
  },

  async down(queryInterface, Sequelize) {
    // 按照外键依赖的反序删除
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('role_menus', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('departments', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('menus', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
