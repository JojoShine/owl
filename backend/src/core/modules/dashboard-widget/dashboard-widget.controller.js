const dashboardWidgetService = require('./dashboard-widget.service');
const { success, list } = require('../../../utils/response');
const { logger } = require('../../../config/logger');

class DashboardWidgetController {
  async getAll(req, res, next) {
    try {
      const widgets = await dashboardWidgetService.getAll();
      list(res, widgets, '获取 Widget 列表成功');
    } catch (error) {
      logger.error('获取 Widget 列表失败:', error);
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const widget = await dashboardWidgetService.getById(req.params.id);
      success(res, widget, '获取 Widget 成功');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const widget = await dashboardWidgetService.create(req.body, req.user.id);
      success(res, widget, '创建 Widget 成功', 201);
    } catch (error) {
      logger.error('创建 Widget 失败:', error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const widget = await dashboardWidgetService.update(req.params.id, req.body);
      success(res, widget, '更新 Widget 成功');
    } catch (error) {
      logger.error('更新 Widget 失败:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await dashboardWidgetService.delete(req.params.id);
      success(res, result, '删除 Widget 成功');
    } catch (error) {
      next(error);
    }
  }

  async executeWidget(req, res, next) {
    try {
      const result = await dashboardWidgetService.executeWidget(req.params.id);
      success(res, result, '执行成功');
    } catch (error) {
      logger.error('执行 Widget SQL 失败:', error);
      next(error);
    }
  }

  async executeAllEnabled(req, res, next) {
    try {
      const results = await dashboardWidgetService.executeAllEnabled();
      success(res, results, '执行成功');
    } catch (error) {
      logger.error('批量执行 Widget 失败:', error);
      next(error);
    }
  }
}

module.exports = new DashboardWidgetController();
