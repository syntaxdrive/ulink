import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * MessagesService
 *
 * Handles all direct messaging business logic:
 * - Fetching conversation history between two users
 * - Sending new messages (text, image, audio)
 * - Soft-deleting messages ("for me" vs "for everyone")
 * - Marking messages as read
 * - Listing all conversations for a user's inbox
 *
 * Note: Real-time delivery is handled by ChatGateway via Socket.io.
 *       This service only handles the database persistence layer.
 */
@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch the message history between the current user and another user.
   * Uses cursor-based pagination to avoid loading all messages at once.
   *
   * @param userId       - The ID of the authenticated user
   * @param otherUserId  - The ID of the conversation partner
   * @param cursor       - Message ID to paginate from (optional)
   * @param limit        - How many messages to return per page (default 30)
   */
  async getConversation(
    userId: string,
    otherUserId: string,
    cursor?: string,
    limit = 30,
  ) {
    const messages = await this.prisma.message.findMany({
      where: {
        // Fetch messages in both directions between the two users
        OR: [
          { sender_id: userId, recipient_id: otherUserId },
          { sender_id: otherUserId, recipient_id: userId },
        ],
      },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: 'desc' },
      include: {
        // Include only the fields we need from the sender profile
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    // Determine if there are more pages
    let nextCursor: string | undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem!.id;
    }

    return {
      // Return messages in ascending order (oldest first) for chat UI
      messages: messages.reverse(),
      nextCursor,
    };
  }

  /**
   * Fetch the inbox — a list of the most recent conversations for a user.
   * Each conversation shows the last message and the other participant's profile.
   *
   * @param userId - The ID of the authenticated user
   */
  async getInbox(userId: string) {
    // Get the latest message for each unique conversation partner
    // We use raw grouping logic here since Prisma doesn't natively support GROUP BY latest
    const latestMessages = await this.prisma.message.findMany({
      where: {
        OR: [{ sender_id: userId }, { recipient_id: userId }],
      },
      orderBy: { created_at: 'desc' },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatar_url: true, is_verified: true },
        },
        recipient: {
          select: { id: true, name: true, username: true, avatar_url: true, is_verified: true },
        },
      },
    });

    // Deduplicate: keep only the most recent message per conversation partner
    const seen = new Set<string>();
    const conversations = latestMessages.filter((msg) => {
      const partnerId =
        msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      if (seen.has(partnerId)) return false;
      seen.add(partnerId);
      return true;
    });

    return conversations;
  }

  /**
   * Persist a new message to the database.
   * The Socket.io gateway will broadcast it to the recipient in real time.
   *
   * @param senderId - The ID of the authenticated sender
   * @param dto      - Message content and recipient info
   */
  async sendMessage(senderId: string, dto: SendMessageDto) {
    // Verify the recipient exists before saving the message
    const recipient = await this.prisma.user.findUnique({
      where: { id: dto.recipientId },
      select: { id: true },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    return this.prisma.message.create({
      data: {
        sender_id: senderId,
        recipient_id: dto.recipientId,
        content: dto.content ?? null,
        image_url: dto.imageUrl ?? null,
        audio_url: dto.audioUrl ?? null,
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
    });
  }

  /**
   * Delete a message.
   *
   * - "for me":       Marks the message as deleted in the sender's local storage.
   *                   This is handled client-side (no database change needed).
   *
   * - "for everyone": Updates the message content to a deletion notice and
   *                   clears all media. Only the original sender may do this.
   *
   * @param userId    - The ID of the authenticated user requesting deletion
   * @param messageId - The ID of the message to delete
   * @param mode      - 'me' (local only) or 'everyone' (database update)
   */
  async deleteMessage(
    userId: string,
    messageId: string,
    mode: 'me' | 'everyone',
  ) {
    if (mode === 'me') {
      // "Delete for me" is handled entirely on the client side.
      // We simply acknowledge the request — no database write needed.
      return { success: true, mode: 'me' };
    }

    // "Delete for everyone" — only the original sender may do this
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender_id !== userId) {
      throw new ForbiddenException(
        'Only the sender can delete a message for everyone',
      );
    }

    // Soft-delete: replace content with placeholder, clear all media URLs
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: 'This message was deleted',
        image_url: null,
        audio_url: null,
        is_deleted: true,
      },
    });
  }

  /**
   * Mark all messages from a specific sender as read.
   * Called when the recipient opens a conversation.
   *
   * @param recipientId - The currently authenticated user (who is reading)
   * @param senderId    - The user whose messages are being marked as read
   */
  async markAsRead(recipientId: string, senderId: string) {
    await this.prisma.message.updateMany({
      where: {
        sender_id: senderId,
        recipient_id: recipientId,
        read_at: null, // Only update unread messages
      },
      data: {
        read_at: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Count unread messages per conversation for the notification badge.
   *
   * @param userId - The authenticated user whose unread counts we need
   */
  async getUnreadCounts(userId: string) {
    // Group unread messages by sender to get per-conversation unread counts
    const unread = await this.prisma.message.groupBy({
      by: ['sender_id'],
      where: {
        recipient_id: userId,
        read_at: null,
        is_deleted: false,
      },
      _count: { sender_id: true },
    });

    // Return as a simple map: { [senderId]: count }
    return unread.reduce(
      (acc, item) => {
        acc[item.sender_id] = item._count.sender_id;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
