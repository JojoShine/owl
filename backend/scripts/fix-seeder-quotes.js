#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const seederDir = path.join(__dirname, '..', 'seeders', 'sql');
const files = fs.readdirSync(seederDir).filter(f => f.endsWith('.sql'));

for (const file of files) {
  const filePath = path.join(seederDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 处理每一行 INSERT 语句
  const lines = content.split('\n');
  const fixed = lines.map(line => {
    if (!line.includes('INSERT INTO')) return line;
    
    // 需要修复引号。策略是：
    // 1. 找到 VALUES ( 和 );
    // 2. 解析各个值，对于字符串值，转义内部的单引号
    
    // 更简单的方法：在 VALUES 后面的括号内，正确处理引号
    // PostgreSQL 在单引号字符串中，单引号要转义成 ''
    
    // 使用状态机来处理
    let result = '';
    let i = 0;
    let inString = false;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === "'" && (i === 0 || line[i - 1] !== '\\')) {
        if (!inString) {
          // 进入字符串
          inString = true;
          result += char;
        } else {
          // 检查是否已经转义（两个单引号）
          if (i + 1 < line.length && line[i + 1] === "'") {
            // 已经是转义的单引号，保留
            result += "''";
            i++;
          } else {
            // 退出字符串
            inString = false;
            result += char;
          }
        }
      } else if (char === '"' && inString) {
        // 在字符串内的双引号需要转义成两个单引号吗？不，双引号在 PostgreSQL 字符串中不需要转义
        // 但如果看起来不匹配，可能是原始字符串有问题
        result += char;
      } else {
        result += char;
      }
      
      i++;
    }
    
    return result;
  }).join('\n');
  
  fs.writeFileSync(filePath, fixed, 'utf8');
  console.log(`✅ Fixed ${file}`);
}

