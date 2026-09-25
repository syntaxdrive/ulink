import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * MessagesController
 *
 * REST HTTP endpoints for messages.
 * Note: Actual real-time delivery uses Socket.io (ChatGateway).
 * These REST endpoints handle history loading and inbox fetching
 * which is needed on initial app load and history scroll.
 */
@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * GET /api/v1/messages/inbox
   * Returns the user's conversation list (one entry per unique chat partner).
   */
  @ApiOperation({ summary: 'Get inbox with latest message per conversation' })
  @Get('inbox')
  getInbox(@Request() req: any) {
    return this.messagesService.getInbox(req.user.userId);
  }

  /**
   * GET /api/v1/messages/:userId
   * Returns message history between the current user and a specific partner.
   * Supports cursor-based pagination via ?cursor= query param.
   */
  @ApiOperation({ summary: 'Get conversation history with a specific user' })
  @Get(':userId')
  getConversation(
    @Request() req: any,
    @Param('userId') otherUserId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagesService.getConversation(
      req.user.userId,
      otherUserId,
      cursor,
      limit ? parseInt(limit, 10) : 30,
    );
  }

  /**
   * POST /api/v1/messages/send
   * Saves a message via REST (fallback for when Socket.io is unavailable).
   * In normal usage, messages are sent through the ChatGateway WebSocket.
   */
  @ApiOperation({ summary: 'Send a message (REST fallback)' })
  @Post('send')
  sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(req.user.userId, dto);
  }

  /**
   * PATCH /api/v1/messages/:messageId/delete
   * Delete a message for me or for everyone.
   * Mode is passed as a query param: ?mode=me or ?mode=everyone
   */
  @ApiOperation({ summary: 'Delete a message (for me or for everyone)' })
  @Patch(':messageId/delete')
  deleteMessage(
    @Request() req: any,
    @Param('messageId') messageId: string,
    @Query('mode') mode: 'me' | 'everyone' = 'me',
  ) {
    return this.messagesService.deleteMessage(req.user.userId, messageId, mode);
  }

  /**
   * PATCH /api/v1/messages/:senderId/read
   * Mark all messages from a specific sender as read.
   */
  @ApiOperation({ summary: 'Mark messages from a user as read' })
  @Patch(':senderId/read')
  markAsRead(@Request() req: any, @Param('senderId') senderId: string) {
    return this.messagesService.markAsRead(req.user.userId, senderId);
  }

  /**
   * GET /api/v1/messages/unread/counts
   * Returns an object with unread message counts per sender.
   * Used for the notification badge on the Messages tab.
   */
  @ApiOperation({ summary: 'Get unread message counts per conversation' })
  @Get('unread/counts')
  getUnreadCounts(@Request() req: any) {
    return this.messagesService.getUnreadCounts(req.user.userId);
  }
}
