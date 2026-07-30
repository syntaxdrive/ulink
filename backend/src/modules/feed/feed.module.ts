import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [FeedController],
  providers: [FeedService, PrismaService],
  exports: [FeedService],
})
export class FeedModule {}
