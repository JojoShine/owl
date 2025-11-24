const jwt = require('jsonwebtoken');
const db = require('./src/models');

async function getValidToken() {
  try {
    // 获取第一个激活的用户
    const user = await db.User.findOne({
      where: { status: 'active' },
      attributes: ['id', 'username', 'real_name', 'email']
    });
    
    if (!user) {
      console.log('❌ 数据库中没有激活的用户');
      process.exit(1);
    }
    
    // 生成token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ 生成测试token成功！\n');
    console.log('用户信息：');
    console.log(`  ID: ${user.id}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  姓名: ${user.real_name}`);
    console.log(`  邮箱: ${user.email}`);
    console.log('\n测试Token（有效期24小时）：');
    console.log(token);
    console.log('\n完整的cURL命令：');
    console.log(`curl -H "Authorization: Bearer ${token}" \\`);
    console.log('     "http://localhost:3001/api/custom/ceshi?status=active"');
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

getValidToken();
