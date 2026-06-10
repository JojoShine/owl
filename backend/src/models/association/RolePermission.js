module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '角色ID',
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '权限ID',
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
    tableName: 'owl_role_permissions',
  });

  RolePermission.associate = (models) => {
    // 关联表属于角色
    RolePermission.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role',
    });

    // 关联表属于权限
    RolePermission.belongsTo(models.Permission, {
      foreignKey: 'permission_id',
      as: 'permission',
    });
  };

  return RolePermission;
};
