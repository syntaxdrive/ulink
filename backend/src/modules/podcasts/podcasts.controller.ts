import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PodcastsService } from './podcasts.service';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { CreateEpisodeDto } from './dto/create-episode.dto';

/**
 * PodcastsController
 *
 * REST API routes for Podcasts & Episodes.
 */
@ApiTags('Podcasts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('podcasts')
export class PodcastsController {
  constructor(private readonly podcastsService: PodcastsService) {}

  @ApiOperation({ summary: 'Browse podcasts with optional category filter' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @Get()
  getPodcasts(
    @Query('category') category?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.podcastsService.getPodcasts(category, cursor);
  }

  @ApiOperation({ summary: 'Get details of a single podcast' })
  @Get(':id')
  getPodcastById(@Request() req: any, @Param('id') podcastId: string) {
    return this.podcastsService.getPodcastById(podcastId, req.user.userId);
  }

  @ApiOperation({ summary: 'Create a new Podcast channel' })
  @Post()
  createPodcast(@Request() req: any, @Body() dto: CreatePodcastDto) {
    return this.podcastsService.createPodcast(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Follow or unfollow a podcast channel' })
  @Post(':id/follow')
  toggleFollow(@Request() req: any, @Param('id') podcastId: string) {
    return this.podcastsService.toggleFollow(req.user.userId, podcastId);
  }

  @ApiOperation({ summary: 'Get episodes of a podcast channel' })
  @Get(':id/episodes')
  getEpisodes(
    @Param('id') podcastId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.podcastsService.getEpisodes(podcastId, cursor);
  }

  @ApiOperation({ summary: 'Create a new episode for a podcast (creator only)' })
  @Post(':id/episodes')
  createEpisode(
    @Request() req: any,
    @Param('id') podcastId: string,
    @Body() dto: CreateEpisodeDto,
  ) {
    return this.podcastsService.createEpisode(req.user.userId, podcastId, dto);
  }

  @ApiOperation({ summary: 'Record episode play event' })
  @Patch('episodes/:episodeId/play')
  incrementPlays(@Param('episodeId') episodeId: string) {
    return this.podcastsService.incrementPlays(episodeId);
  }
}
