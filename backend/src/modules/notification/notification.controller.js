const notificationService = require('./notification.service');
const socketService = require('./socket.service');
const { success, paginated } = require('../../utils/response');

class NotificationController {
  /**
   * 获取当前用户的通知列表
   * GET /api/notifications
   */
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await notificationService.getUserNotifications(userId, req.query);

      paginated(res, result.notifications, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }, '获取通知列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取未读消息数量
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await notificationService.getUnreadCount(userId);

      success(res, { count }, '获取未读消息数量成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取通知详情
   * GET /api/notifications/:id
   */
  async getNotificationById(req, res, next) {
    try {
      const userId = req.user.id;
      const notification = await notificationService.getNotificationById(
        req.params.id,
        userId
      );

      success(res, notification, '获取通知详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 标记单条消息为已读
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const notification = await notificationService.markAsRead(
        req.params.id,
        userId
      );

      success(res, notification, '标记已读成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 标记所有消息为已读
   * PUT /api/notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const updatedCount = await notificationService.markAllAsRead(userId);

      success(res, { count: updatedCount }, '标记所有已读成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除单条通知
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res, next) {
    try {
      const userId = req.user.id;
      await notificationService.deleteNotification(req.params.id, userId);

      success(res, null, '删除通知成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 清空所有已读消息
   * DELETE /api/notifications/clear
   */
  async clearReadNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const deletedCount = await notificationService.clearReadNotifications(userId);

      success(res, { count: deletedCount }, '清空已读消息成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 发送通知（管理员功能）
   * POST /api/notifications/send
   */
  async sendNotification(req, res, next) {
    try {
      const { user_id, title, content, type, link } = req.body;

      // 创建通知
      const notification = await notificationService.createNotification({
        user_id,
        title,
        content,
        type,
        link,
      });

      // 如果用户在线，实时推送
      if (socketService.isUserOnline(user_id)) {
        socketService.pushNotification(user_id, notification);
      }

      success(res, notification, '发送通知成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 广播通知（管理员功能）
   * POST /api/notifications/broadcast
   */
  async broadcastNotification(req, res, next) {
    try {
      const { title, content, type, link } = req.body;

      // 创建广播通知
      const result = await notificationService.sendBroadcast({
        title,
        content,
        type,
        link,
      });

      // 实时推送给在线用户（发送完整的通知对象）
      socketService.broadcast('notification', {
        id: result.sampleNotification?.id || null,
        title,
        content,
        type,
        link,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      success(res, { count: result.count }, '广播通知成功', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取通知统计
   * GET /api/notifications/stats
   */
  async getNotificationStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await notificationService.getNotificationStats(userId);

      success(res, stats, '获取通知统计成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
