import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

/**
 * JobsService
 *
 * Handles student jobs & internships board:
 * - Listing active job postings with search/filtering
 * - Posting new jobs
 * - Deleting jobs (creator or admin only)
 */
@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search and filter active job postings with pagination.
   */
  async getJobs(type?: string, query?: string, cursor?: string, limit = 20) {
    const jobs = await this.prisma.job.findMany({
      where: {
        status: 'active',
        ...(type ? { type } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { company: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
    });

    let nextCursor: string | undefined;
    if (jobs.length > limit) {
      const nextItem = jobs.pop();
      nextCursor = nextItem!.id;
    }

    return { jobs, nextCursor };
  }

  /**
   * Get single job by ID.
   */
  async getJobById(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job posting not found');
    }

    return job;
  }

  /**
   * Create a new job posting.
   */
  async createJob(userId: string, dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        creator_id: userId,
        title: dto.title,
        company: dto.company,
        type: dto.type ?? 'Internship',
        description: dto.description ?? null,
        application_link: dto.applicationLink ?? null,
        location: dto.location ?? null,
        salary_range: dto.salaryRange ?? null,
        logo_url: dto.logoUrl ?? null,
        status: 'active',
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
    });
  }

  /**
   * Delete a job posting (creator only).
   */
  async deleteJob(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job posting not found');
    }

    if (job.creator_id !== userId) {
      throw new ForbiddenException('Only the job poster can delete this listing');
    }

    return this.prisma.job.delete({
      where: { id: jobId },
    });
  }
}
