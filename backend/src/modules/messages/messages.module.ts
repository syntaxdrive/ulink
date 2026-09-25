import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ChatGateway } from './chat.gateway';

/**
 * MessagesModule
 *
 * Bundles together:
 * - MessagesController  → REST endpoints (load history, inbox, delete)
 * - MessagesService     → Business logic & Prisma queries
 * - ChatGateway         → Socket.io WebSocket real-time delivery
 *
 * JwtModule is imported here so the ChatGateway can validate
 * tokens from the WebSocket handshake query string.
 */
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'unilink-secret-change-in-production',
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, ChatGateway, PrismaService],
  exports: [MessagesService],
})
export class MessagesModule {}
