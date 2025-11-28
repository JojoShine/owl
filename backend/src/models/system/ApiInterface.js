module.exports = (sequelize, DataTypes) => {
  const ApiInterface = sequelize.define(
    'ApiInterface',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '接口名称',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '接口描述',
      },
      sql_query: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'SQL查询语句',
      },
      method: {
        type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE'),
        defaultValue: 'GET',
        comment: '请求方式',
      },
      endpoint: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '接口端点路径',
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: '接口版本号',
      },
      parameters: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: '接口参数定义',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: '接口状态',
      },
      require_auth: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: '是否需要认证',
      },
      rate_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 1000,
        comment: '每小时请求限制',
      },
      api_key_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: '关联的API密钥ID',
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '创建者ID',
      },
    },
    {
      tableName: 'api_interfaces',
      timestamps: true,
      underscored: true,
    }
  );

  ApiInterface.associate = (db) => {
    ApiInterface.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    ApiInterface.hasMany(db.ApiKey, {
      foreignKey: 'interface_id',
      as: 'keys',
      onDelete: 'CASCADE',
    });
  };

  return ApiInterface;
};
