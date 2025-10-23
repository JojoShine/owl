'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建用户表
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '用户ID，主键'
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '用户名，唯一索引'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: '邮箱地址，唯一索引'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '密码，bcrypt加密存储'
      },
      real_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '真实姓名'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
        comment: '手机号，唯一索引'
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '用户头像URL'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'banned'),
        defaultValue: 'active',
        comment: '用户状态：active-正常，inactive-禁用，banned-封禁'
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '最后登录时间'
      },
      last_login_ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: '最后登录IP地址'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '更新时间'
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '软删除时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE users IS '用户表'"
    );

    // 添加索引
    await queryInterface.addIndex('users', ['username'], {
      name: 'idx_users_username'
    });
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email'
    });
    await queryInterface.addIndex('users', ['phone'], {
      name: 'idx_users_phone'
    });
    await queryInterface.addIndex('users', ['status'], {
      name: 'idx_users_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
