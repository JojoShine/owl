const db = require('./src/models');

async function checkApi() {
  try {
    const apis = await db.ApiInterface.findAll({
      attributes: ['id', 'name', 'path', 'method', 'is_active'],
      include: [{
        model: db.Datasource,
        as: 'datasource',
        attributes: ['id', 'name', 'is_active']
      }]
    });
    
    console.log('数据库中的API列表：');
    console.log('='.repeat(80));
    apis.forEach(api => {
      console.log(`ID: ${api.id}`);
      console.log(`名称: ${api.name}`);
      console.log(`路径: ${api.path}`);
      console.log(`方法: ${api.method}`);
      console.log(`激活: ${api.is_active}`);
      console.log(`数据源: ${api.datasource?.name} (激活: ${api.datasource?.is_active})`);
      console.log(`完整访问地址: http://localhost:3001/api${api.path}`);
      console.log('-'.repeat(80));
    });
    
    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error.message);
    process.exit(1);
  }
}

checkApi();
