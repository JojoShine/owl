DROP TABLE IF EXISTS owl_sensitive_fields CASCADE;

CREATE TABLE owl_sensitive_fields (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name character varying(100) NOT NULL,
    field_name character varying(100) NOT NULL,
    mask_type enum_owl_sensitive_fields_mask_type NOT NULL DEFAULT 'custom'::enum_owl_sensitive_fields_mask_type,
    mask_rule jsonb,
    description character varying(255),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_sensitive_fields IS '敏感字段配置表';

COMMENT ON COLUMN owl_sensitive_fields.id IS '主键ID';
COMMENT ON COLUMN owl_sensitive_fields.table_name IS '表名';
COMMENT ON COLUMN owl_sensitive_fields.field_name IS '字段名';
COMMENT ON COLUMN owl_sensitive_fields.mask_type IS '脱敏类型：phone-手机号, email-邮箱, id_card-身份证, bank_card-银行卡, name-姓名, address-地址, custom-自定义';
COMMENT ON COLUMN owl_sensitive_fields.mask_rule IS '自定义脱敏规则（JSON格式）';
COMMENT ON COLUMN owl_sensitive_fields.description IS '字段描述';
COMMENT ON COLUMN owl_sensitive_fields.is_active IS '是否启用';
COMMENT ON COLUMN owl_sensitive_fields.created_at IS '创建时间';
COMMENT ON COLUMN owl_sensitive_fields.updated_at IS '更新时间';
COMMENT ON COLUMN owl_sensitive_fields.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_sensitive_fields_is_active CASCADE;
DROP INDEX IF EXISTS idx_owl_sensitive_fields_table_name CASCADE;
DROP INDEX IF EXISTS owl_sensitive_fields_is_active CASCADE;
DROP INDEX IF EXISTS owl_sensitive_fields_field_name CASCADE;

CREATE INDEX idx_owl_sensitive_fields_is_active ON owl_sensitive_fields (is_active);
CREATE INDEX idx_owl_sensitive_fields_table_name ON owl_sensitive_fields (table_name);
CREATE INDEX owl_sensitive_fields_is_active ON owl_sensitive_fields (is_active);
