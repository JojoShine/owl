require('dotenv').config();
const { databaseAccessLogger } = require('./logger');

// PostgreSQL 日志函数
// Sequelize logging 函数签名: (sql, timing, connection)
const pgLogging = (sql, timing) => {
  // 开发环境记录所有SQL，生产环境只记录慢查询（超过100ms）
  const shouldLog = process.env.NODE_ENV === 'development' || (typeof timing === 'number' && timing > 100);
  
  if (shouldLog && sql) {
    try {
      // 只处理数字类型的 timing
      const timingValue = typeof timing === 'number' ? `${timing}ms` : 'N/A';
      
      databaseAccessLogger.info(JSON.stringify({
        type: 'postgresql',
        action: 'query',
        sql: typeof sql === 'string' ? sql.substring(0, 500) : String(sql).substring(0, 500),
        timing: timingValue,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to log PostgreSQL query:', error.message);
    }
  }
};

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'admin_platform',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'production' ? false : pgLogging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME_TEST || 'admin_platform_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // 测试环境不记录日志
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? pgLogging : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};