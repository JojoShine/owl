module.exports = (sequelize, DataTypes) => {
  const GeneratedModule = sequelize.define('GeneratedModule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '数据库表名（唯一）',
    },
    module_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '模块名称（如 Product）',
    },
    module_path: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '路由路径（如 /products）',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '模块描述',
    },
    menu_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '菜单名称',
    },
    menu_icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '菜单图标',
    },
    menu_parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '父菜单ID',
    },
    menu_sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '菜单排序',
    },
    // 功能开关
    enable_create: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否支持新增',
    },
    enable_update: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否支持编辑',
    },
    enable_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否支持删除',
    },
    enable_batch_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否支持批量删除',
    },
    enable_export: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否支持导出',
    },
    enable_import: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否支持导入',
    },
    // 生成信息
    generated_files: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '生成的文件列表',
    },
    page_config: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: '前端页面配置（用于动态渲染）',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '创建人',
    },
  }, {
    tableName: 'generated_modules',
    timestamps: true,
    underscored: true,
  });

  GeneratedModule.associate = (models) => {
    // 与字段配置的一对多关系
    GeneratedModule.hasMany(models.GeneratedField, {
      foreignKey: 'module_id',
      as: 'fields',
      onDelete: 'CASCADE',
    });

    // 与生成历史的一对多关系
    GeneratedModule.hasMany(models.GenerationHistory, {
      foreignKey: 'module_id',
      as: 'history',
      onDelete: 'SET NULL',
    });

    // 与用户的多对一关系（创建人）
    GeneratedModule.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
  };

  return GeneratedModule;
};
