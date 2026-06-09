DROP TABLE IF EXISTS owl_file_permissions CASCADE;

CREATE TABLE owl_file_permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_type character varying(20) NOT NULL,
    resource_id uuid NOT NULL,
    user_id uuid,
    role_id uuid,
    permission character varying(20) NOT NULL,
    granted_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE owl_file_permissions IS '文件和文件夹权限表';

COMMENT ON COLUMN owl_file_permissions.id IS '权限ID，主键';
COMMENT ON COLUMN owl_file_permissions.resource_type IS '资源类型：file(文件) 或 folder(文件夹)';
COMMENT ON COLUMN owl_file_permissions.resource_id IS '资源ID（文件ID或文件夹ID）';
COMMENT ON COLUMN owl_file_permissions.user_id IS '用户ID，NULL表示这是角色权限';
COMMENT ON COLUMN owl_file_permissions.role_id IS '角色ID，NULL表示这是用户权限';
COMMENT ON COLUMN owl_file_permissions.permission IS '权限类型：read(读)、write(写)、delete(删除)、admin(管理)';
COMMENT ON COLUMN owl_file_permissions.granted_by IS '授权人ID';
COMMENT ON COLUMN owl_file_permissions.created_at IS '创建时间';
COMMENT ON COLUMN owl_file_permissions.updated_at IS '更新时间';

DROP INDEX IF EXISTS idx_owl_file_permissions_granted_by CASCADE;
DROP INDEX IF EXISTS idx_owl_file_permissions_resource CASCADE;
DROP INDEX IF EXISTS idx_owl_file_permissions_role CASCADE;
DROP INDEX IF EXISTS idx_owl_file_permissions_user CASCADE;

CREATE INDEX idx_owl_file_permissions_granted_by ON owl_file_permissions (granted_by);
CREATE INDEX idx_owl_file_permissions_resource ON owl_file_permissions (resource_type, resource_id);
CREATE INDEX idx_owl_file_permissions_role ON owl_file_permissions (role_id);
CREATE INDEX idx_owl_file_permissions_user ON owl_file_permissions (user_id);
