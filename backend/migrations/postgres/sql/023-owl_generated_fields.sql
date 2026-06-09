DROP TABLE IF EXISTS owl_generated_fields CASCADE;

CREATE TABLE owl_generated_fields (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id uuid NOT NULL,
    field_name character varying(100) NOT NULL,
    field_type character varying(50),
    field_comment character varying(255),
    is_searchable boolean DEFAULT false,
    search_type character varying(20),
    search_component character varying(50),
    show_in_list boolean DEFAULT true,
    list_sort integer DEFAULT 0,
    list_width character varying(20),
    list_align character varying(10) DEFAULT 'left'::character varying,
    format_type character varying(50),
    format_options json,
    show_in_form boolean DEFAULT true,
    form_component character varying(50),
    form_rules json,
    is_readonly boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    field_group character varying(50) DEFAULT 'default'::character varying,
    show_in_detail boolean DEFAULT true,
    detail_sort integer DEFAULT 0,
    detail_label character varying(100),
    detail_component character varying(50)
);

COMMENT ON TABLE owl_generated_fields IS '代码生成器-字段配置表';

COMMENT ON COLUMN owl_generated_fields.id IS '字段配置ID，主键';
COMMENT ON COLUMN owl_generated_fields.module_id IS '模块ID';
COMMENT ON COLUMN owl_generated_fields.field_name IS '字段名称';
COMMENT ON COLUMN owl_generated_fields.field_type IS '字段类型';
COMMENT ON COLUMN owl_generated_fields.field_comment IS '字段注释';
COMMENT ON COLUMN owl_generated_fields.is_searchable IS '是否作为搜索条件';
COMMENT ON COLUMN owl_generated_fields.search_type IS '搜索方式: exact/like/range/in';
COMMENT ON COLUMN owl_generated_fields.search_component IS '搜索组件: input/select/date-picker';
COMMENT ON COLUMN owl_generated_fields.show_in_list IS '是否在列表显示';
COMMENT ON COLUMN owl_generated_fields.list_sort IS '列表显示顺序';
COMMENT ON COLUMN owl_generated_fields.list_width IS '列宽度（如 150px）';
COMMENT ON COLUMN owl_generated_fields.list_align IS '对齐方式: left/center/right';
COMMENT ON COLUMN owl_generated_fields.format_type IS '格式化类型: mask/date/money/enum/link/combine';
COMMENT ON COLUMN owl_generated_fields.format_options IS '格式化选项';
COMMENT ON COLUMN owl_generated_fields.show_in_form IS '是否在表单显示';
COMMENT ON COLUMN owl_generated_fields.form_component IS '表单组件类型';
COMMENT ON COLUMN owl_generated_fields.form_rules IS '表单验证规则';
COMMENT ON COLUMN owl_generated_fields.is_readonly IS '是否只读';
COMMENT ON COLUMN owl_generated_fields.created_at IS '创建时间';
COMMENT ON COLUMN owl_generated_fields.updated_at IS '更新时间';
COMMENT ON COLUMN owl_generated_fields.field_group IS '字段所属分组（信息簇）';
COMMENT ON COLUMN owl_generated_fields.show_in_detail IS '是否在详情页显示';
COMMENT ON COLUMN owl_generated_fields.detail_sort IS '详情页显示顺序（数字越小越靠前）';
COMMENT ON COLUMN owl_generated_fields.detail_label IS '详情页显示标签（自定义字段名称）';
COMMENT ON COLUMN owl_generated_fields.detail_component IS '详情页显示组件类型';

DROP INDEX IF EXISTS idx_owl_generated_fields_list_sort CASCADE;
DROP INDEX IF EXISTS idx_owl_generated_fields_module_id CASCADE;

CREATE INDEX idx_owl_generated_fields_list_sort ON owl_generated_fields (list_sort);
CREATE INDEX idx_owl_generated_fields_module_id ON owl_generated_fields (module_id);
