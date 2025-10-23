'use strict';

/**
 * 数据库迁移：为邮件模版表添加模版类型字段
 *
 * 添加字段：
 * - template_type: 模版类型（API_MONITOR_ALERT, SYSTEM_ALERT, GENERAL_NOTIFICATION）
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加模版类型字段
    await queryInterface.addColumn('email_templates', 'template_type', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: '模版类型：API_MONITOR_ALERT, SYSTEM_ALERT, GENERAL_NOTIFICATION',
      defaultValue: 'GENERAL_NOTIFICATION',
    });

    // 添加索引
    await queryInterface.addIndex('email_templates', ['template_type'], {
      name: 'idx_email_templates_type',
    });

    console.log('✓ 成功为 email_templates 表添加模版类型字段');
  },

  down: async (queryInterface, Sequelize) => {
    // 删除索引
    await queryInterface.removeIndex('email_templates', 'idx_email_templates_type');

    // 删除字段
    await queryInterface.removeColumn('email_templates', 'template_type');

    console.log('✓ 成功回滚 email_templates 表的模版类型字段');
  },
};
