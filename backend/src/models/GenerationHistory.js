module.exports = (sequelize, DataTypes) => {
  const GenerationHistory = sequelize.define('GenerationHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    module_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '模块ID',
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '数据库表名',
    },
    module_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '模块名称',
    },
    operation_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '操作类型: create/update/delete',
    },
    files_generated: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '生成的文件列表',
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: '是否成功',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息',
    },
    generated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '操作人',
    },
  }, {
    tableName: 'generation_history',
    timestamps: true,
    underscored: true,
    updatedAt: false, // 历史记录不需要 updated_at
  });

  GenerationHistory.associate = (models) => {
    // 与模块的多对一关系
    GenerationHistory.belongsTo(models.GeneratedModule, {
      foreignKey: 'module_id',
      as: 'module',
    });

    // 与用户的多对一关系（操作人）
    GenerationHistory.belongsTo(models.User, {
      foreignKey: 'generated_by',
      as: 'generator',
    });
  };

  return GenerationHistory;
};
