module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '父部门ID',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    leader_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '部门负责人ID',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  }, {
    tableName: 'departments',
    timestamps: true,
    underscored: true,
  });

  Department.associate = (models) => {
    // 部门自关联（树形结构）
    Department.hasMany(models.Department, {
      foreignKey: 'parent_id',
      as: 'children',
    });
    Department.belongsTo(models.Department, {
      foreignKey: 'parent_id',
      as: 'parent',
    });

    // 部门与用户的关系（一个部门有多个成员）
    Department.hasMany(models.User, {
      foreignKey: 'department_id',
      as: 'members',
    });

    // 部门负责人（一个部门有一个负责人）
    Department.belongsTo(models.User, {
      foreignKey: 'leader_id',
      as: 'leader',
    });
  };

  return Department;
};