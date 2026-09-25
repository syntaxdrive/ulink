import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';

/**
 * ChatGateway
 *
 * Manages all real-time WebSocket communication for UniLink's direct messaging.
 *
 * Design decisions:
 * - Each authenticated user joins a private room named by their user ID (e.g. "user:abc123").
 *   This means messages are delivered directly to the recipient without broadcasting to all clients.
 * - JWT tokens are validated on connection handshake. Invalid tokens are disconnected immediately.
 * - No polling — all updates are pushed via Socket.io events.
 *
 * Events emitted TO clients:
 *   - "newMessage"        → A new message has arrived
 *   - "messageDeleted"    → A message was deleted for everyone
 *   - "messageSeen"       → The recipient has read messages
 *   - "userTyping"        → A user is currently typing
 *   - "userStoppedTyping" → A user stopped typing
 *
 * Events received FROM clients:
 *   - "sendMessage"       → Client sends a new message
 *   - "deleteMessage"     → Client deletes a message
 *   - "markRead"          → Client opens a conversation (marks messages as read)
 *   - "typing"            → Client starts typing
 *   - "stopTyping"        → Client stops typing
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Tighten this to your production domain before deployment
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  /** Tracks which socket IDs belong to which user IDs */
  private connectedUsers = new Map<string, string>(); // socketId → userId

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Called when a client connects.
   * Validates their JWT token from the handshake query.
   * If valid, registers them in the connected users map and joins their private room.
   */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      const payload = this.jwtService.verify(token);
      const userId = payload.sub as string;

      // Join a private room named after the user so we can send messages directly to them
      client.join(`user:${userId}`);
      this.connectedUsers.set(client.id, userId);

      console.log(`[Chat] User ${userId} connected (socket: ${client.id})`);
    } catch {
      // Invalid or expired token — disconnect immediately
      client.disconnect(true);
    }
  }

  /**
   * Called when a client disconnects.
   * Cleans up their entry from the connected users map.
   */
  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    console.log(`[Chat] User ${userId} disconnected (socket: ${client.id})`);
  }

  /**
   * Handle "sendMessage" event.
   * Saves the message to the database, then emits it to both:
   *   1. The recipient's private room (so they receive it in real time)
   *   2. The sender's other active sessions (so multi-device sync works)
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const senderId = this.connectedUsers.get(client.id);
    if (!senderId) return;

    const message = await this.messagesService.sendMessage(senderId, dto);

    // Deliver to recipient
    this.server.to(`user:${dto.recipientId}`).emit('newMessage', message);

    // Echo back to sender's other sessions (multi-device support)
    this.server.to(`user:${senderId}`).emit('newMessage', message);

    return message;
  }

  /**
   * Handle "deleteMessage" event.
   * Updates the database and notifies both participants.
   */
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; mode: 'me' | 'everyone'; recipientId: string },
  ) {
    const senderId = this.connectedUsers.get(client.id);
    if (!senderId) return;

    const result = await this.messagesService.deleteMessage(
      senderId,
      data.messageId,
      data.mode,
    );

    if (data.mode === 'everyone') {
      // Notify both participants that the message was deleted
      this.server.to(`user:${data.recipientId}`).emit('messageDeleted', {
        messageId: data.messageId,
      });
      this.server.to(`user:${senderId}`).emit('messageDeleted', {
        messageId: data.messageId,
      });
    }

    return result;
  }

  /**
   * Handle "markRead" event.
   * Called when a user opens a conversation and should mark messages as read.
   * Notifies the sender that their messages have been seen.
   */
  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string },
  ) {
    const recipientId = this.connectedUsers.get(client.id);
    if (!recipientId) return;

    await this.messagesService.markAsRead(recipientId, data.senderId);

    // Notify the original sender that their messages were seen
    this.server.to(`user:${data.senderId}`).emit('messageSeen', {
      seenBy: recipientId,
    });
  }

  /**
   * Handle "typing" event.
   * Forwards a typing indicator to the conversation partner.
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string },
  ) {
    const senderId = this.connectedUsers.get(client.id);
    if (!senderId) return;

    this.server.to(`user:${data.recipientId}`).emit('userTyping', {
      userId: senderId,
    });
  }

  /**
   * Handle "stopTyping" event.
   * Clears the typing indicator for the conversation partner.
   */
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string },
  ) {
    const senderId = this.connectedUsers.get(client.id);
    if (!senderId) return;

    this.server.to(`user:${data.recipientId}`).emit('userStoppedTyping', {
      userId: senderId,
    });
  }
}
