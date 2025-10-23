'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 创建文件夹表
    await queryInterface.createTable('folders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '文件夹ID，主键'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '文件夹名称'
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '父文件夹ID，顶级文件夹为NULL',
        references: {
          model: 'folders',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      "COMMENT ON TABLE folders IS '文件夹表'"
    );

    // 添加索引
    await queryInterface.addIndex('folders', ['parent_id'], {
      name: 'idx_folders_parent_id'
    });
    await queryInterface.addIndex('folders', ['created_by'], {
      name: 'idx_folders_created_by'
    });
    await queryInterface.addIndex('folders', ['name'], {
      name: 'idx_folders_name'
    });

    // 2. 创建文件表
    await queryInterface.createTable('files', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '文件ID，主键'
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '存储的文件名（UUID+扩展名）'
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '原始文件名'
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '文件MIME类型'
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: '文件大小（字节）'
      },
      path: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Minio中的文件路径'
      },
      bucket: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Minio bucket名称'
      },
      folder_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '所属文件夹ID，NULL表示根目录',
        references: {
          model: 'folders',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '上传者ID',
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
      "COMMENT ON TABLE files IS '文件表'"
    );

    // 添加索引
    await queryInterface.addIndex('files', ['folder_id'], {
      name: 'idx_files_folder_id'
    });
    await queryInterface.addIndex('files', ['uploaded_by'], {
      name: 'idx_files_uploaded_by'
    });
    await queryInterface.addIndex('files', ['original_name'], {
      name: 'idx_files_original_name'
    });
    await queryInterface.addIndex('files', ['mime_type'], {
      name: 'idx_files_mime_type'
    });
    await queryInterface.addIndex('files', ['created_at'], {
      name: 'idx_files_created_at'
    });

    // 3. 创建文件分享表
    await queryInterface.createTable('file_shares', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '分享ID，主键'
      },
      file_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '文件ID',
        references: {
          model: 'files',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      share_code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: '分享码，唯一标识'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '过期时间，NULL表示永不过期'
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
      }
    });

    // 添加表注释
    await queryInterface.sequelize.query(
      "COMMENT ON TABLE file_shares IS '文件分享表'"
    );

    // 添加索引
    await queryInterface.addIndex('file_shares', ['file_id'], {
      name: 'idx_file_shares_file_id'
    });
    await queryInterface.addIndex('file_shares', ['share_code'], {
      name: 'idx_file_shares_share_code'
    });
    await queryInterface.addIndex('file_shares', ['expires_at'], {
      name: 'idx_file_shares_expires_at'
    });
    await queryInterface.addIndex('file_shares', ['created_by'], {
      name: 'idx_file_shares_created_by'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 按照依赖关系的逆序删除表
    await queryInterface.dropTable('file_shares');
    await queryInterface.dropTable('files');
    await queryInterface.dropTable('folders');
  }
};
