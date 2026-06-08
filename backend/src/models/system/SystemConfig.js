module.exports = (sequelize, DataTypes) => {
  const SystemConfig = sequelize.define('SystemConfig', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    // Logo 和背景图片 URL
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Logo 图片 URL',
    },
    login_bg_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '登录背景图片 URL',
    },

    // 系统信息
    company_name: {
      type: DataTypes.STRING(100),
      defaultValue: 'Owl Platform',
      comment: '公司名称',
    },
    system_name: {
      type: DataTypes.STRING(100),
      defaultValue: 'Owl Platform',
      comment: '系统名称',
    },
    show_tech_stack: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否展示技术栈信息',
    },
    registration_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否开放用户注册',
    },
    login_method: {
      type: DataTypes.ENUM('password', 'sms', 'both'),
      defaultValue: 'both',
      comment: '登录方式：password账密|sms短信|both两者都支持',
    },
    registration_method: {
      type: DataTypes.ENUM('password', 'sms', 'both'),
      defaultValue: 'both',
      comment: '注册方式：password账密|sms短信|both两者都支持',
    },
    login_layout: {
      type: DataTypes.ENUM('center', 'left-image', 'right-image'),
      defaultValue: 'center',
      comment: '登录页布局：center居中|left-image左图右登录|right-image左登录右图',
    },
    tech_stack_info: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '技术栈信息配置',
    },

    // 主题配置
    enable_theme_switch: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否支持主题切换',
    },
    theme_mode: {
      type: DataTypes.ENUM('light', 'dark', 'auto'),
      defaultValue: 'auto',
      comment: '默认主题模式',
    },
    primary_color: {
      type: DataTypes.STRING(20),
      defaultValue: 'default',
      comment: '主题色：default|blue|green|purple|orange|red|cyan',
    },

    // 元数据
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '创建者ID',
    },
  }, {
    tableName: 'owl_system_configs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  SystemConfig.associate = (models) => {
    SystemConfig.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
  };

  return SystemConfig;
};
