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

/**
 * 完整的系统初始化数据
 * 包含所有权限、菜单、角色、部门、邮件模板和测试账号
 *
 * 生成时间: 2025-10-28T00:33:55.674Z
 * 数据来源: 开发环境导出
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // ==========================================
    // 1. 创建权限 (52 条)
    // ==========================================
    const permissions = [
          {
                code: "monitor:manage",
                name: "管理监控",
                resource: "monitor",
                action: "update",
                category: "monitor",
                description: "管理监控配置和告警规则"
          },
          {
                code: "monitor:read",
                name: "查看监控",
                resource: "monitor",
                action: "read",
                category: "monitor",
                description: "查看系统监控数据"
          },
          {
                code: "generator:create",
                name: "创建代码",
                resource: "generator",
                action: "create",
                category: "代码生成",
                description: "初始化配置和生成代码"
          },
          {
                code: "generator:delete",
                name: "删除配置",
                resource: "generator",
                action: "delete",
                category: "代码生成",
                description: "删除模块配置和生成的代码"
          },
          {
                code: "generator:read",
                name: "查看代码生成器",
                resource: "generator",
                action: "read",
                category: "代码生成",
                description: "查看代码生成器配置和历史"
          },
          {
                code: "generator:update",
                name: "更新配置",
                resource: "generator",
                action: "update",
                category: "代码生成",
                description: "更新模块配置"
          },
          {
                code: "file-share:delete",
                name: "删除分享",
                resource: "file-share",
                action: "delete",
                category: "文件管理",
                description: "删除文件分享"
          },
          {
                code: "file-share:read",
                name: "查看分享",
                resource: "file-share",
                action: "read",
                category: "文件管理",
                description: "查看文件分享列表"
          },
          {
                code: "file:copy",
                name: "复制文件",
                resource: "file",
                action: "create",
                category: "文件管理",
                description: "复制文件"
          },
          {
                code: "file:delete",
                name: "删除文件",
                resource: "file",
                action: "delete",
                category: "文件管理",
                description: "删除文件"
          },
          {
                code: "file:download",
                name: "下载文件",
                resource: "file",
                action: "read",
                category: "文件管理",
                description: "下载文件"
          },
          {
                code: "file:move",
                name: "移动文件",
                resource: "file",
                action: "update",
                category: "文件管理",
                description: "移动文件到其他文件夹"
          },
          {
                code: "file:preview",
                name: "预览文件",
                resource: "file",
                action: "read",
                category: "文件管理",
                description: "预览文件"
          },
          {
                code: "file:read",
                name: "查看文件",
                resource: "file",
                action: "read",
                category: "文件管理",
                description: "查看文件列表和详情"
          },
          {
                code: "file:share",
                name: "分享文件",
                resource: "file-share",
                action: "create",
                category: "文件管理",
                description: "创建文件分享链接"
          },
          {
                code: "file:update",
                name: "更新文件",
                resource: "file",
                action: "update",
                category: "文件管理",
                description: "更新文件信息（重命名）"
          },
          {
                code: "file:upload",
                name: "上传文件",
                resource: "file",
                action: "create",
                category: "文件管理",
                description: "上传文件"
          },
          {
                code: "folder:create",
                name: "创建文件夹",
                resource: "folder",
                action: "create",
                category: "文件管理",
                description: "创建新文件夹"
          },
          {
                code: "folder:delete",
                name: "删除文件夹",
                resource: "folder",
                action: "delete",
                category: "文件管理",
                description: "删除文件夹"
          },
          {
                code: "folder:read",
                name: "查看文件夹",
                resource: "folder",
                action: "read",
                category: "文件管理",
                description: "查看文件夹列表和详情"
          },
          {
                code: "folder:update",
                name: "更新文件夹",
                resource: "folder",
                action: "update",
                category: "文件管理",
                description: "更新文件夹信息"
          },
          {
                code: "log:backup",
                name: "备份日志",
                resource: "log",
                action: "create",
                category: "日志管理",
                description: "备份日志到对象存储"
          },
          {
                code: "log:config",
                name: "配置日志",
                resource: "log",
                action: "update",
                category: "日志管理",
                description: "配置日志系统"
          },
          {
                code: "log:export",
                name: "导出日志",
                resource: "log",
                action: "read",
                category: "日志管理",
                description: "导出日志文件"
          },
          {
                code: "log:read",
                name: "查看日志",
                resource: "log",
                action: "read",
                category: "日志管理",
                description: "查看系统日志"
          },
          {
                code: "permission:create",
                name: "创建权限",
                resource: "permission",
                action: "create",
                category: "权限管理",
                description: "创建新权限"
          },
          {
                code: "permission:delete",
                name: "删除权限",
                resource: "permission",
                action: "delete",
                category: "权限管理",
                description: "删除权限"
          },
          {
                code: "permission:read",
                name: "查看权限",
                resource: "permission",
                action: "read",
                category: "权限管理",
                description: "查看权限列表和详情"
          },
          {
                code: "permission:update",
                name: "更新权限",
                resource: "permission",
                action: "update",
                category: "权限管理",
                description: "更新权限信息"
          },
          {
                code: "user:create",
                name: "创建用户",
                resource: "user",
                action: "create",
                category: "用户管理",
                description: "创建新用户"
          },
          {
                code: "user:delete",
                name: "删除用户",
                resource: "user",
                action: "delete",
                category: "用户管理",
                description: "删除用户"
          },
          {
                code: "user:read",
                name: "查看用户",
                resource: "user",
                action: "read",
                category: "用户管理",
                description: "查看用户列表和详情"
          },
          {
                code: "user:update",
                name: "更新用户",
                resource: "user",
                action: "update",
                category: "用户管理",
                description: "更新用户信息"
          },
          {
                code: "menu:create",
                name: "创建菜单",
                resource: "menu",
                action: "create",
                category: "菜单管理",
                description: "创建新菜单"
          },
          {
                code: "menu:delete",
                name: "删除菜单",
                resource: "menu",
                action: "delete",
                category: "菜单管理",
                description: "删除菜单"
          },
          {
                code: "menu:read",
                name: "查看菜单",
                resource: "menu",
                action: "read",
                category: "菜单管理",
                description: "查看菜单列表和详情"
          },
          {
                code: "menu:update",
                name: "更新菜单",
                resource: "menu",
                action: "update",
                category: "菜单管理",
                description: "更新菜单信息"
          },
          {
                code: "role:create",
                name: "创建角色",
                resource: "role",
                action: "create",
                category: "角色管理",
                description: "创建新角色"
          },
          {
                code: "role:delete",
                name: "删除角色",
                resource: "role",
                action: "delete",
                category: "角色管理",
                description: "删除角色"
          },
          {
                code: "role:read",
                name: "查看角色",
                resource: "role",
                action: "read",
                category: "角色管理",
                description: "查看角色列表和详情"
          },
          {
                code: "role:update",
                name: "更新角色",
                resource: "role",
                action: "update",
                category: "角色管理",
                description: "更新角色信息"
          },
          {
                code: "notification:manage",
                name: "管理通知",
                resource: "notification",
                action: "update",
                category: "通知管理",
                description: "发送和管理通知"
          },
          {
                code: "notification:read",
                name: "查看通知",
                resource: "notification",
                action: "read",
                category: "通知管理",
                description: "查看站内通知"
          },
          {
                code: "email:send",
                name: "发送邮件",
                resource: "email",
                action: "create",
                category: "邮件管理",
                description: "发送邮件和查看邮件日志"
          },
          {
                code: "email_template:create",
                name: "创建邮件模板",
                resource: "email_template",
                action: "create",
                category: "邮件管理",
                description: "创建新邮件模板"
          },
          {
                code: "email_template:delete",
                name: "删除邮件模板",
                resource: "email_template",
                action: "delete",
                category: "邮件管理",
                description: "删除邮件模板"
          },
          {
                code: "email_template:read",
                name: "查看邮件模板",
                resource: "email_template",
                action: "read",
                category: "邮件管理",
                description: "查看邮件模板列表和详情"
          },
          {
                code: "email_template:update",
                name: "更新邮件模板",
                resource: "email_template",
                action: "update",
                category: "邮件管理",
                description: "更新邮件模板信息"
          },
          {
                code: "department:create",
                name: "创建部门",
                resource: "department",
                action: "create",
                category: "部门管理",
                description: "创建新部门"
          },
          {
                code: "department:delete",
                name: "删除部门",
                resource: "department",
                action: "delete",
                category: "部门管理",
                description: "删除部门"
          },
          {
                code: "department:read",
                name: "查看部门",
                resource: "department",
                action: "read",
                category: "部门管理",
                description: "查看部门列表和详情"
          },
          {
                code: "department:update",
                name: "更新部门",
                resource: "department",
                action: "update",
                category: "部门管理",
                description: "更新部门信息"
          }
    ];

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
    // 2. 创建角色 (3 条)
    // ==========================================
    const roles = [
          {
                "code": "super_admin",
                "name": "超级管理员",
                "description": "拥有系统所有权限",
                "status": "active",
                "sort": 1
          },
          {
                "code": "admin",
                "name": "管理员",
                "description": "拥有大部分管理权限",
                "status": "active",
                "sort": 2
          },
          {
                "code": "user",
                "name": "普通用户",
                "description": "普通用户角色，只有查看权限",
                "status": "active",
                "sort": 3
          }
    ];

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
    // 3. 创建菜单 (17 条)
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
    // 6. 创建部门 (2 条)
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
    // 9. 创建邮件模板 (3 条)
    // ==========================================

    const emailTemplates = [
          {
                "name": "接口异常告警模版",
                "subject": "{{title}}",
                "content": "<div style=\"font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;\">\n  <div style=\"max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;\">\n    <h2 style=\"color: #dc3545; margin-top: 0;\">🚨 {{title}}</h2>\n\n    {{{content}}}\n\n    <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">\n    <p style=\"color: #999; font-size: 12px; text-align: center;\">\n      此邮件由系统自动发送，请勿回复\n    </p>\n  </div>\n</div>",
                "template_type": "API_MONITOR_ALERT",
                "variables": null,
                "variable_schema": [
                      {
                            "name": "apiName",
                            "label": "接口名称",
                            "description": "监控接口的名称",
                            "type": "string",
                            "required": true,
                            "example": "用户登录接口"
                      },
                      {
                            "name": "apiUrl",
                            "label": "接口地址",
                            "description": "接口URL",
                            "type": "string",
                            "required": true,
                            "example": "https://api.example.com/login"
                      },
                      {
                            "name": "method",
                            "label": "请求方法",
                            "description": "HTTP请求方法",
                            "type": "string",
                            "required": true,
                            "example": "POST"
                      },
                      {
                            "name": "errorType",
                            "label": "异常类型",
                            "description": "异常类型（超时/状态码异常/响应内容异常）",
                            "type": "string",
                            "required": true,
                            "example": "超时"
                      },
                      {
                            "name": "errorMessage",
                            "label": "错误信息",
                            "description": "详细错误信息",
                            "type": "string",
                            "required": false,
                            "example": "请求超时"
                      },
                      {
                            "name": "statusCode",
                            "label": "状态码",
                            "description": "HTTP响应状态码",
                            "type": "number",
                            "required": false,
                            "example": "500"
                      },
                      {
                            "name": "responseTime",
                            "label": "响应时间",
                            "description": "接口响应时间（毫秒）",
                            "type": "number",
                            "required": false,
                            "example": "3500"
                      },
                      {
                            "name": "timestamp",
                            "label": "发生时间",
                            "description": "异常发生时间",
                            "type": "string",
                            "required": true,
                            "example": "2025-10-22 14:30:00"
                      }
                ],
                "tags": [
                      "api",
                      "alert",
                      "monitor"
                ],
                "description": "接口监控异常时的告警邮件模版"
          },
          {
                "name": "CPU使用率告警模版",
                "subject": "{{title}}",
                "content": "<div style=\"font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;\">\n  <div style=\"max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;\">\n    <h2 style=\"color: #ff6b6b; margin-top: 0;\">⚠️ {{title}}</h2>\n\n    {{{content}}}\n\n    <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">\n    <p style=\"color: #999; font-size: 12px; text-align: center;\">\n      此邮件由系统自动发送，请勿回复\n    </p>\n  </div>\n</div>",
                "template_type": "SYSTEM_ALERT",
                "variables": null,
                "variable_schema": [
                      {
                            "name": "ruleName",
                            "label": "规则名称",
                            "description": "触发告警的规则名称",
                            "type": "string",
                            "required": true,
                            "example": "CPU使用率过高告警"
                      },
                      {
                            "name": "currentValue",
                            "label": "当前值",
                            "description": "当前CPU使用率",
                            "type": "number",
                            "required": true,
                            "example": "85"
                      },
                      {
                            "name": "threshold",
                            "label": "阈值",
                            "description": "告警阈值",
                            "type": "number",
                            "required": true,
                            "example": "80"
                      },
                      {
                            "name": "level",
                            "label": "告警级别",
                            "description": "告警级别（info/warning/error/critical）",
                            "type": "string",
                            "required": true,
                            "example": "warning"
                      },
                      {
                            "name": "timestamp",
                            "label": "告警时间",
                            "description": "告警发生时间",
                            "type": "string",
                            "required": true,
                            "example": "2025-10-22 14:30:00"
                      }
                ],
                "tags": [
                      "system",
                      "alert",
                      "cpu"
                ],
                "description": "系统CPU使用率超出阈值时的告警邮件模版"
          },
          {
                "name": "内存使用率告警模版",
                "subject": "{{title}}",
                "content": "<div style=\"font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;\">\n  <div style=\"max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;\">\n    <h2 style=\"color: #ff6b6b; margin-top: 0;\">⚠️ {{title}}</h2>\n\n    {{{content}}}\n\n    <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">\n    <p style=\"color: #999; font-size: 12px; text-align: center;\">\n      此邮件由系统自动发送，请勿回复\n    </p>\n  </div>\n</div>",
                "template_type": "SYSTEM_ALERT",
                "variables": null,
                "variable_schema": [
                      {
                            "name": "ruleName",
                            "label": "规则名称",
                            "description": "触发告警的规则名称",
                            "type": "string",
                            "required": true,
                            "example": "内存使用率过高告警"
                      },
                      {
                            "name": "currentValue",
                            "label": "当前值",
                            "description": "当前内存使用率",
                            "type": "number",
                            "required": true,
                            "example": "90"
                      },
                      {
                            "name": "threshold",
                            "label": "阈值",
                            "description": "告警阈值",
                            "type": "number",
                            "required": true,
                            "example": "85"
                      },
                      {
                            "name": "level",
                            "label": "告警级别",
                            "description": "告警级别（info/warning/error/critical）",
                            "type": "string",
                            "required": true,
                            "example": "error"
                      },
                      {
                            "name": "timestamp",
                            "label": "告警时间",
                            "description": "告警发生时间",
                            "type": "string",
                            "required": true,
                            "example": "2025-10-22 14:30:00"
                      }
                ],
                "tags": [
                      "system",
                      "alert",
                      "memory"
                ],
                "description": "系统内存使用率超出阈值时的告警邮件模版"
          }
    ];

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
    console.log(`   - 权限: ${permissionsWithMeta.length} 条`);
    console.log(`   - 角色: ${rolesWithMeta.length} 条`);
    console.log(`   - 菜单: ${allMenus.length} 条`);
    console.log(`   - 部门: ${departments.length} 条`);
    console.log(`   - 用户: ${users.length} 条`);
    console.log(`   - 邮件模板: ${emailTemplatesWithMeta.length} 条`);
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
