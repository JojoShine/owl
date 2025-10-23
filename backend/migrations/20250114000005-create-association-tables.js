'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建用户角色关联表
    await queryInterface.createTable('user_roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '关联ID，主键'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '用户ID，外键关联users表',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '角色ID，外键关联roles表',
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    });

    // 添加唯一约束
    await queryInterface.addConstraint('user_roles', {
      fields: ['user_id', 'role_id'],
      type: 'unique',
      name: 'user_roles_user_id_role_id_unique'
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE user_roles IS '用户角色关联表'"
    );

    // 添加索引
    await queryInterface.addIndex('user_roles', ['user_id'], {
      name: 'idx_user_roles_user_id'
    });
    await queryInterface.addIndex('user_roles', ['role_id'], {
      name: 'idx_user_roles_role_id'
    });

    // 创建角色权限关联表
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '关联ID，主键'
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '角色ID，外键关联roles表',
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '权限ID，外键关联permissions表',
        references: {
          model: 'permissions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    });

    // 添加唯一约束
    await queryInterface.addConstraint('role_permissions', {
      fields: ['role_id', 'permission_id'],
      type: 'unique',
      name: 'role_permissions_role_id_permission_id_unique'
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE role_permissions IS '角色权限关联表'"
    );

    // 添加索引
    await queryInterface.addIndex('role_permissions', ['role_id'], {
      name: 'idx_role_permissions_role_id'
    });
    await queryInterface.addIndex('role_permissions', ['permission_id'], {
      name: 'idx_role_permissions_permission_id'
    });

    // 创建角色菜单关联表
    await queryInterface.createTable('role_menus', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '关联ID，主键'
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '角色ID，外键关联roles表',
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      menu_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '菜单ID，外键关联menus表',
        references: {
          model: 'menus',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    });

    // 添加唯一约束
    await queryInterface.addConstraint('role_menus', {
      fields: ['role_id', 'menu_id'],
      type: 'unique',
      name: 'role_menus_role_id_menu_id_unique'
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE role_menus IS '角色菜单关联表'"
    );

    // 添加索引
    await queryInterface.addIndex('role_menus', ['role_id'], {
      name: 'idx_role_menus_role_id'
    });
    await queryInterface.addIndex('role_menus', ['menu_id'], {
      name: 'idx_role_menus_menu_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('role_menus');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('user_roles');
  }
};
