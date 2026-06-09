#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取 seeder.sql 文件
const seederFile = path.join(__dirname, '..', 'sql', 'seeder.sql');
let content = fs.readFileSync(seederFile, 'utf8');

// 清理双重引号包装的时间戳
content = content.replace(/'"(\d{4}-\d{2}-\d{2}T[\d:.,Z]+)"'/g, "'$1'");

// 移除 public. 前缀
content = content.replace(/INSERT INTO public\./g, 'INSERT INTO ');

// 将多行 INSERT 合并成单行
// 匹配从 INSERT INTO 到 );
const insertPattern = /INSERT INTO "[^"]+" \([^)]+\) VALUES \([^;]*\);/gs;
const inserts = content.match(insertPattern) || [];

// 按表分组
const tableInserts = {};

for (let insert of inserts) {
  // 移除多余的空格和换行
  insert = insert.replace(/\s+/g, ' ').trim();
  
  // 提取表名
  const match = insert.match(/INSERT INTO "(\w+)"/);
  if (match) {
    const tableName = match[1];
    if (!tableInserts[tableName]) {
      tableInserts[tableName] = [];
    }
    tableInserts[tableName].push(insert);
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

let fileIndex = 4;
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

