const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('scjgdb', 'scjg', 'bnkUfe7vSM', {
  host: '2.88.127.65',
  dialect: 'postgres',
  logging: false,
});

async function checkTable() {
  try {
    // 查询表结构
    const [columns] = await sequelize.query(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'unlicensed_business'
      ORDER BY ordinal_position;
    `);

    console.log('=== unlicensed_business 表结构 ===\n');
    console.log(columns);

    // 查询示例数据
    const [data] = await sequelize.query(`
      SELECT * FROM unlicensed_business LIMIT 3;
    `);

    console.log('\n=== 示例数据 ===\n');
    console.log(data);

    await sequelize.close();
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

checkTable();
