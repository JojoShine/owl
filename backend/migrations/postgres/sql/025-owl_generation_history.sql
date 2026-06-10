DROP TABLE IF EXISTS owl_generation_history CASCADE;

CREATE TABLE owl_generation_history (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id uuid,
    table_name character varying(100),
    module_name character varying(100),
    action character varying(20),
    files_generated json,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    success boolean DEFAULT true,
    error_message text,
    operation_type character varying(20),
    generated_by uuid
);

COMMENT ON TABLE owl_generation_history IS '代码生成器-生成历史表';

COMMENT ON COLUMN owl_generation_history.id IS '历史记录ID，主键';
COMMENT ON COLUMN owl_generation_history.module_id IS '模块ID';
COMMENT ON COLUMN owl_generation_history.table_name IS '数据库表名';
COMMENT ON COLUMN owl_generation_history.module_name IS '模块名称';
COMMENT ON COLUMN owl_generation_history.action IS '操作类型: create/update/delete (已废弃，使用operation_type)';
COMMENT ON COLUMN owl_generation_history.files_generated IS '生成的文件列表';
COMMENT ON COLUMN owl_generation_history.created_by IS '操作人';
COMMENT ON COLUMN owl_generation_history.created_at IS '创建时间';
COMMENT ON COLUMN owl_generation_history.updated_at IS '更新时间';
COMMENT ON COLUMN owl_generation_history.deleted_at IS '软删除时间';
COMMENT ON COLUMN owl_generation_history.success IS '是否成功';
COMMENT ON COLUMN owl_generation_history.error_message IS '错误信息';
COMMENT ON COLUMN owl_generation_history.operation_type IS '操作类型: create/update/delete';
COMMENT ON COLUMN owl_generation_history.generated_by IS '操作人';

DROP INDEX IF EXISTS idx_owl_generation_history_created_at CASCADE;
DROP INDEX IF EXISTS idx_owl_generation_history_created_by CASCADE;
DROP INDEX IF EXISTS idx_owl_generation_history_module_id CASCADE;

CREATE INDEX idx_owl_generation_history_created_at ON owl_generation_history (created_at);
CREATE INDEX idx_owl_generation_history_created_by ON owl_generation_history (created_by);
CREATE INDEX idx_owl_generation_history_module_id ON owl_generation_history (module_id);
