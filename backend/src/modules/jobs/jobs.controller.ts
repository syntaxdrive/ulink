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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

/**
 * JobsController
 *
 * REST API routes for Jobs & Internships.
 */
@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Browse jobs & internships' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @Get()
  getJobs(
    @Query('type') type?: string,
    @Query('q') query?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.jobsService.getJobs(type, query, cursor);
  }

  @ApiOperation({ summary: 'Get details of a single job listing' })
  @Get(':id')
  getJobById(@Param('id') jobId: string) {
    return this.jobsService.getJobById(jobId);
  }

  @ApiOperation({ summary: 'Post a new job or internship listing' })
  @Post()
  createJob(@Request() req: any, @Body() dto: CreateJobDto) {
    return this.jobsService.createJob(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Delete a job listing' })
  @Delete(':id')
  deleteJob(@Request() req: any, @Param('id') jobId: string) {
    return this.jobsService.deleteJob(req.user.userId, jobId);
  }
}
