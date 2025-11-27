-- 创建接口配置表
CREATE TABLE IF NOT EXISTS api_interfaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sql_query TEXT NOT NULL,
  method VARCHAR(20) DEFAULT 'GET',
  endpoint VARCHAR(255) NOT NULL,
  version INTEGER DEFAULT 1,
  parameters JSONB,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  require_auth BOOLEAN DEFAULT true,
  rate_limit INTEGER DEFAULT 1000,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (endpoint, version)
);

-- 添加表注释
COMMENT ON TABLE api_interfaces IS '接口配置表';
COMMENT ON COLUMN api_interfaces.id IS '接口ID，主键';
COMMENT ON COLUMN api_interfaces.name IS '接口名称';
COMMENT ON COLUMN api_interfaces.description IS '接口描述';
COMMENT ON COLUMN api_interfaces.sql_query IS 'SQL查询语句';
COMMENT ON COLUMN api_interfaces.method IS '请求方式：GET/POST/PUT/DELETE';
COMMENT ON COLUMN api_interfaces.endpoint IS '接口端点路径';
COMMENT ON COLUMN api_interfaces.version IS '接口版本号';
COMMENT ON COLUMN api_interfaces.parameters IS '接口参数定义';
COMMENT ON COLUMN api_interfaces.status IS '接口状态';
COMMENT ON COLUMN api_interfaces.require_auth IS '是否需要认证';
COMMENT ON COLUMN api_interfaces.rate_limit IS '每小时请求限制';
COMMENT ON COLUMN api_interfaces.created_by IS '创建者ID';
COMMENT ON COLUMN api_interfaces.created_at IS '创建时间';
COMMENT ON COLUMN api_interfaces.updated_at IS '更新时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_api_interfaces_status ON api_interfaces(status);
CREATE INDEX IF NOT EXISTS idx_api_interfaces_created_by ON api_interfaces(created_by);
CREATE INDEX IF NOT EXISTS idx_api_interfaces_endpoint ON api_interfaces(endpoint);
CREATE UNIQUE INDEX IF NOT EXISTS uk_api_interfaces_endpoint_version ON api_interfaces(endpoint, version);

-- 创建API密钥表
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interface_id UUID NOT NULL REFERENCES api_interfaces(id) ON DELETE CASCADE,
  app_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  api_secret VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  expires_at TIMESTAMP NOT NULL,
  last_used_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加表注释
COMMENT ON TABLE api_keys IS 'API密钥表';
COMMENT ON COLUMN api_keys.id IS '密钥ID，主键';
COMMENT ON COLUMN api_keys.interface_id IS '关联的接口ID';
COMMENT ON COLUMN api_keys.app_name IS '应用名称';
COMMENT ON COLUMN api_keys.api_key IS 'API密钥';
COMMENT ON COLUMN api_keys.api_secret IS 'API密钥加密值';
COMMENT ON COLUMN api_keys.status IS '密钥状态';
COMMENT ON COLUMN api_keys.expires_at IS '密钥过期时间（3天后）';
COMMENT ON COLUMN api_keys.last_used_at IS '最后使用时间';
COMMENT ON COLUMN api_keys.created_by IS '创建者ID';
COMMENT ON COLUMN api_keys.created_at IS '创建时间';
COMMENT ON COLUMN api_keys.updated_at IS '更新时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_api_keys_interface_id ON api_keys(interface_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- 注：api_call_logs 表不需要创建，日志存储在文件系统中