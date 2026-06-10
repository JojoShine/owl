DROP TABLE IF EXISTS owl_email_templates CASCADE;

CREATE TABLE owl_email_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(100) NOT NULL,
    subject character varying(255) NOT NULL,
    content text NOT NULL,
    variables json,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    template_type character varying(50) DEFAULT 'GENERAL_NOTIFICATION'::character varying,
    variable_schema json,
    tags json DEFAULT '[]'::json
);

COMMENT ON TABLE owl_email_templates IS '邮件模板表';

COMMENT ON COLUMN owl_email_templates.id IS '邮件模板ID，主键';
COMMENT ON COLUMN owl_email_templates.name IS '模板名称（唯一）';
COMMENT ON COLUMN owl_email_templates.subject IS '邮件主题';
COMMENT ON COLUMN owl_email_templates.content IS 'HTML模板内容（支持handlebars语法）';
COMMENT ON COLUMN owl_email_templates.variables IS '模板变量说明';
COMMENT ON COLUMN owl_email_templates.description IS '模板描述';
COMMENT ON COLUMN owl_email_templates.created_at IS '创建时间';
COMMENT ON COLUMN owl_email_templates.updated_at IS '更新时间';
COMMENT ON COLUMN owl_email_templates.deleted_at IS '软删除时间';
COMMENT ON COLUMN owl_email_templates.template_type IS '模版类型：API_MONITOR_ALERT, SYSTEM_ALERT, GENERAL_NOTIFICATION';
COMMENT ON COLUMN owl_email_templates.variable_schema IS '变量Schema定义：[{ name, label, description, type, required, defaultValue, example }]';
COMMENT ON COLUMN owl_email_templates.tags IS '标签列表：["monitoring", "alert", "api"]，替代固定分类';

DROP INDEX IF EXISTS idx_owl_email_templates_name CASCADE;
DROP INDEX IF EXISTS idx_owl_email_templates_type CASCADE;

CREATE INDEX idx_owl_email_templates_name ON owl_email_templates (name);
CREATE INDEX idx_owl_email_templates_type ON owl_email_templates (template_type);
