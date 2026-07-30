import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';

/**
 * CoursesModule
 *
 * Provides the course library, document management, and
 * user library (liked/saved courses) functionality.
 */
@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaService],
  exports: [CoursesService],
})
export class CoursesModule {}
