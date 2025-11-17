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

// 导入模型
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Role = require('./Role')(sequelize, Sequelize.DataTypes);
db.Permission = require('./Permission')(sequelize, Sequelize.DataTypes);
db.Menu = require('./Menu')(sequelize, Sequelize.DataTypes);
db.Department = require('./Department')(sequelize, Sequelize.DataTypes);
db.Folder = require('./Folder')(sequelize, Sequelize.DataTypes);
db.File = require('./File')(sequelize, Sequelize.DataTypes);
db.FileShare = require('./FileShare')(sequelize, Sequelize.DataTypes);

// 导入监控模型
db.MonitorMetric = require('./MonitorMetric')(sequelize, Sequelize.DataTypes);
db.ApiMonitor = require('./ApiMonitor')(sequelize, Sequelize.DataTypes);
db.ApiMonitorLog = require('./ApiMonitorLog')(sequelize, Sequelize.DataTypes);
db.AlertRule = require('./AlertRule')(sequelize, Sequelize.DataTypes);
db.AlertHistory = require('./AlertHistory')(sequelize, Sequelize.DataTypes);

// 导入通知模型
db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
db.EmailLog = require('./EmailLog')(sequelize, Sequelize.DataTypes);
db.NotificationSettings = require('./NotificationSettings')(sequelize, Sequelize.DataTypes);
db.EmailTemplate = require('./EmailTemplate')(sequelize, Sequelize.DataTypes);

// 导入代码生成器模型
db.GeneratedModule = require('./GeneratedModule')(sequelize, Sequelize.DataTypes);
db.GeneratedField = require('./GeneratedField')(sequelize, Sequelize.DataTypes);
db.GenerationHistory = require('./GenerationHistory')(sequelize, Sequelize.DataTypes);

// 导入字典和附件模型
db.Attachment = require('./Attachment')(sequelize, Sequelize.DataTypes);
db.Dictionary = require('./Dictionary')(sequelize, Sequelize.DataTypes);

// 动态生成的模型
// (模型会在代码生成时自动注册到这里)

// 动态生成的模型
// (模型会在代码生成时自动注册到这里，使用原生SQL无需在此注册)

// 导入中间表模型
db.UserRole = require('./UserRole')(sequelize, Sequelize.DataTypes);
db.RolePermission = require('./RolePermission')(sequelize, Sequelize.DataTypes);
db.RoleMenu = require('./RoleMenu')(sequelize, Sequelize.DataTypes);

// 设置模型关联
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
