const express = require('express');
const router = express.Router();
const logController = require('./log.controller');
const { authenticate } = require('../../middlewares/auth');
const { checkPermission } = require('../../middlewares/permission');
const validate = require('../../middlewares/validate');
const logValidation = require('./log.validation');

// 所有日志路由需要认证
router.use(authenticate);

// 获取各类型日志
router.get('/operations', checkPermission('log', 'read'), validate(logValidation.queryLogs), logController.getOperationLogs);
router.get('/logins', checkPermission('log', 'read'), validate(logValidation.queryLogs), logController.getLoginLogs);
router.get('/system', checkPermission('log', 'read'), validate(logValidation.queryLogs), logController.getSystemLogs);
router.get('/access', checkPermission('log', 'read'), validate(logValidation.queryLogs), logController.getAccessLogs);
router.get('/errors', checkPermission('log', 'read'), validate(logValidation.queryLogs), logController.getErrorLogs);

// 获取统计信息
router.get('/stats', checkPermission('log', 'read'), validate(logValidation.queryStats), logController.getStats);

// 导出日志（需要额外权限）
router.post('/export', checkPermission('log', 'create'), validate(logValidation.exportLogs), logController.exportLogs);

module.exports = router;
