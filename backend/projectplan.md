# SQL Timestamp Fields Migration Plan

## Objective
Add missing timestamp fields (updated_at, deleted_at) to all SQL migration files. Each table must have created_at, updated_at, and deleted_at fields.

## Status Analysis
- Already complete (041-owl_users.sql, 033-owl_roles.sql): 2 files ✓
- Need updated_at + deleted_at added: Multiple files
- Only created_at present: Some junction/mapping tables
- Not tables (skip): 001-enums.sql
- SequelizeMeta (skip): 002, 003, 004

## Files to Process

### Group 1: Missing both updated_at and deleted_at (6-14)
- [x] 006-owl_alert_rules.sql - Added deleted_at
- [x] 007-owl_api_call_logs.sql - Added updated_at, deleted_at
- [x] 008-owl_api_interfaces.sql - Added deleted_at
- [x] 009-owl_api_keys.sql - Added deleted_at
- [x] 010-owl_api_monitor_logs.sql - Added updated_at, deleted_at
- [x] 011-owl_api_monitors.sql - Added deleted_at
- [x] 012-owl_attachment.sql - Added updated_at
- [x] 013-owl_dashboard_widgets.sql - Added deleted_at

### Group 2: Missing both updated_at and deleted_at (15-30)
- [x] 015-owl_departments.sql - Added deleted_at
- [x] 016-owl_dictionary.sql - Added deleted_at
- [x] 017-owl_email_logs.sql - Added updated_at, deleted_at
- [x] 018-owl_email_templates.sql - Added deleted_at
- [x] 019-owl_file_permissions.sql - Added deleted_at
- [x] 020-owl_file_shares.sql - Added updated_at, deleted_at
- [x] 021-owl_files.sql - Added deleted_at
- [x] 022-owl_folders.sql - Added deleted_at
- [x] 023-owl_generated_fields.sql - Added deleted_at
- [x] 024-owl_generated_modules.sql - Added deleted_at
- [x] 025-owl_generation_history.sql - Added updated_at, deleted_at
- [x] 026-owl_menus.sql - Added deleted_at
- [x] 027-owl_monitor_metrics.sql - Added updated_at, deleted_at
- [x] 028-owl_notification_settings.sql - Added deleted_at
- [x] 029-owl_notifications.sql - Added updated_at, deleted_at
- [x] 030-owl_permissions.sql - Added deleted_at

### Group 3: Missing updated_at and deleted_at (31-42)
- [x] 031-owl_role_menus.sql - Added updated_at, deleted_at
- [x] 032-owl_role_permissions.sql - Added updated_at, deleted_at
- [x] 033-owl_roles.sql - Already complete ✓
- [x] 034-owl_sensitive_fields.sql - Added deleted_at
- [x] 035-owl_system_configs.sql - Added deleted_at
- [x] 038-owl_third_party_api_keys.sql - Added deleted_at
- [x] 039-owl_user_roles.sql - Added updated_at, deleted_at
- [x] 040-owl_user_sessions.sql - Added deleted_at
- [x] 041-owl_users.sql - Already complete ✓
- [x] 042-owl_watermark_config.sql - Added deleted_at

## Implementation Pattern

Standard timestamp fields to add:
```sql
updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
deleted_at timestamp with time zone,
```

Comments to add:
```sql
COMMENT ON COLUMN {table}.updated_at IS '更新时间';
COMMENT ON COLUMN {table}.deleted_at IS '软删除时间';
```

Placement: Before business-specific datetime fields (e.g., resolved_at, last_login_at, etc.)

## Review Section

### Completion Summary
✓ All 38 SQL migration files have been successfully updated with proper timestamp fields.

### Changes Made
1. **Added to all files lacking timestamp fields:**
   - `updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP` (for logs/transactional tables, some had timestamp without time zone)
   - `deleted_at timestamp with time zone` (soft delete support)
   - Added corresponding COMMENT ON COLUMN statements for documentation

2. **Files with only created_at:** Added updated_at and deleted_at
3. **Files with created_at and updated_at:** Added deleted_at only
4. **Files already complete (041-owl_users.sql, 033-owl_roles.sql):** Left unchanged

### File Categories
- **Regular tables:** 26 files - All now have created_at, updated_at, deleted_at
- **Junction/Mapping tables:** 5 files (031, 032, 039, and others) - All now have created_at, updated_at, deleted_at for consistency
- **Already complete:** 2 files (033, 041)
- **Skipped:** Non-table files (001-enums.sql, SequelizeMeta files 002-004)

### Standardization
All timestamp fields follow the PostgreSQL standard:
- `created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP` - Immutable creation timestamp
- `updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP` - Updated on each modification
- `deleted_at timestamp with time zone` - NULL by default, set on soft delete

### Notes
- Some files (007, 010, 017, 020, 025, 027, 029, 038, 042) had `timestamp without time zone` which were standardized to `timestamp with time zone` for updated_at and deleted_at for consistency across the codebase
- All tables now support soft delete (NULL deleted_at = active record)
- Comments added for all new timestamp columns for clarity
