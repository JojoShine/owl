'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建菜单表
    await queryInterface.createTable('menus', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '菜单ID，主键'
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '父菜单ID，顶级菜单为NULL',
        references: {
          model: 'menus',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '菜单名称'
      },
      path: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '前端路由路径'
      },
      component: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '前端组件路径'
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '菜单图标名称'
      },
      type: {
        type: Sequelize.ENUM('menu', 'button', 'link'),
        defaultValue: 'menu',
        comment: '菜单类型：menu-菜单，button-按钮，link-外链'
      },
      visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否可见：true-显示，false-隐藏'
      },
      sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '排序值，数值越小越靠前'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: '菜单状态：active-启用，inactive-禁用'
      },
      permission_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '关联的权限代码'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '更新时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE menus IS '菜单表'"
    );

    // 添加索引
    await queryInterface.addIndex('menus', ['parent_id'], {
      name: 'idx_menus_parent_id'
    });
    await queryInterface.addIndex('menus', ['status'], {
      name: 'idx_menus_status'
    });
    await queryInterface.addIndex('menus', ['type'], {
      name: 'idx_menus_type'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('menus');
  }
};
