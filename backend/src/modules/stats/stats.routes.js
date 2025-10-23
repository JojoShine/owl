const express = require('express');
const router = express.Router();
const statsController = require('./stats.controller');
const { authenticate } = require('../../middlewares/auth');

// 所有统计路由都需要认证
router.use(authenticate);

/**
 * 统计相关路由
 */

// 获取首页仪表板统计数据
router.get('/dashboard', statsController.getDashboardStats);

// 获取用户统计数据
router.get('/users', statsController.getUserStats);

// 获取角色统计数据
router.get('/roles', statsController.getRoleStats);

module.exports = router;
