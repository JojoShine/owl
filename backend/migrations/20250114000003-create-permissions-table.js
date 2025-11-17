'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建权限表
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '权限ID，主键'
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '权限名称'
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '权限代码，唯一索引，格式：resource:action'
      },
      resource: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '资源名称，如：user, role, menu'
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '操作类型：create-创建，read-读取，update-更新，delete-删除'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '权限描述'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '权限分类，如：用户管理、角色管理'
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
      "COMMENT ON TABLE permissions IS '权限表'"
    );

    // 添加索引
    await queryInterface.addIndex('permissions', ['code'], {
      name: 'idx_permissions_code'
    });
    await queryInterface.addIndex('permissions', ['resource'], {
      name: 'idx_permissions_resource'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('permissions');
  }
};
