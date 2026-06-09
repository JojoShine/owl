# 数据库初始化系统使用指南

## 快速开始

### 初始化数据库（开发环境）

```bash
# 一键初始化：创建所有表 + 导入初始数据
npm run db:init
```

这个命令会：
1. 执行所有 migration（创建数据库结构）
2. 执行所有 seeder（导入初始数据）

### 其他常用命令

```bash
# 仅执行 migration（创建表结构）
npm run db:migrate

# 仅执行 seeder（导入数据）
npm run db:seed

# 撤销最后一个 migration
npm run db:migrate:undo

# 撤销所有 seeder（清空数据）
npm run db:seed:undo

# 完整重置：清空一切后重新初始化
npm run db:reset
```

---

## 目录结构

### Migration（数据库结构）

```
migrations/
├── 20250609000000-initial-schema.js          # Sequelize Migration 文件（读取下方 SQL 并执行）
└── postgres/
    └── sql/                                   # PostgreSQL 细粒度 SQL 文件
        ├── 001-enums.sql                     # ENUM 类型定义
        ├── 002-SequelizeMeta.sql             # Sequelize 元表
        ├── 003-005-*.sql                     # 应用系统表
        ├── ...
        └── 999-triggers-and-functions.sql    # 触发器和函数
```

### Seeder（初始数据）

```
seeders/
├── 20250609000001-seed-initial-data.js       # Sequelize Seeder 文件（读取下方 SQL 并执行）
└── sql/                                       # 初始数据 SQL 文件
    ├── 001-departments.sql                   # 部门数据
    ├── 002-roles.sql                         # 角色数据
    ├── 003-permissions.sql                   # 权限数据
    ├── ...
    └── 039-test_excel_import.sql             # 测试数据
```

---

## 修改数据库结构

### 添加新表

#### 方式 1：自动导出（推荐）

```bash
# 1. 在数据库中创建新表
# （可以使用 Sequelize Model 定义或直接 SQL）

# 2. 从数据库导出 migration
node scripts/export-migrations-from-db.js

# 3. 检查生成的 SQL 文件
ls migrations/postgres/sql/

# 4. 提交到 git
git add migrations/postgres/sql/
git commit -m "feat: add new table xxx"

# 5. 其他开发者更新时
npm run db:migrate
```

#### 方式 2：手动创建

```bash
# 1. 创建新的 SQL 文件
touch migrations/postgres/sql/044-new_table.sql

# 2. 编写 CREATE TABLE 语句
cat > migrations/postgres/sql/044-new_table.sql << 'EOF'
CREATE TABLE IF NOT EXISTS new_table (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE new_table IS '新表描述';
COMMENT ON COLUMN new_table.id IS 'ID';
COMMENT ON COLUMN new_table.name IS '名称';
EOF

# 3. 执行 migration
npm run db:migrate

# 4. 提交到 git
git add migrations/postgres/sql/044-new_table.sql
```

### 修改现有表

**重要：** 不要直接修改已存在的 SQL 文件，要创建新的 migration！

```bash
# 1. 创建新的 migration SQL 文件
touch migrations/postgres/sql/044-alter-users-add-phone.sql

# 2. 编写 ALTER TABLE 语句
cat > migrations/postgres/sql/044-alter-users-add-phone.sql << 'EOF'
ALTER TABLE owl_users ADD COLUMN IF NOT EXISTS phone varchar(20);

COMMENT ON COLUMN owl_users.phone IS '电话号码';

CREATE INDEX IF NOT EXISTS idx_owl_users_phone ON owl_users (phone);
EOF

# 3. 执行 migration
npm run db:migrate

# 4. 提交到 git
git add migrations/postgres/sql/044-alter-users-add-phone.sql
```

---

## 导入初始数据

### 添加初始数据

```bash
# 1. 创建新的 seeder SQL 文件
touch seeders/sql/040-new-initial-data.sql

# 2. 编写 INSERT 语句
cat > seeders/sql/040-new-initial-data.sql << 'EOF'
INSERT INTO new_table (id, name, created_at) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Test Data', CURRENT_TIMESTAMP);
EOF

# 3. 执行 seeder
npm run db:seed

# 4. 提交到 git
git add seeders/sql/040-new-initial-data.sql
```

### 更新现有初始数据

```bash
# 方式 1：直接修改 SQL 文件并重新 seed
# 注意：需要先撤销旧数据
npm run db:seed:undo
npm run db:seed

# 方式 2：执行更新语句
# 创建新的 seeder 文件（不修改现有的）
touch seeders/sql/050-update-existing-data.sql
```

---

## 常见问题

### Q: 执行 migration 时出现"表已存在"错误

A: 这是正常的，因为 SQL 文件使用了 `IF NOT EXISTS` 子句。Sequelize 会忽略这个错误，继续执行下一个 SQL 文件。

### Q: 如何完全重置数据库？

```bash
npm run db:reset
```

这会：
1. 撤销所有 seeder（清空数据）
2. 撤销所有 migration（删除表和类型）
3. 重新执行所有 migration（创建表）
4. 重新执行所有 seeder（导入数据）

### Q: 如何只清空数据但保留表结构？

```bash
npm run db:seed:undo
npm run db:seed
```

### Q: 如何跳过某个 seeder？

编辑 `seeders/20250609000001-seed-initial-data.js`，在循环中添加跳过条件。

### Q: migration 执行出错了怎么办？

```bash
# 1. 查看错误信息，修复问题
# 2. 撤销这个 migration
npm run db:migrate:undo
# 3. 修复 SQL 文件
# 4. 重新执行
npm run db:migrate
```

---

## 团队协作建议

### Git 流程

```bash
# 1. 创建新分支
git checkout -b feature/db-new-table

# 2. 添加 migration 和 seeder 文件
# （使用上述导出脚本）

# 3. 提交
git add migrations/postgres/sql/
git add seeders/sql/
git commit -m "feat: add user profile table and initial data"

# 4. 推送
git push origin feature/db-new-table

# 5. 创建 Pull Request

# 6. 其他开发者更新后
git pull
npm run db:migrate
npm run db:seed
```

### 命名规范

- Migration 文件：`NNN-table_name.sql`（NNN 是递增编号）
- Seeder 文件：`NNN-table_name.sql`（NNN 是递增编号）
- 例如：`044-users_profile.sql`、`050-seed-initial-configs.sql`

---

## 高级话题

### 为 MySQL 创建 migration

```bash
# 1. 创建 MySQL 目录
mkdir -p migrations/mysql/sql

# 2. 复制 PostgreSQL SQL 文件
cp migrations/postgres/sql/* migrations/mysql/sql/

# 3. 修改 SQL 语法（PostgreSQL → MySQL）
# - ENUM 类型 → VARCHAR with CHECK
# - uuid → CHAR(36)
# - 时区相关的类型调整

# 4. 修改 migration 主文件支持多数据库
# （需要修改 migrations/20250609000000-initial-schema.js）
```

### 配置自动测试

在 CI/CD 流程中，每次提交时自动：
1. 创建测试数据库
2. 执行 `npm run db:init`
3. 运行数据集成测试
4. 验证数据完整性

---

## 参考资源

- [Sequelize Migration 文档](https://sequelize.org/docs/v6/other-topics/migrations/)
- [PostgreSQL 类型](https://www.postgresql.org/docs/current/datatype.html)
- [数据库版本控制最佳实践](https://www.liquibase.org/get-started/best-practices)
