const { sequelize } = require('../../../models');
const { QueryTypes } = require('sequelize');
const ApiError = require('../../../utils/ApiError');
const { logger } = require('../../../config/logger');

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

    // 验证 sort 和 order 参数防止 SQL 注入
    const validSort = this._validateSortField(moduleConfig, sort);
    const validOrder = this._validateOrder(order);

    // 构建搜索条件
    const { whereClause, replacements } = this._buildWhereClause(moduleConfig, searchParams);

    // 获取字段配置，找出 timestamp 类型字段
    const timestampFields = moduleConfig.fields.filter(f => {
      const fieldType = f.field_type?.toLowerCase();
      return fieldType === 'timestamp' ||
             fieldType === 'timestamp without time zone' ||
             fieldType === 'timestamp with time zone';
    }).map(f => f.field_name);

    // 构建 SELECT 子句，将 timestamp 字段转换为本地时区
    let selectClause = '*';
    if (timestampFields.length > 0) {
      const allFields = moduleConfig.fields.map(f => {
        // 验证字段名防止 SQL 注入
        const safeFieldName = this._escapeIdentifier(f.field_name);
        if (timestampFields.includes(f.field_name)) {
          // 将 UTC 时间转换为 Asia/Shanghai 时区
          return `${safeFieldName} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai' AS ${safeFieldName}`;
        }
        return safeFieldName;
      });
      selectClause = allFields.join(', ');
    }

    // 添加分页参数
    replacements.limit = parseInt(limit);
    replacements.offset = offset;

    // 使用安全的表名
    const safeTableName = this._escapeIdentifier(tableName);

    // 查询数据
    const dataQuery = `
      SELECT ${selectClause} FROM ${safeTableName}
      ${whereClause}
      ORDER BY ${this._escapeIdentifier(validSort)} ${validOrder}
      LIMIT :limit OFFSET :offset
    `;

    const rows = await sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as count FROM ${safeTableName}
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

    // 获取字段配置，找出 timestamp 类型字段
    const timestampFields = moduleConfig.fields.filter(f => {
      const fieldType = f.field_type?.toLowerCase();
      return fieldType === 'timestamp' ||
             fieldType === 'timestamp without time zone' ||
             fieldType === 'timestamp with time zone';
    }).map(f => f.field_name);

    // 构建 SELECT 子句，将 timestamp 字段转换为本地时区
    let selectClause = '*';
    if (timestampFields.length > 0) {
      const allFields = moduleConfig.fields.map(f => {
        // 验证字段名防止 SQL 注入
        const safeFieldName = this._escapeIdentifier(f.field_name);
        if (timestampFields.includes(f.field_name)) {
          // 将 UTC 时间转换为 Asia/Shanghai 时区
          return `${safeFieldName} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai' AS ${safeFieldName}`;
        }
        return safeFieldName;
      });
      selectClause = allFields.join(', ');
    }

    const safeTableName = this._escapeIdentifier(tableName);
    const query = `SELECT ${selectClause} FROM ${safeTableName} WHERE id = :id LIMIT 1`;

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
    const fieldNames = fields.map(f => this._escapeIdentifier(f)).join(', ');
    const fieldPlaceholders = fields.map(f => `:${f}`).join(', ');

    const safeTableName = this._escapeIdentifier(tableName);
    const query = `
      INSERT INTO ${safeTableName} (${fieldNames}, created_at, updated_at)
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

    const setClause = fields.map(f => `${this._escapeIdentifier(f)} = :${f}`).join(', ');

    const safeTableName = this._escapeIdentifier(tableName);
    const query = `
      UPDATE ${safeTableName}
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

    const safeTableName = this._escapeIdentifier(tableName);
    const query = `DELETE FROM ${safeTableName} WHERE id = :id`;

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

    const safeTableName = this._escapeIdentifier(tableName);
    const query = `DELETE FROM ${safeTableName} WHERE id IN (${placeholders})`;

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
   * 下载导入模板
   * @param {Object} moduleConfig - 模块配置
   * @returns {Object} 模板信息
   */
  async downloadTemplate(moduleConfig) {
    if (!moduleConfig.enable_import) {
      throw ApiError.forbidden('此模块不允许导入操作');
    }

    // 返回字段信息用于前端生成模板
    return {
      tableName: moduleConfig.table_name,
      fields: moduleConfig.fields
        .filter(f => f.show_in_form && f.field_name !== 'id')
        .map(f => ({
          name: f.field_name,
          comment: f.field_comment,
          type: f.field_type,
          required: f.is_required,
        })),
    };
  }

  /**
   * 导入Excel数据
   * @param {Object} moduleConfig - 模块配置
   * @param {Array} rows - 导入的数据行
   * @returns {Object} 导入结果
   */
  async importFromExcel(moduleConfig, rows) {
    if (!moduleConfig.enable_import) {
      throw ApiError.forbidden('此模块不允许导入操作');
    }

    const tableName = moduleConfig.table_name;
    const errors = [];
    const successRows = [];

    // 验证数据
    rows.forEach((row, index) => {
      const rowNum = index + 4; // Excel行号（第一行是字段名，第二行是注释，第三行是示例，从第四行开始是实际数据）

      // 检查必填字段
      moduleConfig.fields
        .filter(f => f.is_required && f.show_in_form)
        .forEach((field, fieldIndex) => {
          if (!row[field.field_name]) {
            errors.push({
              row: rowNum,
              field: field.field_name,
              fieldLabel: field.field_comment || field.field_name,
              columnNum: fieldIndex + 1,
              message: `${field.field_comment || field.field_name}不能为空`,
            });
          }
        });

      // 如果没有错误，添加到成功行
      if (!errors.some(e => e.row === rowNum)) {
        successRows.push({ ...row, rowNum });
      }
    });

    // 批量插入成功的数据
    let successCount = 0;
    if (successRows.length > 0) {
      // 保留完整的字段配置，便于错误时获取字段注释
      const fieldConfigs = moduleConfig.fields.filter(f => f.show_in_form && f.field_name !== 'id');
      const fields = fieldConfigs.map(f => f.field_name);

      // 批量插入配置：每次插入1000条
      const BATCH_SIZE = 1000;
      const batches = [];

      for (let i = 0; i < successRows.length; i += BATCH_SIZE) {
        batches.push(successRows.slice(i, i + BATCH_SIZE));
      }

      // 逐批插入数据
      for (const batch of batches) {
        try {
          const values = batch.map(row => {
            return fields.map(field => {
              const value = row[field];
              // 处理特殊类型
              if (value === '' || value === null || value === undefined) {
                return null;
              }
              return value;
            });
          });

          // 使用 ? 作为占位符，Sequelize 会自动转换为 $1, $2 等
          const placeholders = batch.map(() => {
            const fieldPlaceholders = fields.map(() => '?').join(',');
            return `(${fieldPlaceholders})`;
          }).join(',');

          const flatValues = values.flat();
          const insertQuery = `
            INSERT INTO ${tableName} (${fields.join(',')})
            VALUES ${placeholders}
          `;

          await sequelize.query(insertQuery, {
            replacements: flatValues,
            type: QueryTypes.INSERT,
          });

          successCount += batch.length;
        } catch (error) {
          // 如果批量插入失败，逐行插入以找出具体的错误行
          logger.warn(`Batch insert failed, falling back to row-by-row insert for batch of ${batch.length} rows`);

          for (const successRow of batch) {
            try {
              const values = fields.map(field => {
                const value = successRow[field];
                if (value === '' || value === null || value === undefined) {
                  return null;
                }
                return value;
              });

              const placeholders = fields.map(() => '?').join(',');
              const insertQuery = `
                INSERT INTO ${tableName} (${fields.join(',')})
                VALUES (${placeholders})
              `;

              await sequelize.query(insertQuery, {
                replacements: values,
                type: QueryTypes.INSERT,
              });

              successCount++;
            } catch (rowError) {
              // 从错误消息中提取值，通过值反查字段
              let fieldName = null;
              let fieldLabel = '未知字段';
              let columnNum = 0;

              // 提取错误消息中引号内的值
              const valueMatch = rowError.message.match(/: "([^"]+)"/);
              const errorValue = valueMatch ? valueMatch[1] : null;

              // 如果找到错误值，遍历字段查找匹配
              if (errorValue) {
                for (let i = 0; i < fieldConfigs.length; i++) {
                  const fieldConfig = fieldConfigs[i];
                  const rowValue = successRow[fieldConfig.field_name];
                  if (rowValue && String(rowValue) === errorValue) {
                    fieldName = fieldConfig.field_name;
                    fieldLabel = fieldConfig.field_comment || fieldConfig.field_name;
                    columnNum = i + 1;
                    break;
                  }
                }
              }

              // 优化错误提示
              let errorMessage = rowError.message;
              if (rowError.message.includes('date/time field value out of range')) {
                errorMessage = `日期时间格式错误: "${errorValue}"`;
              } else if (rowError.message.includes('invalid input syntax')) {
                errorMessage = `数据格式错误: "${errorValue}"`;
              }

              errors.push({
                row: successRow.rowNum,
                field: fieldName || '未知字段',
                fieldLabel: fieldLabel,
                columnNum: columnNum,
                message: errorMessage,
              });

              logger.error(`Import error row ${successRow.rowNum}:`, rowError.message);
            }
          }
        }
      }

      logger.info(`Generic import executed for table: ${tableName}, success: ${successCount}, failure: ${errors.length}`);
    }

    return {
      success: errors.length === 0,
      message: `导入完成：成功 ${successCount} 条，失败 ${errors.length} 条`,
      successCount,
      failureCount: errors.length,
      errors: errors.slice(0, 100), // 只返回前100条错误
    };
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
    const processedFields = new Set(); // 记录已处理的字段

    // 获取可搜索字段
    const searchableFields = moduleConfig.fields.filter(f => f.is_searchable);

    // 首先处理字段配置中的搜索
    searchableFields.forEach(field => {
      const fieldName = field.field_name;
      const safeFieldName = this._escapeIdentifier(fieldName);
      const searchValue = searchParams[fieldName];
      const searchType = field.search_type || 'like';

      // 对于日期时间字段，优先使用范围查询
      const isDateTimeField = ['date', 'timestamp', 'timestamp without time zone', 'timestamp with time zone'].includes(
        field.field_type?.toLowerCase()
      );

      if (isDateTimeField || searchType === 'range') {
        // 范围查询（用于数字和日期）
        const startValue = searchParams[`${fieldName}_start`];
        const endValue = searchParams[`${fieldName}_end`];

        if (startValue !== undefined && startValue !== null && startValue !== '') {
          conditions.push(`${safeFieldName} >= :${fieldName}_start`);
          replacements[`${fieldName}_start`] = startValue;
          processedFields.add(fieldName);
        }

        if (endValue !== undefined && endValue !== null && endValue !== '') {
          conditions.push(`${safeFieldName} <= :${fieldName}_end`);
          replacements[`${fieldName}_end`] = endValue;
          processedFields.add(fieldName);
        }

        // 如果已经处理了范围查询，跳过后续的单值查询
        if (startValue || endValue) {
          return;
        }
      }

      // 处理单值查询
      if (searchValue !== undefined && searchValue !== null && searchValue !== '') {
        switch (searchType) {
          case 'like':
            // 模糊搜索
            conditions.push(`${safeFieldName} ILIKE :${fieldName}`);
            replacements[fieldName] = `%${searchValue}%`;
            break;

          case 'exact':
            // 精确匹配
            conditions.push(`${safeFieldName} = :${fieldName}`);
            replacements[fieldName] = searchValue;
            break;

          case 'range':
            // range 类型已在上面处理
            break;

          default:
            // 默认使用 LIKE
            conditions.push(`${safeFieldName} ILIKE :${fieldName}`);
            replacements[fieldName] = `%${searchValue}%`;
        }
        processedFields.add(fieldName);
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

  /**
   * 转义标识符（表名、字段名）防止 SQL 注入
   * PostgreSQL 使用双引号转义标识符
   * @param {String} identifier - 标识符
   * @returns {String} 转义后的标识符
   */
  _escapeIdentifier(identifier) {
    if (!identifier) {
      throw new Error('Identifier cannot be empty');
    }

    // 只允许字母、数字、下划线
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
      throw ApiError.badRequest(`Invalid identifier: ${identifier}`);
    }

    // PostgreSQL 使用双引号转义标识符
    return `"${identifier}"`;
  }

  /**
   * 验证排序字段是否在允许的字段列表中
   * @param {Object} moduleConfig - 模块配置
   * @param {String} sortField - 排序字段
   * @returns {String} 验证后的排序字段
   */
  _validateSortField(moduleConfig, sortField) {
    const validFields = moduleConfig.fields.map(f => f.field_name);
    validFields.push('created_at', 'updated_at', 'id'); // 添加系统字段

    if (!validFields.includes(sortField)) {
      logger.warn(`Invalid sort field: ${sortField}, using default: created_at`);
      return 'created_at';
    }

    return sortField;
  }

  /**
   * 验证排序顺序
   * @param {String} order - 排序顺序
   * @returns {String} 验证后的排序顺序（ASC 或 DESC）
   */
  _validateOrder(order) {
    const upperOrder = order?.toUpperCase();
    if (upperOrder !== 'ASC' && upperOrder !== 'DESC') {
      return 'DESC';
    }
    return upperOrder;
  }
}

module.exports = new GenericService();
