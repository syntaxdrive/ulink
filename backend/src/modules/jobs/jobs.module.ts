import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

/**
 * JobsModule
 *
 * Job board module for student internships, entry-level roles, and campus opportunities.
 */
@Module({
  controllers: [JobsController],
  providers: [JobsService, PrismaService],
  exports: [JobsService],
})
export class JobsModule {}
