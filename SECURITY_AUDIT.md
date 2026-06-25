# 安全审计报告

## 审计日期
2026-06-25

## 已修复的漏洞

### 1. 动态模块 SQL 注入漏洞 ✅ 已修复
**文件**: `backend/src/core/modules/generator/generic.service.js`

**风险等级**: 🔴 严重

**问题描述**:
- 表名、字段名直接拼接到 SQL 语句
- ORDER BY 参数未验证
- 可能导致 SQL 注入攻击

**修复措施**:
- 添加 `_escapeIdentifier()` 方法转义所有标识符
- 添加 `_validateSortField()` 白名单验证排序字段
- 添加 `_validateOrder()` 验证排序顺序
- 所有标识符使用双引号转义
- 用户输入值使用参数化查询

---

## 发现的严重漏洞（需要修复）

### 2. API Builder SQL 注入漏洞 ⚠️ 未修复
**文件**: `backend/src/core/modules/api-builder/api-builder-executor.service.js`

**风险等级**: 🔴 严重

**问题描述**:
```javascript
// 第 42-55 行
const sqlQuery = this.bindParameters(interface_.sql_query, params, interface_.parameters);
const queryResult = await db.sequelize.query(sqlQuery, {
  type: queryType,
});
```

**具体问题**:
1. `bindParameters` 方法使用字符串替换而非参数化查询
2. `escapeSqlValue` 只转义单引号，无法防止所有注入
3. 没有使用 Sequelize 的 `replacements` 参数

**攻击场景**:
```javascript
// 用户输入
params = {
  id: "1; DROP TABLE users; --"
}

// SQL 注入成功
SELECT * FROM users WHERE id = 1; DROP TABLE users; --
```

**建议修复**:
```javascript
// 使用 Sequelize 的参数化查询
const queryResult = await db.sequelize.query(sqlQuery, {
  replacements: params,
  type: queryType,
});
```

---

## 中等风险问题

### 3. 文件上传安全 ⚠️ 部分完善
**文件**: `backend/src/middlewares/upload.js`

**当前保护措施**:
- ✅ MIME 类型白名单
- ✅ 文件大小限制（100MB）
- ✅ 文件数量限制（10个）
- ✅ 文件名编码修复
- ✅ 使用内存存储（上传到 Minio）

**潜在问题**:
1. ⚠️ MIME 类型可伪造（需要验证文件魔数）
2. ⚠️ 允许上传 SVG（可能包含 XSS）
3. ⚠️ 允许上传 HTML/CSS/JS（可能包含恶意代码）
4. ⚠️ `getSafeFilename` 可能导致文件名冲突

**建议改进**:
```javascript
// 1. 添加文件魔数验证
const fileType = require('file-type');
const buffer = await fileType.fromBuffer(file.buffer);
if (!buffer || !ALLOWED_MIME_TYPES.includes(buffer.mime)) {
  throw new Error('Invalid file type');
}

// 2. SVG 需要额外清理
if (file.mimetype === 'image/svg+xml') {
  // 使用 svg-sanitize 库清理
}

// 3. 禁止上传可执行代码
const DANGEROUS_TYPES = ['text/html', 'text/javascript', 'application/javascript'];
```

---

## 低风险问题

### 4. 时区处理 ✅ 已优化
**文件**: 
- `backend/src/core/modules/generator/generic.service.js`
- `frontend/components/ui/date-time-picker.jsx`

**问题**: UTC 时间和本地时间混淆

**已修复**: 
- 后端 SQL 查询时使用 `AT TIME ZONE` 转换为本地时区
- 前端直接发送和显示本地时间

---

## 安全建议

### 认证与授权
- ✅ 使用 JWT 认证
- ✅ 密码加密（bcrypt）
- ✅ 权限检查中间件
- ⚠️ 建议添加：请求频率限制（rate limiting）
- ⚠️ 建议添加：登录失败锁定机制

### 数据验证
- ✅ 使用 Joi 进行输入验证
- ✅ Sequelize 参数化查询（非动态模块）
- ⚠️ API Builder 需要改用参数化查询

### 日志与监控
- ✅ 日志记录（winston）
- ✅ API 调用日志
- ⚠️ 建议添加：安全事件告警
- ⚠️ 建议添加：异常流量检测

### 依赖安全
- ⚠️ 定期运行 `npm audit`
- ⚠️ 及时更新依赖包
- ⚠️ 使用 Snyk 或 Dependabot 监控漏洞

---

## 修复优先级

1. **🔴 紧急**: API Builder SQL 注入漏洞
2. **🟡 高优先级**: 文件上传增强验证
3. **🟢 中优先级**: 添加请求频率限制
4. **🟢 低优先级**: 依赖安全监控

---

## 审计人员
Claude Sonnet 4.6
