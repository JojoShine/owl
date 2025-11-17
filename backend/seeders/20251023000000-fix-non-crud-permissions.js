'use strict';

/**
 * 修复非CRUD权限
 *
 * AccessControl 只支持 4 种标准操作: create, read, update, delete
 * 本迁移将所有非标准操作映射到对应的 CRUD 操作
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 非标准操作到 CRUD 的映射规则
    const actionMapping = [
      // 文件操作
      { from: 'upload', to: 'create', description: '上传即创建' },
      { from: 'download', to: 'read', description: '下载即读取' },
      { from: 'preview', to: 'read', description: '预览即读取' },
      { from: 'move', to: 'update', description: '移动即更新位置' },
      { from: 'copy', to: 'create', description: '复制即创建新文件' },

      // 日志操作
      { from: 'export', to: 'read', description: '导出即读取数据' },
      { from: 'backup', to: 'create', description: '备份即创建备份' },
      { from: 'clean', to: 'delete', description: '清理即删除' },
      { from: 'config', to: 'update', description: '配置即更新设置' },
      { from: 'configure', to: 'update', description: '配置即更新设置' },

      // 监控操作
      { from: 'monitor', to: 'read', description: '监控即读取状态' },
      { from: 'manage', to: 'update', description: '管理即更新配置' },

      // 通知操作
      { from: 'send', to: 'create', description: '发送即创建' },
      { from: 'view', to: 'read', description: '查看即读取' },

      // 分享操作
      { from: 'share', to: 'create', description: '分享即创建链接' },
      { from: 'unshare', to: 'delete', description: '取消即删除' },

      // 审批操作
      { from: 'submit', to: 'create', description: '提交即创建' },
      { from: 'approve', to: 'update', description: '审批即更新状态' },
      { from: 'reject', to: 'update', description: '拒绝即更新状态' },

      // 导入操作
      { from: 'import', to: 'create', description: '导入即批量创建' },
    ];

    console.log('🔍 检查需要修复的权限...\n');

    for (const mapping of actionMapping) {
      // 查找所有使用该非标准操作的权限
      const [permissions] = await queryInterface.sequelize.query(`
        SELECT id, code, name, resource, action, description
        FROM permissions
        WHERE action = :fromAction
      `, {
        replacements: { fromAction: mapping.from }
      });

      if (permissions.length > 0) {
        console.log(`📝 修复 action='${mapping.from}' 的权限 (共 ${permissions.length} 个):`);

        for (const perm of permissions) {
          // 更新权限的 action
          await queryInterface.sequelize.query(`
            UPDATE permissions
            SET action = :toAction,
                updated_at = :now
            WHERE id = :id
          `, {
            replacements: {
              id: perm.id,
              toAction: mapping.to,
              now: now
            }
          });

          console.log(`   ✅ ${perm.code}: ${mapping.from} → ${mapping.to}`);
        }
        console.log('');
      }
    }

    // 检查是否还有其他非CRUD权限
    const [remainingInvalid] = await queryInterface.sequelize.query(`
      SELECT code, action
      FROM permissions
      WHERE action NOT IN ('create', 'read', 'update', 'delete')
    `);

    if (remainingInvalid.length > 0) {
      console.warn('⚠️  警告: 以下权限使用了未映射的 action:');
      remainingInvalid.forEach(perm => {
        console.warn(`   - ${perm.code}: ${perm.action}`);
      });
      console.warn('\n请在 actionMapping 中添加对应的映射规则\n');
    } else {
      console.log('✅ 所有权限已符合 CRUD 规范！\n');
    }

    console.log('📖 权限映射说明:');
    console.log('   - create: 创建、上传、导入、发送、分享、提交');
    console.log('   - read:   查看、读取、下载、预览、导出、监控');
    console.log('   - update: 更新、修改、移动、配置、管理、审批、拒绝');
    console.log('   - delete: 删除、清理、取消分享');
    console.log('');
    console.log('📝 详细映射规则请参考: backend/docs/permission-mapping.md\n');
  },

  async down(queryInterface, Sequelize) {
    console.log('⚠️  回滚操作不支持');
    console.log('原因: 无法确定原始的非标准 action 值');
    console.log('建议: 如需回滚，请从数据库备份恢复\n');
  }
};