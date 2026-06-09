DROP TABLE IF EXISTS owl_permissions CASCADE;

CREATE TABLE owl_permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(50) NOT NULL,
    code character varying(50) NOT NULL,
    resource character varying(50) NOT NULL,
    action character varying(50) NOT NULL,
    description character varying(255),
    category character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE owl_permissions IS '权限表';

COMMENT ON COLUMN owl_permissions.id IS '权限ID，主键';
COMMENT ON COLUMN owl_permissions.name IS '权限名称';
COMMENT ON COLUMN owl_permissions.code IS '权限代码，唯一索引，格式：resource:action';
COMMENT ON COLUMN owl_permissions.resource IS '资源名称，如：user, role, menu';
COMMENT ON COLUMN owl_permissions.action IS '操作类型：create-创建，read-读取，update-更新，delete-删除';
COMMENT ON COLUMN owl_permissions.description IS '权限描述';
COMMENT ON COLUMN owl_permissions.category IS '权限分类，如：用户管理、角色管理';
COMMENT ON COLUMN owl_permissions.created_at IS '创建时间';
COMMENT ON COLUMN owl_permissions.updated_at IS '更新时间';

DROP INDEX IF EXISTS idx_owl_permissions_code CASCADE;
DROP INDEX IF EXISTS idx_owl_permissions_resource CASCADE;

CREATE INDEX idx_owl_permissions_code ON owl_permissions (code);
CREATE INDEX idx_owl_permissions_resource ON owl_permissions (resource);
