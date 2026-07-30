import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

/**
 * CoursesController
 *
 * REST endpoints for the UniLink course library and document system.
 */
@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * GET /api/v1/courses
   * Browse all courses. Optionally filter by category.
   */
  @ApiOperation({ summary: 'Browse courses with optional category filter' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @Get()
  getCourses(
    @Query('category') category?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.coursesService.getCourses(category, cursor);
  }

  /**
   * GET /api/v1/courses/library
   * Get the authenticated user's saved course library (liked courses).
   */
  @ApiOperation({ summary: "Get the current user's saved course library" })
  @Get('library')
  getUserLibrary(@Request() req: any) {
    return this.coursesService.getUserLibrary(req.user.userId);
  }

  /**
   * GET /api/v1/courses/:id
   * Get full details for a single course.
   */
  @ApiOperation({ summary: 'Get a single course by ID' })
  @Get(':id')
  getCourseById(@Param('id') courseId: string) {
    return this.coursesService.getCourseById(courseId);
  }

  /**
   * GET /api/v1/courses/:id/documents
   * Get all documents attached to a course.
   */
  @ApiOperation({ summary: 'List documents for a course' })
  @Get(':id/documents')
  getCourseDocuments(@Param('id') courseId: string) {
    return this.coursesService.getCourseDocuments(courseId);
  }

  /**
   * POST /api/v1/courses
   * Create a new course.
   */
  @ApiOperation({ summary: 'Create a new course' })
  @Post()
  createCourse(@Request() req: any, @Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(req.user.userId, dto);
  }

  /**
   * POST /api/v1/courses/:id/like
   * Toggle a like (save/unsave) on a course.
   */
  @ApiOperation({ summary: 'Toggle like (save/unsave) a course' })
  @Post(':id/like')
  toggleLike(@Request() req: any, @Param('id') courseId: string) {
    return this.coursesService.toggleLike(req.user.userId, courseId);
  }

  /**
   * PATCH /api/v1/courses/documents/:documentId/download
   * Record a document download event.
   */
  @ApiOperation({ summary: 'Record a document download' })
  @Patch('documents/:documentId/download')
  recordDownload(
    @Request() req: any,
    @Param('documentId') documentId: string,
  ) {
    return this.coursesService.recordDownload(req.user.userId, documentId);
  }

  /**
   * DELETE /api/v1/courses/:id
   * Delete a course (author only).
   */
  @ApiOperation({ summary: 'Delete a course (author only)' })
  @Delete(':id')
  deleteCourse(@Request() req: any, @Param('id') courseId: string) {
    return this.coursesService.deleteCourse(req.user.userId, courseId);
  }
}
