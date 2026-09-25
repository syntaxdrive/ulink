import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendRequest(requesterId: string, recipientId: string) {
    if (requesterId === recipientId) {
      throw new ForbiddenException('Cannot connect with yourself');
    }

    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requester_id: requesterId, recipient_id: recipientId },
          { requester_id: recipientId, recipient_id: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        throw new ConflictException('Already connected');
      }
      return existing;
    }

    return this.prisma.connection.create({
      data: { requester_id: requesterId, recipient_id: recipientId, status: 'pending' },
    });
  }

  async acceptRequest(currentUserId: string, requesterId: string) {
    const connection = await this.prisma.connection.findFirst({
      where: { requester_id: requesterId, recipient_id: currentUserId, status: 'pending' },
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.connection.update({
        where: { id: connection.id },
        data: { status: 'accepted' },
      }),
      this.prisma.user.update({
        where: { id: requesterId },
        data: { connections_count: { increment: 1 } },
      }),
      this.prisma.user.update({
        where: { id: currentUserId },
        data: { connections_count: { increment: 1 } },
      }),
    ]);

    return updated;
  }

  async removeConnection(currentUserId: string, otherUserId: string) {
    const connection = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requester_id: currentUserId, recipient_id: otherUserId },
          { requester_id: otherUserId, recipient_id: currentUserId },
        ],
      },
    });

    if (!connection) {
      return { success: true };
    }

    const wasAccepted = connection.status === 'accepted';
    const ops: any[] = [this.prisma.connection.delete({ where: { id: connection.id } })];

    if (wasAccepted) {
      ops.push(
        this.prisma.user.update({ where: { id: currentUserId }, data: { connections_count: { decrement: 1 } } }),
        this.prisma.user.update({ where: { id: otherUserId }, data: { connections_count: { decrement: 1 } } }),
      );
    }

    await this.prisma.$transaction(ops);
    return { success: true };
  }

  async getConnections(userId: string) {
    const connections = await this.prisma.connection.findMany({
      where: {
        status: 'accepted',
        OR: [{ requester_id: userId }, { recipient_id: userId }],
      },
      include: {
        requester: { select: { id: true, name: true, username: true, avatar_url: true, university: true, headline: true, is_verified: true } },
        recipient: { select: { id: true, name: true, username: true, avatar_url: true, university: true, headline: true, is_verified: true } },
      },
    });

    return connections.map((c) => ({
      connectionId: c.id,
      connectedAt: c.created_at,
      user: c.requester_id === userId ? c.recipient : c.requester,
    }));
  }

  async getPendingReceived(userId: string) {
    return this.prisma.connection.findMany({
      where: { recipient_id: userId, status: 'pending' },
      include: {
        requester: { select: { id: true, name: true, username: true, avatar_url: true, university: true, headline: true, is_verified: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getPendingSent(userId: string) {
    return this.prisma.connection.findMany({
      where: { requester_id: userId, status: 'pending' },
      include: {
        recipient: { select: { id: true, name: true, username: true, avatar_url: true, university: true, headline: true, is_verified: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getStatus(currentUserId: string, otherUserId: string) {
    const connection = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requester_id: currentUserId, recipient_id: otherUserId },
          { requester_id: otherUserId, recipient_id: currentUserId },
        ],
      },
    });

    if (!connection) return { status: 'none' };
    return {
      status: connection.status,
      isSender: connection.requester_id === currentUserId,
      connectionId: connection.id,
    };
  }

  async getSuggestions(userId: string, limit = 20) {
    const existing = await this.prisma.connection.findMany({
      where: {
        OR: [{ requester_id: userId }, { recipient_id: userId }],
      },
      select: { requester_id: true, recipient_id: true },
    });

    const excludeIds = new Set<string>([userId]);
    existing.forEach((c) => {
      excludeIds.add(c.requester_id);
      excludeIds.add(c.recipient_id);
    });

    const me = await this.prisma.user.findUnique({ where: { id: userId }, select: { university: true } });

    return this.prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludeIds) },
        ...(me?.university ? { university: me.university } : {}),
      },
      select: { id: true, name: true, username: true, avatar_url: true, university: true, headline: true, is_verified: true },
      take: limit,
      orderBy: { connections_count: 'desc' },
    });
  }
}
