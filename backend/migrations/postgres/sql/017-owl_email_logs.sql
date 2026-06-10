DROP TABLE IF EXISTS owl_email_logs CASCADE;

CREATE TABLE owl_email_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    content text,
    template_name character varying(100),
    status character varying(20) DEFAULT 'pending'::character varying,
    error_message text,
    retry_count integer DEFAULT 0,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_email_logs IS '邮件发送记录表';

COMMENT ON COLUMN owl_email_logs.id IS '邮件记录ID，主键';
COMMENT ON COLUMN owl_email_logs.to_email IS '收件人邮箱';
COMMENT ON COLUMN owl_email_logs.subject IS '邮件主题';
COMMENT ON COLUMN owl_email_logs.content IS '邮件内容';
COMMENT ON COLUMN owl_email_logs.template_name IS '使用的模板名称';
COMMENT ON COLUMN owl_email_logs.status IS '发送状态：pending, sent, failed';
COMMENT ON COLUMN owl_email_logs.error_message IS '错误信息';
COMMENT ON COLUMN owl_email_logs.retry_count IS '重试次数';
COMMENT ON COLUMN owl_email_logs.sent_at IS '发送时间';
COMMENT ON COLUMN owl_email_logs.created_at IS '创建时间';
COMMENT ON COLUMN owl_email_logs.updated_at IS '更新时间';
COMMENT ON COLUMN owl_email_logs.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_email_logs_created_at CASCADE;
DROP INDEX IF EXISTS idx_owl_email_logs_status CASCADE;
DROP INDEX IF EXISTS idx_owl_email_logs_template_name CASCADE;
DROP INDEX IF EXISTS idx_owl_email_logs_to_email CASCADE;

CREATE INDEX idx_owl_email_logs_created_at ON owl_email_logs (created_at);
CREATE INDEX idx_owl_email_logs_status ON owl_email_logs (status);
CREATE INDEX idx_owl_email_logs_template_name ON owl_email_logs (template_name);
CREATE INDEX idx_owl_email_logs_to_email ON owl_email_logs (to_email);
