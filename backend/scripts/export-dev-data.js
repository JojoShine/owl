/**
 * 导出开发环境数据脚本
 * 用于生成完整的 seeder 数据
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

// 导出权限数据
async function exportPermissions() {
  const [permissions] = await sequelize.query(`
    SELECT code, name, resource, action, category, description
    FROM permissions
    ORDER BY category, code
  `);
  return permissions;
}

// 导出菜单数据
async function exportMenus() {
  const [menus] = await sequelize.query(`
    SELECT id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code
    FROM menus
    ORDER BY sort, name
  `);
  return menus;
}

// 导出角色数据
async function exportRoles() {
  const [roles] = await sequelize.query(`
    SELECT code, name, description, status, sort
    FROM roles
    ORDER BY sort
  `);
  return roles;
}

// 导出角色-权限关联
async function exportRolePermissions() {
  const [rolePermissions] = await sequelize.query(`
    SELECT r.code as role_code, p.code as permission_code
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    JOIN permissions p ON rp.permission_id = p.id
    ORDER BY r.code, p.code
  `);
  return rolePermissions;
}

// 导出角色-菜单关联
async function exportRoleMenus() {
  const [roleMenus] = await sequelize.query(`
    SELECT r.code as role_code, m.name as menu_name
    FROM role_menus rm
    JOIN roles r ON rm.role_id = r.id
    JOIN menus m ON rm.menu_id = m.id
    ORDER BY r.code, m.name
  `);
  return roleMenus;
}

// 导出部门数据
async function exportDepartments() {
  const [departments] = await sequelize.query(`
    SELECT name, code, description, sort, status
    FROM departments
    WHERE parent_id IS NULL
    ORDER BY sort
  `);
  return departments;
}

// 导出邮件模板数据
async function exportEmailTemplates() {
  const [templates] = await sequelize.query(`
    SELECT name, subject, content, template_type, variables, variable_schema, tags, description
    FROM email_templates
    ORDER BY template_type, name
  `);
  return templates;
}

// 主函数
async function exportData() {
  console.log('🚀 开始导出开发环境数据...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 导出所有数据
    const data = {
      permissions: await exportPermissions(),
      menus: await exportMenus(),
      roles: await exportRoles(),
      rolePermissions: await exportRolePermissions(),
      roleMenus: await exportRoleMenus(),
      departments: await exportDepartments(),
      emailTemplates: await exportEmailTemplates(),
    };

    // 生成统计信息
    console.log('📊 数据统计:');
    console.log(`   - 权限: ${data.permissions.length} 条`);
    console.log(`   - 菜单: ${data.menus.length} 条`);
    console.log(`   - 角色: ${data.roles.length} 条`);
    console.log(`   - 角色-权限关联: ${data.rolePermissions.length} 条`);
    console.log(`   - 角色-菜单关联: ${data.roleMenus.length} 条`);
    console.log(`   - 部门: ${data.departments.length} 条`);
    console.log(`   - 邮件模板: ${data.emailTemplates.length} 条`);
    console.log('');

    // 保存到文件
    const outputPath = path.join(__dirname, '../data-export.json');
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`✅ 数据已导出到: ${outputPath}\n`);

    // 输出权限列表
    console.log('📋 权限列表:');
    data.permissions.forEach(p => {
      console.log(`   - ${p.code} (${p.name}) [${p.category}]`);
    });
    console.log('');

    // 输出菜单列表
    console.log('📋 菜单列表:');
    data.menus.forEach(m => {
      const prefix = m.parent_id ? '  └─ ' : '';
      console.log(`   ${prefix}${m.name} (${m.path || 'N/A'})`);
    });
    console.log('');

    console.log('🎉 导出完成!\n');
  } catch (error) {
    console.error('❌ 导出失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行导出
exportData();