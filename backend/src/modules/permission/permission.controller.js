const permissionService = require('./permission.service');
const { success, paginated, list } = require('../../utils/response');

class PermissionController {
  /**
   * 获取权限列表
   * GET /api/permissions
   */
  async getPermissions(req, res, next) {
    try {
      const result = await permissionService.getPermissions(req.query);
      paginated(res, result.data, result.pagination, '获取权限列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取所有权限（分组）
   * GET /api/permissions/all
   */
  async getAllPermissions(req, res, next) {
    try {
      const permissions = await permissionService.getAllPermissions();
      list(res, permissions, '获取所有权限成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取权限详情
   * GET /api/permissions/:id
   */
  async getPermissionById(req, res, next) {
    try {
      const permission = await permissionService.getPermissionById(req.params.id);
      success(res, permission, '获取权限详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建权限
   * POST /api/permissions
   */
  async createPermission(req, res, next) {
    try {
      const permission = await permissionService.createPermission(req.body);
      success(res, permission, '创建权限成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新权限
   * PUT /api/permissions/:id
   */
  async updatePermission(req, res, next) {
    try {
      const permission = await permissionService.updatePermission(req.params.id, req.body);
      success(res, permission, '更新权限成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除权限
   * DELETE /api/permissions/:id
   */
  async deletePermission(req, res, next) {
    try {
      const result = await permissionService.deletePermission(req.params.id);
      success(res, result, '删除权限成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取资源列表
   * GET /api/permissions/resources
   */
  async getResources(req, res, next) {
    try {
      const resources = await permissionService.getResources();
      success(res, resources, '获取资源列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取操作类型列表
   * GET /api/permissions/actions
   */
  async getActions(req, res, next) {
    try {
      const actions = await permissionService.getActions();
      success(res, actions, '获取操作类型列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取分类列表
   * GET /api/permissions/categories
   */
  async getCategories(req, res, next) {
    try {
      const categories = await permissionService.getCategories();
      success(res, categories, '获取分类列表成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermissionController();
