'use strict';

/**
 * 数据库迁移：为邮件模版表添加变量映射配置化支持
 *
 * 添加字段：
 * - variable_schema: 变量Schema定义（JSON），定义模版需要哪些变量
 * - tags: 标签列表（JSON），替代固定的 template_type 分类
 *
 * 目的：
 * - 实现变量映射配置化，使模版与使用场景解耦
 * - 新模块接入只需配置变量映射，无需修改代码
 * - 提升系统灵活性和扩展性
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 添加 variable_schema 字段
    await queryInterface.addColumn('email_templates', 'variable_schema', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '变量Schema定义：[{ name, label, description, type, required, defaultValue, example }]',
    });

    // 2. 添加 tags 字段
    await queryInterface.addColumn('email_templates', 'tags', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
      comment: '标签列表：["monitoring", "alert", "api"]，替代固定分类',
    });

    // 3. 迁移现有数据：从 variables 生成 variable_schema
    const [templates] = await queryInterface.sequelize.query(
      'SELECT id, variables, template_type FROM email_templates WHERE variables IS NOT NULL'
    );

    for (const template of templates) {
      const variables = template.variables;
      if (Array.isArray(variables) && variables.length > 0) {
        // 将简单的变量列表转换为 variable_schema
        const variableSchema = variables.map(varName => ({
          name: varName,
          label: varName,
          description: `${varName} 变量`,
          type: 'string',
          required: false,
          defaultValue: '',
          example: `示例${varName}`
        }));

        await queryInterface.sequelize.query(
          'UPDATE email_templates SET variable_schema = :schema WHERE id = :id',
          {
            replacements: {
              schema: JSON.stringify(variableSchema),
              id: template.id
            }
          }
        );
      }

      // 根据 template_type 生成初始 tags
      const templateType = template.template_type;
      let tags = [];

      if (templateType === 'API_MONITOR_ALERT') {
        tags = ['monitoring', 'alert', 'api'];
      } else if (templateType === 'SYSTEM_ALERT') {
        tags = ['system', 'alert', 'monitoring'];
      } else if (templateType === 'GENERAL_NOTIFICATION') {
        tags = ['notification', 'general'];
      }

      if (tags.length > 0) {
        await queryInterface.sequelize.query(
          'UPDATE email_templates SET tags = :tags WHERE id = :id',
          {
            replacements: {
              tags: JSON.stringify(tags),
              id: template.id
            }
          }
        );
      }
    }

    console.log('✓ 成功为 email_templates 表添加 variable_schema 和 tags 字段');
    console.log(`✓ 已迁移 ${templates.length} 个模版的变量配置`);
  },

  down: async (queryInterface, Sequelize) => {
    // 删除字段
    await queryInterface.removeColumn('email_templates', 'variable_schema');
    await queryInterface.removeColumn('email_templates', 'tags');

    console.log('✓ 成功回滚 email_templates 表的 variable_schema 和 tags 字段');
  },
};