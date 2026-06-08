-- ============================================
-- 短信验证码登录功能 - 数据库迁移脚本
-- 执行时间: 2026-06-06
-- ============================================

-- 1. 创建用户第三方账号绑定表
CREATE TABLE IF NOT EXISTS owl_user_third_party_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES owl_users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'sms',
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    verified BOOLEAN DEFAULT true,
    bind_confirmed BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE owl_user_third_party_accounts IS '用户第三方账号绑定表';
COMMENT ON COLUMN owl_user_third_party_accounts.id IS '绑定ID，主键';
COMMENT ON COLUMN owl_user_third_party_accounts.user_id IS '用户ID';
COMMENT ON COLUMN owl_user_third_party_accounts.provider IS '提供商: sms-短信';
COMMENT ON COLUMN owl_user_third_party_accounts.phone_number IS '手机号';
COMMENT ON COLUMN owl_user_third_party_accounts.verified IS '是否已验证';
COMMENT ON COLUMN owl_user_third_party_accounts.bind_confirmed IS '绑定是否已确认';
COMMENT ON COLUMN owl_user_third_party_accounts.last_login_at IS '最后登录时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_owl_user_third_party_phone ON owl_user_third_party_accounts(phone_number);
CREATE INDEX IF NOT EXISTS idx_owl_user_third_party_user ON owl_user_third_party_accounts(user_id);

-- 2. 修改用户表 - 使password字段可为空
ALTER TABLE owl_users ALTER COLUMN password DROP NOT NULL;
COMMENT ON COLUMN owl_users.password IS '密码，bcrypt加密存储（可为空，支持无密码登录）';

-- 3. 添加默认登录方式字段（可选，暂时不启用）
-- ALTER TABLE owl_users ADD COLUMN IF NOT EXISTS default_login_method VARCHAR(20) DEFAULT 'password';
-- COMMENT ON COLUMN owl_users.default_login_method IS '默认登录方式: sms/password';
