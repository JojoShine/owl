module.exports = (sequelize, DataTypes) => {
  const EmailLog = sequelize.define('EmailLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    to_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '收件人邮箱',
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '邮件主题',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '邮件内容',
    },
    template_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '使用的模板名称',
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed'),
      defaultValue: 'pending',
      comment: '发送状态',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息',
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '重试次数',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '发送时间',
    },
  }, {
    tableName: 'email_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // 邮件日志表没有 updated_at
    underscored: true,
  });

  EmailLog.associate = (models) => {
    // 可以添加关联（如果需要）
  };

  return EmailLog;
};
