module.exports = (sequelize, DataTypes) => {
  const Dictionary = sequelize.define('Dictionary', {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dict_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '字典类型',
    },
    dict_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '字典代码',
    },
    dict_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '字典名称',
    },
    dict_value: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '字典值',
    },
    parent_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '父级代码',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  }, {
    tableName: 'dictionary',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  return Dictionary;
};