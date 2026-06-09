DROP TABLE IF EXISTS owl_generated_modules CASCADE;

CREATE TABLE owl_generated_modules (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name character varying(100) NOT NULL,
    module_name character varying(100) NOT NULL,
    module_path character varying(200) NOT NULL,
    description text,
    menu_name character varying(100),
    menu_icon character varying(50),
    menu_parent_id uuid,
    menu_sort integer DEFAULT 0,
    enable_create boolean DEFAULT true,
    enable_update boolean DEFAULT true,
    enable_delete boolean DEFAULT true,
    enable_batch_delete boolean DEFAULT true,
    enable_export boolean DEFAULT false,
    enable_import boolean DEFAULT false,
    generated_files json,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    page_config jsonb,
    custom_sql text,
    sql_parameters jsonb DEFAULT '[]'::jsonb,
    sql_primary_key character varying(50) DEFAULT 'id'::character varying,
    detail_display_mode character varying(20) DEFAULT 'dialog'::character varying,
    detail_url_pattern character varying(200)
);

COMMENT ON TABLE owl_generated_modules IS '代码生成器-模块配置表';

COMMENT ON COLUMN owl_generated_modules.id IS '模块ID，主键';
COMMENT ON COLUMN owl_generated_modules.table_name IS '数据库表名（唯一）';
COMMENT ON COLUMN owl_generated_modules.module_name IS '模块名称（如 Product）';
COMMENT ON COLUMN owl_generated_modules.module_path IS '路由路径（如 /products）';
COMMENT ON COLUMN owl_generated_modules.description IS '模块描述';
COMMENT ON COLUMN owl_generated_modules.menu_name IS '菜单名称';
COMMENT ON COLUMN owl_generated_modules.menu_icon IS '菜单图标';
COMMENT ON COLUMN owl_generated_modules.menu_parent_id IS '父菜单ID';
COMMENT ON COLUMN owl_generated_modules.menu_sort IS '菜单排序';
COMMENT ON COLUMN owl_generated_modules.enable_create IS '是否支持新增';
COMMENT ON COLUMN owl_generated_modules.enable_update IS '是否支持编辑';
COMMENT ON COLUMN owl_generated_modules.enable_delete IS '是否支持删除';
COMMENT ON COLUMN owl_generated_modules.enable_batch_delete IS '是否支持批量删除';
COMMENT ON COLUMN owl_generated_modules.enable_export IS '是否支持导出';
COMMENT ON COLUMN owl_generated_modules.enable_import IS '是否支持导入';
COMMENT ON COLUMN owl_generated_modules.generated_files IS '生成的文件列表';
COMMENT ON COLUMN owl_generated_modules.created_by IS '创建人';
COMMENT ON COLUMN owl_generated_modules.created_at IS '创建时间';
COMMENT ON COLUMN owl_generated_modules.updated_at IS '更新时间';
COMMENT ON COLUMN owl_generated_modules.page_config IS '前端页面配置（JSON格式），用于动态渲染页面';
COMMENT ON COLUMN owl_generated_modules.custom_sql IS '自定义SQL查询语句（支持多表查询）';
COMMENT ON COLUMN owl_generated_modules.sql_parameters IS 'SQL参数配置（参数化查询）';
COMMENT ON COLUMN owl_generated_modules.sql_primary_key IS '动态SQL查询结果的主键字段名';
COMMENT ON COLUMN owl_generated_modules.detail_display_mode IS '详情展示模式: dialog(弹窗) | page(独立页面)';
COMMENT ON COLUMN owl_generated_modules.detail_url_pattern IS '详情页URL模式（Page模式使用）';

DROP INDEX IF EXISTS idx_owl_generated_modules_created_by CASCADE;
DROP INDEX IF EXISTS idx_owl_generated_modules_table_name CASCADE;
DROP INDEX IF EXISTS idx_owl_generated_modules_module_path CASCADE;

CREATE INDEX idx_owl_generated_modules_created_by ON owl_generated_modules (created_by);
CREATE INDEX idx_owl_generated_modules_table_name ON owl_generated_modules (table_name);
