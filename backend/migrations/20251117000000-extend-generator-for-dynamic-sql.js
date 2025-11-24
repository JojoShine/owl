/**
 * 数据库迁移：扩展代码生成器支持动态SQL和字段分组
 *
 * 新增功能：
 * 1. 动态SQL查询配置
 * 2. 详情页展示模式选择（Dialog/Page）
 * 3. 字段分组（信息簇）配置
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // ========================================
    // 1. 扩展 generated_modules 表
    // ========================================

    // 添加自定义SQL查询字段
    await queryInterface.addColumn('generated_modules', 'custom_sql', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '自定义SQL查询语句（支持多表查询）'
    });

    // 添加SQL参数配置字段
    await queryInterface.addColumn('generated_modules', 'sql_parameters', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'SQL参数配置（参数化查询）'
    });

    // 添加详情展示模式字段
    await queryInterface.addColumn('generated_modules', 'detail_display_mode', {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: 'dialog',
      comment: '详情展示模式: dialog(弹窗) | page(独立页面)'
    });

    // 添加详情页URL模式字段
    await queryInterface.addColumn('generated_modules', 'detail_url_pattern', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: '详情页URL模式（Page模式使用）'
    });

    // 添加SQL主键字段配置
    await queryInterface.addColumn('generated_modules', 'sql_primary_key', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'id',
      comment: '动态SQL查询结果的主键字段名'
    });

    // ========================================
    // 2. 扩展 generated_fields 表
    // ========================================

    // 添加字段分组配置
    await queryInterface.addColumn('generated_fields', 'field_group', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'default',
      comment: '字段所属分组（信息簇）'
    });

    // 添加详情页显示控制
    await queryInterface.addColumn('generated_fields', 'show_in_detail', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: '是否在详情页显示'
    });

    // 添加详情页排序
    await queryInterface.addColumn('generated_fields', 'detail_sort', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '详情页显示顺序（数字越小越靠前）'
    });

    // 添加详情页标签配置
    await queryInterface.addColumn('generated_fields', 'detail_label', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '详情页显示标签（自定义字段名称）'
    });

    // 添加详情页组件类型
    await queryInterface.addColumn('generated_fields', 'detail_component', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: '详情页显示组件类型'
    });

    console.log('✅ 数据库迁移完成：代码生成器已扩展支持动态SQL和字段分组');
  },

  async down(queryInterface, Sequelize) {
    // ========================================
    // 回滚操作：删除新增字段
    // ========================================

    // 回滚 generated_modules 表
    await queryInterface.removeColumn('generated_modules', 'custom_sql');
    await queryInterface.removeColumn('generated_modules', 'sql_parameters');
    await queryInterface.removeColumn('generated_modules', 'detail_display_mode');
    await queryInterface.removeColumn('generated_modules', 'detail_url_pattern');
    await queryInterface.removeColumn('generated_modules', 'sql_primary_key');

    // 回滚 generated_fields 表
    await queryInterface.removeColumn('generated_fields', 'field_group');
    await queryInterface.removeColumn('generated_fields', 'show_in_detail');
    await queryInterface.removeColumn('generated_fields', 'detail_sort');
    await queryInterface.removeColumn('generated_fields', 'detail_label');
    await queryInterface.removeColumn('generated_fields', 'detail_component');

    console.log('✅ 数据库回滚完成：已删除动态SQL和字段分组相关字段');
  }
};
