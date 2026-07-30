import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { FeedModule } from './modules/feed/feed.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CoursesModule } from './modules/courses/courses.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PodcastsModule } from './modules/podcasts/podcasts.module';
import { StudyRoomsModule } from './modules/study-rooms/study-rooms.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { JobsModule } from './modules/jobs/jobs.module';

/**
 * AppModule — Root module of the UniLink API.
 *
 * All feature modules are registered here.
 * ThrottlerModule limits requests to 100 per 60 seconds per IP (rate limiting).
 * ConfigModule is global so process.env variables are available everywhere.
 */
@Module({
  imports: [
    // Infrastructure
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),

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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
