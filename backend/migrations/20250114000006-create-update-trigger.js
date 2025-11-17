'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建更新时间触发器函数
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // 为users表创建触发器
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // 为roles表创建触发器
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_roles_updated_at
      BEFORE UPDATE ON roles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // 为permissions表创建触发器
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_permissions_updated_at
      BEFORE UPDATE ON permissions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // 为menus表创建触发器
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_menus_updated_at
      BEFORE UPDATE ON menus
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // 删除触发器
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_roles_updated_at ON roles');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_menus_updated_at ON menus');

    // 删除函数
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_updated_at_column()');
  }
};
