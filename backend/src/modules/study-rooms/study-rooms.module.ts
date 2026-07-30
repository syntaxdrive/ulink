import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { StudyRoomsService } from './study-rooms.service';
import { StudyRoomsController } from './study-rooms.controller';

/**
 * StudyRoomsModule
 *
 * Handles study sessions, focus timers, and participant presence.
 */
@Module({
  controllers: [StudyRoomsController],
  providers: [StudyRoomsService, PrismaService],
  exports: [StudyRoomsService],
})
export class StudyRoomsModule {}
