DROP TABLE IF EXISTS owl_attachment CASCADE;

CREATE TABLE owl_attachment (
    id character varying(36) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size bigint NOT NULL,
    file_type character varying(50) NOT NULL,
    file_ext character varying(20),
    relation_id character varying(36) NOT NULL,
    relation_type character varying(20) NOT NULL,
    attachment_category character varying(50) NOT NULL,
    created_by character varying(36) NOT NULL,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp with time zone,
    deleted_by character varying(36),
    created_at timestamp with time zone NOT NULL
);

COMMENT ON COLUMN owl_attachment.file_name IS '文件名';
COMMENT ON COLUMN owl_attachment.file_path IS '文件路径';
COMMENT ON COLUMN owl_attachment.file_size IS '文件大小（字节）';
COMMENT ON COLUMN owl_attachment.file_type IS '文件MIME类型';
COMMENT ON COLUMN owl_attachment.file_ext IS '文件扩展名';
COMMENT ON COLUMN owl_attachment.relation_id IS '关联记录ID';
COMMENT ON COLUMN owl_attachment.relation_type IS '关联类型';
COMMENT ON COLUMN owl_attachment.attachment_category IS '附件分类';
COMMENT ON COLUMN owl_attachment.created_by IS '创建人ID';
COMMENT ON COLUMN owl_attachment.is_deleted IS '是否删除';
COMMENT ON COLUMN owl_attachment.deleted_at IS '删除时间';
COMMENT ON COLUMN owl_attachment.deleted_by IS '删除人ID';
