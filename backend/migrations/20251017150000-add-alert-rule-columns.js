'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加 metric_name 列
    await queryInterface.addColumn('alert_rules', 'metric_name', {
      type: Sequelize.STRING(50),
      allowNull: true, // 先设为可空，稍后更新
      comment: '监控指标名称'
    });

    // 添加 level 列
    await queryInterface.addColumn('alert_rules', 'level', {
      type: Sequelize.STRING(20),
      defaultValue: 'warning',
      comment: '告警级别：info, warning, error, critical'
    });

    // 如果有现有数据，需要给 metric_name 设置默认值
    await queryInterface.sequelize.query(
      "UPDATE alert_rules SET metric_name = 'cpu_usage' WHERE metric_name IS NULL"
    );

    // 现在可以将 metric_name 设为 NOT NULL
    await queryInterface.changeColumn('alert_rules', 'metric_name', {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: '监控指标名称'
    });

    console.log('✅ 已添加 alert_rules 表的 metric_name 和 level 列');
  },

  down: async (queryInterface, Sequelize) => {
    // 删除添加的列
    await queryInterface.removeColumn('alert_rules', 'metric_name');
    await queryInterface.removeColumn('alert_rules', 'level');

    console.log('✅ 已回滚 alert_rules 表的列修改');
  }
};
