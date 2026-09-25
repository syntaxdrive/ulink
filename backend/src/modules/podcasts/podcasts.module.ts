import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PodcastsService } from './podcasts.service';
import { PodcastsController } from './podcasts.controller';

/**
 * PodcastsModule
 *
 * Encapsulates Podcast channels, episode playback tracking, and subscriptions.
 */
@Module({
  controllers: [PodcastsController],
  providers: [PodcastsService, PrismaService],
  exports: [PodcastsService],
})
export class PodcastsModule {}
