-- ============================================
-- 数据脱敏相关表
-- ============================================

-- 敏感字段配置表
create type if not exists enum_owl_sensitive_fields_mask_type as enum ('phone', 'email', 'id_card', 'bank_card', 'name', 'address', 'custom');

create table if not exists owl_sensitive_fields
(
    id          uuid                                            default gen_random_uuid() not null
        primary key,
    table_name  varchar(100)                                                            not null,
    field_name  varchar(100)                                                            not null,
    mask_type   enum_owl_sensitive_fields_mask_type             default 'custom'::enum_owl_sensitive_fields_mask_type not null,
    mask_rule   jsonb,
    description varchar(255),
    is_active   boolean                                         default true              not null,
    created_at  timestamp with time zone                        default CURRENT_TIMESTAMP not null,
    updated_at  timestamp with time zone                        default CURRENT_TIMESTAMP not null,
    constraint uk_owl_sensitive_fields_table_field unique (table_name, field_name)
);

comment on table owl_sensitive_fields is '敏感字段配置表';
comment on column owl_sensitive_fields.id is '主键ID';
comment on column owl_sensitive_fields.table_name is '表名';
comment on column owl_sensitive_fields.field_name is '字段名';
comment on column owl_sensitive_fields.mask_type is '脱敏类型：phone-手机号, email-邮箱, id_card-身份证, bank_card-银行卡, name-姓名, address-地址, custom-自定义';
comment on column owl_sensitive_fields.mask_rule is '自定义脱敏规则（JSON格式）';
comment on column owl_sensitive_fields.description is '字段描述';
comment on column owl_sensitive_fields.is_active is '是否启用';
comment on column owl_sensitive_fields.created_at is '创建时间';
comment on column owl_sensitive_fields.updated_at is '更新时间';

create index if not exists idx_owl_sensitive_fields_table_name on owl_sensitive_fields (table_name);
create index if not exists idx_owl_sensitive_fields_is_active on owl_sensitive_fields (is_active);

CREATE TRIGGER IF NOT EXISTS update_sensitive_fields_updated_at BEFORE UPDATE ON owl_sensitive_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
