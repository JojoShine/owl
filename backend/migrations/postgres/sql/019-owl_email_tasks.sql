DROP TABLE IF EXISTS owl_email_tasks CASCADE;

CREATE TABLE owl_email_tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(100) NOT NULL,
    description text,
    template_id uuid NOT NULL,
    recipients text NOT NULL,
    frequency character varying(50) NOT NULL DEFAULT 'once'::character varying,
    enabled boolean DEFAULT true,
    template_variables json DEFAULT '{}'::json,
    last_executed_at timestamp with time zone,
    next_execution_at timestamp with time zone,
    execution_count integer DEFAULT 0,
    last_status character varying(50) DEFAULT 'pending'::character varying,
    last_error text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_email_tasks IS '邮件发送任务表';

COMMENT ON COLUMN owl_email_tasks.id IS '任务ID，主键';
COMMENT ON COLUMN owl_email_tasks.name IS '任务名称';
COMMENT ON COLUMN owl_email_tasks.description IS '任务描述';
COMMENT ON COLUMN owl_email_tasks.template_id IS '邮件模板ID';
COMMENT ON COLUMN owl_email_tasks.recipients IS '收件人邮箱（逗号分隔，支持多个）';
COMMENT ON COLUMN owl_email_tasks.frequency IS '发送频率: once(一次), hourly(每小时), daily(每天), weekly(每周), monthly(每月)';
COMMENT ON COLUMN owl_email_tasks.enabled IS '是否启用';
COMMENT ON COLUMN owl_email_tasks.template_variables IS '模板变量值';
COMMENT ON COLUMN owl_email_tasks.last_executed_at IS '最后执行时间';
COMMENT ON COLUMN owl_email_tasks.next_execution_at IS '下次执行时间';
COMMENT ON COLUMN owl_email_tasks.execution_count IS '执行次数';
COMMENT ON COLUMN owl_email_tasks.last_status IS '最后执行状态: pending(待执行), success(成功), failed(失败)';
COMMENT ON COLUMN owl_email_tasks.last_error IS '最后执行的错误信息';
COMMENT ON COLUMN owl_email_tasks.created_at IS '创建时间';
COMMENT ON COLUMN owl_email_tasks.updated_at IS '更新时间';
COMMENT ON COLUMN owl_email_tasks.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_email_tasks_template_id CASCADE;
DROP INDEX IF EXISTS idx_owl_email_tasks_enabled CASCADE;
DROP INDEX IF EXISTS idx_owl_email_tasks_created_at CASCADE;

CREATE INDEX idx_owl_email_tasks_template_id ON owl_email_tasks (template_id);
CREATE INDEX idx_owl_email_tasks_enabled ON owl_email_tasks (enabled);
CREATE INDEX idx_owl_email_tasks_created_at ON owl_email_tasks (created_at);

