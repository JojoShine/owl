#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取 seeder.sql 文件
const seederFile = path.join(__dirname, '..', 'sql', 'seeder.sql');
const content = fs.readFileSync(seederFile, 'utf8');

// 按表分组 INSERT 语句
const tableInserts = {};
const lines = content.split('\n');

for (const line of lines) {
  // 匹配 INSERT INTO "table_name" 
  const match = line.match(/INSERT INTO "(\w+)"/);
  if (match) {
    const tableName = match[1];
    if (!tableInserts[tableName]) {
      tableInserts[tableName] = [];
    }
    tableInserts[tableName].push(line);
  }
}

// 写入文件
const seederDir = path.join(__dirname, '..', 'seeders', 'sql');

// 确保目录存在
if (!fs.existsSync(seederDir)) {
  fs.mkdirSync(seederDir, { recursive: true });
}

// 清空旧文件
fs.readdirSync(seederDir).forEach(file => {
  if (file.endsWith('.sql')) {
    fs.unlinkSync(path.join(seederDir, file));
  }
});

let fileIndex = 4; // Start from 004

// 按表名排序
const tableNames = Object.keys(tableInserts).sort();

for (const tableName of tableNames) {
  const inserts = tableInserts[tableName];
  const filename = String(fileIndex).padStart(3, '0');
  const outputFile = path.join(seederDir, `${filename}-${tableName}.sql`);
  
  // 过滤掉空行和注释
  const validInserts = inserts.filter(line => line.trim() && !line.trim().startsWith('--'));
  
  if (validInserts.length > 0) {
    fs.writeFileSync(outputFile, validInserts.join('\n'), 'utf8');
    console.log(`✅ Extracted ${tableName} (${validInserts.length} records) -> ${filename}-${tableName}.sql`);
    fileIndex++;
  }
}

console.log('\n✅ Seeder extraction completed!');

