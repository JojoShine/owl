'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 创建监控数据表 (monitor_metrics)
    await queryInterface.createTable('monitor_metrics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '监控数据ID，主键'
      },
      metric_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '指标类型：system, application, database, cache'
      },
      metric_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '指标名称：cpu, memory, disk, etc.'
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: '指标值'
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '单位：%, MB, ms, etc.'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '额外的标签信息'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE monitor_metrics IS '监控数据表'"
    );

    // 添加索引
    await queryInterface.addIndex('monitor_metrics', ['metric_type'], {
      name: 'idx_monitor_metrics_type'
    });
    await queryInterface.addIndex('monitor_metrics', ['created_at'], {
      name: 'idx_monitor_metrics_created_at'
    });
    await queryInterface.addIndex('monitor_metrics', ['metric_type', 'metric_name'], {
      name: 'idx_monitor_metrics_type_name'
    });

    // 2. 创建接口监控配置表 (api_monitors)
    await queryInterface.createTable('api_monitors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '接口监控ID，主键'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '监控名称'
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: '监控的URL'
      },
      method: {
        type: Sequelize.STRING(10),
        defaultValue: 'GET',
        comment: '请求方法：GET, POST, PUT, DELETE'
      },
      headers: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '请求头'
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '请求体'
      },
      interval: {
        type: Sequelize.INTEGER,
        defaultValue: 60,
        comment: '检测间隔（秒）'
      },
      timeout: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        comment: '超时时间（秒）'
      },
      expect_status: {
        type: Sequelize.INTEGER,
        defaultValue: 200,
        comment: '期望的状态码'
      },
      expect_response: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '期望的响应内容（可选）'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否启用'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '创建者ID',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      "COMMENT ON TABLE api_monitors IS '接口监控配置表'"
    );

    // 添加索引
    await queryInterface.addIndex('api_monitors', ['enabled'], {
      name: 'idx_api_monitors_enabled'
    });
    await queryInterface.addIndex('api_monitors', ['created_by'], {
      name: 'idx_api_monitors_created_by'
    });

    // 3. 创建接口监控历史表 (api_monitor_logs)
    await queryInterface.createTable('api_monitor_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '监控日志ID，主键'
      },
      monitor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '监控配置ID',
        references: {
          model: 'api_monitors',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '状态：success, failed, timeout'
      },
      status_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'HTTP状态码'
      },
      response_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '响应时间（毫秒）'
      },
      response_body: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '响应内容（截取前1000字符）'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '错误信息'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE api_monitor_logs IS '接口监控历史表'"
    );

    // 添加索引
    await queryInterface.addIndex('api_monitor_logs', ['monitor_id'], {
      name: 'idx_api_monitor_logs_monitor_id'
    });
    await queryInterface.addIndex('api_monitor_logs', ['created_at'], {
      name: 'idx_api_monitor_logs_created_at'
    });
    await queryInterface.addIndex('api_monitor_logs', ['status'], {
      name: 'idx_api_monitor_logs_status'
    });

    // 4. 创建告警规则表 (alert_rules)
    await queryInterface.createTable('alert_rules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '告警规则ID，主键'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '规则名称'
      },
      metric_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '监控类型'
      },
      condition: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '条件：>, <, >=, <=, =='
      },
      threshold: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: '阈值'
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '持续时间（秒）'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否启用'
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
      "COMMENT ON TABLE alert_rules IS '告警规则表'"
    );

    // 添加索引
    await queryInterface.addIndex('alert_rules', ['enabled'], {
      name: 'idx_alert_rules_enabled'
    });
    await queryInterface.addIndex('alert_rules', ['metric_type'], {
      name: 'idx_alert_rules_metric_type'
    });

    // 5. 创建告警历史表 (alert_history)
    await queryInterface.createTable('alert_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '告警历史ID，主键'
      },
      rule_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '告警规则ID',
        references: {
          model: 'alert_rules',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '告警信息'
      },
      level: {
        type: Sequelize.STRING(20),
        defaultValue: 'warning',
        comment: '告警级别：info, warning, error, critical'
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending',
        comment: '状态：pending, resolved'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '解决时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE alert_history IS '告警历史表'"
    );

    // 添加索引
    await queryInterface.addIndex('alert_history', ['rule_id'], {
      name: 'idx_alert_history_rule_id'
    });
    await queryInterface.addIndex('alert_history', ['created_at'], {
      name: 'idx_alert_history_created_at'
    });
    await queryInterface.addIndex('alert_history', ['status'], {
      name: 'idx_alert_history_status'
    });
    await queryInterface.addIndex('alert_history', ['level'], {
      name: 'idx_alert_history_level'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 按照依赖关系的逆序删除表
    await queryInterface.dropTable('alert_history');
    await queryInterface.dropTable('alert_rules');
    await queryInterface.dropTable('api_monitor_logs');
    await queryInterface.dropTable('api_monitors');
    await queryInterface.dropTable('monitor_metrics');
  }
};
