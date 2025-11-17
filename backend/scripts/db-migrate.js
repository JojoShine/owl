/**
 * 数据库迁移脚本 - 不依赖 sequelize-cli
 * 用于生产环境执行 migrations
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

// 创建 SequelizeMeta 表（用于记录已执行的迁移）
async function createMetaTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
      name VARCHAR(255) NOT NULL PRIMARY KEY
    );
  `);
}

// 获取已执行的迁移
async function getExecutedMigrations() {
  const [results] = await sequelize.query(
    'SELECT name FROM "SequelizeMeta" ORDER BY name'
  );
  return results.map(r => r.name);
}

// 记录迁移
async function recordMigration(name) {
  await sequelize.query(
    'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
    { replacements: [name] }
  );
}

// 删除迁移记录
async function removeMigrationRecord(name) {
  await sequelize.query(
    'DELETE FROM "SequelizeMeta" WHERE name = ?',
    { replacements: [name] }
  );
}

// 获取所有迁移文件
async function getAllMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = await fs.readdir(migrationsDir);

  return files
    .filter(f => f.endsWith('.js'))
    .filter(f => !f.includes('skeleton'))
    .filter(f => !f.startsWith('._'))  // 排除 macOS 隐藏文件
    .sort();
}

// 执行迁移（向上）
async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // 创建 meta 表
    await createMetaTable();

    // 获取已执行和所有迁移
    const executed = await getExecutedMigrations();
    const allMigrations = await getAllMigrations();

    // 找出未执行的迁移
    const pending = allMigrations.filter(m => !executed.includes(m));

    if (pending.length === 0) {
      console.log('✅ No pending migrations. Database is up to date!\n');
      return;
    }

    console.log(`📋 Found ${pending.length} pending migration(s):\n`);
    pending.forEach(m => console.log(`   - ${m}`));
    console.log('');

    // 执行每个迁移
    for (const migrationFile of pending) {
      console.log(`⏳ Running: ${migrationFile}`);

      const migrationPath = path.join(__dirname, '../migrations', migrationFile);
      const migration = require(migrationPath);

      try {
        // 在事务中执行迁移
        await sequelize.transaction(async (transaction) => {
          const queryInterface = sequelize.getQueryInterface();

          // 执行 up 方法
          await migration.up(queryInterface, Sequelize, { transaction });

          // 记录迁移
          await recordMigration(migrationFile);
        });

        console.log(`✅ Completed: ${migrationFile}\n`);
      } catch (error) {
        console.error(`❌ Failed: ${migrationFile}`);
        console.error(`   Error: ${error.message}\n`);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 回滚迁移（向下）
async function rollbackMigration() {
  console.log('🔄 Rolling back last migration...\n');

  try {
    await sequelize.authenticate();
    await createMetaTable();

    const executed = await getExecutedMigrations();

    if (executed.length === 0) {
      console.log('ℹ️  No migrations to rollback\n');
      return;
    }

    // 获取最后执行的迁移
    const lastMigration = executed[executed.length - 1];
    console.log(`⏳ Rolling back: ${lastMigration}`);

    const migrationPath = path.join(__dirname, '../migrations', lastMigration);
    const migration = require(migrationPath);

    try {
      await sequelize.transaction(async (transaction) => {
        const queryInterface = sequelize.getQueryInterface();

        // 执行 down 方法
        if (migration.down) {
          await migration.down(queryInterface, Sequelize, { transaction });
        }

        // 删除迁移记录
        await removeMigrationRecord(lastMigration);
      });

      console.log(`✅ Rolled back: ${lastMigration}\n`);
    } catch (error) {
      console.error(`❌ Rollback failed: ${lastMigration}`);
      console.error(`   Error: ${error.message}\n`);
      throw error;
    }

    console.log('✅ Rollback completed!\n');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 命令行参数处理
const command = process.argv[2];

if (command === 'up' || !command) {
  runMigrations();
} else if (command === 'down') {
  rollbackMigration();
} else {
  console.error('Usage: node db-migrate.js [up|down]');
  process.exit(1);
}
