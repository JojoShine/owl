DROP TABLE IF EXISTS owl_dictionary CASCADE;

CREATE TABLE owl_dictionary (
    id character varying(36) NOT NULL,
    dict_type character varying(50) NOT NULL,
    dict_code character varying(50) NOT NULL,
    dict_name character varying(100) NOT NULL,
    dict_value character varying(255),
    parent_code character varying(50),
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    remark text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);

COMMENT ON COLUMN owl_dictionary.dict_type IS '字典类型';
COMMENT ON COLUMN owl_dictionary.dict_code IS '字典代码';
COMMENT ON COLUMN owl_dictionary.dict_name IS '字典名称';
COMMENT ON COLUMN owl_dictionary.dict_value IS '字典值';
COMMENT ON COLUMN owl_dictionary.parent_code IS '父级代码';
COMMENT ON COLUMN owl_dictionary.sort_order IS '排序';
COMMENT ON COLUMN owl_dictionary.is_active IS '是否启用';
COMMENT ON COLUMN owl_dictionary.remark IS '备注';
COMMENT ON COLUMN owl_dictionary.created_at IS '创建时间';
COMMENT ON COLUMN owl_dictionary.updated_at IS '更新时间';
COMMENT ON COLUMN owl_dictionary.deleted_at IS '软删除时间';
