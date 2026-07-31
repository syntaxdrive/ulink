import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

/**
 * AuthService
 *
 * Handles authentication, password verification with bcrypt,
 * Google OAuth 2.0 ID Token verification, JWT token generation, and account registration.
 */
@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate a user's email and password during login.
   * Performs safe bcrypt comparison and strips sensitive fields.
   *
   * @param email - User's email address
   * @param pass  - Plain text password provided by the user
   */
  async validateUser(email: string, pass: string): Promise<any> {
    if (!email || !pass) return null;

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && typeof user.password_hash === 'string') {
      const isPasswordValid = await bcrypt.compare(pass, user.password_hash);
      if (isPasswordValid) {
        const { password_hash, ...result } = user;
        return result;
      }
    }

    return null;
  }

  /**
   * Authenticate or register a user using a Google OAuth ID Token.
   * Verifies the cryptographic token signature with Google's public keys.
   * Matches existing migrated users by email address.
   *
   * @param idToken - Google OAuth ID Token passed from client (Mobile or Web)
   */
  async googleLogin(idToken: string) {
    if (!idToken) {
      throw new BadRequestException('Google idToken is required');
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        ...(process.env.GOOGLE_CLIENT_ID ? { audience: process.env.GOOGLE_CLIENT_ID } : {}),
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid or expired Google ID token');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Google token missing email payload');
    }

    const normalizedEmail = payload.email.trim().toLowerCase();

    // 1. Search for existing user profile by email
    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Update avatar if not set yet
      if (!user.avatar_url && payload.picture) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { avatar_url: payload.picture },
        });
      }
    } else {
      // 2. Create new user account if first-time Google sign-in
      let baseUsername = (payload.email.split('@')[0] || 'student')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');

      if (!baseUsername) baseUsername = 'student';

      let finalUsername = baseUsername;
      let counter = 1;
      while (await this.prisma.user.findUnique({ where: { username: finalUsername } })) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name: payload.name ?? null,
          username: finalUsername,
          avatar_url: payload.picture ?? null,
          is_verified: payload.email_verified ?? false,
          role: 'Student',
        },
      });
    }

    return this.login(user);
  }

  /**
   * Generate a JWT access token for an authenticated user.
   *
   * @param user - Authenticated user object
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
        role: user.role,
      },
    };
  }

  /**
   * Register a new student account.
   *
   * @param data - Registration data ({ email, password, name, username })
   */
  async register(data: { email: string; password?: string; name?: string; username?: string }) {
    if (!data.email || !data.password) {
      throw new BadRequestException('Email and password are required');
    }

    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    let baseUsername = (data.username || normalizedEmail.split('@')[0] || 'student')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    if (!baseUsername) baseUsername = 'student';

    let finalUsername = baseUsername;
    let counter = 1;
    while (await this.prisma.user.findUnique({ where: { username: finalUsername } })) {
      finalUsername = `${baseUsername}${counter}`;
      counter++;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        password_hash: hashedPassword,
        name: data.name ?? null,
        username: finalUsername,
        role: 'Student',
      },
    });

    const { password_hash, ...result } = user;
    return this.login(result);
  }
}
