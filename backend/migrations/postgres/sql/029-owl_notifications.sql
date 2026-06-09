DROP TABLE IF EXISTS owl_notifications CASCADE;

CREATE TABLE owl_notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    type character varying(50) DEFAULT 'info'::character varying,
    link character varying(500),
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE owl_notifications IS '站内通知表';

COMMENT ON COLUMN owl_notifications.id IS '通知ID，主键';
COMMENT ON COLUMN owl_notifications.user_id IS '用户ID';
COMMENT ON COLUMN owl_notifications.title IS '通知标题';
COMMENT ON COLUMN owl_notifications.content IS '通知内容';
COMMENT ON COLUMN owl_notifications.type IS '通知类型：info, system, warning, error, success';
COMMENT ON COLUMN owl_notifications.link IS '点击跳转链接';
COMMENT ON COLUMN owl_notifications.is_read IS '是否已读';
COMMENT ON COLUMN owl_notifications.read_at IS '阅读时间';
COMMENT ON COLUMN owl_notifications.created_at IS '创建时间';

DROP INDEX IF EXISTS idx_owl_notifications_created_at CASCADE;
DROP INDEX IF EXISTS idx_owl_notifications_is_read CASCADE;
DROP INDEX IF EXISTS idx_owl_notifications_type CASCADE;
DROP INDEX IF EXISTS idx_owl_notifications_user_id CASCADE;
DROP INDEX IF EXISTS idx_owl_notifications_user_read CASCADE;

CREATE INDEX idx_owl_notifications_created_at ON owl_notifications (created_at);
CREATE INDEX idx_owl_notifications_is_read ON owl_notifications (is_read);
CREATE INDEX idx_owl_notifications_type ON owl_notifications (type);
CREATE INDEX idx_owl_notifications_user_id ON owl_notifications (user_id);
CREATE INDEX idx_owl_notifications_user_read ON owl_notifications (is_read, user_id);
