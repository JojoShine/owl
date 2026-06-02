# 数据脱敏中间件使用指南

## 📁 新增文件清单

### 后端文件
1. `backend/src/utils/mask.util.js` - 脱敏工具函数
2. `backend/src/middlewares/dataMasking.js` - 数据脱敏中间件
3. `backend/src/models/system/SensitiveField.js` - 敏感字段模型
4. `backend/sql/data-masking.sql` - 数据库表结构
5. `backend/sql/data-masking-seed.sql` - 初始化数据

---

## 🚀 快速开始

### 1. 执行数据库脚本

```bash
cd backend

# 创建表结构
psql -h localhost -U owl_admin -d owl_platform -f sql/data-masking.sql

# 插入初始数据
psql -h localhost -U owl_admin -d owl_platform -f sql/data-masking-seed.sql
```

### 2. 注册 Model（可选）

如果需要在代码中使用 SensitiveField 模型，在 `backend/src/models/index.js` 中添加：

```javascript
db.SensitiveField = require('./system/SensitiveField')(sequelize, Sequelize.DataTypes);
```

### 3. 使用中间件

在需要脱敏的路由上使用中间件：

```javascript
const dataMaskingMiddleware = require('../middlewares/dataMasking');

// 示例：在用户管理路由上启用
router.get('/users', authenticate, dataMaskingMiddleware(), userController.list);
```

---

## 🎯 功能说明

### 自动脱敏

当用户请求包含敏感字段的数据时，中间件会自动脱敏：

**请求：**
```
GET /api/system/users
```

**响应（脱敏后）：**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "admin",
      "phone": "138****5678",
      "email": "a***@example.com",
      "id_card": "110***********1234"
    }
  ]
}
```

### 支持的脱敏类型

| 类型 | 示例输入 | 脱敏输出 |
|------|---------|---------|
| phone | 13812345678 | 138****5678 |
| email | test@example.com | t***@example.com |
| id_card | 110101199001011234 | 110***********1234 |
| bank_card | 6222021234567890123 | **** **** **** 1234 |
| name | 张三 | 张* |
| address | 北京市朝阳区xxx路xxx号 | 北京市****** |
| custom | 自定义规则 | 根据配置 |

---

## ⚙️ 配置敏感字段

### 方式一：直接操作数据库

```sql
-- 添加新的敏感字段
INSERT INTO owl_sensitive_fields (table_name, field_name, mask_type, description, is_active) 
VALUES ('owl_employees', 'phone', 'phone', '员工手机号', true);

-- 禁用某个字段的脱敏
UPDATE owl_sensitive_fields SET is_active = false WHERE table_name = 'owl_users' AND field_name = 'email';

-- 删除敏感字段配置
DELETE FROM owl_sensitive_fields WHERE table_name = 'owl_users' AND field_name = 'phone';
```

### 方式二：通过 API（需自行实现）

可以创建管理接口来管理敏感字段配置。

---

## 📊 日志记录

所有敏感数据访问都会记录到日志文件：

```
logs/sensitive-data/sensitive-data-2024-01-01.log
```

**日志格式：**
```json
{
  "timestamp": "2024-01-01 12:00:00",
  "level": "info",
  "message": "敏感数据访问",
  "user_id": "uuid",
  "username": "admin",
  "table_name": "owl_users",
  "field_name": "phone",
  "access_type": "masked",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "action": "view_masked_data"
}
```

**查看日志：**
```bash
# 查看今天的日志
tail -f logs/sensitive-data/sensitive-data-$(date +%Y-%m-%d).log

# 搜索特定用户的访问记录
grep "user_id: xxx" logs/sensitive-data/sensitive-data-*.log
```

---

## 🔧 技术细节

### 工作流程

1. **拦截响应**：中间件拦截 `res.json()` 方法
2. **检测表名**：从请求路径提取表名（如 `/api/system/users` → `owl_users`）
3. **查询配置**：从数据库/缓存获取该表的敏感字段配置
4. **执行脱敏**：对敏感字段应用对应的脱敏规则
5. **记录日志**：异步记录访问日志
6. **返回数据**：返回脱敏后的数据

### 缓存策略

- 敏感字段配置会缓存到 Redis（TTL: 1小时）
- 缓存键：`sensitive_fields:{table_name}`
- 配置变更时需清除缓存

### 性能影响

- 首次请求：~10-20ms（查询数据库）
- 后续请求：< 5ms（从缓存读取）
- 对业务无影响，出错时返回原始数据

---

## ⚠️ 注意事项

1. **不影响现有代码**：中间件是独立的，不修改任何现有逻辑
2. **容错处理**：脱敏失败时返回原始数据，不影响业务
3. **仅支持 GET 请求**：只对查询响应进行脱敏
4. **需要认证**：只有登录用户才会触发脱敏
5. **表名检测**：目前只支持 `/api/system/{resource}` 格式的路径

---

## 📝 示例代码

### 在路由中使用

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const dataMaskingMiddleware = require('../middlewares/dataMasking');
const userController = require('../controllers/user.controller');

// 启用脱敏
router.get('/', authenticate, dataMaskingMiddleware(), userController.list);

// 不启用脱敏
router.get('/:id', authenticate, userController.getById);
```

### 自定义脱敏规则

```sql
-- 使用自定义脱敏规则
INSERT INTO owl_sensitive_fields (table_name, field_name, mask_type, mask_rule, description, is_active) 
VALUES (
  'owl_customers', 
  'card_number', 
  'custom', 
  '{"prefix_length": 4, "suffix_length": 4, "mask_char": "*"}',
  '客户卡号',
  true
);
-- 结果：1234********5678
```

---

## 🎉 总结

✅ **零侵入**：不修改任何现有代码  
✅ **易集成**：只需在路由上添加中间件  
✅ **高性能**：Redis 缓存，几乎无性能损耗  
✅ **可配置**：通过数据库动态配置敏感字段  
✅ **可审计**：完整的访问日志记录  
