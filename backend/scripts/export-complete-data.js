/**
 * 导出完整的开发环境数据脚本
 * 包括子部门和完整的菜单层级
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

// 导出所有部门(包括子部门)
async function exportAllDepartments() {
  const [departments] = await sequelize.query(`
    SELECT id, parent_id, name, code, leader_id, description, sort, status
    FROM departments
    ORDER BY parent_id NULLS FIRST, sort
  `);
  return departments;
}

// 导出所有菜单(包括完整层级)
async function exportAllMenus() {
  const [menus] = await sequelize.query(`
    SELECT id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code
    FROM menus
    ORDER BY parent_id NULLS FIRST, sort
  `);
  return menus;
}

// 主函数
async function exportCompleteData() {
  console.log('🚀 开始导出完整的开发环境数据...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 导出部门
    const departments = await exportAllDepartments();
    console.log('📊 部门数据:');
    console.log(`   总数: ${departments.length} 条`);
    departments.forEach(d => {
      const prefix = d.parent_id ? '  └─ ' : '';
      console.log(`   ${prefix}${d.name} (${d.code})`);
    });
    console.log('');

    // 导出菜单
    const menus = await exportAllMenus();
    console.log('📊 菜单数据:');
    console.log(`   总数: ${menus.length} 条`);

    // 按层级显示菜单
    const parentMenus = menus.filter(m => !m.parent_id);
    console.log('\n   父菜单:');
    parentMenus.forEach(m => {
      console.log(`   - ${m.name} (${m.path || 'N/A'})`);
      const children = menus.filter(c => c.parent_id === m.id);
      children.forEach(c => {
        console.log(`     └─ ${c.name} (${c.path || 'N/A'})`);
      });
    });
    console.log('');

    // 保存到文件
    const data = {
      departments,
      menus
    };

    const outputPath = path.join(__dirname, '../complete-data-export.json');
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`✅ 数据已导出到: ${outputPath}\n`);
    console.log('🎉 导出完成!\n');

  } catch (error) {
    console.error('❌ 导出失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行导出
exportCompleteData();
