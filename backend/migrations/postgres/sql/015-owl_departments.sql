DROP TABLE IF EXISTS owl_departments CASCADE;

CREATE TABLE owl_departments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id uuid,
    name character varying(100) NOT NULL,
    code character varying(50),
    leader_id uuid,
    description text,
    sort integer DEFAULT 0,
    status enum_owl_departments_status DEFAULT 'active'::enum_owl_departments_status,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_departments IS '部门表';

COMMENT ON COLUMN owl_departments.id IS '部门ID，主键';
COMMENT ON COLUMN owl_departments.parent_id IS '父部门ID，顶级部门为NULL';
COMMENT ON COLUMN owl_departments.name IS '部门名称';
COMMENT ON COLUMN owl_departments.code IS '部门代码，唯一标识';
COMMENT ON COLUMN owl_departments.leader_id IS '部门负责人ID';
COMMENT ON COLUMN owl_departments.description IS '部门描述';
COMMENT ON COLUMN owl_departments.sort IS '排序值，数值越小越靠前';
COMMENT ON COLUMN owl_departments.status IS '部门状态：active-启用，inactive-禁用';
COMMENT ON COLUMN owl_departments.created_at IS '创建时间';
COMMENT ON COLUMN owl_departments.updated_at IS '更新时间';
COMMENT ON COLUMN owl_departments.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_departments_code CASCADE;
DROP INDEX IF EXISTS idx_owl_departments_leader_id CASCADE;
DROP INDEX IF EXISTS idx_owl_departments_parent_id CASCADE;
DROP INDEX IF EXISTS idx_owl_departments_status CASCADE;

CREATE INDEX idx_owl_departments_code ON owl_departments (code);
CREATE INDEX idx_owl_departments_leader_id ON owl_departments (leader_id);
CREATE INDEX idx_owl_departments_parent_id ON owl_departments (parent_id);
CREATE INDEX idx_owl_departments_status ON owl_departments (status);
