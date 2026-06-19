const emailTaskService = require('./email-task.service');
const { success, paginated } = require('../../../utils/response');

class EmailTaskController {
  /**
   * 获取邮件任务列表
   * GET /api/system/email-tasks
   */
  async getTasks(req, res, next) {
    try {
      const result = await emailTaskService.getAllTasks(req.query);

      paginated(res, result.items, {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      }, '获取邮件任务列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取邮件任务详情
   * GET /api/system/email-tasks/:id
   */
  async getTaskById(req, res, next) {
    try {
      const task = await emailTaskService.getTaskById(req.params.id);
      success(res, task, '获取邮件任务详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建邮件任务
   * POST /api/system/email-tasks
   */
  async createTask(req, res, next) {
    try {
      const task = await emailTaskService.createTask(req.body, req.user?.id);
      success(res, task, '创建邮件任务成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新邮件任务
   * PUT /api/system/email-tasks/:id
   */
  async updateTask(req, res, next) {
    try {
      const task = await emailTaskService.updateTask(req.params.id, req.body, req.user?.id);
      success(res, task, '更新邮件任务成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除邮件任务
   * DELETE /api/system/email-tasks/:id
   */
  async deleteTask(req, res, next) {
    try {
      await emailTaskService.deleteTask(req.params.id, req.user?.id);
      success(res, null, '删除邮件任务成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 启用邮件任务
   * PATCH /api/system/email-tasks/:id/enable
   */
  async enableTask(req, res, next) {
    try {
      const task = await emailTaskService.enableTask(req.params.id);
      success(res, task, '启用邮件任务成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 禁用邮件任务
   * PATCH /api/system/email-tasks/:id/disable
   */
  async disableTask(req, res, next) {
    try {
      const task = await emailTaskService.disableTask(req.params.id);
      success(res, task, '禁用邮件任务成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 手动执行邮件任务
   * POST /api/system/email-tasks/:id/execute
   */
  async manualExecuteTask(req, res, next) {
    try {
      await emailTaskService.manualExecuteTask(req.params.id);
      success(res, null, '邮件任务已提交执行');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmailTaskController();
