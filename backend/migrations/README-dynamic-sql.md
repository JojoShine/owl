# 动态SQL和字段分组功能 - 使用指南

## 功能概述

本次更新为代码生成器增加了三个主要功能：

1. **动态SQL生成** - 支持用户编写自定义SQL查询，实现多表关联查询
2. **字段分组（信息簇）** - 根据表注释自动分组字段，详情页分区展示
3. **详情页展示模式** - 支持Dialog弹窗和独立Page两种展示方式

## 快速开始

### 1. 执行数据库迁移

```bash
# 连接到PostgreSQL数据库
psql -U your_username -d your_database

# 执行迁移脚本
\i /path/to/backend/migrations/extend-generator-for-dynamic-sql.sql

# 验证迁移结果
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'generated_modules'
  AND column_name IN ('custom_sql', 'sql_parameters', 'detail_display_mode');
```

### 2. 测试后端API

#### 2.1 验证SQL语法

```bash
curl -X POST http://localhost:5000/api/generator/validate-sql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sql": "SELECT id, username, email FROM users WHERE is_active = true"
  }'
```

**预期响应：**
```json
{
  "code": 200,
  "data": {
    "valid": true
  },
  "message": "SQL语法验证通过"
}
```

#### 2.2 预览SQL查询结果

```bash
curl -X POST http://localhost:5000/api/generator/preview-sql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sql": "SELECT u.id, u.username, u.email, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id LIMIT 5",
    "limit": 10
  }'
```

**预期响应：**
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid-1",
      "username": "admin",
      "email": "admin@example.com",
      "department_name": "技术部"
    }
  ],
  "message": "SQL查询预览成功"
}
```

#### 2.3 从SQL生成字段配置

```bash
curl -X POST http://localhost:5000/api/generator/generate-fields-from-sql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sql": "SELECT u.id, u.username, u.email, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id"
  }'
```

**预期响应：**
```json
{
  "code": 200,
  "data": {
    "fields": [
      {
        "fieldName": "id",
        "fieldType": "UUID",
        "fieldComment": "ID",
        "isSearchable": false,
        "showInList": true,
        "showInForm": false,
        "showInDetail": true,
        "listSort": 0,
        "fieldGroup": "用户信息"
      },
      {
        "fieldName": "username",
        "fieldType": "STRING",
        "fieldComment": "用户名",
        "fieldGroup": "用户信息"
      },
      {
        "fieldName": "department_name",
        "fieldType": "STRING",
        "fieldComment": "部门名称",
        "fieldGroup": "部门信息"
      }
    ],
    "availableGroups": [
      {
        "value": "用户信息",
        "label": "用户信息",
        "tableName": "users"
      },
      {
        "value": "部门信息",
        "label": "部门信息",
        "tableName": "departments"
      }
    ]
  },
  "message": "字段配置生成成功"
}
```

### 3. 前端组件使用示例

#### 3.1 SqlEditor 组件

```jsx
import { SqlEditor } from '@/components/generator';

export default function ConfigPage() {
  const [sql, setSql] = useState('');
  const [fields, setFields] = useState([]);

  const handleFieldsGenerated = (generatedFields) => {
    setFields(generatedFields.fields);
    console.log('可用分组:', generatedFields.availableGroups);
  };

  return (
    <SqlEditor
      value={sql}
      onChange={setSql}
      onFieldsGenerated={handleFieldsGenerated}
    />
  );
}
```

#### 3.2 FieldGroupEditor 组件

```jsx
import { FieldGroupEditor } from '@/components/generator';

export default function GroupConfigPage() {
  const fields = [
    { fieldName: 'id', fieldType: 'UUID', fieldComment: 'ID' },
    { fieldName: 'username', fieldType: 'STRING', fieldComment: '用户名' }
  ];

  const availableGroups = [
    { value: '用户信息', label: '用户信息', tableName: 'users' },
    { value: '部门信息', label: '部门信息', tableName: 'departments' }
  ];

  return (
    <FieldGroupEditor
      fields={fields}
      availableGroups={availableGroups}
      onChange={(updatedFields) => {
        console.log('字段分组已更新:', updatedFields);
      }}
    />
  );
}
```

#### 3.3 DynamicDetailPage 组件

```jsx
import { DynamicDetailPage } from '@/components/generator';

export default function DetailPage({ pageConfig, recordId }) {
  return (
    <DynamicDetailPage
      pageConfig={pageConfig}
      recordId={recordId}
      onBack={() => router.back()}
    />
  );
}
```

#### 3.4 动态路由访问

```
# 访问动态详情页
http://localhost:3000/dynamic/users/uuid-123

# 路由格式
/dynamic/[modulePath]/[id]
```

## 完整示例：创建一个多表查询模块

### 步骤1：编写SQL查询

```sql
SELECT
  u.id,
  u.username,
  u.email,
  u.phone,
  u.created_at,
  d.name as department_name,
  d.code as department_code,
  r.name as role_name,
  r.code as role_code
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.is_active = true
```

### 步骤2：生成字段配置

系统会自动：
1. 提取表 `users`, `departments`, `roles` 的注释
2. 将字段按表注释分组：
   - 用户信息组：id, username, email, phone, created_at
   - 部门信息组：department_name, department_code
   - 角色信息组：role_name, role_code

### 步骤3：配置模块

```javascript
const moduleConfig = {
  module_name: 'UserWithDetails',
  module_path: 'user-details',
  description: '用户详细信息',

  // 动态SQL配置
  custom_sql: '上述SQL语句',
  sql_primary_key: 'id',

  // 详情页配置
  detail_display_mode: 'page', // 或 'dialog'
  detail_url_pattern: '/dynamic/user-details/:id',

  // 字段配置（由系统生成）
  fields: [...]
};
```

### 步骤4：访问模块

```
# 列表页（使用动态SQL查询）
GET /api/user-details?page=1&limit=10

# 详情页（Dialog模式）
点击列表中的"查看"按钮，弹出Dialog

# 详情页（Page模式）
访问 /dynamic/user-details/uuid-123
```

## 数据结构说明

### GeneratedModule 新增字段

| 字段 | 类型 | 说明 |
|------|------|------|
| custom_sql | TEXT | 自定义SQL查询语句 |
| sql_parameters | JSONB | SQL参数配置（参数化查询） |
| sql_primary_key | VARCHAR(50) | 主键字段名，默认'id' |
| detail_display_mode | VARCHAR(20) | 详情展示模式：dialog/page |
| detail_url_pattern | VARCHAR(200) | 详情页URL模式 |

### GeneratedField 新增字段

| 字段 | 类型 | 说明 |
|------|------|------|
| field_group | VARCHAR(50) | 字段所属分组 |
| show_in_detail | BOOLEAN | 是否在详情页显示 |
| detail_sort | INTEGER | 详情页显示顺序 |
| detail_label | VARCHAR(100) | 详情页显示标签 |
| detail_component | VARCHAR(50) | 详情页显示组件类型 |

## 安全注意事项

### SQL注入防护

系统实施多层安全检查：

1. **白名单验证** - 只允许 SELECT 语句
2. **黑名单过滤** - 禁止 DROP, DELETE, UPDATE 等危险关键词
3. **多语句检测** - 不允许执行多条SQL语句
4. **注释过滤** - 禁止 `--` 和 `/**/` 注释符号
5. **EXPLAIN预检查** - 执行前先用EXPLAIN验证语法
6. **超时限制** - 查询超时时间10秒

### 示例：被拒绝的SQL

```sql
-- ❌ 不允许：包含DELETE
SELECT * FROM users; DELETE FROM users;

-- ❌ 不允许：包含注释
SELECT * FROM users -- WHERE id = 1

-- ❌ 不允许：UPDATE语句
UPDATE users SET username = 'hacker'

-- ✅ 允许：标准SELECT查询
SELECT u.*, d.name FROM users u LEFT JOIN departments d ON u.department_id = d.id
```

## 故障排查

### 问题1：SQL验证失败

**症状：** API返回 "SQL语法错误"

**解决方案：**
1. 检查SQL语法是否正确
2. 确保只使用SELECT语句
3. 移除SQL中的注释符号
4. 检查表名和字段名是否存在

### 问题2：字段分组显示为"default"

**症状：** 所有字段都在"default"分组

**原因：** 数据库表没有设置comment

**解决方案：**
```sql
-- 为表添加注释
COMMENT ON TABLE users IS '用户信息';
COMMENT ON TABLE departments IS '部门信息';

-- 重新生成字段配置
```

### 问题3：详情页无法访问

**症状：** 访问 `/dynamic/[modulePath]/[id]` 返回404

**解决方案：**
1. 确认模块配置的 `detail_display_mode` 设置为 'page'
2. 检查 `detail_url_pattern` 配置是否正确
3. 确认路由文件已创建

## 性能优化建议

1. **添加索引** - 为JOIN字段和WHERE条件字段添加索引
2. **限制返回字段** - 只SELECT需要的字段
3. **使用EXPLAIN分析** - 检查查询计划，优化慢查询
4. **缓存配置** - 将pageConfig缓存到Redis
5. **分页查询** - 始终使用分页，避免全表扫描

```sql
-- 优化示例
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_active ON users(is_active);
```

## 更新日志

### v1.0.0 (2025-11-17)

**新增功能：**
- ✅ 动态SQL查询支持
- ✅ 字段分组（信息簇）配置
- ✅ 详情页展示模式选择
- ✅ SQL编辑器组件
- ✅ 字段分组编辑器组件
- ✅ 动态详情页组件

**安全改进：**
- ✅ SQL注入防护
- ✅ 多层安全验证
- ✅ 查询超时控制

**性能优化：**
- ✅ 自动LIMIT限制
- ✅ 参数化查询支持
