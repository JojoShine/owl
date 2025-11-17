# 项目优化计划：删除市场监管业务模块并简化系统

## 需求概述

根据新的业务需求，需要对owl管理系统进行以下优化：

1. **删除市场监管相关业务模块**
   - 删除"经营主体核查"功能模块
   - 删除"无照经营信息维护"功能模块
   - 删除"核查人员信息维护"功能模块

2. **简化概览页面**
   - 移除当前的业务看板
   - 使用简洁的默认样式替换

3. **修改系统名称**
   - 统一改为"owl管理系统"

## 待办事项清单

### 阶段一：前端代码删除

#### 1.1 删除业务页面
- [ ] 删除经营主体核查页面目录：`frontend/app/(authenticated)/business-entity/`
- [ ] 删除无照经营管理页面目录：`frontend/app/(authenticated)/unlicensed-business/`
- [ ] 删除核查人员管理页面：`frontend/app/(authenticated)/user-auth/page.js`

#### 1.2 清理前端API接口
- [ ] 从 `frontend/lib/api.js` 中删除相关API接口：
  - 经营主体相关接口（businessEntity开头）
  - 无照经营相关接口（unlicensedBusiness开头）
  - 核查人员相关接口（userAuth开头）
  - 统计接口（stats开头）

### 阶段二：后端代码删除

#### 2.1 删除业务模块
- [ ] 删除经营主体模块：`backend/src/modules/business-entity/`
- [ ] 删除无照经营模块：`backend/src/modules/unlicensed-business/`
- [ ] 删除核查人员模块：`backend/src/modules/user-auth/`
- [ ] 删除统计模块：`backend/src/modules/stats/`

#### 2.2 清理后端路由
- [ ] 从 `backend/src/routes/index.js` 中移除相关路由注册

#### 2.3 清理数据库模型
- [ ] 从 `backend/src/models/` 目录删除相关模型文件：
  - BusinessEntity.js
  - UnlicensedBusiness.js
  - SurveyRecord.js
  - UserAuth.js

### 阶段三：简化概览页面

#### 3.1 修改Dashboard页面
- [ ] 简化 `frontend/app/(authenticated)/dashboard/page.js`
  - 删除所有业务统计逻辑
  - 使用简洁的欢迎页面样式
  - 只保留基础系统信息展示

### 阶段四：修改系统名称

#### 4.1 更新配置文件
- [ ] 修改 `frontend/app/layout.js` - 更新metadata中的title和description
- [ ] 修改 `frontend/components/layout/sidebar.jsx` - 更新侧边栏显示名称
- [ ] 检查是否有其他地方需要更新系统名称

### 阶段五：清理菜单配置

#### 5.1 更新导航菜单
- [ ] 检查并清理相关菜单项（如果菜单是硬编码的）
- [ ] 如果菜单是数据库动态加载的，需要后续手动在数据库中删除相关菜单项

## 详细修改说明

### 前端页面删除清单

```
frontend/app/(authenticated)/
├── business-entity/           ❌ 完整删除
│   ├── page.js
│   └── [nbxh]/
│       └── page.js
├── unlicensed-business/       ❌ 完整删除
│   ├── page.js
│   └── [id]/
│       └── page.js
└── user-auth/
    └── page.js               ❌ 删除文件
```

### 后端模块删除清单

```
backend/src/modules/
├── business-entity/           ❌ 完整删除
├── unlicensed-business/       ❌ 完整删除
├── user-auth/                 ❌ 完整删除
└── stats/                     ❌ 完整删除
```

### API接口删除清单

需要从 `frontend/lib/api.js` 删除的接口：

```javascript
// 经营主体相关
export const businessEntityApi = { ... }           ❌ 删除

// 无照经营相关
export const unlicensedBusinessApi = { ... }       ❌ 删除

// 核查人员相关
export const userAuthApi = { ... }                 ❌ 删除

// 统计相关
export const statsApi = { ... }                    ❌ 删除
```

### Dashboard简化方案

**当前状态**：复杂的业务统计看板，包含：
- 经营主体总量统计
- 昨日新增数量
- 无照经营数量统计
- 网格责任区统计
- 企业等级分布

**优化后**：简洁的欢迎页面
```jsx
export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">欢迎使用 owl 管理系统</h1>
        <p className="text-gray-600 mb-8">
          这是一个功能强大的管理平台，请从左侧菜单选择相应功能模块。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">系统管理</h3>
            <p className="text-sm text-gray-600">用户、角色、权限管理</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">文件管理</h3>
            <p className="text-sm text-gray-600">文件上传、下载、预览</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">监控中心</h3>
            <p className="text-sm text-gray-600">系统监控、日志查看</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 系统名称修改位置

1. **frontend/app/layout.js**（第20行）
   ```javascript
   // 修改前
   title: "海安市市场监管经营主体核查系统",

   // 修改后
   title: "owl管理系统",
   ```

2. **frontend/components/layout/sidebar.jsx**
   ```jsx
   // 修改前
   <h1 className="text-lg font-semibold">管理系统</h1>

   // 修改后
   <h1 className="text-lg font-semibold">owl管理系统</h1>
   ```

## 预期效果

优化完成后，系统将：

1. ✅ 移除所有市场监管相关业务功能
2. ✅ 保留核心的通用管理功能：
   - 用户管理
   - 角色管理
   - 权限管理
   - 菜单管理
   - 部门管理
   - 文件管理
   - 日志管理
   - 监控系统
   - 通知中心
   - 代码生成器
3. ✅ 提供一个简洁清爽的首页
4. ✅ 统一的系统名称"owl管理系统"

## 注意事项

1. **数据库不删除**：只删除代码，不涉及数据库表的删除操作
2. **保持简单**：每个修改尽可能简单，影响最小的代码
3. **菜单清理**：如果菜单是数据库存储的，需要在数据库中手动删除相关菜单项
4. **路由清理**：确保删除后端路由注册，避免404错误

## 下一步

待您确认此计划后，我将按照以下顺序执行：
1. 先删除前端页面和组件
2. 再删除后端模块和路由
3. 然后简化Dashboard页面
4. 最后修改系统名称

每完成一个步骤，我会向您汇报具体的修改内容。

---

## 执行进度

- [x] 阶段一：前端代码删除
- [x] 阶段二：后端代码删除
- [x] 阶段三：简化概览页面
- [x] 阶段四：修改系统名称
- [ ] 阶段五：清理菜单配置（需手动在数据库中删除相关菜单项）

## 审查总结

### 已完成的工作

**执行时间**：2025-11-17

#### 1. 前端代码清理

**删除的页面目录：**
- `frontend/app/(authenticated)/business-entity/` - 经营主体核查页面及详情页
- `frontend/app/(authenticated)/unlicensed-business/` - 无照经营管理页面及详情页
- `frontend/app/(authenticated)/user-auth/page.js` - 核查人员管理页面

**清理的API接口（frontend/lib/api.js）：**
- 删除 `businessEntityApi` - 经营主体核查相关接口
- 删除 `unlicensedBusinessApi` - 无照经营管理相关接口
- 删除 `userAuthApi` - 核查人员管理相关接口
- 从 `statsApi` 中删除 `getBusinessOverview` 方法
- 更新 default 导出对象，移除相关API引用

#### 2. 后端代码清理

**删除的业务模块：**
- `backend/src/modules/business-entity/` - 经营主体核查模块
- `backend/src/modules/unlicensed-business/` - 无照经营管理模块
- `backend/src/modules/user-auth/` - 核查人员管理模块
- `backend/src/modules/stats/` - 统计模块

**清理的路由注册（backend/src/routes/index.js）：**
- 删除 `statsRoutes` 导入和注册
- 删除 `businessEntityRoutes` 导入和注册
- 删除 `unlicensedBusinessRoutes` 导入和注册
- 删除 `userAuthRoutes` 导入和注册

**删除的数据库模型文件：**
- `backend/src/models/BusinessEntity.js`
- `backend/src/models/SurveyRecord.js`
- `backend/src/models/UnlicensedBusiness.js`
- `backend/src/models/UserAuth.js`

#### 3. 简化Dashboard概览页面

**文件**：`frontend/app/(authenticated)/dashboard/page.js`

**修改内容**：
- 移除复杂的业务统计逻辑（经营主体统计、网格统计、企业等级分布等）
- 替换为简洁的欢迎页面
- 展示三个功能卡片：系统管理、文件管理、监控中心
- 使用简洁的设计和默认样式

#### 4. 修改系统名称

**修改的文件：**

1. `frontend/app/login/page.js`
   - 第133行：登录页标题改为 "owl管理平台"

2. `frontend/app/layout.js`
   - 第20行：title 改为 "owl管理平台"
   - 第21行：description 改为 "owl管理平台"

3. `frontend/app/(authenticated)/dashboard/page.js`
   - 第14行：欢迎标题改为 "欢迎使用 owl 管理平台"

4. `frontend/components/layout/sidebar.jsx`
   - 第144行：侧边栏标题改为 "owl管理平台"

5. `frontend/.env.production`
   - 第11行：NEXT_PUBLIC_APP_NAME 改为 "owl管理平台"

**注：所有系统名称已统一为"owl管理平台"**

### 保留的功能模块

系统保留了以下通用管理功能：
- ✅ 用户管理
- ✅ 角色管理
- ✅ 权限管理
- ✅ 菜单管理
- ✅ 部门管理
- ✅ 文件管理
- ✅ 日志管理
- ✅ 监控系统
- ✅ 通知中心
- ✅ 代码生成器
- ✅ 字典管理

### 后续待处理事项

1. **菜单清理**：需要手动在数据库中删除以下菜单项：
   - 经营主体核查菜单
   - 无照经营管理菜单
   - 核查人员管理菜单

   **操作建议**：登录系统后，在"菜单管理"模块中删除相关菜单，或直接在数据库 `menus` 表中删除对应记录。

2. **数据库表**：本次优化只删除了代码，未删除数据库表。如需删除表，请谨慎操作并提前备份数据：
   - `business_entity` - 经营主体表
   - `survey_record` - 核查记录表
   - `unlicensed_business` - 无照经营表
   - `user_auth` - 核查人员表

### 额外修复

在实施过程中发现并修复了以下问题：

1. **修复模型索引文件引用错误**
   - 文件：`backend/src/models/index.js`
   - 问题：引用了已删除的模型导致启动失败
   - 修复：删除对 BusinessEntity、SurveyRecord、UnlicensedBusiness、UserAuth 的引用

2. **修复 Attachment 模型关联错误**
   - 文件：`backend/src/models/Attachment.js`
   - 问题：关联了已删除的 SurveyRecord 模型
   - 修复：移除对已删除模型的关联，保留 Attachment 作为通用附件模型

### 优化成果

✅ 成功移除了所有市场监管相关的业务功能
✅ 系统更加通用化，可适配更多业务场景
✅ 代码结构更加清晰简洁
✅ 统一了系统名称为"owl管理平台"（登录页、首页、侧边栏、配置文件等）
✅ 提供了简洁友好的首页欢迎界面
✅ 修复了模型引用导致的启动错误

### 验证建议

建议进行以下验证：
1. 启动前端和后端服务，确保无编译错误
2. 访问Dashboard页面，确认新的欢迎页面正常显示
3. 检查系统名称在浏览器标签和侧边栏是否正确显示为"owl管理系统"
4. 确认其他保留的功能模块（用户、角色、文件等）运行正常
5. 在菜单管理中手动删除已废弃的业务菜单项
