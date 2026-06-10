DROP TABLE IF EXISTS owl_monitor_metrics CASCADE;

CREATE TABLE owl_monitor_metrics (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type character varying(50) NOT NULL,
    metric_name character varying(100) NOT NULL,
    value numeric NOT NULL,
    unit character varying(20),
    tags json,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_monitor_metrics IS '监控数据表';

COMMENT ON COLUMN owl_monitor_metrics.id IS '监控数据ID，主键';
COMMENT ON COLUMN owl_monitor_metrics.metric_type IS '指标类型：system, application, database, cache';
COMMENT ON COLUMN owl_monitor_metrics.metric_name IS '指标名称：cpu, memory, disk, etc.';
COMMENT ON COLUMN owl_monitor_metrics.value IS '指标值';
COMMENT ON COLUMN owl_monitor_metrics.unit IS '单位：%, MB, ms, etc.';
COMMENT ON COLUMN owl_monitor_metrics.tags IS '额外的标签信息';
COMMENT ON COLUMN owl_monitor_metrics.created_at IS '创建时间';
COMMENT ON COLUMN owl_monitor_metrics.updated_at IS '更新时间';
COMMENT ON COLUMN owl_monitor_metrics.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_monitor_metrics_created_at CASCADE;
DROP INDEX IF EXISTS idx_owl_monitor_metrics_type_name CASCADE;
DROP INDEX IF EXISTS idx_owl_monitor_metrics_type CASCADE;

CREATE INDEX idx_owl_monitor_metrics_created_at ON owl_monitor_metrics (created_at);
CREATE INDEX idx_owl_monitor_metrics_type_name ON owl_monitor_metrics (metric_name, metric_type);
CREATE INDEX idx_owl_monitor_metrics_type ON owl_monitor_metrics (metric_type);
