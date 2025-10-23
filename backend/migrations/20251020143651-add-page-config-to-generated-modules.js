'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('generated_modules', 'page_config', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: '前端页面配置（JSON格式），用于动态渲染页面',
    });

    // 添加索引以提高查询性能
    await queryInterface.addIndex('generated_modules', ['module_path'], {
      name: 'idx_generated_modules_module_path',
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('generated_modules', 'idx_generated_modules_module_path');
    await queryInterface.removeColumn('generated_modules', 'page_config');
  }
};
