import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Request,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

/**
 * AuthController
 *
 * REST API routes for authentication:
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/register
 * - GET  /api/v1/auth/me
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Log in with email and password' })
  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Register a new account' })
  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @ApiOperation({ summary: 'Authenticate or register using Google OAuth ID Token' })
  @Post('google')
  async googleAuth(@Body('idToken') idToken: string) {
    return this.authService.googleLogin(idToken);
  }

  @ApiOperation({ summary: 'Authenticate or register using Google User Profile' })
  @Post('google-profile')
  async googleProfileAuth(@Body() profile: { email: string; name?: string; avatarUrl?: string }) {
    return this.authService.googleProfileLogin(profile);
  }

  @ApiOperation({ summary: 'Get profile of current authenticated user' })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
