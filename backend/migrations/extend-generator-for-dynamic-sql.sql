-- ========================================
-- 数据库迁移：扩展代码生成器支持动态SQL和字段分组
--
-- 新增功能：
-- 1. 动态SQL查询配置
-- 2. 详情页展示模式选择（Dialog/Page）
-- 3. 字段分组（信息簇）配置
-- ========================================

-- ========================================
-- 1. 扩展 generated_modules 表
-- ========================================

-- 添加自定义SQL查询字段
ALTER TABLE generated_modules
ADD COLUMN IF NOT EXISTS custom_sql TEXT;

COMMENT ON COLUMN generated_modules.custom_sql IS '自定义SQL查询语句（支持多表查询）';

-- 添加SQL参数配置字段
ALTER TABLE generated_modules
ADD COLUMN IF NOT EXISTS sql_parameters JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN generated_modules.sql_parameters IS 'SQL参数配置（参数化查询）';

-- 添加SQL主键字段配置
ALTER TABLE generated_modules
ADD COLUMN IF NOT EXISTS sql_primary_key VARCHAR(50) DEFAULT 'id';

COMMENT ON COLUMN generated_modules.sql_primary_key IS '动态SQL查询结果的主键字段名';

-- 添加详情展示模式字段
ALTER TABLE generated_modules
ADD COLUMN IF NOT EXISTS detail_display_mode VARCHAR(20) DEFAULT 'dialog';

COMMENT ON COLUMN generated_modules.detail_display_mode IS '详情展示模式: dialog(弹窗) | page(独立页面)';

-- 添加详情页URL模式字段
ALTER TABLE generated_modules
ADD COLUMN IF NOT EXISTS detail_url_pattern VARCHAR(200);

COMMENT ON COLUMN generated_modules.detail_url_pattern IS '详情页URL模式（Page模式使用）';

-- ========================================
-- 2. 扩展 generated_fields 表
-- ========================================

-- 添加字段分组配置
ALTER TABLE generated_fields
ADD COLUMN IF NOT EXISTS field_group VARCHAR(50) DEFAULT 'default';

COMMENT ON COLUMN generated_fields.field_group IS '字段所属分组（信息簇）';

-- 添加详情页显示控制
ALTER TABLE generated_fields
ADD COLUMN IF NOT EXISTS show_in_detail BOOLEAN DEFAULT true;

COMMENT ON COLUMN generated_fields.show_in_detail IS '是否在详情页显示';

-- 添加详情页排序
ALTER TABLE generated_fields
ADD COLUMN IF NOT EXISTS detail_sort INTEGER DEFAULT 0;

COMMENT ON COLUMN generated_fields.detail_sort IS '详情页显示顺序（数字越小越靠前）';

-- 添加详情页标签配置
ALTER TABLE generated_fields
ADD COLUMN IF NOT EXISTS detail_label VARCHAR(100);

COMMENT ON COLUMN generated_fields.detail_label IS '详情页显示标签（自定义字段名称）';

-- 添加详情页组件类型
ALTER TABLE generated_fields
ADD COLUMN IF NOT EXISTS detail_component VARCHAR(50);

COMMENT ON COLUMN generated_fields.detail_component IS '详情页显示组件类型';

-- ========================================
-- 完成提示
-- ========================================

SELECT '✅ 数据库迁移完成：代码生成器已扩展支持动态SQL和字段分组' AS status;
