const db = require('../../models');
const { logger } = require('../../config/logger');

class DbReaderService {
  /**
   * 核心系统表列表（不允许通过代码生成器初始化）
   */
  CORE_TABLES = [
    'users',
    'roles',
    'permissions',
    'menus',
    'departments',
    'folders',
    'files',
    'file_shares',
    'monitor_metrics',
    'api_monitors',
    'api_monitor_logs',
    'alert_rules',
    'alert_histories',
    'notifications',
    'email_logs',
    'notification_settings',
    'email_templates',
    'generated_modules',
    'generated_fields',
    'generation_histories',
    'user_roles',
    'role_permissions',
    'role_menus',
    'SequelizeMeta',
  ];

  /**
   * 获取所有数据库表列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 表列表和分页信息
   */
  async getTables(options = {}) {
    const { search, page = 1, limit = 10 } = options;

    try {
      // 构建基础查询条件
      let whereClause = `
        WHERE t.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
          AND t.table_name NOT LIKE 'SequelizeMeta'
      `;

      // 添加搜索条件
      if (search) {
        whereClause += ` AND t.table_name LIKE '%${search}%'`;
      }

      // 查询总数
      const countQuery = `
        SELECT COUNT(*) as total
        FROM information_schema.tables t
        ${whereClause}
      `;
      const [countResult] = await db.sequelize.query(countQuery);
      const total = parseInt(countResult[0].total);

      // 计算偏移量
      const offset = (page - 1) * limit;

      // 构建核心表列表的SQL IN子句
      const coreTablesStr = this.CORE_TABLES.map(t => `'${t}'`).join(', ');

      // 查询数据
      let dataQuery = `
        SELECT
          t.table_name,
          obj_description(('"' || t.table_schema || '"."' || t.table_name || '"')::regclass) AS table_comment,
          (
            SELECT COUNT(*)
            FROM information_schema.columns c
            WHERE c.table_name = t.table_name
              AND c.table_schema = t.table_schema
          ) AS column_count,
          (
            -- 表已经生成过配置，或者是核心系统表
            SELECT (
              EXISTS(
                SELECT 1
                FROM generated_modules gm
                WHERE gm.table_name = t.table_name
              )
              OR t.table_name IN (${coreTablesStr})
            )
          ) AS is_generated
        FROM information_schema.tables t
        ${whereClause}
        ORDER BY t.table_name
        LIMIT ${limit} OFFSET ${offset}
      `;

      const [results] = await db.sequelize.query(dataQuery);

      const data = results.map(row => ({
        tableName: row.table_name,
        comment: row.table_comment || '',
        columnCount: parseInt(row.column_count),
        isGenerated: row.is_generated,
      }));

      return {
        data,
        pagination: {
          total,
          page: parseInt(page),
          pageSize: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('获取表列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取表结构详情
   * @param {String} tableName - 表名
   * @returns {Promise<Object>} 表结构详情
   */
  async getTableStructure(tableName) {
    try {
      // 获取表注释
      const [tableInfo] = await db.sequelize.query(`
        SELECT obj_description(('"public"."${tableName}"')::regclass) AS table_comment
      `);

      // 获取字段信息
      const columns = await this.getTableColumns(tableName);

      // 获取索引信息
      const indexes = await this.getTableIndexes(tableName);

      // 获取主键信息
      const primaryKeys = await this.getPrimaryKeys(tableName);

      // 获取外键信息
      const foreignKeys = await this.getForeignKeys(tableName);

      return {
        tableName,
        comment: tableInfo[0]?.table_comment || '',
        columns,
        indexes,
        primaryKeys,
        foreignKeys,
      };
    } catch (error) {
      logger.error(`获取表 ${tableName} 结构失败:`, error);
      throw error;
    }
  }

  /**
   * 获取表字段信息
   * @param {String} tableName - 表名
   * @returns {Promise<Array>} 字段列表
   */
  async getTableColumns(tableName) {
    try {
      const [results] = await db.sequelize.query(`
        SELECT
          c.column_name,
          c.data_type,
          c.character_maximum_length,
          c.numeric_precision,
          c.numeric_scale,
          c.is_nullable,
          c.column_default,
          c.udt_name,
          col_description((c.table_schema || '.' || c.table_name)::regclass::oid, c.ordinal_position) AS column_comment
        FROM information_schema.columns c
        WHERE c.table_name = '${tableName}'
          AND c.table_schema = 'public'
        ORDER BY c.ordinal_position
      `);

      return results.map(col => ({
        name: col.column_name,
        type: col.data_type,
        length: col.character_maximum_length,
        precision: col.numeric_precision,
        scale: col.numeric_scale,
        nullable: col.is_nullable === 'YES',
        defaultValue: col.column_default,
        udtName: col.udt_name,
        comment: col.column_comment || '',
      }));
    } catch (error) {
      logger.error(`获取表 ${tableName} 字段信息失败:`, error);
      throw error;
    }
  }

  /**
   * 获取表索引信息
   * @param {String} tableName - 表名
   * @returns {Promise<Array>} 索引列表
   */
  async getTableIndexes(tableName) {
    try {
      const [results] = await db.sequelize.query(`
        SELECT
          i.indexname AS index_name,
          i.indexdef AS index_definition,
          CASE
            WHEN i.indexdef LIKE '%UNIQUE%' THEN true
            ELSE false
          END AS is_unique
        FROM pg_indexes i
        WHERE i.tablename = '${tableName}'
          AND i.schemaname = 'public'
        ORDER BY i.indexname
      `);

      return results.map(idx => ({
        name: idx.index_name,
        definition: idx.index_definition,
        isUnique: idx.is_unique,
      }));
    } catch (error) {
      logger.error(`获取表 ${tableName} 索引信息失败:`, error);
      throw error;
    }
  }

  /**
   * 获取主键信息
   * @param {String} tableName - 表名
   * @returns {Promise<Array>} 主键列名列表
   */
  async getPrimaryKeys(tableName) {
    try {
      const [results] = await db.sequelize.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = '${tableName}'
          AND tc.table_schema = 'public'
        ORDER BY kcu.ordinal_position
      `);

      return results.map(row => row.column_name);
    } catch (error) {
      logger.error(`获取表 ${tableName} 主键信息失败:`, error);
      throw error;
    }
  }

  /**
   * 获取外键信息
   * @param {String} tableName - 表名
   * @returns {Promise<Array>} 外键列表
   */
  async getForeignKeys(tableName) {
    try {
      const [results] = await db.sequelize.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule,
          rc.update_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${tableName}'
          AND tc.table_schema = 'public'
      `);

      return results.map(fk => ({
        columnName: fk.column_name,
        referencedTable: fk.foreign_table_name,
        referencedColumn: fk.foreign_column_name,
        onDelete: fk.delete_rule,
        onUpdate: fk.update_rule,
      }));
    } catch (error) {
      logger.error(`获取表 ${tableName} 外键信息失败:`, error);
      throw error;
    }
  }

  /**
   * 检查表是否存在
   * @param {String} tableName - 表名
   * @returns {Promise<Boolean>} 是否存在
   */
  async tableExists(tableName) {
    try {
      const [results] = await db.sequelize.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = '${tableName}'
        ) AS exists
      `);

      return results[0].exists;
    } catch (error) {
      logger.error(`检查表 ${tableName} 是否存在失败:`, error);
      throw error;
    }
  }
}

module.exports = new DbReaderService();
