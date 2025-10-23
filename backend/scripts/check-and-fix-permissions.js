#!/usr/bin/env node

/**
 * 检查并修复数据库中的非CRUD权限
 *
 * 用法：
 *   node scripts/check-and-fix-permissions.js --check    # 只检查，不修复
 *   node scripts/check-and-fix-permissions.js --fix      # 检查并修复
 */

const { Sequelize } = require('sequelize');
const config = require('../src/config/database');

// AccessControl 支持的标准操作
const VALID_ACTIONS = ['create', 'read', 'update', 'delete'];

// 非标准操作到 CRUD 的映射
const ACTION_MAPPING = {
  // 文件操作
  'upload': 'create',
  'download': 'read',
  'preview': 'read',
  'move': 'update',
  'copy': 'create',

  // 日志操作
  'export': 'read',
  'backup': 'create',
  'clean': 'delete',
  'configure': 'update',

  // 监控操作
  'monitor': 'read',
  'manage': 'update',

  // 通知操作
  'send': 'create',
  'view': 'read',

  // 分享操作
  'share': 'create',
  'unshare': 'delete',

  // 审批操作
  'submit': 'create',
  'approve': 'update',
  'reject': 'update',

  // 导入导出
  'import': 'create',
};

// 权限描述更新映射
const DESCRIPTION_UPDATES = {
  'upload': '上传和创建',
  'download': '下载和读取',
  'preview': '预览和查看',
  'move': '移动和更新',
  'copy': '复制和创建',
  'export': '导出和查看',
  'backup': '备份和创建',
  'configure': '配置和更新',
  'monitor': '监控和查看',
  'send': '发送和创建',
};

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const fix = args.includes('--fix');

  if (!checkOnly && !fix) {
    console.log('用法:');
    console.log('  node scripts/check-and-fix-permissions.js --check    # 只检查');
    console.log('  node scripts/check-and-fix-permissions.js --fix      # 检查并修复');
    process.exit(1);
  }

  const env = process.env.NODE_ENV || 'development';
  const dbConfig = config[env];

  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询所有非CRUD权限
    const [invalidPermissions] = await sequelize.query(`
      SELECT id, code, name, resource, action, description, category
      FROM permissions
      WHERE action NOT IN ('create', 'read', 'update', 'delete')
      ORDER BY category, code
    `);

    if (invalidPermissions.length === 0) {
      console.log('✅ 所有权限都符合 CRUD 规范！');
      process.exit(0);
    }

    console.log(`⚠️  发现 ${invalidPermissions.length} 个非CRUD权限：\n`);
    console.log('┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ Code                    │ Action    │ 建议映射  │ 说明            │');
    console.log('├─────────────────────────────────────────────────────────────────────┤');

    invalidPermissions.forEach(perm => {
      const suggestedAction = ACTION_MAPPING[perm.action] || 'read';
      const code = perm.code.padEnd(24);
      const action = perm.action.padEnd(10);
      const suggested = suggestedAction.padEnd(10);
      const name = perm.name.substring(0, 14);

      console.log(`│ ${code}│ ${action}│ ${suggested}│ ${name} │`);
    });
    console.log('└─────────────────────────────────────────────────────────────────────┘\n');

    if (checkOnly) {
      console.log('💡 运行 --fix 参数来修复这些权限');
      process.exit(0);
    }

    // 执行修复
    console.log('🔧 开始修复权限...\n');

    for (const perm of invalidPermissions) {
      const newAction = ACTION_MAPPING[perm.action] || 'read';
      const oldAction = perm.action;

      // 更新权限
      await sequelize.query(`
        UPDATE permissions
        SET action = :newAction,
            updated_at = NOW()
        WHERE id = :id
      `, {
        replacements: {
          id: perm.id,
          newAction: newAction,
        }
      });

      console.log(`✅ ${perm.code}: ${oldAction} → ${newAction}`);
    }

    console.log(`\n✅ 成功修复 ${invalidPermissions.length} 个权限！`);
    console.log('\n📝 建议：');
    console.log('   1. 检查修复后的权限是否符合预期');
    console.log('   2. 更新相关的前端和后端代码');
    console.log('   3. 通知团队成员权限代码的变更');
    console.log('   4. 重新测试所有权限相关功能\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
