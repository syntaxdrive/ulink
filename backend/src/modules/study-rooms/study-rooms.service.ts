import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStudyRoomDto } from './dto/create-study-room.dto';

/**
 * StudyRoomsService
 *
 * Manages live virtual study rooms (Pomodoro timers, participant status, focus sessions):
 * - Fetching active study rooms
 * - Creating study rooms & joining as creator
 * - Joining / leaving rooms
 * - Updating participant status ("Focusing", "Break", "Here")
 * - Closing rooms
 */
@Injectable()
export class StudyRoomsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch active public study rooms.
   */
  async getActiveRooms(cursor?: string, limit = 20) {
    const rooms = await this.prisma.studyRoom.findMany({
      where: {
        is_active: true,
        is_private: false,
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar_url: true },
            },
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (rooms.length > limit) {
      const nextItem = rooms.pop();
      nextCursor = nextItem!.id;
    }

    return { rooms, nextCursor };
  }

  /**
   * Get single study room by ID with all participants.
   *
   * @param roomId - Targeted room ID
   */
  async getRoomById(roomId: string) {
    const room = await this.prisma.studyRoom.findUnique({
      where: { id: roomId },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar_url: true },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Study room not found');
    }

    return room;
  }

  /**
   * Create a new Study Room and automatically join the creator as a participant.
   *
   * @param userId - Host user ID
   * @param dto    - Room options
   */
  async createRoom(userId: string, dto: CreateStudyRoomDto) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.studyRoom.create({
        data: {
          creator_id: userId,
          name: dto.name,
          subject: dto.subject ?? null,
          description: dto.description ?? null,
          timer_minutes: dto.timerMinutes ?? 25,
          is_private: dto.isPrivate ?? false,
          allow_drawing: dto.allowDrawing ?? true,
          is_active: true,
        },
      });

      await tx.studyRoomParticipant.create({
        data: {
          room_id: room.id,
          user_id: userId,
          status: 'Here',
        },
      });

      return room;
    });
  }

  /**
   * Join an active Study Room as a participant.
   *
   * @param userId - Participant user ID
   * @param roomId - Targeted room ID
   */
  async joinRoom(userId: string, roomId: string) {
    const room = await this.prisma.studyRoom.findUnique({
      where: { id: roomId },
    });

    if (!room || !room.is_active) {
      throw new NotFoundException('Active study room not found');
    }

    return this.prisma.studyRoomParticipant.upsert({
      where: {
        room_id_user_id: {
          room_id: roomId,
          user_id: userId,
        },
      },
      update: { status: 'Here' },
      create: {
        room_id: roomId,
        user_id: userId,
        status: 'Here',
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
    });
  }

  /**
   * Leave a Study Room.
   *
   * @param userId - Participant user ID
   * @param roomId - Room ID
   */
  async leaveRoom(userId: string, roomId: string) {
    await this.prisma.studyRoomParticipant.deleteMany({
      where: {
        room_id: roomId,
        user_id: userId,
      },
    });

    return { success: true };
  }

  /**
   * Update participant status (e.g. "Focusing", "Break", "Here").
   *
   * @param userId - Participant user ID
   * @param roomId - Room ID
   * @param status - Status string
   */
  async updateStatus(userId: string, roomId: string, status: string) {
    return this.prisma.studyRoomParticipant.update({
      where: {
        room_id_user_id: {
          room_id: roomId,
          user_id: userId,
        },
      },
      data: { status },
    });
  }

  /**
   * Close a Study Room (Creator/Host only).
   *
   * @param userId - Creator user ID
   * @param roomId - Room ID
   */
  async closeRoom(userId: string, roomId: string) {
    const room = await this.prisma.studyRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Study room not found');
    }

    if (room.creator_id !== userId) {
      throw new ForbiddenException('Only the room host can close the room');
    }

    return this.prisma.studyRoom.update({
      where: { id: roomId },
      data: { is_active: false },
    });
  }
}
