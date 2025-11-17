'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 添加新字段 success
    await queryInterface.addColumn('generation_history', 'success', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: '是否成功'
    });

    // 2. 添加新字段 error_message
    await queryInterface.addColumn('generation_history', 'error_message', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '错误信息'
    });

    // 3. 添加新字段 operation_type
    await queryInterface.addColumn('generation_history', 'operation_type', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: '操作类型: create/update/delete'
    });

    // 4. 添加新字段 generated_by
    await queryInterface.addColumn('generation_history', 'generated_by', {
      type: Sequelize.UUID,
      allowNull: true,
      comment: '操作人',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    // 5. 将现有 action 数据复制到 operation_type
    await queryInterface.sequelize.query(
      "UPDATE generation_history SET operation_type = action WHERE action IS NOT NULL"
    );

    // 6. 将现有 created_by 数据复制到 generated_by
    await queryInterface.sequelize.query(
      "UPDATE generation_history SET generated_by = created_by WHERE created_by IS NOT NULL"
    );

    // 7. 修改原有字段允许为空
    await queryInterface.changeColumn('generation_history', 'table_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '数据库表名'
    });

    await queryInterface.changeColumn('generation_history', 'module_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '模块名称'
    });

    await queryInterface.changeColumn('generation_history', 'action', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: '操作类型: create/update/delete (已废弃，使用operation_type)'
    });

    // 8. 添加索引
    await queryInterface.addIndex('generation_history', ['generated_by'], {
      name: 'idx_generation_history_generated_by'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 移除添加的索引
    await queryInterface.removeIndex('generation_history', 'idx_generation_history_generated_by');

    // 恢复原有字段约束
    await queryInterface.changeColumn('generation_history', 'table_name', {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: '数据库表名'
    });

    await queryInterface.changeColumn('generation_history', 'module_name', {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: '模块名称'
    });

    await queryInterface.changeColumn('generation_history', 'action', {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: '操作类型: create/update/delete'
    });

    // 移除添加的字段
    await queryInterface.removeColumn('generation_history', 'generated_by');
    await queryInterface.removeColumn('generation_history', 'operation_type');
    await queryInterface.removeColumn('generation_history', 'error_message');
    await queryInterface.removeColumn('generation_history', 'success');
  }
};
