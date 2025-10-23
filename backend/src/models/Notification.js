module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '用户ID',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '通知标题',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '通知内容',
    },
    type: {
      type: DataTypes.ENUM('info', 'system', 'warning', 'error', 'success'),
      defaultValue: 'info',
      comment: '通知类型',
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '点击跳转链接',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已读',
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '阅读时间',
    },
  }, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // 通知表没有 updated_at
    underscored: true,
  });

  Notification.associate = (models) => {
    // 通知属于某个用户
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Notification;
};
