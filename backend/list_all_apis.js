const db = require('./src/models');

async function listApis() {
  const apis = await db.ApiInterface.findAll({
    attributes: ['id', 'name', 'path', 'method', 'is_active', 'auth_required'],
    order: [['created_at', 'DESC']]
  });

  console.log(`\n共找到 ${apis.length} 个API接口：\n`);
  console.log('='.repeat(100));

  if (apis.length === 0) {
    console.log('数据库中没有任何API接口');
    console.log('\n请先在前端创建一个API接口：');
    console.log('1. 访问：http://localhost:3000/lowcode/apis');
    console.log('2. 点击"新增接口"');
    console.log('3. 填写路径为：/custom/ceshi');
    console.log('4. 选择数据源和编写SQL');
  } else {
    let num = 1;
    for (const api of apis) {
      console.log(`${num}. ${api.name}`);
      console.log(`   ID: ${api.id}`);
      console.log(`   路径: ${api.path}`);
      console.log(`   方法: ${api.method}`);
      console.log(`   需要认证: ${api.auth_required ? '是' : '否'}`);
      console.log(`   激活: ${api.is_active ? '是' : '否'}`);
      console.log(`   访问地址: http://localhost:3001/api${api.path}`);
      console.log('-'.repeat(100));
      num++;
    }
  }

  process.exit(0);
}

listApis().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});