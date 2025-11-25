# Owl 管理平台 - 后端模块完整索引

> 这份文档是对后端所有16个模块的详细分析和快速参考。

## 文档导航

本项目包含以下文档，供不同需求查阅：

1. **BACKEND_MODULE_ANALYSIS.md** (本文档)
   - 详细的模块分析报告
   - 适合需要深入了解架构的开发者
   - 包含:模块分类、API映射、设计模式、依赖关系、使用案例

2. **BACKEND_MODULE_QUICK_REFERENCE.txt**
   - 快速参考指南
   - 适合日常开发和查询
   - 包含:模块速查、功能概览、常见任务、性能建议

3. **CODEBASE_STRUCTURE.md**
   - 整体项目结构说明

---

## 快速导航 (按需求)

### 我想了解系统架构
- 阅读: BACKEND_MODULE_ANALYSIS.md → "模块分类体系" + "核心设计模式"
- 时间: 10分钟

### 我需要使用某个模块API
- 阅读: BACKEND_MODULE_QUICK_REFERENCE.txt → "🎯 快速参考表"
- 时间: 2分钟

### 我要添加新的权限
- 阅读: BACKEND_MODULE_QUICK_REFERENCE.txt → "🔧 常见开发任务"
- 目标文件: `/backend/src/modules/permission/permission.service.js`

### 我要创建新的业务模块
- 推荐方式: 使用 generator 模块的零重启生成 (不需要写代码!)
- 阅读: BACKEND_MODULE_ANALYSIS.md → "实际使用案例" → "案例1"

### 我要发送通知/告警
- 阅读: BACKEND_MODULE_QUICK_REFERENCE.txt → "notification" 部分
- 关键文件:
  - `/backend/src/modules/notification/email.service.js`
  - `/backend/src/modules/notification/socket.service.js`

### 我要设置监控和告警
- 阅读: BACKEND_MODULE_ANALYSIS.md → "monitor 模块"
- 关键文件:
  - `/backend/src/modules/monitor/api-monitor.service.js`
  - `/backend/src/modules/monitor/alert.service.js`

### 我要优化性能
- 阅读: BACKEND_MODULE_QUICK_REFERENCE.txt → "📈 性能优化建议"
- 重点优化:
  1. user 模块 → 添加Redis缓存
  2. permission 模块 → 添加权限缓存
  3. monitor 模块 → 使用消息队列

### 我要理解权限系统如何工作
- 阅读: BACKEND_MODULE_ANALYSIS.md → "权限系统工作流程"
- 关键模块: auth → role → permission → menu

---

## 模块全景速查表

```
系统内置 (7个模块)
├─ auth        [4files] ━ JWT身份认证
├─ captcha     [3files] ━ 验证码防滥用
├─ user        [4files] ━ 用户CRUD管理
├─ role        [4files] ━ 角色定义
├─ permission  [4files] ━ 权限检查
├─ menu        [4files] ━ 菜单树结构
└─ log         [4files] ━ 审计日志

数据管理 (5个模块)
├─ file        [7files] ━ 文件系统(最复杂)
├─ folder      [4files] ━ 文件夹树
├─ file-share  [3files] ━ 分享链接
├─ department  [4files] ━ 部门组织
└─ dictionary  [3files] ━ 数据字典

业务功能 (4个模块)
├─ generator   [12files] ━ 低代码生成(零重启!)
├─ monitor     [10files] ━ 多层监控告警
├─ notification[12files] ━ 邮件+WebSocket推送
└─ dashboard   [3files] ━ 仪表板统计

总计: 16模块 + 90文件
```

---

## 按功能查询

### 用户和认证相关
- auth.service.js        → 登录/注册/JWT
- user.service.js        → 用户管理
- role.service.js        → 角色定义
- permission.service.js  → 权限验证

### 文件系统相关
- file.service.js                  → 文件CRUD
- file-permission.service.js       → 文件权限
- file-share.service.js            → 分享链接
- folder.service.js                → 文件夹树

### 监控告警相关
- api-monitor.service.js   → 接口监控
- alert.service.js         → 告警管理
- system.service.js        → 系统监控

### 通知相关
- email.service.js              → 邮件发送
- email-template.service.js     → 邮件模板
- socket.service.js             → WebSocket推送
- variable-mapper.service.js    → 动态变量

### 低代码生成相关
- generic.service.js       → 配置驱动CRUD(零重启!)
- code-generator.service.js → 代码生成
- db-reader.service.js      → 数据库扫描

### 其他
- menu.service.js          → 菜单树 + 权限关联
- log.service.js           → 操作审计
- dictionary.service.js    → 数据字典
- dashboard.service.js     → 统计聚合

---

## 关键特性速览

### 零重启低代码生成 (generator)
- 最强大的特性
- 配置驱动,不生成代码
- POST /api/generator/generate → 立即可用
- 详见: BACKEND_MODULE_ANALYSIS.md → "实际使用案例 1"

### 多层监控架构 (monitor)
- 5层监控: API / System / DB / Cache / App
- 自动告警和通知
- 详见: BACKEND_MODULE_ANALYSIS.md → "实际使用案例 2"

### 多渠道通知系统 (notification)
- 邮件 + WebSocket
- 模板化 + 动态变量替换
- 详见: BACKEND_MODULE_ANALYSIS.md → "实际使用案例 3"

### 完整权限系统 (auth/role/permission/menu)
- RBAC模型 (Role-Based Access Control)
- 动态菜单 + 权限关联
- 详见: BACKEND_MODULE_ANALYSIS.md → "权限系统工作流程"

---

## 文件结构一览

```
/backend/src/modules/

[系统内置] (28个文件)
auth/         (4)  ├─ auth.controller.js
                   ├─ auth.service.js
                   ├─ auth.routes.js
                   └─ auth.validation.js
captcha/      (3)  └─ ...
user/         (4)  └─ ...
role/         (4)  └─ ...
permission/   (4)  └─ ...
menu/         (4)  └─ ...
log/          (4)  └─ ...

[数据管理] (25个文件)
file/         (7)  ├─ file.service.js
                   ├─ file-permission.service.js
                   └─ ...
folder/       (4)  └─ ...
file-share/   (3)  └─ ...
department/   (4)  └─ ...
dictionary/   (3)  └─ ...

[业务功能] (37个文件)
generator/    (12) ├─ generic.service.js (配置驱动!)
                   ├─ code-generator.service.js
                   ├─ db-reader.service.js
                   └─ ...
monitor/      (10) ├─ api-monitor.service.js
                   ├─ alert.service.js
                   └─ ...
notification/ (12) ├─ email.service.js
                   ├─ socket.service.js
                   └─ ...
dashboard/    (3)  └─ ...
```

---

## 开发流程指南

### 1. 创建新业务模块 (推荐使用低代码!)
```
步骤:
1. POST /api/generator/generate
   {
     "name": "products",
     "tableName": "product",
     "fields": [...]
   }
2. 立即使用: GET /api/products/list
3. 支持零重启，配置实时生效
```

### 2. 添加新的权限
```
步骤:
1. 编辑: /backend/src/modules/permission/permission.service.js
2. 新增权限码: "new_module.action"
3. 通过API关联到role
```

### 3. 配置监控和告警
```
步骤:
1. POST /api/api-monitors
   {
     "url": "...",
     "interval": 30,
     "alertEmail": "..."
   }
2. api-monitor 自动定时检测
3. 失败时自动告警
```

### 4. 创建邮件通知
```
步骤:
1. POST /api/email-templates (创建模板)
2. 在 variable-mapper 中添加变量映射
3. 调用 notification.service.send()
```

---

## 性能优化清单

- [ ] 为 user 表添加缓存 (Redis)
- [ ] 为 permission 表添加权限缓存 (TTL=5min)
- [ ] 为 menu 表缓存菜单树 (TTL=10min)
- [ ] monitor 定时任务改用消息队列
- [ ] email 发送改为异步队列
- [ ] log 批量写入数据库
- [ ] 为 permission.user_id 添加数据库索引
- [ ] 为 file.owner_id 添加数据库索引
- [ ] 为 folder.parent_id 添加数据库索引

---

## 常见问题 (FAQ)

**Q: 如何创建新模块?**
A: 使用 generator 模块的零重启生成，无需编写代码！
   → POST /api/generator/generate

**Q: 如何添加权限检查?**
A: 编辑 permission.service.js，添加新权限码并关联到role
   → /backend/src/modules/permission/permission.service.js

**Q: 监控告警如何实现?**
A: 使用 monitor 模块的 API 监控 + alert + notification 组合
   → POST /api/api-monitors

**Q: 如何发送邮件?**
A: 使用 notification 模块，创建模板，调用 email.service
   → /api/email-templates + email.service.js

**Q: 权限系统如何工作?**
A: RBAC模型: 用户 → 角色 → 权限 → 菜单
   → 详见: BACKEND_MODULE_ANALYSIS.md

**Q: 哪个模块最复杂?**
A: 3个模块并列:
   1. file (7个文件，权限复杂)
   2. generator (12个文件，配置驱动)
   3. notification (12个文件，多渠道)

---

## 关键指标

- 总模块数: 16个
- 总文件数: 90个JavaScript文件
- Controller文件: 32个
- Service文件: 41个
- Routes文件: 20个
- Validation文件: 12个
- 系统内置模块: 7个 (基础设施)
- 数据管理模块: 5个 (存储)
- 业务功能模块: 4个 (特色)

---

## 推荐阅读顺序

### 第一次读者
1. 本索引文档 (5分钟) ← 你在这里
2. BACKEND_MODULE_QUICK_REFERENCE.txt (10分钟) ← 快速了解
3. BACKEND_MODULE_ANALYSIS.md 的"执行摘要"部分 (10分钟)

### 系统设计师
1. BACKEND_MODULE_ANALYSIS.md 的"核心设计模式" (15分钟)
2. BACKEND_MODULE_ANALYSIS.md 的"数据库关系图" (10分钟)
3. BACKEND_MODULE_ANALYSIS.md 的"模块依赖分析" (10分钟)

### 日常开发者
1. BACKEND_MODULE_QUICK_REFERENCE.txt (一直保留)
2. BACKEND_MODULE_ANALYSIS.md 的"实际使用案例" (按需查看)

### 系统管理员
1. BACKEND_MODULE_ANALYSIS.md 的"部署和运维建议" (10分钟)
2. BACKEND_MODULE_QUICK_REFERENCE.txt 的"📈 性能优化建议" (5分钟)

---

## 文档维护

最后更新: 2025-11-25
版本: 1.0

如需更新本文档，请修改对应的分析文件。

---

## 其他资源

- 项目计划: `projectplan.md`
- 代码库结构: `CODEBASE_STRUCTURE.md`
- 完整分析: `BACKEND_MODULE_ANALYSIS.md`
- 快速参考: `BACKEND_MODULE_QUICK_REFERENCE.txt`

---

欢迎使用 Owl 管理平台后端文档！
