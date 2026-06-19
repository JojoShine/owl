'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Sequelize Migration: Initial Schema
 * 读取 sql/ 目录下的所有 SQL 文件并按文件名排序执行
 * 确保数据库结构的完整和依赖关系的正确性
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 获取当前平台的 SQL 文件目录
    const platform = queryInterface.sequelize.options.dialect;
    const sqlDir = path.join(__dirname, 'postgres', 'sql');

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📦 数据库初始化 - ${platform.toUpperCase()}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`\n⚠️  警告: 此操作将删除所有现有表和数据！`);
    console.log(`请确保：`);
    console.log(`  1. 您正在使用的是 "空库" 或 "测试库"`);
    console.log(`  2. 所有重要数据已备份`);
    console.log(`  3. 确保这不是生产环境\n`);

    // 强制删除所有表和对象
    if (platform === 'postgres') {
      console.log(`🧹 第一步：强制清理所有数据库对象...\n`);

      try {
        // 获取所有表
        const tables = await queryInterface.showAllTables();
        const dataTables = tables.filter(t => !t.includes('sequelize'));

        // 先禁用所有外键约束
        console.log(`   • 禁用外键约束...`);
        await queryInterface.sequelize.query(`SET session_replication_role = replica;`);

        // 删除所有表
        for (const table of dataTables) {
          try {
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
            console.log(`   ✅ 删除表: ${table}`);
          } catch (e) {
            console.log(`   ⚠️  表 ${table} 删除失败，继续...`);
          }
        }

        // 重新启用外键约束
        console.log(`   • 重新启用外键约束...`);
        await queryInterface.sequelize.query(`SET session_replication_role = DEFAULT;`);

        // 删除所有 Enum 类型
        console.log(`\n   • 删除 Enum 类型...`);
        const enums = [
          'enum_owl_departments_status',
          'enum_owl_email_logs_status',
          'enum_owl_menus_status',
          'enum_owl_menus_type',
          'enum_owl_menus_menu_type',
          'enum_owl_notifications_type',
          'enum_owl_roles_status',
          'enum_owl_users_status',
          'enum_owl_user_sessions_status',
          'enum_owl_sensitive_fields_mask_type',
        ];

        for (const enumType of enums) {
          try {
            await queryInterface.sequelize.query(`DROP TYPE IF EXISTS ${enumType} CASCADE;`);
            console.log(`   ✅ 删除 Enum: ${enumType}`);
          } catch (e) {
            // 继续
          }
        }
      } catch (error) {
        console.error(`❌ 清理失败: ${error.message}`);
        throw error;
      }
    }

    // 读取所有 SQL 文件（按文件名排序）
    const sqlFiles = fs.readdirSync(sqlDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🏗️  第二步：建立数据库表结构`);
    console.log(`${'='.repeat(80)}`);
    console.log(`📄 找到 ${sqlFiles.length} 个 SQL 文件\n`);

    // 顺序执行每个 SQL 文件
    for (const sqlFile of sqlFiles) {
      const sqlPath = path.join(sqlDir, sqlFile);
      const sql = fs.readFileSync(sqlPath, 'utf8').trim();

      if (sql.length === 0) {
        console.log(`⏭️  跳过空文件: ${sqlFile}`);
        continue;
      }

      try {
        console.log(`⏳ 执行: ${sqlFile}`);

        // 将 SQL 分割为多个语句（处理注释和空行）
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        // 逐个执行语句
        for (const statement of statements) {
          await queryInterface.sequelize.query(statement + ';');
        }

        console.log(`✅ 完成: ${sqlFile}`);
      } catch (error) {
        console.error(`❌ 执行失败: ${sqlFile}`);
        console.error(`   错误: ${error.message}`);
        throw error;
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`✅ 数据库初始化 Migration 执行完成！`);
    console.log(`${'='.repeat(80)}\n`);
  },

  down: async (queryInterface, Sequelize) => {
    console.log('\n⚠️  警告: 回滚初始 Migration 将删除所有表！');
    console.log('执行回滚前请确保已备份数据！\n');

    const platform = queryInterface.sequelize.options.dialect;

    try {
      // 获取所有表并删除
      const tables = await queryInterface.showAllTables();
      const dataTables = tables.filter(t => !t.includes('sequelize'));

      if (dataTables.length > 0) {
        // 先禁用外键约束
        if (platform === 'postgres') {
          await queryInterface.sequelize.query(`SET session_replication_role = replica;`);
        }

        // 删除所有表
        for (const table of dataTables) {
          try {
            console.log(`🗑️  删除表: ${table}`);
            await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
          } catch (error) {
            console.warn(`   警告: 无法删除表 ${table} - ${error.message}`);
          }
        }

        // 重新启用外键约束
        if (platform === 'postgres') {
          await queryInterface.sequelize.query(`SET session_replication_role = DEFAULT;`);

          // 删除所有 Enum 类型
          const enums = [
            'enum_owl_departments_status',
            'enum_owl_email_logs_status',
            'enum_owl_menus_status',
            'enum_owl_menus_type',
            'enum_owl_menus_menu_type',
            'enum_owl_notifications_type',
            'enum_owl_roles_status',
            'enum_owl_users_status',
            'enum_owl_user_sessions_status',
            'enum_owl_sensitive_fields_mask_type',
          ];

          for (const enumType of enums) {
            try {
              await queryInterface.sequelize.query(`DROP TYPE IF EXISTS ${enumType} CASCADE;`);
              console.log(`🗑️  删除 Enum: ${enumType}`);
            } catch (e) {
              // 继续
            }
          }
        }
      }

      console.log('\n✅ 所有表和 Enum 类型已删除\n');
    } catch (error) {
      console.error(`❌ 回滚失败: ${error.message}\n`);
      throw error;
    }
  }

    // 删除所有自定义 Enum 类型（PostgreSQL）
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      const enums = [
        'enum_owl_departments_status',
        'enum_owl_email_logs_status',
        'enum_owl_menus_status',
        'enum_owl_menus_type',
        'enum_owl_menus_menu_type',
        'enum_owl_notifications_type',
        'enum_owl_roles_status',
        'enum_owl_users_status',
        'enum_owl_user_sessions_status',
        'enum_owl_sensitive_fields_mask_type',
      ];

      for (const enumType of enums) {
        try {
          await queryInterface.sequelize.query(`DROP TYPE IF EXISTS ${enumType} CASCADE;`);
          console.log(`🗑️  删除 Enum 类型: ${enumType}`);
        } catch (error) {
          console.warn(`   警告: 无法删除 Enum 类型 ${enumType}`);
        }
      }
    }

    console.log('\n✅ 回滚完成！\n');
  },
};
