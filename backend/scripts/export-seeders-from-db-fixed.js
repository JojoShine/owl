#!/usr/bin/env node

// 加载环境变量
if (require('fs').existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
} else {
  require('dotenv').config();
}

const { Sequelize, QueryTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = require('../src/config/database');
const envConfig = process.env.NODE_ENV || 'development';
const config = dbConfig[envConfig];

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

async function getSeedersFromDB() {
  try {
    // 获取所有有数据的表
    const tableQuery = `
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename LIKE 'owl_%'
      ORDER BY tablename;
    `;
    
    const tables = await sequelize.query(tableQuery, { type: QueryTypes.SELECT });
    
    // 导出每个表的数据
    const seederDir = path.join(__dirname, '..', 'seeders', 'sql');
    
    // 清空旧文件
    if (fs.existsSync(seederDir)) {
      fs.readdirSync(seederDir).forEach(file => {
        if (file.endsWith('.sql')) {
          fs.unlinkSync(path.join(seederDir, file));
        }
      });
    } else {
      fs.mkdirSync(seederDir, { recursive: true });
    }
    
    let fileIndex = 4; // Start from 004
    
    for (const tableRow of tables) {
      const tableName = tableRow.tablename;
      
      // 检查表是否有数据
      const countQuery = `SELECT COUNT(*) as count FROM "${tableName}";`;
      const countResult = await sequelize.query(countQuery, { type: QueryTypes.SELECT });
      const recordCount = parseInt(countResult[0].count);
      
      if (recordCount === 0) {
        continue; // Skip empty tables
      }
      
      // 获取表结构
      const structureQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position;
      `;
      
      const columns = await sequelize.query(structureQuery, { type: QueryTypes.SELECT });
      
      // 获取表数据
      const dataQuery = `SELECT * FROM "${tableName}";`;
      const rows = await sequelize.query(dataQuery, { type: QueryTypes.SELECT });
      
      if (rows.length === 0) continue;
      
      // 构建 INSERT 语句
      const columnNames = columns.map(c => `"${c.column_name}"`).join(', ');
      
      let insertStatements = [];
      
      for (const row of rows) {
        const values = [];
        
        for (const col of columns) {
          const colName = col.column_name;
          const colType = col.data_type;
          const value = row[colName];
          
          if (value === null) {
            values.push('NULL');
          } else if (colType === 'boolean') {
            values.push(value ? 'true' : 'false');
          } else if (colType.includes('uuid') || colType === 'character varying' || colType === 'text' || colType.startsWith('enum_')) {
            // Properly escape single quotes by doubling them
            const escaped = String(value).replace(/'/g, "''");
            values.push(`'${escaped}'`);
          } else if (colType === 'integer' || colType === 'bigint' || colType === 'smallint' || colType === 'numeric') {
            values.push(String(value));
          } else if (colType === 'timestamp with time zone' || colType === 'timestamp without time zone') {
            const escaped = String(value).replace(/'/g, "''");
            values.push(`'${escaped}'`);
          } else if (colType === 'jsonb' || colType === 'json') {
            const jsonStr = JSON.stringify(value);
            const escaped = jsonStr.replace(/'/g, "''");
            values.push(`'${escaped}'`);
          } else {
            const escaped = String(value).replace(/'/g, "''");
            values.push(`'${escaped}'`);
          }
        }
        
        const insertSQL = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${values.join(', ')});`;
        insertStatements.push(insertSQL);
      }
      
      // 写入文件
      const filename = String(fileIndex).padStart(3, '0');
      const outputFile = path.join(seederDir, `${filename}-${tableName}.sql`);
      
      fs.writeFileSync(outputFile, insertStatements.join('\n'), 'utf8');
      console.log(`✅ Exported ${tableName} (${recordCount} records) -> ${filename}-${tableName}.sql`);
      
      fileIndex++;
    }
    
    console.log('\n✅ Seeder export completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

getSeedersFromDB();
