DROP TABLE IF EXISTS owl_role_menus CASCADE;

CREATE TABLE owl_role_menus (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id uuid NOT NULL,
    menu_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE owl_role_menus IS '角色菜单关联表';

COMMENT ON COLUMN owl_role_menus.id IS '关联ID，主键';
COMMENT ON COLUMN owl_role_menus.role_id IS '角色ID，外键关联roles表';
COMMENT ON COLUMN owl_role_menus.menu_id IS '菜单ID，外键关联menus表';
COMMENT ON COLUMN owl_role_menus.created_at IS '创建时间';
COMMENT ON COLUMN owl_role_menus.updated_at IS '更新时间';
COMMENT ON COLUMN owl_role_menus.deleted_at IS '软删除时间';

DROP INDEX IF EXISTS idx_owl_role_menus_menu_id CASCADE;
DROP INDEX IF EXISTS idx_owl_role_menus_role_id CASCADE;
DROP INDEX IF EXISTS owl_role_menus_role_id_menu_id_unique CASCADE;

CREATE INDEX idx_owl_role_menus_menu_id ON owl_role_menus (menu_id);
CREATE INDEX idx_owl_role_menus_role_id ON owl_role_menus (role_id);
