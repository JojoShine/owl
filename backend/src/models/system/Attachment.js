module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '文件名',
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '文件路径',
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '文件大小（字节）',
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '文件MIME类型',
    },
    file_ext: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '文件扩展名',
    },
    relation_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      comment: '关联记录ID',
    },
    relation_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '关联类型',
    },
    attachment_category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '附件分类',
    },
    created_by: {
      type: DataTypes.STRING(36),
      allowNull: false,
      comment: '创建人ID',
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否删除',
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '删除时间',
    },
    deleted_by: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '删除人ID',
    },
  }, {
    tableName: 'attachment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  });

  Attachment.associate = (models) => {
    // 关联已移除 - 附件模型现在是通用模型，不绑定特定业务实体
    // 可以通过 relation_id 和 relation_type 字段动态关联任何实体
  };

  return Attachment;
};
