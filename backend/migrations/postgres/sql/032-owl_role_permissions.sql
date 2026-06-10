DROP TABLE IF EXISTS owl_role_permissions CASCADE;

CREATE TABLE owl_role_permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_role_permissions IS '角色权限关联表';

COMMENT ON COLUMN owl_role_permissions.id IS '关联ID，主键';
COMMENT ON COLUMN owl_role_permissions.role_id IS '角色ID，外键关联roles表';
COMMENT ON COLUMN owl_role_permissions.permission_id IS '权限ID，外键关联permissions表';
COMMENT ON COLUMN owl_role_permissions.created_at IS '创建时间';
COMMENT ON COLUMN owl_role_permissions.updated_at IS '更新时间';
COMMENT ON COLUMN owl_role_permissions.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_role_permissions_permission_id CASCADE;
DROP INDEX IF EXISTS idx_owl_role_permissions_role_id CASCADE;
DROP INDEX IF EXISTS owl_role_permissions_role_id_permission_id_unique CASCADE;

CREATE INDEX idx_owl_role_permissions_permission_id ON owl_role_permissions (permission_id);
CREATE INDEX idx_owl_role_permissions_role_id ON owl_role_permissions (role_id);
