const { DashboardWidget, sequelize } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// 禁止的 SQL 关键字（写操作）
const FORBIDDEN_KEYWORDS = /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|EXEC|EXECUTE)\b/i;

class DashboardWidgetService {
  /**
   * 校验 SQL 安全性：只允许 SELECT
   */
  validateSql(sql) {
    const trimmed = sql.trim();
    if (!trimmed.toUpperCase().startsWith('SELECT')) {
      throw new ApiError(400, 'SQL 只允许以 SELECT 开头');
    }
    if (FORBIDDEN_KEYWORDS.test(trimmed)) {
      throw new ApiError(400, 'SQL 包含不允许的操作关键字');
    }
  }

  async getAll() {
    return DashboardWidget.findAll({
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
    });
  }

  async getEnabled() {
    return DashboardWidget.findAll({
      where: { enabled: true },
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
    });
  }

  async getById(id) {
    const widget = await DashboardWidget.findByPk(id);
    if (!widget) throw new ApiError(404, 'Widget 不存在');
    return widget;
  }

  async create(data, userId) {
    this.validateSql(data.sql_query);
    return DashboardWidget.create({ ...data, created_by: userId });
  }

  async update(id, data) {
    const widget = await this.getById(id);
    if (data.sql_query) this.validateSql(data.sql_query);
    await widget.update(data);
    return widget;
  }

  async delete(id) {
    const widget = await this.getById(id);
    await widget.destroy();
    return { id };
  }

  /**
   * 执行 widget 的 SQL 并返回结果
   */
  async executeWidget(id) {
    const widget = await this.getById(id);
    this.validateSql(widget.sql_query);
    const [results] = await sequelize.query(widget.sql_query);
    return { widget, data: results };
  }

  /**
   * 批量执行所有启用的 widget SQL
   */
  async executeAllEnabled() {
    const widgets = await this.getEnabled();
    const results = await Promise.all(
      widgets.map(async (widget) => {
        try {
          const [rows] = await sequelize.query(widget.sql_query);
          return { widget: widget.toJSON(), data: rows, error: null };
        } catch (err) {
          return { widget: widget.toJSON(), data: [], error: err.message };
        }
      })
    );
    return results;
  }
}

module.exports = new DashboardWidgetService();