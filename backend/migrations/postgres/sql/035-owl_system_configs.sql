DROP TABLE IF EXISTS owl_system_configs CASCADE;

CREATE TABLE owl_system_configs (
    id bigint NOT NULL,
    logo_url character varying(500),
    login_bg_url character varying(500),
    company_name character varying(100) NOT NULL DEFAULT 'Owl Platform'::character varying,
    system_name character varying(100) NOT NULL DEFAULT 'Owl Platform'::character varying,
    show_tech_stack boolean NOT NULL DEFAULT true,
    registration_enabled boolean NOT NULL DEFAULT true,
    tech_stack_info jsonb,
    enable_theme_switch boolean NOT NULL DEFAULT true,
    theme_mode character varying(20) DEFAULT 'auto'::character varying,
    primary_color character varying(20) DEFAULT 'default'::character varying,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    login_layout character varying(20) NOT NULL DEFAULT 'center'::character varying,
    login_method character varying(10) DEFAULT 'both'::character varying,
    registration_method character varying(10) DEFAULT 'both'::character varying
);

COMMENT ON TABLE owl_system_configs IS '系统配置表';

COMMENT ON COLUMN owl_system_configs.id IS '配置ID';
COMMENT ON COLUMN owl_system_configs.logo_url IS 'Logo 图片 URL';
COMMENT ON COLUMN owl_system_configs.login_bg_url IS '登录背景图片 URL';
COMMENT ON COLUMN owl_system_configs.company_name IS '公司名称';
COMMENT ON COLUMN owl_system_configs.system_name IS '系统名称';
COMMENT ON COLUMN owl_system_configs.show_tech_stack IS '是否展示技术栈信息';
COMMENT ON COLUMN owl_system_configs.registration_enabled IS '是否开放用户注册';
COMMENT ON COLUMN owl_system_configs.tech_stack_info IS '技术栈信息配置';
COMMENT ON COLUMN owl_system_configs.enable_theme_switch IS '是否支持主题切换';
COMMENT ON COLUMN owl_system_configs.theme_mode IS '默认主题模式';
COMMENT ON COLUMN owl_system_configs.primary_color IS '主题色';
COMMENT ON COLUMN owl_system_configs.created_by IS '创建者ID';
COMMENT ON COLUMN owl_system_configs.created_at IS '创建时间';
COMMENT ON COLUMN owl_system_configs.updated_at IS '更新时间';
COMMENT ON COLUMN owl_system_configs.login_layout IS '登录页面布局方式：center居中|left-image左侧图片|right-image右侧图片';
COMMENT ON COLUMN owl_system_configs.login_method IS '登录方式：password账密|sms短信|both两者都支持';
COMMENT ON COLUMN owl_system_configs.registration_method IS '注册方式：password账密|sms短信|both两者都支持';
