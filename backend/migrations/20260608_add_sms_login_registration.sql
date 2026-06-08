-- ============================================
-- 短信登录注册功能数据库迁移脚本 (PostgreSQL)
-- 执行日期: 2026-06-08
-- 说明: 添加登录和注册方式配置字段
-- ============================================

-- 1. 为系统配置表添加登录和注册方式字段
DO $$ 
BEGIN
    -- 添加 login_method 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'owl_system_configs' 
        AND column_name = 'login_method'
    ) THEN
        ALTER TABLE owl_system_configs 
        ADD COLUMN login_method VARCHAR(10) DEFAULT 'both';
        COMMENT ON COLUMN owl_system_configs.login_method IS '登录方式：password账密|sms短信|both两者都支持';
    END IF;

    -- 添加 registration_method 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'owl_system_configs' 
        AND column_name = 'registration_method'
    ) THEN
        ALTER TABLE owl_system_configs 
        ADD COLUMN registration_method VARCHAR(10) DEFAULT 'both';
        COMMENT ON COLUMN owl_system_configs.registration_method IS '注册方式：password账密|sms短信|both两者都支持';
    END IF;
END $$;

-- 2. 验证字段是否添加成功
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'owl_system_configs' 
AND column_name IN ('login_method', 'registration_method')
ORDER BY ordinal_position;

-- 3. 查看当前系统配置（可选）
SELECT id, system_name, login_method, registration_method, created_at 
FROM owl_system_configs 
LIMIT 1;

-- ============================================
-- 执行完成后，请检查以下内容：
-- 1. login_method 字段已添加，默认值为 'both'
-- 2. registration_method 字段已添加，默认值为 'both'
-- 3. 现有配置的这两个字段应该自动设置为 'both'
-- ============================================
