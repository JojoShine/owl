DROP TABLE IF EXISTS owl_user_sessions CASCADE;

CREATE TABLE owl_user_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    session_token character varying(255) NOT NULL,
    device_info jsonb NOT NULL,
    location_info jsonb NOT NULL,
    login_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    kicked_at timestamp with time zone,
    status enum_owl_user_sessions_status DEFAULT 'active'::enum_owl_user_sessions_status,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE owl_user_sessions IS '用户会话表 - 用于单设备登录控制';

COMMENT ON COLUMN owl_user_sessions.id IS '会话ID，主键';
COMMENT ON COLUMN owl_user_sessions.user_id IS '用户ID';
COMMENT ON COLUMN owl_user_sessions.session_token IS 'JWT token的SHA256 hash，唯一索引';
COMMENT ON COLUMN owl_user_sessions.device_info IS '设备信息JSON：{type, os, browser, device_name}';
COMMENT ON COLUMN owl_user_sessions.location_info IS '位置信息JSON：{ip, country, city, region}';
COMMENT ON COLUMN owl_user_sessions.login_at IS '登录时间';
COMMENT ON COLUMN owl_user_sessions.last_active_at IS '最后活跃时间';
COMMENT ON COLUMN owl_user_sessions.kicked_at IS '被踢出时间';
COMMENT ON COLUMN owl_user_sessions.status IS '会话状态：active-活跃，kicked-已踢出，expired-已过期';
COMMENT ON COLUMN owl_user_sessions.created_at IS '创建时间';
COMMENT ON COLUMN owl_user_sessions.updated_at IS '更新时间';

DROP INDEX IF EXISTS idx_owl_user_sessions_token CASCADE;
DROP INDEX IF EXISTS idx_owl_user_sessions_user_id_status CASCADE;

CREATE INDEX idx_owl_user_sessions_token ON owl_user_sessions (session_token);
CREATE INDEX idx_owl_user_sessions_user_id_status ON owl_user_sessions (user_id, status);
