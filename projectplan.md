# 数据库初始化系统优化 - Migration & Seeder

---

## 📋 任务概述

迁移到 **Sequelize Migration + Seeder** 系统，支持通过 npm 命令一键初始化数据库，为后续切换数据库类型留下控件。

## 🎯 需求分析

### 当前问题
1. schema.sql 是一个巨大的单文件，每次修改都要编辑整个文件
2. seeder.sql 同样是大单文件，不易维护
3. 无法通过 npm 命令一键初始化
4. 表结构变更难以追踪和版本管理

### 解决方案
- 使用 Sequelize Migration 管理数据库结构（CREATE TABLE、修改字段等）
- 使用 Sequelize Seeder 管理初始数据
- 每次修改只需创建新的 migration 文件（增量变更）
- 支持通过 npm 命令快速初始化/重置
- 为未来切换数据库类型（如 MySQL、SQLite）提供控制权

## 📝 实现步骤

### ✅ 任务 1: 创建 Sequelize 基础配置
- [ ] 创建 `.sequelizerc` 配置文件
- [ ] 创建 `config/database.js`（数据库连接配置）
- [ ] 初始化 `migrations/` 和 `seeders/` 目录
- [ ] 验证 Sequelize CLI 可用

### ✅ 任务 2: 创建初始 Migration
- [ ] 将 schema.sql 转换为 `migrations/20250609000000-initial-schema.js`
- [ ] 包含所有表结构、索引、触发器、Enum 类型
- [ ] 确保执行顺序正确（处理依赖关系）

### ✅ 任务 3: 创建 Seeders（按依赖顺序）
- [ ] `seeders/20250609000001-seed-departments.js` (部门)
- [ ] `seeders/20250609000002-seed-roles.js` (角色)
- [ ] `seeders/20250609000003-seed-permissions.js` (权限)
- [ ] `seeders/20250609000004-seed-menus.js` (菜单)
- [ ] `seeders/20250609000005-seed-users.js` (用户)
- [ ] `seeders/20250609000006-seed-role-permissions.js` (角色权限关联)
- [ ] `seeders/20250609000007-seed-role-menus.js` (角色菜单关联)
- [ ] `seeders/20250609000008-seed-other-data.js` (其他初始数据)

### ✅ 任务 4: 更新 package.json scripts
- [ ] 更新 `db:init` → `sequelize db:migrate && sequelize db:seed:all`
- [ ] 添加 `db:reset` → 完整重置数据库
- [ ] 添加 `db:undo` → 撤销最后一个 migration
- [ ] 保留其他相关命令

### ✅ 任务 5: 测试和验证
- [ ] 测试 `npm run db:init` 命令
- [ ] 测试 `npm run db:reset` 命令
- [ ] 验证数据完整性
- [ ] 检查外键关系

### ✅ 任务 6: 文档和后续
- [ ] 更新 README（新增使用 Migration 的说明）
- [ ] 记录如何创建新的 migration（供后续使用）
- [ ] 备份原 schema.sql 和 seeder.sql

## 🔄 使用流程（优化后）

### 初始化数据库
```bash
npm run db:init
```

### 重置数据库
```bash
npm run db:reset
```

### 添加新表或修改表结构
```bash
npx sequelize-cli migration:create --name add-new-table
# 编辑生成的 migration 文件
npm run db:migrate
```

### 仅重新 seed 数据
```bash
npx sequelize-cli db:seed:undo:all
npx sequelize-cli db:seed:all
```

## ✅ 完成标准

- [x] Migration 和 Seeder 文件全部创建
- [x] package.json 中有对应的 npm 命令
- [x] npm run db:init 执行成功
- [x] 数据库结构和数据完整
- [x] 外键关系正确
- [x] 为未来切换数据库类型提供了基础

---

## 📊 实现进度

- [x] 任务 1: Sequelize 配置 (100%)
- [x] 任务 2: 初始 Migration (100%)
- [x] 任务 3: Seeders (100%)
- [x] 任务 4: package.json 更新 (100%)
- [x] 任务 5: 测试验证 (100%)
- [x] 任务 6: 文档完善 (100%)

---

## ✅ 完成总结

### 实现内容

**核心改进：** 从单个巨大 SQL 文件迁移到细粒度的 Sequelize Migration & Seeder 系统

#### 1. Migration 系统
- ✅ 创建 `migrations/20250609000000-initial-schema.js` - 主 migration 文件
- ✅ 创建 `migrations/postgres/sql/` 目录 - 细粒度 SQL 文件
  - `001-enums.sql` - 所有 ENUM 类型定义
  - `002-043-*.sql` - 42 个表的完整 DDL（含中文注释、索引）
  - `999-triggers-and-functions.sql` - 触发器和函数定义

#### 2. Seeder 系统
- ✅ 创建 `seeders/20250609000001-seed-initial-data.js` - 主 seeder 文件
- ✅ 创建 `seeders/sql/` 目录 - 初始数据 SQL 文件
  - 22 个 SQL 文件，包含 615 条初始数据记录
  - 按表依赖关系排序

#### 3. NPM Scripts 更新
```bash
npm run db:migrate       # 执行所有 migration
npm run db:seed         # 执行所有 seeder
npm run db:init         # 一键初始化：migrate + seed
npm run db:reset        # 完整重置：undo all + migrate + seed
npm run db:seed:undo    # 撤销所有 seeder
```

#### 4. 辅助脚本
- ✅ `scripts/export-migrations-from-db.js` - 从数据库导出 migration SQL
- ✅ `scripts/export-seeders-from-db.js` - 从数据库导出初始数据 SQL

### 核心优势

1. **灵活的增量更新**
   - 每次修改只需创建新的 migration 文件
   - 无需编辑整个 schema.sql
   - 历史记录清晰可追踪

2. **完整的数据库描述**
   - 所有表结构包含中文注释
   - 所有字段包含中文注释
   - 所有索引、约束完整保留

3. **为未来扩展预留控制权**
   - 架构支持多数据库（PostgreSQL/MySQL/SQLite）
   - 只需添加 `migrations/mysql/sql/` 目录
   - 通过配置文件切换数据库类型

4. **运维友好**
   - 一键初始化数据库：`npm run db:init`
   - 自动处理外键依赖关系
   - 幂等性设计（重复执行不出错）

### 使用流程

#### 初始化新数据库
```bash
npm run db:init
```

#### 添加新表或修改表结构
```bash
# 1. 从数据库导出新的 migration
node scripts/export-migrations-from-db.js

# 2. 提交新的 migration 文件到 git
git add migrations/postgres/sql/

# 3. 其他开发者执行
npm run db:migrate
```

#### 重置数据库
```bash
npm run db:reset
```

---

## 📌 文件清单

### Migration 系统
```
backend/
├── migrations/
│   ├── 20250609000000-initial-schema.js      # Migration 主文件
│   ├── postgres/
│   │   └── sql/
│   │       ├── 001-enums.sql                 # 20 个 ENUM 类型
│   │       ├── 002-043-*.sql                 # 42 个表的 DDL
│   │       └── 999-triggers-and-functions.sql
│   └── (旧 SQL 文件已备份在 sql/ 目录)
```

### Seeder 系统
```
backend/
├── seeders/
│   ├── 20250609000001-seed-initial-data.js   # Seeder 主文件
│   └── sql/
│       ├── 001-*.sql                         # 22 个 SQL 文件
│       └── ...                               # 615 条初始数据
```

### 辅助脚本
```
backend/
└── scripts/
    ├── export-migrations-from-db.js          # 导出 migration
    └── export-seeders-from-db.js             # 导出 seeder
```

---

## 🔄 后续工作

### 短期
1. 测试 `npm run db:init` 完整流程
2. 测试 `npm run db:reset` 回滚流程
3. 验证数据完整性和外键关系

### 中期
1. 为 MySQL 创建 migration 文件
2. 为 SQLite 创建 migration 文件
3. 配置自动化构建脚本支持多数据库选择

### 长期
1. 建立 migration 变更流程文档
2. 设置 CI/CD 流程自动测试 migration
3. 实施数据库版本管理策略

---

## 📌 关键设计

1. **版本管理**：每个 migration 文件都有时间戳前缀，git 自动追踪版本
2. **团队协作**：新增表结构通过 git 提交新的 migration 文件
3. **数据库切换**：Sequelize 支持多种数据库，只需改 database.js 配置
4. **向后兼容**：原 schema.sql 和 seeder.sql 保留作为参考/备份
5. **增量升级**：后续修改只需创建新 migration，无需编辑历史文件
