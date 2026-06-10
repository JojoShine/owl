module.exports = (sequelize, DataTypes) => {
  const WatermarkConfig = sequelize.define('WatermarkConfig', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '水印是否启用',
    },
    lines: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '水印内容行数组，支持动态变量 {{user:fieldName}}',
    },
    font_size: {
      type: DataTypes.INTEGER,
      defaultValue: 24,
      comment: '字体大小（12-48px）',
    },
    font_weight: {
      type: DataTypes.STRING(3),
      defaultValue: '400',
      comment: '字体粗细（300|400|700）',
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#000000',
      comment: '颜色（十六进制）',
    },
    opacity: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.15,
      comment: '透明度（0.05-0.5）',
    },
    rotation: {
      type: DataTypes.INTEGER,
      defaultValue: 45,
      comment: '旋转角度（0-360°）',
    },
    spacing: {
      type: DataTypes.INTEGER,
      defaultValue: 150,
      comment: '间距（50-300px）',
    },
    masking_rules: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '脱敏规则配置，格式: {fieldName: {type, hideCount|showCount}}',
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
    tableName: 'owl_watermark_config',
  });

  WatermarkConfig.associate = (models) => {
    // 水印配置由某个用户创建
    WatermarkConfig.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
  };

  return WatermarkConfig;
};