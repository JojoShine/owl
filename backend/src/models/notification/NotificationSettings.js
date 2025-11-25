module.exports = (sequelize, DataTypes) => {
  const NotificationSettings = sequelize.define('NotificationSettings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      comment: '用户ID（唯一）',
    },
    email_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用邮件通知',
    },
    push_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用推送通知',
    },
    system_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否接收系统通知',
    },
    warning_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否接收警告通知',
    },
    error_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否接收错误通知',
    },
  }, {
    tableName: 'notification_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  NotificationSettings.associate = (models) => {
    // 通知设置属于某个用户
    NotificationSettings.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return NotificationSettings;
};
