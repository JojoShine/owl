module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '父级菜单ID',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '路由路径',
    },
    component: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '组件路径',
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('menu', 'button', 'link'),
      defaultValue: 'menu',
    },
    visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否显示',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序值',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    permission_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '关联的权限代码',
    },
  }, {
    tableName: 'menus',
    timestamps: true,
    underscored: true,
  });

  Menu.associate = (models) => {
    // 菜单与角色多对多关系
    Menu.belongsToMany(models.Role, {
      through: models.RoleMenu,
      foreignKey: 'menu_id',
      otherKey: 'role_id',
      as: 'roles',
    });

    // 菜单自关联（树形结构）
    Menu.hasMany(models.Menu, {
      foreignKey: 'parent_id',
      as: 'children',
    });
    Menu.belongsTo(models.Menu, {
      foreignKey: 'parent_id',
      as: 'parent',
    });
  };

  return Menu;
};