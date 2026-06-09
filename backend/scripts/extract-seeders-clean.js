#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取 seeder.sql 文件
const seederFile = path.join(__dirname, '..', 'sql', 'seeder.sql');
const content = fs.readFileSync(seederFile, 'utf8');

// 按表分组 INSERT 语句，并清理双重引号问题
const tableInserts = {};
const lines = content.split('\n');

for (let line of lines) {
  // 跳过注释和空行
  if (!line.trim() || line.trim().startsWith('--') || line.trim().startsWith('ALTER SEQUENCE') || line.trim() === 'BEGIN;' || line.trim() === 'COMMIT;' || line.trim().startsWith('SET CONSTRAINTS')) {
    continue;
  }
  
  // 匹配 INSERT INTO "table_name" 或 INSERT INTO public."table_name"
  const match = line.match(/INSERT INTO (?:public\.)?["']?(\w+)["']?/);
  if (match) {
    const tableName = match[1];
    
    // 清理双重引号包装的时间戳: '"2025-10-28T00:43:06.737Z"' -> '2025-10-28T00:43:06.737Z'
    line = line.replace(/'"(\d{4}-\d{2}-\d{2}T[\d:.,Z]+)"'/g, "'$1'");
    
    // 移除 public. 前缀
    line = line.replace(/INSERT INTO public\./, 'INSERT INTO ');
    
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
  
  if (inserts.length > 0) {
    const filename = String(fileIndex).padStart(3, '0');
    const outputFile = path.join(seederDir, `${filename}-${tableName}.sql`);
    
    fs.writeFileSync(outputFile, inserts.join('\n'), 'utf8');
    console.log(`✅ Extracted ${tableName} (${inserts.length} records) -> ${filename}-${tableName}.sql`);
    fileIndex++;
  }
}

console.log('\n✅ Seeder extraction completed!');

