DROP TABLE IF EXISTS owl_files CASCADE;

CREATE TABLE owl_files (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    filename character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    mime_type character varying(100),
    size bigint,
    path character varying(500) NOT NULL,
    bucket character varying(100) NOT NULL,
    folder_id uuid,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    inherit_permissions boolean DEFAULT true
);

COMMENT ON TABLE owl_files IS '文件表';

COMMENT ON COLUMN owl_files.id IS '文件ID，主键';
COMMENT ON COLUMN owl_files.filename IS '存储的文件名（UUID+扩展名）';
COMMENT ON COLUMN owl_files.original_name IS '原始文件名';
COMMENT ON COLUMN owl_files.mime_type IS '文件MIME类型';
COMMENT ON COLUMN owl_files.size IS '文件大小（字节）';
COMMENT ON COLUMN owl_files.path IS 'Minio中的文件路径';
COMMENT ON COLUMN owl_files.bucket IS 'Minio bucket名称';
COMMENT ON COLUMN owl_files.folder_id IS '所属文件夹ID，NULL表示根目录';
COMMENT ON COLUMN owl_files.uploaded_by IS '上传者ID';
COMMENT ON COLUMN owl_files.created_at IS '创建时间';
COMMENT ON COLUMN owl_files.updated_at IS '更新时间';
COMMENT ON COLUMN owl_files.deleted_at IS '软删除时间';
COMMENT ON COLUMN owl_files.inherit_permissions IS '是否继承所在文件夹权限，默认为TRUE';

DROP INDEX IF EXISTS idx_owl_files_created_at CASCADE;
DROP INDEX IF EXISTS idx_owl_files_folder_id CASCADE;
DROP INDEX IF EXISTS idx_owl_files_mime_type CASCADE;
DROP INDEX IF EXISTS idx_owl_files_original_name CASCADE;
DROP INDEX IF EXISTS idx_owl_files_uploaded_by CASCADE;

CREATE INDEX idx_owl_files_created_at ON owl_files (created_at);
CREATE INDEX idx_owl_files_folder_id ON owl_files (folder_id);
CREATE INDEX idx_owl_files_mime_type ON owl_files (mime_type);
CREATE INDEX idx_owl_files_original_name ON owl_files (original_name);
CREATE INDEX idx_owl_files_uploaded_by ON owl_files (uploaded_by);
