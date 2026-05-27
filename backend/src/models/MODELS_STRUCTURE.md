# Models 文件夹结构说明

## 📁 文件夹结构

```
models/
├── system/              # 系统模型（核心框架）
│   ├── User.js          # 用户模型
│   ├── Role.js          # 角色模型
│   ├── Permission.js    # 权限模型
│   ├── Menu.js          # 菜单模型
│   ├── Department.js    # 部门模型
│   ├── Folder.js        # 文件夹模型
│   ├── File.js          # 文件模型
│   ├── FileShare.js     # 文件分享模型
│   ├── FilePermission.js # 文件权限模型
│   ├── Attachment.js    # 附件模型
│   └── Dictionary.js    # 数据字典模型
│
├── monitor/             # 监控模型
│   ├── MonitorMetric.js # 监控指标
│   ├── ApiMonitor.js    # API监控
│   ├── ApiMonitorLog.js # API监控日志
│   ├── AlertRule.js     # 告警规则
│   └── AlertHistory.js  # 告警历史
│
├── notification/        # 通知模型
│   ├── Notification.js      # 通知信息
│   ├── EmailLog.js          # 邮件日志
│   ├── NotificationSettings.js # 通知设置
│   └── EmailTemplate.js     # 邮件模板
│
├── generator/           # 代码生成器模型
│   ├── GeneratedModule.js   # 生成的模块
│   ├── GeneratedField.js    # 生成的字段
│   └── GenerationHistory.js # 生成历史
│
├── association/         # 关联表（中间表）
│   ├── UserRole.js      # 用户-角色关联
│   ├── RolePermission.js # 角色-权限关联
│   └── RoleMenu.js      # 角色-菜单关联
│
├── index.js             # 模型汇聚入口
└── MODELS_STRUCTURE.md  # 本文档
```

## 📋 模型分类说明

### System Models（系统模型）
**位置**: `models/system/`

系统框架的核心数据模型，包括用户认证、权限控制、文件管理等。

| 模型 | 说明 | 关键字段 |
|------|------|---------|
| **User** | 用户信息 | id, username, email, password_hash, status |
| **Role** | 角色定义 | id, name, description |
| **Permission** | 权限定义 | id, resource, action, category |
| **Menu** | 菜单配置 | id, name, path, icon, parent_id |
| **Department** | 部门结构 | id, name, parent_id, description |
| **Folder** | 文件夹 | id, name, parent_id, created_by |
| **File** | 文件信息 | id, original_name, size, mime_type |
| **FileShare** | 分享链接 | id, file_id, share_code, expires_at |
| **FilePermission** | 文件权限 | id, file_id, user_id, permission_type |
| **Attachment** | 附件 | id, filename, mime_type, size |
| **Dictionary** | 数据字典 | id, type, key, value |

### Monitor Models（监控模型）
**位置**: `models/monitor/`

系统监控和告警相关的数据模型。

| 模型 | 说明 | 关键字段 |
|------|------|---------|
| **MonitorMetric** | 监控指标 | id, metric_name, value, timestamp |
| **ApiMonitor** | API监控配置 | id, api_name, url, check_interval |
| **ApiMonitorLog** | 监控日志 | id, api_id, status_code, response_time |
| **AlertRule** | 告警规则 | id, metric_type, condition, threshold |
| **AlertHistory** | 告警历史 | id, rule_id, triggered_at, status |

### Notification Models（通知模型）
**位置**: `models/notification/`

邮件和系统通知相关的数据模型。

| 模型 | 说明 | 关键字段 |
|------|------|---------|
| **Notification** | 通知信息 | id, user_id, message, read_at |
| **EmailLog** | 邮件日志 | id, recipient, subject, status |
| **NotificationSettings** | 通知设置 | id, user_id, email_enabled, sms_enabled |
| **EmailTemplate** | 邮件模板 | id, name, subject, template |

### Generator Models（生成器模型）
**位置**: `models/generator/`

代码生成器相关的数据模型。

| 模型 | 说明 | 关键字段 |
|------|------|---------|
| **GeneratedModule** | 生成模块 | id, module_name, config, status |
| **GeneratedField** | 模块字段 | id, module_id, field_name, field_type |
| **GenerationHistory** | 生成历史 | id, module_id, generated_at, version |

### Association Models（关联模型）
**位置**: `models/association/`

用于多对多关系的中间表模型。

| 模型 | 说明 | 关键字段 |
|------|------|---------|
| **UserRole** | 用户-角色 | id, user_id, role_id |
| **RolePermission** | 角色-权限 | id, role_id, permission_id |
| **RoleMenu** | 角色-菜单 | id, role_id, menu_id |

## 🔄 模型导入

### 在 index.js 中的导入
所有模型都在 `models/index.js` 中统一导入和注册：

```javascript
// ========== System Models ==========
db.User = require('./system/User')(sequelize, Sequelize.DataTypes);
db.Role = require('./system/Role')(sequelize, Sequelize.DataTypes);
// ...

// ========== Monitor Models ==========
db.ApiMonitor = require('./monitor/ApiMonitor')(sequelize, Sequelize.DataTypes);
// ...
```

### 在业务代码中使用
```javascript
// 方式 1：从 models 导入
const { User, Role } = require('../../models');

// 方式 2：分别导入
const User = require('../../models/system/User');
```

## 📝 添加新模型的步骤

1. **创建模型文件**
   ```bash
   # 根据模型类型放在对应文件夹
   touch src/models/system/[ModelName].js
   ```

2. **编写模型定义**
   ```javascript
   module.exports = (sequelize, DataTypes) => {
     const [ModelName] = sequelize.define('[ModelName]', {
       id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
       },
       // ... 字段定义
     }, {
       tableName: '[table_name]',
       timestamps: true,
       underscored: true,
     });

     // 定义模型关联
     [ModelName].associate = (models) => {
       // ...
     };

     return [ModelName];
   };
   ```

3. **在 index.js 中注册**
   ```javascript
   // ========== [Category] Models ==========
   db.[ModelName] = require('./[category]/[ModelName]')(sequelize, Sequelize.DataTypes);
   ```

4. **创建数据库迁移**（如果需要）
   ```bash
   npm run migrate:create -- --name create-[table-name]-table
   ```

## 🗂️ 分类原则

- **System**: 与用户、权限、文件等系统功能相关
- **Monitor**: 与系统监控、告警相关
- **Notification**: 与邮件、消息通知相关
- **Generator**: 与代码生成功能相关
- **Association**: 多对多关系的中间表
- **Business**: 业务特定的模型（后续新增）

## 💡 最佳实践

1. **命名规范**
   - 模型名使用 PascalCase（如 `UserProfile`）
   - 表名使用 snake_case（如 `user_profile`）

2. **字段命名**
   - 使用 snake_case（如 `created_at`）
   - 通用字段：`id`, `created_at`, `updated_at`, `created_by`, `updated_by`

3. **关联定义**
   - 在模型的 `associate` 方法中定义关系
   - 使用清晰的别名（`as`）标识关系

4. **查询优化**
   - 使用关联加载（`include`）避免N+1查询
   - 索引常用查询字段

## 📚 相关文档

- 后端架构说明：`../modules/ARCHITECTURE.md`
- API 响应格式：`../docs/api-response-format.md`
- 数据库设计：查看迁移文件
