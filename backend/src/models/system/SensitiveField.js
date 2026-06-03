/**
 * 敏感字段配置模型
 */
module.exports = (sequelize, DataTypes) => {
  const SensitiveField = sequelize.define('SensitiveField', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: '主键ID'
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '表名（可选，仅用于文档说明）'
    },
    field_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '字段名（全局唯一）'
    },
    mask_type: {
      type: DataTypes.ENUM('phone', 'email', 'id_card', 'bank_card', 'name', 'address', 'custom'),
      defaultValue: 'custom',
      allowNull: false,
      comment: '脱敏类型'
    },
    mask_rule: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: '自定义脱敏规则（JSON格式）'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '字段描述'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: '是否启用'
    }
  }, {
    tableName: 'owl_sensitive_fields',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['field_name']
      }
    ]
  });

  return SensitiveField;
};
