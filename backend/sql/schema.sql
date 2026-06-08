drop type if exists enum_owl_email_logs_status cascade;

drop type if exists enum_owl_notifications_type cascade;

drop type if exists enum_owl_user_sessions_status cascade;

drop table if exists "owl_SequelizeMeta" cascade;

drop table if exists "owl_SequelizeData" cascade;

drop table if exists owl_alert_history cascade;

drop table if exists owl_alert_rules cascade;

drop table if exists owl_api_monitor_logs cascade;

drop table if exists owl_api_monitors cascade;

drop table if exists owl_email_logs cascade;

drop table if exists owl_email_templates cascade;

drop table if exists owl_file_shares cascade;

drop table if exists owl_files cascade;

drop table if exists owl_folders cascade;

drop table if exists owl_generated_fields cascade;

drop table if exists owl_generation_history cascade;

drop table if exists owl_generated_modules cascade;

drop table if exists owl_monitor_metrics cascade;

drop table if exists owl_notification_settings cascade;

drop table if exists owl_notifications cascade;

drop table if exists owl_role_menus cascade;

drop table if exists owl_menus cascade;

drop type if exists enum_owl_menus_status cascade;

drop type if exists enum_owl_menus_type cascade;

drop type if exists enum_owl_menus_menu_type cascade;

drop table if exists owl_role_permissions cascade;

drop table if exists owl_permissions cascade;

drop table if exists owl_test_products cascade;

drop table if exists owl_user_roles cascade;

drop table if exists owl_file_permissions cascade;

drop table if exists owl_roles cascade;

drop type if exists enum_owl_roles_status cascade;

drop table if exists owl_api_call_logs cascade;

drop table if exists owl_api_keys cascade;

drop table if exists owl_api_interfaces cascade;

drop table if exists owl_test_insert cascade;

drop table if exists owl_watermark_config cascade;

drop table if exists owl_users cascade;

drop type if exists enum_owl_users_status cascade;

drop table if exists owl_departments cascade;

drop type if exists enum_owl_departments_status cascade;

drop table if exists owl_user_sessions cascade;

drop table if exists owl_system_configs cascade;

drop table if exists owl_third_party_api_keys cascade;

drop table if exists owl_user_third_party_accounts cascade;

create type enum_owl_departments_status as enum ('active', 'inactive');

create type enum_owl_email_logs_status as enum ('pending', 'sent', 'failed');

create type enum_owl_menus_status as enum ('active', 'inactive');

create type enum_owl_menus_type as enum ('menu', 'button', 'link');

create type enum_owl_menus_menu_type as enum ('business', 'system');

create type enum_owl_notifications_type as enum ('info', 'system', 'warning', 'error', 'success');

create type enum_owl_roles_status as enum ('active', 'inactive');

create type enum_owl_users_status as enum ('active', 'inactive', 'banned');

create type enum_owl_user_sessions_status as enum ('active', 'kicked', 'expired');

create table if not exists "owl_SequelizeMeta"
(
    name varchar(255) not null
    primary key
    );

create table if not exists "owl_SequelizeData"
(
    name varchar(255) not null
    primary key
    );

create table if not exists owl_alert_history
(
    id          uuid                     default gen_random_uuid() not null
    primary key,
    rule_id     uuid                                               not null,
    message     text                                               not null,
    level       varchar(20)              default 'warning'::character varying,
    status      varchar(20)              default 'pending'::character varying,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP,
    resolved_at timestamp with time zone
                              );

comment on table owl_alert_history is '告警历史表';

comment on column owl_alert_history.id is '告警历史ID，主键';

comment on column owl_alert_history.rule_id is '告警规则ID';

comment on column owl_alert_history.message is '告警信息';

comment on column owl_alert_history.level is '告警级别：info, warning, error, critical';

comment on column owl_alert_history.status is '状态：pending, resolved';

comment on column owl_alert_history.created_at is '创建时间';

comment on column owl_alert_history.resolved_at is '解决时间';

create index if not exists owl_alert_history_created_at
    on owl_alert_history (created_at);

create index if not exists owl_alert_history_level
    on owl_alert_history (level);

create index if not exists owl_alert_history_rule_id
    on owl_alert_history (rule_id);

create index if not exists owl_alert_history_status
    on owl_alert_history (status);

create index if not exists idx_owl_alert_history_created_at
    on owl_alert_history (created_at);

create index if not exists idx_owl_alert_history_level
    on owl_alert_history (level);

create index if not exists idx_owl_alert_history_rule_id
    on owl_alert_history (rule_id);

create index if not exists idx_owl_alert_history_status
    on owl_alert_history (status);

create table if not exists owl_alert_rules
(
    id                uuid                     default gen_random_uuid() not null
    primary key,
    name              varchar(100)                                       not null,
    metric_type       varchar(50)                                        not null,
    condition         varchar(20)                                        not null,
    threshold         numeric                                            not null,
    duration          integer,
    enabled           boolean                  default true,
    created_at        timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at        timestamp with time zone default CURRENT_TIMESTAMP,
                                    metric_name       varchar(50)                                        not null,
    level             varchar(20)              default 'warning'::character varying,
    alert_enabled     boolean                  default false             not null,
    alert_template_id uuid,
    alert_recipients  json,
    alert_interval    integer                  default 1800              not null
    );

comment on table owl_alert_rules is '告警规则表';

comment on column owl_alert_rules.id is '告警规则ID，主键';

comment on column owl_alert_rules.name is '规则名称';

comment on column owl_alert_rules.metric_type is '监控类型';

comment on column owl_alert_rules.condition is '条件：>, <, >=, <=, ==';

comment on column owl_alert_rules.threshold is '阈值';

comment on column owl_alert_rules.duration is '持续时间（秒）';

comment on column owl_alert_rules.enabled is '是否启用';

comment on column owl_alert_rules.created_at is '创建时间';

comment on column owl_alert_rules.updated_at is '更新时间';

comment on column owl_alert_rules.metric_name is '监控指标名称';

comment on column owl_alert_rules.level is '告警级别：info, warning, error, critical';

comment on column owl_alert_rules.alert_enabled is '是否启用邮件告警';

comment on column owl_alert_rules.alert_template_id is '告警邮件模版ID';

comment on column owl_alert_rules.alert_recipients is '告警接收人邮箱列表';

comment on column owl_alert_rules.alert_interval is '告警间隔（秒）- 持续异常时的告警发送间隔，默认30分钟';

create index if not exists owl_alert_rules_enabled
    on owl_alert_rules (enabled);

create index if not exists owl_alert_rules_metric_type
    on owl_alert_rules (metric_type);

create index if not exists idx_owl_alert_rules_enabled
    on owl_alert_rules (enabled);

create index if not exists idx_owl_alert_rules_metric_type
    on owl_alert_rules (metric_type);

create table if not exists owl_api_monitor_logs
(
    id            uuid                     default gen_random_uuid() not null
    primary key,
    monitor_id    uuid                                               not null,
    status        varchar(20)                                        not null,
    status_code   integer,
    response_time integer,
    response_body text,
    error_message text,
    created_at    timestamp with time zone default CURRENT_TIMESTAMP
                                );

comment on table owl_api_monitor_logs is '接口监控历史表';

comment on column owl_api_monitor_logs.id is '监控日志ID，主键';

comment on column owl_api_monitor_logs.monitor_id is '监控配置ID';

comment on column owl_api_monitor_logs.status is '状态：success, failed, timeout';

comment on column owl_api_monitor_logs.status_code is 'HTTP状态码';

comment on column owl_api_monitor_logs.response_time is '响应时间（毫秒）';

comment on column owl_api_monitor_logs.response_body is '响应内容（截取前1000字符）';

comment on column owl_api_monitor_logs.error_message is '错误信息';

comment on column owl_api_monitor_logs.created_at is '创建时间';

create index if not exists owl_api_monitor_logs_created_at
    on owl_api_monitor_logs (created_at);

create index if not exists owl_api_monitor_logs_monitor_id
    on owl_api_monitor_logs (monitor_id);

create index if not exists owl_api_monitor_logs_status
    on owl_api_monitor_logs (status);

create index if not exists idx_owl_api_monitor_logs_created_at
    on owl_api_monitor_logs (created_at);

create index if not exists idx_owl_api_monitor_logs_monitor_id
    on owl_api_monitor_logs (monitor_id);

create index if not exists idx_owl_api_monitor_logs_status
    on owl_api_monitor_logs (status);

create table if not exists owl_api_monitors
(
    id                uuid                     default gen_random_uuid() not null
    primary key,
    name              varchar(100)                                       not null,
    url               varchar(500)                                       not null,
    method            varchar(10)              default 'GET'::character varying,
    headers           json,
    body              text,
    interval          integer                  default 60,
    timeout           integer                  default 30,
    expect_status     integer                  default 200,
    expect_response   text,
    enabled           boolean                  default true,
    created_by        uuid                                               not null,
    created_at        timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at        timestamp with time zone default CURRENT_TIMESTAMP,
                                    alert_enabled     boolean                  default false             not null,
                                    alert_template_id uuid,
                                    alert_recipients  json,
                                    variable_mapping  json,
                                    alert_interval    integer                  default 1800              not null
                                    );

comment on table owl_api_monitors is '接口监控配置表';

comment on column owl_api_monitors.id is '接口监控ID，主键';

comment on column owl_api_monitors.name is '监控名称';

comment on column owl_api_monitors.url is '监控的URL';

comment on column owl_api_monitors.method is '请求方法：GET, POST, PUT, DELETE';

comment on column owl_api_monitors.headers is '请求头';

comment on column owl_api_monitors.body is '请求体';

comment on column owl_api_monitors.interval is '检测间隔（秒）';

comment on column owl_api_monitors.timeout is '超时时间（秒）';

comment on column owl_api_monitors.expect_status is '期望的状态码';

comment on column owl_api_monitors.expect_response is '期望的响应内容（可选）';

comment on column owl_api_monitors.enabled is '是否启用';

comment on column owl_api_monitors.created_by is '创建者ID';

comment on column owl_api_monitors.created_at is '创建时间';

comment on column owl_api_monitors.updated_at is '更新时间';

comment on column owl_api_monitors.alert_enabled is '是否启用告警';

comment on column owl_api_monitors.alert_template_id is '告警邮件模版ID';

comment on column owl_api_monitors.alert_recipients is '告警接收人邮箱列表';

comment on column owl_api_monitors.variable_mapping is '变量映射配置：{ 模版变量名: 数据字段路径 }';

comment on column owl_api_monitors.alert_interval is '告警间隔（秒）- 持续异常时的告警发送间隔';

create index if not exists owl_api_monitors_created_by
    on owl_api_monitors (created_by);

create index if not exists owl_api_monitors_enabled
    on owl_api_monitors (enabled);

create index if not exists idx_owl_api_monitors_alert_enabled
    on owl_api_monitors (alert_enabled);

create index if not exists idx_owl_api_monitors_alert_template
    on owl_api_monitors (alert_template_id);

create index if not exists idx_owl_api_monitors_created_by
    on owl_api_monitors (created_by);

create index if not exists idx_owl_api_monitors_enabled
    on owl_api_monitors (enabled);

create table if not exists owl_departments
(
    id          uuid                     default gen_random_uuid() not null
    primary key,
    parent_id   uuid
    constraint fk_departments_parent_id
    references owl_departments
    on delete restrict,
    name        varchar(100)                                       not null,
    code        varchar(50),
    leader_id   uuid,
    description text,
    sort        integer                  default 0,
    status      enum_owl_departments_status  default 'active'::enum_owl_departments_status,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP
        );

comment on table owl_departments is '部门表';

comment on column owl_departments.id is '部门ID，主键';

comment on column owl_departments.parent_id is '父部门ID，顶级部门为NULL';

comment on column owl_departments.name is '部门名称';

comment on column owl_departments.code is '部门代码，唯一标识';

comment on column owl_departments.leader_id is '部门负责人ID';

comment on column owl_departments.description is '部门描述';

comment on column owl_departments.sort is '排序值，数值越小越靠前';

comment on column owl_departments.status is '部门状态：active-启用，inactive-禁用';

comment on column owl_departments.created_at is '创建时间';

comment on column owl_departments.updated_at is '更新时间';

create unique index if not exists owl_departments_code_key
    on owl_departments (code);

create index if not exists idx_owl_departments_code
    on owl_departments (code);

create index if not exists idx_owl_departments_leader_id
    on owl_departments (leader_id);

create index if not exists idx_owl_departments_parent_id
    on owl_departments (parent_id);

create index if not exists idx_owl_departments_status
    on owl_departments (status);

create table if not exists owl_email_logs
(
    id            uuid                     default gen_random_uuid() not null
    primary key,
    to_email      varchar(255)                                       not null,
    subject       varchar(255)                                       not null,
    content       text,
    template_name varchar(100),
    status        varchar(20)              default 'pending'::character varying,
    error_message text,
    retry_count   integer                  default 0,
    sent_at       timestamp with time zone,
    created_at    timestamp with time zone default CURRENT_TIMESTAMP
                                );

comment on table owl_email_logs is '邮件发送记录表';

comment on column owl_email_logs.id is '邮件记录ID，主键';

comment on column owl_email_logs.to_email is '收件人邮箱';

comment on column owl_email_logs.subject is '邮件主题';

comment on column owl_email_logs.content is '邮件内容';

comment on column owl_email_logs.template_name is '使用的模板名称';

comment on column owl_email_logs.status is '发送状态：pending, sent, failed';

comment on column owl_email_logs.error_message is '错误信息';

comment on column owl_email_logs.retry_count is '重试次数';

comment on column owl_email_logs.sent_at is '发送时间';

comment on column owl_email_logs.created_at is '创建时间';

create index if not exists idx_owl_email_logs_created_at
    on owl_email_logs (created_at);

create index if not exists idx_owl_email_logs_status
    on owl_email_logs (status);

create index if not exists idx_owl_email_logs_template_name
    on owl_email_logs (template_name);

create index if not exists idx_owl_email_logs_to_email
    on owl_email_logs (to_email);

create table if not exists owl_email_templates
(
    id              uuid                     default gen_random_uuid() not null
    primary key,
    name            varchar(100)                                       not null,
    subject         varchar(255)                                       not null,
    content         text                                               not null,
    variables       json,
    description     text,
    created_at      timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at      timestamp with time zone default CURRENT_TIMESTAMP,
                                  template_type   varchar(50)              default 'GENERAL_NOTIFICATION'::character varying,
    variable_schema json,
    tags            json                     default '[]'::json
    );

comment on table owl_email_templates is '邮件模板表';

comment on column owl_email_templates.id is '邮件模板ID，主键';

comment on column owl_email_templates.name is '模板名称（唯一）';

comment on column owl_email_templates.subject is '邮件主题';

comment on column owl_email_templates.content is 'HTML模板内容（支持handlebars语法）';

comment on column owl_email_templates.variables is '模板变量说明';

comment on column owl_email_templates.description is '模板描述';

comment on column owl_email_templates.created_at is '创建时间';

comment on column owl_email_templates.updated_at is '更新时间';

comment on column owl_email_templates.template_type is '模版类型：API_MONITOR_ALERT, SYSTEM_ALERT, GENERAL_NOTIFICATION';

comment on column owl_email_templates.variable_schema is '变量Schema定义：[{ name, label, description, type, required, defaultValue, example }]';

comment on column owl_email_templates.tags is '标签列表：["monitoring", "alert", "api"]，替代固定分类';

create unique index if not exists owl_email_templates_name_key
    on owl_email_templates (name);

create index if not exists idx_owl_email_templates_name
    on owl_email_templates (name);

create index if not exists idx_owl_email_templates_type
    on owl_email_templates (template_type);

create table if not exists owl_file_shares
(
    id         uuid                     default gen_random_uuid() not null
    primary key,
    file_id    uuid                                               not null,
    share_code varchar(100)                                       not null,
    expires_at timestamp with time zone,
    created_by uuid                                               not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP
                             );

comment on table owl_file_shares is '文件分享表';

comment on column owl_file_shares.id is '分享ID，主键';

comment on column owl_file_shares.file_id is '文件ID';

comment on column owl_file_shares.share_code is '分享码，唯一标识';

comment on column owl_file_shares.expires_at is '过期时间，NULL表示永不过期';

comment on column owl_file_shares.created_by is '创建者ID';

comment on column owl_file_shares.created_at is '创建时间';

create unique index if not exists owl_file_shares_share_code_key
    on owl_file_shares (share_code);

create index if not exists idx_owl_file_shares_created_by
    on owl_file_shares (created_by);

create index if not exists idx_owl_file_shares_expires_at
    on owl_file_shares (expires_at);

create index if not exists idx_owl_file_shares_file_id
    on owl_file_shares (file_id);

create index if not exists idx_owl_file_shares_share_code
    on owl_file_shares (share_code);

create table if not exists owl_files
(
    id                  uuid                     default gen_random_uuid() not null
    primary key,
    filename            varchar(255)                                       not null,
    original_name       varchar(255)                                       not null,
    mime_type           varchar(100),
    size                bigint,
    path                varchar(500)                                       not null,
    bucket              varchar(100)                                       not null,
    folder_id           uuid,
    uploaded_by         uuid                                               not null,
    created_at          timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at          timestamp with time zone default CURRENT_TIMESTAMP,
                                      inherit_permissions boolean                  default true
                                      );

comment on table owl_files is '文件表';

comment on column owl_files.id is '文件ID，主键';

comment on column owl_files.filename is '存储的文件名（UUID+扩展名）';

comment on column owl_files.original_name is '原始文件名';

comment on column owl_files.mime_type is '文件MIME类型';

comment on column owl_files.size is '文件大小（字节）';

comment on column owl_files.path is 'Minio中的文件路径';

comment on column owl_files.bucket is 'Minio bucket名称';

comment on column owl_files.folder_id is '所属文件夹ID，NULL表示根目录';

comment on column owl_files.uploaded_by is '上传者ID';

comment on column owl_files.created_at is '创建时间';

comment on column owl_files.updated_at is '更新时间';

comment on column owl_files.inherit_permissions is '是否继承所在文件夹权限，默认为TRUE';

create index if not exists idx_owl_files_created_at
    on owl_files (created_at);

create index if not exists idx_owl_files_folder_id
    on owl_files (folder_id);

create index if not exists idx_owl_files_mime_type
    on owl_files (mime_type);

create index if not exists idx_owl_files_original_name
    on owl_files (original_name);

create index if not exists idx_owl_files_uploaded_by
    on owl_files (uploaded_by);

create table if not exists owl_folders
(
    id                  uuid                     default gen_random_uuid() not null
    primary key,
    name                varchar(255)                                       not null,
    parent_id           uuid
    constraint fk_folders_parent_id
    references owl_folders
    on delete cascade,
    created_by          uuid                                               not null,
    created_at          timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at          timestamp with time zone default CURRENT_TIMESTAMP,
        inherit_permissions boolean                  default true
        );

comment on table owl_folders is '文件夹表';

comment on column owl_folders.id is '文件夹ID，主键';

comment on column owl_folders.name is '文件夹名称';

comment on column owl_folders.parent_id is '父文件夹ID，顶级文件夹为NULL';

comment on column owl_folders.created_by is '创建者ID';

comment on column owl_folders.created_at is '创建时间';

comment on column owl_folders.updated_at is '更新时间';

comment on column owl_folders.inherit_permissions is '是否继承父文件夹权限，默认为TRUE';

create index if not exists idx_owl_folders_created_by
    on owl_folders (created_by);

create index if not exists idx_owl_folders_name
    on owl_folders (name);

create index if not exists idx_owl_folders_parent_id
    on owl_folders (parent_id);

create table if not exists owl_generated_fields
(
    id               uuid                     default gen_random_uuid() not null
    primary key,
    module_id        uuid                                               not null,
    field_name       varchar(100)                                       not null,
    field_type       varchar(50),
    field_comment    varchar(255),
    is_searchable    boolean                  default false,
    search_type      varchar(20),
    search_component varchar(50),
    show_in_list     boolean                  default true,
    list_sort        integer                  default 0,
    list_width       varchar(20),
    list_align       varchar(10)              default 'left'::character varying,
    format_type      varchar(50),
    format_options   json,
    show_in_form     boolean                  default true,
    form_component   varchar(50),
    form_rules       json,
    is_readonly      boolean                  default false,
    created_at       timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at       timestamp with time zone default CURRENT_TIMESTAMP,
                                   field_group      varchar(50)              default 'default'::character varying,
    show_in_detail   boolean                  default true,
    detail_sort      integer                  default 0,
    detail_label     varchar(100),
    detail_component varchar(50)
    );

comment on table owl_generated_fields is '代码生成器-字段配置表';

comment on column owl_generated_fields.id is '字段配置ID，主键';

comment on column owl_generated_fields.module_id is '模块ID';

comment on column owl_generated_fields.field_name is '字段名称';

comment on column owl_generated_fields.field_type is '字段类型';

comment on column owl_generated_fields.field_comment is '字段注释';

comment on column owl_generated_fields.is_searchable is '是否作为搜索条件';

comment on column owl_generated_fields.search_type is '搜索方式: exact/like/range/in';

comment on column owl_generated_fields.search_component is '搜索组件: input/select/date-picker';

comment on column owl_generated_fields.show_in_list is '是否在列表显示';

comment on column owl_generated_fields.list_sort is '列表显示顺序';

comment on column owl_generated_fields.list_width is '列宽度（如 150px）';

comment on column owl_generated_fields.list_align is '对齐方式: left/center/right';

comment on column owl_generated_fields.format_type is '格式化类型: mask/date/money/enum/link/combine';

comment on column owl_generated_fields.format_options is '格式化选项';

comment on column owl_generated_fields.show_in_form is '是否在表单显示';

comment on column owl_generated_fields.form_component is '表单组件类型';

comment on column owl_generated_fields.form_rules is '表单验证规则';

comment on column owl_generated_fields.is_readonly is '是否只读';

comment on column owl_generated_fields.created_at is '创建时间';

comment on column owl_generated_fields.updated_at is '更新时间';

comment on column owl_generated_fields.field_group is '字段所属分组（信息簇）';

comment on column owl_generated_fields.show_in_detail is '是否在详情页显示';

comment on column owl_generated_fields.detail_sort is '详情页显示顺序（数字越小越靠前）';

comment on column owl_generated_fields.detail_label is '详情页显示标签（自定义字段名称）';

comment on column owl_generated_fields.detail_component is '详情页显示组件类型';

create index if not exists idx_owl_generated_fields_list_sort
    on owl_generated_fields (list_sort);

create index if not exists idx_owl_generated_fields_module_id
    on owl_generated_fields (module_id);

create table if not exists owl_generated_modules
(
    id                  uuid                     default gen_random_uuid() not null
    primary key,
    table_name          varchar(100)                                       not null,
    module_name         varchar(100)                                       not null,
    module_path         varchar(200)                                       not null,
    description         text,
    menu_name           varchar(100),
    menu_icon           varchar(50),
    menu_parent_id      uuid,
    menu_sort           integer                  default 0,
    enable_create       boolean                  default true,
    enable_update       boolean                  default true,
    enable_delete       boolean                  default true,
    enable_batch_delete boolean                  default true,
    enable_export       boolean                  default false,
    enable_import       boolean                  default false,
    generated_files     json,
    created_by          uuid,
    created_at          timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at          timestamp with time zone default CURRENT_TIMESTAMP,
                                      page_config         jsonb,
                                      custom_sql          text,
                                      sql_parameters      jsonb                    default '[]'::jsonb,
                                      sql_primary_key     varchar(50)              default 'id'::character varying,
    detail_display_mode varchar(20)              default 'dialog'::character varying,
    detail_url_pattern  varchar(200)
    );

comment on table owl_generated_modules is '代码生成器-模块配置表';

comment on column owl_generated_modules.id is '模块ID，主键';

comment on column owl_generated_modules.table_name is '数据库表名（唯一）';

comment on column owl_generated_modules.module_name is '模块名称（如 Product）';

comment on column owl_generated_modules.module_path is '路由路径（如 /products）';

comment on column owl_generated_modules.description is '模块描述';

comment on column owl_generated_modules.menu_name is '菜单名称';

comment on column owl_generated_modules.menu_icon is '菜单图标';

comment on column owl_generated_modules.menu_parent_id is '父菜单ID';

comment on column owl_generated_modules.menu_sort is '菜单排序';

comment on column owl_generated_modules.enable_create is '是否支持新增';

comment on column owl_generated_modules.enable_update is '是否支持编辑';

comment on column owl_generated_modules.enable_delete is '是否支持删除';

comment on column owl_generated_modules.enable_batch_delete is '是否支持批量删除';

comment on column owl_generated_modules.enable_export is '是否支持导出';

comment on column owl_generated_modules.enable_import is '是否支持导入';

comment on column owl_generated_modules.generated_files is '生成的文件列表';

comment on column owl_generated_modules.created_by is '创建人';

comment on column owl_generated_modules.created_at is '创建时间';

comment on column owl_generated_modules.updated_at is '更新时间';

comment on column owl_generated_modules.page_config is '前端页面配置（JSON格式），用于动态渲染页面';

comment on column owl_generated_modules.custom_sql is '自定义SQL查询语句（支持多表查询）';

comment on column owl_generated_modules.sql_parameters is 'SQL参数配置（参数化查询）';

comment on column owl_generated_modules.sql_primary_key is '动态SQL查询结果的主键字段名';

comment on column owl_generated_modules.detail_display_mode is '详情展示模式: dialog(弹窗) | page(独立页面)';

comment on column owl_generated_modules.detail_url_pattern is '详情页URL模式（Page模式使用）';

create unique index if not exists owl_generated_modules_table_name_key
    on owl_generated_modules (table_name);

create index if not exists idx_owl_generated_modules_created_by
    on owl_generated_modules (created_by);

create unique index if not exists idx_owl_generated_modules_module_path
    on owl_generated_modules (module_path);

create index if not exists idx_owl_generated_modules_table_name
    on owl_generated_modules (table_name);

create table if not exists owl_generation_history
(
    id              uuid                     default gen_random_uuid() not null
    primary key,
    module_id       uuid
    constraint fk_generation_history_module_id
    references owl_generated_modules
    on delete set null,
    table_name      varchar(100),
    module_name     varchar(100),
    action          varchar(20),
    files_generated json,
    created_by      uuid,
    created_at      timestamp with time zone default CURRENT_TIMESTAMP,
        success         boolean                  default true,
        error_message   text,
        operation_type  varchar(20),
    generated_by    uuid
    );

comment on table owl_generation_history is '代码生成器-生成历史表';

comment on column owl_generation_history.id is '历史记录ID，主键';

comment on column owl_generation_history.module_id is '模块ID';

comment on column owl_generation_history.table_name is '数据库表名';

comment on column owl_generation_history.module_name is '模块名称';

comment on column owl_generation_history.action is '操作类型: create/update/delete (已废弃，使用operation_type)';

comment on column owl_generation_history.files_generated is '生成的文件列表';

comment on column owl_generation_history.created_by is '操作人';

comment on column owl_generation_history.created_at is '创建时间';

comment on column owl_generation_history.success is '是否成功';

comment on column owl_generation_history.error_message is '错误信息';

comment on column owl_generation_history.operation_type is '操作类型: create/update/delete';

comment on column owl_generation_history.generated_by is '操作人';

create index if not exists idx_owl_generation_history_created_at
    on owl_generation_history (created_at);

create index if not exists idx_owl_generation_history_created_by
    on owl_generation_history (created_by);

create index if not exists idx_owl_generation_history_module_id
    on owl_generation_history (module_id);

create table if not exists owl_menus
(
    id              uuid                     default gen_random_uuid() not null
    primary key,
    parent_id       uuid
    constraint fk_menus_parent_id
    references owl_menus
    on delete cascade,
    name            varchar(50)                                        not null,
    path            varchar(255),
    component       varchar(255),
    icon            varchar(50),
    type            enum_owl_menus_type          default 'menu'::enum_owl_menus_type,
    visible         boolean                  default true,
    sort            integer                  default 0,
    status          enum_owl_menus_status        default 'active'::enum_owl_menus_status,
    permission_code varchar(50),
    created_at      timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at      timestamp with time zone default CURRENT_TIMESTAMP
        );

comment on table owl_menus is '菜单表';

comment on column owl_menus.id is '菜单ID，主键';

comment on column owl_menus.parent_id is '父菜单ID，顶级菜单为NULL';

comment on column owl_menus.name is '菜单名称';

comment on column owl_menus.path is '前端路由路径';

comment on column owl_menus.component is '前端组件路径';

comment on column owl_menus.icon is '菜单图标名称';

comment on column owl_menus.type is '菜单类型：menu-菜单，button-按钮，link-外链';

comment on column owl_menus.visible is '是否可见：true-显示，false-隐藏';

comment on column owl_menus.sort is '排序值，数值越小越靠前';

comment on column owl_menus.status is '菜单状态：active-启用，inactive-禁用';

comment on column owl_menus.permission_code is '关联的权限代码';

comment on column owl_menus.created_at is '创建时间';

comment on column owl_menus.updated_at is '更新时间';

create index if not exists idx_owl_menus_parent_id
    on owl_menus (parent_id);

create index if not exists idx_owl_menus_status
    on owl_menus (status);

create index if not exists idx_owl_menus_type
    on owl_menus (type);

create table if not exists owl_monitor_metrics
(
    id          uuid                     default gen_random_uuid() not null
    primary key,
    metric_type varchar(50)                                        not null,
    metric_name varchar(100)                                       not null,
    value       numeric                                            not null,
    unit        varchar(20),
    tags        json,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP
                              );

comment on table owl_monitor_metrics is '监控数据表';

comment on column owl_monitor_metrics.id is '监控数据ID，主键';

comment on column owl_monitor_metrics.metric_type is '指标类型：system, application, database, cache';

comment on column owl_monitor_metrics.metric_name is '指标名称：cpu, memory, disk, etc.';

comment on column owl_monitor_metrics.value is '指标值';

comment on column owl_monitor_metrics.unit is '单位：%, MB, ms, etc.';

comment on column owl_monitor_metrics.tags is '额外的标签信息';

comment on column owl_monitor_metrics.created_at is '创建时间';

create index if not exists idx_owl_monitor_metrics_created_at
    on owl_monitor_metrics (created_at);

create index if not exists idx_owl_monitor_metrics_type
    on owl_monitor_metrics (metric_type);

create index if not exists idx_owl_monitor_metrics_type_name
    on owl_monitor_metrics (metric_name, metric_type);

create index if not exists owl_monitor_metrics_created_at
    on owl_monitor_metrics (created_at);

create index if not exists owl_monitor_metrics_metric_type
    on owl_monitor_metrics (metric_type);

create index if not exists owl_monitor_metrics_metric_type_metric_name
    on owl_monitor_metrics (metric_name, metric_type);

create table if not exists owl_notification_settings
(
    id                   uuid                     default gen_random_uuid() not null
    primary key,
    user_id              uuid                                               not null,
    email_enabled        boolean                  default true,
    push_enabled         boolean                  default true,
    system_notification  boolean                  default true,
    warning_notification boolean                  default true,
    error_notification   boolean                  default true,
    created_at           timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at           timestamp with time zone default CURRENT_TIMESTAMP
                                       );

comment on table owl_notification_settings is '用户通知配置表';

comment on column owl_notification_settings.id is '通知配置ID，主键';

comment on column owl_notification_settings.user_id is '用户ID（唯一）';

comment on column owl_notification_settings.email_enabled is '是否启用邮件通知';

comment on column owl_notification_settings.push_enabled is '是否启用推送通知';

comment on column owl_notification_settings.system_notification is '是否接收系统通知';

comment on column owl_notification_settings.warning_notification is '是否接收警告通知';

comment on column owl_notification_settings.error_notification is '是否接收错误通知';

comment on column owl_notification_settings.created_at is '创建时间';

comment on column owl_notification_settings.updated_at is '更新时间';

create index if not exists idx_owl_notification_settings_user_id
    on owl_notification_settings (user_id);

create unique index if not exists owl_notification_settings_user_id_key
    on owl_notification_settings (user_id);

create table if not exists owl_notifications
(
    id         uuid                     default gen_random_uuid() not null
    primary key,
    user_id    uuid                                               not null,
    title      varchar(255)                                       not null,
    content    text,
    type       varchar(50)              default 'info'::character varying,
    link       varchar(500),
    is_read    boolean                  default false,
    read_at    timestamp with time zone,
    created_at timestamp with time zone default CURRENT_TIMESTAMP
                             );

comment on table owl_notifications is '站内通知表';

comment on column owl_notifications.id is '通知ID，主键';

comment on column owl_notifications.user_id is '用户ID';

comment on column owl_notifications.title is '通知标题';

comment on column owl_notifications.content is '通知内容';

comment on column owl_notifications.type is '通知类型：info, system, warning, error, success';

comment on column owl_notifications.link is '点击跳转链接';

comment on column owl_notifications.is_read is '是否已读';

comment on column owl_notifications.read_at is '阅读时间';

comment on column owl_notifications.created_at is '创建时间';

create index if not exists idx_owl_notifications_created_at
    on owl_notifications (created_at);

create index if not exists idx_owl_notifications_is_read
    on owl_notifications (is_read);

create index if not exists idx_owl_notifications_type
    on owl_notifications (type);

create index if not exists idx_owl_notifications_user_id
    on owl_notifications (user_id);

create index if not exists idx_owl_notifications_user_read
    on owl_notifications (is_read, user_id);

create table if not exists owl_permissions
(
    id          uuid                     default gen_random_uuid() not null
    primary key,
    name        varchar(50)                                        not null,
    code        varchar(50)                                        not null,
    resource    varchar(50)                                        not null,
    action      varchar(50)                                        not null,
    description varchar(255),
    category    varchar(50),
    created_at  timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP
                              );

comment on table owl_permissions is '权限表';

comment on column owl_permissions.id is '权限ID，主键';

comment on column owl_permissions.name is '权限名称';

comment on column owl_permissions.code is '权限代码，唯一索引，格式：resource:action';

comment on column owl_permissions.resource is '资源名称，如：user, role, menu';

comment on column owl_permissions.action is '操作类型：create-创建，read-读取，update-更新，delete-删除';

comment on column owl_permissions.description is '权限描述';

comment on column owl_permissions.category is '权限分类，如：用户管理、角色管理';

comment on column owl_permissions.created_at is '创建时间';

comment on column owl_permissions.updated_at is '更新时间';

create index if not exists idx_owl_permissions_code
    on owl_permissions (code);

create index if not exists idx_owl_permissions_resource
    on owl_permissions (resource);

create unique index if not exists owl_permissions_code_key
    on owl_permissions (code);

create table if not exists owl_role_menus
(
    id         uuid                     default gen_random_uuid() not null
    primary key,
    role_id    uuid                                               not null,
    menu_id    uuid                                               not null
    constraint fk_role_menus_menu_id
    references owl_menus
    on delete cascade,
    created_at timestamp with time zone default CURRENT_TIMESTAMP
        );

comment on table owl_role_menus is '角色菜单关联表';

comment on column owl_role_menus.id is '关联ID，主键';

comment on column owl_role_menus.role_id is '角色ID，外键关联roles表';

comment on column owl_role_menus.menu_id is '菜单ID，外键关联menus表';

comment on column owl_role_menus.created_at is '创建时间';

create index if not exists idx_owl_role_menus_menu_id
    on owl_role_menus (menu_id);

create index if not exists idx_owl_role_menus_role_id
    on owl_role_menus (role_id);

create unique index if not exists owl_role_menus_role_id_menu_id_unique
    on owl_role_menus (menu_id, role_id);

create table if not exists owl_role_permissions
(
    id            uuid                     default gen_random_uuid() not null
    primary key,
    role_id       uuid                                               not null,
    permission_id uuid                                               not null
    constraint fk_role_permissions_permission_id
    references owl_permissions
    on delete cascade,
    created_at    timestamp with time zone default CURRENT_TIMESTAMP
        );

comment on table owl_role_permissions is '角色权限关联表';

comment on column owl_role_permissions.id is '关联ID，主键';

comment on column owl_role_permissions.role_id is '角色ID，外键关联roles表';

comment on column owl_role_permissions.permission_id is '权限ID，外键关联permissions表';

comment on column owl_role_permissions.created_at is '创建时间';

create index if not exists idx_owl_role_permissions_permission_id
    on owl_role_permissions (permission_id);

create index if not exists idx_owl_role_permissions_role_id
    on owl_role_permissions (role_id);

create unique index if not exists owl_role_permissions_role_id_permission_id_unique
    on owl_role_permissions (permission_id, role_id);

create table if not exists owl_roles
(
    id          uuid                     default gen_random_uuid() not null
    primary key,
    name        varchar(50)                                        not null,
    code        varchar(50)                                        not null,
    description varchar(255),
    status      enum_owl_roles_status        default 'active'::enum_owl_roles_status,
    sort        integer                  default 0,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP,
    deleted_at  timestamp with time zone
                              );

comment on table owl_roles is '角色表';

comment on column owl_roles.id is '角色ID，主键';

comment on column owl_roles.name is '角色名称，唯一索引';

comment on column owl_roles.code is '角色代码，唯一索引，用于权限控制';

comment on column owl_roles.description is '角色描述';

comment on column owl_roles.status is '角色状态：active-启用，inactive-禁用';

comment on column owl_roles.sort is '排序值，数值越小越靠前';

comment on column owl_roles.created_at is '创建时间';

comment on column owl_roles.updated_at is '更新时间';

comment on column owl_roles.deleted_at is '软删除时间';

create index if not exists idx_owl_roles_code
    on owl_roles (code);

create index if not exists idx_owl_roles_status
    on owl_roles (status);

create unique index if not exists owl_roles_code_key
    on owl_roles (code);

create unique index if not exists owl_roles_name_key
    on owl_roles (name);

create unique index if not exists owl_roles_name_key1
    on owl_roles (name);

create table if not exists owl_test_products
(
    id          uuid                     default gen_random_uuid()           not null
    primary key,
    name        varchar(200)                                                 not null,
    description text,
    price       numeric                  default 0                           not null,
    stock       integer                  default 0                           not null,
    category    varchar(100),
    status      varchar(20)              default 'active'::character varying not null,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP
                              );

comment on table owl_test_products is '测试商品表 - 用于测试代码生成器';

comment on column owl_test_products.id is '商品ID，主键';

comment on column owl_test_products.name is '商品名称';

comment on column owl_test_products.description is '商品描述';

comment on column owl_test_products.price is '商品价格';

comment on column owl_test_products.stock is '库存数量';

comment on column owl_test_products.category is '商品分类';

comment on column owl_test_products.status is '商品状态: active/inactive/discontinued';

comment on column owl_test_products.created_at is '创建时间';

comment on column owl_test_products.updated_at is '更新时间';

create index if not exists idx_owl_test_products_category
    on owl_test_products (category);

create index if not exists idx_owl_test_products_name
    on owl_test_products (name);

create index if not exists idx_owl_test_products_status
    on owl_test_products (status);

create table if not exists owl_user_roles
(
    id         uuid                     default gen_random_uuid() not null
    primary key,
    user_id    uuid                                               not null,
    role_id    uuid                                               not null
    constraint fk_user_roles_role_id
    references owl_roles
    on delete cascade,
    created_at timestamp with time zone default CURRENT_TIMESTAMP
        );

comment on table owl_user_roles is '用户角色关联表';

comment on column owl_user_roles.id is '关联ID，主键';

comment on column owl_user_roles.user_id is '用户ID，外键关联users表';

comment on column owl_user_roles.role_id is '角色ID，外键关联roles表';

comment on column owl_user_roles.created_at is '创建时间';

create index if not exists idx_owl_user_roles_role_id
    on owl_user_roles (role_id);

create index if not exists idx_owl_user_roles_user_id
    on owl_user_roles (user_id);

create unique index if not exists owl_user_roles_user_id_role_id_unique
    on owl_user_roles (role_id, user_id);

create table if not exists owl_users
(
    id            uuid              default gen_random_uuid() not null
    primary key,
    username      varchar(50)                                 not null,
    email         varchar(100)                                not null,
    password      varchar(255),
    real_name     varchar(50),
    phone         varchar(20),
    avatar        varchar(255),
    status        enum_owl_users_status default 'active'::enum_owl_users_status,
    last_login_at timestamp with time zone,
                                last_login_ip varchar(45),
    created_at    timestamp with time zone                    not null,
    updated_at    timestamp with time zone                    not null,
    deleted_at    timestamp with time zone,
                                department_id uuid
                                constraint fk_users_department_id
                                references owl_departments
                                on update cascade on delete set null
                                );

comment on table owl_users is '用户表';

comment on column owl_users.id is '用户ID，主键';

comment on column owl_users.username is '用户名，唯一索引';

comment on column owl_users.email is '邮箱地址，唯一索引';

comment on column owl_users.password is '密码，bcrypt加密存储（可为空，支持无密码登录）';

comment on column owl_users.real_name is '真实姓名';

comment on column owl_users.phone is '手机号，唯一索引';

comment on column owl_users.avatar is '用户头像URL';

comment on column owl_users.status is '用户状态：active-正常，inactive-禁用，banned-封禁';

comment on column owl_users.last_login_at is '最后登录时间';

comment on column owl_users.last_login_ip is '最后登录IP地址';

comment on column owl_users.created_at is '创建时间';

comment on column owl_users.updated_at is '更新时间';

comment on column owl_users.deleted_at is '软删除时间';

comment on column owl_users.department_id is '所属部门ID';

create index if not exists idx_owl_users_department_id
    on owl_users (department_id);

create index if not exists idx_owl_users_email
    on owl_users (email);

create index if not exists idx_owl_users_phone
    on owl_users (phone);

create index if not exists idx_owl_users_status
    on owl_users (status);

create index if not exists idx_owl_users_username
    on owl_users (username);

create unique index if not exists owl_users_email_key
    on owl_users (email);

create unique index if not exists owl_users_email_key1
    on owl_users (email);

create unique index if not exists owl_users_phone_key
    on owl_users (phone);

create unique index if not exists owl_users_phone_key1
    on owl_users (phone);

create unique index if not exists owl_users_username_key
    on owl_users (username);

create unique index if not exists owl_users_username_key1
    on owl_users (username);

create table if not exists owl_file_permissions
(
    id            uuid                     default gen_random_uuid() not null
    primary key,
    resource_type varchar(20)                                        not null,
    resource_id   uuid                                               not null,
    user_id       uuid
    constraint fk_file_permissions_user
    references owl_users
    on delete cascade,
    role_id       uuid
    constraint fk_file_permissions_role
    references owl_roles
    on delete cascade,
    permission    varchar(20)                                        not null,
    granted_by    uuid
    constraint fk_file_permissions_granted_by
    references owl_users
    on delete set null,
    created_at    timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at    timestamp with time zone default CURRENT_TIMESTAMP,
        constraint chk_file_permissions_user_or_role
        check (((user_id IS NOT NULL) AND (role_id IS NULL)) OR ((user_id IS NULL) AND (role_id IS NOT NULL)))
    );

comment on table owl_file_permissions is '文件和文件夹权限表';

comment on column owl_file_permissions.id is '权限ID，主键';

comment on column owl_file_permissions.resource_type is '资源类型：file(文件) 或 folder(文件夹)';

comment on column owl_file_permissions.resource_id is '资源ID（文件ID或文件夹ID）';

comment on column owl_file_permissions.user_id is '用户ID，NULL表示这是角色权限';

comment on column owl_file_permissions.role_id is '角色ID，NULL表示这是用户权限';

comment on column owl_file_permissions.permission is '权限类型：read(读)、write(写)、delete(删除)、admin(管理)';

comment on column owl_file_permissions.granted_by is '授权人ID';

comment on column owl_file_permissions.created_at is '创建时间';

comment on column owl_file_permissions.updated_at is '更新时间';

create index if not exists idx_owl_file_permissions_resource
    on owl_file_permissions (resource_type, resource_id);

create index if not exists idx_owl_file_permissions_user
    on owl_file_permissions (user_id);

create index if not exists idx_owl_file_permissions_role
    on owl_file_permissions (role_id);

create index if not exists idx_owl_file_permissions_granted_by
    on owl_file_permissions (granted_by);

create table if not exists owl_api_interfaces
(
    id           uuid                     default gen_random_uuid() not null
    primary key,
    name         varchar(255)                                       not null,
    description  text,
    sql_query    text                                               not null,
    method       varchar(20)              default 'GET'::character varying,
    endpoint     varchar(255)                                       not null,
    version      integer                  default 1,
    parameters   jsonb,
    status       varchar(20)              default 'active'::character varying
    constraint api_interfaces_status_check
    check ((status)::text = ANY ((ARRAY ['active'::character varying, 'inactive'::character varying])::text[])),
    require_auth boolean                  default true,
    rate_limit   integer                  default 1000,
    created_by   uuid                                               not null
    references owl_users
    on delete cascade,
    created_at   timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at   timestamp with time zone default CURRENT_TIMESTAMP,
        api_key_id   uuid,
        unique (endpoint, version)
    );

comment on table owl_api_interfaces is '接口配置表';

comment on column owl_api_interfaces.id is '接口ID，主键';

comment on column owl_api_interfaces.name is '接口名称';

comment on column owl_api_interfaces.description is '接口描述';

comment on column owl_api_interfaces.sql_query is 'SQL查询语句';

comment on column owl_api_interfaces.method is '请求方式：GET/POST/PUT/DELETE';

comment on column owl_api_interfaces.endpoint is '接口端点路径';

comment on column owl_api_interfaces.version is '接口版本号';

comment on column owl_api_interfaces.parameters is '接口参数定义';

comment on column owl_api_interfaces.status is '接口状态';

comment on column owl_api_interfaces.require_auth is '是否需要认证';

comment on column owl_api_interfaces.rate_limit is '每小时请求限制';

comment on column owl_api_interfaces.created_by is '创建者ID';

comment on column owl_api_interfaces.created_at is '创建时间';

comment on column owl_api_interfaces.updated_at is '更新时间';

comment on column owl_api_interfaces.api_key_id is '关联的API密钥ID（可选，当require_auth=true时使用）';

create index if not exists idx_owl_api_interfaces_status
    on owl_api_interfaces (status);

create index if not exists idx_owl_api_interfaces_created_by
    on owl_api_interfaces (created_by);

create index if not exists idx_owl_api_interfaces_endpoint
    on owl_api_interfaces (endpoint);

create unique index if not exists uk_owl_api_interfaces_endpoint_version
    on owl_api_interfaces (endpoint, version);

create table if not exists owl_api_keys
(
    id           uuid                     default gen_random_uuid() not null
    primary key,
    interface_id uuid
    references owl_api_interfaces
    on delete cascade,
    app_name     varchar(255)                                       not null,
    api_key      varchar(255)                                       not null
    unique,
    api_secret   varchar(255)                                       not null,
    status       varchar(20)              default 'active'::character varying
    constraint api_keys_status_check
    check ((status)::text = ANY ((ARRAY ['active'::character varying, 'inactive'::character varying])::text[])),
    expires_at   timestamp with time zone                           not null,
    last_used_at timestamp,
    created_by   uuid                                               not null
    references owl_users
    on delete cascade,
    created_at   timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at   timestamp with time zone default CURRENT_TIMESTAMP
        );

comment on table owl_api_keys is 'API密钥表';

comment on column owl_api_keys.id is '密钥ID，主键';

comment on column owl_api_keys.interface_id is '关联的接口ID';

comment on column owl_api_keys.app_name is '应用名称';

comment on column owl_api_keys.api_key is 'API密钥';

comment on column owl_api_keys.api_secret is 'API密钥加密值';

comment on column owl_api_keys.status is '密钥状态';

comment on column owl_api_keys.expires_at is '密钥过期时间（3天后）';

comment on column owl_api_keys.last_used_at is '最后使用时间';

comment on column owl_api_keys.created_by is '创建者ID';

comment on column owl_api_keys.created_at is '创建时间';

comment on column owl_api_keys.updated_at is '更新时间';

alter table owl_api_interfaces
    add foreign key (api_key_id) references owl_api_keys
        on delete set null;

create index if not exists idx_owl_api_keys_interface_id
    on owl_api_keys (interface_id);

create index if not exists idx_owl_api_keys_api_key
    on owl_api_keys (api_key);

create index if not exists idx_owl_api_keys_expires_at
    on owl_api_keys (expires_at);

-- 创建触发器自动更新owl_api_keys的expires_at字段（根据updated_at + 180天）
create trigger update_api_keys_expires_at
    before update
    on owl_api_keys
    for each row
    execute procedure update_api_key_expires_at();

create table if not exists owl_api_call_logs
(
    id             uuid      default gen_random_uuid() not null
    primary key,
    interface_id   uuid                                not null
    references owl_api_interfaces
    on delete cascade,
    api_key_id     uuid
    references owl_api_keys
    on delete set null,
    request_method varchar(20),
    request_params jsonb,
    response_code  integer,
    response_time  integer,
    error_message  varchar(500),
    ip_address     varchar(45),
    created_at     timestamp default CURRENT_TIMESTAMP
    );

comment on table owl_api_call_logs is '接口调用日志表';

comment on column owl_api_call_logs.id is '日志ID，主键';

comment on column owl_api_call_logs.interface_id is '接口ID';

comment on column owl_api_call_logs.api_key_id is 'API密钥ID';

comment on column owl_api_call_logs.request_method is '请求方法';

comment on column owl_api_call_logs.request_params is '请求参数';

comment on column owl_api_call_logs.response_code is '响应状态码';

comment on column owl_api_call_logs.response_time is '响应时间（毫秒）';

comment on column owl_api_call_logs.error_message is '错误信息';

comment on column owl_api_call_logs.ip_address is '请求来源IP';

comment on column owl_api_call_logs.created_at is '创建时间';

create index if not exists idx_owl_api_call_logs_interface_id
    on owl_api_call_logs (interface_id);

create index if not exists idx_owl_api_call_logs_api_key_id
    on owl_api_call_logs (api_key_id);

create index if not exists idx_owl_api_call_logs_created_at
    on owl_api_call_logs (created_at);

create table if not exists owl_test_insert
(
    id   varchar(36) default gen_random_uuid() not null
    primary key,
    name varchar(50),
    age  integer
    );

create table if not exists owl_watermark_config
(
    id            bigserial
    primary key,
    enabled       boolean       default true,
    lines         jsonb,
    font_size     integer       default 24,
    font_weight   integer       default 400,
    color         varchar(7)    default '#000000'::character varying,
    opacity       numeric(3, 2) default 0.15,
    rotation      integer       default 45,
    spacing       integer       default 150,
    masking_rules jsonb,
    created_at    timestamp     default CURRENT_TIMESTAMP,
    updated_at    timestamp     default CURRENT_TIMESTAMP,
    created_by    uuid
    references owl_users
    on delete set null
    );

comment on table owl_watermark_config is '水印配置表';

comment on column owl_watermark_config.id is '水印配置ID，主键';

comment on column owl_watermark_config.enabled is '水印是否启用';

comment on column owl_watermark_config.lines is '水印内容行数组，支持动态变量 {{user:fieldName}}';

comment on column owl_watermark_config.font_size is '字体大小（12-48px）';

comment on column owl_watermark_config.font_weight is '字体粗细（300|400|700）';

comment on column owl_watermark_config.color is '颜色（十六进制）';

comment on column owl_watermark_config.opacity is '透明度（0.05-0.5）';

comment on column owl_watermark_config.rotation is '旋转角度（0-360°）';

comment on column owl_watermark_config.spacing is '间距（50-300px）';

comment on column owl_watermark_config.masking_rules is '脱敏规则配置，格式: {fieldName: {type, hideCount|showCount}}';

comment on column owl_watermark_config.created_at is '创建时间';

comment on column owl_watermark_config.updated_at is '更新时间';

comment on column owl_watermark_config.created_by is '创建者ID';

create index if not exists idx_owl_watermark_config_enabled
    on owl_watermark_config (enabled);

create or replace function update_updated_at_column() returns trigger
    language plpgsql
as
$$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$;

-- 创建函数自动更新API密钥的过期时间（根据updated_at + 180天）
create or replace function update_api_key_expires_at() returns trigger
    language plpgsql
as
$$
BEGIN
  NEW.expires_at = NEW.updated_at + INTERVAL '180 days';
  RETURN NEW;
END;
$$;

create trigger update_menus_updated_at
    before update
    on owl_menus
    for each row
    execute procedure update_updated_at_column();

create trigger update_permissions_updated_at
    before update
    on owl_permissions
    for each row
    execute procedure update_updated_at_column();

create trigger update_roles_updated_at
    before update
    on owl_roles
    for each row
    execute procedure update_updated_at_column();

create trigger update_users_updated_at
    before update
    on owl_users
    for each row
    execute procedure update_updated_at_column();

create trigger update_file_permissions_updated_at
    before update
    on owl_file_permissions
    for each row
    execute procedure update_updated_at_column();

-- 用户会话表 (单设备登录控制)
create table if not exists owl_user_sessions
(
    id              uuid                     default gen_random_uuid() not null
        primary key,
    user_id         uuid                                               not null
        references owl_users
            on delete cascade,
    session_token   varchar(255)                                       not null
        unique,
    device_info     jsonb                                              not null,
    location_info   jsonb                                              not null,
    login_at        timestamp with time zone default CURRENT_TIMESTAMP not null,
    last_active_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    kicked_at       timestamp with time zone,
    status          enum_owl_user_sessions_status default 'active'::enum_owl_user_sessions_status,
    created_at      timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at      timestamp with time zone default CURRENT_TIMESTAMP not null
);

comment on table owl_user_sessions is '用户会话表 - 用于单设备登录控制';

comment on column owl_user_sessions.id is '会话ID，主键';

comment on column owl_user_sessions.user_id is '用户ID';

comment on column owl_user_sessions.session_token is 'JWT token的SHA256 hash，唯一索引';

comment on column owl_user_sessions.device_info is '设备信息JSON：{type, os, browser, device_name}';

comment on column owl_user_sessions.location_info is '位置信息JSON：{ip, country, city, region}';

comment on column owl_user_sessions.login_at is '登录时间';

comment on column owl_user_sessions.last_active_at is '最后活跃时间';

comment on column owl_user_sessions.kicked_at is '被踢出时间';

comment on column owl_user_sessions.status is '会话状态：active-活跃，kicked-已踢出，expired-已过期';

comment on column owl_user_sessions.created_at is '创建时间';

comment on column owl_user_sessions.updated_at is '更新时间';

create index if not exists idx_owl_user_sessions_user_id_status
    on owl_user_sessions (user_id, status);

create index if not exists idx_owl_user_sessions_token
    on owl_user_sessions (session_token);

-- 为menus表添加menu_type字段（菜单分类：系统菜单 vs 业务菜单）
alter table owl_menus
    add column if not exists menu_type varchar(20) default 'business'::character varying;

comment on column owl_menus.menu_type is '菜单类型：business-业务菜单（上方），system-系统菜单（下方，分割线下）';

-- 创建触发器自动更新user_sessions的updated_at字段
drop trigger if exists update_user_sessions_updated_at on owl_user_sessions;

create trigger update_user_sessions_updated_at
    before update
    on owl_user_sessions
    for each row
    execute procedure update_updated_at_column();

-- ============================================
-- Table: system_configs
-- 系统配置表
-- ============================================

create table if not exists owl_system_configs
(
    id                   bigint primary key generated always as identity,
    logo_url             varchar(500),
    login_bg_url         varchar(500),
    company_name         varchar(100) default 'Owl Platform'::character varying not null,
    system_name          varchar(100) default 'Owl Platform'::character varying not null,
    show_tech_stack      boolean default true not null,
    registration_enabled boolean default true not null,
    login_layout         varchar(20) default 'center'::character varying not null,
    tech_stack_info      jsonb,
    enable_theme_switch  boolean default true not null,
    theme_mode           varchar(20) default 'auto'::character varying,
    primary_color        varchar(20) default 'default'::character varying,
    created_by           uuid references owl_users (id) on delete set null,
    created_at           timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at           timestamp with time zone default CURRENT_TIMESTAMP not null
);

comment on table owl_system_configs is '系统配置表';
comment on column owl_system_configs.id is '配置ID';
comment on column owl_system_configs.logo_url is 'Logo 图片 URL';
comment on column owl_system_configs.login_bg_url is '登录背景图片 URL';
comment on column owl_system_configs.company_name is '公司名称';
comment on column owl_system_configs.system_name is '系统名称';
comment on column owl_system_configs.show_tech_stack is '是否展示技术栈信息';
comment on column owl_system_configs.registration_enabled is '是否开放用户注册';
comment on column owl_system_configs.login_layout is '登录页布局：center居中|left-image左图右登录|right-image左登录右图';
comment on column owl_system_configs.tech_stack_info is '技术栈信息配置';
comment on column owl_system_configs.enable_theme_switch is '是否支持主题切换';
comment on column owl_system_configs.theme_mode is '默认主题模式';
comment on column owl_system_configs.primary_color is '主题色';
comment on column owl_system_configs.created_by is '创建者ID';
comment on column owl_system_configs.created_at is '创建时间';
comment on column owl_system_configs.updated_at is '更新时间';

-- 创建触发器自动更新system_configs的updated_at字段
create trigger update_system_configs_updated_at
    before update
    on owl_system_configs
    for each row
    execute procedure update_updated_at_column();

-- 插入默认配置
insert into owl_system_configs (company_name, system_name, show_tech_stack, enable_theme_switch, theme_mode, primary_color)
values ('Owl Platform', 'Owl Platform', true, true, 'auto', 'default')
on conflict do nothing;

-- 第三方系统API密钥表
CREATE TABLE IF NOT EXISTS owl_third_party_api_keys (
                                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key VARCHAR(100) NOT NULL UNIQUE,
    api_secret VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by UUID,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX idx_owl_third_party_api_keys_api_key ON owl_third_party_api_keys (api_key);
CREATE INDEX idx_owl_third_party_api_keys_status ON owl_third_party_api_keys (status);
CREATE INDEX idx_owl_third_party_api_keys_client_name ON owl_third_party_api_keys (client_name);

-- 添加触发器自动更新updated_at
CREATE TRIGGER update_third_party_api_keys_updated_at BEFORE UPDATE ON owl_third_party_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 迁移：为 owl_system_configs 添加 login_layout 字段（如果不存在）
ALTER TABLE owl_system_configs ADD COLUMN IF NOT EXISTS login_layout varchar(20) default 'center' not null;

-- 概览自定义 Widget 表
drop table if exists owl_dashboard_widgets cascade;
create table if not exists owl_dashboard_widgets
(
    id          bigserial primary key,
    title       varchar(100)                                        not null,
    widget_type varchar(20) default 'chart'::character varying     not null,
    chart_type  varchar(20) default 'bar'::character varying,
    sql_query   text                                                not null,
    x_key       varchar(100),
    data_key    varchar(100),
    unit        varchar(20),
    sort_order  integer     default 0                              not null,
    enabled     boolean     default true                           not null,
    created_by  uuid references owl_users (id) on delete set null,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP not null
);

comment on table owl_dashboard_widgets is '概览自定义 Widget 配置表';
comment on column owl_dashboard_widgets.widget_type is 'metric=数字指标, chart=图表';
comment on column owl_dashboard_widgets.chart_type is 'line/bar/area/pie';
comment on column owl_dashboard_widgets.x_key is '图表 X 轴字段名';
comment on column owl_dashboard_widgets.data_key is '图表数值字段名';

CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON owl_dashboard_widgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




-- ============================================
-- 数据脱敏相关表
-- ============================================

-- 敏感字段配置表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_owl_sensitive_fields_mask_type') THEN
        CREATE TYPE enum_owl_sensitive_fields_mask_type AS ENUM ('phone', 'email', 'id_card', 'bank_card', 'name', 'address', 'custom');
    END IF;
END $$;

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

CREATE TRIGGER update_sensitive_fields_updated_at BEFORE UPDATE ON owl_sensitive_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
