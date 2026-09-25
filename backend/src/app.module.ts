import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { FeedModule } from './modules/feed/feed.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CoursesModule } from './modules/courses/courses.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PodcastsModule } from './modules/podcasts/podcasts.module';
import { StudyRoomsModule } from './modules/study-rooms/study-rooms.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { UploadModule } from './modules/upload/upload.module';
import { RestModule } from './modules/rest/rest.module';
import { HealthController } from './health.controller';

/**
 * AppModule — Root module of the UniLink API.
 *
 * All feature modules are registered here.
 * Multi-Tier Throttler limits requests across short (burst), medium (feeds/search),
 * and long (sustained) windows to protect database & server resources.
 */
@Module({
  imports: [
    // Global Configuration
    ConfigModule.forRoot({ isGlobal: true }),

    // Global Prisma singleton — shared across all modules
    PrismaModule,

    // Multi-Tier Rate Limiting (Burst, Standard, Sustained)
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 5 },       // 5 requests / sec (burst protection)
      { name: 'medium', ttl: 60000, limit: 60 },    // 60 requests / min (standard feeds, search)
      { name: 'long', ttl: 900000, limit: 300 },    // 300 requests / 15 min (sustained window)
    ]),

    // Feature modules
    AuthModule,
    FeedModule,
    ProfilesModule,
    MessagesModule,
    CoursesModule,
    NotificationsModule,
    PodcastsModule,
    StudyRoomsModule,
    CommunitiesModule,
    JobsModule,
    ConnectionsModule,
    UploadModule,
    RestModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
