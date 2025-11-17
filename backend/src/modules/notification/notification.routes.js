const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const emailController = require('./email.controller');
const emailTemplateController = require('./email-template.controller');
const settingsController = require('./settings.controller');
const { authenticate } = require('../../middlewares/auth');
const { checkPermission, isAdmin } = require('../../middlewares/permission');
const validate = require('../../middlewares/validate');
const notificationValidation = require('./notification.validation');

// =====================
// 站内通知路由
// =====================

/**
 * @route GET /api/notifications
 * @desc 获取当前用户的通知列表
 * @access Private
 */
router.get(
  '/',
  authenticate,
  validate(notificationValidation.getNotifications),
  notificationController.getNotifications
);

/**
 * @route GET /api/notifications/unread-count
 * @desc 获取未读消息数量
 * @access Private
 */
router.get(
  '/unread-count',
  authenticate,
  notificationController.getUnreadCount
);

/**
 * @route GET /api/notifications/stats
 * @desc 获取通知统计
 * @access Private
 */
router.get(
  '/stats',
  authenticate,
  notificationController.getNotificationStats
);

/**
 * @route PUT /api/notifications/read-all
 * @desc 标记所有消息为已读
 * @access Private
 */
router.put(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead
);

/**
 * @route DELETE /api/notifications/clear
 * @desc 清空所有已读消息
 * @access Private
 */
router.delete(
  '/clear',
  authenticate,
  notificationController.clearReadNotifications
);

/**
 * @route POST /api/notifications/send
 * @desc 发送通知（管理员功能）
 * @access Private - 需要管理员角色
 */
router.post(
  '/send',
  authenticate,
  isAdmin,
  validate(notificationValidation.sendNotification),
  notificationController.sendNotification
);

/**
 * @route POST /api/notifications/broadcast
 * @desc 广播通知（管理员功能）
 * @access Private - 需要管理员角色
 */
router.post(
  '/broadcast',
  authenticate,
  isAdmin,
  validate(notificationValidation.broadcastNotification),
  notificationController.broadcastNotification
);

// =====================
// 通知设置路由（必须在 /:id 之前定义）
// =====================

/**
 * @route GET /api/notifications/settings
 * @desc 获取当前用户的通知设置
 * @access Private
 */
router.get(
  '/settings',
  authenticate,
  settingsController.getSettings
);

/**
 * @route PUT /api/notifications/settings
 * @desc 更新当前用户的通知设置
 * @access Private
 */
router.put(
  '/settings',
  authenticate,
  validate(notificationValidation.updateNotificationSettings),
  settingsController.updateSettings
);

/**
 * @route POST /api/notifications/settings/reset
 * @desc 重置通知设置为默认值
 * @access Private
 */
router.post(
  '/settings/reset',
  authenticate,
  settingsController.resetSettings
);

/**
 * @route GET /api/notifications/:id
 * @desc 获取通知详情
 * @access Private
 */
router.get(
  '/:id',
  authenticate,
  validate(notificationValidation.getNotificationById),
  notificationController.getNotificationById
);

/**
 * @route PUT /api/notifications/:id/read
 * @desc 标记单条消息为已读
 * @access Private
 */
router.put(
  '/:id/read',
  authenticate,
  validate(notificationValidation.markAsRead),
  notificationController.markAsRead
);

/**
 * @route DELETE /api/notifications/:id
 * @desc 删除单条通知
 * @access Private
 */
router.delete(
  '/:id',
  authenticate,
  validate(notificationValidation.deleteNotification),
  notificationController.deleteNotification
);

// =====================
// 通知设置路由
// =====================

/**
 * @route GET /api/notifications/settings
 * @desc 获取当前用户的通知设置
 * @access Private
 */
router.get(
  '/settings',
  authenticate,
  settingsController.getSettings
);

/**
 * @route PUT /api/notifications/settings
 * @desc 更新当前用户的通知设置
 * @access Private
 */
router.put(
  '/settings',
  authenticate,
  validate(notificationValidation.updateNotificationSettings),
  settingsController.updateSettings
);

/**
 * @route POST /api/notifications/settings/reset
 * @desc 重置通知设置为默认值
 * @access Private
 */
router.post(
  '/settings/reset',
  authenticate,
  settingsController.resetSettings
);

// =====================
// 邮件发送路由
// =====================

/**
 * @route GET /api/emails/logs
 * @desc 获取邮件发送记录
 * @access Private - 需要email:read权限
 */
router.get(
  '/emails/logs',
  authenticate,
  checkPermission('email', 'read'),
  validate(notificationValidation.getEmailLogs),
  emailController.getEmailLogs
);

/**
 * @route POST /api/emails/send
 * @desc 发送邮件
 * @access Private - 需要email:create权限
 */
router.post(
  '/emails/send',
  authenticate,
  checkPermission('email', 'create'),
  validate(notificationValidation.sendEmail),
  emailController.sendEmail
);

/**
 * @route POST /api/emails/send-with-template
 * @desc 使用模板发送邮件
 * @access Private - 需要email:create权限
 */
router.post(
  '/emails/send-with-template',
  authenticate,
  checkPermission('email', 'create'),
  validate(notificationValidation.sendEmailWithTemplate),
  emailController.sendEmailWithTemplate
);

/**
 * @route POST /api/emails/test
 * @desc 发送测试邮件
 * @access Private - 需要email:create权限
 */
router.post(
  '/emails/test',
  authenticate,
  checkPermission('email', 'create'),
  validate(notificationValidation.sendTestEmail),
  emailController.sendTestEmail
);

// =====================
// 邮件模板路由
// =====================

/**
 * @route GET /api/emails/templates
 * @desc 获取邮件模板列表
 * @access Private - 需要email_template:read权限
 */
router.get(
  '/emails/templates',
  authenticate,
  checkPermission('email_template', 'read'),
  emailTemplateController.getTemplates
);

/**
 * @route POST /api/emails/templates
 * @desc 创建邮件模板
 * @access Private - 需要email_template:create权限
 */
router.post(
  '/emails/templates',
  authenticate,
  checkPermission('email_template', 'create'),
  validate(notificationValidation.createEmailTemplate),
  emailTemplateController.createTemplate
);

/**
 * @route GET /api/emails/templates/:id
 * @desc 获取邮件模板详情
 * @access Private - 需要email_template:read权限
 */
router.get(
  '/emails/templates/:id',
  authenticate,
  checkPermission('email_template', 'read'),
  emailTemplateController.getTemplateById
);

/**
 * @route PUT /api/emails/templates/:id
 * @desc 更新邮件模板
 * @access Private - 需要email_template:update权限
 */
router.put(
  '/emails/templates/:id',
  authenticate,
  checkPermission('email_template', 'update'),
  validate(notificationValidation.updateEmailTemplate),
  emailTemplateController.updateTemplate
);

/**
 * @route DELETE /api/emails/templates/:id
 * @desc 删除邮件模板
 * @access Private - 需要email_template:delete权限
 */
router.delete(
  '/emails/templates/:id',
  authenticate,
  checkPermission('email_template', 'delete'),
  validate(notificationValidation.deleteEmailTemplate),
  emailTemplateController.deleteTemplate
);

/**
 * @route POST /api/emails/templates/:id/preview
 * @desc 预览邮件模板
 * @access Private - 需要email_template:read权限
 */
router.post(
  '/emails/templates/:id/preview',
  authenticate,
  checkPermission('email_template', 'read'),
  validate(notificationValidation.previewEmailTemplate),
  emailTemplateController.previewTemplate
);

module.exports = router;
