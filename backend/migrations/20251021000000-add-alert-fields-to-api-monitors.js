'use strict';

/**
 * 数据库迁移：为接口监控表添加告警相关字段
 *
 * 添加字段：
 * - alert_enabled: 是否启用告警
 * - alert_template_id: 告警邮件模版ID
 * - alert_recipients: 告警接收人列表（邮箱地址）
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加告警相关字段
    await queryInterface.addColumn('api_monitors', 'alert_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否启用告警',
    });

    await queryInterface.addColumn('api_monitors', 'alert_template_id', {
      type: Sequelize.UUID,
      allowNull: true,
      comment: '告警邮件模版ID',
      references: {
        model: 'email_templates',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('api_monitors', 'alert_recipients', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '告警接收人邮箱列表',
    });

    // 添加索引以提高查询性能
    await queryInterface.addIndex('api_monitors', ['alert_enabled'], {
      name: 'idx_api_monitors_alert_enabled',
    });

    await queryInterface.addIndex('api_monitors', ['alert_template_id'], {
      name: 'idx_api_monitors_alert_template',
    });

    console.log('✓ 成功为 api_monitors 表添加告警相关字段');
  },

  down: async (queryInterface, Sequelize) => {
    // 删除索引
    await queryInterface.removeIndex('api_monitors', 'idx_api_monitors_alert_template');
    await queryInterface.removeIndex('api_monitors', 'idx_api_monitors_alert_enabled');

    // 删除字段
    await queryInterface.removeColumn('api_monitors', 'alert_recipients');
    await queryInterface.removeColumn('api_monitors', 'alert_template_id');
    await queryInterface.removeColumn('api_monitors', 'alert_enabled');

    console.log('✓ 成功回滚 api_monitors 表的告警字段');
  },
};
