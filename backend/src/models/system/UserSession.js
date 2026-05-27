const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const UserSession = sequelize.define('UserSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  session_token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'JWT token 的 SHA256 hash'
  },
  device_info: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: '{ type, os, browser, device_name }'
  },
  location_info: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: '{ ip, country, city }'
  },
  login_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  last_active_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  kicked_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'kicked', 'expired'),
    defaultValue: 'active'
  }
}, {
  tableName: 'owl_user_sessions',
  underscored: true
});

// 关联关系
UserSession.associate = (models) => {
  UserSession.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = UserSession;
