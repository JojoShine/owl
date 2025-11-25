const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FilePermission = sequelize.define(
    'FilePermission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resource_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [['file', 'folder']],
        },
        comment: '资源类型：file(文件) 或 folder(文件夹)',
      },
      resource_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '资源ID（文件ID或文件夹ID）',
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: '用户ID，NULL表示这是角色权限',
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: '角色ID，NULL表示这是用户权限',
      },
      permission: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [['read', 'write', 'delete', 'admin']],
        },
        comment: '权限类型：read(读)、write(写)、delete(删除)、admin(管理)',
      },
      granted_by: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: '授权人ID',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      tableName: 'file_permissions',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  FilePermission.associate = (models) => {
    // 关联用户
    FilePermission.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    // 关联角色
    FilePermission.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role',
    });

    // 关联授权人
    FilePermission.belongsTo(models.User, {
      foreignKey: 'granted_by',
      as: 'granter',
    });
  };

  return FilePermission;
};
