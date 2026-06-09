'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Sequelize Seeder: Initial Data
 * 读取 sql/ 目录下的所有 SQL 文件并按文件名排序执行
 * 确保初始数据的完整性和依赖关系的正确性
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const seederFile = path.join(__dirname, '..', 'sql', 'seeder.sql');

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📦 初始数据导入 Seeder`);
    console.log(`${'='.repeat(80)}`);
    console.log(`\n⚠️  提醒: 确保数据库表结构已经初始化！`);
    console.log(`请在执行本 Seeder 前运行：npm run db:migrate\n`);

    // 检查文件是否存在
    if (!fs.existsSync(seederFile)) {
      console.log(`❌ Seeder 文件不存在: ${seederFile}`);
      throw new Error(`Seeder 文件不存在`);
    }

    try {
      const sql = fs.readFileSync(seederFile, 'utf8').trim();

      console.log(`🧹 清空现有数据...\n`);

      // 获取所有表
      const tables = await queryInterface.showAllTables();
      const dataTables = tables.filter(t => !t.includes('sequelize') && t !== 'SequelizeMeta');

      // 禁用外键约束
      await queryInterface.sequelize.query(`SET session_replication_role = replica;`);

      // 清空所有表
      for (const table of dataTables) {
        try {
          await queryInterface.sequelize.query(`TRUNCATE TABLE "${table}" CASCADE;`);
          console.log(`   ✅ 清空表: ${table}`);
        } catch (e) {
          console.log(`   ⚠️  无法清空表 ${table}`);
        }
      }

      // 重新启用外键约束
      await queryInterface.sequelize.query(`SET session_replication_role = DEFAULT;`);

      console.log(`\n⏳ 导入初始数据...\n`);

      // 直接执行整个 SQL 文件
      await queryInterface.sequelize.query(sql);

      console.log(`\n${'='.repeat(80)}`);
      console.log(`✅ 初始数据导入完成！`);
      console.log(`${'='.repeat(80)}\n`);
    } catch (error) {
      console.error(`\n❌ 初始数据导入失败`);
      console.error(`   错误: ${error.message}\n`);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('\n⚠️  警告: 回滚 Seeder 将删除所有初始数据！');
    console.log('这将清空所有数据表的内容。\n');

    const tables = [
      'owl_generation_history',
      'owl_generated_fields',
      'owl_api_interfaces',
      'owl_api_keys',
      'owl_email_templates',
      'owl_notification_settings',
      'owl_file_shares',
      'owl_files',
      'owl_folders',
      'owl_watermark_config',
      'owl_user_roles',
      'owl_role_menus',
      'owl_role_permissions',
      'owl_users',
      'owl_menus',
      'owl_permissions',
      'owl_roles',
      'owl_departments',
    ];

    for (const table of tables) {
      try {
        console.log(`🗑️  清空表: ${table}`);
        await queryInterface.bulkDelete(table, {}, {});
      } catch (error) {
        console.warn(`   警告: 无法清空表 ${table} - ${error.message}`);
      }
    }

    console.log('\n✅ Seeder 回滚完成！\n');
  },
};
