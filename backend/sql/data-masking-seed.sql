-- ============================================
-- 敏感字段配置初始化数据
-- ============================================

INSERT INTO owl_sensitive_fields (table_name, field_name, mask_type, description, is_active) VALUES
-- 用户表敏感字段
('owl_users', 'phone', 'phone', '用户手机号', true),
('owl_users', 'email', 'email', '用户邮箱', true),
('owl_users', 'id_card', 'id_card', '身份证号', true)
ON CONFLICT (table_name, field_name) DO NOTHING;
