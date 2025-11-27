const { Sequelize } = require('sequelize');
const config = require('../config/database');
const { logger } = require('../config/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging ? (msg) => logger.debug(msg) : false,
    pool: dbConfig.pool,
  }
);

const db = {};

// ========== System Models ==========
// 用户、角色、权限、菜单等系统模型
db.User = require('./system/User')(sequelize, Sequelize.DataTypes);
db.Role = require('./system/Role')(sequelize, Sequelize.DataTypes);
db.Permission = require('./system/Permission')(sequelize, Sequelize.DataTypes);
db.Menu = require('./system/Menu')(sequelize, Sequelize.DataTypes);
db.Department = require('./system/Department')(sequelize, Sequelize.DataTypes);
db.Folder = require('./system/Folder')(sequelize, Sequelize.DataTypes);
db.File = require('./system/File')(sequelize, Sequelize.DataTypes);
db.FileShare = require('./system/FileShare')(sequelize, Sequelize.DataTypes);
db.FilePermission = require('./system/FilePermission')(sequelize, Sequelize.DataTypes);
db.Attachment = require('./system/Attachment')(sequelize, Sequelize.DataTypes);
db.Dictionary = require('./system/Dictionary')(sequelize, Sequelize.DataTypes);
db.ApiInterface = require('./system/ApiInterface')(sequelize, Sequelize.DataTypes);
db.ApiKey = require('./system/ApiKey')(sequelize, Sequelize.DataTypes);

// ========== Monitor Models ==========
// 监控告警相关模型
db.MonitorMetric = require('./monitor/MonitorMetric')(sequelize, Sequelize.DataTypes);
db.ApiMonitor = require('./monitor/ApiMonitor')(sequelize, Sequelize.DataTypes);
db.ApiMonitorLog = require('./monitor/ApiMonitorLog')(sequelize, Sequelize.DataTypes);
db.AlertRule = require('./monitor/AlertRule')(sequelize, Sequelize.DataTypes);
db.AlertHistory = require('./monitor/AlertHistory')(sequelize, Sequelize.DataTypes);

// ========== Notification Models ==========
// 邮件、通知相关模型
db.Notification = require('./notification/Notification')(sequelize, Sequelize.DataTypes);
db.EmailLog = require('./notification/EmailLog')(sequelize, Sequelize.DataTypes);
db.NotificationSettings = require('./notification/NotificationSettings')(sequelize, Sequelize.DataTypes);
db.EmailTemplate = require('./notification/EmailTemplate')(sequelize, Sequelize.DataTypes);

// ========== Generator Models ==========
// 代码生成器相关模型
db.GeneratedModule = require('./generator/GeneratedModule')(sequelize, Sequelize.DataTypes);
db.GeneratedField = require('./generator/GeneratedField')(sequelize, Sequelize.DataTypes);
db.GenerationHistory = require('./generator/GenerationHistory')(sequelize, Sequelize.DataTypes);

// ========== Association Models ==========
// 中间关联表
db.UserRole = require('./association/UserRole')(sequelize, Sequelize.DataTypes);
db.RolePermission = require('./association/RolePermission')(sequelize, Sequelize.DataTypes);
db.RoleMenu = require('./association/RoleMenu')(sequelize, Sequelize.DataTypes);

// 动态生成的模型会在代码生成时自动注册到这里
// (使用原生SQL时无需在此注册)

// 设置模型关联
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
