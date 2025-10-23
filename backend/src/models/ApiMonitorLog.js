module.exports = (sequelize, DataTypes) => {
  const ApiMonitorLog = sequelize.define('ApiMonitorLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    monitor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '监控配置ID',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '状态：success, failed, timeout',
      validate: {
        isIn: [['success', 'failed', 'timeout']],
      },
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'HTTP状态码',
    },
    response_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '响应时间（毫秒）',
    },
    response_body: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '响应内容（截取前1000字符）',
      get() {
        const rawValue = this.getDataValue('response_body');
        if (rawValue && rawValue.length > 1000) {
          return rawValue.substring(0, 1000) + '...';
        }
        return rawValue;
      },
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息',
    },
  }, {
    tableName: 'api_monitor_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['monitor_id'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['status'],
      },
    ],
  });

  ApiMonitorLog.associate = (models) => {
    // 与监控配置的关系
    ApiMonitorLog.belongsTo(models.ApiMonitor, {
      foreignKey: 'monitor_id',
      as: 'monitor',
    });
  };

  return ApiMonitorLog;
};
