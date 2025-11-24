const jwt = require('jsonwebtoken');
const db = require('./src/models');

async function testApiAuth() {
  console.log('='.repeat(80));
  console.log('API认证调试');
  console.log('='.repeat(80));
  
  // 1. 检查API配置
  const api = await db.ApiInterface.findOne({
    where: { path: '/ceshi' }
  });
  
  if (api) {
    console.log('\n✅ 找到API接口：');
    console.log(`  名称: ${api.name}`);
    console.log(`  路径: ${api.path}`);
    console.log(`  方法: ${api.method}`);
    console.log(`  需要认证: ${api.auth_required}`);
    console.log(`  激活状态: ${api.is_active}`);
  } else {
    console.log('\n❌ 未找到路径为 /ceshi 的API接口');
    console.log('   数据库中存储的路径应该是: /ceshi');
    console.log('   访问地址应该是: http://localhost:3001/api/custom/ceshi');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('测试步骤：');
  console.log('='.repeat(80));
  console.log('\n1. 确认数据库中API的路径配置');
  console.log('   - 如果存储的是 /ceshi，访问地址是: http://localhost:3001/api/custom/ceshi');
  console.log('   - 如果存储的是 /custom/ceshi，访问地址是: http://localhost:3001/api/custom/ceshi');
  
  console.log('\n2. 如果需要认证，请检查：');
  console.log('   - 请求头格式: Authorization: Bearer YOUR_TOKEN');
  console.log('   - Token是否有效（未过期）');
  console.log('   - 用户状态是否为 active');
  
  console.log('\n3. 测试命令：');
  console.log('\n   不需要认证的API:');
  console.log('   curl http://localhost:3001/api/custom/ceshi?status=active');
  
  console.log('\n   需要认证的API:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('        http://localhost:3001/api/custom/ceshi?status=active');
  
  process.exit(0);
}

testApiAuth().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
