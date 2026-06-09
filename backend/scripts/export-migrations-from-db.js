#!/usr/bin/env node
/**
 * 从 PostgreSQL 数据库导出 Migration SQL 文件
 * 使用 PostgreSQL 内置函数直接生成完整的 CREATE TABLE 语句
 */

const fs = require('fs');
const path = require('path');

// 优先使用 .env.local，其次使用 .env
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
} else {
  require('dotenv').config();
}

const { Sequelize, QueryTypes } = require('sequelize');

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
 * 使用 pg_catalog 生成完整的 CREATE TABLE 语句
 */
async function getTableDefinition(tableName) {
  const query = `
    SELECT
      'CREATE TABLE IF NOT EXISTS ' || tablename || ' (' || E'\n' ||
      string_agg(
        '    ' || attname || ' ' || typname ||
        CASE WHEN attnotnull THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN atthasdef THEN ' DEFAULT ' || (SELECT substring(pg_get_expr(adbin, 0), 1, 100) FROM pg_attrdef WHERE adrelid = t.oid AND adnum = a.attnum) ELSE '' END,
        ',' || E'\n'
        ORDER BY attnum
      ) || E'\n' ||
      ')' as table_def
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum > 0 AND NOT a.attisdropped
    JOIN pg_type p ON p.oid = a.atttypid
    WHERE n.nspname = 'public'
    AND t.relname = $1
    GROUP BY t.oid, t.tablename;
  `;

  const result = await sequelize.query(query, {
    replacements: [tableName],
    type: QueryTypes.SELECT,
  });

  return result.length > 0 ? result[0].table_def : null;
}

/**
 * 获取列的注释和完整定义
 */
async function getCompleteTableSQL(tableName) {
  // 获取列的注释和完整定义
  const columnsQuery = `
    SELECT
      a.attname,
      pg_catalog.format_type(a.atttypid, a.atttypmod) as type,
      a.attnotnull,
      (SELECT pg_get_expr(adbin, 0) FROM pg_attrdef WHERE adrelid = t.oid AND adnum = a.attnum) as default_expr,
      col_description(t.oid, a.attnum) as column_comment
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum > 0 AND NOT a.attisdropped
    WHERE n.nspname = 'public' AND t.relname = '${tableName}'
    ORDER BY a.attnum;
  `;

  const columns = await sequelize.query(columnsQuery, {
    type: QueryTypes.SELECT,
  });

  if (columns.length === 0) {
    return null;
  }

  // 获取表的基本信息和注释
  const tableQuery = `
    SELECT
      obj_description(('"public"."${tableName}"')::regclass) AS table_comment
  `;

  const tableInfo = await sequelize.query(tableQuery, {
    type: QueryTypes.SELECT,
  });

  // 获取索引
  const indexesQuery = `
    SELECT DISTINCT indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = '${tableName}'
    AND indexname NOT LIKE '%_pkey'
    ORDER BY indexdef;
  `;

  const indexes = await sequelize.query(indexesQuery, {
    type: QueryTypes.SELECT,
  });

  // 生成完整的 SQL
  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

  const columnDefs = columns.map((col, idx) => {
    let def = `    ${col.attname} ${col.type}`;
    if (col.attnotnull) def += ' NOT NULL';
    if (col.default_expr) def += ` DEFAULT ${col.default_expr}`;
    return def;
  });

  sql += columnDefs.join(',\n');
  sql += '\n);\n\n';

  // 添加表注释
  if (tableInfo[0]?.table_comment) {
    const comment = tableInfo[0].table_comment.replace(/'/g, "''");
    sql += `COMMENT ON TABLE ${tableName} IS '${comment}';\n\n`;
  }

  // 添加列注释
  for (const col of columns) {
    if (col.column_comment) {
      const comment = col.column_comment.replace(/'/g, "''");
      sql += `COMMENT ON COLUMN ${tableName}.${col.attname} IS '${comment}';\n`;
    }
  }

  // 添加索引（移除 public. 前缀并去重）
  if (indexes.length > 0) {
    sql += '\n';
    const uniqueIndexes = new Set();
    for (const idx of indexes) {
      let indexDef = idx.indexdef.replace(/ON public\./g, 'ON ').replace(/USING btree/g, '');
      indexDef = indexDef.replace(/\s+/g, ' ').trim();
      if (!uniqueIndexes.has(indexDef)) {
        sql += indexDef + ';\n';
        uniqueIndexes.add(indexDef);
      }
    }
  }

  return sql;
}

/**
 * 获取所有表名，按依赖关系排序
 */
async function getTableOrder() {
  const query = `
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
    AND tablename NOT LIKE 'information_%'
    ORDER BY tablename;
  `;

  const result = await sequelize.query(query, {
    type: QueryTypes.SELECT,
  });

  return result.map(r => r.tablename);
}

/**
 * 获取 ENUM 类型
 */
async function getEnumTypes() {
  const query = `
    SELECT
      'CREATE TYPE ' || typname || ' AS ENUM (' ||
      string_agg(quote_literal(enumlabel), ', ' ORDER BY enumsortorder) ||
      ')' as enum_def
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND t.typname ~ '^enum_'
    GROUP BY t.typname
    ORDER BY t.typname;
  `;

  const result = await sequelize.query(query, {
    type: QueryTypes.SELECT,
  });

  return result.map(r => r.enum_def);
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
    const sqlDir = path.join(__dirname, '..', 'migrations', 'postgres', 'sql');
    if (!fs.existsSync(sqlDir)) {
      fs.mkdirSync(sqlDir, { recursive: true });
    }

    // 清空目录
    fs.readdirSync(sqlDir).forEach(file => {
      if (!file.startsWith('.')) {
        fs.unlinkSync(path.join(sqlDir, file));
      }
    });

    // 导出 ENUM 类型
    console.log('📝 导出 ENUM 类型...');
    const enums = await getEnumTypes();
    if (enums.length > 0) {
      const enumFile = path.join(sqlDir, '001-enums.sql');
      fs.writeFileSync(enumFile, enums.join(';\n') + ';\n', 'utf8');
      console.log(`✅ 001-enums.sql (${enums.length} 个类型)\n`);
    }

    // 获取表的执行顺序
    console.log('📝 获取表执行顺序...');
    const tableOrder = await getTableOrder();
    console.log(`✅ 找到 ${tableOrder.length} 个表\n`);

    // 导出每个表
    console.log('📝 导出表结构（含中文注释）...');
    let fileIndex = 2;

    for (const tableName of tableOrder) {
      try {
        const tableSql = await getCompleteTableSQL(tableName);

        if (tableSql) {
          const fileNum = String(fileIndex).padStart(3, '0');
          const filename = path.join(sqlDir, `${fileNum}-${tableName}.sql`);
          fs.writeFileSync(filename, tableSql, 'utf8');
          console.log(`✅ ${fileNum}-${tableName}.sql`);
        }
      } catch (error) {
        console.error(`❌ ${tableName} - ${error.message}`);
      }

      fileIndex++;
    }

    console.log(`\n✅ 成功导出 ${tableOrder.length} 个表到 ${sqlDir}\n`);

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
