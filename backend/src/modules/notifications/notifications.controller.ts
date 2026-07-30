import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

/**
 * NotificationsController
 *
 * REST endpoints for in-app notifications.
 */
@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/v1/notifications
   * Fetch the authenticated user's notifications (newest first, paginated).
   */
  @ApiOperation({ summary: 'Get notifications for the current user' })
  @Get()
  getNotifications(
    @Request() req: any,
    @Query('cursor') cursor?: string,
  ) {
    return this.notificationsService.getNotifications(req.user.userId, cursor);
  }

  /**
   * GET /api/v1/notifications/unread/count
   * Returns the number of unread notifications.
   * Called on app startup and whenever the app comes back to foreground.
   */
  @ApiOperation({ summary: 'Get unread notification count' })
  @Get('unread/count')
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark every notification as read.
   * Called when the user opens the notifications screen.
   */
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @Patch('read-all')
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark a single notification as read.
   */
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @Patch(':id/read')
  markOneAsRead(@Request() req: any, @Param('id') notificationId: string) {
    return this.notificationsService.markOneAsRead(req.user.userId, notificationId);
  }
}
