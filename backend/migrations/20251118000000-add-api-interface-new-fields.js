module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. 添加 query_type 字段
    await queryInterface.addColumn('api_interfaces', 'query_type', {
      type: Sequelize.STRING(20),
      defaultValue: 'raw',
      comment: '查询类型: raw | builder'
    });

    // 2. 添加 query_config 字段
    await queryInterface.addColumn('api_interfaces', 'query_config', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: '查询配置（包含SQL、表、字段等）'
    });

    // 3. 添加 params_schema 字段
    await queryInterface.addColumn('api_interfaces', 'params_schema', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: '参数schema定义'
    });

    // 4. 添加 response_transform 字段
    await queryInterface.addColumn('api_interfaces', 'response_transform', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '响应转换代码'
    });

    // 5. 添加 rate_limit 字段
    await queryInterface.addColumn('api_interfaces', 'rate_limit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '限流（次/分钟）'
    });

    // 6. 修改 sql_template 为可空（兼容新旧结构）
    await queryInterface.changeColumn('api_interfaces', 'sql_template', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'SQL模板（旧字段，兼容保留）'
    });
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作：删除新增的字段
    await queryInterface.removeColumn('api_interfaces', 'query_type');
    await queryInterface.removeColumn('api_interfaces', 'query_config');
    await queryInterface.removeColumn('api_interfaces', 'params_schema');
    await queryInterface.removeColumn('api_interfaces', 'response_transform');
    await queryInterface.removeColumn('api_interfaces', 'rate_limit');

    // 恢复 sql_template 为非空
    await queryInterface.changeColumn('api_interfaces', 'sql_template', {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: 'SQL模板'
    });
  }
};
