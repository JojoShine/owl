# 低代码（Lowcode）模块删除计划

**生成时间**: 2025-11-24  
**目标**: 完全清理低代码相关模块和文件  
**预期影响范围**: 51+ 个文件

---

## 删除清单

### 1. 前端页面文件 (6个)
- [ ] `/frontend/app/(authenticated)/lowcode/datasources/page.js`
- [ ] `/frontend/app/(authenticated)/lowcode/apis/page.js`
- [ ] `/frontend/app/(authenticated)/lowcode/apis/edit/page.js`
- [ ] `/frontend/app/(authenticated)/lowcode/page-configs/page.js`
- [ ] `/frontend/app/(authenticated)/lowcode/page-configs/edit/page.js`
- [ ] `/frontend/app/(authenticated)/lowcode/page-designer/page.js`
- [ ] `/frontend/app/(authenticated)/lowcode/` (整个目录)
- [ ] `/frontend/app/(authenticated)/dynamic/` (整个目录)

### 2. 前端组件文件 (22个)
#### page-designer 组件 (16个)
- [ ] `/frontend/components/page-designer/PageContext.js`
- [ ] `/frontend/components/page-designer/components/index.js`
- [ ] `/frontend/components/page-designer/components/ApiSelector.js`
- [ ] `/frontend/components/page-designer/components/ApiFieldMapper.js`
- [ ] `/frontend/components/page-designer/components/Text.js`
- [ ] `/frontend/components/page-designer/components/Card.js`
- [ ] `/frontend/components/page-designer/components/Container.js`
- [ ] `/frontend/components/page-designer/components/Divider.js`
- [ ] `/frontend/components/page-designer/components/Form.js`
- [ ] `/frontend/components/page-designer/components/Image.js`
- [ ] `/frontend/components/page-designer/components/Tree.js`
- [ ] `/frontend/components/page-designer/components/Button.js`
- [ ] `/frontend/components/page-designer/components/Table.js`
- [ ] `/frontend/components/page-designer/components/Chart.js`
- [ ] `/frontend/components/page-designer/components/SearchableTable.js`
- [ ] `/frontend/components/page-designer/` (整个目录)

#### lowcode 组件 (1个)
- [ ] `/frontend/components/lowcode/datasource-form-dialog.jsx`
- [ ] `/frontend/components/lowcode/` (整个目录)

#### dynamic-module 组件 (5个)
- [ ] `/frontend/components/dynamic-module/index.js`
- [ ] `/frontend/components/dynamic-module/DynamicCrudPage.jsx`
- [ ] `/frontend/components/dynamic-module/DynamicFilters.jsx`
- [ ] `/frontend/components/dynamic-module/DynamicForm.jsx`
- [ ] `/frontend/components/dynamic-module/DynamicTable.jsx`
- [ ] `/frontend/components/dynamic-module/SortableTable.jsx`
- [ ] `/frontend/components/dynamic-module/` (整个目录)

### 3. 前端API库修改 (1个修改)
- [ ] `/frontend/lib/api.js` - 删除以下部分:
  - `datasourceApi` 对象 (lines 534-555)
  - `apiInterfaceApi` 对象 (lines 557-588)
  - `pageConfigApi` 对象 (lines 590-609)
  - 导出对象中的引用 (lines 634, 636)

### 4. 后端模块目录 (3个)
- [ ] `/backend/src/modules/api-interface/` (整个目录，包含4个文件)
  - api-interface.controller.js
  - api-interface.routes.js
  - api-interface.service.js
  - api-interface.validation.js
- [ ] `/backend/src/modules/datasource/` (整个目录，包含4个文件)
  - datasource.controller.js
  - datasource.routes.js
  - datasource.service.js
  - datasource.validation.js
- [ ] `/backend/src/modules/page-config/` (整个目录，包含3个文件)
  - page-config.controller.js
  - page-config.routes.js
  - page-config.service.js

### 5. 后端路由文件 (1个修改)
- [ ] `/backend/src/routes/custom-api.routes.js` (删除整个文件)
- [ ] `/backend/src/routes/index.js` - 删除以下行:
  - line 19: `const datasourceRoutes = require('../modules/datasource/datasource.routes');`
  - line 20: `const apiInterfaceRoutes = require('../modules/api-interface/api-interface.routes');`
  - line 71: `router.use('/datasources', datasourceRoutes);`
  - line 72: `router.use('/api-interfaces', apiInterfaceRoutes);`
  - line 73: `const pageConfigRoutes = require('../modules/page-config/page-config.routes');`
  - line 74: `router.use('/page-configs', pageConfigRoutes);`
  - line 77: `router.use('/custom', customApiRoutes);`
  - line 21: `const customApiRoutes = require('./custom-api.routes');`

### 6. 后端模型文件 (4个)
- [ ] `/backend/src/models/ApiInterface.js`
- [ ] `/backend/src/models/Datasource.js`
- [ ] `/backend/src/models/PageConfig.js`
- [ ] `/backend/src/models/ApiCallLog.js`

### 7. 后端模型注册 (1个修改)
- [ ] `/backend/src/models/index.js` - 删除以下行:
  - line 52: `db.Datasource = require('./Datasource')(sequelize, Sequelize.DataTypes);`
  - line 53: `db.ApiInterface = require('./ApiInterface')(sequelize, Sequelize.DataTypes);`
  - line 54: `db.ApiCallLog = require('./ApiCallLog')(sequelize, Sequelize.DataTypes);`
  - line 55: `db.PageConfig = require('./PageConfig')(sequelize, Sequelize.DataTypes);`

### 8. 数据库Schema文件 (1个)
- [ ] `/backend/sql/lowcode-platform-schema.sql` (删除整个文件)

### 9. 数据库初始化数据修改 (1个修改)
- [ ] `/backend/sql/init-data.sql` - 删除以下部分:
  - lines 413-435: 低代码平台权限配置
  - lines 438-456: 低代码管理菜单配置
  - lines 460-494: 低代码权限角色绑定
  - lines 497-519: 低代码菜单角色绑定

### 10. 数据库迁移文件 (2个)
- [ ] `/backend/migrations/20251020143651-add-page-config-to-generated-modules.js`
- [ ] `/backend/migrations/20251118000000-add-api-interface-new-fields.js`
- [ ] `/backend/migrations/lowcode-menu-structure.sql`

### 11. 与代码生成器的集成修改 (3个文件修改)
- [ ] `/backend/src/modules/generator/generator.controller.js` - 删除以下内容:
  - 行 "GET /api/generator/page-config/:modulePath" 的路由处理
  - 行 "GET /api/generator/configs/:id/page-config" 的路由处理
  - 行 "PUT /api/generator/configs/:id/page-config" 的路由处理
  - 相关的控制器方法实现

- [ ] `/backend/src/modules/generator/generator.routes.js` - 删除:
  - '/page-config/:modulePath' 路由
  - '/configs/:id/page-config' 相关路由

- [ ] `/backend/src/modules/generator/code-generator.service.js` - 删除:
  - page_config 相关的生成代码
  - page_config 的处理逻辑

- [ ] `/backend/src/modules/generator/module-config.service.js` - 删除:
  - page_config 相关的处理方法

### 12. 辅助文件和脚本 (6个)
- [ ] `/backend/check_api.js`
- [ ] `/backend/get_valid_token.js`
- [ ] `/backend/list_all_apis.js`
- [ ] `/backend/test_api_auth.js`
- [ ] `/backend/migrations/test-dynamic-sql.sh`
- [ ] `/backend/migrations/extend-generator-for-dynamic-sql.sql`

### 13. 文档文件 (3个)
- [ ] `/backend/migrations/README-dynamic-sql.md`
- [ ] `LOWCODE_MODULES_EXPLORATION.md` (本文件 - 最后删除)
- [ ] `LOWCODE_DELETION_PLAN.md` (本文件 - 最后删除)

---

## 代码修改检查清单

### 需要修改的文件
1. **`/backend/src/routes/index.js`** - 删除6行 (导入和路由注册)
2. **`/backend/src/models/index.js`** - 删除4行 (模型注册)
3. **`/backend/sql/init-data.sql`** - 删除约80行 (权限、菜单、角色绑定数据)
4. **`/frontend/lib/api.js`** - 删除约80行 (API定义)
5. **`/backend/src/modules/generator/generator.controller.js`** - 删除相关路由处理
6. **`/backend/src/modules/generator/generator.routes.js`** - 删除路由定义
7. **`/backend/src/modules/generator/code-generator.service.js`** - 删除page_config生成
8. **`/backend/src/modules/generator/module-config.service.js`** - 删除相关方法

---

## 部署前检查清单

删除完成后需要执行以下步骤：

### 数据库迁移
- [ ] 创建新的迁移文件以移除相关表和列
- [ ] 运行迁移: `npm run db:migrate`
- [ ] 验证数据库结构

### 代码验证
- [ ] 编译后端代码检查错误: `npm run build`
- [ ] 编译前端代码检查错误: `npm run build` (in frontend)
- [ ] 运行单元测试: `npm test`
- [ ] 运行集成测试

### 环境测试
- [ ] 启动后端服务: `npm start`
- [ ] 启动前端服务: `npm run dev`
- [ ] 验证应用正常运行
- [ ] 验证菜单中没有低代码选项
- [ ] 验证没有404错误

### Git操作
- [ ] 确认所有修改已保存
- [ ] 创建新的branch: `git checkout -b remove-lowcode-modules`
- [ ] 提交所有更改: `git add -A && git commit -m "删除低代码模块"`
- [ ] 推送到远程: `git push origin remove-lowcode-modules`
- [ ] 创建Pull Request进行代码审查

---

## 执行顺序建议

为了确保安全和完整性，建议按以下顺序执行删除：

1. **第一阶段：备份和计划**
   - [ ] 备份完整代码库
   - [ ] 备份数据库
   - [ ] 创建feature branch

2. **第二阶段：删除前端文件**
   - [ ] 删除前端目录和页面
   - [ ] 删除前端组件
   - [ ] 修改前端API库
   - [ ] 测试前端编译

3. **第三阶段：删除后端模块**
   - [ ] 删除后端模块目录
   - [ ] 删除后端模型文件
   - [ ] 修改路由文件
   - [ ] 修改模型注册文件
   - [ ] 测试后端编译

4. **第四阶段：修改生成器集成**
   - [ ] 删除生成器中的page_config相关代码
   - [ ] 验证代码生成正常

5. **第五阶段：处理数据库**
   - [ ] 删除SQL Schema文件
   - [ ] 修改初始化数据文件
   - [ ] 创建迁移文件用于删除表
   - [ ] 运行迁移

6. **第六阶段：清理辅助文件**
   - [ ] 删除测试脚本
   - [ ] 删除文档文件

7. **第七阶段：验证和提交**
   - [ ] 全面测试应用功能
   - [ ] 运行自动化测试
   - [ ] 代码审查
   - [ ] 提交和合并

---

## 文件总计

```
前端目录/文件要删除:    35+个
后端目录/文件要删除:    20+个
数据库文件要删除:       4个
需要修改的文件:         8个
辅助文件要删除:         6个
文档文件要删除:         2个
---
总计:                   51+个文件或修改
```

---

## 风险评估

### 低风险
- 删除前端lowcode相关页面 (孤立功能)
- 删除前端页面设计器组件 (孤立功能)

### 中等风险
- 删除后端模块 (需要修改路由)
- 删除初始化权限数据 (需要数据库迁移)

### 高风险
- 删除生成器集成 (影响代码生成流程)
- 删除数据库表 (不可恢复 - 需要备份)

**建议**: 先在开发环境完整测试，然后在测试环境验证，最后才在生产环境执行。

---

## 回滚计划

如果需要回滚，可以使用：

```bash
# 使用git恢复所有更改
git reset --hard HEAD~1

# 或恢复特定文件
git checkout HEAD -- <file>

# 恢复数据库（从备份）
psql -d owl_platform < backup.sql
```

---

**计划制定时间**: 2025-11-24  
**预计执行时间**: 2-4 小时（包含测试）  
**所需人员**: 1名开发人员，1名QA测试人员  
**备份状态**: 重要 - 必须在开始前创建完整备份
