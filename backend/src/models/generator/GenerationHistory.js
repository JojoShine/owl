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
    tableName: 'owl_generation_history',
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
