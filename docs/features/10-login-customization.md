# 登录页面布局自定义 (Login Customization)

## 功能概述

登录页面支持运行时配置，无需重启系统即可切换布局、Logo、背景、系统名称和登录方式。所有配置通过系统全局配置表存储和读取。

## 核心特性

### 1. 布局模式

支持三种布局方案，满足不同的视觉设计需求。

#### Center（默认）

登录卡片居中，支持背景图。

```
┌─────────────────────────────┐
│                             │
│      [Login Card]           │
│      Username: ___          │
│      Password: ___          │
│      [Sign In]              │
│                             │
└─────────────────────────────┘
```

#### Left-image

左 1/3 图片区，右 2/3 表单区。

```
┌──────────────┬──────────────────────┐
│              │  [Login Form]        │
│              │  Username: ___       │
│   Image      │  Password: ___       │
│   Area       │  [Sign In]           │
│              │                      │
└──────────────┴──────────────────────┘
```

#### Right-image

左 2/3 表单区，右 1/3 图片区。

```
┌──────────────────────┬──────────────┐
│  [Login Form]        │              │
│  Username: ___       │              │
│  Password: ___       │   Image      │
│  [Sign In]           │   Area       │
│                      │              │
└──────────────────────┴──────────────┘
```

### 2. 可配置项

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `login_layout` | enum | 布局模式：`center` / `left-image` / `right-image` |
| `login_bg_url` | string | 登录页背景图 URL（支持相对路径自动拼接 API base URL） |
| `logo_url` | string | 顶部 Logo 图片 URL |
| `system_name` | string | 系统名称（标题文字） |
| `login_method` | enum | 登录方式：`password` / `sms` / `both` |
| `registration_enabled` | boolean | 是否显示"立即注册"链接 |
| `show_tech_stack` | boolean | 是否显示技术栈 Badge |

### 3. 登录方式

#### password（用户名密码）

显示用户名/邮箱和密码输入框，支持图形验证码。

#### sms（短信验证码）

显示手机号和验证码输入框，支持倒计时和重新发送。

#### both（用户名密码 + 短信）

显示两个 Tab：
- "密码登录" Tab：用户名密码输入框
- "短信登录" Tab：手机号验证码输入框

用户可在两个 Tab 间切换。

### 4. 管理接口

#### 获取配置

```bash
GET /api/system/config
```

返回所有系统配置，包括登录相关配置：

```json
{
  "code": 0,
  "data": {
    "login_layout": "left-image",
    "login_bg_url": "/images/login-bg.jpg",
    "logo_url": "/images/logo.png",
    "system_name": "OWL Platform",
    "login_method": "both",
    "registration_enabled": true,
    "show_tech_stack": false
  }
}
```

#### 更新配置

```bash
PUT /api/system/config
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "login_layout": "center",
  "system_name": "My System",
  "login_method": "sms"
}
```

### 5. 前端集成

前端登录页在加载时调用 `systemConfigApi.getConfig()` 动态获取配置。

```javascript
// frontend/app/login/page.js
import { systemConfigApi } from '@/lib/api/system/config.api';

export default function LoginPage() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    systemConfigApi.getConfig().then(data => {
      setConfig(data);
      // 根据 config.login_layout 动态渲染布局
    });
  }, []);

  if (!config) return <Loading />;

  return (
    <div className={`login-${config.login_layout}`}>
      {/* 根据 config.login_method 渲染相应的登录表单 */}
      {config.login_method === 'both' && <LoginTabs />}
      {config.login_method === 'password' && <PasswordForm />}
      {config.login_method === 'sms' && <SmsForm />}
    </div>
  );
}
```

### 6. 配置生效

- **即时生效**：配置保存后立即生效，无需重启系统
- **前端缓存**：前端可缓存配置以提升性能，定期（如 5 分钟）刷新一次

## 使用场景

- **品牌定制**：不同子公司/分支机构使用各自的 Logo 和系统名称
- **登录方式灵活调整**：根据公司认证能力动态调整登录方式
- **视觉设计迭代**：设计师可直接更新背景图和布局，无需开发介入

## 安全建议

- 背景图和 Logo 应托管在自有服务器或 CDN，避免依赖第三方服务
- 不要在登录页面暴露系统过多信息（如版本号、API 端点）
- 登录失败提示应通用，不区分用户是否存在
