DROP TABLE IF EXISTS owl_notification_settings CASCADE;

CREATE TABLE owl_notification_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    email_enabled boolean DEFAULT true,
    push_enabled boolean DEFAULT true,
    system_notification boolean DEFAULT true,
    warning_notification boolean DEFAULT true,
    error_notification boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_notification_settings IS '用户通知配置表';

COMMENT ON COLUMN owl_notification_settings.id IS '通知配置ID，主键';
COMMENT ON COLUMN owl_notification_settings.user_id IS '用户ID（唯一）';
COMMENT ON COLUMN owl_notification_settings.email_enabled IS '是否启用邮件通知';
COMMENT ON COLUMN owl_notification_settings.push_enabled IS '是否启用推送通知';
COMMENT ON COLUMN owl_notification_settings.system_notification IS '是否接收系统通知';
COMMENT ON COLUMN owl_notification_settings.warning_notification IS '是否接收警告通知';
COMMENT ON COLUMN owl_notification_settings.error_notification IS '是否接收错误通知';
COMMENT ON COLUMN owl_notification_settings.created_at IS '创建时间';
COMMENT ON COLUMN owl_notification_settings.updated_at IS '更新时间';
COMMENT ON COLUMN owl_notification_settings.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_notification_settings_user_id CASCADE;

CREATE INDEX idx_owl_notification_settings_user_id ON owl_notification_settings (user_id);
