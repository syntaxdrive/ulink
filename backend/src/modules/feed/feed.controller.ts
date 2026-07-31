import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeedService } from './feed.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('feed')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('feed')
  getFeed(
    @Request() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.id || req.user?.userId;
    const parsedLimit = limit ? parseInt(limit as any, 10) : 20;
    return this.feedService.getFeed(userId, cursor, parsedLimit);
  }

  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    const userId = req.user?.id || req.user?.userId;
    return this.feedService.createPost(userId, dto);
  }

  @Post('posts/:id/like')
  @HttpCode(HttpStatus.OK)
  likePost(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.feedService.likePost(userId, id);
  }

  @Get('posts/:id/comments')
  getPostComments(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const parsedLimit = limit ? parseInt(limit as any, 10) : 20;
    return this.feedService.getPostComments(id, cursor, parsedLimit);
  }

  @Post('posts/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  addComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.feedService.addComment(userId, id, content);
  }

  @Get('feed/podcasts')
  getPodcastStories() {
    return this.feedService.getPodcastStories();
  }

  @Post('posts/:id/repost')
  @HttpCode(HttpStatus.CREATED)
  repostPost(
    @Request() req: any,
    @Param('id') id: string,
    @Body('comment') comment?: string,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.feedService.repostPost(userId, id, comment);
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.feedService.deletePost(userId, id);
  }
}
