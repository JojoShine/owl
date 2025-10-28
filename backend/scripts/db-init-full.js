/**
 * 完整数据库初始化脚本
 * 直接使用 schema.sql + 完整的 seeders
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log,
  }
);

// 执行 SQL 文件
async function executeSqlFile(filePath) {
  const sql = await fs.readFile(filePath, 'utf-8');
  await sequelize.query(sql);
}

// 执行 seeder
async function executeSeeder(seederPath) {
  const seeder = require(seederPath);
  const queryInterface = sequelize.getQueryInterface();
  await seeder.up(queryInterface, Sequelize);
}

// 主函数
async function initDatabase() {
  console.log('🚀 开始完整数据库初始化...\n');

  try {
    // 1. 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 2. 执行 schema.sql 创建所有表
    console.log('📋 执行 schema.sql 创建表结构...');
    const schemaPath = path.join(__dirname, '../schema.sql');
    await executeSqlFile(schemaPath);
    console.log('✅ 表结构创建完成\n');

    // 3. 执行完整的 seeder
    console.log('🌱 插入初始数据...');
    const seederPath = path.join(__dirname, '../seeders/99999999999999-init-complete-data.js');
    await executeSeeder(seederPath);
    console.log('✅ 初始数据插入完成\n');

    console.log('🎉 数据库初始化完成!\n');
    console.log('📝 测试账号：');
    console.log('   超级管理员 - 用户名: admin, 密码: admin123');
    console.log('   管理员     - 用户名: manager, 密码: manager123');
    console.log('   普通用户   - 用户名: user, 密码: user123');
    console.log('');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行初始化
initDatabase();