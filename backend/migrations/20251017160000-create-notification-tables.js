'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 创建通知表 (notifications)
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '通知ID，主键'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '用户ID',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '通知标题'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '通知内容'
      },
      type: {
        type: Sequelize.STRING(50),
        defaultValue: 'info',
        comment: '通知类型：info, system, warning, error, success'
      },
      link: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '点击跳转链接'
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否已读'
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '阅读时间'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE notifications IS '站内通知表'"
    );

    // 添加索引
    await queryInterface.addIndex('notifications', ['user_id'], {
      name: 'idx_notifications_user_id'
    });
    await queryInterface.addIndex('notifications', ['is_read'], {
      name: 'idx_notifications_is_read'
    });
    await queryInterface.addIndex('notifications', ['created_at'], {
      name: 'idx_notifications_created_at'
    });
    await queryInterface.addIndex('notifications', ['type'], {
      name: 'idx_notifications_type'
    });
    await queryInterface.addIndex('notifications', ['user_id', 'is_read'], {
      name: 'idx_notifications_user_read'
    });

    // 2. 创建邮件记录表 (email_logs)
    await queryInterface.createTable('email_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '邮件记录ID，主键'
      },
      to_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '收件人邮箱'
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '邮件主题'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '邮件内容'
      },
      template_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '使用的模板名称'
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending',
        comment: '发送状态：pending, sent, failed'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '错误信息'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '重试次数'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '发送时间'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE email_logs IS '邮件发送记录表'"
    );

    // 添加索引
    await queryInterface.addIndex('email_logs', ['to_email'], {
      name: 'idx_email_logs_to_email'
    });
    await queryInterface.addIndex('email_logs', ['status'], {
      name: 'idx_email_logs_status'
    });
    await queryInterface.addIndex('email_logs', ['created_at'], {
      name: 'idx_email_logs_created_at'
    });
    await queryInterface.addIndex('email_logs', ['template_name'], {
      name: 'idx_email_logs_template_name'
    });

    // 3. 创建通知配置表 (notification_settings)
    await queryInterface.createTable('notification_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '通知配置ID，主键'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        comment: '用户ID（唯一）',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      email_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否启用邮件通知'
      },
      push_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否启用推送通知'
      },
      system_notification: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否接收系统通知'
      },
      warning_notification: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否接收警告通知'
      },
      error_notification: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否接收错误通知'
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
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE notification_settings IS '用户通知配置表'"
    );

    // 添加索引
    await queryInterface.addIndex('notification_settings', ['user_id'], {
      name: 'idx_notification_settings_user_id'
    });

    // 4. 创建邮件模板表 (email_templates)
    await queryInterface.createTable('email_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '邮件模板ID，主键'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: '模板名称（唯一）'
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '邮件主题'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'HTML模板内容（支持handlebars语法）'
      },
      variables: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '模板变量说明'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '模板描述'
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
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE email_templates IS '邮件模板表'"
    );

    // 添加索引
    await queryInterface.addIndex('email_templates', ['name'], {
      name: 'idx_email_templates_name'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 按照依赖关系的逆序删除表
    await queryInterface.dropTable('email_templates');
    await queryInterface.dropTable('notification_settings');
    await queryInterface.dropTable('email_logs');
    await queryInterface.dropTable('notifications');
  }
};
