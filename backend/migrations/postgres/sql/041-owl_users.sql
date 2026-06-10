DROP TABLE IF EXISTS owl_users CASCADE;

CREATE TABLE owl_users (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255),
    real_name character varying(50),
    phone character varying(20),
    avatar character varying(255),
    status enum_owl_users_status DEFAULT 'active'::enum_owl_users_status,
    last_login_at timestamp with time zone,
    last_login_ip character varying(45),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    department_id uuid
);

COMMENT ON TABLE owl_users IS '用户表';

COMMENT ON COLUMN owl_users.id IS '用户ID，主键';
COMMENT ON COLUMN owl_users.username IS '用户名，唯一索引';
COMMENT ON COLUMN owl_users.email IS '邮箱地址，唯一索引';
COMMENT ON COLUMN owl_users.password IS '密码，bcrypt加密存储';
COMMENT ON COLUMN owl_users.real_name IS '真实姓名';
COMMENT ON COLUMN owl_users.phone IS '手机号，唯一索引';
COMMENT ON COLUMN owl_users.avatar IS '用户头像URL';
COMMENT ON COLUMN owl_users.status IS '用户状态：active-正常，inactive-禁用，banned-封禁';
COMMENT ON COLUMN owl_users.last_login_at IS '最后登录时间';
COMMENT ON COLUMN owl_users.last_login_ip IS '最后登录IP地址';
COMMENT ON COLUMN owl_users.created_at IS '创建时间';
COMMENT ON COLUMN owl_users.updated_at IS '更新时间';
COMMENT ON COLUMN owl_users.deleted_at IS '软删除时间';
COMMENT ON COLUMN owl_users.department_id IS '所属部门ID';

DROP INDEX IF EXISTS idx_owl_users_department_id CASCADE;
DROP INDEX IF EXISTS idx_owl_users_email CASCADE;
DROP INDEX IF EXISTS idx_owl_users_phone CASCADE;
DROP INDEX IF EXISTS idx_owl_users_status CASCADE;
DROP INDEX IF EXISTS idx_owl_users_username CASCADE;

CREATE INDEX idx_owl_users_department_id ON owl_users (department_id);
CREATE INDEX idx_owl_users_email ON owl_users (email);
CREATE INDEX idx_owl_users_phone ON owl_users (phone);
CREATE INDEX idx_owl_users_status ON owl_users (status);
CREATE INDEX idx_owl_users_username ON owl_users (username);
