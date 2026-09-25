import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

/**
 * NotifGateway
 *
 * Manages real-time notification delivery via Socket.io.
 * Replaces the 3 Supabase Realtime channels on the mobile app:
 *   - mobile-notifs-${userId}  (notifications table changes)
 *   - connections changes
 *   - mobile-tab-notif-badge   (unread count badge)
 *
 * Each authenticated user joins a private room: user:${userId}
 * NotificationsService.createNotification() calls sendToUser() to push events.
 *
 * Events emitted TO clients:
 *   - "notification"       → new notification object
 *   - "badgeCount"         → updated unread notification count
 *   - "connectionRequest"  → someone sent a connection request
 *   - "connectionAccepted" → your request was accepted
 */
@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notif',
})
export class NotifGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedUsers = new Map<string, string>(); // socketId → userId

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      if (!token) throw new Error('No token');
      const payload = this.jwtService.verify(token);
      const userId = payload.sub as string;

      client.join(`user:${userId}`);
      this.connectedUsers.set(client.id, userId);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  /** Push a notification to a specific user */
  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /** Push an updated badge count to a specific user */
  sendBadgeCount(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('badgeCount', { count });
  }

  /** Notify user that they received a connection request */
  sendConnectionRequest(userId: string, fromUser: any) {
    this.server.to(`user:${userId}`).emit('connectionRequest', { fromUser });
  }

  /** Notify user that their connection request was accepted */
  sendConnectionAccepted(userId: string, byUser: any) {
    this.server.to(`user:${userId}`).emit('connectionAccepted', { byUser });
  }
}
