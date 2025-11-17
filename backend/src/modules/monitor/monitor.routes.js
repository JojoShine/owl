const express = require('express');
const router = express.Router();
const monitorController = require('./monitor.controller');
const apiMonitorController = require('./api-monitor.controller');
const alertController = require('./alert.controller');
const { authenticate } = require('../../middlewares/auth');

// 公开路由：获取系统服务状态（不需要认证，用于登录页面）
router.get('/status', monitorController.getSystemStatus);

// 所有其他监控路由都需要认证
router.use(authenticate);

// 获取系统性能指标
router.get('/system', monitorController.getSystemMetrics);

// 获取应用指标
router.get('/application', monitorController.getApplicationMetrics);

// 获取数据库指标
router.get('/database', monitorController.getDatabaseMetrics);

// 获取缓存指标
router.get('/cache', monitorController.getCacheMetrics);

// 获取所有指标（综合）
router.get('/all', monitorController.getAllMetrics);

// ========== 接口监控路由 ==========

// 获取所有监控配置列表
router.get('/apis', apiMonitorController.getAllMonitors);

// 创建监控配置
router.post('/apis', apiMonitorController.createMonitor);

// 根据 ID 获取监控配置
router.get('/apis/:id', apiMonitorController.getMonitorById);

// 更新监控配置
router.put('/apis/:id', apiMonitorController.updateMonitor);

// 删除监控配置
router.delete('/apis/:id', apiMonitorController.deleteMonitor);

// 立即测试接口
router.post('/apis/:id/test', apiMonitorController.testApi);

// 获取监控日志
router.get('/apis/:id/logs', apiMonitorController.getMonitorLogs);

// 获取监控统计信息
router.get('/apis/:id/stats', apiMonitorController.getMonitorStats);

// ========== 告警管理路由 ==========

// 获取所有告警规则
router.get('/alerts/rules', alertController.getAllRules);

// 创建告警规则
router.post('/alerts/rules', alertController.createRule);

// 根据 ID 获取告警规则
router.get('/alerts/rules/:id', alertController.getRuleById);

// 更新告警规则
router.put('/alerts/rules/:id', alertController.updateRule);

// 删除告警规则
router.delete('/alerts/rules/:id', alertController.deleteRule);

// 获取告警历史
router.get('/alerts/history', alertController.getAlertHistory);

// 标记告警为已解决
router.put('/alerts/history/:id/resolve', alertController.resolveAlert);

// 获取告警统计
router.get('/alerts/stats', alertController.getAlertStats);

// 手动触发告警检查
router.post('/alerts/check', alertController.triggerCheck);

module.exports = router;
