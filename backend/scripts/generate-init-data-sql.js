/**
 * 生成初始化数据 SQL 文件
 * 基于 data-export.json 生成纯 SQL INSERT 语句
 */

const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

// Simple UUID generator
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// SQL 转义
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// JSON 转义
function escapeJson(obj) {
  if (obj === null || obj === undefined) return 'NULL';
  return escapeSql(JSON.stringify(obj));
}

async function generateSql() {
  console.log('🚀 开始生成初始化数据 SQL 文件...\n');

  try {
    // 读取导出的数据
    const dataPath = path.join(__dirname, '../data-export.json');
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

    // 读取完整的部门和菜单数据
    const completeDataPath = path.join(__dirname, '../complete-data-export.json');
    const completeData = JSON.parse(await fs.readFile(completeDataPath, 'utf-8'));

    const now = new Date().toISOString();

    // 生成 SQL
    let sql = `-- ==========================================
-- Owl 管理系统 - 初始化数据脚本
-- ==========================================
-- 生成时间: ${now}
-- 数据来源: 开发环境导出
-- 说明: 包含所有权限、菜单、角色、部门、邮件模板和测试账号
-- ==========================================

-- 1. 清空现有数据 (按外键依赖反序删除)
DELETE FROM user_roles;
DELETE FROM role_menus;
DELETE FROM role_permissions;
DELETE FROM users;
DELETE FROM email_templates;
DELETE FROM departments;
DELETE FROM menus;
DELETE FROM roles;
DELETE FROM permissions;

-- ==========================================
-- 2. 插入权限 (${data.permissions.length} 条)
-- ==========================================

`;

    // 生成权限数据
    const permissionIds = {};
    data.permissions.forEach(p => {
      const id = uuidv4();
      permissionIds[p.code] = id;
      sql += `INSERT INTO permissions (id, code, name, resource, action, category, description, created_at, updated_at) VALUES\n`;
      sql += `  ('${id}', ${escapeSql(p.code)}, ${escapeSql(p.name)}, ${escapeSql(p.resource)}, ${escapeSql(p.action)}, ${escapeSql(p.category)}, ${escapeSql(p.description)}, '${now}', '${now}');\n`;
    });

    sql += `\n-- ==========================================
-- 3. 插入角色 (${data.roles.length} 条)
-- ==========================================

`;

    // 生成角色数据
    const roleIds = {
      'super_admin': uuidv4(),
      'admin': uuidv4(),
      'user': uuidv4()
    };

    data.roles.forEach(r => {
      const id = roleIds[r.code];
      sql += `INSERT INTO roles (id, code, name, description, status, sort, created_at, updated_at) VALUES\n`;
      sql += `  ('${id}', ${escapeSql(r.code)}, ${escapeSql(r.name)}, ${escapeSql(r.description)}, ${escapeSql(r.status)}, ${r.sort}, '${now}', '${now}');\n`;
    });

    sql += `\n-- ==========================================
-- 4. 插入菜单 (${completeData.menus.length} 条)
-- ==========================================

`;

    // 使用实际的菜单数据
    const menus = completeData.menus.map(m => ({
      ...m,
      id: uuidv4()  // 生成新的ID
    }));

    // 创建ID映射
    const menuIdMap = {};
    completeData.menus.forEach((oldMenu, index) => {
      menuIdMap[oldMenu.id] = menus[index].id;
    });

    // 更新parent_id引用
    menus.forEach(m => {
      if (m.parent_id && menuIdMap[m.parent_id]) {
        m.parent_id = menuIdMap[m.parent_id];
      }
    });

    menus.forEach(m => {
      sql += `INSERT INTO menus (id, parent_id, name, path, component, icon, type, visible, sort, status, permission_code, created_at, updated_at) VALUES\n`;
      sql += `  ('${m.id}', ${m.parent_id ? `'${m.parent_id}'` : 'NULL'}, ${escapeSql(m.name)}, ${m.path ? escapeSql(m.path) : 'NULL'}, ${m.component ? escapeSql(m.component) : 'NULL'}, ${escapeSql(m.icon)}, ${escapeSql(m.type)}, ${m.visible}, ${m.sort}, ${escapeSql(m.status)}, ${m.permission_code ? escapeSql(m.permission_code) : 'NULL'}, '${now}', '${now}');\n`;
    });

    sql += `\n-- ==========================================
-- 5. 插入角色-权限关联
-- ==========================================

`;

    // super_admin 拥有所有权限
    data.permissions.forEach(p => {
      sql += `INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('${uuidv4()}', '${roleIds.super_admin}', '${permissionIds[p.code]}', '${now}');\n`;
    });

    // admin 拥有除 permission 管理外的所有权限
    data.permissions.filter(p => !p.code.startsWith('permission:')).forEach(p => {
      sql += `INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('${uuidv4()}', '${roleIds.admin}', '${permissionIds[p.code]}', '${now}');\n`;
    });

    // user 只有查看和部分管理权限
    const userPermissions = ['user:read', 'role:read', 'permission:read', 'menu:read', 'department:read', 'monitor:read', 'monitor:manage', 'notification:read', 'notification:manage', 'email_template:read', 'email_template:create', 'email_template:update', 'email_template:delete', 'email:send'];
    userPermissions.forEach(code => {
      if (permissionIds[code]) {
        sql += `INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES ('${uuidv4()}', '${roleIds.user}', '${permissionIds[code]}', '${now}');\n`;
      }
    });

    sql += `\n-- ==========================================
-- 6. 插入角色-菜单关联
-- ==========================================

`;

    // 所有角色都能看到所有菜单
    ['super_admin', 'admin', 'user'].forEach(roleCode => {
      menus.forEach(menu => {
        sql += `INSERT INTO role_menus (id, role_id, menu_id, created_at) VALUES ('${uuidv4()}', '${roleIds[roleCode]}', '${menu.id}', '${now}');\n`;
      });
    });

    sql += `\n-- ==========================================
-- 7. 插入部门 (${completeData.departments.length} 条)
-- ==========================================

`;

    // 使用实际的部门数据
    const departments = completeData.departments.map(d => ({
      ...d,
      id: uuidv4(),
      leader_id: null  // 先设为null，稍后更新
    }));

    // 创建ID映射
    const deptIdMap = {};
    completeData.departments.forEach((oldDept, index) => {
      deptIdMap[oldDept.code] = departments[index].id;
    });

    // 更新parent_id引用
    departments.forEach(d => {
      if (d.parent_id) {
        // 找到父部门的code
        const parentDept = completeData.departments.find(pd => pd.id === d.parent_id);
        if (parentDept) {
          d.parent_id = deptIdMap[parentDept.code];
        }
      }
    });

    const techDeptId = deptIdMap['TECH'];
    const marketDeptId = deptIdMap['MARKET'];

    departments.forEach(d => {
      sql += `INSERT INTO departments (id, parent_id, name, code, leader_id, description, sort, status, created_at, updated_at) VALUES\n`;
      sql += `  ('${d.id}', ${d.parent_id ? `'${d.parent_id}'` : 'NULL'}, ${escapeSql(d.name)}, ${escapeSql(d.code)}, NULL, ${escapeSql(d.description)}, ${d.sort}, ${escapeSql(d.status)}, '${now}', '${now}');\n`;
    });

    sql += `\n-- ==========================================
-- 8. 插入测试用户 (3 个)
-- ==========================================

`;

    const superAdminUserId = uuidv4();
    const adminUserId = uuidv4();
    const normalUserId = uuidv4();

    const adminPassword = await bcrypt.hash('admin123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    sql += `INSERT INTO users (id, username, email, password, real_name, phone, department_id, status, created_at, updated_at) VALUES\n`;
    sql += `  ('${superAdminUserId}', 'admin', 'admin@example.com', ${escapeSql(adminPassword)}, '超级管理员', '13800138000', '${techDeptId}', 'active', '${now}', '${now}'),\n`;
    sql += `  ('${adminUserId}', 'manager', 'manager@example.com', ${escapeSql(managerPassword)}, '管理员', '13800138001', '${techDeptId}', 'active', '${now}', '${now}'),\n`;
    sql += `  ('${normalUserId}', 'user', 'user@example.com', ${escapeSql(userPassword)}, '普通用户', '13800138002', '${marketDeptId}', 'active', '${now}', '${now}');\n`;

    // 更新部门负责人
    sql += `\n-- 更新部门负责人\n`;
    sql += `UPDATE departments SET leader_id = '${superAdminUserId}' WHERE id = '${techDeptId}';\n`;

    sql += `\n-- ==========================================
-- 9. 插入用户-角色关联
-- ==========================================

`;

    sql += `INSERT INTO user_roles (id, user_id, role_id, created_at) VALUES\n`;
    sql += `  ('${uuidv4()}', '${superAdminUserId}', '${roleIds.super_admin}', '${now}'),\n`;
    sql += `  ('${uuidv4()}', '${adminUserId}', '${roleIds.admin}', '${now}'),\n`;
    sql += `  ('${uuidv4()}', '${normalUserId}', '${roleIds.user}', '${now}');\n`;

    sql += `\n-- ==========================================
-- 10. 插入邮件模板 (${data.emailTemplates.length} 条)
-- ==========================================

`;

    data.emailTemplates.forEach(t => {
      sql += `INSERT INTO email_templates (id, name, subject, content, template_type, variables, variable_schema, tags, description, created_at, updated_at) VALUES\n`;
      sql += `  ('${uuidv4()}', ${escapeSql(t.name)}, ${escapeSql(t.subject)}, ${escapeSql(t.content)}, ${escapeSql(t.template_type)}, ${t.variables ? escapeJson(t.variables) : 'NULL'}, ${escapeJson(t.variable_schema)}, ${escapeJson(t.tags)}, ${escapeSql(t.description)}, '${now}', '${now}');\n`;
    });

    sql += `\n-- ==========================================
-- 完成
-- ==========================================

`;

    // 保存 SQL 文件
    const outputPath = path.join(__dirname, '../init-data.sql');
    await fs.writeFile(outputPath, sql, 'utf-8');

    console.log(`✅ SQL 文件已生成: ${outputPath}\n`);
    console.log('📊 包含数据:');
    console.log(`   - 权限: ${data.permissions.length} 条`);
    console.log(`   - 菜单: 17 条`);
    console.log(`   - 角色: ${data.roles.length} 条`);
    console.log(`   - 部门: ${data.departments.length} 条`);
    console.log(`   - 邮件模板: ${data.emailTemplates.length} 条`);
    console.log('   - 测试账号: 3 个');
    console.log('');
    console.log('📝 测试账号:');
    console.log('   超级管理员 - 用户名: admin, 密码: admin123');
    console.log('   管理员     - 用户名: manager, 密码: manager123');
    console.log('   普通用户   - 用户名: user, 密码: user123');
    console.log('');
    console.log('🎉 生成完成!\n');

  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

// 执行生成
generateSql();
