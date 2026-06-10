DROP TABLE IF EXISTS owl_folders CASCADE;

CREATE TABLE owl_folders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(255) NOT NULL,
    parent_id uuid,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    inherit_permissions boolean DEFAULT true
);

COMMENT ON TABLE owl_folders IS '文件夹表';

COMMENT ON COLUMN owl_folders.id IS '文件夹ID，主键';
COMMENT ON COLUMN owl_folders.name IS '文件夹名称';
COMMENT ON COLUMN owl_folders.parent_id IS '父文件夹ID，顶级文件夹为NULL';
COMMENT ON COLUMN owl_folders.created_by IS '创建者ID';
COMMENT ON COLUMN owl_folders.created_at IS '创建时间';
COMMENT ON COLUMN owl_folders.updated_at IS '更新时间';
COMMENT ON COLUMN owl_folders.deleted_at IS '软删除时间';
COMMENT ON COLUMN owl_folders.inherit_permissions IS '是否继承父文件夹权限，默认为TRUE';

DROP INDEX IF EXISTS idx_owl_folders_created_by CASCADE;
DROP INDEX IF EXISTS idx_owl_folders_name CASCADE;
DROP INDEX IF EXISTS idx_owl_folders_parent_id CASCADE;

CREATE INDEX idx_owl_folders_created_by ON owl_folders (created_by);
CREATE INDEX idx_owl_folders_name ON owl_folders (name);
CREATE INDEX idx_owl_folders_parent_id ON owl_folders (parent_id);
