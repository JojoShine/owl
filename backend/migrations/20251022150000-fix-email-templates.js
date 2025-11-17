'use strict';

/**
 * 数据库迁移：修复邮件模版为 title/content 模式
 *
 * 目的：
 * - 将预设的告警模版改为只使用 {{title}} 和 {{content}} 两个变量
 * - 符合系统设计原则：邮件模版不应该使用过多自定义变量
 * - 告警详情将由告警服务动态生成HTML作为content传入
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 更新 CPU 使用率告警模版
    await queryInterface.sequelize.query(`
      UPDATE email_templates
      SET
        subject = '{{title}}',
        content = '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #ff6b6b; margin-top: 0;">⚠️ {{title}}</h2>

    {{{content}}}

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      此邮件由系统自动发送，请勿回复
    </p>
  </div>
</div>'
      WHERE name = 'CPU使用率告警模版'
    `);

    // 更新内存使用率告警模版
    await queryInterface.sequelize.query(`
      UPDATE email_templates
      SET
        subject = '{{title}}',
        content = '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #ff6b6b; margin-top: 0;">⚠️ {{title}}</h2>

    {{{content}}}

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      此邮件由系统自动发送，请勿回复
    </p>
  </div>
</div>'
      WHERE name = '内存使用率告警模版'
    `);

    // 更新接口异常告警模版
    await queryInterface.sequelize.query(`
      UPDATE email_templates
      SET
        subject = '{{title}}',
        content = '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #dc3545; margin-top: 0;">🚨 {{title}}</h2>

    {{{content}}}

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      此邮件由系统自动发送，请勿回复
    </p>
  </div>
</div>'
      WHERE name = '接口异常告警模版'
    `);

    console.log('✓ 成功更新邮件模版为 title/content 模式');
    console.log('  - CPU使用率告警模版');
    console.log('  - 内存使用率告警模版');
    console.log('  - 接口异常告警模版');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Rollback: 恢复原始模版（需要手动实施）');
    // 如果需要回滚，可以在这里添加恢复逻辑
  },
};
