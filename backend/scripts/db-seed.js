/**
 * 数据库种子数据脚本 - 不依赖 sequelize-cli
 * 用于生产环境执行 seeders
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

// 创建 SequelizeData 表（用于记录已执行的种子）
async function createDataTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "SequelizeData" (
      name VARCHAR(255) NOT NULL PRIMARY KEY
    );
  `);
}

// 获取已执行的种子
async function getExecutedSeeders() {
  const [results] = await sequelize.query(
    'SELECT name FROM "SequelizeData" ORDER BY name'
  );
  return results.map(r => r.name);
}

// 记录种子
async function recordSeeder(name) {
  await sequelize.query(
    'INSERT INTO "SequelizeData" (name) VALUES (?)',
    { replacements: [name] }
  );
}

// 获取所有种子文件
async function getAllSeeders() {
  const seedersDir = path.join(__dirname, '../seeders');
  const files = await fs.readdir(seedersDir);

  return files
    .filter(f => f.endsWith('.js'))
    .filter(f => !f.includes('skeleton'))
    .filter(f => !f.startsWith('._'))  // 排除 macOS 隐藏文件
    .sort();
}

// 执行种子数据
async function runSeeders() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // 创建 data 表
    await createDataTable();

    // 获取已执行和所有种子
    const executed = await getExecutedSeeders();
    const allSeeders = await getAllSeeders();

    // 找出未执行的种子
    const pending = allSeeders.filter(s => !executed.includes(s));

    if (pending.length === 0) {
      console.log('✅ No pending seeders. Database is seeded!\n');
      return;
    }

    console.log(`📋 Found ${pending.length} pending seeder(s):\n`);
    pending.forEach(s => console.log(`   - ${s}`));
    console.log('');

    // 执行每个种子
    for (const seederFile of pending) {
      console.log(`⏳ Running: ${seederFile}`);

      const seederPath = path.join(__dirname, '../seeders', seederFile);
      const seeder = require(seederPath);

      try {
        // 在事务中执行种子
        await sequelize.transaction(async (transaction) => {
          const queryInterface = sequelize.getQueryInterface();

          // 执行 up 方法
          await seeder.up(queryInterface, Sequelize, { transaction });

          // 记录种子
          await recordSeeder(seederFile);
        });

        console.log(`✅ Completed: ${seederFile}\n`);
      } catch (error) {
        console.error(`❌ Failed: ${seederFile}`);
        console.error(`   Error: ${error.message}\n`);
        throw error;
      }
    }

    console.log('🎉 All seeders completed successfully!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行单个种子文件
async function runSingleSeeder(seederName) {
  console.log(`🌱 Running single seeder: ${seederName}\n`);

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    await createDataTable();

    const seederPath = path.join(__dirname, '../seeders', seederName);

    // 检查文件是否存在
    try {
      await fs.access(seederPath);
    } catch {
      console.error(`❌ Seeder file not found: ${seederName}\n`);
      process.exit(1);
    }

    const seeder = require(seederPath);

    console.log(`⏳ Running: ${seederName}`);

    await sequelize.transaction(async (transaction) => {
      const queryInterface = sequelize.getQueryInterface();
      await seeder.up(queryInterface, Sequelize, { transaction });
      await recordSeeder(seederName);
    });

    console.log(`✅ Completed: ${seederName}\n`);
    console.log('🎉 Seeder completed successfully!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 命令行参数处理
const command = process.argv[2];
const seederName = process.argv[3];

if (command === 'all' || !command) {
  runSeeders();
} else if (command === 'file' && seederName) {
  runSingleSeeder(seederName);
} else {
  console.error('Usage:');
  console.error('  node db-seed.js [all]              - Run all pending seeders');
  console.error('  node db-seed.js file <filename>    - Run a specific seeder');
  process.exit(1);
}
