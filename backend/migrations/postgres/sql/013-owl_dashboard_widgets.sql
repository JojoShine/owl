DROP TABLE IF EXISTS owl_dashboard_widgets CASCADE;

CREATE TABLE owl_dashboard_widgets (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title character varying(100) NOT NULL,
    widget_type character varying(20) NOT NULL DEFAULT 'chart'::character varying,
    chart_type character varying(20) DEFAULT 'bar'::character varying,
    sql_query text NOT NULL,
    x_key character varying(100),
    data_key character varying(100),
    unit character varying(20),
    sort_order integer NOT NULL DEFAULT 0,
    enabled boolean NOT NULL DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE owl_dashboard_widgets IS '概览自定义 Widget 配置表';

COMMENT ON COLUMN owl_dashboard_widgets.widget_type IS 'metric=数字指标, chart=图表';
COMMENT ON COLUMN owl_dashboard_widgets.chart_type IS 'line/bar/area/pie';
COMMENT ON COLUMN owl_dashboard_widgets.x_key IS '图表 X 轴字段名';
COMMENT ON COLUMN owl_dashboard_widgets.data_key IS '图表数值字段名';
