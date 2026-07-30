import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { FeedModule } from './modules/feed/feed.module';
import { ProfilesModule } from './modules/profiles/profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
    AuthModule,
    FeedModule,
    ProfilesModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
