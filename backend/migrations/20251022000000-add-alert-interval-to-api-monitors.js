'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('api_monitors', 'alert_interval', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1800, // 默认30分钟（1800秒）
      comment: '告警间隔（秒）- 持续异常时的告警发送间隔',
      after: 'alert_recipients',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('api_monitors', 'alert_interval');
  },
};
