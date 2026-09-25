import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';

/**
 * CommunitiesModule
 *
 * Handles campus communities, sub-forums, and community posts.
 */
@Module({
  controllers: [CommunitiesController],
  providers: [CommunitiesService, PrismaService],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
