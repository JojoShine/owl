DROP TABLE IF EXISTS owl_alert_rules CASCADE;

CREATE TABLE owl_alert_rules (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(100) NOT NULL,
    metric_type character varying(50) NOT NULL,
    condition character varying(20) NOT NULL,
    threshold numeric NOT NULL,
    duration integer,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    metric_name character varying(50) NOT NULL,
    level character varying(20) DEFAULT 'warning'::character varying,
    alert_enabled boolean NOT NULL DEFAULT false,
    alert_template_id uuid,
    alert_recipients json,
    alert_interval integer NOT NULL DEFAULT 1800
);

COMMENT ON TABLE owl_alert_rules IS '告警规则表';

COMMENT ON COLUMN owl_alert_rules.id IS '告警规则ID，主键';
COMMENT ON COLUMN owl_alert_rules.name IS '规则名称';
COMMENT ON COLUMN owl_alert_rules.metric_type IS '监控类型';
COMMENT ON COLUMN owl_alert_rules.condition IS '条件：>, <, >=, <=, ==';
COMMENT ON COLUMN owl_alert_rules.threshold IS '阈值';
COMMENT ON COLUMN owl_alert_rules.duration IS '持续时间（秒）';
COMMENT ON COLUMN owl_alert_rules.enabled IS '是否启用';
COMMENT ON COLUMN owl_alert_rules.created_at IS '创建时间';
COMMENT ON COLUMN owl_alert_rules.updated_at IS '更新时间';
COMMENT ON COLUMN owl_alert_rules.metric_name IS '监控指标名称';
COMMENT ON COLUMN owl_alert_rules.level IS '告警级别：info, warning, error, critical';
COMMENT ON COLUMN owl_alert_rules.alert_enabled IS '是否启用邮件告警';
COMMENT ON COLUMN owl_alert_rules.alert_template_id IS '告警邮件模版ID';
COMMENT ON COLUMN owl_alert_rules.alert_recipients IS '告警接收人邮箱列表';
COMMENT ON COLUMN owl_alert_rules.alert_interval IS '告警间隔（秒）- 持续异常时的告警发送间隔，默认30分钟';

DROP INDEX IF EXISTS idx_owl_alert_rules_enabled CASCADE;
DROP INDEX IF EXISTS idx_owl_alert_rules_metric_type CASCADE;
DROP INDEX IF EXISTS owl_alert_rules_enabled CASCADE;
DROP INDEX IF EXISTS owl_alert_rules_metric_type CASCADE;

CREATE INDEX idx_owl_alert_rules_enabled ON owl_alert_rules (enabled);
CREATE INDEX idx_owl_alert_rules_metric_type ON owl_alert_rules (metric_type);
CREATE INDEX owl_alert_rules_enabled ON owl_alert_rules (enabled);
CREATE INDEX owl_alert_rules_metric_type ON owl_alert_rules (metric_type);
