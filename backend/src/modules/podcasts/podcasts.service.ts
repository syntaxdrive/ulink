import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { CreateEpisodeDto } from './dto/create-episode.dto';

/**
 * PodcastsService
 *
 * Manages Podcast channels, episodes, and follower subscriptions:
 * - Listing & filtering podcasts with pagination
 * - Creating podcasts & episodes (creator only)
 * - Following & unfollowing podcasts
 * - Incrementing episode play counts
 */
@Injectable()
export class PodcastsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Browse all approved podcasts with optional category filtering.
   *
   * @param category - Filter by topic (e.g., "Tech", "Student Life")
   * @param cursor   - Pagination cursor ID
   * @param limit    - Number of items to return
   */
  async getPodcasts(category?: string, cursor?: string, limit = 20) {
    const podcasts = await this.prisma.podcast.findMany({
      where: {
        status: 'approved',
        ...(category ? { category } : {}),
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            is_verified: true,
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (podcasts.length > limit) {
      const nextItem = podcasts.pop();
      nextCursor = nextItem!.id;
    }

    return { podcasts, nextCursor };
  }

  /**
   * Get full details of a single podcast including latest episodes.
   *
   * @param podcastId - Target podcast ID
   * @param userId    - Current user ID (to check if user follows)
   */
  async getPodcastById(podcastId: string, userId?: string) {
    const podcast = await this.prisma.podcast.findUnique({
      where: { id: podcastId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            is_verified: true,
          },
        },
        episodes: {
          where: { is_published: true },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!podcast) {
      throw new NotFoundException('Podcast not found');
    }

    let isFollowing = false;
    if (userId) {
      const follow = await this.prisma.podcastFollow.findUnique({
        where: {
          podcast_id_user_id: {
            podcast_id: podcastId,
            user_id: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return { ...podcast, is_following: isFollowing };
  }

  /**
   * Create a new Podcast channel.
   *
   * @param userId - Creator user ID
   * @param dto    - Channel parameters
   */
  async createPodcast(userId: string, dto: CreatePodcastDto) {
    return this.prisma.podcast.create({
      data: {
        creator_id: userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        cover_url: dto.coverUrl ?? null,
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
    });
  }

  /**
   * Toggle follow/unfollow status for a podcast channel.
   *
   * @param userId    - Authenticated subscriber user ID
   * @param podcastId - Targeted podcast channel ID
   */
  async toggleFollow(userId: string, podcastId: string) {
    const existing = await this.prisma.podcastFollow.findUnique({
      where: {
        podcast_id_user_id: {
          podcast_id: podcastId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.podcastFollow.delete({
          where: {
            podcast_id_user_id: {
              podcast_id: podcastId,
              user_id: userId,
            },
          },
        }),
        this.prisma.podcast.update({
          where: { id: podcastId },
          data: { followers_count: { decrement: 1 } },
        }),
      ]);
      return { following: false };
    }

    await this.prisma.$transaction([
      this.prisma.podcastFollow.create({
        data: {
          podcast_id: podcastId,
          user_id: userId,
        },
      }),
      this.prisma.podcast.update({
        where: { id: podcastId },
        data: { followers_count: { increment: 1 } },
      }),
    ]);
    return { following: true };
  }

  /**
   * Fetch paginated episodes for a specific podcast.
   *
   * @param podcastId - Targeted podcast channel ID
   * @param cursor    - Pagination cursor ID
   * @param limit     - Number of episodes to return
   */
  async getEpisodes(podcastId: string, cursor?: string, limit = 20) {
    const episodes = await this.prisma.podcastEpisode.findMany({
      where: {
        podcast_id: podcastId,
        is_published: true,
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { created_at: 'desc' },
    });

    let nextCursor: string | undefined;
    if (episodes.length > limit) {
      const nextItem = episodes.pop();
      nextCursor = nextItem!.id;
    }

    return { episodes, nextCursor };
  }

  /**
   * Add a new episode to a podcast (creator only).
   *
   * @param userId    - Creator user ID
   * @param podcastId - Podcast channel ID
   * @param dto       - Episode details
   */
  async createEpisode(userId: string, podcastId: string, dto: CreateEpisodeDto) {
    const podcast = await this.prisma.podcast.findUnique({
      where: { id: podcastId },
    });

    if (!podcast) {
      throw new NotFoundException('Podcast not found');
    }

    if (podcast.creator_id !== userId) {
      throw new ForbiddenException('Only the podcast creator can publish episodes');
    }

    return this.prisma.$transaction(async (tx) => {
      const episode = await tx.podcastEpisode.create({
        data: {
          podcast_id: podcastId,
          title: dto.title,
          description: dto.description ?? null,
          audio_url: dto.audioUrl,
          cover_url: dto.coverUrl ?? null,
          duration_seconds: dto.durationSeconds ?? 0,
          episode_number: dto.episodeNumber ?? null,
        },
      });

      await tx.podcast.update({
        where: { id: podcastId },
        data: { episodes_count: { increment: 1 } },
      });

      return episode;
    });
  }

  /**
   * Increment the play count when a user listens to an episode.
   *
   * @param episodeId - Episode ID
   */
  async incrementPlays(episodeId: string) {
    return this.prisma.podcastEpisode.update({
      where: { id: episodeId },
      data: { plays_count: { increment: 1 } },
    });
  }
}
