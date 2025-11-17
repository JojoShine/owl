'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建角色表
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '角色ID，主键'
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '角色名称，唯一索引'
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '角色代码，唯一索引，用于权限控制'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '角色描述'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: '角色状态：active-启用，inactive-禁用'
      },
      sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '排序值，数值越小越靠前'
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '软删除时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE roles IS '角色表'"
    );

    // 添加索引
    await queryInterface.addIndex('roles', ['code'], {
      name: 'idx_roles_code'
    });
    await queryInterface.addIndex('roles', ['status'], {
      name: 'idx_roles_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roles');
  }
};
