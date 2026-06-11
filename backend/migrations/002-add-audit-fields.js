'use strict';

/**
 * Migration: 添加审计字段（created_by, updated_by, deleted_by）到所有表
 *
 * 这个 migration 为所有现有表添加审计跟踪字段，用于数据访问权限控制 (DAC)
 * created_by: 创建者ID
 * updated_by: 最后更新者ID
 * deleted_by: 删除者ID（用于软删除）
 */

const path = require('path');
const fs = require('fs');

// 需要添加审计字段的表列表
const TABLES_WITH_AUDIT = [
  'owl_alert_history',
  'owl_alert_rules',
  'owl_api_call_logs',
  'owl_api_interfaces',
  'owl_api_keys',
  'owl_api_monitor_logs',
  'owl_api_monitors',

  'owl_dashboard_widgets',
  'owl_departments',
  'owl_dictionary',
  'owl_email_logs',
  'owl_email_templates',
  'owl_file_permissions',
  'owl_file_shares',
  'owl_files',
  'owl_folders',
  'owl_generated_fields',
  'owl_generated_modules',
  'owl_generation_history',
  'owl_menus',
  'owl_monitor_metrics',
  'owl_notification_settings',
  'owl_notifications',
  'owl_permissions',
  'owl_role_menus',
  'owl_role_permissions',
  'owl_roles',
  'owl_sensitive_fields',
  'owl_system_configs',
  'owl_third_party_api_keys',
  'owl_user_roles',
  'owl_user_sessions',
  'owl_users',
  'owl_watermark_config',
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('================================================================================');
    console.log('📦 添加审计字段 - Migration');
    console.log('================================================================================');
    console.log('');

    for (const tableName of TABLES_WITH_AUDIT) {
      try {
        console.log(`⏳ 处理表: ${tableName}`);

        // 检查字段是否已存在
        const columns = await queryInterface.describeTable(tableName);

        // 添加 created_by 字段（如果不存在）
        if (!columns.created_by) {
          await queryInterface.addColumn(tableName, 'created_by', {
            type: Sequelize.UUID,
            allowNull: true,
            comment: '创建者ID'
          });
          console.log(`   ✅ 添加字段: created_by`);
        } else {
          console.log(`   ⚠️  字段已存在: created_by`);
        }

        // 添加 updated_by 字段（如果不存在）
        if (!columns.updated_by) {
          await queryInterface.addColumn(tableName, 'updated_by', {
            type: Sequelize.UUID,
            allowNull: true,
            comment: '最后更新者ID'
          });
          console.log(`   ✅ 添加字段: updated_by`);
        } else {
          console.log(`   ⚠️  字段已存在: updated_by`);
        }

        // 添加 deleted_by 字段（如果不存在）
        if (!columns.deleted_by) {
          await queryInterface.addColumn(tableName, 'deleted_by', {
            type: Sequelize.UUID,
            allowNull: true,
            comment: '删除者ID（用于软删除）'
          });
          console.log(`   ✅ 添加字段: deleted_by`);
        } else {
          console.log(`   ⚠️  字段已存在: deleted_by`);
        }

      } catch (error) {
        console.error(`❌ 处理表 ${tableName} 时出错:`, error.message);
        throw error;
      }
    }

    // 添加 access_level 字段到 owl_users 表
    try {
      console.log('');
      console.log(`⏳ 处理表: owl_users (添加 access_level)`);

      const columns = await queryInterface.describeTable('owl_users');

      if (!columns.access_level) {
        await queryInterface.addColumn('owl_users', 'access_level', {
          type: Sequelize.STRING(50),
          defaultValue: 'SELF',
          allowNull: false,
          comment: '数据访问权限级别：ALL-所有数据，DEPARTMENT-本部门，DEPARTMENT_CHILDREN-本部门及下级，SELF-本人'
        });
        console.log(`   ✅ 添加字段: access_level`);
      } else {
        console.log(`   ⚠️  字段已存在: access_level`);
      }

    } catch (error) {
      console.error(`❌ 处理 owl_users 表时出错:`, error.message);
      throw error;
    }

    // 为 created_by 字段创建索引
    try {
      console.log('');
      console.log(`⏳ 创建索引...`);

      for (const tableName of TABLES_WITH_AUDIT) {
        try {
          const indexName = `idx_${tableName}_created_by`;

          // 检查索引是否存在
          const indexes = await queryInterface.showIndex(tableName);
          const indexExists = indexes.some(idx => idx.name === indexName);

          if (!indexExists) {
            await queryInterface.addIndex(tableName, ['created_by'], {
              name: indexName,
              unique: false
            });
            console.log(`   ✅ 创建索引: ${indexName}`);
          } else {
            console.log(`   ⚠️  索引已存在: ${indexName}`);
          }
        } catch (error) {
          // 某些表可能已经有索引，忽略错误
          console.log(`   ⚠️  索引处理: ${tableName} - ${error.message}`);
        }
      }

    } catch (error) {
      console.error(`❌ 创建索引时出错:`, error.message);
      // 不中断，索引不是关键的
    }

    console.log('');
    console.log('================================================================================');
    console.log('✅ 审计字段添加完成！');
    console.log('================================================================================');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('================================================================================');
    console.log('🔄 回滚审计字段 - Migration');
    console.log('================================================================================');
    console.log('');

    // 回滚时删除字段
    for (const tableName of TABLES_WITH_AUDIT) {
      try {
        console.log(`⏳ 处理表: ${tableName}`);

        const columns = await queryInterface.describeTable(tableName);

        if (columns.created_by) {
          await queryInterface.removeColumn(tableName, 'created_by');
          console.log(`   ✅ 删除字段: created_by`);
        }

        if (columns.updated_by) {
          await queryInterface.removeColumn(tableName, 'updated_by');
          console.log(`   ✅ 删除字段: updated_by`);
        }

        if (columns.deleted_by) {
          await queryInterface.removeColumn(tableName, 'deleted_by');
          console.log(`   ✅ 删除字段: deleted_by`);
        }

      } catch (error) {
        console.error(`❌ 处理表 ${tableName} 时出错:`, error.message);
        throw error;
      }
    }

    // 删除 owl_users 的 access_level 字段
    try {
      console.log('');
      console.log(`⏳ 处理表: owl_users`);

      const columns = await queryInterface.describeTable('owl_users');

      if (columns.access_level) {
        await queryInterface.removeColumn('owl_users', 'access_level');
        console.log(`   ✅ 删除字段: access_level`);
      }

    } catch (error) {
      console.error(`❌ 处理 owl_users 表时出错:`, error.message);
      throw error;
    }

    console.log('');
    console.log('================================================================================');
    console.log('✅ 审计字段回滚完成！');
    console.log('================================================================================');
  }
};
