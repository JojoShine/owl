module.exports = (sequelize, DataTypes) => {
  const DashboardWidget = sequelize.define('DashboardWidget', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '卡片标题',
    },
    widget_type: {
      type: DataTypes.ENUM('metric', 'chart'),
      defaultValue: 'chart',
      comment: 'metric=数字指标, chart=图表',
    },
    chart_type: {
      type: DataTypes.ENUM('line', 'bar', 'area', 'pie'),
      defaultValue: 'bar',
      allowNull: true,
      comment: '图表类型，widget_type=chart 时有效',
    },
    sql_query: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '查询 SQL，只允许 SELECT',
    },
    x_key: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '图表 X 轴字段名',
    },
    data_key: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '图表数值字段名',
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '单位（如 GB、次）',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序，数字越小越靠前',
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
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
    tableName: 'owl_dashboard_widgets',
  });

  DashboardWidget.associate = (models) => {
    DashboardWidget.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
  };

  return DashboardWidget;
};
