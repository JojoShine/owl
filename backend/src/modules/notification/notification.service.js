const { Notification, User } = require('../../models');
const { Op } = require('sequelize');

/**
 * 通知服务
 * 负责站内通知的创建、查询、更新和删除
 */
class NotificationService {
  /**
   * 创建通知
   * @param {Object} notificationData - 通知数据
   * @param {String} notificationData.user_id - 用户ID
   * @param {String} notificationData.title - 标题
   * @param {String} notificationData.content - 内容
   * @param {String} notificationData.type - 类型 (info/system/warning/error/success)
   * @param {String} notificationData.link - 链接 (可选)
   * @returns {Promise<Object>} 创建的通知
   */
  async createNotification(notificationData) {
    try {
      const notification = await Notification.create({
        user_id: notificationData.user_id,
        title: notificationData.title,
        content: notificationData.content,
        type: notificationData.type || 'info',
        link: notificationData.link || null,
      });

      return notification;
    } catch (error) {
      throw new Error(`创建通知失败: ${error.message}`);
    }
  }

  /**
   * 获取用户通知列表（分页、筛选）
   * @param {String} userId - 用户ID
   * @param {Object} options - 查询选项
   * @param {Number} options.page - 页码
   * @param {Number} options.limit - 每页数量
   * @param {String} options.type - 通知类型筛选 (可选)
   * @param {Boolean} options.isRead - 是否已读筛选 (可选)
   * @returns {Promise<Object>} { notifications, total, page, limit }
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        isRead
      } = options;

      const offset = (page - 1) * limit;

      // 构建查询条件
      const where = { user_id: userId };

      if (type) {
        where.type = type;
      }

      if (isRead !== undefined) {
        where.is_read = isRead;
      }

      // 查询通知列表
      const { rows: notifications, count: total } = await Notification.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        notifications,
        total,
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`获取通知列表失败: ${error.message}`);
    }
  }

  /**
   * 获取用户未读消息数量
   * @param {String} userId - 用户ID
   * @returns {Promise<Number>} 未读消息数量
   */
  async getUnreadCount(userId) {
    try {
      const count = await Notification.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      });

      return count;
    } catch (error) {
      throw new Error(`获取未读消息数量失败: ${error.message}`);
    }
  }

  /**
   * 获取通知详情
   * @param {String} notificationId - 通知ID
   * @param {String} userId - 用户ID (用于权限验证)
   * @returns {Promise<Object>} 通知详情
   */
  async getNotificationById(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          user_id: userId, // 确保用户只能查看自己的通知
        },
      });

      if (!notification) {
        throw new Error('通知不存在或无权访问');
      }

      return notification;
    } catch (error) {
      throw new Error(`获取通知详情失败: ${error.message}`);
    }
  }

  /**
   * 标记单条消息为已读
   * @param {String} notificationId - 通知ID
   * @param {String} userId - 用户ID (用于权限验证)
   * @returns {Promise<Object>} 更新后的通知
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          user_id: userId,
        },
      });

      if (!notification) {
        throw new Error('通知不存在或无权访问');
      }

      // 如果已经是已读状态，直接返回
      if (notification.is_read) {
        return notification;
      }

      // 更新为已读
      await notification.update({
        is_read: true,
        read_at: new Date(),
      });

      return notification;
    } catch (error) {
      throw new Error(`标记已读失败: ${error.message}`);
    }
  }

  /**
   * 标记所有消息为已读
   * @param {String} userId - 用户ID
   * @returns {Promise<Number>} 更新的消息数量
   */
  async markAllAsRead(userId) {
    try {
      const [updatedCount] = await Notification.update(
        {
          is_read: true,
          read_at: new Date(),
        },
        {
          where: {
            user_id: userId,
            is_read: false,
          },
        }
      );

      return updatedCount;
    } catch (error) {
      throw new Error(`标记所有已读失败: ${error.message}`);
    }
  }

  /**
   * 删除单条通知
   * @param {String} notificationId - 通知ID
   * @param {String} userId - 用户ID (用于权限验证)
   * @returns {Promise<Boolean>} 是否删除成功
   */
  async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.destroy({
        where: {
          id: notificationId,
          user_id: userId,
        },
      });

      if (result === 0) {
        throw new Error('通知不存在或无权删除');
      }

      return true;
    } catch (error) {
      throw new Error(`删除通知失败: ${error.message}`);
    }
  }

  /**
   * 清空所有已读消息
   * @param {String} userId - 用户ID
   * @returns {Promise<Number>} 删除的消息数量
   */
  async clearReadNotifications(userId) {
    try {
      const deletedCount = await Notification.destroy({
        where: {
          user_id: userId,
          is_read: true,
        },
      });

      return deletedCount;
    } catch (error) {
      throw new Error(`清空已读消息失败: ${error.message}`);
    }
  }

  /**
   * 广播通知（发送给所有用户）
   * @param {Object} notificationData - 通知数据
   * @param {String} notificationData.title - 标题
   * @param {String} notificationData.content - 内容
   * @param {String} notificationData.type - 类型 (info/system/warning/error/success)
   * @param {String} notificationData.link - 链接 (可选)
   * @returns {Promise<Object>} { count, sampleNotification }
   */
  async sendBroadcast(notificationData) {
    try {
      // 获取所有活跃用户
      const users = await User.findAll({
        where: {
          status: 'active',
        },
        attributes: ['id'],
      });

      if (users.length === 0) {
        return { count: 0, sampleNotification: null };
      }

      // 批量创建通知
      const notifications = users.map(user => ({
        user_id: user.id,
        title: notificationData.title,
        content: notificationData.content,
        type: notificationData.type || 'system',
        link: notificationData.link || null,
      }));

      const createdNotifications = await Notification.bulkCreate(notifications);

      return {
        count: createdNotifications.length,
        sampleNotification: createdNotifications[0] || null,
      };
    } catch (error) {
      throw new Error(`广播通知失败: ${error.message}`);
    }
  }

  /**
   * 获取通知统计信息
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 统计信息
   */
  async getNotificationStats(userId) {
    try {
      const total = await Notification.count({
        where: { user_id: userId },
      });

      const unread = await Notification.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      });

      const byType = await Notification.findAll({
        where: { user_id: userId },
        attributes: [
          'type',
          [Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'count']
        ],
        group: ['type'],
        raw: true,
      });

      return {
        total,
        unread,
        read: total - unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = parseInt(item.count);
          return acc;
        }, {}),
      };
    } catch (error) {
      throw new Error(`获取通知统计失败: ${error.message}`);
    }
  }
}

module.exports = new NotificationService();
