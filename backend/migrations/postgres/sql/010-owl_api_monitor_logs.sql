DROP TABLE IF EXISTS owl_api_monitor_logs CASCADE;

CREATE TABLE owl_api_monitor_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    monitor_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    status_code integer,
    response_time integer,
    response_body text,
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_api_monitor_logs IS '接口监控历史表';

COMMENT ON COLUMN owl_api_monitor_logs.id IS '监控日志ID，主键';
COMMENT ON COLUMN owl_api_monitor_logs.monitor_id IS '监控配置ID';
COMMENT ON COLUMN owl_api_monitor_logs.status IS '状态：success, failed, timeout';
COMMENT ON COLUMN owl_api_monitor_logs.status_code IS 'HTTP状态码';
COMMENT ON COLUMN owl_api_monitor_logs.response_time IS '响应时间（毫秒）';
COMMENT ON COLUMN owl_api_monitor_logs.response_body IS '响应内容（截取前1000字符）';
COMMENT ON COLUMN owl_api_monitor_logs.error_message IS '错误信息';
COMMENT ON COLUMN owl_api_monitor_logs.created_at IS '创建时间';
COMMENT ON COLUMN owl_api_monitor_logs.updated_at IS '更新时间';
COMMENT ON COLUMN owl_api_monitor_logs.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_api_monitor_logs_created_at CASCADE;
DROP INDEX IF EXISTS idx_owl_api_monitor_logs_monitor_id CASCADE;
DROP INDEX IF EXISTS idx_owl_api_monitor_logs_status CASCADE;

CREATE INDEX idx_owl_api_monitor_logs_created_at ON owl_api_monitor_logs (created_at);
CREATE INDEX idx_owl_api_monitor_logs_monitor_id ON owl_api_monitor_logs (monitor_id);
CREATE INDEX idx_owl_api_monitor_logs_status ON owl_api_monitor_logs (status);
