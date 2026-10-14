import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('search')
  searchUsers(
    @Query('q') q: string,
    @Query('limit') limit?: number,
  ) {
    const parsedLimit = limit ? parseInt(limit as any, 10) : 20;
    return this.profilesService.searchUsers(q || '', parsedLimit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.user.id, dto);
  }

  @Get(':id')
  getProfile(@Request() req: any, @Param('id') id: string) {
    const currentUserId = req?.user?.id;
    return this.profilesService.getProfile(id, currentUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/follow')
  @HttpCode(HttpStatus.OK)
  followUser(@Request() req: any, @Param('id') id: string) {
    return this.profilesService.followUser(req.user.id, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/follow')
  @HttpCode(HttpStatus.OK)
  unfollowUser(@Request() req: any, @Param('id') id: string) {
    return this.profilesService.unfollowUser(req.user.id, id);
  }

  @Get(':id/posts')
  getUserPosts(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const parsedLimit = limit ? parseInt(limit as any, 10) : 20;
    return this.profilesService.getUserPosts(id, cursor, parsedLimit);
  }
}
