'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 创建接口配置表
    await queryInterface.createTable('api_interfaces', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '接口ID，主键'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '接口名称'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '接口描述'
      },
      sql_query: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'SQL查询语句'
      },
      method: {
        type: Sequelize.ENUM('GET', 'POST', 'PUT', 'DELETE'),
        defaultValue: 'GET',
        comment: '请求方式'
      },
      endpoint: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '接口端点路径'
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: '接口版本号'
      },
      parameters: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '接口参数定义 [{name, type, required, description}]'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: '接口状态'
      },
      require_auth: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否需要认证'
      },
      rate_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 1000,
        comment: '每小时请求限制'
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
      "COMMENT ON TABLE api_interfaces IS '接口配置表'"
    );

    // 添加索引
    await queryInterface.addIndex('api_interfaces', ['status'], {
      name: 'idx_api_interfaces_status'
    });
    await queryInterface.addIndex('api_interfaces', ['created_by'], {
      name: 'idx_api_interfaces_created_by'
    });
    await queryInterface.addIndex('api_interfaces', ['endpoint'], {
      name: 'idx_api_interfaces_endpoint'
    });
    // 唯一索引：endpoint + version
    await queryInterface.addIndex('api_interfaces', ['endpoint', 'version'], {
      name: 'uk_api_interfaces_endpoint_version',
      unique: true
    });

    // 2. 创建API密钥表
    await queryInterface.createTable('api_keys', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '密钥ID，主键'
      },
      interface_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '关联的接口ID',
        references: {
          model: 'api_interfaces',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      app_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '应用名称'
      },
      api_key: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'API密钥'
      },
      api_secret: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'API密钥加密值'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: '密钥状态'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '密钥过期时间（3天后）'
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '最后使用时间'
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
      "COMMENT ON TABLE api_keys IS 'API密钥表'"
    );

    // 添加索引
    await queryInterface.addIndex('api_keys', ['interface_id'], {
      name: 'idx_api_keys_interface_id'
    });
    await queryInterface.addIndex('api_keys', ['api_key'], {
      name: 'idx_api_keys_api_key'
    });
    await queryInterface.addIndex('api_keys', ['expires_at'], {
      name: 'idx_api_keys_expires_at'
    });

    // 3. 创建接口调用日志表
    await queryInterface.createTable('api_call_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '日志ID，主键'
      },
      interface_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '接口ID',
        references: {
          model: 'api_interfaces',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      api_key_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'API密钥ID',
        references: {
          model: 'api_keys',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      request_method: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '请求方法'
      },
      request_params: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '请求参数'
      },
      response_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '响应状态码'
      },
      response_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '响应时间（毫秒）'
      },
      error_message: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '错误信息'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: '请求来源IP'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE api_call_logs IS '接口调用日志表'"
    );

    // 添加索引
    await queryInterface.addIndex('api_call_logs', ['interface_id'], {
      name: 'idx_api_call_logs_interface_id'
    });
    await queryInterface.addIndex('api_call_logs', ['api_key_id'], {
      name: 'idx_api_call_logs_api_key_id'
    });
    await queryInterface.addIndex('api_call_logs', ['created_at'], {
      name: 'idx_api_call_logs_created_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 按照依赖关系的逆序删除表
    await queryInterface.dropTable('api_call_logs');
    await queryInterface.dropTable('api_keys');
    await queryInterface.dropTable('api_interfaces');
  }
};
