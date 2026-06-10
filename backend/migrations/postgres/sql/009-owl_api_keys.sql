DROP TABLE IF EXISTS owl_api_keys CASCADE;

CREATE TABLE owl_api_keys (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    interface_id uuid,
    app_name character varying(255) NOT NULL,
    api_key character varying(255) NOT NULL,
    api_secret character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    expires_at timestamp with time zone NOT NULL,
    last_used_at timestamp without time zone,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_api_keys IS 'API密钥表';

COMMENT ON COLUMN owl_api_keys.id IS '密钥ID，主键';
COMMENT ON COLUMN owl_api_keys.interface_id IS '关联的接口ID';
COMMENT ON COLUMN owl_api_keys.app_name IS '应用名称';
COMMENT ON COLUMN owl_api_keys.api_key IS 'API密钥';
COMMENT ON COLUMN owl_api_keys.api_secret IS 'API密钥加密值';
COMMENT ON COLUMN owl_api_keys.status IS '密钥状态';
COMMENT ON COLUMN owl_api_keys.expires_at IS '密钥过期时间（3天后）';
COMMENT ON COLUMN owl_api_keys.last_used_at IS '最后使用时间';
COMMENT ON COLUMN owl_api_keys.created_by IS '创建者ID';
COMMENT ON COLUMN owl_api_keys.created_at IS '创建时间';
COMMENT ON COLUMN owl_api_keys.updated_at IS '更新时间';
COMMENT ON COLUMN owl_api_keys.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_api_keys_expires_at CASCADE;
DROP INDEX IF EXISTS idx_owl_api_keys_interface_id CASCADE;

CREATE INDEX idx_owl_api_keys_api_key ON owl_api_keys (api_key);
CREATE INDEX idx_owl_api_keys_expires_at ON owl_api_keys (expires_at);
CREATE INDEX idx_owl_api_keys_interface_id ON owl_api_keys (interface_id);
