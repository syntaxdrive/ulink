import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * AuthService
 *
 * Handles authentication, password verification with bcrypt,
 * JWT token generation, and account registration.
 */
@Injectable()
export class AuthService {
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

    // Search user by email (case-insensitive trim)
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Verify password hash exists and matches
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

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Generate unique username
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

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user in database
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
