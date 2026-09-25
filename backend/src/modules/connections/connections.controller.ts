import {
  Controller, Get, Post, Delete, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConnectionsService } from './connections.service';

@ApiTags('Connections')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @ApiOperation({ summary: 'List my accepted connections' })
  @Get()
  getConnections(@Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.connectionsService.getConnections(userId);
  }

  @ApiOperation({ summary: 'Pending requests I received' })
  @Get('pending/received')
  getPendingReceived(@Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.connectionsService.getPendingReceived(userId);
  }

  @ApiOperation({ summary: 'Pending requests I sent' })
  @Get('pending/sent')
  getPendingSent(@Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.connectionsService.getPendingSent(userId);
  }

  @ApiOperation({ summary: 'Suggested people to connect with' })
  @Get('suggestions')
  getSuggestions(@Request() req: any, @Query('limit') limit?: number) {
    const userId = req.user?.id || req.user?.userId;
    return this.connectionsService.getSuggestions(userId, limit ? +limit : 20);
  }

  @ApiOperation({ summary: 'Get connection status with a specific user' })
  @Get('status/:userId')
  getStatus(@Request() req: any, @Param('userId') otherUserId: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.connectionsService.getStatus(userId, otherUserId);
  }

  @ApiOperation({ summary: 'Send a connection request' })
  @Post('request/:userId')
  @HttpCode(HttpStatus.OK)
  sendRequest(@Request() req: any, @Param('userId') recipientId: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.connectionsService.sendRequest(userId, recipientId);
  }

  @ApiOperation({ summary: 'Accept a connection request' })
  @Post('accept/:userId')
  @HttpCode(HttpStatus.OK)
  acceptRequest(@Request() req: any, @Param('userId') requesterId: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.connectionsService.acceptRequest(userId, requesterId);
  }

  @ApiOperation({ summary: 'Decline, cancel, or remove a connection' })
  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  removeConnection(@Request() req: any, @Param('userId') otherUserId: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.connectionsService.removeConnection(userId, otherUserId);
  }
}
