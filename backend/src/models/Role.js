module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '角色代码，用于权限控制',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序值，越小越靠前',
    },
  }, {
    tableName: 'roles',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  Role.associate = (models) => {
    // 角色与用户多对多关系
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users',
    });

    // 角色与权限多对多关系
    Role.belongsToMany(models.Permission, {
      through: models.RolePermission,
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions',
    });

    // 角色与菜单多对多关系
    Role.belongsToMany(models.Menu, {
      through: models.RoleMenu,
      foreignKey: 'role_id',
      otherKey: 'menu_id',
      as: 'menus',
    });
  };

  return Role;
};
