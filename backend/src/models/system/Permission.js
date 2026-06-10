module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '权限代码，格式：resource:action',
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '资源名称',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作类型：create, read, update, delete',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '权限分类',
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
    tableName: 'owl_permissions',
  });

  Permission.associate = (models) => {
    // 权限与角色多对多关系
    Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'roles',
    });
  };

  return Permission;
};
