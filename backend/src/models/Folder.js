module.exports = (sequelize, DataTypes) => {
  const Folder = sequelize.define('Folder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '父文件夹ID',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '创建者ID',
    },
  }, {
    tableName: 'folders',
    timestamps: true,
    underscored: true,
  });

  Folder.associate = (models) => {
    // 自关联：父文件夹
    Folder.belongsTo(models.Folder, {
      foreignKey: 'parent_id',
      as: 'parent',
    });

    // 自关联：子文件夹
    Folder.hasMany(models.Folder, {
      foreignKey: 'parent_id',
      as: 'children',
    });

    // 与用户的关系
    Folder.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });

    // 与文件的关系
    Folder.hasMany(models.File, {
      foreignKey: 'folder_id',
      as: 'files',
    });
  };

  // 实例方法：检查是否是根文件夹
  Folder.prototype.isRoot = function() {
    return this.parent_id === null;
  };

  // 实例方法：获取完整路径
  Folder.prototype.getFullPath = async function() {
    const path = [this.name];
    let current = this;

    while (current.parent_id) {
      current = await Folder.findByPk(current.parent_id);
      if (current) {
        path.unshift(current.name);
      } else {
        break;
      }
    }

    return path.join('/');
  };

  return Folder;
};
