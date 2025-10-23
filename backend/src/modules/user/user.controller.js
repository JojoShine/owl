const userService = require('./user.service');
const { success, paginated } = require('../../utils/response');

class UserController {
  /**
   * 获取用户列表
   * GET /api/users
   */
  async getUsers(req, res, next) {
    try {
      const result = await userService.getUsers(req.query);
      paginated(res, result.data, result.pagination, '获取用户列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户详情
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      success(res, user, '获取用户详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建用户
   * POST /api/users
   */
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      success(res, user, '创建用户成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户
   * PUT /api/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      success(res, user, '更新用户成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除用户
   * DELETE /api/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const result = await userService.deleteUser(req.params.id);
      success(res, result, '删除用户成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 重置密码
   * POST /api/users/:id/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const result = await userService.resetPassword(req.params.id, req.body.password);
      success(res, result, '重置密码成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
