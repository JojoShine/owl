DROP TABLE IF EXISTS owl_alert_history CASCADE;

CREATE TABLE owl_alert_history (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_id uuid NOT NULL,
    message text NOT NULL,
    level character varying(20) DEFAULT 'warning'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    resolved_at timestamp with time zone
);

COMMENT ON TABLE owl_alert_history IS '告警历史表';

COMMENT ON COLUMN owl_alert_history.id IS '告警历史ID，主键';
COMMENT ON COLUMN owl_alert_history.rule_id IS '告警规则ID';
COMMENT ON COLUMN owl_alert_history.message IS '告警信息';
COMMENT ON COLUMN owl_alert_history.level IS '告警级别：info, warning, error, critical';
COMMENT ON COLUMN owl_alert_history.status IS '状态：pending, resolved';
COMMENT ON COLUMN owl_alert_history.created_at IS '创建时间';
COMMENT ON COLUMN owl_alert_history.resolved_at IS '解决时间';

DROP INDEX IF EXISTS idx_owl_alert_history_created_at CASCADE;
DROP INDEX IF EXISTS idx_owl_alert_history_level CASCADE;
DROP INDEX IF EXISTS idx_owl_alert_history_rule_id CASCADE;
DROP INDEX IF EXISTS idx_owl_alert_history_status CASCADE;
DROP INDEX IF EXISTS owl_alert_history_created_at CASCADE;
DROP INDEX IF EXISTS owl_alert_history_level CASCADE;
DROP INDEX IF EXISTS owl_alert_history_rule_id CASCADE;
DROP INDEX IF EXISTS owl_alert_history_status CASCADE;

CREATE INDEX idx_owl_alert_history_created_at ON owl_alert_history (created_at);
CREATE INDEX idx_owl_alert_history_level ON owl_alert_history (level);
CREATE INDEX idx_owl_alert_history_rule_id ON owl_alert_history (rule_id);
CREATE INDEX idx_owl_alert_history_status ON owl_alert_history (status);
CREATE INDEX owl_alert_history_created_at ON owl_alert_history (created_at);
CREATE INDEX owl_alert_history_level ON owl_alert_history (level);
CREATE INDEX owl_alert_history_rule_id ON owl_alert_history (rule_id);
CREATE INDEX owl_alert_history_status ON owl_alert_history (status);
