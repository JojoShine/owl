module.exports = (sequelize, DataTypes) => {
  const AlertHistory = sequelize.define('AlertHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rule_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '告警规则ID',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '告警信息',
    },
    level: {
      type: DataTypes.STRING(20),
      defaultValue: 'warning',
      comment: '告警级别：info, warning, error, critical',
      validate: {
        isIn: [['info', 'warning', 'error', 'critical']],
      },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      comment: '状态：pending, resolved',
      validate: {
        isIn: [['pending', 'resolved']],
      },
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '解决时间',
    },
  }, {
    tableName: 'alert_history',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['rule_id'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['level'],
      },
    ],
  });

  AlertHistory.associate = (models) => {
    // 与告警规则的关系
    AlertHistory.belongsTo(models.AlertRule, {
      foreignKey: 'rule_id',
      as: 'rule',
    });
  };

  return AlertHistory;
};
