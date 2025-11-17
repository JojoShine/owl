'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建部门表
    await queryInterface.createTable('departments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '部门ID，主键'
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '父部门ID，顶级部门为NULL',
        references: {
          model: 'departments',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '部门名称'
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: '部门代码，唯一标识'
      },
      leader_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '部门负责人ID',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '部门描述'
      },
      sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '排序值，数值越小越靠前'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: '部门状态：active-启用，inactive-禁用'
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
      "COMMENT ON TABLE departments IS '部门表'"
    );

    // 添加索引
    await queryInterface.addIndex('departments', ['parent_id'], {
      name: 'idx_departments_parent_id'
    });
    await queryInterface.addIndex('departments', ['status'], {
      name: 'idx_departments_status'
    });
    await queryInterface.addIndex('departments', ['code'], {
      name: 'idx_departments_code'
    });
    await queryInterface.addIndex('departments', ['leader_id'], {
      name: 'idx_departments_leader_id'
    });

    // 给用户表添加部门字段
    await queryInterface.addColumn('users', 'department_id', {
      type: Sequelize.UUID,
      allowNull: true,
      comment: '所属部门ID',
      references: {
        model: 'departments',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    // 给用户表的部门字段添加索引
    await queryInterface.addIndex('users', ['department_id'], {
      name: 'idx_users_department_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 删除用户表的部门字段
    await queryInterface.removeColumn('users', 'department_id');

    // 删除部门表
    await queryInterface.dropTable('departments');
  }
};