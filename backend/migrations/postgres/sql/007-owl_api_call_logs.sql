DROP TABLE IF EXISTS owl_api_call_logs CASCADE;

CREATE TABLE owl_api_call_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    interface_id uuid NOT NULL,
    api_key_id uuid,
    request_method character varying(20),
    request_params jsonb,
    response_code integer,
    response_time integer,
    error_message character varying(500),
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE owl_api_call_logs IS '接口调用日志表';

COMMENT ON COLUMN owl_api_call_logs.id IS '日志ID，主键';
COMMENT ON COLUMN owl_api_call_logs.interface_id IS '接口ID';
COMMENT ON COLUMN owl_api_call_logs.api_key_id IS 'API密钥ID';
COMMENT ON COLUMN owl_api_call_logs.request_method IS '请求方法';
COMMENT ON COLUMN owl_api_call_logs.request_params IS '请求参数';
COMMENT ON COLUMN owl_api_call_logs.response_code IS '响应状态码';
COMMENT ON COLUMN owl_api_call_logs.response_time IS '响应时间（毫秒）';
COMMENT ON COLUMN owl_api_call_logs.error_message IS '错误信息';
COMMENT ON COLUMN owl_api_call_logs.ip_address IS '请求来源IP';
COMMENT ON COLUMN owl_api_call_logs.created_at IS '创建时间';

DROP INDEX IF EXISTS idx_owl_api_call_logs_api_key_id CASCADE;
DROP INDEX IF EXISTS idx_owl_api_call_logs_created_at CASCADE;
DROP INDEX IF EXISTS idx_owl_api_call_logs_interface_id CASCADE;

CREATE INDEX idx_owl_api_call_logs_api_key_id ON owl_api_call_logs (api_key_id);
CREATE INDEX idx_owl_api_call_logs_created_at ON owl_api_call_logs (created_at);
CREATE INDEX idx_owl_api_call_logs_interface_id ON owl_api_call_logs (interface_id);
