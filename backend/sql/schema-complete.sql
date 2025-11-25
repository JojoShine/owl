-- ==========================================
-- Owl 管理系统 - 数据库结构
-- ==========================================
-- 生成时间: 2025-10-28T00:57:33.920Z
-- 数据库: common_management
-- 已修复表创建顺序问题
-- ==========================================

-- ==========================================
-- 枚举类型定义
-- ==========================================

DROP TYPE IF EXISTS enum_departments_status CASCADE;
CREATE TYPE enum_departments_status AS ENUM ('active', 'inactive');

DROP TYPE IF EXISTS enum_email_logs_status CASCADE;
CREATE TYPE enum_email_logs_status AS ENUM ('pending', 'sent', 'failed');

DROP TYPE IF EXISTS enum_menus_status CASCADE;
CREATE TYPE enum_menus_status AS ENUM ('active', 'inactive');

DROP TYPE IF EXISTS enum_menus_type CASCADE;
CREATE TYPE enum_menus_type AS ENUM ('menu', 'button', 'link');

DROP TYPE IF EXISTS enum_notifications_type CASCADE;
CREATE TYPE enum_notifications_type AS ENUM ('info', 'system', 'warning', 'error', 'success');

DROP TYPE IF EXISTS enum_roles_status CASCADE;
CREATE TYPE enum_roles_status AS ENUM ('active', 'inactive');

DROP TYPE IF EXISTS enum_users_status CASCADE;
CREATE TYPE enum_users_status AS ENUM ('active', 'inactive', 'banned');


-- ==========================================
-- 触发器函数定义
-- ==========================================

-- 自动更新 updated_at 字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 表结构定义 - 按依赖顺序排列
-- ==========================================

-- ==========================================
-- 第一层：无外键依赖的基础表
-- ==========================================

-- 邮件模板表
DROP TABLE IF EXISTS email_templates CASCADE;

CREATE TABLE email_templates (
                                 id UUID NOT NULL DEFAULT gen_random_uuid(),
                                 name VARCHAR(100) NOT NULL,
                                 subject VARCHAR(255) NOT NULL,
                                 content TEXT NOT NULL,
                                 variables JSON,
                                 description TEXT,
                                 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                 template_type VARCHAR(50) DEFAULT 'GENERAL_NOTIFICATION'::character varying,
                                 variable_schema JSON,
                                 tags JSON DEFAULT '[]'::json,
                                 PRIMARY KEY (id)
);

COMMENT ON COLUMN email_templates.id IS '邮件模板ID，主键';
COMMENT ON COLUMN email_templates.name IS '模板名称（唯一）';
COMMENT ON COLUMN email_templates.subject IS '邮件主题';
COMMENT ON COLUMN email_templates.content IS 'HTML模板内容（支持handlebars语法）';
COMMENT ON COLUMN email_templates.variables IS '模板变量说明';
COMMENT ON COLUMN email_templates.description IS '模板描述';
COMMENT ON COLUMN email_templates.created_at IS '创建时间';
COMMENT ON COLUMN email_templates.updated_at IS '更新时间';
COMMENT ON COLUMN email_templates.template_type IS '模版类型：API_MONITOR_ALERT, SYSTEM_ALERT, GENERAL_NOTIFICATION';
COMMENT ON COLUMN email_templates.variable_schema IS '变量Schema定义：[{ name, label, description, type, required, defaultValue, example }]';
COMMENT ON COLUMN email_templates.tags IS '标签列表：["monitoring", "alert", "api"]，替代固定分类';

COMMENT ON TABLE email_templates IS '邮件模板表';

CREATE UNIQUE INDEX email_templates_name_key ON email_templates (name);
CREATE INDEX idx_email_templates_name ON email_templates (name);
CREATE INDEX idx_email_templates_type ON email_templates (template_type);


-- 权限表
DROP TABLE IF EXISTS permissions CASCADE;

CREATE TABLE permissions (
                             id UUID NOT NULL DEFAULT gen_random_uuid(),
                             name VARCHAR(50) NOT NULL,
                             code VARCHAR(50) NOT NULL,
                             resource VARCHAR(50) NOT NULL,
                             action VARCHAR(50) NOT NULL,
                             description VARCHAR(255),
                             category VARCHAR(50),
                             created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             PRIMARY KEY (id)
);

COMMENT ON COLUMN permissions.id IS '权限ID，主键';
COMMENT ON COLUMN permissions.name IS '权限名称';
COMMENT ON COLUMN permissions.code IS '权限代码，唯一索引，格式：resource:action';
COMMENT ON COLUMN permissions.resource IS '资源名称，如：user, role, menu';
COMMENT ON COLUMN permissions.action IS '操作类型：create-创建，read-读取，update-更新，delete-删除';
COMMENT ON COLUMN permissions.description IS '权限描述';
COMMENT ON COLUMN permissions.category IS '权限分类，如：用户管理、角色管理';
COMMENT ON COLUMN permissions.created_at IS '创建时间';
COMMENT ON COLUMN permissions.updated_at IS '更新时间';

COMMENT ON TABLE permissions IS '权限表';

CREATE INDEX idx_permissions_code ON permissions (code);
CREATE INDEX idx_permissions_resource ON permissions (resource);
CREATE UNIQUE INDEX permissions_code_key ON permissions (code);

-- Trigger: update_permissions_updated_at
CREATE TRIGGER update_permissions_updated_at
    BEFORE UPDATE
    ON permissions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();


-- 菜单表
DROP TABLE IF EXISTS menus CASCADE;

CREATE TABLE menus (
                       id UUID NOT NULL DEFAULT gen_random_uuid(),
                       parent_id UUID,
                       name VARCHAR(50) NOT NULL,
                       path VARCHAR(255),
                       component VARCHAR(255),
                       icon VARCHAR(50),
                       type enum_menus_type DEFAULT 'menu'::enum_menus_type,
                       visible BOOLEAN DEFAULT true,
                       sort INTEGER DEFAULT 0,
                       status enum_menus_status DEFAULT 'active'::enum_menus_status,
                       permission_code VARCHAR(50),
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       PRIMARY KEY (id)
);

COMMENT ON COLUMN menus.id IS '菜单ID，主键';
COMMENT ON COLUMN menus.parent_id IS '父菜单ID，顶级菜单为NULL';
COMMENT ON COLUMN menus.name IS '菜单名称';
COMMENT ON COLUMN menus.path IS '前端路由路径';
COMMENT ON COLUMN menus.component IS '前端组件路径';
COMMENT ON COLUMN menus.icon IS '菜单图标名称';
COMMENT ON COLUMN menus.type IS '菜单类型：menu-菜单，button-按钮，link-外链';
COMMENT ON COLUMN menus.visible IS '是否可见：true-显示，false-隐藏';
COMMENT ON COLUMN menus.sort IS '排序值，数值越小越靠前';
COMMENT ON COLUMN menus.status IS '菜单状态：active-启用，inactive-禁用';
COMMENT ON COLUMN menus.permission_code IS '关联的权限代码';
COMMENT ON COLUMN menus.created_at IS '创建时间';
COMMENT ON COLUMN menus.updated_at IS '更新时间';

COMMENT ON TABLE menus IS '菜单表';

CREATE INDEX idx_menus_parent_id ON menus (parent_id);
CREATE INDEX idx_menus_status ON menus (status);
CREATE INDEX idx_menus_type ON menus (type);

ALTER TABLE menus ADD CONSTRAINT fk_menus_parent_id
    FOREIGN KEY (parent_id)
        REFERENCES menus (id)
        ON DELETE CASCADE;

-- Trigger: update_menus_updated_at
CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE
    ON menus
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();


-- 测试商品表 - 用于测试代码生成器
DROP TABLE IF EXISTS test_products CASCADE;

CREATE TABLE test_products (
                               id UUID NOT NULL DEFAULT gen_random_uuid(),
                               name VARCHAR(200) NOT NULL,
                               description TEXT,
                               price NUMERIC NOT NULL DEFAULT 0,
                               stock INTEGER NOT NULL DEFAULT 0,
                               category VARCHAR(100),
                               status VARCHAR(20) NOT NULL DEFAULT 'active'::character varying,
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (id)
);

COMMENT ON COLUMN test_products.id IS '商品ID，主键';
COMMENT ON COLUMN test_products.name IS '商品名称';
COMMENT ON COLUMN test_products.description IS '商品描述';
COMMENT ON COLUMN test_products.price IS '商品价格';
COMMENT ON COLUMN test_products.stock IS '库存数量';
COMMENT ON COLUMN test_products.category IS '商品分类';
COMMENT ON COLUMN test_products.status IS '商品状态: active/inactive/discontinued';
COMMENT ON COLUMN test_products.created_at IS '创建时间';
COMMENT ON COLUMN test_products.updated_at IS '更新时间';

COMMENT ON TABLE test_products IS '测试商品表 - 用于测试代码生成器';

CREATE INDEX idx_test_products_category ON test_products (category);
CREATE INDEX idx_test_products_name ON test_products (name);
CREATE INDEX idx_test_products_status ON test_products (status);


-- 邮件发送记录表
DROP TABLE IF EXISTS email_logs CASCADE;

CREATE TABLE email_logs (
                            id UUID NOT NULL DEFAULT gen_random_uuid(),
                            to_email VARCHAR(255) NOT NULL,
                            subject VARCHAR(255) NOT NULL,
                            content TEXT,
                            template_name VARCHAR(100),
                            status VARCHAR(20) DEFAULT 'pending'::character varying,
                            error_message TEXT,
                            retry_count INTEGER DEFAULT 0,
                            sent_at TIMESTAMP WITH TIME ZONE,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (id)
);

COMMENT ON COLUMN email_logs.id IS '邮件记录ID，主键';
COMMENT ON COLUMN email_logs.to_email IS '收件人邮箱';
COMMENT ON COLUMN email_logs.subject IS '邮件主题';
COMMENT ON COLUMN email_logs.content IS '邮件内容';
COMMENT ON COLUMN email_logs.template_name IS '使用的模板名称';
COMMENT ON COLUMN email_logs.status IS '发送状态：pending, sent, failed';
COMMENT ON COLUMN email_logs.error_message IS '错误信息';
COMMENT ON COLUMN email_logs.retry_count IS '重试次数';
COMMENT ON COLUMN email_logs.sent_at IS '发送时间';
COMMENT ON COLUMN email_logs.created_at IS '创建时间';

COMMENT ON TABLE email_logs IS '邮件发送记录表';

CREATE INDEX idx_email_logs_created_at ON email_logs (created_at);
CREATE INDEX idx_email_logs_status ON email_logs (status);
CREATE INDEX idx_email_logs_template_name ON email_logs (template_name);
CREATE INDEX idx_email_logs_to_email ON email_logs (to_email);


-- 监控数据表
DROP TABLE IF EXISTS monitor_metrics CASCADE;

CREATE TABLE monitor_metrics (
                                 id UUID NOT NULL DEFAULT gen_random_uuid(),
                                 metric_type VARCHAR(50) NOT NULL,
                                 metric_name VARCHAR(100) NOT NULL,
                                 value NUMERIC NOT NULL,
                                 unit VARCHAR(20),
                                 tags JSON,
                                 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (id)
);

COMMENT ON COLUMN monitor_metrics.id IS '监控数据ID，主键';
COMMENT ON COLUMN monitor_metrics.metric_type IS '指标类型：system, application, database, cache';
COMMENT ON COLUMN monitor_metrics.metric_name IS '指标名称：cpu, memory, disk, etc.';
COMMENT ON COLUMN monitor_metrics.value IS '指标值';
COMMENT ON COLUMN monitor_metrics.unit IS '单位：%, MB, ms, etc.';
COMMENT ON COLUMN monitor_metrics.tags IS '额外的标签信息';
COMMENT ON COLUMN monitor_metrics.created_at IS '创建时间';

COMMENT ON TABLE monitor_metrics IS '监控数据表';

CREATE INDEX idx_monitor_metrics_created_at ON monitor_metrics (created_at);
CREATE INDEX idx_monitor_metrics_type ON monitor_metrics (metric_type);
CREATE INDEX idx_monitor_metrics_type_name ON monitor_metrics (metric_name, metric_type);
CREATE INDEX monitor_metrics_created_at ON monitor_metrics (created_at);
CREATE INDEX monitor_metrics_metric_type ON monitor_metrics (metric_type);
CREATE INDEX monitor_metrics_metric_type_metric_name ON monitor_metrics (metric_name, metric_type);


-- ==========================================
-- 第二层：依赖第一层的表
-- ==========================================

-- 角色表
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
                       id UUID NOT NULL DEFAULT gen_random_uuid(),
                       name VARCHAR(50) NOT NULL,
                       code VARCHAR(50) NOT NULL,
                       description VARCHAR(255),
                       status enum_roles_status DEFAULT 'active'::enum_roles_status,
                       sort INTEGER DEFAULT 0,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       deleted_at TIMESTAMP WITH TIME ZONE,
                       PRIMARY KEY (id)
);

COMMENT ON COLUMN roles.id IS '角色ID，主键';
COMMENT ON COLUMN roles.name IS '角色名称，唯一索引';
COMMENT ON COLUMN roles.code IS '角色代码，唯一索引，用于权限控制';
COMMENT ON COLUMN roles.description IS '角色描述';
COMMENT ON COLUMN roles.status IS '角色状态：active-启用，inactive-禁用';
COMMENT ON COLUMN roles.sort IS '排序值，数值越小越靠前';
COMMENT ON COLUMN roles.created_at IS '创建时间';
COMMENT ON COLUMN roles.updated_at IS '更新时间';
COMMENT ON COLUMN roles.deleted_at IS '软删除时间';

COMMENT ON TABLE roles IS '角色表';

CREATE INDEX idx_roles_code ON roles (code);
CREATE INDEX idx_roles_status ON roles (status);
CREATE UNIQUE INDEX roles_code_key ON roles (code);
CREATE UNIQUE INDEX roles_name_key ON roles (name);
CREATE UNIQUE INDEX roles_name_key1 ON roles (name);

-- Trigger: update_roles_updated_at
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE
    ON roles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();


-- 部门表（暂不添加 leader_id 外键约束）
DROP TABLE IF EXISTS departments CASCADE;

CREATE TABLE departments (
                             id UUID NOT NULL DEFAULT gen_random_uuid(),
                             parent_id UUID,
                             name VARCHAR(100) NOT NULL,
                             code VARCHAR(50),
                             leader_id UUID,
                             description TEXT,
                             sort INTEGER DEFAULT 0,
                             status enum_departments_status DEFAULT 'active'::enum_departments_status,
                             created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             PRIMARY KEY (id)
);

COMMENT ON COLUMN departments.id IS '部门ID，主键';
COMMENT ON COLUMN departments.parent_id IS '父部门ID，顶级部门为NULL';
COMMENT ON COLUMN departments.name IS '部门名称';
COMMENT ON COLUMN departments.code IS '部门代码，唯一标识';
COMMENT ON COLUMN departments.leader_id IS '部门负责人ID';
COMMENT ON COLUMN departments.description IS '部门描述';
COMMENT ON COLUMN departments.sort IS '排序值，数值越小越靠前';
COMMENT ON COLUMN departments.status IS '部门状态：active-启用，inactive-禁用';
COMMENT ON COLUMN departments.created_at IS '创建时间';
COMMENT ON COLUMN departments.updated_at IS '更新时间';

COMMENT ON TABLE departments IS '部门表';

CREATE UNIQUE INDEX departments_code_key ON departments (code);
CREATE INDEX idx_departments_code ON departments (code);
CREATE INDEX idx_departments_leader_id ON departments (leader_id);
CREATE INDEX idx_departments_parent_id ON departments (parent_id);
CREATE INDEX idx_departments_status ON departments (status);

-- 添加部门自引用的外键约束
ALTER TABLE departments ADD CONSTRAINT fk_departments_parent_id
    FOREIGN KEY (parent_id)
        REFERENCES departments (id)
        ON DELETE RESTRICT;


-- ==========================================
-- 第三层：用户表（依赖 departments）
-- ==========================================

-- 用户表
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
                       id UUID NOT NULL DEFAULT gen_random_uuid(),
                       username VARCHAR(50) NOT NULL,
                       email VARCHAR(100) NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       real_name VARCHAR(50),
                       phone VARCHAR(20),
                       avatar VARCHAR(255),
                       status enum_users_status DEFAULT 'active'::enum_users_status,
                       last_login_at TIMESTAMP WITH TIME ZONE,
                       last_login_ip VARCHAR(45),
                       created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                       updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
                       deleted_at TIMESTAMP WITH TIME ZONE,
                       department_id UUID,
                       PRIMARY KEY (id)
);

COMMENT ON COLUMN users.id IS '用户ID，主键';
COMMENT ON COLUMN users.username IS '用户名，唯一索引';
COMMENT ON COLUMN users.email IS '邮箱地址，唯一索引';
COMMENT ON COLUMN users.password IS '密码，bcrypt加密存储';
COMMENT ON COLUMN users.real_name IS '真实姓名';
COMMENT ON COLUMN users.phone IS '手机号，唯一索引';
COMMENT ON COLUMN users.avatar IS '用户头像URL';
COMMENT ON COLUMN users.status IS '用户状态：active-正常，inactive-禁用，banned-封禁';
COMMENT ON COLUMN users.last_login_at IS '最后登录时间';
COMMENT ON COLUMN users.last_login_ip IS '最后登录IP地址';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';
COMMENT ON COLUMN users.deleted_at IS '软删除时间';
COMMENT ON COLUMN users.department_id IS '所属部门ID';

COMMENT ON TABLE users IS '用户表';

CREATE INDEX idx_users_department_id ON users (department_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_username ON users (username);
CREATE UNIQUE INDEX users_email_key ON users (email);
CREATE UNIQUE INDEX users_email_key1 ON users (email);
CREATE UNIQUE INDEX users_phone_key ON users (phone);
CREATE UNIQUE INDEX users_phone_key1 ON users (phone);
CREATE UNIQUE INDEX users_username_key ON users (username);
CREATE UNIQUE INDEX users_username_key1 ON users (username);

ALTER TABLE users ADD CONSTRAINT fk_users_department_id
    FOREIGN KEY (department_id)
        REFERENCES departments (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

-- Trigger: update_users_updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE
    ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();


-- ==========================================
-- 第四层：添加 departments 的 leader_id 外键约束
-- ==========================================

-- 现在可以安全地添加 departments 到 users 的外键约束了
ALTER TABLE departments ADD CONSTRAINT fk_departments_leader_id
    FOREIGN KEY (leader_id)
        REFERENCES users (id)
        ON DELETE SET NULL;


-- ==========================================
-- 第五层：依赖 users 和其他基础表的表
-- ==========================================

-- 告警规则表
DROP TABLE IF EXISTS alert_rules CASCADE;

CREATE TABLE alert_rules (
                             id UUID NOT NULL DEFAULT gen_random_uuid(),
                             name VARCHAR(100) NOT NULL,
                             metric_type VARCHAR(50) NOT NULL,
                             condition VARCHAR(20) NOT NULL,
                             threshold NUMERIC NOT NULL,
                             duration INTEGER,
                             enabled BOOLEAN DEFAULT true,
                             created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             metric_name VARCHAR(50) NOT NULL,
                             level VARCHAR(20) DEFAULT 'warning'::character varying,
                             alert_enabled BOOLEAN NOT NULL DEFAULT false,
                             alert_template_id UUID,
                             alert_recipients JSON,
                             alert_interval INTEGER NOT NULL DEFAULT 1800,
                             PRIMARY KEY (id)
);

COMMENT ON COLUMN alert_rules.id IS '告警规则ID，主键';
COMMENT ON COLUMN alert_rules.name IS '规则名称';
COMMENT ON COLUMN alert_rules.metric_type IS '监控类型';
COMMENT ON COLUMN alert_rules.condition IS '条件：>, <, >=, <=, ==';
COMMENT ON COLUMN alert_rules.threshold IS '阈值';
COMMENT ON COLUMN alert_rules.duration IS '持续时间（秒）';
COMMENT ON COLUMN alert_rules.enabled IS '是否启用';
COMMENT ON COLUMN alert_rules.created_at IS '创建时间';
COMMENT ON COLUMN alert_rules.updated_at IS '更新时间';
COMMENT ON COLUMN alert_rules.metric_name IS '监控指标名称';
COMMENT ON COLUMN alert_rules.level IS '告警级别：info, warning, error, critical';
COMMENT ON COLUMN alert_rules.alert_enabled IS '是否启用邮件告警';
COMMENT ON COLUMN alert_rules.alert_template_id IS '告警邮件模版ID';
COMMENT ON COLUMN alert_rules.alert_recipients IS '告警接收人邮箱列表';
COMMENT ON COLUMN alert_rules.alert_interval IS '告警间隔（秒）- 持续异常时的告警发送间隔，默认30分钟';

COMMENT ON TABLE alert_rules IS '告警规则表';

CREATE INDEX alert_rules_enabled ON alert_rules (enabled);
CREATE INDEX alert_rules_metric_type ON alert_rules (metric_type);
CREATE INDEX idx_alert_rules_enabled ON alert_rules (enabled);
CREATE INDEX idx_alert_rules_metric_type ON alert_rules (metric_type);

ALTER TABLE alert_rules ADD CONSTRAINT fk_alert_rules_alert_template_id
    FOREIGN KEY (alert_template_id)
        REFERENCES email_templates (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;


-- 告警历史表
DROP TABLE IF EXISTS alert_history CASCADE;

CREATE TABLE alert_history (
                               id UUID NOT NULL DEFAULT gen_random_uuid(),
                               rule_id UUID NOT NULL,
                               message TEXT NOT NULL,
                               level VARCHAR(20) DEFAULT 'warning'::character varying,
                               status VARCHAR(20) DEFAULT 'pending'::character varying,
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               resolved_at TIMESTAMP WITH TIME ZONE,
                               PRIMARY KEY (id)
);

COMMENT ON COLUMN alert_history.id IS '告警历史ID，主键';
COMMENT ON COLUMN alert_history.rule_id IS '告警规则ID';
COMMENT ON COLUMN alert_history.message IS '告警信息';
COMMENT ON COLUMN alert_history.level IS '告警级别：info, warning, error, critical';
COMMENT ON COLUMN alert_history.status IS '状态：pending, resolved';
COMMENT ON COLUMN alert_history.created_at IS '创建时间';
COMMENT ON COLUMN alert_history.resolved_at IS '解决时间';

COMMENT ON TABLE alert_history IS '告警历史表';

CREATE INDEX alert_history_created_at ON alert_history (created_at);
CREATE INDEX alert_history_level ON alert_history (level);
CREATE INDEX alert_history_rule_id ON alert_history (rule_id);
CREATE INDEX alert_history_status ON alert_history (status);
CREATE INDEX idx_alert_history_created_at ON alert_history (created_at);
CREATE INDEX idx_alert_history_level ON alert_history (level);
CREATE INDEX idx_alert_history_rule_id ON alert_history (rule_id);
CREATE INDEX idx_alert_history_status ON alert_history (status);

ALTER TABLE alert_history ADD CONSTRAINT fk_alert_history_rule_id
    FOREIGN KEY (rule_id)
        REFERENCES alert_rules (id)
        ON DELETE CASCADE;


-- 接口监控配置表
DROP TABLE IF EXISTS api_monitors CASCADE;

CREATE TABLE api_monitors (
                              id UUID NOT NULL DEFAULT gen_random_uuid(),
                              name VARCHAR(100) NOT NULL,
                              url VARCHAR(500) NOT NULL,
                              method VARCHAR(10) DEFAULT 'GET'::character varying,
                              headers JSON,
                              body TEXT,
                              interval INTEGER DEFAULT 60,
                              timeout INTEGER DEFAULT 30,
                              expect_status INTEGER DEFAULT 200,
                              expect_response TEXT,
                              enabled BOOLEAN DEFAULT true,
                              created_by UUID NOT NULL,
                              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                              alert_enabled BOOLEAN NOT NULL DEFAULT false,
                              alert_template_id UUID,
                              alert_recipients JSON,
                              variable_mapping JSON,
                              alert_interval INTEGER NOT NULL DEFAULT 1800,
                              PRIMARY KEY (id)
);

COMMENT ON COLUMN api_monitors.id IS '接口监控ID，主键';
COMMENT ON COLUMN api_monitors.name IS '监控名称';
COMMENT ON COLUMN api_monitors.url IS '监控的URL';
COMMENT ON COLUMN api_monitors.method IS '请求方法：GET, POST, PUT, DELETE';
COMMENT ON COLUMN api_monitors.headers IS '请求头';
COMMENT ON COLUMN api_monitors.body IS '请求体';
COMMENT ON COLUMN api_monitors.interval IS '检测间隔（秒）';
COMMENT ON COLUMN api_monitors.timeout IS '超时时间（秒）';
COMMENT ON COLUMN api_monitors.expect_status IS '期望的状态码';
COMMENT ON COLUMN api_monitors.expect_response IS '期望的响应内容（可选）';
COMMENT ON COLUMN api_monitors.enabled IS '是否启用';
COMMENT ON COLUMN api_monitors.created_by IS '创建者ID';
COMMENT ON COLUMN api_monitors.created_at IS '创建时间';
COMMENT ON COLUMN api_monitors.updated_at IS '更新时间';
COMMENT ON COLUMN api_monitors.alert_enabled IS '是否启用告警';
COMMENT ON COLUMN api_monitors.alert_template_id IS '告警邮件模版ID';
COMMENT ON COLUMN api_monitors.alert_recipients IS '告警接收人邮箱列表';
COMMENT ON COLUMN api_monitors.variable_mapping IS '变量映射配置：{ 模版变量名: 数据字段路径 }';
COMMENT ON COLUMN api_monitors.alert_interval IS '告警间隔（秒）- 持续异常时的告警发送间隔';

COMMENT ON TABLE api_monitors IS '接口监控配置表';

CREATE INDEX api_monitors_created_by ON api_monitors (created_by);
CREATE INDEX api_monitors_enabled ON api_monitors (enabled);
CREATE INDEX idx_api_monitors_alert_enabled ON api_monitors (alert_enabled);
CREATE INDEX idx_api_monitors_alert_template ON api_monitors (alert_template_id);
CREATE INDEX idx_api_monitors_created_by ON api_monitors (created_by);
CREATE INDEX idx_api_monitors_enabled ON api_monitors (enabled);

ALTER TABLE api_monitors ADD CONSTRAINT fk_api_monitors_created_by
    FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE CASCADE;
ALTER TABLE api_monitors ADD CONSTRAINT fk_api_monitors_alert_template_id
    FOREIGN KEY (alert_template_id)
        REFERENCES email_templates (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;


-- 接口监控历史表
DROP TABLE IF EXISTS api_monitor_logs CASCADE;

CREATE TABLE api_monitor_logs (
                                  id UUID NOT NULL DEFAULT gen_random_uuid(),
                                  monitor_id UUID NOT NULL,
                                  status VARCHAR(20) NOT NULL,
                                  status_code INTEGER,
                                  response_time INTEGER,
                                  response_body TEXT,
                                  error_message TEXT,
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                  PRIMARY KEY (id)
);

COMMENT ON COLUMN api_monitor_logs.id IS '监控日志ID，主键';
COMMENT ON COLUMN api_monitor_logs.monitor_id IS '监控配置ID';
COMMENT ON COLUMN api_monitor_logs.status IS '状态：success, failed, timeout';
COMMENT ON COLUMN api_monitor_logs.status_code IS 'HTTP状态码';
COMMENT ON COLUMN api_monitor_logs.response_time IS '响应时间（毫秒）';
COMMENT ON COLUMN api_monitor_logs.response_body IS '响应内容（截取前1000字符）';
COMMENT ON COLUMN api_monitor_logs.error_message IS '错误信息';
COMMENT ON COLUMN api_monitor_logs.created_at IS '创建时间';

COMMENT ON TABLE api_monitor_logs IS '接口监控历史表';

CREATE INDEX api_monitor_logs_created_at ON api_monitor_logs (created_at);
CREATE INDEX api_monitor_logs_monitor_id ON api_monitor_logs (monitor_id);
CREATE INDEX api_monitor_logs_status ON api_monitor_logs (status);
CREATE INDEX idx_api_monitor_logs_created_at ON api_monitor_logs (created_at);
CREATE INDEX idx_api_monitor_logs_monitor_id ON api_monitor_logs (monitor_id);
CREATE INDEX idx_api_monitor_logs_status ON api_monitor_logs (status);

ALTER TABLE api_monitor_logs ADD CONSTRAINT fk_api_monitor_logs_monitor_id
    FOREIGN KEY (monitor_id)
        REFERENCES api_monitors (id)
        ON DELETE CASCADE;


-- 文件夹表
DROP TABLE IF EXISTS folders CASCADE;

CREATE TABLE folders (
                         id UUID NOT NULL DEFAULT gen_random_uuid(),
                         name VARCHAR(255) NOT NULL,
                         parent_id UUID,
                         created_by UUID NOT NULL,
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                         PRIMARY KEY (id)
);

COMMENT ON COLUMN folders.id IS '文件夹ID，主键';
COMMENT ON COLUMN folders.name IS '文件夹名称';
COMMENT ON COLUMN folders.parent_id IS '父文件夹ID，顶级文件夹为NULL';
COMMENT ON COLUMN folders.created_by IS '创建者ID';
COMMENT ON COLUMN folders.created_at IS '创建时间';
COMMENT ON COLUMN folders.updated_at IS '更新时间';

COMMENT ON TABLE folders IS '文件夹表';

CREATE INDEX idx_folders_created_by ON folders (created_by);
CREATE INDEX idx_folders_name ON folders (name);
CREATE INDEX idx_folders_parent_id ON folders (parent_id);

ALTER TABLE folders ADD CONSTRAINT fk_folders_parent_id
    FOREIGN KEY (parent_id)
        REFERENCES folders (id)
        ON DELETE CASCADE;
ALTER TABLE folders ADD CONSTRAINT fk_folders_created_by
    FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE CASCADE;


-- 文件表
DROP TABLE IF EXISTS files CASCADE;

CREATE TABLE files (
                       id UUID NOT NULL DEFAULT gen_random_uuid(),
                       filename VARCHAR(255) NOT NULL,
                       original_name VARCHAR(255) NOT NULL,
                       mime_type VARCHAR(100),
                       size BIGINT,
                       path VARCHAR(500) NOT NULL,
                       bucket VARCHAR(100) NOT NULL,
                       folder_id UUID,
                       uploaded_by UUID NOT NULL,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       PRIMARY KEY (id)
);

COMMENT ON COLUMN files.id IS '文件ID，主键';
COMMENT ON COLUMN files.filename IS '存储的文件名（UUID+扩展名）';
COMMENT ON COLUMN files.original_name IS '原始文件名';
COMMENT ON COLUMN files.mime_type IS '文件MIME类型';
COMMENT ON COLUMN files.size IS '文件大小（字节）';
COMMENT ON COLUMN files.path IS 'Minio中的文件路径';
COMMENT ON COLUMN files.bucket IS 'Minio bucket名称';
COMMENT ON COLUMN files.folder_id IS '所属文件夹ID，NULL表示根目录';
COMMENT ON COLUMN files.uploaded_by IS '上传者ID';
COMMENT ON COLUMN files.created_at IS '创建时间';
COMMENT ON COLUMN files.updated_at IS '更新时间';

COMMENT ON TABLE files IS '文件表';

CREATE INDEX idx_files_created_at ON files (created_at);
CREATE INDEX idx_files_folder_id ON files (folder_id);
CREATE INDEX idx_files_mime_type ON files (mime_type);
CREATE INDEX idx_files_original_name ON files (original_name);
CREATE INDEX idx_files_uploaded_by ON files (uploaded_by);

ALTER TABLE files ADD CONSTRAINT fk_files_folder_id
    FOREIGN KEY (folder_id)
        REFERENCES folders (id)
        ON DELETE CASCADE;
ALTER TABLE files ADD CONSTRAINT fk_files_uploaded_by
    FOREIGN KEY (uploaded_by)
        REFERENCES users (id)
        ON DELETE CASCADE;


-- 文件分享表
DROP TABLE IF EXISTS file_shares CASCADE;

CREATE TABLE file_shares (
                             id UUID NOT NULL DEFAULT gen_random_uuid(),
                             file_id UUID NOT NULL,
                             share_code VARCHAR(100) NOT NULL,
                             expires_at TIMESTAMP WITH TIME ZONE,
                             created_by UUID NOT NULL,
                             created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             PRIMARY KEY (id)
);

COMMENT ON COLUMN file_shares.id IS '分享ID，主键';
COMMENT ON COLUMN file_shares.file_id IS '文件ID';
COMMENT ON COLUMN file_shares.share_code IS '分享码，唯一标识';
COMMENT ON COLUMN file_shares.expires_at IS '过期时间，NULL表示永不过期';
COMMENT ON COLUMN file_shares.created_by IS '创建者ID';
COMMENT ON COLUMN file_shares.created_at IS '创建时间';

COMMENT ON TABLE file_shares IS '文件分享表';

CREATE UNIQUE INDEX file_shares_share_code_key ON file_shares (share_code);
CREATE INDEX idx_file_shares_created_by ON file_shares (created_by);
CREATE INDEX idx_file_shares_expires_at ON file_shares (expires_at);
CREATE INDEX idx_file_shares_file_id ON file_shares (file_id);
CREATE INDEX idx_file_shares_share_code ON file_shares (share_code);

ALTER TABLE file_shares ADD CONSTRAINT fk_file_shares_file_id
    FOREIGN KEY (file_id)
        REFERENCES files (id)
        ON DELETE CASCADE;
ALTER TABLE file_shares ADD CONSTRAINT fk_file_shares_created_by
    FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE CASCADE;


-- 代码生成器-模块配置表
DROP TABLE IF EXISTS generated_modules CASCADE;

CREATE TABLE generated_modules (
                                   id UUID NOT NULL DEFAULT gen_random_uuid(),
                                   table_name VARCHAR(100) NOT NULL,
                                   module_name VARCHAR(100) NOT NULL,
                                   module_path VARCHAR(200) NOT NULL,
                                   description TEXT,
                                   menu_name VARCHAR(100),
                                   menu_icon VARCHAR(50),
                                   menu_parent_id UUID,
                                   menu_sort INTEGER DEFAULT 0,
                                   enable_create BOOLEAN DEFAULT true,
                                   enable_update BOOLEAN DEFAULT true,
                                   enable_delete BOOLEAN DEFAULT true,
                                   enable_batch_delete BOOLEAN DEFAULT true,
                                   enable_export BOOLEAN DEFAULT false,
                                   enable_import BOOLEAN DEFAULT false,
                                   generated_files JSON,
                                   created_by UUID,
                                   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                   page_config JSONB,
                                   PRIMARY KEY (id)
);

COMMENT ON COLUMN generated_modules.id IS '模块ID，主键';
COMMENT ON COLUMN generated_modules.table_name IS '数据库表名（唯一）';
COMMENT ON COLUMN generated_modules.module_name IS '模块名称（如 Product）';
COMMENT ON COLUMN generated_modules.module_path IS '路由路径（如 /products）';
COMMENT ON COLUMN generated_modules.description IS '模块描述';
COMMENT ON COLUMN generated_modules.menu_name IS '菜单名称';
COMMENT ON COLUMN generated_modules.menu_icon IS '菜单图标';
COMMENT ON COLUMN generated_modules.menu_parent_id IS '父菜单ID';
COMMENT ON COLUMN generated_modules.menu_sort IS '菜单排序';
COMMENT ON COLUMN generated_modules.enable_create IS '是否支持新增';
COMMENT ON COLUMN generated_modules.enable_update IS '是否支持编辑';
COMMENT ON COLUMN generated_modules.enable_delete IS '是否支持删除';
COMMENT ON COLUMN generated_modules.enable_batch_delete IS '是否支持批量删除';
COMMENT ON COLUMN generated_modules.enable_export IS '是否支持导出';
COMMENT ON COLUMN generated_modules.enable_import IS '是否支持导入';
COMMENT ON COLUMN generated_modules.generated_files IS '生成的文件列表';
COMMENT ON COLUMN generated_modules.created_by IS '创建人';
COMMENT ON COLUMN generated_modules.created_at IS '创建时间';
COMMENT ON COLUMN generated_modules.updated_at IS '更新时间';
COMMENT ON COLUMN generated_modules.page_config IS '前端页面配置（JSON格式），用于动态渲染页面';

COMMENT ON TABLE generated_modules IS '代码生成器-模块配置表';

CREATE UNIQUE INDEX generated_modules_table_name_key ON generated_modules (table_name);
CREATE INDEX idx_generated_modules_created_by ON generated_modules (created_by);
CREATE UNIQUE INDEX idx_generated_modules_module_path ON generated_modules (module_path);
CREATE INDEX idx_generated_modules_table_name ON generated_modules (table_name);

ALTER TABLE generated_modules ADD CONSTRAINT fk_generated_modules_created_by
    FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE SET NULL;


-- 代码生成器-字段配置表
DROP TABLE IF EXISTS generated_fields CASCADE;

CREATE TABLE generated_fields (
                                  id UUID NOT NULL DEFAULT gen_random_uuid(),
                                  module_id UUID NOT NULL,
                                  field_name VARCHAR(100) NOT NULL,
                                  field_type VARCHAR(50),
                                  field_comment VARCHAR(255),
                                  is_searchable BOOLEAN DEFAULT false,
                                  search_type VARCHAR(20),
                                  search_component VARCHAR(50),
                                  show_in_list BOOLEAN DEFAULT true,
                                  list_sort INTEGER DEFAULT 0,
                                  list_width VARCHAR(20),
                                  list_align VARCHAR(10) DEFAULT 'left'::character varying,
                                  format_type VARCHAR(50),
                                  format_options JSON,
                                  show_in_form BOOLEAN DEFAULT true,
                                  form_component VARCHAR(50),
                                  form_rules JSON,
                                  is_readonly BOOLEAN DEFAULT false,
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                  PRIMARY KEY (id)
);

COMMENT ON COLUMN generated_fields.id IS '字段配置ID，主键';
COMMENT ON COLUMN generated_fields.module_id IS '模块ID';
COMMENT ON COLUMN generated_fields.field_name IS '字段名称';
COMMENT ON COLUMN generated_fields.field_type IS '字段类型';
COMMENT ON COLUMN generated_fields.field_comment IS '字段注释';
COMMENT ON COLUMN generated_fields.is_searchable IS '是否作为搜索条件';
COMMENT ON COLUMN generated_fields.search_type IS '搜索方式: exact/like/range/in';
COMMENT ON COLUMN generated_fields.search_component IS '搜索组件: input/select/date-picker';
COMMENT ON COLUMN generated_fields.show_in_list IS '是否在列表显示';
COMMENT ON COLUMN generated_fields.list_sort IS '列表显示顺序';
COMMENT ON COLUMN generated_fields.list_width IS '列宽度（如 150px）';
COMMENT ON COLUMN generated_fields.list_align IS '对齐方式: left/center/right';
COMMENT ON COLUMN generated_fields.format_type IS '格式化类型: mask/date/money/enum/link/combine';
COMMENT ON COLUMN generated_fields.format_options IS '格式化选项';
COMMENT ON COLUMN generated_fields.show_in_form IS '是否在表单显示';
COMMENT ON COLUMN generated_fields.form_component IS '表单组件类型';
COMMENT ON COLUMN generated_fields.form_rules IS '表单验证规则';
COMMENT ON COLUMN generated_fields.is_readonly IS '是否只读';
COMMENT ON COLUMN generated_fields.created_at IS '创建时间';
COMMENT ON COLUMN generated_fields.updated_at IS '更新时间';

COMMENT ON TABLE generated_fields IS '代码生成器-字段配置表';

CREATE INDEX idx_generated_fields_list_sort ON generated_fields (list_sort);
CREATE INDEX idx_generated_fields_module_id ON generated_fields (module_id);

ALTER TABLE generated_fields ADD CONSTRAINT fk_generated_fields_module_id
    FOREIGN KEY (module_id)
        REFERENCES generated_modules (id)
        ON DELETE CASCADE;


-- 代码生成器-生成历史表
DROP TABLE IF EXISTS generation_history CASCADE;

CREATE TABLE generation_history (
                                    id UUID NOT NULL DEFAULT gen_random_uuid(),
                                    module_id UUID,
                                    table_name VARCHAR(100),
                                    module_name VARCHAR(100),
                                    action VARCHAR(20),
                                    files_generated JSON,
                                    created_by UUID,
                                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                    success BOOLEAN DEFAULT true,
                                    error_message TEXT,
                                    operation_type VARCHAR(20),
                                    generated_by UUID,
                                    PRIMARY KEY (id)
);

COMMENT ON COLUMN generation_history.id IS '历史记录ID，主键';
COMMENT ON COLUMN generation_history.module_id IS '模块ID';
COMMENT ON COLUMN generation_history.table_name IS '数据库表名';
COMMENT ON COLUMN generation_history.module_name IS '模块名称';
COMMENT ON COLUMN generation_history.action IS '操作类型: create/update/delete (已废弃，使用operation_type)';
COMMENT ON COLUMN generation_history.files_generated IS '生成的文件列表';
COMMENT ON COLUMN generation_history.created_by IS '操作人';
COMMENT ON COLUMN generation_history.created_at IS '创建时间';
COMMENT ON COLUMN generation_history.success IS '是否成功';
COMMENT ON COLUMN generation_history.error_message IS '错误信息';
COMMENT ON COLUMN generation_history.operation_type IS '操作类型: create/update/delete';
COMMENT ON COLUMN generation_history.generated_by IS '操作人';

COMMENT ON TABLE generation_history IS '代码生成器-生成历史表';

CREATE INDEX idx_generation_history_created_at ON generation_history (created_at);
CREATE INDEX idx_generation_history_created_by ON generation_history (created_by);
CREATE INDEX idx_generation_history_module_id ON generation_history (module_id);

ALTER TABLE generation_history ADD CONSTRAINT fk_generation_history_module_id
    FOREIGN KEY (module_id)
        REFERENCES generated_modules (id)
        ON DELETE SET NULL;
ALTER TABLE generation_history ADD CONSTRAINT fk_generation_history_created_by
    FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE SET NULL;
ALTER TABLE generation_history ADD CONSTRAINT fk_generation_history_generated_by
    FOREIGN KEY (generated_by)
        REFERENCES users (id)
        ON DELETE SET NULL;


-- 用户通知配置表
DROP TABLE IF EXISTS notification_settings CASCADE;

CREATE TABLE notification_settings (
                                       id UUID NOT NULL DEFAULT gen_random_uuid(),
                                       user_id UUID NOT NULL,
                                       email_enabled BOOLEAN DEFAULT true,
                                       push_enabled BOOLEAN DEFAULT true,
                                       system_notification BOOLEAN DEFAULT true,
                                       warning_notification BOOLEAN DEFAULT true,
                                       error_notification BOOLEAN DEFAULT true,
                                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                       PRIMARY KEY (id)
);

COMMENT ON COLUMN notification_settings.id IS '通知配置ID，主键';
COMMENT ON COLUMN notification_settings.user_id IS '用户ID（唯一）';
COMMENT ON COLUMN notification_settings.email_enabled IS '是否启用邮件通知';
COMMENT ON COLUMN notification_settings.push_enabled IS '是否启用推送通知';
COMMENT ON COLUMN notification_settings.system_notification IS '是否接收系统通知';
COMMENT ON COLUMN notification_settings.warning_notification IS '是否接收警告通知';
COMMENT ON COLUMN notification_settings.error_notification IS '是否接收错误通知';
COMMENT ON COLUMN notification_settings.created_at IS '创建时间';
COMMENT ON COLUMN notification_settings.updated_at IS '更新时间';

COMMENT ON TABLE notification_settings IS '用户通知配置表';

CREATE INDEX idx_notification_settings_user_id ON notification_settings (user_id);
CREATE UNIQUE INDEX notification_settings_user_id_key ON notification_settings (user_id);

ALTER TABLE notification_settings ADD CONSTRAINT fk_notification_settings_user_id
    FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE;


-- 站内通知表
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
                               id UUID NOT NULL DEFAULT gen_random_uuid(),
                               user_id UUID NOT NULL,
                               title VARCHAR(255) NOT NULL,
                               content TEXT,
                               type VARCHAR(50) DEFAULT 'info'::character varying,
                               link VARCHAR(500),
                               is_read BOOLEAN DEFAULT false,
                               read_at TIMESTAMP WITH TIME ZONE,
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (id)
);

COMMENT ON COLUMN notifications.id IS '通知ID，主键';
COMMENT ON COLUMN notifications.user_id IS '用户ID';
COMMENT ON COLUMN notifications.title IS '通知标题';
COMMENT ON COLUMN notifications.content IS '通知内容';
COMMENT ON COLUMN notifications.type IS '通知类型：info, system, warning, error, success';
COMMENT ON COLUMN notifications.link IS '点击跳转链接';
COMMENT ON COLUMN notifications.is_read IS '是否已读';
COMMENT ON COLUMN notifications.read_at IS '阅读时间';
COMMENT ON COLUMN notifications.created_at IS '创建时间';

COMMENT ON TABLE notifications IS '站内通知表';

CREATE INDEX idx_notifications_created_at ON notifications (created_at);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);
CREATE INDEX idx_notifications_type ON notifications (type);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_user_read ON notifications (is_read, user_id);

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id
    FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE;


-- ==========================================
-- 第六层：关联表（依赖 roles, menus, permissions, users）
-- ==========================================

-- 角色菜单关联表
DROP TABLE IF EXISTS role_menus CASCADE;

CREATE TABLE role_menus (
                            id UUID NOT NULL DEFAULT gen_random_uuid(),
                            role_id UUID NOT NULL,
                            menu_id UUID NOT NULL,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (id)
);

COMMENT ON COLUMN role_menus.id IS '关联ID，主键';
COMMENT ON COLUMN role_menus.role_id IS '角色ID，外键关联roles表';
COMMENT ON COLUMN role_menus.menu_id IS '菜单ID，外键关联menus表';
COMMENT ON COLUMN role_menus.created_at IS '创建时间';

COMMENT ON TABLE role_menus IS '角色菜单关联表';

CREATE INDEX idx_role_menus_menu_id ON role_menus (menu_id);
CREATE INDEX idx_role_menus_role_id ON role_menus (role_id);
CREATE UNIQUE INDEX role_menus_role_id_menu_id_unique ON role_menus (menu_id, role_id);

ALTER TABLE role_menus ADD CONSTRAINT fk_role_menus_role_id
    FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE;
ALTER TABLE role_menus ADD CONSTRAINT fk_role_menus_menu_id
    FOREIGN KEY (menu_id)
        REFERENCES menus (id)
        ON DELETE CASCADE;


-- 角色权限关联表
DROP TABLE IF EXISTS role_permissions CASCADE;

CREATE TABLE role_permissions (
                                  id UUID NOT NULL DEFAULT gen_random_uuid(),
                                  role_id UUID NOT NULL,
                                  permission_id UUID NOT NULL,
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                  PRIMARY KEY (id)
);

COMMENT ON COLUMN role_permissions.id IS '关联ID，主键';
COMMENT ON COLUMN role_permissions.role_id IS '角色ID，外键关联roles表';
COMMENT ON COLUMN role_permissions.permission_id IS '权限ID，外键关联permissions表';
COMMENT ON COLUMN role_permissions.created_at IS '创建时间';

COMMENT ON TABLE role_permissions IS '角色权限关联表';

CREATE INDEX idx_role_permissions_permission_id ON role_permissions (permission_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions (role_id);
CREATE UNIQUE INDEX role_permissions_role_id_permission_id_unique ON role_permissions (permission_id, role_id);

ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_role_id
    FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_permission_id
    FOREIGN KEY (permission_id)
        REFERENCES permissions (id)
        ON DELETE CASCADE;


-- 用户角色关联表
DROP TABLE IF EXISTS user_roles CASCADE;

CREATE TABLE user_roles (
                            id UUID NOT NULL DEFAULT gen_random_uuid(),
                            user_id UUID NOT NULL,
                            role_id UUID NOT NULL,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (id)
);

COMMENT ON COLUMN user_roles.id IS '关联ID，主键';
COMMENT ON COLUMN user_roles.user_id IS '用户ID，外键关联users表';
COMMENT ON COLUMN user_roles.role_id IS '角色ID，外键关联roles表';
COMMENT ON COLUMN user_roles.created_at IS '创建时间';

COMMENT ON TABLE user_roles IS '用户角色关联表';

CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE UNIQUE INDEX user_roles_user_id_role_id_unique ON user_roles (role_id, user_id);

ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user_id
    FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_role_id
    FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE;

-- ========================================
-- 文件权限管理系统
-- ========================================

-- 文件权限表

DROP TABLE IF EXISTS file_permissions CASCADE;

CREATE TABLE file_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  resource_type VARCHAR(20) NOT NULL,  -- 'file' | 'folder'
  resource_id UUID NOT NULL,           -- file_id or folder_id
  user_id UUID,                        -- NULL表示角色权限
  role_id UUID,                        -- NULL表示用户权限
  permission VARCHAR(20) NOT NULL,     -- 'read' | 'write' | 'delete' | 'admin'
  granted_by UUID,                     -- 授权人user_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),

  -- 约束：user_id 和 role_id 不能同时为 NULL
  CONSTRAINT chk_file_permissions_user_or_role CHECK (
    (user_id IS NOT NULL AND role_id IS NULL) OR
    (user_id IS NULL AND role_id IS NOT NULL)
  )
);

COMMENT ON COLUMN file_permissions.id IS '权限ID，主键';
COMMENT ON COLUMN file_permissions.resource_type IS '资源类型：file(文件) 或 folder(文件夹)';
COMMENT ON COLUMN file_permissions.resource_id IS '资源ID（文件ID或文件夹ID）';
COMMENT ON COLUMN file_permissions.user_id IS '用户ID，NULL表示这是角色权限';
COMMENT ON COLUMN file_permissions.role_id IS '角色ID，NULL表示这是用户权限';
COMMENT ON COLUMN file_permissions.permission IS '权限类型：read(读)、write(写)、delete(删除)、admin(管理)';
COMMENT ON COLUMN file_permissions.granted_by IS '授权人ID';
COMMENT ON COLUMN file_permissions.created_at IS '创建时间';
COMMENT ON COLUMN file_permissions.updated_at IS '更新时间';

COMMENT ON TABLE file_permissions IS '文件和文件夹权限表';

CREATE INDEX idx_file_permissions_resource ON file_permissions(resource_type, resource_id);
CREATE INDEX idx_file_permissions_user ON file_permissions(user_id);
CREATE INDEX idx_file_permissions_role ON file_permissions(role_id);
CREATE INDEX idx_file_permissions_granted_by ON file_permissions(granted_by);

ALTER TABLE file_permissions ADD CONSTRAINT fk_file_permissions_user
    FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE;
ALTER TABLE file_permissions ADD CONSTRAINT fk_file_permissions_role
    FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE;
ALTER TABLE file_permissions ADD CONSTRAINT fk_file_permissions_granted_by
    FOREIGN KEY (granted_by)
        REFERENCES users (id)
        ON DELETE SET NULL;

-- 为文件权限表添加updated_at触发器
CREATE TRIGGER update_file_permissions_updated_at
BEFORE UPDATE ON file_permissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 修改folders表，添加权限继承字段
ALTER TABLE folders ADD COLUMN IF NOT EXISTS inherit_permissions BOOLEAN DEFAULT TRUE;
COMMENT ON COLUMN folders.inherit_permissions IS '是否继承父文件夹权限，默认为TRUE';

-- 修改files表，添加权限继承字段
ALTER TABLE files ADD COLUMN IF NOT EXISTS inherit_permissions BOOLEAN DEFAULT TRUE;
COMMENT ON COLUMN files.inherit_permissions IS '是否继承所在文件夹权限，默认为TRUE';


-- ========================================
-- 完成提示
-- ========================================

SELECT '✅ 数据库迁移完成：代码生成器已扩展支持动态SQL和字段分组' AS status;