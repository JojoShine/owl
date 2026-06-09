#!/usr/bin/env node
/**
 * 从现有 PostgreSQL 数据库导出初始数据 SQL
 */

const fs = require('fs');
const path = require('path');

// 优先使用 .env.local，其次使用 .env
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
} else {
  require('dotenv').config();
}

const { Sequelize } = require('sequelize');

// 获取数据库配置
const dbConfig = require('../src/config/database');
const envConfig = process.env.NODE_ENV || 'development';
const config = dbConfig[envConfig];

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false,
  }
);

/**
 * 获取表的所有数据作为 INSERT 语句
 */
async function getTableInsertStatements(tableName) {
  try {
    // 获取表的列信息和类型
    const columnsQuery = `
      SELECT column_name, udt_name, data_type
      FROM information_schema.columns
      WHERE table_name = '${tableName}' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    const columns = await sequelize.query(columnsQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    if (columns.length === 0) {
      return [];
    }

    const columnNames = columns.map(c => c.column_name);
    const columnTypeMap = new Map(columns.map(c => [c.column_name, { udt_name: c.udt_name, data_type: c.data_type }]));

    // 获取表的所有数据
    const dataQuery = `SELECT * FROM "${tableName}" ORDER BY 1 LIMIT 10000;`;

    const rows = await sequelize.query(dataQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    if (rows.length === 0) {
      return [];
    }

    // 生成 INSERT 语句
    const insertStatements = rows.map(row => {
      const values = columnNames.map(col => {
        const value = row[col];
        const typeInfo = columnTypeMap.get(col);

        if (value === null || value === undefined) {
          return 'NULL';
        }

        if (typeof value === 'boolean') {
          return value ? 'true' : 'false';
        }

        if (typeof value === 'number') {
          return String(value);
        }

        if (value instanceof Date) {
          // 日期类型 - 转换为 ISO 字符串
          return `'${value.toISOString()}'`;
        }

        if (typeof value === 'object') {
          // JSON/JSONB 类型 - 直接序列化，不加类型强制
          if (typeInfo.data_type === 'json' || typeInfo.udt_name === 'jsonb' || typeInfo.udt_name === 'json') {
            const jsonStr = JSON.stringify(value).replace(/'/g, "''");
            return `'${jsonStr}'`;
          }
          // 其他对象（如日期）转为字符串
          return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        }

        // 字符串 - 转义单引号
        const escapedValue = String(value).replace(/'/g, "''");
        return `'${escapedValue}'`;
      });

      const columnList = columnNames.map(c => `"${c}"`).join(', ');
      return `INSERT INTO "${tableName}" (${columnList}) VALUES (${values.join(', ')});`;
    });

    return insertStatements;
  } catch (error) {
    console.warn(`⚠️  无法获取 ${tableName} 的数据: ${error.message}`);
    return [];
  }
}

/**
 * 获取所有包含数据的表
 */
async function getTablesWithData() {
  const query = `
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
    AND tablename NOT IN ('SequelizeMeta', 'SequelizeData', 'owl_SequelizeMeta', 'owl_SequelizeData')
    ORDER BY tablename;
  `;

  const result = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT
  });

  return result.map(r => r.tablename);
}

/**
 * 主程序
 */
async function main() {
  try {
    console.log('🔗 连接到数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 创建输出目录
    const sqlDir = path.join(__dirname, '..', 'seeders', 'sql');
    if (!fs.existsSync(sqlDir)) {
      fs.mkdirSync(sqlDir, { recursive: true });
    }

    // 清空目录
    fs.readdirSync(sqlDir).forEach(file => {
      fs.unlinkSync(path.join(sqlDir, file));
    });

    // 获取所有表
    console.log('📝 获取包含数据的表...');
    const tables = await getTablesWithData();
    console.log(`   找到 ${tables.length} 个表\n`);

    // 导出每个表的数据
    console.log('📝 导出初始数据...');
    let fileIndex = 1;
    let totalRecords = 0;

    for (const tableName of tables) {
      const statements = await getTableInsertStatements(tableName);

      if (statements.length > 0) {
        const fileNum = String(fileIndex).padStart(3, '0');
        const filename = path.join(sqlDir, `${fileNum}-${tableName}.sql`);
        fs.writeFileSync(filename, statements.join('\n') + '\n', 'utf8');
        console.log(`✅ ${path.basename(filename)} (${statements.length} 条记录)`);
        totalRecords += statements.length;
      } else {
        console.log(`⏭️  ${tableName} (无数据)`);
      }

      fileIndex++;
    }

    console.log(`\n✅ 成功导出 ${totalRecords} 条记录到 ${sqlDir}\n`);

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
