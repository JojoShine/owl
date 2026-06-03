# Sequelize 日志调试指南

## 🔍 问题排查步骤

### 1. 确认后端已重启

修改了 `backend/src/models/index.js` 后，**必须重启后端服务**：

```bash
cd backend
npm run dev
```

### 2. 检查环境变量

确认 `.env.local` 或 `.env.development` 中：

```bash
NODE_ENV=development
```

开发环境下会自动记录所有SQL查询。

### 3. 触发数据库查询

访问任意需要查询数据库的页面，例如：
- 用户列表：`http://localhost:3000/setting/users`
- 部门管理：`http://localhost:3000/setting/departments`

### 4. 查看日志文件

```bash
# 实时查看数据库访问日志
tail -f backend/logs/database-access/database-access-$(date +%Y-%m-%d).log

# 或者查看所有内容
cat backend/logs/database-access/database-access-$(date +%Y-%m-%d).log
```

### 5. 预期的日志格式

如果一切正常，应该看到类似这样的日志：

```json
{"type":"postgresql","action":"query","sql":"SELECT \"id\", \"username\", \"email\" FROM \"owl_users\" AS \"User\" WHERE \"User\".\"deleted_at\" IS NULL;","timing":"15ms","timestamp":"2026-06-03T08:00:35.000Z"}
```

## 🛠️ 如果仍然没有日志

### 检查1：确认 pgLogging 函数被调用

在 `backend/src/config/database.js` 中添加临时调试：

```javascript
const pgLogging = (sql, timing) => {
  console.log('=== PostgreSQL Logging Called ===');
  console.log('SQL:', sql);
  console.log('Timing:', timing);
  console.log('Environment:', process.env.NODE_ENV);
  
  // ... 原有代码
};
```

然后重启后端，查看控制台是否有输出。

### 检查2：确认 databaseAccessLogger 工作正常

在 `backend/src/config/logger.js` 中确认：

```javascript
// 数据库访问日志传输器（Redis + PostgreSQL）
const databaseAccessTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/database-access/database-access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m',
  maxFiles: '30d',
  level: 'info',
});

// 数据库访问日志logger（统一记录Redis和PostgreSQL访问）
const databaseAccessLogger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [databaseAccessTransport],
});
```

### 检查3：确认 models/index.js 正确加载

在 `backend/src/models/index.js` 中添加临时调试：

```javascript
// 处理 logging 配置
let loggingConfig = false;
if (dbConfig.logging) {
  console.log('=== Database Config Logging ===');
  console.log('Type:', typeof dbConfig.logging);
  console.log('Value:', dbConfig.logging);
  
  // 如果配置的是函数，直接使用（如 pgLogging）
  if (typeof dbConfig.logging === 'function') {
    loggingConfig = dbConfig.logging;
    console.log('Using custom logging function');
  } else {
    // 否则使用默认的 debug 日志
    loggingConfig = (msg) => logger.debug(msg);
    console.log('Using default debug logging');
  }
} else {
  console.log('Logging is disabled');
}
```

### 检查4：手动测试日志写入

创建一个测试脚本 `backend/test-db-log.js`：

```javascript
require('dotenv').config();
const { databaseAccessLogger } = require('./src/config/logger');

console.log('Testing database access logger...');

databaseAccessLogger.info(JSON.stringify({
  type: 'postgresql',
  action: 'test_query',
  sql: 'SELECT 1',
  timing: '1ms',
  timestamp: new Date().toISOString(),
}));

console.log('Test log written. Check logs/database-access/ directory.');
process.exit(0);
```

运行：
```bash
node backend/test-db-log.js
```

然后检查日志文件是否存在。

## ✅ 修复总结

### 根本原因

`backend/src/models/index.js` 第16行错误地覆盖了自定义的日志函数：

**修复前**：
```javascript
logging: dbConfig.logging ? (msg) => logger.debug(msg) : false,
```

这行代码将 `pgLogging` 函数转换成了 `(msg) => logger.debug(msg)`，导致：
1. 丢失了原始的 `pgLogging` 逻辑
2. 使用了错误的 logger（system logger 而不是 databaseAccessLogger）
3. 日志级别是 debug 而不是 info

**修复后**：
```javascript
// 处理 logging 配置
let loggingConfig = false;
if (dbConfig.logging) {
  // 如果配置的是函数，直接使用（如 pgLogging）
  if (typeof dbConfig.logging === 'function') {
    loggingConfig = dbConfig.logging;
  } else {
    // 否则使用默认的 debug 日志
    loggingConfig = (msg) => logger.debug(msg);
  }
}

const sequelize = new Sequelize(
  // ...
  {
    // ...
    logging: loggingConfig,
    // ...
  }
);
```

现在会正确检测并使用 `pgLogging` 函数。

## 📝 注意事项

1. **必须重启后端** - 修改 `models/index.js` 后必须重启
2. **开发环境自动记录** - `NODE_ENV=development` 时记录所有SQL
3. **生产环境可选** - 设置 `DB_LOGGING=true` 才记录
4. **慢查询阈值** - 超过100ms的查询会被记录（生产环境）
