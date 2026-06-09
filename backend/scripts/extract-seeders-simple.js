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

// 按行分割
const lines = content.split('\n');

// 重新组合多行 INSERT 语句
let currentInsert = '';
let tableInserts = {};

for (let line of lines) {
  line = line.trim();
  
  // 跳过不需要的行
  if (!line || line.startsWith('--') || line.startsWith('ALTER') || line.startsWith('SET') || line === 'BEGIN;' || line === 'COMMIT;') {
    continue;
  }
  
  // 累积当前 INSERT
  currentInsert += ' ' + line;
  
  // 检查是否是一个完整的INSERT（以 );  结尾）
  if (currentInsert.includes('INSERT INTO') && currentInsert.endsWith(');')) {
    // 规范化多个空格为单个空格
    currentInsert = currentInsert.replace(/\s+/g, ' ').trim();
    
    // 提取表名
    const match = currentInsert.match(/INSERT INTO "(\w+)"/);
    if (match) {
      const tableName = match[1];
      if (!tableInserts[tableName]) {
        tableInserts[tableName] = [];
      }
      tableInserts[tableName].push(currentInsert);
    }
    
    currentInsert = '';
  }
}

// 写入文件
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

let fileIndex = 4;
const tableNames = Object.keys(tableInserts).sort();

console.log(`Found ${tableNames.length} tables with data`);

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

