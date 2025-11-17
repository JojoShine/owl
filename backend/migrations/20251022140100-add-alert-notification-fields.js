'use strict';

/**
 * 数据库迁移：为告警规则表添加邮件通知字段
 *
 * 添加字段：
 * - alert_enabled: 是否启用邮件告警
 * - alert_template_id: 告警邮件模版ID（外键关联 email_templates）
 * - alert_recipients: 告警接收人邮箱列表（JSON）
 * - alert_interval: 告警间隔（秒），防止告警轰炸
 *
 * 目的：
 * - 为告警规则添加邮件通知功能
 * - 与接口监控的告警配置保持一致
 * - 支持告警间隔控制，避免短时间内重复发送相同告警
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 添加 alert_enabled 字段
    await queryInterface.addColumn('alert_rules', 'alert_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否启用邮件告警',
    });

    // 2. 添加 alert_template_id 字段
    await queryInterface.addColumn('alert_rules', 'alert_template_id', {
      type: Sequelize.UUID,
      allowNull: true,
      comment: '告警邮件模版ID',
      references: {
        model: 'email_templates',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // 3. 添加 alert_recipients 字段
    await queryInterface.addColumn('alert_rules', 'alert_recipients', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '告警接收人邮箱列表',
    });

    // 4. 添加 alert_interval 字段
    await queryInterface.addColumn('alert_rules', 'alert_interval', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1800,
      comment: '告警间隔（秒）- 持续异常时的告警发送间隔，默认30分钟',
    });

    // 5. 添加检查约束（告警间隔范围：60秒-24小时）
    await queryInterface.sequelize.query(`
      ALTER TABLE alert_rules
      ADD CONSTRAINT alert_interval_range
      CHECK (alert_interval >= 60 AND alert_interval <= 86400)
    `);

    console.log('✓ 成功为 alert_rules 表添加邮件通知字段：');
    console.log('  - alert_enabled (是否启用告警)');
    console.log('  - alert_template_id (邮件模版ID)');
    console.log('  - alert_recipients (接收人列表)');
    console.log('  - alert_interval (告警间隔)');
  },

  down: async (queryInterface, Sequelize) => {
    // 删除检查约束
    await queryInterface.sequelize.query(`
      ALTER TABLE alert_rules DROP CONSTRAINT IF EXISTS alert_interval_range
    `);

    // 删除字段
    await queryInterface.removeColumn('alert_rules', 'alert_interval');
    await queryInterface.removeColumn('alert_rules', 'alert_recipients');
    await queryInterface.removeColumn('alert_rules', 'alert_template_id');
    await queryInterface.removeColumn('alert_rules', 'alert_enabled');

    console.log('✓ 成功回滚 alert_rules 表的邮件通知字段');
  },
};
