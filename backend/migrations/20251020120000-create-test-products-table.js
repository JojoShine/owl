'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建测试商品表
    await queryInterface.createTable('test_products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        comment: '商品ID，主键'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '商品名称'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '商品描述'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: '商品价格'
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '库存数量'
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '商品分类'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        comment: '商品状态: active/inactive/discontinued'
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
      "COMMENT ON TABLE test_products IS '测试商品表 - 用于测试代码生成器'"
    );

    // 添加索引
    await queryInterface.addIndex('test_products', ['name'], {
      name: 'idx_test_products_name'
    });
    await queryInterface.addIndex('test_products', ['category'], {
      name: 'idx_test_products_category'
    });
    await queryInterface.addIndex('test_products', ['status'], {
      name: 'idx_test_products_status'
    });

    // 插入测试数据
    await queryInterface.bulkInsert('test_products', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'iPhone 15 Pro',
        description: '苹果最新款智能手机，配备A17 Pro芯片',
        price: 8999.00,
        stock: 50,
        category: '手机',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'MacBook Pro 16',
        description: '高性能笔记本电脑，适合专业人士',
        price: 19999.00,
        stock: 30,
        category: '电脑',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'AirPods Pro 2',
        description: '主动降噪无线耳机',
        price: 1899.00,
        stock: 100,
        category: '配件',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'iPad Air',
        description: '轻薄平板电脑，支持Apple Pencil',
        price: 4799.00,
        stock: 60,
        category: '平板',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Apple Watch Series 9',
        description: '智能手表，健康监测功能强大',
        price: 3199.00,
        stock: 80,
        category: '手表',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Magic Keyboard',
        description: 'iPad专用键盘保护套',
        price: 2399.00,
        stock: 45,
        category: '配件',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'HomePod mini',
        description: '智能音箱，支持Siri语音控制',
        price: 749.00,
        stock: 120,
        category: '音箱',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'iPhone 13',
        description: '经典款iPhone，性价比高',
        price: 4999.00,
        stock: 20,
        category: '手机',
        status: 'discontinued',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log('测试商品表创建成功，已插入 8 条测试数据');
  },

  down: async (queryInterface, Sequelize) => {
    // 删除测试表
    await queryInterface.dropTable('test_products');
  }
};
