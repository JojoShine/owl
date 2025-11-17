const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('scjgdb', 'scjg', 'bnkUfe7vSM', {
  host: '2.88.127.65',
  port: 5432,
  dialect: 'postgres',
  logging: false,
});

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功\n');

    // 查询 business_entity 表结构
    const [businessEntityCols] = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'business_entity'
      ORDER BY ordinal_position;
    `);

    console.log('=== business_entity 表结构 ===');
    console.table(businessEntityCols);

    // 查询 survey_record 表结构
    const [surveyRecordCols] = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'survey_record'
      ORDER BY ordinal_position;
    `);

    console.log('\n=== survey_record 表结构 ===');
    console.table(surveyRecordCols);

    // 查询示例数据
    const [businessEntities] = await sequelize.query(`
      SELECT * FROM business_entity LIMIT 2;
    `);

    console.log('\n=== business_entity 示例数据 ===');
    console.log(JSON.stringify(businessEntities, null, 2));

    const [surveyRecords] = await sequelize.query(`
      SELECT * FROM survey_record LIMIT 2;
    `);

    console.log('\n=== survey_record 示例数据 ===');
    console.log(JSON.stringify(surveyRecords, null, 2));

  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();