const departmentService = require('./department.service');
const { success, paginated, list } = require('../../utils/response');

class DepartmentController {
  /**
   * 获取部门列表
   * GET /api/departments
   */
  async getDepartments(req, res, next) {
    try {
      const result = await departmentService.getDepartments(req.query);
      paginated(res, result.data, result.pagination, '获取部门列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取部门树
   * GET /api/departments/tree
   */
  async getDepartmentTree(req, res, next) {
    try {
      const tree = await departmentService.getDepartmentTree();
      list(res, tree, '获取部门树成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取部门详情
   * GET /api/departments/:id
   */
  async getDepartmentById(req, res, next) {
    try {
      const department = await departmentService.getDepartmentById(req.params.id);
      success(res, department, '获取部门详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建部门
   * POST /api/departments
   */
  async createDepartment(req, res, next) {
    try {
      const department = await departmentService.createDepartment(req.body);
      success(res, department, '创建部门成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新部门
   * PUT /api/departments/:id
   */
  async updateDepartment(req, res, next) {
    try {
      const department = await departmentService.updateDepartment(req.params.id, req.body);
      success(res, department, '更新部门成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除部门
   * DELETE /api/departments/:id
   */
  async deleteDepartment(req, res, next) {
    try {
      const result = await departmentService.deleteDepartment(req.params.id);
      success(res, result, '删除部门成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取部门成员
   * GET /api/departments/:id/members
   */
  async getDepartmentMembers(req, res, next) {
    try {
      const result = await departmentService.getDepartmentMembers(req.params.id, req.query);
      success(res, result, '获取部门成员成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepartmentController();