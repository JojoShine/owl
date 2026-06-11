DROP TABLE IF EXISTS test_generate CASCADE;

CREATE TABLE test_generate (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title character varying(100) NOT NULL,
    content text,
    status character varying(20) NOT NULL DEFAULT 'draft',
    priority integer DEFAULT 0,
    amount numeric(10, 2),
    is_published boolean DEFAULT false,
    published_at timestamp with time zone,
    tags character varying(255),
    remark text,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE test_generate IS '代码生成测试表';
COMMENT ON COLUMN test_generate.id IS '主键ID';
COMMENT ON COLUMN test_generate.title IS '标题';
COMMENT ON COLUMN test_generate.content IS '内容';
COMMENT ON COLUMN test_generate.status IS '状态：draft=草稿，published=已发布，archived=已归档';
COMMENT ON COLUMN test_generate.priority IS '优先级：0=普通，1=重要，2=紧急';
COMMENT ON COLUMN test_generate.amount IS '金额';
COMMENT ON COLUMN test_generate.is_published IS '是否已发布';
COMMENT ON COLUMN test_generate.published_at IS '发布时间';
COMMENT ON COLUMN test_generate.tags IS '标签，逗号分隔';
COMMENT ON COLUMN test_generate.remark IS '备注';
COMMENT ON COLUMN test_generate.created_by IS '创建人ID';
COMMENT ON COLUMN test_generate.updated_by IS '更新人ID';
COMMENT ON COLUMN test_generate.deleted_by IS '删除人ID';
COMMENT ON COLUMN test_generate.created_at IS '创建时间';
COMMENT ON COLUMN test_generate.updated_at IS '更新时间';
COMMENT ON COLUMN test_generate.deleted_at IS '软删除时间';

CREATE INDEX idx_test_generate_status ON test_generate (status);
CREATE INDEX idx_test_generate_is_published ON test_generate (is_published);
