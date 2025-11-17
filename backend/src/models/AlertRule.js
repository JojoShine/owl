module.exports = (sequelize, DataTypes) => {
  const AlertRule = sequelize.define('AlertRule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '规则名称',
    },
    metric_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '监控类型',
    },
    metric_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '监控指标名称',
    },
    condition: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '条件：>, <, >=, <=, ==',
      validate: {
        isIn: [['>', '<', '>=', '<=', '==', '!=']],
      },
    },
    threshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '阈值',
    },
    level: {
      type: DataTypes.STRING(20),
      defaultValue: 'warning',
      comment: '告警级别：info, warning, error, critical',
      validate: {
        isIn: [['info', 'warning', 'error', 'critical']],
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '持续时间（秒）',
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用',
    },
    alert_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否启用邮件告警',
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
        min: 60,
        max: 86400,
      },
    },
  }, {
    tableName: 'alert_rules',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['enabled'],
      },
      {
        fields: ['metric_type'],
      },
    ],
  });

  AlertRule.associate = (models) => {
    // 与告警历史的关系
    AlertRule.hasMany(models.AlertHistory, {
      foreignKey: 'rule_id',
      as: 'alerts',
    });

    // 与邮件模版的关系
    AlertRule.belongsTo(models.EmailTemplate, {
      foreignKey: 'alert_template_id',
      as: 'alertTemplate',
    });
  };

  return AlertRule;
};
