module.exports = (sequelize, DataTypes) => {
  const FileShare = sequelize.define('FileShare', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    file_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '文件ID',
    },
    share_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '分享码',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '过期时间',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '创建者ID',
    },
  }, {
    tableName: 'file_shares',
    timestamps: true,
    underscored: true,
    // 只需要 created_at，不需要 updated_at
    updatedAt: false,
  });

  FileShare.associate = (models) => {
    // 与文件的关系
    FileShare.belongsTo(models.File, {
      foreignKey: 'file_id',
      as: 'file',
    });

    // 与用户的关系
    FileShare.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
  };

  // 实例方法：检查分享是否过期
  FileShare.prototype.isExpired = function() {
    if (!this.expires_at) {
      return false; // 永不过期
    }
    return new Date() > new Date(this.expires_at);
  };

  // 实例方法：检查分享是否有效
  FileShare.prototype.isValid = function() {
    return !this.isExpired();
  };

  // 实例方法：获取剩余时间（秒）
  FileShare.prototype.getRemainingTime = function() {
    if (!this.expires_at) {
      return null; // 永不过期
    }

    const now = new Date();
    const expiresAt = new Date(this.expires_at);
    const remaining = Math.floor((expiresAt - now) / 1000);

    return remaining > 0 ? remaining : 0;
  };

  // 类方法：生成分享码
  FileShare.generateShareCode = function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  return FileShare;
};
