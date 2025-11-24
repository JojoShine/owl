/**
 * Dashboard Routes
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middlewares/auth');

/**
 * 获取仪表板完整数据
 * GET /api/dashboard
 */
router.get('/', authenticate, (req, res) => dashboardController.getDashboard(req, res));

/**
 * 获取指标数据
 * GET /api/dashboard/metrics
 */
router.get('/metrics', authenticate, (req, res) => dashboardController.getMetrics(req, res));

/**
 * 获取最近登录用户
 * GET /api/dashboard/recent-logins
 */
router.get('/recent-logins', authenticate, (req, res) => dashboardController.getRecentLogins(req, res));

/**
 * 获取在线用户
 * GET /api/dashboard/online-users
 */
router.get('/online-users', authenticate, (req, res) => dashboardController.getOnlineUsers(req, res));

/**
 * 获取系统概览
 * GET /api/dashboard/system-overview
 */
router.get('/system-overview', authenticate, (req, res) => dashboardController.getSystemOverview(req, res));

/**
 * 获取存储概览
 * GET /api/dashboard/storage-overview
 */
router.get('/storage-overview', authenticate, (req, res) => dashboardController.getStorageOverview(req, res));

/**
 * 获取最近操作
 * GET /api/dashboard/recent-operations
 */
router.get('/recent-operations', authenticate, (req, res) => dashboardController.getRecentOperations(req, res));

/**
 * 获取访问趋势
 * GET /api/dashboard/access-trend
 */
router.get('/access-trend', authenticate, (req, res) => dashboardController.getAccessTrend(req, res));

module.exports = router;