import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

/**
 * CoursesService
 *
 * Handles all business logic for the Courses & Learning module:
 * - Browsing and filtering the course library
 * - Creating and managing courses (author only)
 * - Liking courses
 * - Fetching and tracking document downloads
 *
 * The "My Library" section shows courses a user has liked (bookmarked),
 * not enrolled courses — this matches the web app's existing behavior.
 */
@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Browse all courses with optional category filter.
   * Results are paginated using cursor-based pagination.
   *
   * @param category - Optional category filter (e.g. "Engineering", "Medicine")
   * @param cursor   - Course ID to paginate from
   * @param limit    - Results per page (default 20)
   */
  async getCourses(category?: string, cursor?: string, limit = 20) {
    const courses = await this.prisma.course.findMany({
      // Only apply the category filter if one was provided
      where: category ? { category } : {},
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            is_verified: true,
          },
        },
        // Eager-load document count to avoid N+1 queries
        documents: {
          select: { id: true, name: true, file_type: true, file_size: true },
        },
      },
    });

    let nextCursor: string | undefined;
    if (courses.length > limit) {
      const nextItem = courses.pop();
      nextCursor = nextItem!.id;
    }

    return { courses, nextCursor };
  }

  /**
   * Get a single course by ID, including full author and document details.
   *
   * @param courseId - The ID of the course to retrieve
   */
  async getCourseById(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            is_verified: true,
            headline: true,
          },
        },
        documents: true,
      },
    });

    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  /**
   * Create a new course authored by the current user.
   *
   * @param userId - The authenticated user creating the course
   * @param dto    - Course data from the request body
   */
  async createCourse(userId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        author_id: userId,
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category,
        level: dto.level ?? 'All Levels',
        youtube_url: dto.youtubeUrl ?? null,
        thumbnail_url: dto.thumbnailUrl ?? null,
        tags: dto.tags ?? [],
        content_type: dto.contentType ?? 'video',
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
    });
  }

  /**
   * Delete a course. Only the author may delete their own course.
   *
   * @param userId   - The authenticated user requesting deletion
   * @param courseId - The ID of the course to delete
   */
  async deleteCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (course.author_id !== userId) {
      throw new ForbiddenException('Only the course author can delete it');
    }

    return this.prisma.course.delete({ where: { id: courseId } });
  }

  /**
   * Toggle a like on a course (bookmark/save to library).
   * If already liked → unlike. If not liked → like.
   * Also increments/decrements the likes_count counter on the course.
   *
   * @param userId   - The authenticated user toggling the like
   * @param courseId - The course being liked/unliked
   */
  async toggleLike(userId: string, courseId: string) {
    // Check if the user has already liked this course
    const existingLike = await this.prisma.courseLike.findUnique({
      where: { course_id_user_id: { course_id: courseId, user_id: userId } },
    });

    if (existingLike) {
      // Unlike: remove the record and decrement the counter atomically
      await this.prisma.$transaction([
        this.prisma.courseLike.delete({
          where: { course_id_user_id: { course_id: courseId, user_id: userId } },
        }),
        this.prisma.course.update({
          where: { id: courseId },
          data: { likes_count: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    }

    // Like: create the record and increment the counter atomically
    await this.prisma.$transaction([
      this.prisma.courseLike.create({
        data: { course_id: courseId, user_id: userId },
      }),
      this.prisma.course.update({
        where: { id: courseId },
        data: { likes_count: { increment: 1 } },
      }),
    ]);
    return { liked: true };
  }

  /**
   * Get courses liked (saved) by a specific user — their personal library.
   *
   * @param userId - The user whose library to fetch
   * @param limit  - Maximum results to return (default 20 for Supabase cost control)
   */
  async getUserLibrary(userId: string, limit = 20) {
    const liked = await this.prisma.courseLike.findMany({
      where: { user_id: userId },
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        course: {
          include: {
            author: {
              select: { id: true, name: true, username: true, avatar_url: true },
            },
          },
        },
      },
    });

    return liked.map((item: { course: any }) => item.course);
  }

  /**
   * Get all documents attached to a specific course.
   * Used to populate the documents tab in the course detail view.
   *
   * @param courseId - The course whose documents to list
   */
  async getCourseDocuments(courseId: string) {
    return this.prisma.courseDocument.findMany({
      where: { course_id: courseId },
      orderBy: { created_at: 'asc' },
      include: {
        uploader: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  /**
   * Record a document download event and increment the download counter.
   *
   * @param userId     - The user downloading the document
   * @param documentId - The document being downloaded
   */
  async recordDownload(userId: string, documentId: string) {
    // Upsert prevents counting duplicate downloads from the same user
    await this.prisma.userDocumentDownload.upsert({
      where: { user_id_document_id: { user_id: userId, document_id: documentId } },
      update: {}, // No-op if this user already downloaded the same doc
      create: { user_id: userId, document_id: documentId },
    });

    // Increment the download counter on the document
    return this.prisma.courseDocument.update({
      where: { id: documentId },
      data: { downloads_count: { increment: 1 } },
    });
  }
}
