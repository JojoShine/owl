'use strict';

/**
 * 数据库迁移：为接口监控表添加变量映射配置
 *
 * 添加字段：
 * - variable_mapping: 变量映射配置（JSON）
 *
 * 目的：
 * - 配置如何从监控数据中提取变量并映射到邮件模版
 * - 实现配置驱动，无需修改代码即可适配不同模版
 *
 * 示例：
 * {
 *   "monitorName": "name",
 *   "url": "url",
 *   "status": "lastLog.status",
 *   "timestamp": "__timestamp__"
 * }
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加 variable_mapping 字段
    await queryInterface.addColumn('api_monitors', 'variable_mapping', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '变量映射配置：{ 模版变量名: 数据字段路径 }',
    });

    // 为已有的监控配置生成默认映射（如果启用了告警）
    const [monitors] = await queryInterface.sequelize.query(
      'SELECT id, alert_enabled, alert_template_id FROM api_monitors WHERE alert_enabled = true AND alert_template_id IS NOT NULL'
    );

    // 生成默认的变量映射（基于当前硬编码的逻辑）
    const defaultMapping = {
      'monitorName': 'name',
      'url': 'url',
      'method': 'method',
      'status': 'lastLog.status',
      'statusCode': 'lastLog.status_code',
      'errorMessage': 'lastLog.error_message',
      'responseTime': 'lastLog.response_time',
      'timestamp': '__timestamp__'
    };

    for (const monitor of monitors) {
      await queryInterface.sequelize.query(
        'UPDATE api_monitors SET variable_mapping = :mapping WHERE id = :id',
        {
          replacements: {
            mapping: JSON.stringify(defaultMapping),
            id: monitor.id
          }
        }
      );
    }

    console.log('✓ 成功为 api_monitors 表添加 variable_mapping 字段');
    console.log(`✓ 已为 ${monitors.length} 个监控配置生成默认变量映射`);
  },

  down: async (queryInterface, Sequelize) => {
    // 删除字段
    await queryInterface.removeColumn('api_monitors', 'variable_mapping');

    console.log('✓ 成功回滚 api_monitors 表的 variable_mapping 字段');
  },
};