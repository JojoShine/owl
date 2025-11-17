const { logger } = require('../../config/logger');

/**
 * 配置构建器服务
 * 根据模块配置和字段配置构建前端页面配置（用于动态渲染）
 */
class ConfigBuilderService {
  /**
   * 构建完整的页面配置
   * @param {Object} moduleConfig - 模块配置
   * @param {Array} fields - 字段配置列表
   * @returns {Object} 页面配置
   */
  buildPageConfig(moduleConfig, fields) {
    logger.info(`Building page config for module: ${moduleConfig.module_name}`);

    const config = {
      moduleName: moduleConfig.module_name,
      modulePath: moduleConfig.module_path,
      description: moduleConfig.description || moduleConfig.module_name,
      tableName: moduleConfig.table_name,

      // API 端点配置
      api: this._buildApiConfig(moduleConfig),

      // 权限配置
      permissions: this._buildPermissions(moduleConfig),

      // 字段配置
      fields: this._buildFieldsConfig(fields),

      // 功能开关
      features: this._buildFeatures(moduleConfig),

      // 菜单配置
      menu: this._buildMenuConfig(moduleConfig),
    };

    logger.info(`Page config built successfully for module: ${moduleConfig.module_name}`);
    return config;
  }

  /**
   * 构建 API 端点配置
   * @param {Object} moduleConfig
   * @returns {Object}
   */
  _buildApiConfig(moduleConfig) {
    // 不包含 /api/ 前缀，因为 axios baseURL 已经包含了
    const basePath = `/${moduleConfig.module_path}`;
    return {
      list: basePath,
      create: basePath,
      getById: `${basePath}/:id`,
      update: `${basePath}/:id`,
      delete: `${basePath}/:id`,
      batchDelete: `${basePath}/batch`,
      export: `${basePath}/export`,
      import: `${basePath}/import`,
    };
  }

  /**
   * 构建权限配置
   * @param {Object} moduleConfig
   * @returns {Object}
   */
  _buildPermissions(moduleConfig) {
    const resource = moduleConfig.permission_prefix || moduleConfig.module_path;
    return {
      read: `${resource}:read`,
      create: `${resource}:create`,
      update: `${resource}:update`,
      delete: `${resource}:delete`,
    };
  }

  /**
   * 构建字段配置
   * @param {Array} fields
   * @returns {Array}
   */
  _buildFieldsConfig(fields) {
    return fields
      .sort((a, b) => (a.list_sort || 0) - (b.list_sort || 0))
      .map(field => {
        // 解析 format_options JSON 字段
        const formatOptions = field.format_options || {};
        const displayName = formatOptions.displayName || {};

        return {
          name: field.field_name,

          // ✨ 支持不同场景的自定义名称
          label: displayName.list || field.field_comment || field.field_name,
          searchLabel: displayName.search || displayName.list || field.field_comment || field.field_name,
          formLabel: displayName.form || displayName.list || field.field_comment || field.field_name,

          type: this._mapFieldType(field.field_type),

          // 搜索配置
          isSearchable: field.is_searchable || false,
          searchType: field.search_type || 'exact', // exact, like, range, in
          searchComponent: field.search_component || 'input',

          // 列表显示配置
          showInList: field.show_in_list !== false,
          listWidth: field.list_width || undefined,
          listAlign: field.list_align || 'left',
          listSort: field.list_sort || 0,

          // 格式化配置
          formatType: field.format_type || undefined, // date, money, enum, mask, link
          formatOptions: formatOptions,

          // ✨ 代码值映射配置(提取到顶层便于前端使用)
          codeMapping: formatOptions.codeMapping || null,

          // 表单配置
          showInForm: field.show_in_form !== false,
          formComponent: field.form_component || this._getDefaultFormComponent(field.field_type),
          formRules: field.form_rules || {},
          readonly: field.is_readonly || false,

          // 原始字段信息
          dbType: field.field_type,
          comment: field.field_comment,
        };
      });
  }

  /**
   * 映射数据库字段类型到前端类型
   * @param {String} dbType
   * @returns {String}
   */
  _mapFieldType(dbType) {
    const typeMap = {
      'character varying': 'string',
      'varchar': 'string',
      'text': 'string',
      'integer': 'number',
      'bigint': 'number',
      'numeric': 'number',
      'decimal': 'number',
      'boolean': 'boolean',
      'date': 'date',
      'timestamp': 'datetime',
      'timestamp without time zone': 'datetime',
      'timestamp with time zone': 'datetime',
      'uuid': 'string',
      'json': 'json',
      'jsonb': 'json',
    };

    const normalizedType = dbType.toLowerCase();
    return typeMap[normalizedType] || 'string';
  }

  /**
   * 根据字段类型获取默认表单组件
   * @param {String} fieldType
   * @returns {String}
   */
  _getDefaultFormComponent(fieldType) {
    const componentMap = {
      'boolean': 'switch',
      'date': 'date-picker',
      'timestamp': 'datetime-picker',
      'timestamp without time zone': 'datetime-picker',
      'timestamp with time zone': 'datetime-picker',
      'text': 'textarea',
      'json': 'textarea',
      'jsonb': 'textarea',
    };

    const normalizedType = fieldType.toLowerCase();
    return componentMap[normalizedType] || 'input';
  }

  /**
   * 构建功能开关配置
   * @param {Object} moduleConfig
   * @returns {Object}
   */
  _buildFeatures(moduleConfig) {
    return {
      create: moduleConfig.enable_create !== false,
      update: moduleConfig.enable_update !== false,
      delete: moduleConfig.enable_delete !== false,
      batchDelete: moduleConfig.enable_batch_delete !== false,
      export: moduleConfig.enable_export === true,
      import: moduleConfig.enable_import === true,
    };
  }

  /**
   * 构建菜单配置
   * @param {Object} moduleConfig
   * @returns {Object}
   */
  _buildMenuConfig(moduleConfig) {
    return {
      name: moduleConfig.menu_name || moduleConfig.description || moduleConfig.module_name,
      icon: moduleConfig.menu_icon || 'FileText',
      sort: moduleConfig.menu_sort || 100,
      parentId: moduleConfig.menu_parent_id || null,
    };
  }

  /**
   * 验证页面配置
   * @param {Object} config
   * @returns {Boolean}
   */
  validatePageConfig(config) {
    const required = ['moduleName', 'modulePath', 'api', 'permissions', 'fields'];

    for (const field of required) {
      if (!config[field]) {
        logger.error(`Missing required field in page config: ${field}`);
        return false;
      }
    }

    if (!Array.isArray(config.fields) || config.fields.length === 0) {
      logger.error('Page config must have at least one field');
      return false;
    }

    return true;
  }
}

module.exports = new ConfigBuilderService();
