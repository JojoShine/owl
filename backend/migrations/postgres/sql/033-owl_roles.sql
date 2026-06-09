DROP TABLE IF EXISTS owl_roles CASCADE;

CREATE TABLE owl_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(50) NOT NULL,
    code character varying(50) NOT NULL,
    description character varying(255),
    status enum_owl_roles_status DEFAULT 'active'::enum_owl_roles_status,
    sort integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_roles IS '角色表';

COMMENT ON COLUMN owl_roles.id IS '角色ID，主键';
COMMENT ON COLUMN owl_roles.name IS '角色名称，唯一索引';
COMMENT ON COLUMN owl_roles.code IS '角色代码，唯一索引，用于权限控制';
COMMENT ON COLUMN owl_roles.description IS '角色描述';
COMMENT ON COLUMN owl_roles.status IS '角色状态：active-启用，inactive-禁用';
COMMENT ON COLUMN owl_roles.sort IS '排序值，数值越小越靠前';
COMMENT ON COLUMN owl_roles.created_at IS '创建时间';
COMMENT ON COLUMN owl_roles.updated_at IS '更新时间';
COMMENT ON COLUMN owl_roles.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_roles_code CASCADE;
DROP INDEX IF EXISTS idx_owl_roles_status CASCADE;
DROP INDEX IF EXISTS owl_roles_name_key1 CASCADE;
DROP INDEX IF EXISTS owl_roles_name_key2 CASCADE;
DROP INDEX IF EXISTS owl_roles_name_key3 CASCADE;

CREATE INDEX idx_owl_roles_code ON owl_roles (code);
CREATE INDEX idx_owl_roles_status ON owl_roles (status);
