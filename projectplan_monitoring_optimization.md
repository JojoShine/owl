# 监控和告警系统优化计划

## 项目概述
本次优化针对监控和告警系统的三个核心需求进行增强，提升系统的监控告警能力和用户体验。

---

## 优化需求

### 需求1：接口监控增加告警功能
**描述**：在配置接口监控时，可以设置是否需要告警,并选择告警邮件模版。

**当前状态**：
- ✅ 接口监控功能已实现
- ✅ 邮件模版功能已实现
- ❌ 接口监控和邮件模版未集成

### 需求2：告警管理增加多维度支持
**描述**：扩展告警管理的监控类型，支持接口监控告警。

**当前状态**：
- ✅ 支持系统、应用、数据库、缓存四种监控类型
- ❌ 不支持接口监控告警

### 需求3：邮件模版变量配置优化
**描述**：改进前端邮件模版编辑界面，提供更友好的变量配置功能。

**当前状态**：
- ✅ 后端支持模版变量（JSON格式）
- ❌ 前端缺少变量编辑器，用户体验不佳

---

## 实施计划

### 阶段一：数据库迁移和模型更新

#### 任务1.1：为接口监控表添加告警相关字段
**文件**：创建新的数据库迁移文件
- [ ] 添加字段 `alert_enabled` (BOOLEAN) - 是否启用告警
- [ ] 添加字段 `alert_template_id` (UUID) - 告警邮件模版ID，外键关联 `email_templates`
- [ ] 添加字段 `alert_recipients` (JSON) - 告警接收人列表（邮箱地址）

#### 任务1.2：更新 ApiMonitor 模型
**文件**：`backend/src/models/ApiMonitor.js`
- [ ] 添加 `alert_enabled` 字段定义
- [ ] 添加 `alert_template_id` 字段定义
- [ ] 添加 `alert_recipients` 字段定义
- [ ] 添加与 `EmailTemplate` 的关联关系

---

### 阶段二：后端服务功能开发

#### 任务2.1：增强接口监控服务
**文件**：`backend/src/modules/monitor/api-monitor.service.js`
- [ ] 修改 `executeMonitor` 方法，在检测失败时触发告警
- [ ] 新增 `sendAlert` 方法，使用邮件模版发送告警邮件
- [ ] 集成邮件服务，调用 `email.service.js` 发送邮件
- [ ] 添加告警去重逻辑，避免重复发送

#### 任务2.2：扩展告警管理服务
**文件**：`backend/src/modules/monitor/alert.service.js`
- [ ] 在 `metricOptions` 中添加 `api_monitor` 类型
- [ ] 实现 `getApiMonitorMetricValue` 方法，获取接口监控指标
- [ ] 支持接口监控相关的告警规则（如：可用率、响应时间等）
- [ ] 更新 `checkRule` 方法，支持接口监控告警

#### 任务2.3：更新API端点
**文件**：`backend/src/modules/monitor/api-monitor.controller.js`
- [ ] 修改创建/更新接口的逻辑，支持告警配置参数
- [ ] 添加参数验证，确保告警模版ID有效

---

### 阶段三：前端功能开发

#### 任务3.1：接口监控表单增加告警配置
**文件**：`frontend/app/(authenticated)/monitor/apis/page.js`
- [ ] 在表单中添加告警开关（Switch组件）
- [ ] 添加邮件模版选择器（Select组件），动态加载可用模版
- [ ] 添加告警接收人输入框（支持多个邮箱地址）
- [ ] 更新表单提交逻辑，包含告警配置数据
- [ ] 在监控列表中显示告警配置状态

#### 任务3.2：告警管理页面支持接口监控类型
**文件**：`frontend/app/(authenticated)/monitor/alerts/page.js`
- [ ] 在 `metricOptions` 中添加 `api_monitor` 类型选项
- [ ] 添加接口监控相关的指标选项（可用率、平均响应时间等）
- [ ] 更新前端表单验证逻辑

#### 任务3.3：邮件模版页面添加变量编辑器
**文件**：
- `frontend/app/(authenticated)/setting/email-templates/page.js`
- `frontend/components/notification/EmailTemplateFormDialog.jsx`（可能需要创建或修改）

**功能设计**：
- [ ] 创建变量列表编辑器组件 `VariableEditor.jsx`
- [ ] 支持添加/删除变量
- [ ] 为每个变量配置：
  - 变量名（如：`userName`）
  - 显示名称（如：用户名）
  - 描述说明
  - 默认值（可选）
- [ ] 在模版编辑表单中集成变量编辑器
- [ ] 提供变量插入按钮，方便用户在编写模版时插入变量
- [ ] 实时显示可用变量列表

---

### 阶段四：前端组件开发

#### 任务4.1：创建邮件模版选择器组件
**文件**：`frontend/components/monitor/EmailTemplateSelector.jsx`
- [ ] 创建可复用的模版选择器组件
- [ ] 支持搜索和筛选模版
- [ ] 显示模版预览信息

#### 任务4.2：创建变量编辑器组件
**文件**：`frontend/components/notification/VariableEditor.jsx`
- [ ] 创建变量列表管理组件
- [ ] 支持动态添加/删除变量
- [ ] 提供变量配置表单
- [ ] 实现变量验证（变量名格式检查）

#### 任务4.3：创建告警接收人输入组件
**文件**：`frontend/components/monitor/AlertRecipientsInput.jsx`
- [ ] 创建邮箱地址列表输入组件
- [ ] 支持添加/删除邮箱
- [ ] 邮箱格式验证
- [ ] 标签式展示已添加的邮箱

---

### 阶段五：测试和优化

#### 任务5.1：功能测试
- [ ] 测试接口监控告警发送功能
- [ ] 测试告警去重逻辑
- [ ] 测试邮件模版渲染
- [ ] 测试接口监控类型的告警规则
- [ ] 测试变量编辑器功能

#### 任务5.2：用户体验优化
- [ ] 添加加载状态提示
- [ ] 添加表单验证错误提示
- [ ] 优化组件交互逻辑
- [ ] 添加帮助文档/提示信息

---

## 技术实现细节

### 1. 接口监控告警触发逻辑

```javascript
// 在 api-monitor.service.js 的 executeMonitor 方法中
async executeMonitor(monitor) {
  // ... 执行监控逻辑 ...

  // 如果监控失败且启用了告警
  if (logData.status !== 'success' && monitor.alert_enabled && monitor.alert_template_id) {
    await this.sendAlert(monitor, logData);
  }

  // ... 保存日志 ...
}

async sendAlert(monitor, logData) {
  // 检查是否需要发送告警（避免重复）
  if (this.shouldSendAlert(monitor.id)) {
    // 准备模版变量
    const variables = {
      monitorName: monitor.name,
      url: monitor.url,
      status: logData.status,
      errorMessage: logData.error_message,
      responseTime: logData.response_time,
      timestamp: new Date().toLocaleString('zh-CN'),
    };

    // 使用邮件服务发送告警
    const emailService = require('../notification/email.service');
    await emailService.sendEmailByTemplate(
      monitor.alert_template_id,
      monitor.alert_recipients,
      variables
    );

    // 记录告警发送时间
    this.lastAlertTime.set(monitor.id, Date.now());
  }
}
```

### 2. 邮件模版变量数据结构

```javascript
// EmailTemplate.variables 字段的JSON格式
{
  "variables": [
    {
      "name": "monitorName",
      "displayName": "监控名称",
      "description": "接口监控的名称",
      "defaultValue": "未知监控",
      "required": true
    },
    {
      "name": "url",
      "displayName": "接口URL",
      "description": "被监控的接口地址",
      "required": true
    },
    // ... 更多变量
  ]
}
```

### 3. 前端变量编辑器UI示例

```jsx
// VariableEditor.jsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <Label>模版变量</Label>
    <Button size="sm" onClick={handleAddVariable}>
      <Plus className="w-4 h-4 mr-1" />
      添加变量
    </Button>
  </div>

  {variables.map((variable, index) => (
    <Card key={index} className="p-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="变量名 (如: userName)"
          value={variable.name}
          onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
        />
        <Input
          placeholder="显示名称 (如: 用户名)"
          value={variable.displayName}
          onChange={(e) => handleVariableChange(index, 'displayName', e.target.value)}
        />
        <Input
          placeholder="默认值 (可选)"
          value={variable.defaultValue}
          onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Checkbox
            checked={variable.required}
            onCheckedChange={(checked) => handleVariableChange(index, 'required', checked)}
          />
          <Label>必填</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRemoveVariable(index)}
          >
            <Trash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </Card>
  ))}
</div>
```

---

## 数据库迁移SQL

```sql
-- 为接口监控表添加告警相关字段
ALTER TABLE api_monitors
ADD COLUMN alert_enabled BOOLEAN DEFAULT FALSE COMMENT '是否启用告警',
ADD COLUMN alert_template_id UUID NULL COMMENT '告警邮件模版ID',
ADD COLUMN alert_recipients JSON NULL COMMENT '告警接收人列表';

-- 添加外键约束
ALTER TABLE api_monitors
ADD CONSTRAINT fk_api_monitors_template
FOREIGN KEY (alert_template_id)
REFERENCES email_templates(id)
ON DELETE SET NULL;

-- 添加索引
CREATE INDEX idx_api_monitors_alert_enabled ON api_monitors(alert_enabled);
CREATE INDEX idx_api_monitors_alert_template ON api_monitors(alert_template_id);
```

---

## API变更

### 1. 接口监控API

#### 创建/更新接口监控
**请求体新增字段**：
```json
{
  "name": "用户服务健康检查",
  "url": "https://api.example.com/health",
  "method": "GET",
  // ... 其他现有字段 ...
  "alert_enabled": true,
  "alert_template_id": "uuid-of-template",
  "alert_recipients": ["admin@example.com", "ops@example.com"]
}
```

### 2. 告警规则API

#### 创建告警规则新增监控类型
**请求体支持的 metric_type**：
```json
{
  "name": "接口可用率告警",
  "metric_type": "api_monitor",  // 新增类型
  "metric_name": "availability",  // 新增指标：availability, avg_response_time
  "condition": "<",
  "threshold": 95,
  "level": "warning",
  "enabled": true
}
```

---

## 文件清单

### 后端文件
1. **新建迁移文件**
   - `backend/migrations/[timestamp]-add-alert-fields-to-api-monitors.js`

2. **修改文件**
   - `backend/src/models/ApiMonitor.js` - 添加告警字段
   - `backend/src/modules/monitor/api-monitor.service.js` - 添加告警发送逻辑
   - `backend/src/modules/monitor/alert.service.js` - 支持接口监控告警

### 前端文件
1. **修改文件**
   - `frontend/app/(authenticated)/monitor/apis/page.js` - 添加告警配置表单
   - `frontend/app/(authenticated)/monitor/alerts/page.js` - 支持接口监控类型
   - `frontend/app/(authenticated)/setting/email-templates/page.js` - 集成变量编辑器

2. **新建组件**
   - `frontend/components/monitor/EmailTemplateSelector.jsx` - 邮件模版选择器
   - `frontend/components/monitor/AlertRecipientsInput.jsx` - 告警接收人输入
   - `frontend/components/notification/VariableEditor.jsx` - 变量编辑器

3. **可能需要修改的组件**
   - `frontend/components/notification/EmailTemplateFormDialog.jsx` - 集成变量编辑器

---

## 待办事项清单

### 数据库和模型
- [ ] 创建数据库迁移文件，添加告警相关字段
- [ ] 更新 ApiMonitor 模型定义
- [ ] 运行数据库迁移

### 后端开发
- [ ] 修改 api-monitor.service.js，添加告警发送功能
- [ ] 修改 alert.service.js，支持接口监控告警类型
- [ ] 更新 api-monitor.controller.js，支持告警配置参数
- [ ] 添加单元测试

### 前端开发
- [ ] 创建 VariableEditor.jsx 组件
- [ ] 创建 EmailTemplateSelector.jsx 组件
- [ ] 创建 AlertRecipientsInput.jsx 组件
- [ ] 修改接口监控页面，添加告警配置
- [ ] 修改告警管理页面，支持接口监控类型
- [ ] 修改邮件模版页面，集成变量编辑器

### 测试和优化
- [ ] 功能测试
- [ ] 用户体验优化
- [ ] 文档更新

---

## 进度跟踪

| 阶段 | 任务 | 状态 | 备注 |
|------|------|------|------|
| 阶段一 | 数据库迁移 | ⏳ 待开始 | - |
| 阶段二 | 后端服务开发 | ⏳ 待开始 | - |
| 阶段三 | 前端功能开发 | ⏳ 待开始 | - |
| 阶段四 | 前端组件开发 | ⏳ 待开始 | - |
| 阶段五 | 测试和优化 | ⏳ 待开始 | - |

---

## 总结

本次优化将显著提升监控告警系统的功能完整性和用户体验：

1. **接口监控告警集成** - 实现监控与告警的闭环，及时通知异常
2. **多维度告警支持** - 扩展告警能力，覆盖更多监控场景
3. **变量编辑器优化** - 提供友好的UI，简化模版配置

所有改动遵循简单性原则，避免大规模重构，确保系统稳定性。

**最后更新**: 2025-10-21
**文档版本**: 1.0.0
