const roleService = require('./role.service');
const { success, paginated, list } = require('../../utils/response');

class RoleController {
  /**
   * 获取角色列表
   * GET /api/roles
   */
  async getRoles(req, res, next) {
    try {
      const result = await roleService.getRoles(req.query);
      paginated(res, result.data, result.pagination, '获取角色列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取所有角色（不分页）
   * GET /api/roles/all
   */
  async getAllRoles(req, res, next) {
    try {
      const roles = await roleService.getAllRoles();
      list(res, roles, '获取所有角色成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取角色详情
   * GET /api/roles/:id
   */
  async getRoleById(req, res, next) {
    try {
      const role = await roleService.getRoleById(req.params.id);
      success(res, role, '获取角色详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建角色
   * POST /api/roles
   */
  async createRole(req, res, next) {
    try {
      const role = await roleService.createRole(req.body);
      success(res, role, '创建角色成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新角色
   * PUT /api/roles/:id
   */
  async updateRole(req, res, next) {
    try {
      const role = await roleService.updateRole(req.params.id, req.body);
      success(res, role, '更新角色成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除角色
   * DELETE /api/roles/:id
   */
  async deleteRole(req, res, next) {
    try {
      const result = await roleService.deleteRole(req.params.id);
      success(res, result, '删除角色成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();
