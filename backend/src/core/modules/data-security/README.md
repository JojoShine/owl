# 敏感字段管理模块

## 概述

敏感字段管理模块用于配置和管理需要脱敏的敏感字段。系统会自动对包含敏感字段的响应数据进行脱敏处理，保护用户隐私数据安全。

## 功能特性

1. **自动脱敏**：基于字段名全局匹配，自动对敏感数据进行脱敏
2. **灵活配置**：支持多种脱敏类型（手机号、邮箱、身份证等）
3. **自定义规则**：支持自定义脱敏规则（JSON格式）
4. **启用/禁用**：可动态启用或禁用某个字段的脱敏配置
5. **审计日志**：记录所有敏感数据访问行为

## 技术实现

### 后端架构

```
backend/src/
├── middlewares/
│   └── dataMasking.js                 # 数据脱敏中间件
├── models/system/
│   └── SensitiveField.js              # 敏感字段模型
└── utils/
    └── mask.util.js                   # 脱敏工具函数
```

### 前端架构

```
frontend/
├── app/(authenticated)/setting/sensitive-fields/
│   └── page.js                        # 主页面
├── components/sensitive-fields/
│   └── sensitive-field-form-dialog.jsx # 表单对话框
└── lib/api/system/
    └── sensitive-field.api.js         # API 接口
```

## 数据库表结构

### owl_sensitive_fields（敏感字段配置表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键ID |
| table_name | VARCHAR(100) | 表名（可选，仅用于文档说明） |
| field_name | VARCHAR(100) | 字段名（全局唯一） |
| mask_type | ENUM | 脱敏类型 |
| mask_rule | JSONB | 自定义脱敏规则 |
| description | VARCHAR(255) | 字段描述 |
| is_active | BOOLEAN | 是否启用 |

## API 接口

### 敏感字段管理

- `GET /api/system/data-security/fields` - 获取敏感字段列表
- `GET /api/system/data-security/fields/:id` - 获取敏感字段详情
- `POST /api/system/data-security/fields` - 创建敏感字段配置
- `PUT /api/system/data-security/fields/:id` - 更新敏感字段配置
- `DELETE /api/system/data-security/fields/:id` - 删除敏感字段配置

## 数据脱敏中间件

### 核心功能

1. **Sequelize 对象转换**：自动将 Sequelize Model 实例转换为纯 JSON 对象
2. **基于字段名匹配**：不再依赖表名，直接基于响应数据的字段名进行全局匹配
3. **自动脱敏**：对包含敏感字段的数据自动执行脱敏处理
4. **审计日志**：记录所有敏感数据访问行为

### 工作流程

```
API 返回数据
→ 中间件拦截响应
→ 检测并转换 Sequelize Model 实例为纯 JSON
→ 获取所有敏感字段配置
→ 基于字段名匹配并执行脱敏
→ 记录访问日志
→ 返回脱敏后的数据
```

### 脱敏类型

支持以下脱敏类型：

- `phone`: 手机号 138****5678
- `email`: 邮箱 a***@example.com
- `id_card`: 身份证 110***********1234
- `bank_card`: 银行卡 **** **** **** 1234
- `name`: 姓名 张*
- `address`: 地址 北京市******
- `custom`: 自定义规则（JSON格式）

## 页面路由

- **路径**：`/setting/sensitive-fields`
- **菜单位置**：系统管理 → 敏感字段管理
- **功能**：查看、创建、编辑、删除敏感字段配置

## 部署说明

### 数据库迁移

执行迁移脚本更新敏感字段表结构：

```bash
psql -h localhost -U owl_admin -d owl_platform -f backend/sql/migrate-sensitive-fields.sql
```

### 重启服务

```bash
# 后端
cd backend
npm run dev

# 前端
cd frontend
npm run dev
```

## 注意事项

1. **字段名唯一性**：field_name 必须全局唯一，不同表中的同名字段只需配置一次
2. **表名字段**：table_name 改为可选，仅用于文档说明和审计目的
3. **Sequelize 对象**：中间件会自动处理，无需在控制器层单独转换
4. **性能优化**：白名单路径可跳过脱敏处理以提升性能
5. **自定义规则**：custom 类型需要提供有效的 JSON 格式脱敏规则
