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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';

/**
 * CommunitiesController
 *
 * REST API endpoints for Communities & Memberships.
 */
@ApiTags('Communities')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @ApiOperation({ summary: 'Browse all communities' })
  @Get()
  getCommunities(@Query('cursor') cursor?: string) {
    return this.communitiesService.getCommunities(cursor);
  }

  @ApiOperation({ summary: 'Get community by slug' })
  @Get(':slug')
  getCommunityBySlug(@Request() req: any, @Param('slug') slug: string) {
    return this.communitiesService.getCommunityBySlug(slug, req.user.userId);
  }

  @ApiOperation({ summary: 'Create a new community' })
  @Post()
  createCommunity(@Request() req: any, @Body() dto: CreateCommunityDto) {
    return this.communitiesService.createCommunity(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Join a community' })
  @Post(':id/join')
  joinCommunity(@Request() req: any, @Param('id') communityId: string) {
    return this.communitiesService.joinCommunity(req.user.userId, communityId);
  }

  @ApiOperation({ summary: 'Leave a community' })
  @Delete(':id/leave')
  leaveCommunity(@Request() req: any, @Param('id') communityId: string) {
    return this.communitiesService.leaveCommunity(req.user.userId, communityId);
  }

  @ApiOperation({ summary: 'Get community post feed' })
  @Get(':id/posts')
  getCommunityPosts(
    @Param('id') communityId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.communitiesService.getCommunityPosts(communityId, cursor);
  }
}
