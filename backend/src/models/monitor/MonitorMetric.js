module.exports = (sequelize, DataTypes) => {
  const MonitorMetric = sequelize.define('MonitorMetric', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    metric_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '指标类型：system, application, database, cache',
      validate: {
        isIn: [['system', 'application', 'database', 'cache']],
      },
    },
    metric_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '指标名称：cpu, memory, disk, etc.',
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '指标值',
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '单位：%, MB, ms, etc.',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '额外的标签信息',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '创建者ID',
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '最后更新者ID',
    },
    deleted_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '删除者ID（用于软删除）',
    },
  }, {
    tableName: 'owl_monitor_metrics',
    indexes: [
      {
        fields: ['metric_type'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['metric_type', 'metric_name'],
      },
    ],
  });

  MonitorMetric.associate = (models) => {
    // 暂无关联
  };

  return MonitorMetric;
};
