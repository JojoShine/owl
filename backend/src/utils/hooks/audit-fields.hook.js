/**
 * Sequelize Hook: 审计字段自动填充
 *
 * 在 beforeCreate/beforeUpdate/beforeDestroy 时自动填充 created_by/updated_by/deleted_by
 * 使用方式：在 options 中传递 userId
 *
 * 示例：
 * await User.create(data, { userId: req.user.id });
 * await User.update(data, { where: { id }, userId: req.user.id });
 * await User.destroy({ where: { id }, userId: req.user.id });
 */

module.exports = (sequelize) => {
  return {
    /**
     * 为单个模型设置审计字段 Hook
     * @param {Model} model - Sequelize 模型
     */
    setupAuditHooks(model) {
      // beforeCreate: 自动填充 created_by 和 updated_by
      model.beforeCreate(async (record, options) => {
        if (options.userId) {
          record.created_by = options.userId;
          record.updated_by = options.userId;
        }
      });

      // beforeUpdate: 自动填充 updated_by
      model.beforeUpdate(async (record, options) => {
        if (options.userId) {
          record.updated_by = options.userId;
        }
      });

      // beforeDestroy: 软删除时填充 deleted_by
      // 注意：只有在 paranoid: true 时才会执行软删除
      if (model.options.paranoid) {
        model.beforeDestroy(async (record, options) => {
          if (options.userId) {
            record.deleted_by = options.userId;
            // 重新保存记录（因为 paranoid 会自动设置 deletedAt）
            await record.save({ transaction: options.transaction });
          }
        });
      }
    },

    /**
     * 为所有模型设置审计字段 Hook
     * @param {Object} models - 包含所有模型的对象
     */
    setupAllAuditHooks(models) {
      Object.keys(models).forEach((modelName) => {
        const model = models[modelName];
        // 跳过 sequelize 和 Sequelize 对象
        if (model && typeof model.beforeCreate === 'function') {
          this.setupAuditHooks(model);
        }
      });
    }
  };
};
