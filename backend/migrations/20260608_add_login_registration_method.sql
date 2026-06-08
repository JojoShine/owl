-- 添加登录和注册方式配置字段
ALTER TABLE owl_system_configs 
ADD COLUMN IF NOT EXISTS login_method VARCHAR(10) DEFAULT 'both' COMMENT '登录方式：password账密|sms短信|both两者都支持',
ADD COLUMN IF NOT EXISTS registration_method VARCHAR(10) DEFAULT 'both' COMMENT '注册方式：password账密|sms短信|both两者都支持';
