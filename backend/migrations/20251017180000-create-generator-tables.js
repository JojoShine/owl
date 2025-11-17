'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 创建模块配置表 (generated_modules)
    await queryInterface.createTable('generated_modules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '模块ID，主键'
      },
      table_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: '数据库表名（唯一）'
      },
      module_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '模块名称（如 Product）'
      },
      module_path: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '路由路径（如 /products）'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '模块描述'
      },
      menu_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '菜单名称'
      },
      menu_icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '菜单图标'
      },
      menu_parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '父菜单ID'
      },
      menu_sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '菜单排序'
      },
      // 功能开关
      enable_create: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否支持新增'
      },
      enable_update: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否支持编辑'
      },
      enable_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否支持删除'
      },
      enable_batch_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否支持批量删除'
      },
      enable_export: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否支持导出'
      },
      enable_import: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否支持导入'
      },
      // 生成信息
      generated_files: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '生成的文件列表'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '创建人',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
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
      "COMMENT ON TABLE generated_modules IS '代码生成器-模块配置表'"
    );

    // 添加索引
    await queryInterface.addIndex('generated_modules', ['table_name'], {
      name: 'idx_generated_modules_table_name'
    });
    await queryInterface.addIndex('generated_modules', ['created_by'], {
      name: 'idx_generated_modules_created_by'
    });

    // 2. 创建字段配置表 (generated_fields)
    await queryInterface.createTable('generated_fields', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '字段配置ID，主键'
      },
      module_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '模块ID',
        references: {
          model: 'generated_modules',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      field_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '字段名称'
      },
      field_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '字段类型'
      },
      field_comment: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '字段注释'
      },
      // 搜索配置
      is_searchable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否作为搜索条件'
      },
      search_type: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '搜索方式: exact/like/range/in'
      },
      search_component: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '搜索组件: input/select/date-picker'
      },
      // 列表显示配置
      show_in_list: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否在列表显示'
      },
      list_sort: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '列表显示顺序'
      },
      list_width: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '列宽度（如 150px）'
      },
      list_align: {
        type: Sequelize.STRING(10),
        defaultValue: 'left',
        comment: '对齐方式: left/center/right'
      },
      // 特殊处理
      format_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '格式化类型: mask/date/money/enum/link/combine'
      },
      format_options: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '格式化选项'
      },
      // 表单配置
      show_in_form: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否在表单显示'
      },
      form_component: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '表单组件类型'
      },
      form_rules: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '表单验证规则'
      },
      is_readonly: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: '是否只读'
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
      "COMMENT ON TABLE generated_fields IS '代码生成器-字段配置表'"
    );

    // 添加索引
    await queryInterface.addIndex('generated_fields', ['module_id'], {
      name: 'idx_generated_fields_module_id'
    });
    await queryInterface.addIndex('generated_fields', ['list_sort'], {
      name: 'idx_generated_fields_list_sort'
    });

    // 3. 创建生成历史表 (generation_history)
    await queryInterface.createTable('generation_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '历史记录ID，主键'
      },
      module_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '模块ID',
        references: {
          model: 'generated_modules',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      table_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '数据库表名'
      },
      module_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '模块名称'
      },
      action: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '操作类型: create/update/delete'
      },
      files_generated: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '生成的文件列表'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '操作人',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE generation_history IS '代码生成器-生成历史表'"
    );

    // 添加索引
    await queryInterface.addIndex('generation_history', ['module_id'], {
      name: 'idx_generation_history_module_id'
    });
    await queryInterface.addIndex('generation_history', ['created_at'], {
      name: 'idx_generation_history_created_at'
    });
    await queryInterface.addIndex('generation_history', ['created_by'], {
      name: 'idx_generation_history_created_by'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 按照依赖关系的逆序删除表
    await queryInterface.dropTable('generation_history');
    await queryInterface.dropTable('generated_fields');
    await queryInterface.dropTable('generated_modules');
  }
};
