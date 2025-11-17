module.exports = (sequelize, DataTypes) => {
  const ApiMonitor = sequelize.define('ApiMonitor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '监控名称',
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '监控的URL',
    },
    method: {
      type: DataTypes.STRING(10),
      defaultValue: 'GET',
      comment: '请求方法：GET, POST, PUT, DELETE',
      validate: {
        isIn: [['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']],
      },
    },
    headers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '请求头',
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请求体',
    },
    interval: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
      comment: '检测间隔（秒）',
      validate: {
        min: 10, // 最小10秒
        max: 3600, // 最大1小时
      },
    },
    timeout: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: '超时时间（秒）',
      validate: {
        min: 1,
        max: 300,
      },
    },
    expect_status: {
      type: DataTypes.INTEGER,
      defaultValue: 200,
      comment: '期望的状态码',
    },
    expect_response: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '期望的响应内容（可选）',
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用',
    },
    alert_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否启用告警',
    },
    alert_template_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '告警邮件模版ID',
    },
    alert_recipients: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '告警接收人邮箱列表',
    },
    alert_interval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1800,
      comment: '告警间隔（秒）- 持续异常时的告警发送间隔，默认30分钟',
      validate: {
        min: 60, // 最小1分钟
        max: 86400, // 最大24小时
      },
    },
    variable_mapping: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '变量映射配置：{ 模版变量名: 数据字段路径 }',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '创建者ID',
    },
  }, {
    tableName: 'api_monitors',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['enabled'],
      },
      {
        fields: ['created_by'],
      },
    ],
  });

  ApiMonitor.associate = (models) => {
    // 与用户的关系
    ApiMonitor.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });

    // 与监控日志的关系
    ApiMonitor.hasMany(models.ApiMonitorLog, {
      foreignKey: 'monitor_id',
      as: 'logs',
    });

    // 与邮件模版的关系
    ApiMonitor.belongsTo(models.EmailTemplate, {
      foreignKey: 'alert_template_id',
      as: 'alertTemplate',
    });
  };

  return ApiMonitor;
};
