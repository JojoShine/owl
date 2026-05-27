module.exports = (sequelize, DataTypes) => {
  const ThirdPartyApiKey = sequelize.define(
    'ThirdPartyApiKey',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      api_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'API密钥（公开标识）',
      },
      api_secret: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'API密钥加密值（仅用于验证）',
      },
      client_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '客户端/第三方系统名称',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '密钥描述',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'expired'),
        defaultValue: 'active',
        comment: '密钥状态（active-激活，inactive-禁用，expired-过期）',
      },
      last_used_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后使用时间',
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '密钥过期时间（可选，为null表示不过期）',
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: '创建者ID',
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注信息',
      },
    },
    {
      tableName: 'owl_third_party_api_keys',
      timestamps: true,
      underscored: true,
      comment: '第三方系统API密钥表',
    }
  );

  ThirdPartyApiKey.associate = (db) => {
    // 可以关联到User表（记录创建者）
    if (db.User) {
      ThirdPartyApiKey.belongsTo(db.User, {
        foreignKey: 'created_by',
        as: 'creator',
      });
    }
  };

  return ThirdPartyApiKey;
};