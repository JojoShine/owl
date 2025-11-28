const express = require('express');
const router = express.Router();

// 导入各模块路由
const authRoutes = require('../modules/auth/auth.routes');
const captchaRoutes = require('../modules/captcha/captcha.routes');
const userRoutes = require('../modules/user/user.routes');
const roleRoutes = require('../modules/role/role.routes');
const permissionRoutes = require('../modules/permission/permission.routes');
const menuRoutes = require('../modules/menu/menu.routes');
const departmentRoutes = require('../modules/department/department.routes');
const folderRoutes = require('../modules/folder/folder.routes');
const fileRoutes = require('../modules/file/file.routes');
const fileShareRoutes = require('../modules/file-share/file-share.routes');
const logRoutes = require('../modules/log/log.routes');
const monitorRoutes = require('../modules/monitor/monitor.routes');
const notificationRoutes = require('../modules/notification/notification.routes');
const generatorRoutes = require('../modules/generator/generator.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');

/**
 * API路由统一入口
 * 所有API都在 /api 前缀下
 */

// 认证相关路由
router.use('/auth', authRoutes);

// 验证码路由
router.use('/captcha', captchaRoutes);

// 仪表板路由
router.use('/dashboard', dashboardRoutes);

// 用户管理路由
router.use('/users', userRoutes);

// 角色管理路由
router.use('/roles', roleRoutes);

// 权限管理路由
router.use('/permissions', permissionRoutes);

// 菜单管理路由
router.use('/menus', menuRoutes);

// 部门管理路由
router.use('/departments', departmentRoutes);

// 文件夹管理路由
router.use('/folders', folderRoutes);

// 文件管理路由
router.use('/files', fileRoutes);

// 文件权限管理路由
const filePermissionRoutes = require('../modules/file/file-permission.routes');
router.use('/file-permissions', filePermissionRoutes);

// 文件分享路由
router.use('/file-shares', fileShareRoutes);

// 日志管理路由
router.use('/logs', logRoutes);

// 监控系统路由
router.use('/monitor', monitorRoutes);

// 通知服务路由
router.use('/notifications', notificationRoutes);

// 代码生成器路由
router.use('/generator', generatorRoutes);

// 字典管理路由
const dictionaryRoutes = require('../modules/dictionary/dictionary.routes');
router.use('/dictionaries', dictionaryRoutes);

// API构建器路由（接口开发功能）
const apiBuilderRoutes = require('../modules/api-builder/api-builder.routes');
const apiBuilderKeysRoutes = require('../modules/api-builder/api-builder-keys.routes');
const { getTestRoutes, getCustomRoutes } = require('../modules/api-builder/api-builder-executor.routes');
// 密钥路由必须放在前面，避免被/:id参数化路由拦截
router.use('/api-builder', apiBuilderKeysRoutes);
router.use('/api-builder', getTestRoutes());
router.use('/api-builder', apiBuilderRoutes);
router.use('/', getCustomRoutes());

// 动态生成的模块路由将通过 dynamic-routes.js 自动加载

const dynamicRoutes = require('./dynamic-routes');
router.use('/', dynamicRoutes);

/**
 * 健康检查接口
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

/**
 * API文档路由
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Common Management Platform API',
    version: '1.0.0',
    documentation: 'https://github.com/your-repo/api-docs',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        changePassword: 'POST /api/auth/change-password',
        refreshToken: 'POST /api/auth/refresh-token',
        logout: 'POST /api/auth/logout',
      },
      users: {
        list: 'GET /api/users',
        get: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        resetPassword: 'POST /api/users/:id/reset-password',
      },
      roles: {
        list: 'GET /api/roles',
        all: 'GET /api/roles/all',
        get: 'GET /api/roles/:id',
        create: 'POST /api/roles',
        update: 'PUT /api/roles/:id',
        delete: 'DELETE /api/roles/:id',
      },
      permissions: {
        list: 'GET /api/permissions',
        all: 'GET /api/permissions/all',
        get: 'GET /api/permissions/:id',
        create: 'POST /api/permissions',
        update: 'PUT /api/permissions/:id',
        delete: 'DELETE /api/permissions/:id',
        resources: 'GET /api/permissions/resources',
        actions: 'GET /api/permissions/actions',
        categories: 'GET /api/permissions/categories',
      },
      menus: {
        list: 'GET /api/menus',
        tree: 'GET /api/menus/tree',
        userTree: 'GET /api/menus/user-tree',
        get: 'GET /api/menus/:id',
        create: 'POST /api/menus',
        update: 'PUT /api/menus/:id',
        delete: 'DELETE /api/menus/:id',
      },
      departments: {
        list: 'GET /api/departments',
        tree: 'GET /api/departments/tree',
        get: 'GET /api/departments/:id',
        members: 'GET /api/departments/:id/members',
        create: 'POST /api/departments',
        update: 'PUT /api/departments/:id',
        delete: 'DELETE /api/departments/:id',
      },
      folders: {
        list: 'GET /api/folders',
        tree: 'GET /api/folders/tree',
        get: 'GET /api/folders/:id',
        contents: 'GET /api/folders/:id/contents',
        create: 'POST /api/folders',
        update: 'PUT /api/folders/:id',
        delete: 'DELETE /api/folders/:id',
      },
      files: {
        list: 'GET /api/files',
        get: 'GET /api/files/:id',
        upload: 'POST /api/files/upload',
        download: 'GET /api/files/:id/download',
        preview: 'GET /api/files/:id/preview',
        update: 'PUT /api/files/:id',
        delete: 'DELETE /api/files/:id',
        batchDelete: 'POST /api/files/batch-delete',
        move: 'PUT /api/files/:id/move',
        copy: 'POST /api/files/:id/copy',
        stats: 'GET /api/files/stats',
      },
      fileShares: {
        list: 'GET /api/file-shares',
        get: 'GET /api/file-shares/:shareCode',
        create: 'POST /api/file-shares',
        download: 'GET /api/file-shares/:shareCode/download',
        delete: 'DELETE /api/file-shares/:id',
      },
      health: 'GET /health',
    },
  });
});

module.exports = router;
