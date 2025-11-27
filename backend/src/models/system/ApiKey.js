module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define(
    'ApiKey',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      interface_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '关联的接口ID',
      },
      app_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '应用名称',
      },
      api_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'API密钥',
      },
      api_secret: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'API密钥加密值',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: '密钥状态',
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '密钥过期时间（3天后）',
      },
      last_used_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后使用时间',
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '创建者ID',
      },
    },
    {
      tableName: 'api_keys',
      timestamps: true,
      underscored: true,
    }
  );

  ApiKey.associate = (db) => {
    ApiKey.belongsTo(db.ApiInterface, {
      foreignKey: 'interface_id',
      as: 'interface',
    });
    ApiKey.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
  };

  return ApiKey;
};