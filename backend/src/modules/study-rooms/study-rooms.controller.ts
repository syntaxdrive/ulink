import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StudyRoomsService } from './study-rooms.service';
import { CreateStudyRoomDto } from './dto/create-study-room.dto';

/**
 * StudyRoomsController
 *
 * REST API endpoints for Study Rooms.
 */
@ApiTags('Study Rooms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('study-rooms')
export class StudyRoomsController {
  constructor(private readonly studyRoomsService: StudyRoomsService) {}

  @ApiOperation({ summary: 'Get list of active public study rooms' })
  @Get()
  getActiveRooms(@Query('cursor') cursor?: string) {
    return this.studyRoomsService.getActiveRooms(cursor);
  }

  @ApiOperation({ summary: 'Get details and participants of a study room' })
  @Get(':id')
  getRoomById(@Param('id') roomId: string) {
    return this.studyRoomsService.getRoomById(roomId);
  }

  @ApiOperation({ summary: 'Create a new study room' })
  @Post()
  createRoom(@Request() req: any, @Body() dto: CreateStudyRoomDto) {
    return this.studyRoomsService.createRoom(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Join a study room' })
  @Post(':id/join')
  joinRoom(@Request() req: any, @Param('id') roomId: string) {
    return this.studyRoomsService.joinRoom(req.user.userId, roomId);
  }

  @ApiOperation({ summary: 'Leave a study room' })
  @Delete(':id/leave')
  leaveRoom(@Request() req: any, @Param('id') roomId: string) {
    return this.studyRoomsService.leaveRoom(req.user.userId, roomId);
  }

  @ApiOperation({ summary: 'Update status in room (e.g. Focusing, Break)' })
  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') roomId: string,
    @Body('status') status: string,
  ) {
    return this.studyRoomsService.updateStatus(req.user.userId, roomId, status);
  }

  @ApiOperation({ summary: 'Close a study room (host only)' })
  @Patch(':id/close')
  closeRoom(@Request() req: any, @Param('id') roomId: string) {
    return this.studyRoomsService.closeRoom(req.user.userId, roomId);
  }
}
