const express = require('express');
const router = express.Router();
const controller = require('./dashboard-widget.controller');
const { authenticate } = require('../../../middlewares/auth');
const { isAdmin } = require('../../../middlewares/permission');

// 批量执行所有启用的 widget（概览页使用，需登录）
router.get('/execute', authenticate, (req, res, next) => controller.executeAllEnabled(req, res, next));

// 获取所有 widget（管理用）
router.get('/', authenticate, isAdmin, (req, res, next) => controller.getAll(req, res, next));

// 创建 widget
router.post('/', authenticate, isAdmin, (req, res, next) => controller.create(req, res, next));

// 获取单个 widget
router.get('/:id', authenticate, isAdmin, (req, res, next) => controller.getById(req, res, next));

// 更新 widget
router.put('/:id', authenticate, isAdmin, (req, res, next) => controller.update(req, res, next));

// 删除 widget
router.delete('/:id', authenticate, isAdmin, (req, res, next) => controller.delete(req, res, next));

// 执行单个 widget SQL（测试用）
router.post('/:id/execute', authenticate, isAdmin, (req, res, next) => controller.executeWidget(req, res, next));

module.exports = router;
