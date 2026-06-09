DROP TABLE IF EXISTS owl_user_roles CASCADE;

CREATE TABLE owl_user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE owl_user_roles IS '用户角色关联表';

COMMENT ON COLUMN owl_user_roles.id IS '关联ID，主键';
COMMENT ON COLUMN owl_user_roles.user_id IS '用户ID，外键关联users表';
COMMENT ON COLUMN owl_user_roles.role_id IS '角色ID，外键关联roles表';
COMMENT ON COLUMN owl_user_roles.created_at IS '创建时间';

DROP INDEX IF EXISTS idx_owl_user_roles_role_id CASCADE;
DROP INDEX IF EXISTS idx_owl_user_roles_user_id CASCADE;
DROP INDEX IF EXISTS owl_user_roles_user_id_role_id_unique CASCADE;

CREATE INDEX idx_owl_user_roles_role_id ON owl_user_roles (role_id);
CREATE INDEX idx_owl_user_roles_user_id ON owl_user_roles (user_id);
