const { sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');
const ApiError = require('../../utils/ApiError');
const { logger } = require('../../config/logger');

/**
 * 通用CRUD服务 - 配置驱动
 * 根据 GeneratedModule 配置动态执行数据库操作
 * 无需生成代码文件，实现零重启
 */
class GenericService {
  /**
   * 获取列表（分页 + 搜索）
   * @param {Object} moduleConfig - 模块配置
   * @param {Object} query - 查询参数
   */
  async list(moduleConfig, query) {
    // 检查是否使用动态SQL
    if (moduleConfig.custom_sql) {
      return this._executeCustomSqlList(moduleConfig, query);
    }

    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'DESC',
      ...searchParams
    } = query;

    const offset = (page - 1) * limit;
    const tableName = moduleConfig.table_name;

    // 构建搜索条件
    const { whereClause, replacements } = this._buildWhereClause(moduleConfig, searchParams);

    // 添加分页参数
    replacements.limit = parseInt(limit);
    replacements.offset = offset;

    // 查询数据
    const dataQuery = `
      SELECT * FROM ${tableName}
      ${whereClause}
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT :limit OFFSET :offset
    `;

    const rows = await sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as count FROM ${tableName}
      ${whereClause}
    `;

    const [{ count }] = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    logger.info(`Generic list query executed for table: ${tableName}, results: ${rows.length}`);

    return {
      data: rows,
      pagination: {
        total: parseInt(count),
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * 获取详情
   * @param {Object} moduleConfig - 模块配置
   * @param {Number|String} id - 记录ID
   */
  async getById(moduleConfig, id) {
    // 检查是否使用动态SQL
    if (moduleConfig.custom_sql) {
      return this._executeCustomSqlDetail(moduleConfig, id);
    }

    const tableName = moduleConfig.table_name;
    const query = `SELECT * FROM ${tableName} WHERE id = :id LIMIT 1`;

    const [item] = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (!item) {
      throw ApiError.notFound(`${moduleConfig.description}不存在`);
    }

    logger.info(`Generic getById executed for table: ${tableName}, id: ${id}`);

    return item;
  }

  /**
   * 创建记录
   * @param {Object} moduleConfig - 模块配置
   * @param {Object} data - 创建数据
   */
  async create(moduleConfig, data) {
    if (!moduleConfig.enable_create) {
      throw ApiError.forbidden('此模块不允许创建操作');
    }

    const tableName = moduleConfig.table_name;

    // 验证必填字段
    this._validateRequiredFields(moduleConfig, data);

    // 过滤掉系统字段和不存在的字段
    const validData = this._filterValidFields(moduleConfig, data);

    // 构建插入SQL
    const fields = Object.keys(validData);
    const fieldNames = fields.join(', ');
    const fieldPlaceholders = fields.map(f => `:${f}`).join(', ');

    const query = `
      INSERT INTO ${tableName} (${fieldNames}, created_at, updated_at)
      VALUES (${fieldPlaceholders}, NOW(), NOW())
      RETURNING *
    `;

    const [result] = await sequelize.query(query, {
      replacements: validData,
      type: QueryTypes.INSERT,
    });

    const item = result[0];

    logger.info(`Generic create executed for table: ${tableName}, id: ${item.id}`);

    return item;
  }

  /**
   * 更新记录
   * @param {Object} moduleConfig - 模块配置
   * @param {Number|String} id - 记录ID
   * @param {Object} data - 更新数据
   */
  async update(moduleConfig, id, data) {
    if (!moduleConfig.enable_update) {
      throw ApiError.forbidden('此模块不允许更新操作');
    }

    const tableName = moduleConfig.table_name;

    // 先检查记录是否存在
    await this.getById(moduleConfig, id);

    // 过滤掉系统字段和不存在的字段
    const validData = this._filterValidFields(moduleConfig, data);

    // 构建更新SQL
    const fields = Object.keys(validData);
    if (fields.length === 0) {
      throw ApiError.badRequest('没有可更新的字段');
    }

    const setClause = fields.map(f => `${f} = :${f}`).join(', ');

    const query = `
      UPDATE ${tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = :id
      RETURNING *
    `;

    const [result] = await sequelize.query(query, {
      replacements: { ...validData, id },
      type: QueryTypes.UPDATE,
    });

    const item = result[0];

    logger.info(`Generic update executed for table: ${tableName}, id: ${id}`);

    return item;
  }

  /**
   * 删除记录
   * @param {Object} moduleConfig - 模块配置
   * @param {Number|String} id - 记录ID
   */
  async delete(moduleConfig, id) {
    if (!moduleConfig.enable_delete) {
      throw ApiError.forbidden('此模块不允许删除操作');
    }

    const tableName = moduleConfig.table_name;

    // 先检查记录是否存在
    await this.getById(moduleConfig, id);

    const query = `DELETE FROM ${tableName} WHERE id = :id`;

    await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.DELETE,
    });

    logger.info(`Generic delete executed for table: ${tableName}, id: ${id}`);

    return { message: `${moduleConfig.description}删除成功` };
  }

  /**
   * 批量删除
   * @param {Object} moduleConfig - 模块配置
   * @param {Array} ids - 记录ID列表
   */
  async batchDelete(moduleConfig, ids) {
    if (!moduleConfig.enable_batch_delete) {
      throw ApiError.forbidden('此模块不允许批量删除操作');
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw ApiError.badRequest('请提供要删除的ID列表');
    }

    const tableName = moduleConfig.table_name;

    // 构建IN条件的占位符
    const placeholders = ids.map((_, i) => `:id${i}`).join(', ');
    const replacements = {};
    ids.forEach((id, i) => {
      replacements[`id${i}`] = id;
    });

    const query = `DELETE FROM ${tableName} WHERE id IN (${placeholders})`;

    const [, count] = await sequelize.query(query, {
      replacements,
      type: QueryTypes.DELETE,
    });

    logger.info(`Generic batchDelete executed for table: ${tableName}, count: ${count}`);

    return { message: `成功删除 ${count} 条记录`, count };
  }

  /**
   * 导出数据
   * @param {Object} moduleConfig - 模块配置
   * @param {Object} query - 查询参数
   */
  async export(moduleConfig, query) {
    if (!moduleConfig.enable_export) {
      throw ApiError.forbidden('此模块不允许导出操作');
    }

    const tableName = moduleConfig.table_name;

    // 构建搜索条件（不分页）
    const { whereClause, replacements } = this._buildWhereClause(moduleConfig, query);

    const exportQuery = `
      SELECT * FROM ${tableName}
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const items = await sequelize.query(exportQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    logger.info(`Generic export executed for table: ${tableName}, count: ${items.length}`);

    return items;
  }

  /**
   * 构建WHERE条件子句
   * @param {Object} moduleConfig - 模块配置
   * @param {Object} searchParams - 搜索参数
   * @returns {Object} { whereClause, replacements }
   */
  _buildWhereClause(moduleConfig, searchParams) {
    const conditions = [];
    const replacements = {};

    // 获取可搜索字段
    const searchableFields = moduleConfig.fields.filter(f => f.is_searchable);

    searchableFields.forEach(field => {
      const fieldName = field.field_name;
      const searchValue = searchParams[fieldName];

      if (searchValue !== undefined && searchValue !== null && searchValue !== '') {
        const searchType = field.search_type || 'like';

        switch (searchType) {
          case 'like':
            // 模糊搜索
            conditions.push(`${fieldName} ILIKE :${fieldName}`);
            replacements[fieldName] = `%${searchValue}%`;
            break;

          case 'exact':
            // 精确匹配
            conditions.push(`${fieldName} = :${fieldName}`);
            replacements[fieldName] = searchValue;
            break;

          case 'range':
            // 范围查询（用于数字和日期）
            const startValue = searchParams[`${fieldName}_start`];
            const endValue = searchParams[`${fieldName}_end`];

            if (startValue !== undefined && startValue !== null && startValue !== '') {
              conditions.push(`${fieldName} >= :${fieldName}_start`);
              replacements[`${fieldName}_start`] = startValue;
            }

            if (endValue !== undefined && endValue !== null && endValue !== '') {
              conditions.push(`${fieldName} <= :${fieldName}_end`);
              replacements[`${fieldName}_end`] = endValue;
            }
            break;

          default:
            // 默认使用 LIKE
            conditions.push(`${fieldName} ILIKE :${fieldName}`);
            replacements[fieldName] = `%${searchValue}%`;
        }
      }
    });

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return { whereClause, replacements };
  }

  /**
   * 验证必填字段
   * @param {Object} moduleConfig - 模块配置
   * @param {Object} data - 数据
   */
  _validateRequiredFields(moduleConfig, data) {
    const requiredFields = moduleConfig.fields.filter(f => f.is_required && f.show_in_form);

    requiredFields.forEach(field => {
      const fieldName = field.field_name;
      const value = data[fieldName];

      if (value === undefined || value === null || value === '') {
        throw ApiError.badRequest(`${field.field_comment}不能为空`);
      }
    });
  }

  /**
   * 过滤有效字段（移除系统字段和不存在的字段）
   * @param {Object} moduleConfig - 模块配置
   * @param {Object} data - 原始数据
   * @returns {Object} 过滤后的数据
   */
  _filterValidFields(moduleConfig, data) {
    const validFieldNames = moduleConfig.fields
      .filter(f => f.show_in_form)
      .map(f => f.field_name);

    const filtered = {};

    validFieldNames.forEach(fieldName => {
      if (data[fieldName] !== undefined) {
        filtered[fieldName] = data[fieldName];
      }
    });

    return filtered;
  }

  /**
   * 执行自定义SQL查询（列表，带分页）
   * @param {Object} moduleConfig - 模块配置
   * @param {Object} query - 查询参数
   * @returns {Object} { data, pagination }
   */
  async _executeCustomSqlList(moduleConfig, query) {
    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'DESC',
      ...searchParams
    } = query;

    const offset = (page - 1) * limit;

    // 获取基础SQL
    let baseSql = moduleConfig.custom_sql.trim().replace(/;$/, '');

    // 构建动态WHERE条件
    const { whereConditions, replacements } = this._buildDynamicWhereClause(moduleConfig, searchParams);

    // 判断原SQL是否已有WHERE子句
    const hasWhere = baseSql.toUpperCase().includes('WHERE');

    // 添加动态WHERE条件
    if (whereConditions.length > 0) {
      const connector = hasWhere ? 'AND' : 'WHERE';
      baseSql = `${baseSql} ${connector} ${whereConditions.join(' AND ')}`;
    }

    // 添加分页参数
    replacements.limit = parseInt(limit);
    replacements.offset = offset;

    // 执行数据查询（包含ORDER BY和LIMIT）
    const dataQuery = `
      ${baseSql}
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT :limit OFFSET :offset
    `;

    const rows = await sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // 执行计数查询（不包含ORDER BY和LIMIT）
    const countQuery = `SELECT COUNT(*) as count FROM (${baseSql}) AS subquery`;

    const [{ count }] = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    logger.info(`Custom SQL list query executed for module: ${moduleConfig.module_name}, results: ${rows.length}`);

    return {
      data: rows,
      pagination: {
        total: parseInt(count),
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * 执行自定义SQL查询（详情，单条记录）
   * @param {Object} moduleConfig - 模块配置
   * @param {Number|String} id - 记录ID
   * @returns {Object} 记录详情
   */
  async _executeCustomSqlDetail(moduleConfig, id) {
    // 获取基础SQL
    let baseSql = moduleConfig.custom_sql.trim().replace(/;$/, '');

    // 获取主键字段名（默认为 'id'）
    const primaryKey = moduleConfig.sql_primary_key || 'id';

    // 判断原SQL是否已有WHERE子句
    const hasWhere = baseSql.toUpperCase().includes('WHERE');

    // 添加主键条件
    const connector = hasWhere ? 'AND' : 'WHERE';
    const detailQuery = `${baseSql} ${connector} ${primaryKey} = :id LIMIT 1`;

    const [item] = await sequelize.query(detailQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (!item) {
      throw ApiError.notFound(`${moduleConfig.description}不存在`);
    }

    logger.info(`Custom SQL detail query executed for module: ${moduleConfig.module_name}, id: ${id}`);

    return item;
  }

  /**
   * 构建动态WHERE条件（用于自定义SQL）
   * @param {Object} moduleConfig - 模块配置
   * @param {Object} searchParams - 搜索参数
   * @returns {Object} { whereConditions, replacements }
   */
  _buildDynamicWhereClause(moduleConfig, searchParams) {
    const whereConditions = [];
    const replacements = {};

    // 获取可搜索字段
    const searchableFields = moduleConfig.fields.filter(f => f.is_searchable);

    searchableFields.forEach(field => {
      const fieldName = field.field_name;
      const searchValue = searchParams[fieldName];

      if (searchValue !== undefined && searchValue !== null && searchValue !== '') {
        const searchType = field.search_type || 'like';

        switch (searchType) {
          case 'like':
            whereConditions.push(`${fieldName} ILIKE :${fieldName}`);
            replacements[fieldName] = `%${searchValue}%`;
            break;

          case 'exact':
            whereConditions.push(`${fieldName} = :${fieldName}`);
            replacements[fieldName] = searchValue;
            break;

          case 'range':
            const startValue = searchParams[`${fieldName}_start`];
            const endValue = searchParams[`${fieldName}_end`];

            if (startValue !== undefined && startValue !== null && startValue !== '') {
              whereConditions.push(`${fieldName} >= :${fieldName}_start`);
              replacements[`${fieldName}_start`] = startValue;
            }

            if (endValue !== undefined && endValue !== null && endValue !== '') {
              whereConditions.push(`${fieldName} <= :${fieldName}_end`);
              replacements[`${fieldName}_end`] = endValue;
            }
            break;

          default:
            whereConditions.push(`${fieldName} ILIKE :${fieldName}`);
            replacements[fieldName] = `%${searchValue}%`;
        }
      }
    });

    return { whereConditions, replacements };
  }
}

module.exports = new GenericService();
