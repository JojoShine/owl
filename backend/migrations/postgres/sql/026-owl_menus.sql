DROP TABLE IF EXISTS owl_menus CASCADE;

CREATE TABLE owl_menus (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id uuid,
    name character varying(50) NOT NULL,
    path character varying(255),
    component character varying(255),
    icon character varying(50),
    type enum_owl_menus_type DEFAULT 'menu'::enum_owl_menus_type,
    visible boolean DEFAULT true,
    sort integer DEFAULT 0,
    status enum_owl_menus_status DEFAULT 'active'::enum_owl_menus_status,
    permission_code character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    menu_type character varying(20) DEFAULT 'business'::character varying
);

COMMENT ON TABLE owl_menus IS '菜单表';

COMMENT ON COLUMN owl_menus.id IS '菜单ID，主键';
COMMENT ON COLUMN owl_menus.parent_id IS '父菜单ID，顶级菜单为NULL';
COMMENT ON COLUMN owl_menus.name IS '菜单名称';
COMMENT ON COLUMN owl_menus.path IS '前端路由路径';
COMMENT ON COLUMN owl_menus.component IS '前端组件路径';
COMMENT ON COLUMN owl_menus.icon IS '菜单图标名称';
COMMENT ON COLUMN owl_menus.type IS '菜单类型：menu-菜单，button-按钮，link-外链';
COMMENT ON COLUMN owl_menus.visible IS '是否可见：true-显示，false-隐藏';
COMMENT ON COLUMN owl_menus.sort IS '排序值，数值越小越靠前';
COMMENT ON COLUMN owl_menus.status IS '菜单状态：active-启用，inactive-禁用';
COMMENT ON COLUMN owl_menus.permission_code IS '关联的权限代码';
COMMENT ON COLUMN owl_menus.created_at IS '创建时间';
COMMENT ON COLUMN owl_menus.updated_at IS '更新时间';
COMMENT ON COLUMN owl_menus.deleted_at IS '软删除时间';
COMMENT ON COLUMN owl_menus.menu_type IS '菜单类型：business-业务菜单（上方），system-系统菜单（下方，分割线下）';

DROP INDEX IF EXISTS idx_owl_menus_parent_id CASCADE;
DROP INDEX IF EXISTS idx_owl_menus_status CASCADE;
DROP INDEX IF EXISTS idx_owl_menus_type CASCADE;

CREATE INDEX idx_owl_menus_parent_id ON owl_menus (parent_id);
CREATE INDEX idx_owl_menus_status ON owl_menus (status);
CREATE INDEX idx_owl_menus_type ON owl_menus (type);
