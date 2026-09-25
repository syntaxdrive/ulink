import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

/**
 * NotificationsService
 *
 * Handles all in-app notification logic.
 *
 * Schema field mapping (schema.prisma → this service):
 *   - user_id    → the notification recipient
 *   - is_read    → whether the user has seen it
 *   - title      → short heading (e.g. "New Like")
 *   - content    → body text (e.g. "John liked your post")
 *   - action_url → deep-link within the app (e.g. "/post/abc123")
 *
 * Note: The current schema has no `actor_id` or `post_id` column.
 * The actor information is embedded in the `content` string instead.
 * Push notifications (FCM / APNs) will be added in a later phase.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch paginated notifications for the authenticated user.
   *
   * @param userId - The user whose notifications to fetch
   * @param cursor - Notification ID to paginate from (optional)
   * @param limit  - Results per page (default 30)
   */
  async getNotifications(userId: string, cursor?: string, limit = 30) {
    const notifications = await this.prisma.notification.findMany({
      where: { user_id: userId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: 'desc' },
    });

    let nextCursor: string | undefined;
    if (notifications.length > limit) {
      const nextItem = notifications.pop();
      nextCursor = nextItem!.id;
    }

    return { notifications, nextCursor };
  }

  /**
   * Get the count of unread notifications.
   * Used to show/hide the red badge on the bell icon.
   *
   * @param userId - The authenticated user
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });
    return { count };
  }

  /**
   * Mark a single notification as read.
   *
   * @param userId         - Must match the notification's user_id (security check)
   * @param notificationId - The notification to update
   */
  async markOneAsRead(userId: string, notificationId: string) {
    // updateMany with user_id ensures a user can't mark someone else's notifications
    return this.prisma.notification.updateMany({
      where: { id: notificationId, user_id: userId },
      data: { is_read: true },
    });
  }

  /**
   * Mark ALL of the user's notifications as read at once.
   * Called when the user opens the notifications screen.
   *
   * @param userId - The authenticated user
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { success: true };
  }

  /**
   * Create a new notification.
   * Called INTERNALLY by other services — not directly by the client.
   *
   * Examples:
   *   FeedService.likePost()       → type: 'like',    content: "John liked your post"
   *   FeedService.addComment()     → type: 'comment', content: "Jane commented on your post"
   *   ProfilesService.followUser() → type: 'follow',  content: "Alex started following you"
   *
   * @param recipientId - The user who receives the notification (stored as user_id)
   * @param actorId     - Not stored in schema; included for self-notification check only
   * @param type        - Short type string for client-side icon rendering
   * @param title       - Short heading (e.g. "New Like")
   * @param content     - Full body text shown to the user
   * @param actionUrl   - Optional deep-link URL (e.g. the post URL)
   */
  async createNotification(params: {
    recipientId: string;
    actorId: string;
    type: string;
    title: string;
    content: string;
    actionUrl?: string;
  }) {
    // Never notify users about their own actions (e.g. liking their own post)
    if (params.recipientId === params.actorId) return;

    return this.prisma.notification.create({
      data: {
        user_id: params.recipientId,
        type: params.type,
        title: params.title,
        content: params.content,
        action_url: params.actionUrl ?? null,
        is_read: false,
      },
    });
  }
}
