import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string, currentUserId?: string) {
    if (userId === 'me' && currentUserId) {
        userId = currentUserId;
    }

    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        headline: true,
        about: true,
        university: true,
        avatar_url: true,
        background_image_url: true,
        followers_count: true,
        following_count: true,
        created_at: true,
      }
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    let is_following = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: currentUserId,
            following_id: userId,
          }
        }
      });
      is_following = !!follow;
    }

    return { ...profile, is_following };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.headline !== undefined) updateData.headline = dto.headline;
    if (dto.about !== undefined) updateData.about = dto.about;
    if (dto.university !== undefined) updateData.university = dto.university;
    if (dto.avatarUrl !== undefined) updateData.avatar_url = dto.avatarUrl;
    if (dto.backgroundImageUrl !== undefined) updateData.background_image_url = dto.backgroundImageUrl;

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        headline: true,
        about: true,
        university: true,
        avatar_url: true,
        background_image_url: true,
      }
    });
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        }
      }
    });

    if (existingFollow) {
      return { success: true };
    }

    await this.prisma.$transaction([
      this.prisma.follow.create({
        data: {
          follower_id: followerId,
          following_id: followingId,
        }
      }),
      this.prisma.user.update({
        where: { id: followerId },
        data: { following_count: { increment: 1 } }
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followers_count: { increment: 1 } }
      })
    ]);

    return { success: true };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        }
      }
    });

    if (!existingFollow) {
      return { success: true };
    }

    await this.prisma.$transaction([
      this.prisma.follow.delete({
        where: { id: existingFollow.id }
      }),
      this.prisma.user.update({
        where: { id: followerId },
        data: { following_count: { decrement: 1 } }
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followers_count: { decrement: 1 } }
      })
    ]);

    return { success: true };
  }

  async searchUsers(query: string, limit = 20) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar_url: true,
        headline: true,
        university: true,
      },
      take: limit,
    });
  }

  async getUserPosts(userId: string, cursor?: string, limit = 20) {
    const posts = await this.prisma.post.findMany({
      where: { author_id: userId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            is_verified: true,
            university: true,
          }
        },
        likes: {
          where: { user_id: userId },
          take: 1
        }
      }
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    const mappedPosts = posts.map(post => {
      const { likes, ...rest } = post;
      return { ...rest, user_has_liked: likes.length > 0 };
    });

    return { posts: mappedPosts, nextCursor };
  }
}
