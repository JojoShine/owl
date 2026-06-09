DROP TABLE IF EXISTS owl_api_monitors CASCADE;

CREATE TABLE owl_api_monitors (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(100) NOT NULL,
    url character varying(500) NOT NULL,
    method character varying(10) DEFAULT 'GET'::character varying,
    headers json,
    body text,
    interval integer DEFAULT 60,
    timeout integer DEFAULT 30,
    expect_status integer DEFAULT 200,
    expect_response text,
    enabled boolean DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    alert_enabled boolean NOT NULL DEFAULT false,
    alert_template_id uuid,
    alert_recipients json,
    variable_mapping json,
    alert_interval integer NOT NULL DEFAULT 1800
);

COMMENT ON TABLE owl_api_monitors IS '接口监控配置表';

COMMENT ON COLUMN owl_api_monitors.id IS '接口监控ID，主键';
COMMENT ON COLUMN owl_api_monitors.name IS '监控名称';
COMMENT ON COLUMN owl_api_monitors.url IS '监控的URL';
COMMENT ON COLUMN owl_api_monitors.method IS '请求方法：GET, POST, PUT, DELETE';
COMMENT ON COLUMN owl_api_monitors.headers IS '请求头';
COMMENT ON COLUMN owl_api_monitors.body IS '请求体';
COMMENT ON COLUMN owl_api_monitors.interval IS '检测间隔（秒）';
COMMENT ON COLUMN owl_api_monitors.timeout IS '超时时间（秒）';
COMMENT ON COLUMN owl_api_monitors.expect_status IS '期望的状态码';
COMMENT ON COLUMN owl_api_monitors.expect_response IS '期望的响应内容（可选）';
COMMENT ON COLUMN owl_api_monitors.enabled IS '是否启用';
COMMENT ON COLUMN owl_api_monitors.created_by IS '创建者ID';
COMMENT ON COLUMN owl_api_monitors.created_at IS '创建时间';
COMMENT ON COLUMN owl_api_monitors.updated_at IS '更新时间';
COMMENT ON COLUMN owl_api_monitors.alert_enabled IS '是否启用告警';
COMMENT ON COLUMN owl_api_monitors.alert_template_id IS '告警邮件模版ID';
COMMENT ON COLUMN owl_api_monitors.alert_recipients IS '告警接收人邮箱列表';
COMMENT ON COLUMN owl_api_monitors.variable_mapping IS '变量映射配置：{ 模版变量名: 数据字段路径 }';
COMMENT ON COLUMN owl_api_monitors.alert_interval IS '告警间隔（秒）- 持续异常时的告警发送间隔';

DROP INDEX IF EXISTS idx_owl_api_monitors_alert_enabled CASCADE;
DROP INDEX IF EXISTS idx_owl_api_monitors_alert_template CASCADE;
DROP INDEX IF EXISTS idx_owl_api_monitors_created_by CASCADE;
DROP INDEX IF EXISTS idx_owl_api_monitors_enabled CASCADE;
DROP INDEX IF EXISTS owl_api_monitors_created_by CASCADE;
DROP INDEX IF EXISTS owl_api_monitors_enabled CASCADE;

CREATE INDEX idx_owl_api_monitors_alert_enabled ON owl_api_monitors (alert_enabled);
CREATE INDEX idx_owl_api_monitors_alert_template ON owl_api_monitors (alert_template_id);
CREATE INDEX idx_owl_api_monitors_created_by ON owl_api_monitors (created_by);
CREATE INDEX idx_owl_api_monitors_enabled ON owl_api_monitors (enabled);
CREATE INDEX owl_api_monitors_created_by ON owl_api_monitors (created_by);
CREATE INDEX owl_api_monitors_enabled ON owl_api_monitors (enabled);
