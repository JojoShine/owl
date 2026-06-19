module.exports = (sequelize, DataTypes) => {
  const EmailTask = sequelize.define('EmailTask', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '任务名称',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '任务描述',
    },
    template_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '邮件模板ID',
    },
    recipients: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '收件人邮箱（逗号分隔，支持多个）',
    },
    frequency: {
      type: DataTypes.ENUM('once', 'hourly', 'daily', 'weekly', 'monthly'),
      allowNull: false,
      defaultValue: 'once',
      comment: '发送频率: once(一次), hourly(每小时), daily(每天), weekly(每周), monthly(每月)',
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用',
    },
    template_variables: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: '模板变量值',
    },
    last_executed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后执行时间',
    },
    next_execution_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下次执行时间',
    },
    execution_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '执行次数',
    },
    last_status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      defaultValue: 'pending',
      comment: '最后执行状态',
    },
    last_error: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '最后执行的错误信息',
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
    tableName: 'owl_email_tasks',
  });

  EmailTask.associate = (models) => {
    // 关联到邮件模板
    // EmailTask.belongsTo(models.EmailTemplate, { foreignKey: 'template_id' });
  };

  return EmailTask;
};
