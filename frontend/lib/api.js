import axios from './axios';

// 认证相关API
export const authApi = {
  // 登录
  login: (data) => axios.post('/auth/login', data),

  // 注册
  register: (data) => axios.post('/auth/register', data),

  // 登出
  logout: () => axios.post('/auth/logout'),

  // 刷新token
  refreshToken: () => axios.post('/auth/refresh'),

  // 获取当前用户信息
  getCurrentUser: () => axios.get('/auth/me'),
};

// 用户管理API
export const userApi = {
  // 获取用户列表
  getUsers: (params) => axios.get('/users', { params }),

  // 获取用户详情
  getUser: (id) => axios.get(`/users/${id}`),

  // 创建用户
  createUser: (data) => axios.post('/users', data),

  // 更新用户
  updateUser: (id, data) => axios.put(`/users/${id}`, data),

  // 删除用户
  deleteUser: (id) => axios.delete(`/users/${id}`),
};

// 角色管理API
export const roleApi = {
  // 获取角色列表
  getRoles: (params) => axios.get('/roles', { params }),

  // 获取角色详情
  getRole: (id) => axios.get(`/roles/${id}`),

  // 创建角色
  createRole: (data) => axios.post('/roles', data),

  // 更新角色
  updateRole: (id, data) => axios.put(`/roles/${id}`, data),

  // 删除角色
  deleteRole: (id) => axios.delete(`/roles/${id}`),
};

// 权限管理API
export const permissionApi = {
  // 获取权限列表
  getPermissions: (params) => axios.get('/permissions', { params }),

  // 获取所有权限（不分页）
  getAllPermissions: () => axios.get('/permissions/all'),

  // 获取权限树
  getPermissionTree: () => axios.get('/permissions/tree'),
};

// 文件夹管理API
export const folderApi = {
  // 获取文件夹树
  getFolderTree: () => axios.get('/folders/tree'),

  // 获取文件夹列表
  getFolders: (params) => axios.get('/folders', { params }),

  // 获取文件夹详情
  getFolder: (id) => axios.get(`/folders/${id}`),

  // 获取文件夹内容（子文件夹 + 文件）
  getFolderContents: (id, params) => axios.get(`/folders/${id}/contents`, { params }),

  // 创建文件夹
  createFolder: (data) => axios.post('/folders', data),

  // 更新文件夹
  updateFolder: (id, data) => axios.put(`/folders/${id}`, data),

  // 删除文件夹
  deleteFolder: (id) => axios.delete(`/folders/${id}`),

  // 获取文件夹权限列表
  getPermissions: (folderId) => axios.get(`/folders/${folderId}/permissions`),

  // 添加文件夹权限
  addPermission: (folderId, data) => axios.post(`/folders/${folderId}/permissions`, data),

  // 设置文件夹权限继承
  setInherit: (folderId, data) => axios.put(`/folders/${folderId}/inherit`, data),
};

// 文件管理API
export const fileApi = {
  // 上传文件（单个或多个）
  uploadFiles: (files, folderId, onProgress) => {
    const formData = new FormData();

    // 支持单个或多个文件
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }

    if (folderId) {
      formData.append('folder_id', folderId);
    }

    return axios.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  // 获取文件列表
  getFiles: (params) => axios.get('/files', { params }),

  // 获取文件详情
  getFile: (id) => axios.get(`/files/${id}`),

  // 更新文件（重命名）
  updateFile: (id, data) => axios.put(`/files/${id}`, data),

  // 删除文件
  deleteFile: (id) => axios.delete(`/files/${id}`),

  // 批量删除文件
  batchDeleteFiles: (ids) => axios.post('/files/batch-delete', { ids }),

  // 下载文件
  downloadFile: (id) => axios.get(`/files/${id}/download`, { responseType: 'blob' }),

  // 预览文件
  previewFile: (id) => axios.get(`/files/${id}/preview`, { responseType: 'blob' }),

  // 移动文件
  moveFile: (id, folderId) => axios.put(`/files/${id}/move`, { folder_id: folderId }),

  // 复制文件
  copyFile: (id, folderId) => axios.post(`/files/${id}/copy`, { folder_id: folderId }),

  // 获取存储统计
  getStats: () => axios.get('/files/stats'),

  // 获取文件权限列表
  getPermissions: (fileId) => axios.get(`/files/${fileId}/permissions`),

  // 添加文件权限
  addPermission: (fileId, data) => axios.post(`/files/${fileId}/permissions`, data),

  // 设置文件权限继承
  setInherit: (fileId, data) => axios.put(`/files/${fileId}/inherit`, data),
};

// 文件分享API
export const fileShareApi = {
  // 获取用户的所有分享
  getShares: () => axios.get('/file-shares'),

  // 获取分享信息（通过分享码）
  getShareByCode: (shareCode) => axios.get(`/file-shares/${shareCode}`),

  // 创建文件分享
  createShare: (data) => axios.post('/file-shares', data),

  // 下载分享的文件
  downloadSharedFile: (shareCode) => axios.get(`/file-shares/${shareCode}/download`, { responseType: 'blob' }),

  // 删除分享
  deleteShare: (id) => axios.delete(`/file-shares/${id}`),
};

// 菜单管理API
export const menuApi = {
  // 获取菜单树
  getMenuTree: () => axios.get('/menus/tree'),

  // 获取用户菜单树（根据用户权限）
  getUserMenus: () => axios.get('/menus/user-tree'),

  // 获取菜单列表（分页）
  getMenus: (params) => axios.get('/menus', { params }),

  // 获取菜单详情
  getMenu: (id) => axios.get(`/menus/${id}`),

  // 创建菜单
  createMenu: (data) => axios.post('/menus', data),

  // 更新菜单
  updateMenu: (id, data) => axios.put(`/menus/${id}`, data),

  // 删除菜单
  deleteMenu: (id) => axios.delete(`/menus/${id}`),
};

// 部门管理API
export const departmentApi = {
  // 获取部门树
  getDepartmentTree: () => axios.get('/departments/tree'),

  // 获取部门列表（分页）
  getDepartments: (params) => axios.get('/departments', { params }),

  // 获取部门详情
  getDepartment: (id) => axios.get(`/departments/${id}`),

  // 获取部门成员
  getDepartmentMembers: (id, params) => axios.get(`/departments/${id}/members`, { params }),

  // 创建部门
  createDepartment: (data) => axios.post('/departments', data),

  // 更新部门
  updateDepartment: (id, data) => axios.put(`/departments/${id}`, data),

  // 删除部门
  deleteDepartment: (id) => axios.delete(`/departments/${id}`),
};

// 日志API
export const logApi = {
  // 获取操作日志
  getOperationLogs: (params) => axios.get('/logs/operations', { params }),

  // 获取登录日志
  getLoginLogs: (params) => axios.get('/logs/logins', { params }),

  // 获取系统日志
  getSystemLogs: (params) => axios.get('/logs/system', { params }),

  // 获取访问日志
  getAccessLogs: (params) => axios.get('/logs/access', { params }),

  // 获取错误日志
  getErrorLogs: (params) => axios.get('/logs/errors', { params }),

  // 获取日志统计
  getLogStats: (params) => axios.get('/logs/stats', { params }),

  // 导出日志
  exportLogs: (data) => axios.post('/logs/export', data, { responseType: 'blob' }),
};

// 定时任务API
export const jobApi = {
  // 获取任务列表
  getJobs: (params) => axios.get('/jobs', { params }),

  // 获取任务详情
  getJob: (id) => axios.get(`/jobs/${id}`),

  // 创建任务
  createJob: (data) => axios.post('/jobs', data),

  // 更新任务
  updateJob: (id, data) => axios.put(`/jobs/${id}`, data),

  // 删除任务
  deleteJob: (id) => axios.delete(`/jobs/${id}`),

  // 执行任务
  runJob: (id) => axios.post(`/jobs/${id}/run`),

  // 获取任务日志
  getJobLogs: (id, params) => axios.get(`/jobs/${id}/logs`, { params }),
};

// 看板API
export const dashboardApi = {
  // 获取看板列表
  getDashboards: (params) => axios.get('/dashboards', { params }),

  // 获取看板详情
  getDashboard: (id) => axios.get(`/dashboards/${id}`),

  // 创建看板
  createDashboard: (data) => axios.post('/dashboards', data),

  // 更新看板
  updateDashboard: (id, data) => axios.put(`/dashboards/${id}`, data),

  // 删除看板
  deleteDashboard: (id) => axios.delete(`/dashboards/${id}`),

  // 获取看板数据
  getDashboardData: (id, params) => axios.get(`/dashboards/${id}/data`, { params }),
};

// 监控API
export const monitorApi = {
  // 获取系统服务状态（Redis、邮件等）
  getSystemStatus: () => axios.get('/monitor/status'),

  // 获取系统性能指标
  getSystemMetrics: () => axios.get('/monitor/system'),

  // 获取应用指标
  getApplicationMetrics: () => axios.get('/monitor/application'),

  // 获取数据库指标
  getDatabaseMetrics: () => axios.get('/monitor/database'),

  // 获取缓存指标
  getCacheMetrics: () => axios.get('/monitor/cache'),

  // 获取所有指标（综合）
  getAllMetrics: () => axios.get('/monitor/all'),
};

// 接口监控API
export const apiMonitorApi = {
  // 获取所有监控配置列表
  getAllMonitors: (params) => axios.get('/monitor/apis', { params }),

  // 根据 ID 获取监控配置
  getMonitorById: (id) => axios.get(`/monitor/apis/${id}`),

  // 创建监控配置
  createMonitor: (data) => axios.post('/monitor/apis', data),

  // 更新监控配置
  updateMonitor: (id, data) => axios.put(`/monitor/apis/${id}`, data),

  // 删除监控配置
  deleteMonitor: (id) => axios.delete(`/monitor/apis/${id}`),

  // 立即测试接口
  testApi: (id) => axios.post(`/monitor/apis/${id}/test`),

  // 获取监控日志
  getMonitorLogs: (id, params) => axios.get(`/monitor/apis/${id}/logs`, { params }),

  // 获取监控统计信息
  getMonitorStats: (id, params) => axios.get(`/monitor/apis/${id}/stats`, { params }),
};

// 告警API
export const alertApi = {
  // 获取所有告警规则
  getAllRules: (params) => axios.get('/monitor/alerts/rules', { params }),

  // 根据 ID 获取告警规则
  getRuleById: (id) => axios.get(`/monitor/alerts/rules/${id}`),

  // 创建告警规则
  createRule: (data) => axios.post('/monitor/alerts/rules', data),

  // 更新告警规则
  updateRule: (id, data) => axios.put(`/monitor/alerts/rules/${id}`, data),

  // 删除告警规则
  deleteRule: (id) => axios.delete(`/monitor/alerts/rules/${id}`),

  // 获取告警历史
  getAlertHistory: (params) => axios.get('/monitor/alerts/history', { params }),

  // 标记告警为已解决
  resolveAlert: (id) => axios.put(`/monitor/alerts/history/${id}/resolve`),

  // 获取告警统计
  getAlertStats: (params) => axios.get('/monitor/alerts/stats', { params }),

  // 手动触发告警检查
  triggerCheck: () => axios.post('/monitor/alerts/check'),
};

// 通知API
export const notificationApi = {
  // 获取当前用户的通知列表
  getNotifications: (params) => axios.get('/notifications', { params }),

  // 获取未读消息数量
  getUnreadCount: () => axios.get('/notifications/unread-count'),

  // 获取通知统计
  getStats: () => axios.get('/notifications/stats'),

  // 获取通知详情
  getNotification: (id) => axios.get(`/notifications/${id}`),

  // 标记单条消息为已读
  markAsRead: (id) => axios.put(`/notifications/${id}/read`),

  // 标记所有消息为已读
  markAllAsRead: () => axios.put('/notifications/read-all'),

  // 删除单条通知
  deleteNotification: (id) => axios.delete(`/notifications/${id}`),

  // 清空所有已读消息
  clearReadNotifications: () => axios.delete('/notifications/clear'),

  // 发送通知（管理员功能）
  sendNotification: (data) => axios.post('/notifications/send', data),

  // 广播通知（管理员功能）
  broadcastNotification: (data) => axios.post('/notifications/broadcast', data),
};

// 邮件API
export const emailApi = {
  // 获取邮件发送记录
  getEmailLogs: (params) => axios.get('/notifications/emails/logs', { params }),

  // 发送邮件
  sendEmail: (data) => axios.post('/notifications/emails/send', data),

  // 使用模板发送邮件
  sendEmailWithTemplate: (data) => axios.post('/notifications/emails/send-with-template', data),

  // 发送测试邮件
  sendTestEmail: (toEmail) => axios.post('/notifications/emails/test', { toEmail }),
};

// 邮件模板API
export const emailTemplateApi = {
  // 获取邮件模板列表
  getTemplates: (params) => axios.get('/notifications/emails/templates', { params }),

  // 获取邮件模板详情
  getTemplate: (id) => axios.get(`/notifications/emails/templates/${id}`),

  // 创建邮件模板
  createTemplate: (data) => axios.post('/notifications/emails/templates', data),

  // 更新邮件模板
  updateTemplate: (id, data) => axios.put(`/notifications/emails/templates/${id}`, data),

  // 删除邮件模板
  deleteTemplate: (id) => axios.delete(`/notifications/emails/templates/${id}`),

  // 预览邮件模板
  previewTemplate: (id, payload) => axios.post(`/notifications/emails/templates/${id}/preview`, payload || {}),
};

// 通知设置API
export const notificationSettingsApi = {
  // 获取当前用户的通知设置
  getSettings: () => axios.get('/notifications/settings'),

  // 更新当前用户的通知设置
  updateSettings: (data) => axios.put('/notifications/settings', data),

  // 重置通知设置为默认值
  resetSettings: () => axios.post('/notifications/settings/reset'),
};

// 代码生成器API
export const generatorApi = {
  // 获取数据库表列表
  getTables: (params) => axios.get('/generator/tables', { params }),

  // 获取表结构详情
  getTableStructure: (tableName) => axios.get(`/generator/tables/${tableName}`),

  // 获取模块配置列表
  getModuleConfigs: (params) => axios.get('/generator/configs', { params }),

  // 获取模块配置详情
  getModuleConfig: (id) => axios.get(`/generator/configs/${id}`),

  // 初始化模块配置（从表结构自动生成）
  initializeModuleConfig: (tableName) => axios.post('/generator/configs/initialize', { tableName }),

  // 创建模块配置
  createModuleConfig: (data) => axios.post('/generator/configs', data),

  // 更新模块配置
  updateModuleConfig: (id, data) => axios.put(`/generator/configs/${id}`, data),

  // 删除模块配置
  deleteModuleConfig: (id) => axios.delete(`/generator/configs/${id}`),

  // 生成代码
  generateCode: (moduleId, options) => axios.post(`/generator/generate/${moduleId}`, options),

  // 删除生成的代码
  deleteGeneratedCode: (moduleId) => axios.delete(`/generator/generate/${moduleId}`),

  // 获取生成历史列表
  getHistoryList: (params) => axios.get('/generator/history', { params }),

  // 获取生成历史详情
  getHistory: (id) => axios.get(`/generator/history/${id}`),

  // 获取模块的生成历史
  getModuleHistory: (moduleId, params) => axios.get(`/generator/configs/${moduleId}/history`, { params }),

  // 获取统计信息
  getStatistics: (params) => axios.get('/generator/statistics', { params }),

  // 清理历史记录
  cleanupHistory: (daysToKeep) => axios.delete('/generator/history/cleanup', { data: { daysToKeep } }),

  // 验证SQL语法
  validateSql: (sql) => axios.post('/generator/validate-sql', { sql }).then(res => res.data),

  // 预览SQL查询结果
  previewSql: (sql, limit = 10) => axios.post('/generator/preview-sql', { sql, limit }).then(res => res.data),

  // 从SQL生成字段配置
  generateFieldsFromSql: (sql) => axios.post('/generator/generate-fields-from-sql', { sql }).then(res => res.data),

  // 根据模块路径获取页面配置
  getPageConfigByPath: (modulePath) => axios.get(`/generator/page-config/${modulePath}`).then(res => res.data),
};

// 统计API
export const statsApi = {
  // 获取首页仪表板统计数据
  getDashboardStats: () => axios.get('/stats/dashboard'),

  // 获取用户统计数据
  getUserStats: () => axios.get('/stats/users'),

  // 获取角色统计数据
  getRoleStats: () => axios.get('/stats/roles'),
};

// 字典API
export const dictionaryApi = {
  // 获取多个字典类型
  getDictionaries: (types) => axios.get('/dictionaries', { params: { types } }),

  // 获取单个字典类型
  getDictionary: (type) => axios.get(`/dictionaries/${type}`),
};

export default {
  auth: authApi,
  user: userApi,
  role: roleApi,
  permission: permissionApi,
  folder: folderApi,
  file: fileApi,
  fileShare: fileShareApi,
  menu: menuApi,
  department: departmentApi,
  log: logApi,
  job: jobApi,
  dashboard: dashboardApi,
  monitor: monitorApi,
  apiMonitor: apiMonitorApi,
  alert: alertApi,
  notification: notificationApi,
  email: emailApi,
  emailTemplate: emailTemplateApi,
  notificationSettings: notificationSettingsApi,
  generator: generatorApi,
  stats: statsApi,
  dictionary: dictionaryApi,
};
