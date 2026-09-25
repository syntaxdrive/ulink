import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCommunityDto } from './dto/create-community.dto';

/**
 * CommunitiesService
 *
 * Manages campus and subject communities, memberships, and posts:
 * - Listing communities with membership status
 * - Creating communities (creator becomes owner)
 * - Joining / leaving communities
 * - Fetching community feed
 */
@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all public communities with pagination.
   */
  async getCommunities(cursor?: string, limit = 20) {
    const communities = await this.prisma.community.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { members_count: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
    });

    let nextCursor: string | undefined;
    if (communities.length > limit) {
      const nextItem = communities.pop();
      nextCursor = nextItem!.id;
    }

    return { communities, nextCursor };
  }

  /**
   * Get single community by slug or ID with creator info.
   */
  async getCommunityBySlug(slug: string, userId?: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    let isMember = false;
    let role: string | null = null;

    if (userId) {
      const membership = await this.prisma.communityMember.findUnique({
        where: {
          community_id_user_id: {
            community_id: community.id,
            user_id: userId,
          },
        },
      });

      if (membership) {
        isMember = true;
        role = membership.role;
      }
    }

    return { ...community, is_member: isMember, user_role: role };
  }

  /**
   * Create a new community and assign creator as 'owner'.
   */
  async createCommunity(userId: string, dto: CreateCommunityDto) {
    const existing = await this.prisma.community.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Community slug already taken');
    }

    return this.prisma.$transaction(async (tx) => {
      const community = await tx.community.create({
        data: {
          created_by: userId,
          name: dto.name,
          slug: dto.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
          description: dto.description ?? null,
          icon_url: dto.iconUrl ?? null,
          cover_image_url: dto.coverImageUrl ?? null,
          privacy: dto.privacy ?? 'public',
          members_count: 1,
        },
      });

      await tx.communityMember.create({
        data: {
          community_id: community.id,
          user_id: userId,
          role: 'owner',
        },
      });

      return community;
    });
  }

  /**
   * Join a community as a member.
   */
  async joinCommunity(userId: string, communityId: string) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const existing = await this.prisma.communityMember.findUnique({
      where: {
        community_id_user_id: {
          community_id: communityId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      return { success: true, is_member: true };
    }

    await this.prisma.$transaction([
      this.prisma.communityMember.create({
        data: {
          community_id: communityId,
          user_id: userId,
          role: 'member',
        },
      }),
      this.prisma.community.update({
        where: { id: communityId },
        data: { members_count: { increment: 1 } },
      }),
    ]);

    return { success: true, is_member: true };
  }

  /**
   * Leave a community.
   */
  async leaveCommunity(userId: string, communityId: string) {
    const membership = await this.prisma.communityMember.findUnique({
      where: {
        community_id_user_id: {
          community_id: communityId,
          user_id: userId,
        },
      },
    });

    if (!membership) {
      return { success: true, is_member: false };
    }

    await this.prisma.$transaction([
      this.prisma.communityMember.delete({
        where: {
          community_id_user_id: {
            community_id: communityId,
            user_id: userId,
          },
        },
      }),
      this.prisma.community.update({
        where: { id: communityId },
        data: { members_count: { decrement: 1 } },
      }),
    ]);

    return { success: true, is_member: false };
  }

  /**
   * Get posts inside a community.
   */
  async getCommunityPosts(communityId: string, cursor?: string, limit = 20) {
    const posts = await this.prisma.post.findMany({
      where: { community_id: communityId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar_url: true, is_verified: true },
        },
      },
    });

    let nextCursor: string | undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    return { posts, nextCursor };
  }
}
