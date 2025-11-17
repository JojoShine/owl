module.exports = (sequelize, DataTypes) => {
  const EmailTemplate = sequelize.define('EmailTemplate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '模板名称（唯一）',
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '邮件主题',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'HTML模板内容（支持handlebars语法）',
    },
    variables: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '模板变量说明（已废弃，使用 variable_schema 代替）',
    },
    variable_schema: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '变量Schema定义：[{ name, label, description, type, required, defaultValue, example }]',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: '标签列表：["monitoring", "alert", "api"]，替代固定分类',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '模板描述',
    },
    template_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'GENERAL_NOTIFICATION',
      comment: '模版类型：API_MONITOR_ALERT, SYSTEM_ALERT, GENERAL_NOTIFICATION（已废弃，使用 tags 代替）',
    },
  }, {
    tableName: 'email_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  EmailTemplate.associate = (models) => {
    // 可以添加关联（如果需要）
  };

  return EmailTemplate;
};
