DROP TABLE IF EXISTS owl_file_shares CASCADE;

CREATE TABLE owl_file_shares (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    file_id uuid NOT NULL,
    share_code character varying(100) NOT NULL,
    expires_at timestamp with time zone,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_file_shares IS '文件分享表';

COMMENT ON COLUMN owl_file_shares.id IS '分享ID，主键';
COMMENT ON COLUMN owl_file_shares.file_id IS '文件ID';
COMMENT ON COLUMN owl_file_shares.share_code IS '分享码，唯一标识';
COMMENT ON COLUMN owl_file_shares.expires_at IS '过期时间，NULL表示永不过期';
COMMENT ON COLUMN owl_file_shares.created_by IS '创建者ID';
COMMENT ON COLUMN owl_file_shares.created_at IS '创建时间';
COMMENT ON COLUMN owl_file_shares.updated_at IS '更新时间';
COMMENT ON COLUMN owl_file_shares.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_file_shares_created_by CASCADE;
DROP INDEX IF EXISTS idx_owl_file_shares_expires_at CASCADE;
DROP INDEX IF EXISTS idx_owl_file_shares_file_id CASCADE;
DROP INDEX IF EXISTS idx_owl_file_shares_share_code CASCADE;

CREATE INDEX idx_owl_file_shares_created_by ON owl_file_shares (created_by);
CREATE INDEX idx_owl_file_shares_expires_at ON owl_file_shares (expires_at);
CREATE INDEX idx_owl_file_shares_file_id ON owl_file_shares (file_id);
CREATE INDEX idx_owl_file_shares_share_code ON owl_file_shares (share_code);
