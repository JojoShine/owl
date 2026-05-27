const alertService = require('./alert.service');

/**
 * 告警控制器
 */
class AlertController {
  /**
   * 获取所有告警规则
   */
  async getAllRules(req, res) {
    try {
      const { page, limit, enabled, metric_type } = req.query;

      const result = await alertService.getAllRules({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        enabled: enabled !== undefined ? enabled === 'true' : undefined,
        metric_type,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('获取告警规则失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取告警规则失败',
      });
    }
  }

  /**
   * 获取告警规则详情
   */
  async getRuleById(req, res) {
    try {
      const { id } = req.params;
      const rule = await alertService.getRuleById(id);

      res.json({
        success: true,
        data: rule,
      });
    } catch (error) {
      console.error('获取告警规则失败:', error);
      res.status(404).json({
        success: false,
        message: error.message || '获取告警规则失败',
      });
    }
  }

  /**
   * 创建告警规则
   */
  async createRule(req, res) {
    try {
      const rule = await alertService.createRule(req.body);

      res.status(201).json({
        success: true,
        data: rule,
        message: '创建告警规则成功',
      });
    } catch (error) {
      console.error('创建告警规则失败:', error);
      res.status(400).json({
        success: false,
        message: error.message || '创建告警规则失败',
      });
    }
  }

  /**
   * 更新告警规则
   */
  async updateRule(req, res) {
    try {
      const { id } = req.params;
      const rule = await alertService.updateRule(id, req.body);

      res.json({
        success: true,
        data: rule,
        message: '更新告警规则成功',
      });
    } catch (error) {
      console.error('更新告警规则失败:', error);
      res.status(400).json({
        success: false,
        message: error.message || '更新告警规则失败',
      });
    }
  }

  /**
   * 删除告警规则
   */
  async deleteRule(req, res) {
    try {
      const { id } = req.params;
      const result = await alertService.deleteRule(id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('删除告警规则失败:', error);
      res.status(400).json({
        success: false,
        message: error.message || '删除告警规则失败',
      });
    }
  }

  /**
   * 获取告警历史
   */
  async getAlertHistory(req, res) {
    try {
      const { page, limit, rule_id, level, status, startDate, endDate } = req.query;

      const result = await alertService.getAlertHistory({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        rule_id,
        level,
        status,
        startDate,
        endDate,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('获取告警历史失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取告警历史失败',
      });
    }
  }

  /**
   * 标记告警为已解决
   */
  async resolveAlert(req, res) {
    try {
      const { id } = req.params;
      const alert = await alertService.resolveAlert(id);

      res.json({
        success: true,
        data: alert,
        message: '告警已标记为已解决',
      });
    } catch (error) {
      console.error('解决告警失败:', error);
      res.status(400).json({
        success: false,
        message: error.message || '解决告警失败',
      });
    }
  }

  /**
   * 获取告警统计
   */
  async getAlertStats(req, res) {
    try {
      const { hours } = req.query;
      const stats = await alertService.getAlertStats(
        hours ? parseInt(hours) : 24
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('获取告警统计失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取告警统计失败',
      });
    }
  }

  /**
   * 手动触发告警检查
   */
  async triggerCheck(req, res) {
    try {
      await alertService.checkAllRules();

      res.json({
        success: true,
        message: '告警检查已触发',
      });
    } catch (error) {
      console.error('触发告警检查失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '触发告警检查失败',
      });
    }
  }
}

module.exports = new AlertController();
