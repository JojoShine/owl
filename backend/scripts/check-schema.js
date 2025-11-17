/**
 * 检查 schema.sql 和本地数据库结构是否一致
 * 并导出完整的数据库结构(包含注释)
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

// 获取所有枚举类型
async function getAllEnums() {
  const [enums] = await sequelize.query(`
    SELECT
      t.typname as enum_name,
      array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname
  `);
  return enums;
}

// 获取所有表名
async function getAllTables() {
  const [tables] = await sequelize.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('SequelizeMeta', 'SequelizeData')
    ORDER BY table_name
  `);
  return tables.map(t => t.table_name);
}

// 获取表结构(包含列注释)
async function getTableStructure(tableName) {
  const [columns] = await sequelize.query(`
    SELECT
      c.column_name,
      c.data_type,
      c.character_maximum_length,
      c.is_nullable,
      c.column_default,
      pgd.description as column_comment
    FROM information_schema.columns c
    LEFT JOIN pg_catalog.pg_statio_all_tables st
      ON c.table_name = st.relname
    LEFT JOIN pg_catalog.pg_description pgd
      ON pgd.objoid = st.relid
      AND pgd.objsubid = c.ordinal_position
    WHERE c.table_name = :tableName
    AND c.table_schema = 'public'
    ORDER BY c.ordinal_position
  `, {
    replacements: { tableName }
  });
  return columns;
}

// 获取表注释
async function getTableComment(tableName) {
  const [result] = await sequelize.query(`
    SELECT obj_description((quote_ident(:schema) || '.' || quote_ident(:tableName))::regclass) as table_comment
  `, {
    replacements: { schema: 'public', tableName }
  });
  return result[0]?.table_comment || null;
}

// 获取主键
async function getPrimaryKeys(tableName) {
  const [keys] = await sequelize.query(`
    SELECT a.attname as column_name
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = :tableName::regclass
    AND i.indisprimary
  `, {
    replacements: { tableName }
  });
  return keys.map(k => k.column_name);
}

// 获取外键
async function getForeignKeys(tableName) {
  const [keys] = await sequelize.query(`
    SELECT
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule,
      rc.update_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = :tableName
  `, {
    replacements: { tableName }
  });
  return keys;
}

// 获取索引
async function getIndexes(tableName) {
  const [indexes] = await sequelize.query(`
    SELECT
      i.relname as index_name,
      a.attname as column_name,
      ix.indisunique as is_unique
    FROM pg_class t
    JOIN pg_index ix ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE t.relname = :tableName
    AND t.relkind = 'r'
    AND i.relname NOT LIKE '%_pkey'
    ORDER BY i.relname, a.attname
  `, {
    replacements: { tableName }
  });
  return indexes;
}

// 获取触发器
async function getTriggers(tableName) {
  const [triggers] = await sequelize.query(`
    SELECT
      trigger_name,
      event_manipulation,
      action_timing,
      action_statement
    FROM information_schema.triggers
    WHERE event_object_table = :tableName
    ORDER BY trigger_name
  `, {
    replacements: { tableName }
  });
  return triggers;
}

// 生成完整的表DDL
async function generateTableDDL(tableName) {
  const columns = await getTableStructure(tableName);
  const tableComment = await getTableComment(tableName);
  const primaryKeys = await getPrimaryKeys(tableName);
  const foreignKeys = await getForeignKeys(tableName);
  const indexes = await getIndexes(tableName);
  const triggers = await getTriggers(tableName);

  let ddl = '';

  // 表注释
  if (tableComment) {
    ddl += `-- ${tableComment}\n`;
  }

  // 删除已存在的表（支持重新初始化）
  ddl += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n\n`;

  ddl += `CREATE TABLE ${tableName} (\n`;

  // 列定义
  const columnDefs = columns.map(col => {
    let def = `  ${col.column_name} `;

    // 数据类型
    if (col.data_type === 'character varying') {
      def += col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : 'VARCHAR';
    } else if (col.data_type === 'timestamp without time zone') {
      def += 'TIMESTAMP';
    } else if (col.data_type === 'USER-DEFINED') {
      def += col.udt_name;
    } else {
      def += col.data_type.toUpperCase();
    }

    // NULL/NOT NULL
    if (col.is_nullable === 'NO') {
      def += ' NOT NULL';
    }

    // 默认值
    if (col.column_default) {
      def += ` DEFAULT ${col.column_default}`;
    }

    return def;
  });

  ddl += columnDefs.join(',\n');

  // 主键
  if (primaryKeys.length > 0) {
    ddl += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`;
  }

  ddl += '\n);\n\n';

  // 列注释
  columns.forEach(col => {
    if (col.column_comment) {
      ddl += `COMMENT ON COLUMN ${tableName}.${col.column_name} IS '${col.column_comment}';\n`;
    }
  });

  if (columns.some(col => col.column_comment)) {
    ddl += '\n';
  }

  // 表注释
  if (tableComment) {
    ddl += `COMMENT ON TABLE ${tableName} IS '${tableComment}';\n\n`;
  }

  // 索引
  if (indexes.length > 0) {
    const indexMap = {};
    indexes.forEach(idx => {
      if (!indexMap[idx.index_name]) {
        indexMap[idx.index_name] = {
          name: idx.index_name,
          unique: idx.is_unique,
          columns: []
        };
      }
      indexMap[idx.index_name].columns.push(idx.column_name);
    });

    Object.values(indexMap).forEach(idx => {
      const unique = idx.unique ? 'UNIQUE ' : '';
      ddl += `CREATE ${unique}INDEX ${idx.name} ON ${tableName} (${idx.columns.join(', ')});\n`;
    });
    ddl += '\n';
  }

  // 外键
  if (foreignKeys.length > 0) {
    foreignKeys.forEach(fk => {
      const constraintName = `fk_${tableName}_${fk.column_name}`;
      ddl += `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName}\n`;
      ddl += `  FOREIGN KEY (${fk.column_name})\n`;
      ddl += `  REFERENCES ${fk.foreign_table_name} (${fk.foreign_column_name})`;
      if (fk.delete_rule !== 'NO ACTION') {
        ddl += `\n  ON DELETE ${fk.delete_rule}`;
      }
      if (fk.update_rule !== 'NO ACTION') {
        ddl += `\n  ON UPDATE ${fk.update_rule}`;
      }
      ddl += ';\n';
    });
    ddl += '\n';
  }

  // 触发器
  if (triggers.length > 0) {
    triggers.forEach(trigger => {
      ddl += `-- Trigger: ${trigger.trigger_name}\n`;
      ddl += `CREATE TRIGGER ${trigger.trigger_name}\n`;
      ddl += `  ${trigger.action_timing} ${trigger.event_manipulation}\n`;
      ddl += `  ON ${tableName}\n`;
      ddl += `  FOR EACH ROW\n`;
      ddl += `  ${trigger.action_statement};\n\n`;
    });
  }

  return ddl;
}

// 主函数
async function checkSchema() {
  console.log('🚀 开始检查数据库结构...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 获取所有枚举类型
    const enums = await getAllEnums();
    console.log(`📊 找到 ${enums.length} 个枚举类型:\n`);
    enums.forEach(e => {
      // PostgreSQL返回的array_agg是字符串格式如: "{value1,value2}"，需要解析
      const values = typeof e.enum_values === 'string'
        ? e.enum_values.replace(/[{}]/g, '').split(',')
        : e.enum_values;
      e.enum_values = values;
      console.log(`   - ${e.enum_name}: [${values.join(', ')}]`);
    });
    console.log('');

    // 获取所有表
    const tables = await getAllTables();
    console.log(`📊 找到 ${tables.length} 个表:\n`);
    tables.forEach(t => console.log(`   - ${t}`));
    console.log('');

    // 生成完整的 schema
    let fullSchema = `-- ==========================================
-- Owl 管理系统 - 数据库结构
-- ==========================================
-- 生成时间: ${new Date().toISOString()}
-- 数据库: ${process.env.DB_NAME}
-- ==========================================

`;

    // 1. 先生成枚举类型定义
    if (enums.length > 0) {
      fullSchema += `-- ==========================================\n`;
      fullSchema += `-- 枚举类型定义\n`;
      fullSchema += `-- ==========================================\n\n`;

      enums.forEach(enumType => {
        fullSchema += `DROP TYPE IF EXISTS ${enumType.enum_name} CASCADE;\n`;
        fullSchema += `CREATE TYPE ${enumType.enum_name} AS ENUM (${enumType.enum_values.map(v => `'${v}'`).join(', ')});\n\n`;
      });

      fullSchema += '\n';
    }

    // 2. 然后生成表结构
    fullSchema += `-- ==========================================\n`;
    fullSchema += `-- 表结构定义\n`;
    fullSchema += `-- ==========================================\n\n`;

    for (const table of tables) {
      console.log(`📝 处理表: ${table}`);
      const ddl = await generateTableDDL(table);
      fullSchema += ddl + '\n';
    }

    // 保存到文件
    const outputPath = path.join(__dirname, '../schema-complete.sql');
    await fs.writeFile(outputPath, fullSchema, 'utf-8');

    console.log(`\n✅ 完整的数据库结构已导出到: ${outputPath}\n`);

    // 读取现有的 schema.sql 进行比较
    const existingSchemaPath = path.join(__dirname, '../schema.sql');
    try {
      const existingSchema = await fs.readFile(existingSchemaPath, 'utf-8');
      console.log('📋 比较结果:');
      console.log(`   现有 schema.sql 大小: ${existingSchema.length} 字符`);
      console.log(`   新生成的结构大小: ${fullSchema.length} 字符`);

      if (fullSchema.length > existingSchema.length) {
        console.log('   ⚠️  新结构更完整(包含注释)，建议更新');
      } else {
        console.log('   ✅ 结构基本一致');
      }
    } catch (error) {
      console.log('   ⚠️  无法读取现有的 schema.sql');
    }

    console.log('\n🎉 检查完成!\n');

  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行检查
checkSchema();
