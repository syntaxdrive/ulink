import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

/**
 * NotificationsModule
 *
 * In-app notification system.
 * NotificationsService is exported so other modules (Feed, Profiles)
 * can call createNotification() when generating notification events.
 */
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService], // Exported so FeedService & ProfilesService can use it
})
export class NotificationsModule {}
