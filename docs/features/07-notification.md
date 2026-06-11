# 邮箱通知服务 (Notification Service)

## 功能概述

邮箱通知服务提供多层次的消息推送能力，包括站内通知、邮件发送和 WebSocket 实时推送，支持模板化和用户偏好设置。

## 核心模块

### 1. 站内通知（In-app Notification）

用户登录系统后在消息中心查看的通知。

#### 通知类型

| 类型 | 说明 |
|------|------|
| `info` | 信息提示 |
| `system` | 系统通知 |
| `warning` | 警告信息 |
| `error` | 错误提示 |
| `success` | 成功提示 |

#### 接口

| 接口 | 说明 |
|------|------|
| `GET /api/notifications` | 获取当前用户的通知列表（分页） |
| `GET /api/notifications/unread-count` | 获取未读通知数 |
| `PUT /api/notifications/:id/read` | 标记单条通知为已读 |
| `PUT /api/notifications/read-all` | 标记所有通知为已读 |
| `DELETE /api/notifications/:id` | 删除单条通知 |
| `DELETE /api/notifications/clear-read` | 清空所有已读通知 |

### 2. WebSocket 实时推送

基于 Socket.io，用户登录后自动建立连接，支持多端登录（同一用户在不同设备/浏览器分别保持连接）。

#### 连接握手

```javascript
// 前端
const socket = io('http://localhost:3001', {
  auth: {
    token: jwtToken  // JWT Token
  }
});

// 监听推送
socket.on('notification', (data) => {
  console.log('收到推送通知:', data);
});
```

#### 心跳配置

- `pingInterval`: 25 秒 — 服务器向客户端发送 ping
- `pingTimeout`: 60 秒 — 客户端 60 秒内必须响应 pong，否则连接断开

#### 接口

| 事件 | 说明 |
|------|------|
| `notification` | 推送单条通知给用户 |
| `broadcast` | 广播通知给所有在线用户 |

### 3. 邮件服务

支持 SMTP 发送、模板渲染、自动重试。

#### 配置

邮件服务配置存储在环境变量中：

```bash
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=noreply@example.com
MAIL_PASS=your-password
MAIL_FROM="系统通知 <noreply@example.com>"
```

#### 发送方式

**直接发送**

```javascript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: '账户更新通知',
  text: '您的账户信息已更新',
  html: '<p>您的账户信息已更新</p>'
});
```

**使用模板发送**

```javascript
await emailService.sendEmailWithTemplate({
  to: 'user@example.com',
  templateName: 'password-reset',
  variables: { username: 'John', resetLink: 'https://...' }
});
```

#### 重试机制

失败自动重试，最多 3 次，递增延迟：
- 第1次失败：延迟 2 秒重试
- 第2次失败：延迟 4 秒重试
- 第3次失败：延迟 6 秒重试
- 全部失败：记录错误日志

### 4. 邮件模板

使用 Handlebars 模板引擎，支持变量替换。

#### 模板语法限制

**允许**：
- 基础变量替换：`{{title}}`、`{{content}}`
- HTML 标签、样式表、链接

**禁止**：
- 条件语句：`{{#if condition}}`
- 循环语句：`{{#each items}}`
- 自定义 Helper
- 其他复杂语法

#### 模板示例

```html
<h1>{{title}}</h1>
<p>亲爱的用户，</p>
<p>{{content}}</p>
<a href="https://example.com">立即查看</a>
```

#### 管理接口

| 接口 | 说明 |
|------|------|
| `GET /api/system/email-templates` | 邮件模板列表 |
| `POST /api/system/email-templates` | 创建模板 |
| `PUT /api/system/email-templates/:id` | 更新模板 |
| `DELETE /api/system/email-templates/:id` | 删除模板 |

### 5. 用户通知偏好

用户可独立控制各类通知的开启/关闭。

#### 偏好设置字段

| 字段 | 说明 |
|------|------|
| `email_enabled` | 是否接收邮件通知 |
| `push_enabled` | 是否接收 WebSocket 推送 |
| `system_notification` | 是否接收系统通知 |
| `warning_notification` | 是否接收警告通知 |
| `error_notification` | 是否接收错误通知 |

#### 接口

| 接口 | 说明 |
|------|------|
| `GET /api/notification-settings` | 获取当前用户偏好 |
| `PUT /api/notification-settings` | 更新偏好设置 |

## 使用流程

1. **创建模板**：在系统后台配置邮件模板
2. **发送通知**：业务模块调用邮件服务或创建站内通知
3. **用户偏好**：用户在设置中选择接收方式
4. **多渠道推送**：系统根据用户偏好同时推送到邮件、WebSocket、站内消息
5. **查看记录**：用户在消息中心查看历史通知，邮件收件箱查看邮件
