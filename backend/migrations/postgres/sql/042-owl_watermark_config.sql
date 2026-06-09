DROP TABLE IF EXISTS owl_watermark_config CASCADE;

CREATE TABLE owl_watermark_config (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    enabled boolean DEFAULT true,
    lines jsonb,
    font_size integer DEFAULT 24,
    font_weight integer DEFAULT 400,
    color character varying(7) DEFAULT '#000000'::character varying,
    opacity numeric(3,2) DEFAULT 0.15,
    rotation integer DEFAULT 45,
    spacing integer DEFAULT 150,
    masking_rules jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid
);

COMMENT ON TABLE owl_watermark_config IS '水印配置表';

COMMENT ON COLUMN owl_watermark_config.id IS '水印配置ID，主键';
COMMENT ON COLUMN owl_watermark_config.enabled IS '水印是否启用';
COMMENT ON COLUMN owl_watermark_config.lines IS '水印内容行数组，支持动态变量 {{user:fieldName}}';
COMMENT ON COLUMN owl_watermark_config.font_size IS '字体大小（12-48px）';
COMMENT ON COLUMN owl_watermark_config.font_weight IS '字体粗细（300|400|700）';
COMMENT ON COLUMN owl_watermark_config.color IS '颜色（十六进制）';
COMMENT ON COLUMN owl_watermark_config.opacity IS '透明度（0.05-0.5）';
COMMENT ON COLUMN owl_watermark_config.rotation IS '旋转角度（0-360°）';
COMMENT ON COLUMN owl_watermark_config.spacing IS '间距（50-300px）';
COMMENT ON COLUMN owl_watermark_config.masking_rules IS '脱敏规则配置，格式: {fieldName: {type, hideCount|showCount}}';
COMMENT ON COLUMN owl_watermark_config.created_at IS '创建时间';
COMMENT ON COLUMN owl_watermark_config.updated_at IS '更新时间';
COMMENT ON COLUMN owl_watermark_config.created_by IS '创建者ID';

DROP INDEX IF EXISTS idx_owl_watermark_config_enabled CASCADE;

CREATE INDEX idx_owl_watermark_config_enabled ON owl_watermark_config (enabled);
