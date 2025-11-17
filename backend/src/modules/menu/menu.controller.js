const menuService = require('./menu.service');
const { success, paginated, list } = require('../../utils/response');

class MenuController {
  /**
   * 获取菜单列表
   * GET /api/menus
   */
  async getMenus(req, res, next) {
    try {
      const result = await menuService.getMenus(req.query);
      paginated(res, result.data, result.pagination, '获取菜单列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取菜单树
   * GET /api/menus/tree
   */
  async getMenuTree(req, res, next) {
    try {
      const tree = await menuService.getMenuTree();
      list(res, tree, '获取菜单树成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前用户的菜单树
   * GET /api/menus/user-tree
   */
  async getUserMenuTree(req, res, next) {
    try {
      const tree = await menuService.getUserMenuTree(req.user.id);
      list(res, tree, '获取用户菜单树成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取菜单详情
   * GET /api/menus/:id
   */
  async getMenuById(req, res, next) {
    try {
      const menu = await menuService.getMenuById(req.params.id);
      success(res, menu, '获取菜单详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建菜单
   * POST /api/menus
   */
  async createMenu(req, res, next) {
    try {
      const menu = await menuService.createMenu(req.body);
      success(res, menu, '创建菜单成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新菜单
   * PUT /api/menus/:id
   */
  async updateMenu(req, res, next) {
    try {
      const menu = await menuService.updateMenu(req.params.id, req.body);
      success(res, menu, '更新菜单成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除菜单
   * DELETE /api/menus/:id
   */
  async deleteMenu(req, res, next) {
    try {
      const result = await menuService.deleteMenu(req.params.id);
      success(res, result, '删除菜单成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuController();
