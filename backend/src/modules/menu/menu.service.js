const { Op } = require('sequelize');
const db = require('../../models');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

class MenuService {
  /**
   * 获取菜单列表（分页）
   */
  async getMenus(query) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      parent_id,
      sort = 'sort',
      order = 'ASC',
    } = query;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { path: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (parent_id !== undefined) {
      where.parent_id = parent_id === 'null' ? null : parent_id;
    }

    const { count, rows } = await db.Menu.findAndCountAll({
      where,
      include: [
        {
          model: db.Menu,
          as: 'parent',
          attributes: ['id', 'name'],
        },
        {
          model: db.Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code'],
        },
      ],
      pageSize: parseInt(limit),
      offset,
      order: [[sort, order.toUpperCase()]],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * 获取菜单树（递归构建）
   */
  async getMenuTree() {
    const menus = await db.Menu.findAll({
      where: { status: 'active' },
      order: [['sort', 'ASC']],
    });

    // 构建树形结构
    const buildTree = (parentId = null) => {
      return menus
        .filter(menu => menu.parent_id === parentId)
        .map(menu => ({
          ...menu.toJSON(),
          children: buildTree(menu.id),
        }));
    };

    return buildTree();
  }

  /**
   * 获取用户的菜单树
   */
  async getUserMenuTree(userId) {
    const user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.Role,
          as: 'roles',
          include: [
            {
              model: db.Menu,
              as: 'menus',
              where: { status: 'active', visible: true },
              required: false,
            },
          ],
        },
      ],
    });

    if (!user) {
      throw ApiError.notFound('用户不存在');
    }

    // 收集所有菜单（去重）
    const menuSet = new Set();
    const menuIds = new Set();

    user.roles.forEach(role => {
      role.menus.forEach(menu => {
        menuSet.add(JSON.stringify(menu));
        menuIds.add(menu.id);
      });
    });

    let menus = Array.from(menuSet).map(m => JSON.parse(m));

    // 查找并添加所有父菜单（递归向上查找）
    const parentIds = new Set();
    for (const menu of menus) {
      if (menu.parent_id && !menuIds.has(menu.parent_id)) {
        parentIds.add(menu.parent_id);
      }
    }

    // 如果有父菜单需要添加，从数据库查询
    if (parentIds.size > 0) {
      const parentMenus = await db.Menu.findAll({
        where: {
          id: { [Op.in]: Array.from(parentIds) },
          status: 'active',
          visible: true,
        },
      });

      // 将父菜单添加到菜单列表
      parentMenus.forEach(parentMenu => {
        const menuJson = parentMenu.toJSON();
        menuSet.add(JSON.stringify(menuJson));
        menuIds.add(menuJson.id);

        // 递归检查父菜单的父菜单
        if (menuJson.parent_id && !menuIds.has(menuJson.parent_id)) {
          parentIds.add(menuJson.parent_id);
        }
      });

      // 重新构建菜单数组
      menus = Array.from(menuSet).map(m => JSON.parse(m));
    }

    // 构建树形结构
    const buildTree = (parentId = null) => {
      return menus
        .filter(menu => menu.parent_id === parentId)
        .sort((a, b) => a.sort - b.sort)
        .map(menu => ({
          ...menu,
          children: buildTree(menu.id),
        }));
    };

    return buildTree();
  }

  /**
   * 获取单个菜单详情
   */
  async getMenuById(id) {
    const menu = await db.Menu.findByPk(id, {
      include: [
        {
          model: db.Menu,
          as: 'parent',
          attributes: ['id', 'name'],
        },
        {
          model: db.Menu,
          as: 'children',
        },
        {
          model: db.Role,
          as: 'roles',
          through: { attributes: [] },
        },
      ],
    });

    if (!menu) {
      throw ApiError.notFound('菜单不存在');
    }

    return menu;
  }

  /**
   * 创建菜单
   */
  async createMenu(menuData) {
    const {
      parent_id,
      name,
      path,
      component,
      icon,
      type,
      visible,
      sort,
      status,
      permission_code,
    } = menuData;

    // 如果有父菜单，检查父菜单是否存在
    if (parent_id) {
      const parentMenu = await db.Menu.findByPk(parent_id);
      if (!parentMenu) {
        throw ApiError.notFound('父菜单不存在');
      }
    }

    // 创建菜单
    const menu = await db.Menu.create({
      parent_id,
      name,
      path,
      component,
      icon,
      type,
      visible,
      sort,
      status,
      permission_code,
    });

    logger.info(`Menu created: ${name}`);

    return this.getMenuById(menu.id);
  }

  /**
   * 更新菜单
   */
  async updateMenu(id, updateData) {
    const menu = await db.Menu.findByPk(id);

    if (!menu) {
      throw ApiError.notFound('菜单不存在');
    }

    const {
      parent_id,
      name,
      path,
      component,
      icon,
      type,
      visible,
      sort,
      status,
      permission_code,
    } = updateData;

    // 不能将菜单的父级设置为自己或自己的子级
    if (parent_id && parent_id !== menu.parent_id) {
      if (parent_id === id) {
        throw ApiError.badRequest('不能将菜单的父级设置为自己');
      }

      // 检查是否会形成循环引用
      const isDescendant = await this.isDescendant(id, parent_id);
      if (isDescendant) {
        throw ApiError.badRequest('不能将菜单的父级设置为自己的子级');
      }

      // 检查父菜单是否存在
      const parentMenu = await db.Menu.findByPk(parent_id);
      if (!parentMenu) {
        throw ApiError.notFound('父菜单不存在');
      }
    }

    // 更新菜单
    await menu.update({
      parent_id,
      name,
      path,
      component,
      icon,
      type,
      visible,
      sort,
      status,
      permission_code,
    });

    logger.info(`Menu updated: ${menu.name}`);

    return this.getMenuById(id);
  }

  /**
   * 删除菜单
   */
  async deleteMenu(id) {
    const menu = await db.Menu.findByPk(id);

    if (!menu) {
      throw ApiError.notFound('菜单不存在');
    }

    // 检查是否有子菜单
    const childCount = await db.Menu.count({ where: { parent_id: id } });
    if (childCount > 0) {
      throw ApiError.badRequest(`该菜单有 ${childCount} 个子菜单，请先删除子菜单`);
    }

    // 删除角色菜单关联
    await db.RoleMenu.destroy({ where: { menu_id: id } });

    // 删除菜单
    await menu.destroy();

    logger.info(`Menu deleted: ${menu.name}`);

    return { message: '菜单删除成功' };
  }

  /**
   * 检查是否是后代节点（防止循环引用）
   */
  async isDescendant(ancestorId, descendantId) {
    const descendant = await db.Menu.findByPk(descendantId);
    if (!descendant || !descendant.parent_id) {
      return false;
    }

    if (descendant.parent_id === ancestorId) {
      return true;
    }

    return this.isDescendant(ancestorId, descendant.parent_id);
  }
}

module.exports = new MenuService();
