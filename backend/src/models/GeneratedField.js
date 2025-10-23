module.exports = (sequelize, DataTypes) => {
  const GeneratedField = sequelize.define('GeneratedField', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    module_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '模块ID',
    },
    field_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '字段名称',
    },
    field_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '字段类型',
    },
    field_comment: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '字段注释',
    },
    // 搜索配置
    is_searchable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否作为搜索条件',
    },
    search_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '搜索方式: exact/like/range/in',
    },
    search_component: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '搜索组件: input/select/date-picker',
    },
    // 列表显示配置
    show_in_list: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否在列表显示',
    },
    list_sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '列表显示顺序',
    },
    list_width: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '列宽度（如 150px）',
    },
    list_align: {
      type: DataTypes.STRING(10),
      defaultValue: 'left',
      comment: '对齐方式: left/center/right',
    },
    // 特殊处理
    format_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '格式化类型: mask/date/money/enum/link/combine',
    },
    format_options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '格式化选项',
    },
    // 表单配置
    show_in_form: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否在表单显示',
    },
    form_component: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '表单组件类型',
    },
    form_rules: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '表单验证规则',
    },
    is_readonly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否只读',
    },
  }, {
    tableName: 'generated_fields',
    timestamps: true,
    underscored: true,
  });

  GeneratedField.associate = (models) => {
    // 与模块的多对一关系
    GeneratedField.belongsTo(models.GeneratedModule, {
      foreignKey: 'module_id',
      as: 'module',
    });
  };

  return GeneratedField;
};
